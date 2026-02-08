import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SceneData, SubCompetency, Competency } from './types';
import { SceneCard } from '../SceneCard';
import { Sparkles, Loader2, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Industry-specific scenario templates for AI generation
const INDUSTRY_SCENARIO_TEMPLATES: Record<string, Record<string, string>> = {
  'Automotive': {
    'Analytical Thinking': 'Diagnosing a luxury engine fault using diagnostic data',
    'Problem Solving': 'Resolving a complex vehicle warranty claim',
    'Communication': 'Explaining technical repairs to a non-technical customer',
    'Decision Making': 'Prioritizing service bay allocation during peak hours',
    'Leadership': 'Coordinating a multi-department recall response',
    'default': 'Handling a complex automotive service situation',
  },
  'Retail': {
    'Analytical Thinking': 'Analyzing sales patterns to optimize inventory',
    'Problem Solving': 'Resolving a VIP customer complaint about a luxury item',
    'Communication': 'Delivering personalized styling recommendations',
    'Decision Making': 'Allocating limited stock during a high-demand launch',
    'Leadership': 'Managing a flagship store during a major event',
    'default': 'Navigating a high-stakes retail moment',
  },
  'Healthcare': {
    'Analytical Thinking': 'Interpreting patient diagnostic results',
    'Problem Solving': 'Managing conflicting treatment priorities',
    'Communication': 'Delivering sensitive health news with empathy',
    'Decision Making': 'Triaging emergency room admissions',
    'Leadership': 'Coordinating cross-departmental patient care',
    'default': 'Handling a critical healthcare decision',
  },
  'Finance': {
    'Analytical Thinking': 'Evaluating investment risk profiles',
    'Problem Solving': 'Resolving a complex portfolio discrepancy',
    'Communication': 'Explaining market volatility to anxious clients',
    'Decision Making': 'Allocating capital across competing opportunities',
    'Leadership': 'Managing team performance during market turbulence',
    'default': 'Navigating a high-stakes financial scenario',
  },
  'Technology': {
    'Analytical Thinking': 'Debugging a critical system failure',
    'Problem Solving': 'Resolving a security vulnerability under pressure',
    'Communication': 'Translating technical issues for stakeholders',
    'Decision Making': 'Prioritizing features for a product sprint',
    'Leadership': 'Coordinating an incident response team',
    'default': 'Managing a complex technical challenge',
  },
  'default': {
    'default': 'Navigating a professional challenge',
  },
};

interface TemplateStepSceneBuilderProps {
  scenes: SceneData[];
  setScenes: (scenes: SceneData[]) => void;
  subCompetencies: SubCompetency[];
  selectedSubCompetencies: string[];
  currentSceneIndex?: number;
  setCurrentSceneIndex?: (index: number) => void;
  // Global context from Step 2
  industry?: string;
  competencyName?: string;
}

export function TemplateStepSceneBuilder({
  scenes,
  setScenes,
  subCompetencies,
  selectedSubCompetencies,
  currentSceneIndex = 0,
  setCurrentSceneIndex,
  industry = '',
  competencyName = '',
}: TemplateStepSceneBuilderProps) {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isRemixing, setIsRemixing] = useState(false);

  const getSubCompetency = (id: string) => subCompetencies.find(s => s.id === id);

  // Generate industry-specific scenario context
  const getIndustryContext = () => {
    const industryTemplates = INDUSTRY_SCENARIO_TEMPLATES[industry] || INDUSTRY_SCENARIO_TEMPLATES['default'];
    const scenarioHint = industryTemplates[competencyName] || industryTemplates['default'];
    return { industryTemplates, scenarioHint };
  };

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
    const { scenarioHint } = getIndustryContext();
    
    try {
      // Call the generate-game function to remix content with industry context
      const response = await supabase.functions.invoke('generate-game', {
        body: {
          action: 'remix',
          prompt: aiPrompt,
          // Pass global context for industry-aware generation
          globalContext: {
            industry,
            competency: competencyName,
            scenarioHint,
          },
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
        toast.success(`Scenes remixed for ${industry || 'your'} industry!`);
      }
    } catch (error: any) {
      console.error('Remix error:', error);
      // Fallback: Apply industry-themed transformation
      const remixedScenes = scenes.map(scene => ({
        ...scene,
        question: industry 
          ? scene.question.replace(/scenario|situation/gi, `${industry.toLowerCase()} ${aiPrompt.split(' ').slice(0, 2).join(' ')}`)
          : scene.question.replace(/scenario|situation/gi, aiPrompt.split(' ').slice(0, 3).join(' ')),
      }));
      setScenes(remixedScenes);
      toast.success('Quick remix applied with industry context!');
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

      {/* Global Context Banner */}
      {(industry || competencyName) && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 border border-accent/50">
          <Building2 className="h-4 w-4 text-accent-foreground" />
          <div className="flex-1">
            <span className="text-xs font-medium text-accent-foreground">Global Context Active</span>
            <p className="text-xs text-muted-foreground">
              {industry && <span className="font-medium">{industry}</span>}
              {industry && competencyName && ' × '}
              {competencyName && <span className="font-medium">{competencyName}</span>}
              {' → '}{getIndustryContext().scenarioHint}
            </p>
          </div>
        </div>
      )}

      {/* AI Remix Bar */}
      <div className="border border-primary/30 rounded-lg p-4 bg-primary/5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">AI Remix</span>
          {industry && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
              {industry}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          {industry 
            ? `Generate ${industry}-specific scenarios combining with ${competencyName || 'selected competency'}.`
            : 'Transform all scene content while keeping correct/incorrect mappings locked.'}
        </p>
        <div className="flex gap-2">
          <Input
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder={industry 
              ? `e.g., Focus on ${getIndustryContext().scenarioHint.toLowerCase()}...`
              : 'e.g., Make this about high-fashion retail...'}
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
