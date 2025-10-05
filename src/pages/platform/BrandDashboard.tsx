import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Store, Play, Settings } from 'lucide-react';

type Customization = {
  id: string;
  template_id: string;
  customization_prompt: string;
  published_at: string | null;
  created_at: string;
  game_templates: {
    name: string;
    preview_image?: string;
  };
};

export default function BrandDashboard() {
  const navigate = useNavigate();
  const [customizations, setCustomizations] = useState<Customization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomizations();
  }, []);

  const loadCustomizations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('brand_customizations')
        .select(`
          *,
          game_templates (
            name,
            preview_image
          )
        `)
        .eq('brand_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomizations(data || []);
    } catch (error) {
      console.error('Failed to load customizations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'hsl(var(--neon-green))' }}>
          Brand Dashboard
        </h2>
        <p className="text-gray-400">Manage your customized game experiences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-gray-900 border-gray-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-neon-green/10 rounded-lg">
              <Play className="w-6 h-6" style={{ color: 'hsl(var(--neon-green))' }} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Active Games</p>
              <p className="text-2xl font-bold text-white">
                {customizations.filter(c => c.published_at).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gray-900 border-gray-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Settings className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">In Progress</p>
              <p className="text-2xl font-bold text-white">
                {customizations.filter(c => !c.published_at).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gray-900 border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors"
          onClick={() => navigate('/platform/marketplace')}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Store className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Browse</p>
              <p className="text-lg font-bold text-white">Marketplace →</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4 text-white">Your Games</h3>
      </div>

      {customizations.length === 0 ? (
        <Card className="p-12 text-center bg-gray-900 border-gray-800">
          <p className="text-gray-400 mb-4">No customizations yet</p>
          <Button onClick={() => navigate('/platform/marketplace')}>
            Browse Templates
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customizations.map((custom) => (
            <Card key={custom.id} className="bg-gray-900 border-gray-800 overflow-hidden">
              <div className="aspect-video bg-gray-800 flex items-center justify-center">
                {custom.game_templates?.preview_image ? (
                  <img src={custom.game_templates.preview_image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Play className="w-12 h-12 text-gray-600" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-white mb-2">{custom.game_templates?.name}</h3>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                  {custom.customization_prompt || 'No customization prompt'}
                </p>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      custom.published_at
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {custom.published_at ? 'Live' : 'Draft'}
                  </span>
                  <Button size="sm" variant="outline">
                    Manage
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
