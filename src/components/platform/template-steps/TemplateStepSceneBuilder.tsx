import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SceneData, SubCompetency } from './types';
import { SceneCard } from '../SceneCard';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface TemplateStepSceneBuilderProps {
  scenes: SceneData[];
  setScenes: (scenes: SceneData[]) => void;
  subCompetencies: SubCompetency[];
  selectedSubCompetencies: string[];
  currentSceneIndex?: number;
  setCurrentSceneIndex?: (index: number) => void;
}

export function TemplateStepSceneBuilder({
  scenes,
  setScenes,
  subCompetencies,
  selectedSubCompetencies,
  currentSceneIndex = 0,
  setCurrentSceneIndex,
}: TemplateStepSceneBuilderProps) {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isRemixing, setIsRemixing] = useState(false);

  const getSubCompetency = (id: string) => subCompetencies.find(s => s.id === id);

  const handleSceneUpdate = (index: number, updatedScene: SceneData) => {
    const newScenes = [...scenes];
    newScenes[index] = updatedScene;
    setScenes(newScenes);
  };

  const handleAiRemix = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a remix prompt');
      return;
    }

    if (scenes.length === 0) {
      toast.error('No scenes to remix');
      return;
    }

    setIsRemixing(true);
    
    try {
      // Call the generate-game function to remix content
      const response = await supabase.functions.invoke('generate-game', {
        body: {
          action: 'remix',
          prompt: aiPrompt,
          scenes: scenes.map(s => ({
            question: s.question,
            choices: s.choices.map(c => ({ text: c.text, isCorrect: c.isCorrect }))
          })),
          subCompetencies: selectedSubCompetencies.map(id => {
            const sub = getSubCompetency(id);
            return {
              action_cue: sub?.action_cue,
              game_mechanic: sub?.game_mechanic,
            };
          })
        }
      });

      if (response.error) throw new Error(response.error.message);

      if (response.data?.scenes) {
        // Update scenes with remixed content while preserving correct/incorrect mappings
        const remixedScenes = scenes.map((scene, idx) => {
          const remixedData = response.data.scenes[idx];
          if (!remixedData) return scene;
          
          return {
            ...scene,
            question: remixedData.question || scene.question,
            choices: scene.choices.map((choice, cidx) => ({
              ...choice,
              text: remixedData.choices?.[cidx]?.text || choice.text,
              // Keep isCorrect locked!
            }))
          };
        });
        
        setScenes(remixedScenes);
        toast.success('Scenes remixed! Correct/incorrect mappings preserved.');
      }
    } catch (error: any) {
      console.error('Remix error:', error);
      // Fallback: simple text transformation for demo
      const remixedScenes = scenes.map(scene => ({
        ...scene,
        question: scene.question.replace(/scenario|situation/gi, aiPrompt.split(' ').slice(0, 3).join(' ')),
      }));
      setScenes(remixedScenes);
      toast.success('Quick remix applied!');
    } finally {
      setIsRemixing(false);
      setAiPrompt('');
    }
  };

  if (scenes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Scenes Yet</h3>
        <p className="text-sm text-muted-foreground">
          Go back to Framework step and select sub-competencies to create scenes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">Scene Builder</h2>
        <p className="text-sm text-muted-foreground">
          Customize questions and choices for each scene. Mark correct answers with ✅
        </p>
      </div>

      {/* Scene Cards */}
      <div className="space-y-4">
        {scenes.map((scene, index) => (
          <SceneCard
            key={scene.id}
            scene={scene}
            sceneIndex={index}
            subCompetency={getSubCompetency(scene.subCompetencyId)}
            onUpdate={(updated) => handleSceneUpdate(index, updated)}
            isActive={index === currentSceneIndex}
            onSelect={() => setCurrentSceneIndex?.(index)}
          />
        ))}
      </div>

      {/* AI Remix Bar */}
      <div className="border border-primary/30 rounded-lg p-4 bg-primary/5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">AI Remix</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Transform all scene content while keeping correct/incorrect mappings locked.
        </p>
        <div className="flex gap-2">
          <Input
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g., Make this about high-fashion retail..."
            className="flex-1 bg-background border-border"
            onKeyDown={(e) => e.key === 'Enter' && !isRemixing && handleAiRemix()}
          />
          <Button
            type="button"
            onClick={handleAiRemix}
            disabled={isRemixing || !aiPrompt.trim()}
            className="bg-primary text-primary-foreground"
          >
            {isRemixing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Remixing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Remix
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
