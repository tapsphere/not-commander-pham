import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

type FilterType = 'all' | 'creator' | 'competency' | 'department';

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

export default function Marketplace() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    applySearch();
  }, [templates, searchQuery]);

  const fetchTemplates = async () => {
    try {
      const { data: templatesData, error } = await supabase
        .from('game_templates')
        .select(`
          *,
          profiles:creator_id (full_name),
          master_competencies:competency_id (name, cbe_category, departments)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setTemplates(templatesData || []);
      setFilteredTemplates(templatesData || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const applySearch = () => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = templates.filter(
        template => 
          template.name.toLowerCase().includes(query) ||
          template.description?.toLowerCase().includes(query)
      );
      setFilteredTemplates(filtered);
    } else {
      setFilteredTemplates(templates);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Loading marketplace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-safe">
      {/* Mobile-First Header */}
      <div className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-4 py-3">
          <h1 className="text-xl md:text-2xl font-bold text-neon-green text-glow-green mb-3">
            Game Marketplace
          </h1>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full bg-gray-800 border-gray-700"
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <p className="text-xs md:text-sm text-gray-400 mb-4">
          {filteredTemplates.length} game{filteredTemplates.length !== 1 ? 's' : ''}
        </p>

        {/* Mobile-Optimized Games Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No games found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => navigate(`/platform/template/${template.id}`)}
                className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden active:bg-gray-800 transition-all cursor-pointer"
              >
                {/* Game Cover Image */}
                <div className="relative aspect-video bg-gray-800">
                  {template.preview_image ? (
                    <img 
                      src={template.preview_image.startsWith('/') ? template.preview_image.slice(1) : template.preview_image}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                      <span className="text-4xl">{template.name.charAt(0)}</span>
                    </div>
                  )}
                </div>

                {/* Game Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-base md:text-lg text-white mb-1 truncate">
                    {template.name}
                  </h3>
                  
                  {template.description && (
                    <p className="text-xs md:text-sm text-gray-300 line-clamp-2 mb-2">
                      {template.description}
                    </p>
                  )}

                  {/* Creator Name */}
                  {template.profiles && (
                    <p className="text-xs text-gray-400 mb-2">
                      by {template.profiles.full_name || 'Unknown Creator'}
                    </p>
                  )}

                  {/* Play Button */}
                  <div className="pt-2 border-t border-gray-800">
                    <span className="text-xs md:text-sm text-neon-green">
                      Play Now →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}