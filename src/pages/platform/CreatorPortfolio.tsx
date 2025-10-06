import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface Template {
  id: string;
  name: string;
  description: string | null;
  preview_image: string | null;
  competency_id: string | null;
  master_competencies?: {
    name: string;
    cbe_category: string;
  } | null;
}

interface Creator {
  id: string;
  full_name: string | null;
  bio: string | null;
}

export default function CreatorPortfolio() {
  const { creatorId } = useParams<{ creatorId: string }>();
  const navigate = useNavigate();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (creatorId) {
      fetchCreatorAndTemplates();
    }
  }, [creatorId]);

  const fetchCreatorAndTemplates = async () => {
    try {
      // Fetch creator profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', creatorId)
        .single();

      if (profileError) throw profileError;
      setCreator({ id: creatorId!, full_name: profileData?.full_name, bio: profileData?.bio });

      // Fetch templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('game_templates')
        .select('*')
        .eq('creator_id', creatorId)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (templatesError) throw templatesError;

      // Fetch competency data for each template
      const templatesWithCompetencies = await Promise.all(
        (templatesData || []).map(async (template) => {
          if (template.competency_id) {
            const { data: compData } = await supabase
              .from('master_competencies')
              .select('name, cbe_category')
              .eq('id', template.competency_id)
              .single();
            
            return {
              ...template,
              master_competencies: compData || null,
            };
          }
          return template;
        })
      );

      setTemplates(templatesWithCompetencies as any);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Loading creator portfolio...</p>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-gray-400">Creator not found</p>
        <Button onClick={() => navigate('/platform/marketplace')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Marketplace
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/platform/marketplace')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Button>
          
          {/* Creator Header */}
          <div className="flex items-start gap-6 mt-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-green to-neon-purple flex items-center justify-center text-4xl">
              👤
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">
                {creator.full_name || 'Creator'}
              </h1>
              {creator.bio && (
                <p className="text-gray-400 text-lg mb-2">{creator.bio}</p>
              )}
              <p className="text-sm text-gray-500">
                {templates.length} published validator{templates.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {templates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">This creator hasn't published any validators yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => navigate(`/platform/template/${template.id}`)}
                className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-neon-green/50 transition-all cursor-pointer group"
              >
                {/* Preview Image */}
                <div className="aspect-video bg-gradient-to-br from-gray-800 via-gray-900 to-black relative">
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

                {/* Content */}
                <div className="p-4 space-y-3 bg-gray-900 group-hover:bg-gray-800 transition-colors">
                  <h3 className="font-semibold text-lg text-white leading-tight">
                    {template.name}
                  </h3>
                  
                  {template.description && (
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  {template.master_competencies && (
                    <div className="flex gap-2 pt-2 border-t border-gray-800">
                      <span className="bg-neon-purple/20 text-neon-purple px-2 py-1 rounded border border-neon-purple/30 text-xs">
                        {template.master_competencies.cbe_category}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
