import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Loader2,
  Upload,
  FileText,
  X,
  Sparkles,
  ChevronDown,
  Zap,
  Lightbulb
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

// Demo Mode Suggestions - Clickable quick-start prompts
const DEMO_SUGGESTIONS = [
  { label: 'Luxury Boutique Floor Manager', prompt: 'Role: Luxury Sales Associate. Brand: VALERTI – SS26 "Ethereal Motion". Merchandising window displays and managing digital reservations for high-net-worth clients.' },
  { label: 'Aviation Safety Officer', prompt: 'Role: Aviation Safety Officer. Context: Pre-flight inspection and emergency protocol training for commercial airline crew.' },
  { label: 'Fintech Product Lead', prompt: 'Role: Product Manager. Context: Optimizing user onboarding flow and A/B testing conversion funnels for a mobile banking app.' },
];

// VALERTI SS26 Demo - Quiet Luxury Italian Maison
const VALERTI_DEMO = {
  activePrompt: `Role: Luxury Sales Associate. Brand: VALERTI – SS26 'Ethereal Motion'. Scenario A: Merchandising the 'Silk-Lace Tech Runner' window using Analytical Thinking to optimize mannequin depth and warm ambient lighting. Scenario B: Managing the SS26 digital reservation funnel using Growth Design to identify UI friction points and map VIP referral loops. Create 2 tracks of 6 scenes to measure behavioral readiness for this dual-hybrid role...`,
  theme: 'VALERTI SS26 Luxury Boutique Merchandising',
  skill: 'Analytical Thinking',
  visualBase: 'Cinematic 35mm vignette, Milanese luxury showroom, arched architecture, natural stone, warm lighting, heavy bokeh',
};

// VALERTI Demo Override - Template Injection v46.0 (Quiet Luxury)
// When detected, this overrides Step 1 & 2 with demo brand data
export const VALERTI_DEMO_OVERRIDE = {
  // Step 1: Brand visuals — Quiet Luxury Italian Maison palette
  colors: {
    primary: '#C0B283',    // Champagne Gold
    secondary: '#5B4A3F',  // Walnut / Container
    accent: '#C0B283',     // Champagne Gold
    background: '#F2F1EF', // Surface (Warm Linen)
    highlight: '#C0B283',  // Champagne Gold
    text: '#0D0D0D',       // Typography (Near Black)
  },
  logoUrl: '/demo/valerti-wire-logo.png', // VALERTI Wire-Sculpture Logo
  // Step 2: Role & Info
  name: 'VALERTI',
  description: 'SS26 "Ethereal Motion" Luxury Training',
  roleScenario: 'Luxury Sales Associate',
  industry: 'Retail',
  keyElement: 'Mid-Level / Boutique Floor',
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

// Distillation Result from AI (Phase 1 output)
export interface MacroLesson {
  lessonName: string;
  condensedStandards: string[];
  suggestedCompetency: string;
  rationale: string;
  actionCues: string[];
}

export interface DistillationResult {
  documentSummary: string;
  technicalCoreExtracted: string;
  macroLessons: MacroLesson[];
  filename: string;
}

// Demo Override callback type
export interface DemoOverrideData {
  colors: typeof VALERTI_DEMO_OVERRIDE.colors;
  logoUrl: string;
  name: string;
  description: string;
  roleScenario: string;
  industry: string;
  keyElement: string;
}

interface UnifiedCreativeInputProps {
  competencies: Competency[];
  subCompetencies: SubCompetency[];
  onComplete: (
    competencyId: string,
    selectedSubIds: string[],
    scenes: SceneData[],
    pathUsed: 'theme' | 'skill' | 'upload',
    additionalTracks?: CompetencyTrack[],
    usedPrompt?: string
  ) => void;
  onManualFallback: () => void;
  onDemoOverride?: (data: DemoOverrideData) => void;
  onFactoryReset?: () => void;
  onDistillationResult?: (result: DistillationResult) => void;
}

export function UnifiedCreativeInput({
  competencies,
  subCompetencies,
  onComplete,
  onManualFallback,
  onDemoOverride,
  onFactoryReset,
  onDistillationResult,
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
  const [heroMode, setHeroMode] = useState<'smart' | 'upload'>('smart');
  const [isDragOver, setIsDragOver] = useState(false);
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
    
    // ============================================
    // DEMO OVERRIDE v27.0: VALERTI Template Injection
    // ============================================
    const isValertiDemo = searchTheme.toLowerCase().includes('valerti');
    
    if (isValertiDemo && onDemoOverride) {
      // Trigger demo override for Step 1 & 2
      onDemoOverride({
        colors: VALERTI_DEMO_OVERRIDE.colors,
        logoUrl: VALERTI_DEMO_OVERRIDE.logoUrl,
        name: VALERTI_DEMO_OVERRIDE.name,
        description: VALERTI_DEMO_OVERRIDE.description,
        roleScenario: VALERTI_DEMO_OVERRIDE.roleScenario,
        industry: VALERTI_DEMO_OVERRIDE.industry,
        keyElement: VALERTI_DEMO_OVERRIDE.keyElement,
      });
      
      // v31.0: Silent injection - no toast shown, user discovers it naturally when navigating to Step 1
      console.log('✨ VALERTI Demo Override triggered silently');
    }
    
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
        
        // Apply Quiet Luxury visual styling — Cinematic 35mm with minimalist subjects
        const SCENE_SUBJECTS = [
          'One sculptural mannequin in neutral silk drapery',
          'A single tech-runner shoe on a floating marble shelf',
          'A minimalist gold garment rack with one hanging item',
          'A single leather portfolio case on a polished stone counter',
          'One delicate perfume bottle with amber liquid on brushed brass',
          'A single evening clutch displayed in an arched alcove',
        ];
        scenes.forEach((scene, idx) => {
          scene.backgroundPrompt = `${VALERTI_DEMO.visualBase}. ${SCENE_SUBJECTS[idx % SCENE_SUBJECTS.length]}`;
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

    // Track 2: Marketing/Growth → Growth Design (exists in DB with 6 sub-competencies)
    if (hasMarketing) {
      // Find the Growth Design competency directly from the database
      const growthComp = competencies.find(c => 
        c.name.toLowerCase().includes('growth design')
      ) || competencies.find(c => 
        c.name.toLowerCase().includes('growth')
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
          competencyName: growthComp.name,
          subIds: matchedSubs.map(s => s.id),
          scenes,
          trackId,
        });
        matchedNames.push(growthComp.name);
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
    const isPdf = file.type.includes('pdf');
    const isZip = file.type === 'application/zip' || file.type === 'application/x-zip-compressed' || file.name.toLowerCase().endsWith('.zip');
    if (!isPdf && !isZip) {
      toast.error('Please upload a PDF or ZIP file');
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);

    try {
      // Phase 0: Extract text from PDF
      toast.info('📄 Extracting document text...');
      const formDataObj = new FormData();
      formDataObj.append('file', file);

      const parseResponse = await supabase.functions.invoke('parse-document', {
        body: formDataObj,
      });

      if (!parseResponse.data?.success) {
        throw new Error(parseResponse.data?.error || 'Failed to parse document');
      }

      const extractedText = parseResponse.data.text;
      
      // Phase 1: AI Distillation Engine (Rules 1-3)
      toast.info('🧠 Distilling Technical Core & clustering Macro-Lessons...');
      
      const distillResponse = await supabase.functions.invoke('distill-document', {
        body: {
          extractedText,
          competencies: competencies.map(c => ({ name: c.name, cbe_category: c.cbe_category })),
          filename: file.name,
        },
      });

      if (distillResponse.error) {
        throw new Error(distillResponse.error.message || 'Distillation failed');
      }

      const distillData = distillResponse.data;
      
      if (!distillData?.success || !distillData?.macroLessons?.length) {
        throw new Error('AI could not identify lessons from this document');
      }

      // Notify Expert Advisor of distillation results
      if (onDistillationResult) {
        onDistillationResult({
          documentSummary: distillData.documentSummary,
          technicalCoreExtracted: distillData.technicalCoreExtracted,
          macroLessons: distillData.macroLessons,
          filename: file.name,
        });
      }

      // Phase 2: Use first macro-lesson's suggested competency for 1-1-6 Blueprint
      const firstLesson = distillData.macroLessons[0];
      const suggestedName = firstLesson.suggestedCompetency.toLowerCase();
      
      const matchedCompetency = competencies.find(c => 
        c.name.toLowerCase() === suggestedName ||
        c.name.toLowerCase().includes(suggestedName) ||
        suggestedName.includes(c.name.toLowerCase())
      ) || matchCompetencyFromPrompt(extractedText, competencies);
      
      if (!matchedCompetency) {
        toast.error('Could not map to a C-BEN competency');
        setUploadedFile(null);
        return;
      }

      // 1-1-6 Structural Enforcement (Rule 5)
      const trackId = `track-1-${Date.now()}`;
      const { matchedSubs, scenes } = populateScenesForCompetency(
        matchedCompetency.id, 
        `[${file.name}] ${firstLesson.lessonName}`, 
        trackId
      );

      // Override scene questions with AI-generated action cues if available
      if (firstLesson.actionCues && firstLesson.actionCues.length > 0) {
        scenes.forEach((scene, idx) => {
          if (firstLesson.actionCues[idx]) {
            scene.question = firstLesson.actionCues[idx];
          }
        });
      }

      const track: CompetencyTrack = {
        id: trackId,
        competencyId: matchedCompetency.id,
        competencyName: matchedCompetency.name,
        subCompetencyIds: matchedSubs.map(s => s.id),
        order: 1,
        createdAt: Date.now(),
      };

      // Build additional tracks for remaining macro-lessons
      const additionalTracks: CompetencyTrack[] = [track];
      const allScenes = [...scenes];
      const allSubIds = [...matchedSubs.map(s => s.id)];
      const allMatchedNames = [matchedCompetency.name];

      // Generate tracks for additional macro-lessons (up to 3 total)
      for (let i = 1; i < Math.min(distillData.macroLessons.length, 3); i++) {
        const lesson = distillData.macroLessons[i];
        const lessonCompName = lesson.suggestedCompetency.toLowerCase();
        const lessonComp = competencies.find(c =>
          c.name.toLowerCase() === lessonCompName ||
          c.name.toLowerCase().includes(lessonCompName) ||
          lessonCompName.includes(c.name.toLowerCase())
        );
        
        if (lessonComp && !allMatchedNames.includes(lessonComp.name)) {
          const ltId = `track-${i + 1}-${Date.now()}`;
          try {
            const { matchedSubs: lSubs, scenes: lScenes } = populateScenesForCompetency(
              lessonComp.id, `[${file.name}] ${lesson.lessonName}`, ltId
            );
            
            if (lesson.actionCues?.length) {
              lScenes.forEach((s, idx) => {
                if (lesson.actionCues[idx]) s.question = lesson.actionCues[idx];
              });
            }

            additionalTracks.push({
              id: ltId,
              competencyId: lessonComp.id,
              competencyName: lessonComp.name,
              subCompetencyIds: lSubs.map(s => s.id),
              order: i + 1,
              createdAt: Date.now(),
            });
            allScenes.push(...lScenes);
            allSubIds.push(...lSubs.map(s => s.id));
            allMatchedNames.push(lessonComp.name);
          } catch {
            // Skip if competency has no sub-competencies
          }
        }
      }

      setHasSubmittedOnce(true);
      setMatchedCompetencyNames(allMatchedNames);
      setLastAiCompetencyId(matchedCompetency.id);
      
      const lessonCount = distillData.macroLessons.length;
      toast.success(`✓ Distilled ${lessonCount} Macro-Lessons → ${allMatchedNames.join(' + ')} (${allScenes.length} scenes)`);
      
      onComplete(
        matchedCompetency.id, 
        allSubIds, 
        allScenes, 
        'upload', 
        additionalTracks, 
        `[From ${file.name}] ${distillData.documentSummary}`
      );
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to process PDF. Try entering a theme instead.');
      setUploadedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    const currentText = inputValue.trim();
    
    // v54.0: Factory Reset — empty prompt + Enter triggers global reset
    if (!currentText && onFactoryReset) {
      onFactoryReset();
      setHasSubmittedOnce(false);
      setMatchedCompetencyNames([]);
      setLastAiCompetencyId(null);
      setIsManualMode(false);
      setUploadedFile(null);
      return;
    }
    
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
      {/* Demo Mode Banner */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-xl">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/20">
          <Lightbulb className="w-4 h-4 text-amber-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            DEMO MODE: Try generating your own curriculum
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Type a brand and role below, or click a suggestion to see the AI mapping in action
          </p>
        </div>
        <Badge variant="outline" className="bg-amber-500/10 border-amber-500/30 text-amber-600 text-xs">
          Try It Out
        </Badge>
      </div>

      {/* Dynamic Status Indicator */}
      <div className="flex items-center gap-2">
        {isManualMode && (
          <Badge 
            variant="outline" 
            className="text-xs px-2 py-0.5 bg-muted border-border text-muted-foreground"
          >
            Via Manual
          </Badge>
        )}
        {hasSubmittedOnce && matchedCompetencyNames.length > 0 && (
          <span className="text-xs text-muted-foreground">
            → {matchedCompetencyNames.join(' + ')}
          </span>
        )}
      </div>

      {/* Toggle: Smart Select vs Upload Materials */}
      <div className="flex items-center gap-1 p-1 bg-muted/50 border border-border rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setHeroMode('smart')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
            heroMode === 'smart'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Smart Select
        </button>
        <button
          type="button"
          onClick={() => setHeroMode('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
            heroMode === 'upload'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Upload className="h-3.5 w-3.5" />
          Upload Materials
        </button>
      </div>

      {/* Hero Box: Smart Select (textarea) or Upload (drop zone) */}
      <div className="relative">
        {heroMode === 'smart' ? (
          <>
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
              className="w-full min-h-[234px] px-5 py-4 pb-16 text-base leading-relaxed bg-background border-2 border-border rounded-xl shadow-lg shadow-primary/5 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none transition-all duration-200 placeholder:text-muted-foreground/70 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isProcessing || isUploading}
              rows={7}
            />
            
            {/* Bottom bar: Clear left, Magic Build right */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              {/* Left: Clear Button */}
              <div>
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
              
              {/* Right: Magic Build Button */}
              <div className="flex items-center gap-2">
                {/* Hint bubble - disappears after first send */}
                {!hasSubmittedOnce && (
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-full animate-pulse">
                    <Zap className="w-3 h-3 text-primary" />
                    <span className="text-xs text-primary font-medium">Try it out!</span>
                  </div>
                )}
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isProcessing || isUploading}
                  size="sm"
                  className="gap-1.5 px-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Building...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      Magic Build
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Upload Drop Zone */
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFileUpload(file);
            }}
            onClick={handleUploadClick}
            className={`w-full min-h-[234px] flex flex-col items-center justify-center gap-4 px-5 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
              isDragOver
                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                : isUploading
                ? 'border-primary/40 bg-primary/5'
                : 'border-border bg-muted/30 hover:border-primary/40 hover:bg-muted/50'
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Processing document...</p>
                  <p className="text-xs text-muted-foreground mt-1">Extracting content & mapping competencies</p>
                </div>
              </>
            ) : uploadedFile ? (
              <>
                <FileText className="h-10 w-10 text-primary" />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">{uploadedFile.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">File uploaded successfully</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); clearUpload(); }}
                    className="mt-2 text-xs text-destructive hover:underline"
                  >
                    Remove & upload another
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-muted/70 border border-border flex items-center justify-center">
                  <Upload className="h-8 w-8 text-muted-foreground/70" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    Drop your PDF or ZIP here
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or click to browse · max 15 MB
                  </p>
                </div>
              </>
            )}
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.zip"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Ghost Text Suggestions - Clickable Quick Demos */}
      {!hasSubmittedOnce && !inputValue.trim() && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/30 border border-dashed border-border rounded-lg">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5 mr-1">
            <Lightbulb className="w-3 h-3" />
            Try:
          </span>
          {DEMO_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion.label}
              onClick={() => {
                setInputValue(suggestion.prompt);
                // Auto-focus the textarea
                textareaRef.current?.focus();
              }}
              className="text-xs px-2.5 py-1 bg-background border border-border rounded-full hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-200"
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      )}

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

      {/* Upload indicator now integrated into the upload drop zone */}


      {/* Quick Skills + Manual/Smart Toggle */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
        <span className="text-xs text-muted-foreground mr-1">Quick skills:</span>
        {['Analytical Thinking', 'Growth Design', 'Problem Solving'].map(skill => (
          <Badge
            key={skill}
            variant="outline"
            className="cursor-pointer hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-colors"
            onClick={() => {
              // For Growth Design, map to the actual competency in DB
              const searchName = skill === 'Growth Design' ? 'growth design' : skill.toLowerCase();
              const comp = competencies.find(c => 
                c.name.toLowerCase() === searchName || 
                c.name.toLowerCase().includes(searchName)
              );
              if (comp) {
                handleManualSelect(comp.id);
              } else {
                toast.error(`Competency "${skill}" not found. Run V5 Sync first.`);
              }
            }}
          >
            {skill}
          </Badge>
        ))}
        
        {/* Manual/Smart Toggle - Always visible */}
        <div className="ml-auto flex items-center gap-2">
          {isManualMode ? (
            <button
              onClick={handleSmartSelectRevert}
              className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
            >
              <Sparkles className="w-3 h-3" />
              ← Smart Select
            </button>
          ) : (
            <Select onValueChange={handleManualSelect}>
              <SelectTrigger className="h-7 text-xs w-auto gap-1 border-dashed hover:border-primary/50">
                <span className="text-muted-foreground">Manual Select →</span>
                <ChevronDown className="h-3 w-3" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {sortedCompetencies.map(comp => (
                  <SelectItem key={comp.id} value={comp.id} className="text-xs">
                    {comp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  );
}
