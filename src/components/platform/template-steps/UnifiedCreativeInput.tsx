import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Loader2,
  Upload,
  FileText,
  X,
  Send,
  ChevronDown
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Competency, SubCompetency, SceneData, createDefaultScene } from './types';
import { matchCompetencyFromPrompt, populateSixScenes } from './RemakeEngine';

// VALERTI SS26 Demo - Professional default content
const VALERTI_DEMO = {
  activePrompt: `Luxury Brand VALERTI – SS26 Global Launch: Ethereal Motion. Scenario: Merchandising Silk-Lace Footwear and Draped Evening Wear. Focus: Mannequin depth-spacing, Amber Haze focal lighting, and consumer eye-flow using Analytical Thinking standards. Create 6 scenes...`,
  theme: 'VALERTI SS26 Luxury Boutique Merchandising',
  skill: 'Analytical Thinking',
  visualBase: 'SS26 Luxury Boutique, 35mm film grain, Amber Haze lighting, ethereal motion',
};

// Keywords that trigger Fashion/Analytical Thinking mapping
const FASHION_KEYWORDS = ['fashion', 'merchandising', 'retail', 'window', 'mannequin', 'display', 'lighting', 'valerti', 'luxury', 'boutique', 'silk', 'evening wear', 'footwear'];

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
  const [isManualMode, setIsManualMode] = useState(false);
  const [lastAiCompetencyId, setLastAiCompetencyId] = useState<string | null>(null);
  const [hasSubmittedOnce, setHasSubmittedOnce] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sort competencies alphabetically for the dropdown
  const sortedCompetencies = [...competencies].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  // Check if prompt matches Fashion/Luxury/VALERTI criteria
  const isFashionPrompt = (text: string): boolean => {
    const input = text.toLowerCase();
    return FASHION_KEYWORDS.some(keyword => input.includes(keyword)) ||
           input.includes(VALERTI_DEMO.theme.toLowerCase().substring(0, 20));
  };

  // Core function to populate scenes for a given competency
  const populateScenesForCompetency = (competencyId: string, theme: string) => {
    const matchedCompetency = competencies.find(c => c.id === competencyId);
    if (!matchedCompetency) {
      throw new Error('Competency not found');
    }

    // Get exactly 6 sub-competencies for this competency
    const matchedSubs = subCompetencies
      .filter(s => s.competency_id === competencyId)
      .slice(0, 6);

    if (matchedSubs.length === 0) {
      throw new Error(`No sub-competencies found for "${matchedCompetency.name}".`);
    }

    // Ensure we have exactly 6 (pad if needed)
    while (matchedSubs.length < 6 && subCompetencies.length > 0) {
      const existingSub = matchedSubs[matchedSubs.length - 1] || subCompetencies[0];
      matchedSubs.push({
        ...existingSub,
        id: `padded-${matchedSubs.length}-${Date.now()}`,
      });
    }

    // Populate 6 scenes with V5 mechanics locked
    const scenes = populateSixScenes(subCompetencies, competencyId, theme);

    // Ensure we always have 6 scenes
    if (scenes.length !== 6) {
      while (scenes.length < 6) {
        const lastScene = scenes[scenes.length - 1];
        scenes.push({
          ...lastScene,
          id: `padded-scene-${scenes.length + 1}-${Date.now()}`,
          question: `[${theme.substring(0, 30)}] Scene ${scenes.length + 1}`,
        });
      }
    }

    return { matchedCompetency, matchedSubs, scenes };
  };

  // Smart semantic matching using RemakeEngine
  const executeSemanticMapping = async (promptText: string): Promise<void> => {
    // Determine the theme to use
    const isDemoOrEmpty = !promptText.trim() || promptText === VALERTI_DEMO.activePrompt;
    const searchTheme = isDemoOrEmpty ? VALERTI_DEMO.theme : promptText;
    
    // Step 1: Find the best-match competency
    let matchedCompetency: Competency | null = null;
    
    if (isDemoOrEmpty || isFashionPrompt(searchTheme)) {
      // Fashion/VALERTI prompt → Analytical Thinking
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

    // Store AI's competency choice for "Smart Select" revert
    setLastAiCompetencyId(matchedCompetency.id);
    setIsManualMode(false);
    setHasSubmittedOnce(true);

    const { matchedSubs, scenes } = populateScenesForCompetency(matchedCompetency.id, searchTheme);
    
    // Enhance scenes with VALERTI visual styling if using fashion demo
    if (isDemoOrEmpty || isFashionPrompt(searchTheme)) {
      scenes.forEach((scene, idx) => {
        scene.backgroundPrompt = `${VALERTI_DEMO.visualBase}, scene ${idx + 1}: ${scene.question.substring(0, 50)}`;
      });
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

  // Handle manual competency selection from dropdown
  const handleManualSelect = (competencyId: string) => {
    const currentText = inputValue.trim();
    const isDemoOrEmpty = !currentText || currentText === VALERTI_DEMO.activePrompt;
    const theme = isDemoOrEmpty ? VALERTI_DEMO.theme : currentText;

    try {
      const { matchedCompetency, matchedSubs, scenes } = populateScenesForCompetency(competencyId, theme);
      setIsManualMode(true);
      setHasSubmittedOnce(true);
      
      toast.success(`✓ Switched to "${matchedCompetency.name}" with ${scenes.length} scenes`);
      onComplete(
        matchedCompetency.id,
        matchedSubs.map(s => s.id),
        scenes,
        'skill'
      );
    } catch (error: any) {
      toast.error(error.message || 'Failed to load competency');
    }
  };

  // Revert to AI's smart selection
  const handleSmartSelectRevert = () => {
    if (!lastAiCompetencyId) {
      // No previous AI selection, run semantic mapping again
      handleSubmit();
      return;
    }

    const currentText = inputValue.trim();
    const isDemoOrEmpty = !currentText || currentText === VALERTI_DEMO.activePrompt;
    const theme = isDemoOrEmpty ? VALERTI_DEMO.theme : currentText;

    try {
      const { matchedCompetency, matchedSubs, scenes } = populateScenesForCompetency(lastAiCompetencyId, theme);
      setIsManualMode(false);
      
      toast.success(`✓ Reverted to AI suggestion: "${matchedCompetency.name}"`);
      onComplete(
        matchedCompetency.id,
        matchedSubs.map(s => s.id),
        scenes,
        'skill'
      );
    } catch (error: any) {
      toast.error(error.message || 'Failed to revert');
    }
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
          value={inputValue || VALERTI_DEMO.activePrompt}
          onChange={(e) => setInputValue(e.target.value === VALERTI_DEMO.activePrompt ? '' : e.target.value)}
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
          placeholder={VALERTI_DEMO.activePrompt}
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
            {inputValue && inputValue !== VALERTI_DEMO.activePrompt && (
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
          
          {/* Right: Floating Hint + Send Button */}
          <div className="flex items-center gap-2">
            {/* Floating Hint - disappears after first send */}
            {!hasSubmittedOnce && (
              <span className="text-xs text-primary/70 font-medium animate-pulse hidden sm:inline">
                ✨ Try it out?
              </span>
            )}
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


      {/* Quick Skills + Manual/Smart Toggle */}
      <div className="flex flex-wrap items-center gap-2">
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
        
        {/* Manual Select Dropdown / Smart Select Toggle */}
        {isManualMode ? (
          <Badge
            variant="outline"
            className="cursor-pointer text-primary hover:bg-primary/10 border-primary/30"
            onClick={handleSmartSelectRevert}
          >
            ← Smart Select
          </Badge>
        ) : (
          <Select onValueChange={handleManualSelect}>
            <SelectTrigger className="h-6 w-auto px-2 py-0 text-xs border-dashed bg-transparent hover:bg-muted">
              <span className="text-muted-foreground">Manual Select →</span>
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {sortedCompetencies.map(comp => (
                <SelectItem key={comp.id} value={comp.id} className="text-sm">
                  {comp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

    </div>
  );
}
