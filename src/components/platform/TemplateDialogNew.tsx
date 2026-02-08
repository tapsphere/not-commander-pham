import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Check, Eye, Loader2 } from 'lucide-react';
import { 
  TemplateStepIdentity,
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
import { LiveMobilePreview } from './LiveMobilePreview';

interface TemplateDialogNewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: {
    id: string;
    name: string;
    description: string | null;
    base_prompt: string | null;
  } | null;
  onSuccess: () => void;
  onTemplateCreated?: (templateData: {
    id: string;
    name: string;
    template_type: string;
    selected_sub_competencies: string[];
    custom_game_url?: string;
    game_config?: any;
    description?: string;
    base_prompt?: string;
    design_settings?: any;
  }) => void;
  demoMode?: boolean;
}

const STEPS = [
  { id: 1, title: 'Identity', description: 'Name & cover' },
  { id: 2, title: 'Framework', description: 'Competencies' },
  { id: 3, title: 'Scenes', description: 'Build content' },
  { id: 4, title: 'Brand Skin', description: 'Colors & fonts' },
];

export function TemplateDialogNew({ 
  open, 
  onOpenChange, 
  template, 
  onSuccess, 
  onTemplateCreated,
  demoMode = false 
}: TemplateDialogNewProps) {
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

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim().length > 0;
      case 2:
        return selectedSubCompetencies.length > 0;
      case 3:
        return scenes.length > 0 && scenes.every(s => s.question.trim().length > 0);
      case 4:
        return true;
      default:
        return false;
    }
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
      // Build prompt from scenes
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
        // Open preview in new window
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
        
        if (onTemplateCreated) {
          onTemplateCreated({
            id: `demo-${Date.now()}`,
            name: formData.name,
            template_type: 'ai_generated',
            selected_sub_competencies: selectedSubCompetencies,
            description: formData.description,
            base_prompt: buildPromptFromScenes(),
            design_settings: designSettings,
          });
        }
        
        toast.success('Template created!');
        onSuccess();
        onOpenChange(false);
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
        const { data: newTemplate, error } = await supabase
          .from('game_templates')
          .insert(templateData as any)
          .select()
          .single();
        
        if (error) throw error;
        
        toast.success('Template created!');
        
        if (onTemplateCreated && newTemplate) {
          onTemplateCreated({
            id: newTemplate.id,
            name: formData.name,
            template_type: 'ai_generated',
            selected_sub_competencies: selectedSubCompetencies,
            description: formData.description,
            base_prompt: buildPromptFromScenes(),
            design_settings: designSettings,
          });
        }
      }

      onSuccess();
      onOpenChange(false);
      
      // Reset state
      setFormData(DEFAULT_FORM_DATA);
      setScenes([]);
      setSelectedSubCompetencies([]);
      setSelectedCompetency('');
      setDesignSettings(DEFAULT_DESIGN_SETTINGS);
      setCurrentStep(1);
      
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
          <TemplateStepIdentity
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
        // Get competency name for global context
        const selectedComp = competencies.find(c => c.id === selectedCompetency);
        return (
          <TemplateStepSceneBuilder
            scenes={scenes}
            setScenes={setScenes}
            subCompetencies={subCompetencies}
            selectedSubCompetencies={selectedSubCompetencies}
            // Pass global context from Step 2
            industry={formData.industry}
            competencyName={selectedComp?.name}
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-background border-border p-0 overflow-hidden">
        <div className="flex h-[85vh]">
          {/* Left Panel - Form */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <DialogHeader className="px-6 py-4 border-b border-border">
              <DialogTitle className="text-foreground">
                {template ? 'Edit Template' : 'Create Validator Template'}
              </DialogTitle>
              
              {/* Step Indicator */}
              <div className="flex items-center gap-2 mt-4">
                {STEPS.map((step, idx) => (
                  <div key={step.id} className="flex items-center">
                    <button
                      onClick={() => setCurrentStep(step.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                        currentStep === step.id
                          ? 'bg-primary text-primary-foreground'
                          : currentStep > step.id
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        currentStep > step.id ? 'bg-primary text-primary-foreground' : ''
                      }`}>
                        {currentStep > step.id ? <Check className="h-3 w-3" /> : step.id}
                      </div>
                      <div className="hidden sm:block text-left">
                        <p className="text-xs font-medium">{step.title}</p>
                        <p className="text-[10px] opacity-70">{step.description}</p>
                      </div>
                    </button>
                    {idx < STEPS.length - 1 && (
                      <div className={`w-8 h-0.5 mx-1 ${
                        currentStep > step.id ? 'bg-primary' : 'bg-muted'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </DialogHeader>

            {/* Step Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {renderStepContent()}
            </div>

            {/* Footer Navigation */}
            <div className="px-6 py-4 border-t border-border flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>

              <div className="flex items-center gap-2">
                {currentStep >= 3 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreview}
                    disabled={generating || scenes.length === 0}
                  >
                    {generating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4 mr-2" />
                    )}
                    Preview
                  </Button>
                )}

                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!canProceed()}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || !canProceed()}
                    className="bg-primary text-primary-foreground"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {template ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        {template ? 'Update Template' : 'Create Template'}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Live Preview */}
          <div className="w-[320px] border-l border-border bg-muted/30 p-4 overflow-y-auto hidden lg:block">
            <LiveMobilePreview
              formData={formData}
              scenes={scenes}
              currentSceneIndex={currentSceneIndex}
              designSettings={designSettings}
              subCompetencies={subCompetencies}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
