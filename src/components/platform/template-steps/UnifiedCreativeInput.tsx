import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Loader2,
  Lock,
  Upload,
  FileText,
  X,
  Send
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Competency, SubCompetency, SceneData, createDefaultScene } from './types';
import { matchCompetencyFromPrompt, populateSixScenes } from './RemakeEngine';

// Fashion demo sample - Active default content
const FASHION_DEMO = {
  activePrompt: `High-end fashion brand teaching window merchandising. Focus: Mannequin depth-spacing and focal point lighting using Analytical Thinking standards... ✨ Try it out?`,
  theme: 'High-end fashion brand teaching window merchandising',
  skill: 'Analytical Thinking',
};

// Keywords that trigger Fashion/Analytical Thinking mapping
const FASHION_KEYWORDS = ['fashion', 'merchandising', 'retail', 'window', 'mannequin', 'display', 'lighting'];

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

  // Check if prompt matches Fashion/Analytical Thinking criteria
  const isFashionPrompt = (text: string): boolean => {
    const input = text.toLowerCase();
    return FASHION_KEYWORDS.some(keyword => input.includes(keyword)) ||
           input.includes(FASHION_DEMO.theme.toLowerCase().substring(0, 20));
  };

  // Smart semantic matching using RemakeEngine
  const executeSemanticMapping = async (promptText: string): Promise<void> => {
    // Determine the theme to use
    const isDemoOrEmpty = !promptText.trim() || promptText === FASHION_DEMO.activePrompt;
    const searchTheme = isDemoOrEmpty ? FASHION_DEMO.theme : promptText;
    
    // Step 1: Find the best-match competency
    let matchedCompetency: Competency | null = null;
    
    if (isDemoOrEmpty || isFashionPrompt(searchTheme)) {
      // Fashion prompt → Analytical Thinking
      matchedCompetency = competencies.find(c => 
        c.name.toLowerCase().includes('analytical')
      ) || competencies[0];
    } else {
      // Semantic match for other themes
      matchedCompetency = matchCompetencyFromPrompt(searchTheme, competencies);
    }
    
    if (!matchedCompetency) {
      throw new Error('No matching competency found. Please try a different prompt.');
    }
    
    // Step 2: Get exactly 6 sub-competencies for this competency
    const matchedSubs = subCompetencies
      .filter(s => s.competency_id === matchedCompetency!.id)
      .slice(0, 6);
    
    if (matchedSubs.length === 0) {
      throw new Error(`No sub-competencies found for "${matchedCompetency.name}". Please select a different skill.`);
    }
    
    // Ensure we have exactly 6 (pad if needed)
    while (matchedSubs.length < 6 && subCompetencies.length > 0) {
      const existingSub = matchedSubs[matchedSubs.length - 1] || subCompetencies[0];
      matchedSubs.push({
        ...existingSub,
        id: `padded-${matchedSubs.length}-${Date.now()}`,
      });
    }
    
    // Step 3: Populate 6 scenes with V5 mechanics locked
    const scenes = populateSixScenes(
      subCompetencies,
      matchedCompetency.id,
      searchTheme
    );
    
    // Ensure we always have 6 scenes
    if (scenes.length !== 6) {
      console.warn(`Scene count mismatch: got ${scenes.length}, expected 6. Padding...`);
      while (scenes.length < 6) {
        const lastScene = scenes[scenes.length - 1];
        scenes.push({
          ...lastScene,
          id: `padded-scene-${scenes.length + 1}-${Date.now()}`,
          question: `[${searchTheme.substring(0, 30)}] Scene ${scenes.length + 1}`,
        });
      }
    }
    
    // Success! Call onComplete with the mapped data
    toast.success(`✓ Mapped to "${matchedCompetency.name}" with ${scenes.length} scenes`);
    onComplete(
      matchedCompetency.id,
      matchedSubs.map(s => s.id),
      scenes,
      isDemoOrEmpty ? 'theme' : 'skill'
    );
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
      
      // Find matching competency from parsed content using RemakeEngine
      const matchedCompetency = matchCompetencyFromPrompt(extractedText, competencies);
      
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
    const currentText = inputValue.trim();
    setIsProcessing(true);

    try {
      await executeSemanticMapping(currentText);
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.message || 'Failed to process. Try manual selection.');
      onManualFallback();
    } finally {
      setIsProcessing(false);
    }
  };

  // Clear input to start over
  const handleClearInput = () => {
    setInputValue('');
    setUploadedFile(null);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

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
    <div className="space-y-4">
      {/* Large Hero Command Box - The Focal Point */}
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
          className="w-full min-h-[180px] px-5 py-4 pb-14 text-base leading-relaxed bg-background border-2 border-border rounded-xl shadow-lg shadow-primary/5 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none transition-all duration-200 placeholder:text-muted-foreground/70 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isProcessing || isUploading}
          rows={5}
        />
        
        {/* Bottom bar: Upload left, Clear center, Send right */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          {/* Left: Upload Button */}
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={isProcessing || isUploading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/50 hover:bg-primary/10 border border-border hover:border-primary/30 transition-all duration-200 disabled:opacity-50 group text-xs"
            title="Upload PDF or Training Materials"
          >
            <Upload className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-muted-foreground group-hover:text-primary">Upload PDF</span>
          </button>
          
          {/* Center: Clear Button (only show when there's custom input) */}
          <div className="flex-1 flex justify-center">
            {inputValue && inputValue !== FASHION_DEMO.activePrompt && (
              <button
                type="button"
                onClick={handleClearInput}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
          
          {/* Right: Compact Send Button + Hint */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground italic hidden sm:inline">
              (Hit Send)
            </span>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isProcessing || isUploading}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm"
              title="Send"
            >
              {isProcessing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
        
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

    </div>
  );
}
