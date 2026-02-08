import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  Sparkles, 
  Loader2,
  ArrowRight,
  Lock,
  Upload,
  FileText,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Competency, SubCompetency, SceneData, createDefaultScene } from './types';

// Fashion demo sample - Active default content
const FASHION_DEMO = {
  activePrompt: `High-end fashion brand teaching window merchandising. Focus: Mannequin depth-spacing and focal point lighting using Analytical Thinking standards... ✨ Try it out?`,
  theme: 'High-end fashion brand teaching window merchandising',
  skill: 'Analytical Thinking',
};

// Skill keywords for direct skill detection
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
    pathUsed: 'theme' | 'skill' | 'upload'
  ) => void;
  onManualFallback: () => void;
}

export function UnifiedCreativeInput({
  competencies,
  subCompetencies,
  onComplete,
  onManualFallback,
}: UnifiedCreativeInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    
    // Default to Analytical Thinking for demos
    return competencies.find(c => c.name.toLowerCase().includes('analytical')) || competencies[0];
  };

  const isSkillSearch = (text: string): boolean => {
    const input = text.toLowerCase().trim();
    if (input.length > 60) return false; // Long text = theme
    
    return SKILL_KEYWORDS.some(keyword => input.includes(keyword)) || 
      competencies.some(c => c.name.toLowerCase().includes(input));
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.includes('pdf')) {
      toast.error('Please upload a PDF file');
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await supabase.functions.invoke('parse-document', {
        body: formData,
      });

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Failed to parse document');
      }

      const extractedText = response.data.text;
      
      // Find matching competency from parsed content
      const matchedCompetency = findMatchingCompetency(extractedText);
      
      if (!matchedCompetency) {
        toast.error('Could not identify a competency from the document');
        setUploadedFile(null);
        return;
      }

      // Get 6 sub-competencies
      const matchedSubs = subCompetencies
        .filter(s => s.competency_id === matchedCompetency.id)
        .slice(0, 6);

      if (matchedSubs.length === 0) {
        toast.error(`No sub-competencies found for "${matchedCompetency.name}"`);
        setUploadedFile(null);
        return;
      }

      // Create scenes with PDF context
      const scenes = matchedSubs.map((sub, idx) => {
        const scene = createDefaultScene(sub.id, idx + 1);
        scene.question = `[From ${file.name}] ${sub.action_cue || sub.statement}`;
        return scene;
      });

      toast.success(`Mapped to "${matchedCompetency.name}" with ${scenes.length} scenes`);
      onComplete(matchedCompetency.id, matchedSubs.map(s => s.id), scenes, 'upload');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to parse PDF. Try entering a theme instead.');
      setUploadedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    // Demo trigger - empty input, placeholder, or active prompt
    const currentText = inputValue.trim();
    const isDemoTrigger = !currentText || currentText === FASHION_DEMO.activePrompt;
    const searchText = isDemoTrigger ? FASHION_DEMO.theme : currentText;

    setIsProcessing(true);

    try {
      const isSkill = !isDemoTrigger && isSkillSearch(searchText);
      const matchedCompetency = findMatchingCompetency(
        isSkill ? searchText : (isDemoTrigger ? FASHION_DEMO.skill : searchText)
      );
      
      if (!matchedCompetency) {
        toast.error('No matching competency found. Try a different search.');
        onManualFallback();
        return;
      }

      // Get 6 sub-competencies
      const matchedSubs = subCompetencies
        .filter(s => s.competency_id === matchedCompetency.id)
        .slice(0, 6);

      if (matchedSubs.length === 0) {
        toast.error(`No sub-competencies found for "${matchedCompetency.name}"`);
        onManualFallback();
        return;
      }

      let scenes: SceneData[];

      if (isSkill) {
        // Direct V5 definitions for skill search
        scenes = matchedSubs.map((sub, idx) => {
          const scene = createDefaultScene(sub.id, idx + 1);
          scene.question = sub.action_cue || `Scene ${idx + 1}: ${sub.statement}`;
          return scene;
        });
        toast.success(`Loaded ${scenes.length} V5 scenes for "${matchedCompetency.name}"`);
      } else {
        // Theme-based generation (demo or custom theme)
        const themeContext = isDemoTrigger ? FASHION_DEMO.theme : searchText;
        
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
              `[${themeContext.substring(0, 40)}...] ${sub.action_cue || 'Make your decision'}`;
            
            if (aiScene?.choices) {
              scene.choices = scene.choices.map((choice, cidx) => ({
                ...choice,
                text: aiScene.choices[cidx]?.text || choice.text,
              }));
            }
            
            return scene;
          });

          toast.success(`Created ${scenes.length} themed scenes for "${matchedCompetency.name}"!`);
        } catch {
          // Fallback without AI
          scenes = matchedSubs.map((sub, idx) => {
            const scene = createDefaultScene(sub.id, idx + 1);
            scene.question = `[${themeContext.substring(0, 30)}] ${sub.action_cue || 'Make your decision'}`;
            return scene;
          });
          toast.success(`Created ${scenes.length} scenes (AI skipped)`);
        }
      }

      onComplete(
        matchedCompetency.id, 
        matchedSubs.map(s => s.id), 
        scenes, 
        isSkill ? 'skill' : 'theme'
      );
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error('Failed to process. Try manual selection.');
      onManualFallback();
    } finally {
      setIsProcessing(false);
    }
  };

  // handleKeyDown moved inline to textarea for proper event handling

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const clearUpload = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header - Command Center Hero */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 mb-2">
          <Sparkles className="h-7 w-7 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Command Center</h2>
        </div>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Search & Build — enter a theme, type a skill, or upload a PDF. The AI handles the heavy lifting.
        </p>
      </div>

      {/* Large Hero Command Box */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={inputValue || FASHION_DEMO.activePrompt}
          onChange={(e) => setInputValue(e.target.value === FASHION_DEMO.activePrompt ? '' : e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !isProcessing && !isUploading) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          onFocus={() => {
            if (!inputValue) {
              setInputValue('');
            }
          }}
          placeholder={FASHION_DEMO.activePrompt}
          className="w-full min-h-[80px] px-5 py-4 pr-16 text-lg leading-relaxed bg-background border-2 border-border rounded-xl shadow-lg shadow-primary/5 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none transition-all duration-200 placeholder:text-muted-foreground/70 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isProcessing || isUploading}
          rows={2}
        />
        
        {/* Large Upload Icon Button */}
        <button
          type="button"
          onClick={handleUploadClick}
          disabled={isProcessing || isUploading}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-lg bg-muted/50 hover:bg-primary/10 border border-border hover:border-primary/30 transition-all duration-200 disabled:opacity-50 group"
          title="Upload PDF"
        >
          <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Uploaded File Indicator */}
      {uploadedFile && (
        <div className="flex items-center gap-2 p-2 bg-primary/5 border border-primary/20 rounded-lg">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-sm text-foreground flex-1 truncate">{uploadedFile.name}</span>
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <button onClick={clearUpload} className="p-1 hover:bg-muted rounded">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      )}

      {/* Action Button */}
      <Button
        onClick={handleSubmit}
        disabled={isProcessing || isUploading}
        size="lg"
        className="w-full h-12 text-base font-medium shadow-md hover:shadow-lg transition-shadow"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Building Framework...
          </>
        ) : isUploading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Parsing PDF...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5 mr-2" />
            {inputValue.trim() && inputValue.trim() !== FASHION_DEMO.activePrompt 
              ? 'Generate 6-Scene Framework' 
              : 'Launch Fashion Demo'}
            <ArrowRight className="h-5 w-5 ml-2" />
          </>
        )}
      </Button>

      {/* Quick Skills */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground mr-2">Quick skills:</span>
        {['Analytical Thinking', 'Problem Solving', 'Emotional Intelligence'].map(skill => (
          <Badge
            key={skill}
            variant="outline"
            className="cursor-pointer hover:bg-muted transition-colors"
            onClick={() => setInputValue(skill)}
          >
            {skill}
          </Badge>
        ))}
        <Badge
          variant="outline"
          className="cursor-pointer text-muted-foreground hover:bg-muted"
          onClick={onManualFallback}
        >
          Manual Select →
        </Badge>
      </div>

      {/* V5 Lock Indicator */}
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
