import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Competency, SubCompetency, SceneData, createDefaultScene } from './types';
import { Lock } from 'lucide-react';

interface TemplateStepFrameworkProps {
  competencies: Competency[];
  subCompetencies: SubCompetency[];
  selectedCompetency: string;
  setSelectedCompetency: (id: string) => void;
  selectedSubCompetencies: string[];
  setSelectedSubCompetencies: (ids: string[]) => void;
  scenes: SceneData[];
  setScenes: (scenes: SceneData[]) => void;
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

  const getSelectedSubData = (id: string) => subCompetencies.find(s => s.id === id);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">Framework & Logic</h2>
        <p className="text-sm text-muted-foreground">
          Select competencies to test. Each sub-competency creates one scene.
        </p>
      </div>

      {/* Competency Selection */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="competency" className="text-foreground">Select Competency *</Label>
          <Select value={selectedCompetency} onValueChange={setSelectedCompetency}>
            <SelectTrigger className="bg-muted border-border">
              <SelectValue placeholder="Choose a competency..." />
            </SelectTrigger>
            <SelectContent className="bg-background border-border z-[9999]">
              {competencies.map((comp) => (
                <SelectItem key={comp.id} value={comp.id}>
                  {comp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sub-Competency Selection */}
        {selectedCompetency && subCompetencies.length > 0 && (
          <div>
            <Label className="text-foreground">Select Sub-Competencies (1-6) *</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Click in order. Each sub-competency = 1 scene.
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto bg-muted border border-border rounded-md p-3">
              {subCompetencies.map((sub, index) => {
                const isSelected = selectedSubCompetencies.includes(sub.id);
                const orderIndex = selectedSubCompetencies.indexOf(sub.id);
                
                return (
                  <div 
                    key={sub.id} 
                    className={`flex items-start space-x-3 p-2 rounded-md transition-colors ${
                      isSelected ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted/50'
                    }`}
                  >
                    <Checkbox
                      id={sub.id}
                      checked={isSelected}
                      onCheckedChange={(checked) => handleSubCompetencyToggle(sub.id, !!checked)}
                    />
                    <div className="flex-1">
                      <label htmlFor={sub.id} className="text-sm cursor-pointer">
                        {sub.statement}
                      </label>
                      {isSelected && (
                        <Badge variant="outline" className="ml-2 text-xs bg-primary/20 text-primary">
                          Scene {orderIndex + 1}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Selected: {selectedSubCompetencies.length}/6
            </p>
          </div>
        )}

        {/* Locked Framework Display */}
        {selectedSubCompetencies.length > 0 && (
          <div className="bg-muted border border-primary/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-sm text-primary">
                Locked PlayOps Framework
              </h4>
            </div>
            <div className="space-y-4">
              {selectedSubCompetencies.map((subId, idx) => {
                const sub = getSelectedSubData(subId);
                if (!sub) return null;
                
                return (
                  <div key={sub.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                    <p className="font-medium text-foreground mb-2">
                      Scene {idx + 1}: {sub.statement}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-background/50 rounded p-2">
                        <span className="text-muted-foreground">Action Cue:</span>
                        <p className="text-foreground">{sub.action_cue || 'Not defined'}</p>
                      </div>
                      <div className="bg-background/50 rounded p-2">
                        <span className="text-muted-foreground">Mechanic:</span>
                        <p className="text-foreground">{sub.game_mechanic || 'Not defined'}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-3 italic flex items-center gap-1">
              <Lock className="h-3 w-3" />
              These mechanics are LOCKED per C-BEN standards
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
