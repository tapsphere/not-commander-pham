import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Eye, Loader2, Save, Moon, Sun, X } from 'lucide-react';
import { 
  TemplateStepFramework,
  TemplateFormData,
  SceneData,
  DesignSettings,
  Competency,
  SubCompetency,
  DEFAULT_FORM_DATA,
  DEFAULT_DESIGN_SETTINGS,
} from './template-steps';
import { 
  StudioThemeProvider, 
  useStudioTheme, 
  StudioFilmstrip,
  StudioTrackRail,
  StudioPropertiesSidebar,
  StudioCenterCanvas,
  StudioNavigator,
} from './studio';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  
  // Form state
  const [formData, setFormData] = useState<TemplateFormData>(DEFAULT_FORM_DATA);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [designSettings, setDesignSettings] = useState<DesignSettings>(DEFAULT_DESIGN_SETTINGS);
  
  // Brand assets
  const [mascotFile, setMascotFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  // Competency state
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [subCompetencies, setSubCompetencies] = useState<SubCompetency[]>([]);
  const [selectedCompetency, setSelectedCompetency] = useState('');
  const [selectedSubCompetencies, setSelectedSubCompetencies] = useState<string[]>([]);
  
  // Scene state
  const [scenes, setScenes] = useState<SceneData[]>([]);

  // Calculate completed steps
  const completedSteps = useMemo(() => {
    const completed: number[] = [];
    if (logoFile || designSettings.primary !== DEFAULT_DESIGN_SETTINGS.primary) completed.push(1);
    if (formData.name.trim()) completed.push(2);
    if (selectedSubCompetencies.length > 0) completed.push(3);
    if (scenes.length > 0 && scenes.some(s => s.question.trim())) completed.push(4);
    return completed;
  }, [logoFile, designSettings.primary, formData.name, selectedSubCompetencies.length, scenes]);

  // Fetch competencies on mount
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
    
    fetchCompetencies();
  }, []);

  // Fetch sub-competencies when competency changes
  useEffect(() => {
    if (!selectedCompetency) {
      setSubCompetencies([]);
      setSelectedSubCompetencies([]);
      setScenes([]);
      return;
    }

    const fetchSubCompetencies = async () => {
      const { data, error } = await supabase
        .from('sub_competencies')
        .select('*')
        .eq('competency_id', selectedCompetency)
        .order('display_order', { nullsFirst: false });
      
      if (!error && data) {
        setSubCompetencies(data);
      }
    };
    
    fetchSubCompetencies();
  }, [selectedCompetency]);

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
    <div className={`fixed inset-0 z-50 flex flex-col ${bgStyles}`}>
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
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigator Pane */}
        <div className={`w-56 flex-shrink-0 ${leftPanelStyles}`}>
          <StudioNavigator
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            completedSteps={completedSteps}
          />
        </div>

        {/* Center Area: Canvas + Filmstrip (or Framework config) */}
        <div className={`flex-1 flex flex-col ${canvasAreaStyles}`}>
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
                />
              </div>
            </ScrollArea>
          ) : (
            <>
              {/* Center Canvas */}
              <div className="flex-1 overflow-hidden">
                <StudioCenterCanvas
                  currentSceneIndex={currentStep === 4 ? currentSceneIndex : 0}
                  formData={formData}
                  scenes={scenes}
                  designSettings={designSettings}
                  subCompetencies={subCompetencies}
                  mascotFile={mascotFile}
                  logoFile={logoFile}
                />
              </div>

              {/* Bottom Track Rail - show on Scenes step */}
              {currentStep === 4 && (
                <StudioTrackRail
                  currentSceneIndex={currentSceneIndex}
                  setCurrentSceneIndex={setCurrentSceneIndex}
                  scenes={scenes}
                  setScenes={setScenes}
                  subCompetencies={subCompetencies}
                  designSettings={designSettings}
                />
              )}
            </>
          )}
        </div>

        {/* Right Properties Sidebar - Expandable */}
        <div 
          className={`flex-shrink-0 transition-all duration-300 ease-out ${
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
