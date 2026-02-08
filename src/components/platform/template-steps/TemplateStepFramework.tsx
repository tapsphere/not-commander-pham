import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Competency, SubCompetency, SceneData, createDefaultScene } from './types';
import { Lock } from 'lucide-react';
import { CompetencyAISearch } from './CompetencyAISearch';

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
}: TemplateStepFrameworkProps) {
  const handleSubCompetencyToggle = (subId: string, checked: boolean) => {
    if (checked) {
      if (selectedSubCompetencies.length < 6) {
        const newSubs = [...selectedSubCompetencies, subId];
        setSelectedSubCompetencies(newSubs);
        
        // Create a new scene for this sub-competency
        const sub = subCompetencies.find(s => s.id === subId);
        if (sub) {
          const newScene = createDefaultScene(subId, newSubs.length);
          // Auto-populate question based on action_cue
          newScene.question = sub.action_cue 
            ? `${sub.action_cue}. Select the best approach:`
            : `Scene ${newSubs.length}: Make your choice`;
          setScenes([...scenes, newScene]);
        }
      } else {
        toast.error('Maximum 6 sub-competencies allowed');
      }
    } else {
      const newSubs = selectedSubCompetencies.filter(id => id !== subId);
      setSelectedSubCompetencies(newSubs);
      // Remove the corresponding scene
      setScenes(scenes.filter(s => s.subCompetencyId !== subId));
    }
  };

  const handleClearAll = () => {
    setSelectedCompetency('');
    setSelectedSubCompetencies([]);
    setScenes([]);
  };

  const getSelectedSubData = (id: string) => subCompetencies.find(s => s.id === id);

  // Filter sub-competencies to only show relevant ones for selected competency
  const filteredSubCompetencies = selectedCompetency 
    ? subCompetencies.filter(s => s.competency_id === selectedCompetency)
    : [];

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

      {/* AI-Powered Competency Search */}
      <div className="space-y-4">
        <div className="bg-muted/50 border border-border rounded-xl p-4">
          <Label className="text-foreground font-medium mb-3 block">
            Find Your Competency *
          </Label>
          <CompetencyAISearch
            competencies={competencies}
            selectedCompetency={selectedCompetency}
            onSelect={setSelectedCompetency}
            onClearAll={handleClearAll}
            onHighlight={onHighlightCompetency}
          />
        </div>

        {/* Sub-Competency Selection - Only shows filtered results */}
        {selectedCompetency && filteredSubCompetencies.length > 0 && (
          <div className="bg-muted/50 border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-foreground font-medium">Select Sub-Competencies *</Label>
              <Badge variant="outline" className="text-xs">
                {selectedSubCompetencies.length}/6 selected
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Each sub-competency creates one scene. Click in order (1-6 max).
            </p>
            <div className="space-y-2 max-h-52 overflow-y-auto bg-background border border-border rounded-lg p-3">
              {filteredSubCompetencies.map((sub) => {
                const isSelected = selectedSubCompetencies.includes(sub.id);
                const orderIndex = selectedSubCompetencies.indexOf(sub.id);
                
                return (
                  <div 
                    key={sub.id} 
                    className={`flex items-start space-x-3 p-3 rounded-lg transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-primary/10 border border-primary/40 shadow-sm' 
                        : 'hover:bg-muted border border-transparent'
                    }`}
                    onClick={() => handleSubCompetencyToggle(sub.id, !isSelected)}
                  >
                    <Checkbox
                      id={sub.id}
                      checked={isSelected}
                      onCheckedChange={(checked) => handleSubCompetencyToggle(sub.id, !!checked)}
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
      </div>
    </div>
  );
}
