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
import { Competency, SubCompetency, SceneData, CompetencyTrack, createDefaultScene, createDefaultTrack } from './types';
import { matchCompetencyFromPrompt, populateSixScenes } from './RemakeEngine';

// VALERTI SS26 Demo - Professional default content
const VALERTI_DEMO = {
  activePrompt: `Role: Luxury Sales Associate. Brand: VALERTI – SS26 'Ethereal Motion'. Scenario A: Merchandising the 'Silk-Lace Tech Runner' window using Analytical Thinking to optimize mannequin depth and Amber Haze focal lighting. Scenario B: Managing the SS26 digital reservation funnel using Growth Design to identify UI friction points and map VIP referral loops. Create 2 tracks of 6 scenes to measure behavioral readiness for this dual-hybrid role...`,
  theme: 'VALERTI SS26 Luxury Boutique Merchandising',
  skill: 'Analytical Thinking',
  visualBase: 'SS26 Luxury Boutique, 35mm film grain, Amber Haze lighting, ethereal motion',
};

// Track 1: Fashion/Valerti → Analytical Thinking
const FASHION_KEYWORDS = ['fashion', 'merchandising', 'retail', 'window', 'mannequin', 'display', 'lighting', 'valerti', 'luxury', 'boutique', 'silk', 'evening wear', 'footwear'];

// Track 2: Marketing/Growth → Growth Design
const MARKETING_KEYWORDS = ['marketing', 'conversion', 'growth', 'a/b test', 'funnel', 'ui friction', 'referral', 'retention', 'activation', 'onboarding', 'churn', 'engagement'];

// Multi-Track mapping result
interface TrackMapping {
  competencyId: string;
  competencyName: string;
  subIds: string[];
  scenes: SceneData[];
  trackId: string;
}

interface UnifiedCreativeInputProps {
  competencies: Competency[];
  subCompetencies: SubCompetency[];
  // Updated: Support multi-track completion with prompt context
  onComplete: (
    competencyId: string,
    selectedSubIds: string[],
    scenes: SceneData[],
    pathUsed: 'theme' | 'skill' | 'upload',
    additionalTracks?: CompetencyTrack[],
    usedPrompt?: string
  ) => void;
  onManualFallback: () => void;
}

export function UnifiedCreativeInput({
  competencies,
  subCompetencies,
  onComplete,
  onManualFallback,
}: UnifiedCreativeInputProps) {
  // Use demo prompt as initial value, but track if user has modified it
  const [inputValue, setInputValue] = useState(VALERTI_DEMO.activePrompt);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [lastAiCompetencyId, setLastAiCompetencyId] = useState<string | null>(null);
  const [hasSubmittedOnce, setHasSubmittedOnce] = useState(false);
  const [matchedCompetencyNames, setMatchedCompetencyNames] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sort competencies alphabetically for the dropdown
  const sortedCompetencies = [...competencies].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  // Check if prompt matches Fashion/Luxury/VALERTI criteria (Track 1)
  const isFashionPrompt = (text: string): boolean => {
    const input = text.toLowerCase();
    return FASHION_KEYWORDS.some(keyword => input.includes(keyword)) ||
           input.includes(VALERTI_DEMO.theme.toLowerCase().substring(0, 20));
  };

  // Check if prompt matches Marketing/Growth criteria (Track 2)
  const isMarketingPrompt = (text: string): boolean => {
    const input = text.toLowerCase();
    return MARKETING_KEYWORDS.some(keyword => input.includes(keyword));
  };

  // Core function to populate scenes for a given competency
  const populateScenesForCompetency = (competencyId: string, theme: string, trackId?: string) => {
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
    const scenes = populateSixScenes(subCompetencies, competencyId, theme, trackId);

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

  // Multi-Competency Detection Engine v13.0
  const detectMultipleCompetencies = (promptText: string): { hasFashion: boolean; hasMarketing: boolean } => {
    const searchTheme = promptText.trim() || VALERTI_DEMO.theme;
    
    return {
      hasFashion: isFashionPrompt(searchTheme),
      hasMarketing: isMarketingPrompt(searchTheme),
    };
  };

  // Smart semantic matching with multi-track support
  const executeSemanticMapping = async (promptText: string): Promise<void> => {
    const searchTheme = promptText.trim() || VALERTI_DEMO.theme;
    const isDemoOrEmpty = !promptText.trim() || promptText === VALERTI_DEMO.activePrompt;
    
    // Detect multiple competencies
    const { hasFashion, hasMarketing } = detectMultipleCompetencies(promptText);
    const trackMappings: TrackMapping[] = [];
    const matchedNames: string[] = [];

    // If neither detected, default to fashion/analytical for demo-like prompts
    const effectiveHasFashion = hasFashion || (!hasMarketing && isDemoOrEmpty);

    // Track 1: Fashion/VALERTI → Analytical Thinking
    if (effectiveHasFashion) {
      const analyticalComp = competencies.find(c => 
        c.name.toLowerCase().includes('analytical')
      ) || competencies[0];
      
      if (analyticalComp) {
        const trackId = `track-1-${Date.now()}`;
        const { matchedSubs, scenes } = populateScenesForCompetency(analyticalComp.id, searchTheme, trackId);
        
        // Apply Fashion visual styling
        scenes.forEach((scene, idx) => {
          scene.backgroundPrompt = `${VALERTI_DEMO.visualBase}, scene ${idx + 1}: ${scene.question.substring(0, 50)}`;
        });
        
        trackMappings.push({
          competencyId: analyticalComp.id,
          competencyName: analyticalComp.name,
          subIds: matchedSubs.map(s => s.id),
          scenes,
          trackId,
        });
        matchedNames.push(analyticalComp.name);
      }
    }

    // Track 2: Marketing/Growth → Problem Solving (displayed as "Growth Design" in UI)
    // Note: We map to Problem Solving because it has 6 sub-competencies with full DNA data
    if (hasMarketing) {
      // Find a competency with actual sub-competencies for marketing/growth focus
      // Priority: Problem Solving (has 6 subs) > Creative Thinking (has 6 subs)
      const growthComp = competencies.find(c => 
        c.name.toLowerCase().includes('problem solving')
      ) || competencies.find(c => 
        c.name.toLowerCase().includes('creative thinking')
      );
      
      if (growthComp) {
        const trackId = `track-${trackMappings.length + 1}-${Date.now()}`;
        const { matchedSubs, scenes } = populateScenesForCompetency(growthComp.id, searchTheme, trackId);
        
        // Apply Marketing visual styling
        scenes.forEach((scene, idx) => {
          scene.backgroundPrompt = `Modern SaaS dashboard, clean UI, gradient accents, data visualization, scene ${idx + 1}: ${scene.question.substring(0, 50)}`;
        });
        
        trackMappings.push({
          competencyId: growthComp.id,
          // Display as "Growth Design" in UI for consistency with prompt language
          competencyName: 'Growth Design',
          subIds: matchedSubs.map(s => s.id),
          scenes,
          trackId,
        });
        matchedNames.push('Growth Design');
      }
    }

    // Fallback: If no matches, use semantic matching for single track
    if (trackMappings.length === 0) {
      const matchedCompetency = matchCompetencyFromPrompt(searchTheme, competencies);
      
      if (!matchedCompetency) {
        throw new Error('No matching competency found. Please try a different prompt.');
      }

      const trackId = `track-1-${Date.now()}`;
      const { matchedSubs, scenes } = populateScenesForCompetency(matchedCompetency.id, searchTheme, trackId);
      
      trackMappings.push({
        competencyId: matchedCompetency.id,
        competencyName: matchedCompetency.name,
        subIds: matchedSubs.map(s => s.id),
        scenes,
        trackId,
      });
      matchedNames.push(matchedCompetency.name);
    }

    // Store results
    setLastAiCompetencyId(trackMappings[0].competencyId);
    setIsManualMode(false);
    setHasSubmittedOnce(true);
    setMatchedCompetencyNames(matchedNames);
    // NOTE: Do NOT clear inputValue - keep text persistent

    // Build tracks array for multi-track support
    const additionalTracks: CompetencyTrack[] = trackMappings.map((tm, idx) => ({
      id: tm.trackId,
      competencyId: tm.competencyId,
      competencyName: tm.competencyName,
      subCompetencyIds: tm.subIds,
      order: idx + 1,
      createdAt: Date.now(),
    }));

    // Combine all scenes with their track IDs
    const allScenes = trackMappings.flatMap(tm => tm.scenes);
    const allSubIds = trackMappings.flatMap(tm => tm.subIds);
    
    // Success! 
    const trackNames = matchedNames.join(' + ');
    toast.success(`✓ Mapped to "${trackNames}" with ${allScenes.length} scenes`);
    
    // Call onComplete with first track's competencyId and all data, including the used prompt
    onComplete(
      trackMappings[0].competencyId,
      allSubIds,
      allScenes,
      isDemoOrEmpty ? 'theme' : 'skill',
      additionalTracks,
      searchTheme
    );
  };

  // Handle manual competency selection from dropdown
  const handleManualSelect = (competencyId: string) => {
    const currentText = inputValue.trim();
    const isDemoOrEmpty = !currentText || currentText === VALERTI_DEMO.activePrompt;
    const theme = isDemoOrEmpty ? VALERTI_DEMO.theme : currentText;

    try {
      const trackId = `track-1-${Date.now()}`;
      const { matchedCompetency, matchedSubs, scenes } = populateScenesForCompetency(competencyId, theme, trackId);
      setIsManualMode(true);
      setHasSubmittedOnce(true);
      setMatchedCompetencyNames([matchedCompetency.name]);
      
      const track: CompetencyTrack = {
        id: trackId,
        competencyId: matchedCompetency.id,
        competencyName: matchedCompetency.name,
        subCompetencyIds: matchedSubs.map(s => s.id),
        order: 1,
        createdAt: Date.now(),
      };
      
      toast.success(`✓ Switched to "${matchedCompetency.name}" with ${scenes.length} scenes`);
      onComplete(
        matchedCompetency.id,
        matchedSubs.map(s => s.id),
        scenes,
        'skill',
        [track],
        theme
      );
    } catch (error: any) {
      toast.error(error.message || 'Failed to load competency');
    }
  };

  // Revert to AI's smart selection
  const handleSmartSelectRevert = () => {
    if (!lastAiCompetencyId) {
      handleSubmit();
      return;
    }

    const currentText = inputValue.trim();
    const isDemoOrEmpty = !currentText || currentText === VALERTI_DEMO.activePrompt;
    const theme = isDemoOrEmpty ? VALERTI_DEMO.theme : currentText;

    try {
      const trackId = `track-1-${Date.now()}`;
      const { matchedCompetency, matchedSubs, scenes } = populateScenesForCompetency(lastAiCompetencyId, theme, trackId);
      setIsManualMode(false);
      
      const track: CompetencyTrack = {
        id: trackId,
        competencyId: matchedCompetency.id,
        competencyName: matchedCompetency.name,
        subCompetencyIds: matchedSubs.map(s => s.id),
        order: 1,
        createdAt: Date.now(),
      };
      
      toast.success(`✓ Reverted to AI suggestion: "${matchedCompetency.name}"`);
      onComplete(
        matchedCompetency.id,
        matchedSubs.map(s => s.id),
        scenes,
        'skill',
        [track],
        theme
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
      
      const matchedCompetency = matchCompetencyFromPrompt(extractedText, competencies);
      
      if (!matchedCompetency) {
        toast.error('Could not identify a competency from the document');
        setUploadedFile(null);
        return;
      }

      const matchedSubs = subCompetencies
        .filter(s => s.competency_id === matchedCompetency.id)
        .slice(0, 6);

      if (matchedSubs.length === 0) {
        toast.error(`No sub-competencies found for "${matchedCompetency.name}"`);
        setUploadedFile(null);
        return;
      }

      const trackId = `track-1-${Date.now()}`;
      const scenes = matchedSubs.map((sub, idx) => {
        const scene = createDefaultScene(sub.id, idx + 1, trackId);
        scene.question = `[From ${file.name}] ${sub.action_cue || sub.statement}`;
        return scene;
      });

      const track: CompetencyTrack = {
        id: trackId,
        competencyId: matchedCompetency.id,
        competencyName: matchedCompetency.name,
        subCompetencyIds: matchedSubs.map(s => s.id),
        order: 1,
        createdAt: Date.now(),
      };

      setHasSubmittedOnce(true);
      setMatchedCompetencyNames([matchedCompetency.name]);
      toast.success(`Mapped to "${matchedCompetency.name}" with ${scenes.length} scenes`);
      onComplete(matchedCompetency.id, matchedSubs.map(s => s.id), scenes, 'upload', [track], `[From ${file.name}]`);
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
      // NOTE: Text stays in the box after Send (persistent)
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.message || 'Failed to process. Try manual selection.');
      onManualFallback();
    } finally {
      setIsProcessing(false);
    }
  };

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
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !isProcessing && !isUploading) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Enter your training theme, scenario, or skill focus..."
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
          
          {/* Center: Clear Button (only show when there's text and it's not empty) */}
          <div className="flex-1 flex justify-center">
            {inputValue.trim() && (
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

      {/* Multi-Competency Mapping Banner */}
      {hasSubmittedOnce && matchedCompetencyNames.length > 0 && !isManualMode && (
        <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/30 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm text-foreground">
            ✨ We've mapped this to:{' '}
            {matchedCompetencyNames.map((name, idx) => (
              <span key={name}>
                <span className="font-semibold text-primary">{name}</span>
                {idx < matchedCompetencyNames.length - 1 && ' + '}
              </span>
            ))}
          </span>
          {matchedCompetencyNames.length > 1 && (
            <Badge variant="secondary" className="ml-auto text-xs">
              {matchedCompetencyNames.length} Tracks
            </Badge>
          )}
        </div>
      )}

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
            onClick={() => {
              const comp = competencies.find(c => 
                c.name.toLowerCase() === skill.toLowerCase()
              );
              if (comp) {
                handleManualSelect(comp.id);
              }
            }}
          >
            {skill}
          </Badge>
        ))}
        
        {/* Manual/Smart Toggle */}
        <div className="ml-auto">
          {isManualMode ? (
            <button
              onClick={handleSmartSelectRevert}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              ← Smart Select
            </button>
          ) : hasSubmittedOnce ? (
            <Select onValueChange={handleManualSelect}>
              <SelectTrigger className="h-7 text-xs w-auto gap-1 border-dashed">
                <span className="text-muted-foreground">Manual Select →</span>
                <ChevronDown className="h-3 w-3" />
              </SelectTrigger>
              <SelectContent>
                {sortedCompetencies.map(comp => (
                  <SelectItem key={comp.id} value={comp.id} className="text-xs">
                    {comp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </div>
      </div>
    </div>
  );
}
