import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Competency, SubCompetency, SceneData, CompetencyTrack, createDefaultScene, createDefaultTrack } from './types';
import { Lock, Plus, Layers, ChevronRight, Trash2, AlertTriangle } from 'lucide-react';
import { CompetencyAISearch } from './CompetencyAISearch';

// Data Integrity validation - flags missing required DNA fields
interface DataIntegrityError {
  subCompetencyId: string;
  statement: string;
  missingFields: ('action_cue' | 'game_mechanic')[];
}

function validateSubCompetencyData(sub: SubCompetency): DataIntegrityError | null {
  const missingFields: ('action_cue' | 'game_mechanic')[] = [];
  
  if (!sub.action_cue || sub.action_cue.trim() === '') {
    missingFields.push('action_cue');
  }
  if (!sub.game_mechanic || sub.game_mechanic.trim() === '') {
    missingFields.push('game_mechanic');
  }
  
  if (missingFields.length > 0) {
    return {
      subCompetencyId: sub.id,
      statement: sub.statement,
      missingFields,
    };
  }
  return null;
}

interface TemplateStepFrameworkProps {
  competencies: Competency[];
  subCompetencies: SubCompetency[];
  selectedCompetency: string;
  setSelectedCompetency: (id: string) => void;
  selectedSubCompetencies: string[];
  setSelectedSubCompetencies: (ids: string[]) => void;
  scenes: SceneData[];
  setScenes: (scenes: SceneData[]) => void;
  onHighlightCompetency?: (competency: Competency | null) => void;
  // Multi-track curriculum props
  tracks?: CompetencyTrack[];
  setTracks?: (tracks: CompetencyTrack[]) => void;
  onAddTrack?: () => void;
}

export function TemplateStepFramework({
  competencies,
  subCompetencies,
  selectedCompetency,
  setSelectedCompetency,
  selectedSubCompetencies,
  setSelectedSubCompetencies,
  scenes,
  setScenes,
  onHighlightCompetency,
  tracks = [],
  setTracks,
  onAddTrack,
}: TemplateStepFrameworkProps) {
  const [showAddTrackSearch, setShowAddTrackSearch] = useState(false);
  const [newTrackCompetency, setNewTrackCompetency] = useState('');

  // Check for data integrity errors in sub-competencies
  const dataIntegrityErrors: DataIntegrityError[] = subCompetencies
    .filter(sub => sub.competency_id === selectedCompetency)
    .map(validateSubCompetencyData)
    .filter((error): error is DataIntegrityError => error !== null);

  const handleSubCompetencyToggle = (subId: string, checked: boolean, trackId?: string) => {
    const sub = subCompetencies.find(s => s.id === subId);
    
    // DATA INTEGRITY CHECK: Block selection if missing required fields
    if (checked && sub) {
      const error = validateSubCompetencyData(sub);
      if (error) {
        toast.error(
          `Data Integrity Error: "${sub.statement}" is missing ${error.missingFields.join(' and ')}. Cannot create scene.`,
          { duration: 5000 }
        );
        return;
      }
    }
    
    if (checked) {
      if (selectedSubCompetencies.length < (tracks.length > 0 ? tracks.length * 6 : 6)) {
        const newSubs = [...selectedSubCompetencies, subId];
        setSelectedSubCompetencies(newSubs);
        
        // Create a new scene for this sub-competency with DB data
        if (sub) {
          const activeTrack = trackId || (tracks.length > 0 ? tracks[tracks.length - 1]?.id : undefined);
          const newScene = createDefaultScene(subId, newSubs.length, activeTrack);
          
          // AUTO-POPULATE from Master DNA columns
          newScene.question = sub.action_cue 
            ? `${sub.action_cue}`
            : `Scene ${newSubs.length}: Make your choice`;
          
          setScenes([...scenes, newScene]);
          
          // Update track's sub-competency list if using tracks
          if (activeTrack && setTracks) {
            setTracks(tracks.map(t => 
              t.id === activeTrack 
                ? { ...t, subCompetencyIds: [...t.subCompetencyIds, subId] }
                : t
            ));
          }
        }
      } else {
        const maxScenes = tracks.length > 0 ? tracks.length * 6 : 6;
        toast.error(`Maximum ${maxScenes} sub-competencies allowed (${tracks.length || 1} track${tracks.length !== 1 ? 's' : ''} × 6)`);
      }
    } else {
      const newSubs = selectedSubCompetencies.filter(id => id !== subId);
      setSelectedSubCompetencies(newSubs);
      // Remove the corresponding scene
      setScenes(scenes.filter(s => s.subCompetencyId !== subId));
      
      // Update track's sub-competency list if using tracks
      if (setTracks) {
        setTracks(tracks.map(t => ({
          ...t,
          subCompetencyIds: t.subCompetencyIds.filter(id => id !== subId)
        })));
      }
    }
  };

  const handleClearAll = () => {
    setSelectedCompetency('');
    setSelectedSubCompetencies([]);
    setScenes([]);
    if (setTracks) {
      setTracks([]);
    }
  };

  const handleAddNewTrack = () => {
    if (!newTrackCompetency) {
      setShowAddTrackSearch(true);
      return;
    }
    
    const competency = competencies.find(c => c.id === newTrackCompetency);
    if (!competency) return;
    
    const newTrack = createDefaultTrack(
      newTrackCompetency, 
      competency.name, 
      tracks.length + 1
    );
    
    if (setTracks) {
      setTracks([...tracks, newTrack]);
    }
    
    setNewTrackCompetency('');
    setShowAddTrackSearch(false);
    toast.success(`Track ${tracks.length + 1}: "${competency.name}" added to curriculum!`);
    
    // Trigger parent callback if provided
    onAddTrack?.();
  };

  const handleRemoveTrack = (trackId: string) => {
    if (!setTracks) return;
    
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;
    
    // Remove all scenes and sub-competencies associated with this track
    const trackSubIds = track.subCompetencyIds;
    setSelectedSubCompetencies(selectedSubCompetencies.filter(id => !trackSubIds.includes(id)));
    setScenes(scenes.filter(s => s.trackId !== trackId));
    setTracks(tracks.filter(t => t.id !== trackId).map((t, i) => ({ ...t, order: i + 1 })));
    
    toast.success(`Track "${track.competencyName}" removed`);
  };

  const getSelectedSubData = (id: string) => subCompetencies.find(s => s.id === id);

  // Filter sub-competencies to only show relevant ones for selected competency
  const filteredSubCompetencies = selectedCompetency 
    ? subCompetencies.filter(s => s.competency_id === selectedCompetency)
    : [];

  // Get sub-competencies for a specific track
  const getTrackSubCompetencies = (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return [];
    return subCompetencies.filter(s => s.competency_id === track.competencyId);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <Lock className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Logic Framework</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Use AI search to find the competency that matches the skill you want to test.
        </p>
      </div>

      {/* Existing Tracks Summary (if multi-track) */}
      {tracks.length > 0 && (
        <div className="bg-muted/50 border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Curriculum Tracks</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {tracks.length} Track{tracks.length !== 1 ? 's' : ''} • {selectedSubCompetencies.length} Scenes
            </Badge>
          </div>
          
          <div className="space-y-2 mb-3">
            {tracks.map((track, idx) => {
              const trackSubs = track.subCompetencyIds.length;
              return (
                <div 
                  key={track.id}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm"
                      style={{ 
                        background: `linear-gradient(135deg, hsl(${(idx * 60) % 360}, 70%, 50%), hsl(${(idx * 60 + 30) % 360}, 70%, 40%))` 
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{track.competencyName}</p>
                      <p className="text-xs text-muted-foreground">{trackSubs}/6 sub-competencies</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Scenes {(idx * 6) + 1}-{(idx + 1) * 6}
                    </Badge>
                    {tracks.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleRemoveTrack(track.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI-Powered Competency Search */}
      <div className="space-y-4">
        <div className="bg-muted/50 border border-border rounded-xl p-4">
          <Label className="text-foreground font-medium mb-3 block">
            {tracks.length > 0 ? 'Add Sub-Competencies to Current Track' : 'Find Your Competency'} *
          </Label>
          <CompetencyAISearch
            competencies={competencies}
            selectedCompetency={selectedCompetency}
            onSelect={setSelectedCompetency}
            onClearAll={handleClearAll}
            onHighlight={onHighlightCompetency}
          />
        </div>

        {/* DATA INTEGRITY ERROR BANNER */}
        {selectedCompetency && dataIntegrityErrors.length > 0 && (
          <div className="bg-destructive/10 border-2 border-destructive/40 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="font-semibold text-sm text-destructive">
                Data Integrity Errors ({dataIntegrityErrors.length})
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              The following sub-competencies are missing required DNA fields and cannot be used:
            </p>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {dataIntegrityErrors.map(error => (
                <div key={error.subCompetencyId} className="bg-background p-2 rounded-lg border border-destructive/20">
                  <p className="text-xs font-medium text-foreground truncate">{error.statement}</p>
                  <p className="text-xs text-destructive">
                    Missing: {error.missingFields.map(f => f === 'action_cue' ? 'Action Cue' : 'Game Mechanic').join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sub-Competency Selection - Only shows filtered results */}
        {selectedCompetency && filteredSubCompetencies.length > 0 && (
          <div className="bg-muted/50 border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-foreground font-medium">Select Sub-Competencies *</Label>
              <Badge variant="outline" className="text-xs">
                {selectedSubCompetencies.length}/{tracks.length > 0 ? tracks.length * 6 : 6} selected
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Each sub-competency creates one scene. Click in order (1-6 per track max).
            </p>
            <div className="space-y-2 max-h-52 overflow-y-auto bg-background border border-border rounded-lg p-3">
              {filteredSubCompetencies.map((sub) => {
                const isSelected = selectedSubCompetencies.includes(sub.id);
                const orderIndex = selectedSubCompetencies.indexOf(sub.id);
                const activeTrackId = tracks.length > 0 ? tracks[tracks.length - 1]?.id : undefined;
                
                return (
                  <div 
                    key={sub.id} 
                    className={`flex items-start space-x-3 p-3 rounded-lg transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-primary/10 border border-primary/40 shadow-sm' 
                        : 'hover:bg-muted border border-transparent'
                    }`}
                    onClick={() => handleSubCompetencyToggle(sub.id, !isSelected, activeTrackId)}
                  >
                    <Checkbox
                      id={sub.id}
                      checked={isSelected}
                      onCheckedChange={(checked) => handleSubCompetencyToggle(sub.id, !!checked, activeTrackId)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <label htmlFor={sub.id} className="text-sm font-medium cursor-pointer text-foreground">
                          {sub.statement}
                        </label>
                        {isSelected && (
                          <Badge className="text-xs bg-primary text-primary-foreground shrink-0">
                            Scene {orderIndex + 1}
                          </Badge>
                        )}
                      </div>
                      {isSelected && sub.action_cue && (
                        <p className="text-xs text-muted-foreground truncate">
                          {sub.action_cue}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Locked Framework Display - THE KEY UI FOR LOCKED FIELDS */}
        {selectedSubCompetencies.length > 0 && (
          <div className="bg-amber-500/5 border-2 border-amber-500/30 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-amber-500/20 rounded-lg">
                <Lock className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">
                  Locked PlayOps Framework
                </h4>
                <p className="text-xs text-muted-foreground">
                  These fields are pulled from the C-BEN standard and cannot be edited
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              {selectedSubCompetencies.map((subId, idx) => {
                const sub = getSelectedSubData(subId);
                if (!sub) return null;
                
                return (
                  <div 
                    key={sub.id} 
                    className="bg-background rounded-lg p-4 border border-border"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div 
                        className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center"
                      >
                        {idx + 1}
                      </div>
                      <p className="font-medium text-sm text-foreground flex-1 truncate">
                        {sub.statement}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {/* Locked Action Cue */}
                      <div className="relative">
                        <div className="absolute -top-2 left-2 px-1.5 bg-background">
                          <span className="text-[10px] font-medium text-amber-600 flex items-center gap-1">
                            <Lock className="h-2.5 w-2.5" />
                            ACTION CUE
                          </span>
                        </div>
                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 pt-4">
                          <p className="text-xs text-foreground leading-relaxed">
                            {sub.action_cue || 'Not defined in framework'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Locked Mechanic */}
                      <div className="relative">
                        <div className="absolute -top-2 left-2 px-1.5 bg-background">
                          <span className="text-[10px] font-medium text-amber-600 flex items-center gap-1">
                            <Lock className="h-2.5 w-2.5" />
                            MECHANIC
                          </span>
                        </div>
                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 pt-4">
                          <p className="text-xs text-foreground font-medium">
                            {sub.game_mechanic || 'Not defined'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 pt-3 border-t border-amber-500/20">
              <p className="text-xs text-muted-foreground italic flex items-center gap-1.5">
                <Lock className="h-3 w-3 text-amber-600" />
                Action Cues and Game Mechanics are mandatory per C-BEN competency standards
              </p>
            </div>
          </div>
        )}

        {/* ADD ANOTHER COMPETENCY TRACK BUTTON */}
        <div className="pt-4 border-t border-border">
          {showAddTrackSearch ? (
            <div className="bg-emerald-500/5 border-2 border-dashed border-emerald-500/40 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-foreground">Add New Competency Track</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAddTrackSearch(false);
                    setNewTrackCompetency('');
                  }}
                >
                  Cancel
                </Button>
              </div>
              
              <CompetencyAISearch
                competencies={competencies}
                selectedCompetency={newTrackCompetency}
                onSelect={(id) => {
                  setNewTrackCompetency(id);
                }}
                onClearAll={() => setNewTrackCompetency('')}
              />
              
              {newTrackCompetency && (
                <Button 
                  onClick={handleAddNewTrack}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Track {tracks.length + 1}: {competencies.find(c => c.id === newTrackCompetency)?.name}
                </Button>
              )}
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full h-14 border-2 border-dashed border-primary/40 hover:border-primary hover:bg-primary/5 transition-all"
              onClick={() => {
                if (selectedCompetency && selectedSubCompetencies.length > 0 && setTracks) {
                  // Auto-create first track from current selection if not already tracked
                  if (tracks.length === 0) {
                    const competency = competencies.find(c => c.id === selectedCompetency);
                    if (competency) {
                      const firstTrack = createDefaultTrack(selectedCompetency, competency.name, 1);
                      firstTrack.subCompetencyIds = [...selectedSubCompetencies];
                      setTracks([firstTrack]);
                      // Update existing scenes with track ID
                      setScenes(scenes.map(s => ({ ...s, trackId: firstTrack.id })));
                    }
                  }
                }
                setShowAddTrackSearch(true);
              }}
            >
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-primary">Add Another Competency Track</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Build multi-track learning journeys for comprehensive skill assessment
                </span>
              </div>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
