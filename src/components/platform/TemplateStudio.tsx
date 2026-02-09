import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Eye, Loader2, Save, Moon, Sun, X, Code2, PanelLeftClose, PanelLeft, Cloud, ExternalLink } from 'lucide-react';
import { 
  TemplateStepFramework,
  TemplateFormData,
  SceneData,
  DesignSettings,
  Competency,
  SubCompetency,
  CompetencyTrack,
  DEFAULT_FORM_DATA,
  DEFAULT_DESIGN_SETTINGS,
} from './template-steps';
import type { DemoOverrideData } from './template-steps';
import { 
  StudioThemeProvider, 
  useStudioTheme, 
  StudioFilmstrip,
  StudioTrackRail,
  StudioPropertiesSidebar,
  StudioCenterCanvas,
  StudioNavigator,
  StudioLiveCodeEditor,
  CurriculumMapTab,
  AddTrackNudge,
  GlobalSceneStyler,
} from './studio';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TemplateStudioProps {
  template?: {
    id: string;
    name: string;
    description: string | null;
    base_prompt: string | null;
  } | null;
  onSuccess: () => void;
  onClose: () => void;
  demoMode?: boolean;
}

function StudioContent({ 
  template, 
  onSuccess, 
  onClose,
  demoMode = false 
}: TemplateStudioProps) {
  const { isDarkMode, toggleTheme } = useStudioTheme();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [telegramPreviewEnabled, setTelegramPreviewEnabled] = useState(true); // Default to TMA view
  const [codeEditorOpen, setCodeEditorOpen] = useState(false); // Split-view code editor
  const [isPublishing, setIsPublishing] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'properties' | 'curriculum'>('properties');
  
  // Form state
  const [formData, setFormData] = useState<TemplateFormData>(DEFAULT_FORM_DATA);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [designSettings, setDesignSettings] = useState<DesignSettings>(DEFAULT_DESIGN_SETTINGS);
  
  // Brand assets
  const [mascotFile, setMascotFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null); // v31.0: URL-based logo for demo injection
  
  // Competency state
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [subCompetencies, setSubCompetencies] = useState<SubCompetency[]>([]);
  const [selectedCompetency, setSelectedCompetency] = useState('');
  const [selectedSubCompetencies, setSelectedSubCompetencies] = useState<string[]>([]);
  
  // Scene state
  const [scenes, setScenes] = useState<SceneData[]>([]);
  
  // Multi-track curriculum state
  const [tracks, setTracks] = useState<CompetencyTrack[]>([]);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [promptContext, setPromptContext] = useState<string>('');
  const [demoOverrideApplied, setDemoOverrideApplied] = useState(false);
  const [globalStylePrompt, setGlobalStylePrompt] = useState(
    'Cinematic 35mm luxury boutique, Amber Haze lighting, warm depth-of-field backgrounds.'
  );

  // Demo Override Handler v31.0 - Silently injects VALERTI template data into Step 1 & 2
  const handleDemoOverride = (data: DemoOverrideData) => {
    // Prevent re-override if user has manually edited after initial override
    if (demoOverrideApplied) return;
    
    // Override Step 1: Brand colors (silently)
    setDesignSettings(prev => ({
      ...prev,
      primary: data.colors.primary,
      secondary: data.colors.secondary,
      accent: data.colors.accent,
      background: data.colors.background,
      highlight: data.colors.highlight,
      text: data.colors.text,
    }));
    
    // Override Step 1: Logo URL (silently - as if AI "found" it)
    if (data.logoUrl) {
      setLogoUrl(data.logoUrl);
    }
    
    // Override Step 2: Info fields (silently)
    setFormData(prev => ({
      ...prev,
      name: data.name,
      description: data.description,
      roleScenario: data.roleScenario,
      industry: data.industry,
      keyElement: data.keyElement,
    }));
    
    // Mark demo override as applied (prevents re-triggering)
    setDemoOverrideApplied(true);
    
    // Set global style prompt with VALERTI brand references
    setGlobalStylePrompt(
      `Cinematic 35mm luxury boutique, Amber Haze lighting, ${data.name} Green (${data.colors.primary}) and Red (${data.colors.secondary}) accents.`
    );
    
    // v31.0: Silent injection - no toast shown, user discovers it naturally when navigating
    console.log('✨ VALERTI Demo Template silently injected into Steps 1 & 2');
  };

  // Calculate completed steps
  const completedSteps = useMemo(() => {
    const completed: number[] = [];
    if (logoFile || designSettings.primary !== DEFAULT_DESIGN_SETTINGS.primary) completed.push(1);
    if (formData.name.trim()) completed.push(2);
    if (selectedSubCompetencies.length > 0) completed.push(3);
    if (scenes.length > 0 && scenes.some(s => s.question.trim())) completed.push(4);
    return completed;
  }, [logoFile, designSettings.primary, formData.name, selectedSubCompetencies.length, scenes]);

  // Calculate total scenes including all tracks
  const totalScenesCount = useMemo(() => {
    // Intro (1) + gameplay scenes + Results (1)
    const gameplayScenes = tracks.length > 0 ? tracks.length * 6 : Math.min(scenes.length, 6);
    return 1 + gameplayScenes + 1;
  }, [tracks.length, scenes.length]);

  // Check if current scene is the last gameplay scene of a track (for nudge)
  const isLastSceneOfTrack = useMemo(() => {
    if (tracks.length === 0) {
      return currentSceneIndex === 6 && scenes.length === 6;
    }
    // For multi-track, check if we're on the last scene of any track
    const currentTrack = tracks.find(t => {
      const trackScenes = scenes.filter(s => s.trackId === t.id);
      return trackScenes.length === 6;
    });
    return currentTrack && 
      scenes.filter(s => s.trackId === currentTrack.id).length === 6 &&
      currentSceneIndex === (tracks.indexOf(currentTrack) + 1) * 6;
  }, [currentSceneIndex, scenes, tracks]);

  // Get current track info for nudge
  const currentTrackInfo = useMemo(() => {
    if (tracks.length === 0 && selectedCompetency) {
      const comp = competencies.find(c => c.id === selectedCompetency);
      return { number: 1, name: comp?.name || 'Competency' };
    }
    const trackIndex = Math.floor((currentSceneIndex - 1) / 6);
    const track = tracks[trackIndex];
    return track ? { number: trackIndex + 1, name: track.competencyName } : null;
  }, [currentSceneIndex, tracks, selectedCompetency, competencies]);

  // Fetch competencies and ALL sub-competencies on mount
  useEffect(() => {
    const fetchCompetencies = async () => {
      const { data, error } = await supabase
        .from('master_competencies')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (!error && data) {
        setCompetencies(data);
      }
    };
    
    // Fetch ALL sub-competencies upfront for the UnifiedCreativeInput Smart Reveal
    const fetchAllSubCompetencies = async () => {
      const { data, error } = await supabase
        .from('sub_competencies')
        .select('*')
        .order('display_order', { nullsFirst: false });
      
      if (!error && data) {
        setSubCompetencies(data);
      }
    };
    
    fetchCompetencies();
    fetchAllSubCompetencies();
  }, []);

  // Filter sub-competencies when competency selection changes (for display purposes)
  const filteredSubCompetencies = useMemo(() => {
    if (!selectedCompetency) return [];
    return subCompetencies.filter(s => s.competency_id === selectedCompetency);
  }, [selectedCompetency, subCompetencies]);

  // Initialize with template data if editing
  useEffect(() => {
    if (template) {
      setFormData(prev => ({
        ...prev,
        name: template.name || '',
        description: template.description || '',
      }));
    }
  }, [template]);

  // When step changes to Scenes, show filmstrip
  useEffect(() => {
    if (currentStep === 4) {
      setCurrentSceneIndex(0);
    }
  }, [currentStep]);

  const handlePreview = async () => {
    setGenerating(true);
    try {
      const prompt = buildPromptFromScenes();
      
      if (demoMode) {
        toast.success('Demo preview would open here! 🎮');
        return;
      }

      const response = await supabase.functions.invoke('generate-game', {
        body: {
          templatePrompt: prompt,
          primaryColor: designSettings.primary,
          secondaryColor: designSettings.secondary,
          previewMode: true,
          subCompetencies: selectedSubCompetencies.map(id => 
            subCompetencies.find(s => s.id === id)
          ).filter(Boolean),
        }
      });

      if (response.error) throw new Error(response.error.message);
      
      if (response.data?.html || response.data?.generatedHtml) {
        const html = response.data.html || response.data.generatedHtml;
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        toast.success('Preview generated! 🎮');
      }
    } catch (error: any) {
      toast.error('Preview failed: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const buildPromptFromScenes = () => {
    const sceneDescriptions = scenes.map((scene, idx) => {
      const sub = subCompetencies.find(s => s.id === scene.subCompetencyId);
      const correctChoices = scene.choices.filter(c => c.isCorrect).map(c => c.text);
      const incorrectChoices = scene.choices.filter(c => !c.isCorrect).map(c => c.text);
      
      return `
Scene ${idx + 1} (${scene.timeLimit}s):
- Action Cue: ${sub?.action_cue || 'Not specified'}
- Mechanic: ${sub?.game_mechanic || 'Not specified'}
- Question: ${scene.question}
- Correct Answers: ${correctChoices.join(', ')}
- Incorrect Answers: ${incorrectChoices.join(', ')}`;
    }).join('\n');

    return `
Template: ${formData.name}
Description: ${formData.description}

Design:
- Primary Color: ${designSettings.primary}
- Secondary Color: ${designSettings.secondary}
- Font: ${designSettings.font}

Scenes:
${sceneDescriptions}

Generate a mobile-first Telegram Mini App game implementing these scenes.
    `.trim();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (demoMode) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Template created!');
        onSuccess();
        onClose();
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let coverImageUrl = null;
      if (coverImageFile) {
        const fileExt = coverImageFile.name.split('.').pop();
        const fileName = `${user.id}/cover-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('validator-previews')
          .upload(fileName, coverImageFile);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('validator-previews')
            .getPublicUrl(fileName);
          coverImageUrl = publicUrl;
        }
      }

      const templateData = {
        creator_id: user.id,
        name: formData.name,
        description: formData.description,
        base_prompt: buildPromptFromScenes(),
        template_type: 'ai_generated',
        preview_image: coverImageUrl,
        competency_id: selectedCompetency || null,
        selected_sub_competencies: selectedSubCompetencies,
        design_settings: designSettings as any,
        game_config: {
          scenes: scenes.map(s => ({
            question: s.question,
            choices: s.choices,
            timeLimit: s.timeLimit,
            subCompetencyId: s.subCompetencyId,
          })),
        },
        is_published: false,
      };

      if (template?.id) {
        const { error } = await supabase
          .from('game_templates')
          .update(templateData as any)
          .eq('id', template.id);
        
        if (error) throw error;
        toast.success('Template updated!');
      } else {
        const { error } = await supabase
          .from('game_templates')
          .insert(templateData as any)
          .select()
          .single();
        
        if (error) throw error;
        toast.success('Template created!');
      }

      onSuccess();
      onClose();
      
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Theme styles using semantic tokens
  const bgStyles = 'bg-background';
  
  const headerStyles = 'bg-card/95 border-b border-border backdrop-blur-xl';
  
  const textStyles = 'text-foreground';
  const mutedStyles = 'text-muted-foreground';
  
  const buttonStyles = 'text-muted-foreground hover:text-foreground hover:bg-accent';

  const canvasAreaStyles = 'bg-muted/30';

  const leftPanelStyles = 'bg-card border-r border-border';

  return (
    <div className={`fixed inset-0 z-50 flex flex-col overflow-hidden ${bgStyles}`}>
      {/* Top Header Bar */}
      <div className={`flex items-center justify-between px-4 py-3 ${headerStyles}`}>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className={buttonStyles}
          >
            <X className="h-4 w-4 mr-1" />
            Close
          </Button>
          <div className="h-5 w-px bg-border" />
          <h1 className={`text-base font-semibold ${textStyles}`}>
            {template ? 'Edit Template' : 'Template Studio'}
          </h1>
          {formData.name && (
            <>
              <div className="h-5 w-px bg-border" />
              <span className={`text-sm ${mutedStyles}`}>{formData.name}</span>
            </>
          )}
        </div>
        
<div className="flex items-center gap-2">
          {/* Open Code Button */}
          <Button
            variant={codeEditorOpen ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setCodeEditorOpen(!codeEditorOpen)}
            className={codeEditorOpen ? "bg-primary/10 text-primary" : buttonStyles}
          >
            <Code2 className="h-4 w-4 mr-2" />
            {codeEditorOpen ? 'Close Code' : 'Open Code'}
          </Button>
          
          <div className="h-5 w-px bg-border" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className={buttonStyles}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreview}
            disabled={generating || scenes.length === 0}
            className="border-border text-foreground hover:bg-accent"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            Preview
          </Button>

          {/* Publish to Cloud Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsPublishing(true);
              // Simulate publish to cloud
              setTimeout(() => {
                const gameId = `${formData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`;
                const publishUrl = `playops.ai/${gameId}`;
                navigator.clipboard.writeText(`https://${publishUrl}`);
                toast.success(
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold">Published to Cloud!</span>
                    <span className="text-xs text-muted-foreground">URL copied: {publishUrl}</span>
                  </div>
                );
                setIsPublishing(false);
              }, 1500);
            }}
            disabled={isPublishing || !formData.name.trim()}
            className="border-primary/50 text-primary hover:bg-primary/10"
          >
            {isPublishing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Cloud className="h-4 w-4 mr-2" />
            )}
            Publish
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.name.trim()}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* Main 3-Pane Layout */}
      <div className="flex-1 flex min-w-0 overflow-hidden">
        {/* Left Navigator Pane */}
        <div className={`w-56 flex-shrink-0 ${leftPanelStyles}`}>
          <StudioNavigator
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            completedSteps={completedSteps}
          />
        </div>

        {/* Center Area: Canvas + Filmstrip (or Framework config) */}
        <div className={`flex-1 flex flex-col min-w-0 ${canvasAreaStyles}`}>
          {currentStep === 3 ? (
            // Framework configuration takes full center when on step 3
            <ScrollArea className="flex-1">
              <div className="p-6 max-w-3xl mx-auto">
                <TemplateStepFramework
                  competencies={competencies}
                  subCompetencies={subCompetencies}
                  selectedCompetency={selectedCompetency}
                  setSelectedCompetency={setSelectedCompetency}
                  selectedSubCompetencies={selectedSubCompetencies}
                  setSelectedSubCompetencies={setSelectedSubCompetencies}
                  scenes={scenes}
                  setScenes={setScenes}
                  tracks={tracks}
                  setTracks={setTracks}
                  onAddTrack={() => {
                    // Switch to step 3 if not already there
                    if (currentStep !== 3) setCurrentStep(3);
                  }}
                  onPromptChange={setPromptContext}
                  onDemoOverride={handleDemoOverride}
                />
              </div>
            </ScrollArea>
          ) : (
            <>
              {/* Global Scene Styler - shown on Step 4 */}
              {currentStep === 4 && (
                <GlobalSceneStyler
                  globalStylePrompt={globalStylePrompt}
                  onGlobalStyleChange={setGlobalStylePrompt}
                  onApplyToAllScenes={() => {
                    // Clear all per-scene overrides so they inherit global
                    setScenes(scenes.map(s => ({ ...s, backgroundPrompt: '' })));
                    toast.success('Global style applied to all scenes');
                  }}
                  scenes={scenes}
                  designSettings={designSettings}
                  brandName={formData.name || undefined}
                />
              )}
              {/* Split-View: Code Editor (Left) + Preview (Right) when code editor is open */}
              {codeEditorOpen ? (
                <div className="flex-1 flex overflow-hidden">
                  {/* Left: Live Code Editor (50%) */}
                  <div className="w-1/2 border-r border-border overflow-hidden">
                    <StudioLiveCodeEditor
                      formData={formData}
                      setFormData={setFormData}
                      scenes={scenes}
                      setScenes={setScenes}
                      designSettings={designSettings}
                      setDesignSettings={setDesignSettings}
                      currentSceneIndex={currentStep === 4 ? currentSceneIndex : 0}
                      subCompetencies={subCompetencies}
                    />
                  </div>
                  
                  {/* Right: Telegram Mobile Preview (50%) */}
                  <div className="w-1/2 overflow-hidden">
                    <StudioCenterCanvas
                      currentSceneIndex={currentStep === 4 ? currentSceneIndex : 0}
                      formData={formData}
                      scenes={scenes}
                      designSettings={designSettings}
                      subCompetencies={subCompetencies}
                      mascotFile={mascotFile}
                      logoFile={logoFile}
                      telegramPreviewEnabled={telegramPreviewEnabled}
                      onTelegramPreviewToggle={() => setTelegramPreviewEnabled(!telegramPreviewEnabled)}
                    />
                  </div>
                </div>
              ) : (
                <>
                  {/* Center Canvas (Normal View) */}
                  <div className="flex-1 overflow-hidden">
                    <StudioCenterCanvas
                      currentSceneIndex={currentStep === 4 ? currentSceneIndex : 0}
                      formData={formData}
                      scenes={scenes}
                      designSettings={designSettings}
                      subCompetencies={subCompetencies}
                      mascotFile={mascotFile}
                      logoFile={logoFile}
                      telegramPreviewEnabled={telegramPreviewEnabled}
                      onTelegramPreviewToggle={() => setTelegramPreviewEnabled(!telegramPreviewEnabled)}
                    />
                  </div>
                </>
              )}

              {/* Bottom Track Rail - show on Scenes step */}
              {currentStep === 4 && (
                <StudioTrackRail
                  currentSceneIndex={currentSceneIndex}
                  setCurrentSceneIndex={setCurrentSceneIndex}
                  scenes={scenes}
                  setScenes={setScenes}
                  subCompetencies={subCompetencies}
                  designSettings={designSettings}
                  tracks={tracks}
                  onScrollToTrack={(trackId) => setActiveTrackId(trackId)}
                />
              )}
            </>
          )}
        </div>

        {/* Right Properties Sidebar - Expandable */}
        <div 
          className={`flex-shrink-0 transition-all duration-300 ease-out relative h-full overflow-hidden ${
            sidebarExpanded ? 'w-[560px]' : 'w-80'
          }`}
        >
          <StudioPropertiesSidebar
            currentStep={currentStep}
            currentSceneIndex={currentSceneIndex}
            scenes={scenes}
            setScenes={setScenes}
            subCompetencies={subCompetencies}
            designSettings={designSettings}
            setDesignSettings={setDesignSettings}
            formData={formData}
            setFormData={setFormData}
            logoFile={logoFile}
            setLogoFile={setLogoFile}
            logoUrl={logoUrl}
            mascotFile={mascotFile}
            setMascotFile={setMascotFile}
            isExpanded={sidebarExpanded}
            onToggleExpand={() => setSidebarExpanded(!sidebarExpanded)}
            onApplyToAllScenes={(newSettings) => {
              // Apply design settings globally - this syncs the brand look across all scenes
              setDesignSettings(newSettings);
              // Update CSS variables for immediate visual feedback
              document.documentElement.style.setProperty('--brand-primary', newSettings.primary);
              document.documentElement.style.setProperty('--brand-secondary', newSettings.secondary);
              document.documentElement.style.setProperty('--brand-background', newSettings.background);
            }}
            // Multi-track curriculum props
            tracks={tracks}
            activeTrackId={activeTrackId}
            onTrackClick={(trackId, sceneIndex) => {
              setActiveTrackId(trackId);
              setCurrentSceneIndex(sceneIndex);
              setCurrentStep(4); // Switch to scenes step
            }}
            onRemoveTrack={(trackId) => {
              const track = tracks.find(t => t.id === trackId);
              if (!track) return;
              // Remove all scenes associated with this track
              setScenes(scenes.filter(s => s.trackId !== trackId));
              setSelectedSubCompetencies(
                selectedSubCompetencies.filter(id => !track.subCompetencyIds.includes(id))
              );
              setTracks(tracks.filter(t => t.id !== trackId).map((t, i) => ({ ...t, order: i + 1 })));
            }}
            onAddTrack={() => {
              setCurrentStep(3); // Go to framework step to add new track
            }}
            showTrackNudge={isLastSceneOfTrack}
            currentTrackInfo={currentTrackInfo}
            promptContext={promptContext}
            onNavigateToStep={(step) => setCurrentStep(step)}
            globalStylePrompt={globalStylePrompt}
          />
        </div>
      </div>
    </div>
  );
}

export function TemplateStudio(props: TemplateStudioProps) {
  return (
    <StudioThemeProvider>
      <StudioContent {...props} />
    </StudioThemeProvider>
  );
}
