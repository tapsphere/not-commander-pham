import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { BrandCustomizationDialog } from '@/components/platform/BrandCustomizationDialog';

interface Template {
  id: string;
  name: string;
  description: string | null;
  preview_image: string | null;
  base_prompt: string | null;
  creator_id: string;
  competency_id: string | null;
  is_published: boolean;
  profiles?: {
    full_name: string | null;
  } | null;
  master_competencies?: {
    name: string;
    cbe_category: string;
    departments: string[];
  } | null;
}

export default function TemplateDetail() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [customizeDialogOpen, setCustomizeDialogOpen] = useState(false);
  const [isBrand, setIsBrand] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    loadTemplate();
    checkUserRole();
  }, [templateId]);

  const checkUserRole = async () => {
    // TEMP: Auth disabled for demo
    setIsLoggedIn(true);
    setIsBrand(true);
    
    /* ORIGINAL CODE - Re-enable after demo:
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Checking user role, user:', user?.id);
    if (user) {
      setIsLoggedIn(true);
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'brand')
        .maybeSingle();
      
      console.log('Brand role check:', { roles, error, isBrand: !!roles });
      setIsBrand(!!roles);
    } else {
      console.log('No user found');
    }
    */
  };

  const loadTemplate = async () => {
    try {
      if (!templateId) return;

      const { data, error } = await supabase
        .from('game_templates')
        .select('*')
        .eq('id', templateId)
        .eq('is_published', true)
        .single();

      if (error) throw error;

      // Fetch related data
      const [profileData, competencyData] = await Promise.all([
        supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', data.creator_id)
          .single(),
        data.competency_id
          ? supabase
              .from('master_competencies')
              .select('name, cbe_category, departments')
              .eq('id', data.competency_id)
              .single()
          : null,
      ]);

      setTemplate({
        ...data,
        profiles: profileData.data || null,
        master_competencies: competencyData?.data || null,
      });
    } catch (error: any) {
      toast.error('Failed to load template details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="p-8 bg-gray-900 border-gray-800 text-center">
          <p className="text-gray-400 mb-4">Template not found</p>
          <Button onClick={() => navigate('/platform/marketplace')}>
            Back to Marketplace
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/platform/marketplace')}
            className="gap-2 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Preview & Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Preview */}
          <div className="aspect-video bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-lg overflow-hidden border border-gray-800">
            {template.preview_image ? (
              <img
                src={template.preview_image}
                alt={template.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <div className="text-6xl">🎮</div>
                <div className="text-xs text-gray-500 font-mono">VALIDATOR</div>
              </div>
            )}
          </div>

          {/* Info Card */}
          <Card className="bg-gray-900 border-gray-800 p-6 space-y-4 h-fit">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{template.name}</h1>
              <p className="text-gray-400 text-sm">
                Created by {template.profiles?.full_name || 'Unknown Creator'}
              </p>
            </div>

            {template.description && (
              <p className="text-gray-300 leading-relaxed">{template.description}</p>
            )}

            {template.master_competencies && (
              <div className="space-y-2 pt-4 border-t border-gray-800">
                <div className="flex flex-wrap gap-2">
                  <span className="bg-neon-purple/20 text-neon-purple px-3 py-1 rounded-full text-sm border border-neon-purple/30">
                    {template.master_competencies.cbe_category}
                  </span>
                  <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm border border-blue-500/30">
                    {template.master_competencies.name}
                  </span>
                </div>
                {template.master_competencies.departments.length > 0 && (
                  <div className="flex flex-wrap gap-1 text-xs text-gray-500">
                    {template.master_competencies.departments.map((dept) => (
                      <span key={dept} className="bg-gray-800 px-2 py-1 rounded">
                        {dept}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!isLoggedIn ? (
              <div className="space-y-3">
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 text-center">
                  <p className="text-yellow-300 text-sm mb-3">
                    Sign in as a Brand to customize this template
                  </p>
                  <Button
                    onClick={() => navigate('/auth')}
                    className="w-full bg-neon-green text-white hover:bg-neon-green/90"
                  >
                    Sign In
                  </Button>
                </div>
              </div>
            ) : !isBrand ? (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 text-center">
                <p className="text-yellow-300 text-sm">
                  Only Brand accounts can customize templates. Please log in with a Brand account.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={() => setCustomizeDialogOpen(true)}
                  className="w-full gap-2 text-lg py-7 font-bold shadow-lg shadow-neon-green/50 animate-pulse hover:animate-none"
                  style={{
                    backgroundColor: 'hsl(var(--neon-green))',
                    color: 'black',
                  }}
                >
                  <Palette className="h-6 w-6" />
                  Customize with Your Brand
                </Button>
                <p className="text-xs text-gray-400 text-center">
                  Click to add your brand colors and generate your custom game
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Prompt Section */}
        {template.base_prompt && (
          <Card className="bg-gray-900 border-neon-green/30 p-6 mb-8">
            <h2 className="text-xl font-semibold text-neon-green mb-4 flex items-center gap-2">
              📝 Template Prompt
            </h2>
            <div className="bg-black border border-gray-800 rounded-lg p-4">
              <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                {template.base_prompt}
              </pre>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              This prompt will be used as the foundation when you customize this validator with your brand.
            </p>
          </Card>
        )}

        {/* Additional Details */}
        <Card className="bg-gray-900 border-gray-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">How It Works</h2>
          <div className="space-y-3 text-gray-400">
            <div className="flex gap-3">
              <span className="text-neon-green font-bold">1.</span>
              <p>Click "Customize with Your Brand" to add your brand colors and logo</p>
            </div>
            <div className="flex gap-3">
              <span className="text-neon-green font-bold">2.</span>
              <p>Provide additional context or instructions for your specific use case</p>
            </div>
            <div className="flex gap-3">
              <span className="text-neon-green font-bold">3.</span>
              <p>Publish your customized validator and share it with players</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Customization Dialog */}
      {template && (
        <BrandCustomizationDialog
          open={customizeDialogOpen}
          onOpenChange={setCustomizeDialogOpen}
          template={template}
          onSuccess={() => {
            navigate('/platform/brand');
          }}
        />
      )}
    </div>
  );
}
