import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Eye, Loader2, Save, Moon, Sun, X } from 'lucide-react';
import { 
  TemplateStepFramework,
  TemplateStepSceneBuilder,
  TemplateStepBrandSkin,
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
  StudioLiveMirror, 
  StudioStepperNav,
  StudioIdentityStep 
} from './studio';

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
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useStudioTheme();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<TemplateFormData>(DEFAULT_FORM_DATA);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [designSettings, setDesignSettings] = useState<DesignSettings>(DEFAULT_DESIGN_SETTINGS);
  
  // Competency state
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [subCompetencies, setSubCompetencies] = useState<SubCompetency[]>([]);
  const [selectedCompetency, setSelectedCompetency] = useState('');
  const [selectedSubCompetencies, setSelectedSubCompetencies] = useState<string[]>([]);
  
  // Scene state
  const [scenes, setScenes] = useState<SceneData[]>([]);

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

  // Update current scene index when scenes change
  useEffect(() => {
    if (currentSceneIndex >= scenes.length && scenes.length > 0) {
      setCurrentSceneIndex(scenes.length - 1);
    }
  }, [scenes.length, currentSceneIndex]);

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

  const canProceed = (step: number) => {
    switch (step) {
      case 1:
        return true; // Always can go to step 1
      case 2:
        return formData.name.trim().length > 0;
      case 3:
        return selectedSubCompetencies.length > 0;
      case 4:
        return scenes.length > 0;
      default:
        return false;
    }
  };

  const canNavigate = (targetStep: number) => {
    // Can always go back
    if (targetStep < currentStep) return true;
    // Can only go forward if all previous steps are complete
    for (let i = 1; i < targetStep; i++) {
      if (!canProceed(i + 1)) return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

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

      // Upload cover image if provided
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <StudioIdentityStep
            formData={formData}
            setFormData={setFormData}
            coverImageFile={coverImageFile}
            setCoverImageFile={setCoverImageFile}
          />
        );
      case 2:
        return (
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
        );
      case 3:
        return (
          <TemplateStepSceneBuilder
            scenes={scenes}
            setScenes={setScenes}
            subCompetencies={subCompetencies}
            selectedSubCompetencies={selectedSubCompetencies}
            currentSceneIndex={currentSceneIndex}
            setCurrentSceneIndex={setCurrentSceneIndex}
          />
        );
      case 4:
        return (
          <TemplateStepBrandSkin
            designSettings={designSettings}
            setDesignSettings={setDesignSettings}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-950' 
        : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
    }`}>
      {/* Left Panel - Editor */}
      <div className={`
        flex-1 flex flex-col overflow-hidden
        ${isDarkMode 
          ? 'bg-white/5 backdrop-blur-xl border-r border-white/10' 
          : 'bg-white/70 backdrop-blur-xl border-r border-border/50'
        }
      `}>
        {/* Studio Header */}
        <div className={`
          flex items-center justify-between px-6 py-4 
          ${isDarkMode 
            ? 'bg-white/5 border-b border-white/10' 
            : 'bg-white/50 border-b border-border/50'
          }
        `}>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={isDarkMode ? 'text-white/70 hover:text-white hover:bg-white/10' : ''}
            >
              <X className="h-4 w-4 mr-1" />
              Close
            </Button>
            <div className={`h-6 w-px ${isDarkMode ? 'bg-white/20' : 'bg-border'}`} />
            <h1 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-foreground'}`}>
              {template ? 'Edit Template' : 'Template Studio'}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className={isDarkMode ? 'text-white/70 hover:text-white hover:bg-white/10' : ''}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            {currentStep >= 3 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreview}
                disabled={generating || scenes.length === 0}
                className={isDarkMode ? 'border-white/20 text-white hover:bg-white/10' : ''}
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                Preview
              </Button>
            )}
          </div>
        </div>

        {/* Stepper Navigation */}
        <div className={`
          ${isDarkMode 
            ? 'bg-white/5 border-b border-white/10' 
            : 'bg-white/30 border-b border-border/50'
          }
        `}>
          <StudioStepperNav
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            canNavigate={canNavigate}
          />
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {renderStepContent()}
        </div>

        {/* Footer Navigation */}
        <div className={`
          px-6 py-4 flex items-center justify-between
          ${isDarkMode 
            ? 'bg-white/5 border-t border-white/10' 
            : 'bg-white/50 border-t border-border/50'
          }
        `}>
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1}
            className={isDarkMode ? 'text-white/70 hover:text-white hover:bg-white/10' : ''}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed(currentStep + 1)}
                className={isDarkMode 
                  ? 'bg-white text-black hover:bg-white/90' 
                  : 'bg-primary text-primary-foreground'
                }
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || scenes.length === 0}
                className={isDarkMode 
                  ? 'bg-white text-black hover:bg-white/90' 
                  : 'bg-primary text-primary-foreground'
                }
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Template
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Live Mirror */}
      <div className={`
        w-[380px] flex-shrink-0 overflow-hidden
        ${isDarkMode 
          ? 'bg-black/30 backdrop-blur-xl' 
          : 'bg-slate-100/80 backdrop-blur-xl'
        }
      `}>
        <StudioLiveMirror
          formData={formData}
          scenes={scenes}
          currentSceneIndex={currentSceneIndex}
          setCurrentSceneIndex={setCurrentSceneIndex}
          designSettings={designSettings}
          subCompetencies={subCompetencies}
        />
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
