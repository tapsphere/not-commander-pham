import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Sparkles, 
  Loader2,
  Search,
  Lightbulb,
  ArrowRight,
  Lock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Competency, SubCompetency, SceneData, createDefaultScene } from './types';

// Fashion demo sample
const FASHION_DEMO = {
  placeholder: `High-end fashion brand teaching window merchandising. Focus: Mannequin depth-spacing and focal point lighting using Analytical Thinking standards... ✨ Try it out or tell me what skills you want?`,
  theme: 'High-end fashion brand teaching window merchandising',
  skill: 'Analytical Thinking',
};

// Skill keywords for Path B detection
const SKILL_KEYWORDS = [
  'thinking', 'solving', 'intelligence', 'communication', 'clarity', 
  'creativity', 'leadership', 'fluency', 'digital', 'emotional',
  'analytical', 'problem', 'creative', 'decision', 'collaboration'
];

interface UnifiedCreativeInputProps {
  competencies: Competency[];
  subCompetencies: SubCompetency[];
  onComplete: (
    competencyId: string,
    selectedSubIds: string[],
    scenes: SceneData[],
    pathUsed: 'theme' | 'skill'
  ) => void;
  onManualFallback: () => void;
}

export function UnifiedCreativeInput({
  competencies,
  subCompetencies,
  onComplete,
  onManualFallback,
}: UnifiedCreativeInputProps) {
  const [inputValue, setInputValue] = useState(FASHION_DEMO.placeholder);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedMode, setDetectedMode] = useState<'theme' | 'skill' | null>('theme');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Detect input mode based on content
  useEffect(() => {
    const input = inputValue.toLowerCase().trim();
    
    // If it's the placeholder or contains theme-like content
    if (inputValue === FASHION_DEMO.placeholder || input.includes('brand') || input.includes('teaching') || input.includes('training')) {
      setDetectedMode('theme');
      return;
    }
    
    // If it matches a skill keyword directly
    const isSkillSearch = SKILL_KEYWORDS.some(keyword => 
      input.includes(keyword) || 
      competencies.some(c => c.name.toLowerCase().includes(input))
    );
    
    if (isSkillSearch && input.length < 50) {
      setDetectedMode('skill');
    } else if (input.length > 20) {
      setDetectedMode('theme');
    } else {
      setDetectedMode(null);
    }
  }, [inputValue, competencies]);

  const findMatchingCompetency = (searchText: string): Competency | null => {
    const input = searchText.toLowerCase();
    
    // Direct name match first
    const directMatch = competencies.find(c => 
      c.name.toLowerCase().includes(input) ||
      input.includes(c.name.toLowerCase())
    );
    if (directMatch) return directMatch;
    
    // Keyword matching
    for (const c of competencies) {
      const competencyWords = c.name.toLowerCase().split(/\s+/);
      if (competencyWords.some(word => input.includes(word))) {
        return c;
      }
    }
    
    // Default to Analytical Thinking for theme mode
    return competencies.find(c => c.name.toLowerCase().includes('analytical')) || competencies[0];
  };

  const handleSubmit = async () => {
    if (!inputValue.trim()) {
      toast.error('Please enter a theme or skill');
      return;
    }

    setIsProcessing(true);

    try {
      // Determine the path based on detected mode
      const isThemeMode = detectedMode === 'theme' || inputValue === FASHION_DEMO.placeholder;
      
      // Extract skill from input
      let skillSearch = '';
      let themeContext = '';
      
      if (isThemeMode) {
        // Parse theme for skill reference
        const analyticalMatch = inputValue.match(/analytical\s*thinking/i);
        skillSearch = analyticalMatch ? 'Analytical Thinking' : 
          inputValue.match(/(\w+\s+\w+)\s*standards?/i)?.[1] || 'Analytical Thinking';
        themeContext = inputValue.replace(/✨.*$/, '').trim();
      } else {
        // Direct skill search
        skillSearch = inputValue;
      }

      // Find matching competency
      const matchedCompetency = findMatchingCompetency(skillSearch);
      
      if (!matchedCompetency) {
        toast.error('No matching competency found. Try a different search.');
        onManualFallback();
        return;
      }

      // Get 6 sub-competencies for this competency
      const matchedSubs = subCompetencies
        .filter(s => s.competency_id === matchedCompetency.id)
        .slice(0, 6);

      if (matchedSubs.length === 0) {
        toast.error(`No sub-competencies found for "${matchedCompetency.name}".`);
        onManualFallback();
        return;
      }

      // Create scenes based on mode
      let scenes: SceneData[];

      if (isThemeMode && themeContext) {
        // Path A: Theme-based AI generation
        try {
          const response = await supabase.functions.invoke('generate-game', {
            body: {
              action: 'theme-scenes',
              theme: themeContext,
              competencyName: matchedCompetency.name,
              subCompetencies: matchedSubs.map(s => ({
                id: s.id,
                statement: s.statement,
                action_cue: s.action_cue,
                game_mechanic: s.game_mechanic,
              })),
            },
          });

          scenes = matchedSubs.map((sub, idx) => {
            const scene = createDefaultScene(sub.id, idx + 1);
            const aiScene = response.data?.scenes?.[idx];
            
            scene.question = aiScene?.question || 
              `[${themeContext.substring(0, 50)}...] ${sub.action_cue || 'Make your decision'}`;
            
            if (aiScene?.choices) {
              scene.choices = scene.choices.map((choice, cidx) => ({
                ...choice,
                text: aiScene.choices[cidx]?.text || choice.text,
              }));
            }
            
            return scene;
          });

          toast.success(`Created ${scenes.length} themed scenes for "${matchedCompetency.name}"!`);
        } catch (error) {
          // Fallback without AI theming
          scenes = matchedSubs.map((sub, idx) => {
            const scene = createDefaultScene(sub.id, idx + 1);
            scene.question = `[${themeContext.substring(0, 30)}] ${sub.action_cue || 'Make your decision'}`;
            return scene;
          });
          toast.success(`Created ${scenes.length} scenes (AI theming skipped)`);
        }
      } else {
        // Path B: Direct V5 definitions
        scenes = matchedSubs.map((sub, idx) => {
          const scene = createDefaultScene(sub.id, idx + 1);
          scene.question = sub.action_cue || `Scene ${idx + 1}: ${sub.statement}`;
          return scene;
        });
        toast.success(`Loaded ${scenes.length} V5 scenes for "${matchedCompetency.name}"`);
      }

      onComplete(
        matchedCompetency.id, 
        matchedSubs.map(s => s.id), 
        scenes, 
        isThemeMode ? 'theme' : 'skill'
      );
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error('Failed to process. Try manual selection.');
      onManualFallback();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTryDemo = () => {
    setInputValue(FASHION_DEMO.placeholder);
    toast.success('Fashion demo loaded! Press Enter to generate.');
    textareaRef.current?.focus();
  };

  const handleClear = () => {
    setInputValue('');
    textareaRef.current?.focus();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Universal Start</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Describe your training context or search for a skill — we'll build your 6-scene validator.
        </p>
      </div>

      {/* Creative Input */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={FASHION_DEMO.placeholder}
          className="min-h-[120px] pr-24 text-sm bg-background border-2 border-border focus:border-primary/50 resize-none"
          disabled={isProcessing}
        />
        
        {/* Mode indicator */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
          {detectedMode && (
            <Badge 
              variant="outline" 
              className={`text-xs ${
                detectedMode === 'theme' 
                  ? 'border-emerald-500/50 text-emerald-600 bg-emerald-500/10' 
                  : 'border-amber-500/50 text-amber-600 bg-amber-500/10'
              }`}
            >
              {detectedMode === 'theme' ? '🎨 Theme Mode' : '🔍 Skill Mode'}
            </Badge>
          )}
        </div>

        {/* Clear button */}
        {inputValue && inputValue !== FASHION_DEMO.placeholder && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute bottom-3 right-3 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSubmit}
          disabled={!inputValue.trim() || isProcessing}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {detectedMode === 'theme' ? 'Generating Scenes...' : 'Loading V5 Data...'}
            </>
          ) : (
            <>
              {detectedMode === 'theme' ? (
                <Sparkles className="h-4 w-4 mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              {detectedMode === 'theme' ? 'Generate 6 Themed Scenes' : 'Load V5 Standard Scenes'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>

        {inputValue !== FASHION_DEMO.placeholder && (
          <Button
            variant="outline"
            onClick={handleTryDemo}
            className="shrink-0"
          >
            <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
            Try Demo
          </Button>
        )}
      </div>

      {/* Quick skill shortcuts */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground mr-2">Quick skills:</span>
        {['Analytical Thinking', 'Problem Solving', 'Communication'].map(skill => (
          <Button
            key={skill}
            variant="ghost"
            size="sm"
            className="h-7 text-xs bg-muted/50 hover:bg-muted"
            onClick={() => setInputValue(skill)}
          >
            {skill}
          </Button>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground"
          onClick={onManualFallback}
        >
          Manual Select →
        </Button>
      </div>

      {/* V5 Lock indicator */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mt-4">
        <p className="text-xs text-muted-foreground flex items-start gap-2">
          <Lock className="h-3 w-3 text-primary mt-0.5 shrink-0" />
          <span>
            <strong>V5 Scientific Lock:</strong> Mobile Interactions (Col G) and Time Gates (Col H) 
            are read-only in the Scene Builder, ensuring C-BEN compliance.
          </span>
        </p>
      </div>
    </div>
  );
}
