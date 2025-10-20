import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Eye, Edit, Trash2, EyeOff, Layers, TestTube, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { TemplateDialog } from '@/components/platform/TemplateDialog';
import { CompetenciesDialog } from '@/components/platform/CompetenciesDialog';
import { ValidatorTestWizard } from '@/components/platform/ValidatorTestWizard';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type Template = {
  id: string;
  name: string;
  description: string;
  base_prompt: string | null;
  is_published: boolean;
  created_at: string;
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
  const [testingTemplate, setTestingTemplate] = useState<{ 
    id: string; 
    name: string; 
    template_type: string;
    selected_sub_competencies: string[];
    custom_game_url?: string;
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

          // Generate default cover
          try {
            const { generateDefaultCover } = await import('@/utils/generateDefaultCover');
            const coverBlob = await generateDefaultCover(
              profile?.full_name || 'Creator',
              profile?.company_logo_url || undefined,
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
      // For AI generated, generate preview and open
      try {
        toast.info('Generating game preview...');
        
        // Fetch sub-competency data
        const subCompIds = template.selected_sub_competencies || [];
        const { data: subComps } = await supabase
          .from('sub_competencies')
          .select('*')
          .in('id', subCompIds);
        
        const { data: response, error } = await supabase.functions.invoke('generate-game', {
          body: {
            templatePrompt: template.base_prompt,
            primaryColor: '#00FF00',
            secondaryColor: '#9945FF',
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

        // Open the generated HTML in a new window
        const gameWindow = window.open('', '_blank');
        if (gameWindow) {
          gameWindow.document.write(response.html);
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

      const { error } = await supabase
        .from('game_templates')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(currentStatus ? 'Unpublished' : 'Published to marketplace');
      loadTemplates();
    } catch (error: any) {
      toast.error('Failed to update template');
    }
  };

  const canPublish = (templateId: string) => {
    const testResult = testResults.get(templateId);
    return testResult?.overall_status === 'passed' && testResult?.approved_for_publish;
  };

  const handleTemplateCreated = (templateId: string, templateName: string, subCompetencyId: string) => {
    // Fetch the full template to get template_type
    supabase
      .from('game_templates')
      .select('id, name, template_type, custom_game_url, selected_sub_competencies')
      .eq('id', templateId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to fetch template:', error);
          toast.error('Failed to open test wizard');
          return;
        }
        
        if (data) {
          setTestingTemplate(data);
          setTestWizardOpen(true);
        }
      });
  };

  if (loading) {
    return <div className="text-center py-12">Loading templates...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto p-4">
        <div className="flex flex-col gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'hsl(var(--neon-green))' }}>
              My Templates
            </h2>
            <p className="text-gray-400 mt-2 text-sm">Create game templates with CBE competencies built in</p>
          </div>
          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => navigate('/platform/brand/profile-edit')}
              variant="outline"
              className="w-full gap-2 border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </Button>
            <Button 
              onClick={() => navigate('/platform/validator-test')}
              variant="outline"
              className="w-full gap-2 border-neon-green text-neon-green hover:bg-neon-green hover:text-black"
            >
              <TestTube className="w-4 h-4" />
              Test Validators
            </Button>
            <Button 
              onClick={() => {
                setSelectedTemplate(null);
                setDialogOpen(true);
              }} 
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              New Template
            </Button>
          </div>
        </div>

      {templates.length === 0 ? (
        <Card className="p-8 text-center bg-gray-900 border-gray-800">
          <p className="text-gray-400 mb-4 text-sm">No templates yet</p>
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
          <div className="grid grid-cols-1 gap-4">
            {templates.map((template) => {
              const isPublishable = canPublish(template.id);
              const testResult = testResults.get(template.id);
              
              return (
                <Card 
                  key={template.id} 
                  className="bg-gray-900 border-gray-800 overflow-hidden hover:border-neon-green/50 transition-colors cursor-pointer"
                  onClick={() => handlePreviewGame(template)}
                >
                  <div className="aspect-video bg-gray-800 flex items-center justify-center">
                    {template.preview_image ? (
                      <img src={template.preview_image} alt={template.name} className="w-full h-full object-cover" />
                    ) : (
                      <Eye className="w-12 h-12 text-gray-600" />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg text-white">{template.name}</h3>
                        {template.creator_name && (
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
                              {template.creator_avatar ? (
                                <img
                                  src={template.creator_avatar}
                                  alt={template.creator_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-3 h-3 text-gray-500" />
                              )}
                            </div>
                            <p className="text-xs text-neon-purple">
                              by {template.creator_name}
                            </p>
                          </div>
                        )}
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          template.is_published
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-700 text-gray-400'
                        }`}
                      >
                        {template.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{template.description}</p>
                    <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
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
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TooltipProvider>
      )}

      <TemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={selectedTemplate}
        onSuccess={loadTemplates}
        onTemplateCreated={handleTemplateCreated}
      />

      <CompetenciesDialog
        open={competenciesDialogOpen}
        onOpenChange={setCompetenciesDialogOpen}
        templateId={selectedTemplate?.id || ''}
        templateName={selectedTemplate?.name || ''}
      />

      {testingTemplate && (
        <ValidatorTestWizard
          open={testWizardOpen}
          onOpenChange={setTestWizardOpen}
          template={testingTemplate}
          subCompetency={
            testingTemplate.selected_sub_competencies[0]
              ? subCompetencies.get(testingTemplate.selected_sub_competencies[0]) || null
              : null
          }
          onComplete={loadTemplates}
        />
      )}
      </div>
    </div>
  );
}
