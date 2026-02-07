import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Eye, Loader2, Save, Moon, Sun, X, Settings2, Layers } from 'lucide-react';
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
  StudioPropertiesSidebar,
  StudioCenterCanvas,
} from './studio';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

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
  
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showFrameworkSheet, setShowFrameworkSheet] = useState(false);
  
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

  // Theme styles
  const bgStyles = isDarkMode 
    ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' 
    : 'bg-[#F8F9FA]';
  
  const headerStyles = isDarkMode 
    ? 'bg-slate-900/80 border-b border-white/5 backdrop-blur-xl' 
    : 'bg-white/90 border-b border-slate-200 backdrop-blur-xl';
  
  const textStyles = isDarkMode ? 'text-white' : 'text-slate-900';
  const mutedStyles = isDarkMode ? 'text-white/60' : 'text-slate-600';
  
  const buttonStyles = isDarkMode 
    ? 'text-white/70 hover:text-white hover:bg-white/10' 
    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100';

  const canvasAreaStyles = isDarkMode
    ? 'bg-slate-950/50'
    : 'bg-slate-100/50';

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
          <div className={`h-5 w-px ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`} />
          <h1 className={`text-base font-semibold ${textStyles}`}>
            {template ? 'Edit Template' : 'Template Studio'}
          </h1>
          {formData.name && (
            <>
              <div className={`h-5 w-px ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`} />
              <span className={`text-sm ${mutedStyles}`}>{formData.name}</span>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Framework Configuration Sheet Trigger */}
          <Sheet open={showFrameworkSheet} onOpenChange={setShowFrameworkSheet}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={buttonStyles}
              >
                <Layers className="h-4 w-4 mr-2" />
                Framework
                {selectedSubCompetencies.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                    {selectedSubCompetencies.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[500px] sm:w-[600px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Logic Framework Configuration</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
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
            </SheetContent>
          </Sheet>

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
            className={isDarkMode 
              ? 'border-white/20 text-white hover:bg-white/10' 
              : 'border-slate-300 text-slate-700 hover:bg-slate-100'
            }
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
            className={isDarkMode 
              ? 'bg-white text-slate-900 hover:bg-white/90' 
              : 'bg-slate-900 text-white hover:bg-slate-800'
            }
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

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Center Canvas Area */}
        <div className={`flex-1 flex flex-col ${canvasAreaStyles}`}>
          {/* Canvas */}
          <div className="flex-1 overflow-hidden">
            <StudioCenterCanvas
              currentSceneIndex={currentSceneIndex}
              formData={formData}
              scenes={scenes}
              designSettings={designSettings}
              subCompetencies={subCompetencies}
              mascotFile={mascotFile}
              logoFile={logoFile}
            />
          </div>

          {/* Bottom Filmstrip */}
          <StudioFilmstrip
            currentSceneIndex={currentSceneIndex}
            setCurrentSceneIndex={setCurrentSceneIndex}
            scenes={scenes}
            subCompetencies={subCompetencies}
            designSettings={designSettings}
          />
        </div>

        {/* Right Properties Sidebar */}
        <div className="w-80 flex-shrink-0">
          <StudioPropertiesSidebar
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
