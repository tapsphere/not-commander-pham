import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Template = {
  id: string;
  name: string;
  description: string;
  preview_image?: string;
  base_prompt?: string;
};

export default function Marketplace() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('game_templates')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-12">Loading marketplace...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'hsl(var(--neon-green))' }}>
          Template Marketplace
        </h2>
        <p className="text-gray-400 mb-6">Browse and customize game templates with AI</p>

        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-900 border-gray-800 text-white"
          />
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <Card className="p-12 text-center bg-gray-900 border-gray-800">
          <p className="text-gray-400">
            {templates.length === 0 ? 'No templates available yet' : 'No templates match your search'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="bg-gray-900 border-gray-800 overflow-hidden hover:border-neon-green/50 transition-all group">
              <div className="aspect-video bg-gray-800 flex items-center justify-center relative overflow-hidden">
                {template.preview_image ? (
                  <img src={template.preview_image} alt={template.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-gray-600" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button onClick={() => navigate(`/platform/marketplace/${template.id}`)}>
                    Customize with AI
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg text-white mb-2">{template.name}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">{template.description}</p>
                {template.base_prompt && (
                  <div className="bg-gray-800 rounded p-2 mb-3">
                    <p className="text-xs text-gray-500 mb-1">Base Prompt:</p>
                    <p className="text-xs text-gray-300 line-clamp-2">{template.base_prompt}</p>
                  </div>
                )}
                <Button
                  onClick={() => navigate(`/platform/marketplace/${template.id}`)}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Sparkles className="w-4 h-4" />
                  Customize
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
