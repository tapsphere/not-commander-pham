import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Eye, Edit, Trash2, EyeOff, Layers, TestTube, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { TemplateStudio } from '@/components/platform/TemplateStudio';
import { CompetenciesDialog } from '@/components/platform/CompetenciesDialog';
import { ValidatorTestWizard } from '@/components/platform/ValidatorTestWizard';
import { PostTestActions } from '@/components/platform/PostTestActions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';

type Template = {
  id: string;
  name: string;
  description: string;
  base_prompt: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  preview_image?: string;
  template_type: string;
  custom_game_url?: string;
  selected_sub_competencies?: string[];
  creator_name?: string;
  creator_avatar?: string;
};

type TestResult = {
  template_id: string;
  overall_status: string;
  approved_for_publish: boolean;
};

export default function CreatorDashboard() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [testResults, setTestResults] = useState<Map<string, TestResult>>(new Map());
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [competenciesDialogOpen, setCompetenciesDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [testWizardOpen, setTestWizardOpen] = useState(false);
  const [postTestActionsOpen, setPostTestActionsOpen] = useState(false);
  const [testingTemplate, setTestingTemplate] = useState<{ 
    id: string; 
    name: string; 
    template_type: string;
    selected_sub_competencies: string[];
    custom_game_url?: string;
    game_config?: any;
    description?: string;
    base_prompt?: string;
    design_settings?: any;
  } | null>(null);
  const [subCompetencies, setSubCompetencies] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    const ensureCreatorRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Ensure current user has creator role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: user.id, role: 'creator' })
          .select()
          .maybeSingle();
        
        if (error && !error.message.includes('duplicate')) {
          console.error('Error assigning creator role:', error);
        }
      }
    };
    
    ensureCreatorRole();
    loadTemplates();
    loadSubCompetencies();
  }, []);

  const loadSubCompetencies = async () => {
    try {
      const { data, error } = await supabase
        .from('sub_competencies')
        .select('*');
      
      if (error) throw error;
      
      const subMap = new Map(data?.map(s => [s.id, s]) || []);
      setSubCompetencies(subMap);
    } catch (error: any) {
      console.error('Failed to load sub-competencies:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user's profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, company_logo_url')
        .eq('user_id', user.id)
        .maybeSingle();

      const { data, error } = await supabase
        .from('game_templates')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false});

      if (error) throw error;
      
      // Generate default covers for templates without preview images or old generic ones
      const oldGenericCovers = [
        'budget-allocation.jpg',
        'crisis-communication.jpg',
        'data-pattern-detective.jpg',
        'narrative-builder.jpg'
      ];
      
      const templatesWithCovers = await Promise.all(
        (data || []).map(async (template) => {
          // Check if this is an old generic cover that should be replaced
          const isOldGenericCover = template.preview_image && 
            oldGenericCovers.some(oldCover => template.preview_image?.includes(oldCover));
          
          // If template has a custom preview image (not old generic), keep it
          if (template.preview_image && !isOldGenericCover) {
            return {
              ...template,
              creator_name: profile?.full_name || 'You',
              creator_avatar: profile?.avatar_url
            };
          }

          // Generate default cover (use avatar for creators, not company logo)
          try {
            const { generateDefaultCover } = await import('@/utils/generateDefaultCover');
            const coverBlob = await generateDefaultCover(
              profile?.full_name || 'Creator',
              undefined, // Don't use company logo for creator covers
              profile?.avatar_url || undefined
            );

            const fileName = `${user.id}/default-cover-${template.id}.png`;
            const { error: uploadError } = await supabase.storage
              .from('validator-previews')
              .upload(fileName, coverBlob, { upsert: true });

            if (!uploadError) {
              const { data: { publicUrl } } = supabase.storage
                .from('validator-previews')
                .getPublicUrl(fileName);

              // Update template with new cover
              await supabase
                .from('game_templates')
                .update({ preview_image: publicUrl })
                .eq('id', template.id);

              return {
                ...template,
                preview_image: publicUrl,
                creator_name: profile?.full_name || 'You',
                creator_avatar: profile?.avatar_url
              };
            }
          } catch (err) {
            console.error('Failed to generate cover for template:', template.id, err);
          }

          // If generation failed, return template as-is
          return {
            ...template,
            creator_name: profile?.full_name || 'You',
            creator_avatar: profile?.avatar_url
          };
        })
      );
      
      setTemplates(templatesWithCovers);

      // Fetch test results for all templates
      const { data: results, error: resultsError } = await supabase
        .from('validator_test_results')
        .select('template_id, overall_status, approved_for_publish');

      if (resultsError) throw resultsError;

      const resultsMap = new Map(results?.map(r => [r.template_id, r]) || []);
      setTestResults(resultsMap);
    } catch (error: any) {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewGame = async (template: Template) => {
    if (template.template_type === 'custom_upload' && template.custom_game_url) {
      // Open custom game in new tab
      window.open(template.custom_game_url, '_blank');
    } else {
      // For AI generated, get design settings (per-game or profile default) and generate preview
      try {
        toast.info('Generating game preview...');
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error('Please log in to preview games');
          return;
        }

        // First check if this game has custom design settings
        let designPalette: any = null;
        let avatarUrl: string | null = null;
        let particleEffect: string = 'sparkles';
        let mascotAnimationType: string = 'static';
        
        if ((template as any).design_settings) {
          designPalette = (template as any).design_settings;
          avatarUrl = designPalette.avatar || null;
          particleEffect = designPalette.particleEffect || 'sparkles';
          mascotAnimationType = designPalette.mascotAnimationType || 'static';
          console.log('Using per-game design settings');
        } else {
          // Fall back to creator's default palette
          const { data: profile } = await supabase
            .from('profiles')
            .select('design_palette, game_avatar_url, default_particle_effect, mascot_animation_type')
            .eq('user_id', user.id)
            .maybeSingle();
          
          const palette = profile?.design_palette as any;
          designPalette = palette || {
            primary: '#C8DBDB',
            secondary: '#6C8FA4',
            accent: '#2D5556',
            background: '#F5EDD3',
            highlight: '#F0C7A0',
            text: '#2D5556',
            font: 'Inter, sans-serif'
          };
          avatarUrl = profile?.game_avatar_url || null;
          particleEffect = profile?.default_particle_effect || 'sparkles';
          mascotAnimationType = profile?.mascot_animation_type || 'static';
          console.log('Using creator default design settings');
        }
        
        // Fetch sub-competency data
        const subCompIds = template.selected_sub_competencies || [];
        const { data: subComps } = await supabase
          .from('sub_competencies')
          .select('*')
          .in('id', subCompIds);
        
        const { data: response, error } = await supabase.functions.invoke('generate-game', {
          body: {
            templatePrompt: template.base_prompt,
            primaryColor: designPalette.primary,
            secondaryColor: designPalette.secondary,
            accentColor: designPalette.accent,
            backgroundColor: designPalette.background,
            highlightColor: designPalette.highlight,
            textColor: designPalette.text,
            fontFamily: designPalette.font,
            particleEffect: particleEffect,
            logoUrl: null,
            customizationId: null,
            previewMode: true,
            subCompetencies: subComps || []
          }
        });

        console.log('Generate game response:', response);

        if (error) {
          console.error('Generate game error:', error);
          throw error;
        }

        if (!response || !response.html) {
          throw new Error('No HTML received from game generator');
        }

        // Open the generated HTML in a new window with mobile viewport
        const gameWindow = window.open('', '_blank');
        if (gameWindow) {
          gameWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                <style>
                  body {
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    min-height: 100vh;
                    background: #1a1a1a;
                  }
                  .mobile-container {
                    width: 100%;
                    max-width: 430px;
                    min-height: 100vh;
                    background: white;
                    box-shadow: 0 0 50px rgba(0,0,0,0.5);
                  }
                  @media (max-width: 430px) {
                    .mobile-container {
                      box-shadow: none;
                    }
                  }
                </style>
              </head>
              <body>
                <div class="mobile-container">
                  ${response.html}
                </div>
              </body>
            </html>
          `);
          gameWindow.document.close();
          toast.success('Game preview opened!');
        } else {
          toast.error('Please allow pop-ups to preview games');
        }
      } catch (error: any) {
        console.error('Preview error:', error);
        toast.error(error.message || 'Failed to generate preview');
      }
    }
  };

  const handleEdit = (template: Template) => {
    setSelectedTemplate(template);
    setDialogOpen(true);
  };

  const handleManageCompetencies = (template: Template) => {
    setSelectedTemplate(template);
    setCompetenciesDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template? This cannot be undone.')) return;

    try {
      console.log('Attempting to delete template:', id);
      
      const { error } = await supabase
        .from('game_templates')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }
      
      console.log('Template deleted successfully');
      toast.success('Template deleted successfully');
      loadTemplates();
    } catch (error: any) {
      console.error('Delete failed:', error);
      toast.error(error.message || 'Failed to delete template');
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      // Check if trying to publish (not unpublish)
      if (!currentStatus) {
        const testResult = testResults.get(id);
        
        // Block publishing if not tested or not passed
        if (!testResult || testResult.overall_status !== 'passed' || !testResult.approved_for_publish) {
          toast.error('Cannot publish: Validator must pass all tests and be approved first', {
            description: 'Go to Test Validators to complete testing'
          });
          return;
        }
      }

      if (currentStatus) {
        // Unpublishing - just update the status
        const { error } = await supabase
          .from('game_templates')
          .update({ is_published: false })
          .eq('id', id);

        if (error) throw error;
        toast.success('Unpublished from marketplace');
      } else {
        // Publishing - call edge function to create training/testing modes
        const { data, error } = await supabase.functions.invoke('publish-template', {
          body: { template_id: id }
        });

        if (error) throw error;
        
        toast.success(`Published! Created ${data?.runtimes?.length || 2} game modes (Training + Testing)`);
      }
      
      loadTemplates();
    } catch (error: any) {
      toast.error('Failed to update template');
    }
  };

  const canPublish = (templateId: string) => {
    const testResult = testResults.get(templateId);
    return testResult?.overall_status === 'passed' && testResult?.approved_for_publish;
  };

  const handleTemplateCreated = (templateData: {
    id: string;
    name: string;
    template_type: string;
    selected_sub_competencies: string[];
    custom_game_url?: string;
    game_config?: any;
    description?: string;
    base_prompt?: string;
    design_settings?: any;
  }) => {
    setTestingTemplate(templateData);
    setDialogOpen(false);
    setTestWizardOpen(true);
  };

  const handleTestComplete = () => {
    setTestWizardOpen(false);
    setPostTestActionsOpen(true);
  };

  const handlePublish = async () => {
    if (!testingTemplate) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('publish-template', {
        body: { template_id: testingTemplate.id }
      });

      if (error) throw error;
      
      toast.success(`Published! Created ${data?.runtimes?.length || 2} game modes (Training + Testing)`);
      setPostTestActionsOpen(false);
      setTestingTemplate(null);
      loadTemplates();
    } catch (error: any) {
      console.error('Publish error:', error);
      toast.error('Failed to publish: ' + error.message);
    }
  };

  const handleReTest = () => {
    setPostTestActionsOpen(false);
    loadTemplates(); // Reload to get updated template
    // Re-open test wizard with updated data
    if (testingTemplate) {
      supabase
        .from('game_templates')
        .select('id, name, template_type, custom_game_url, selected_sub_competencies, game_config, description, base_prompt, design_settings')
        .eq('id', testingTemplate.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setTestingTemplate(data as any);
            setTestWizardOpen(true);
          }
        });
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading templates...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-semibold text-foreground">
            My Templates
          </h2>
          <p className="text-muted-foreground mt-2">Manage your game templates and design elements</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate('/platform/creator/profile-edit')}
            variant="outline"
            className="gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </Button>
          <Button 
            onClick={() => navigate('/platform/validator-test')}
            variant="outline"
            className="gap-2"
          >
            <TestTube className="w-4 h-4" />
            Test Validators
          </Button>
        </div>
      </div>

      <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">Create game templates with CBE competencies built in</p>
            <Button 
              onClick={() => {
                setSelectedTemplate(null);
                setDialogOpen(true);
              }} 
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              New Template
            </Button>
          </div>

          {templates.length === 0 ? (
            <Card className="p-12 text-center glass-card">
              <p className="text-muted-foreground mb-4">No templates yet</p>
              <Button 
                onClick={() => {
                  setSelectedTemplate(null);
                  setDialogOpen(true);
                }} 
                variant="outline"
              >
                Create Your First Template
              </Button>
            </Card>
          ) : (
            <TooltipProvider>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => {
                  const isPublishable = canPublish(template.id);
                  const testResult = testResults.get(template.id);
                  
                  return (
                    <Card 
                      key={template.id} 
                      className="glass-card overflow-hidden hover:border-primary/30 transition-colors cursor-pointer hover-lift"
                      onClick={() => handlePreviewGame(template)}
                    >
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        {template.preview_image ? (
                          <img src={template.preview_image} alt={template.name} className="w-full h-full object-cover" />
                        ) : (
                          <Eye className="w-12 h-12 text-muted-foreground" />
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg text-foreground">{template.name}</h3>
                            {template.creator_name && (
                              <div className="flex items-center gap-2 mt-1">
                                <div className="w-5 h-5 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                                  {template.creator_avatar ? (
                                    <img
                                      src={template.creator_avatar}
                                      alt={template.creator_name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <User className="w-3 h-3 text-muted-foreground" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  by {template.creator_name}
                                </p>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              Edited {formatDistanceToNow(new Date(template.updated_at), { addSuffix: true })}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              template.is_published
                                ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {template.is_published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{template.description}</p>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(template)}
                            title="Edit Template"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleManageCompetencies(template)}
                            title="Manage Competencies"
                          >
                            <Layers className="w-4 h-4" />
                          </Button>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleTogglePublish(template.id, template.is_published)}
                                  disabled={!template.is_published && !isPublishable}
                                  title={template.is_published ? 'Unpublish' : 'Publish'}
                                >
                                  {template.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                              </span>
                            </TooltipTrigger>
                            {!template.is_published && !isPublishable && (
                              <TooltipContent>
                                <p className="text-xs">
                                  {!testResult 
                                    ? 'Must complete testing before publishing' 
                                    : testResult.overall_status !== 'passed'
                                    ? 'All test phases must pass before publishing'
                                    : 'Must be approved for publish after passing tests'}
                                </p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(template.id)}
                            title="Delete Template"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TooltipProvider>
          )}
      </div>

      {dialogOpen && (
        <TemplateStudio
          template={selectedTemplate}
          onSuccess={loadTemplates}
          onClose={() => {
            setDialogOpen(false);
            setSelectedTemplate(null);
          }}
        />
      )}

      <CompetenciesDialog
        open={competenciesDialogOpen}
        onOpenChange={setCompetenciesDialogOpen}
        templateId={selectedTemplate?.id || ''}
        templateName={selectedTemplate?.name || ''}
      />

      {testingTemplate && (
        <>
          <ValidatorTestWizard
            open={testWizardOpen}
            onOpenChange={setTestWizardOpen}
            template={testingTemplate}
            subCompetency={
              testingTemplate.selected_sub_competencies[0]
                ? subCompetencies.get(testingTemplate.selected_sub_competencies[0]) || null
                : null
            }
            onComplete={handleTestComplete}
          />
          
          <PostTestActions
            open={postTestActionsOpen}
            onOpenChange={setPostTestActionsOpen}
            template={testingTemplate}
            onPublish={handlePublish}
            onReTest={handleReTest}
          />
        </>
      )}
    </div>
  );
}
