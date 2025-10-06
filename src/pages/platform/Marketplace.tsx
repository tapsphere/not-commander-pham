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
  const [creators, setCreators] = useState<{ id: string; name: string; bio?: string; templateCount: number }[]>([]);
  const [filteredCreators, setFilteredCreators] = useState<{ id: string; name: string; bio?: string; templateCount: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCreators();
  }, []);

  useEffect(() => {
    applySearch();
  }, [creators, searchQuery]);

  const fetchCreators = async () => {
    try {
      // Fetch all published templates
      const { data: templatesData, error } = await supabase
        .from('game_templates')
        .select('creator_id')
        .eq('is_published', true);

      if (error) throw error;

      // Get unique creator IDs and count their templates
      const creatorTemplateCount = new Map<string, number>();
      templatesData?.forEach(template => {
        const count = creatorTemplateCount.get(template.creator_id) || 0;
        creatorTemplateCount.set(template.creator_id, count + 1);
      });

      const uniqueCreatorIds = Array.from(creatorTemplateCount.keys());
      
      // Fetch creator profiles
      const creatorsWithData = await Promise.all(
        uniqueCreatorIds.map(async (creatorId) => {
          const { data } = await supabase
            .from('profiles')
            .select('full_name, bio')
            .eq('user_id', creatorId)
            .single();
          
          return {
            id: creatorId,
            name: data?.full_name || 'Unknown Creator',
            bio: data?.bio,
            templateCount: creatorTemplateCount.get(creatorId) || 0
          };
        })
      );
      
      setCreators(creatorsWithData);
      setFilteredCreators(creatorsWithData);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const applySearch = () => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = creators.filter(
        creator => creator.name.toLowerCase().includes(query)
      );
      setFilteredCreators(filtered);
    } else {
      setFilteredCreators(creators);
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
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-neon-green text-glow-green">
              Creator Channels
            </h1>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-gray-800 border-gray-700"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <p className="text-sm text-gray-400 mb-6">
          Browse {filteredCreators.length} creator channel{filteredCreators.length !== 1 ? 's' : ''}
        </p>

        {/* Creators Grid */}
        {filteredCreators.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No creators found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreators.map((creator) => (
              <div
                key={creator.id}
                onClick={() => navigate(`/platform/creator/${creator.id}`)}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-neon-green/50 transition-all cursor-pointer group"
              >
                {/* Creator Avatar */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-green to-neon-purple flex items-center justify-center text-3xl flex-shrink-0">
                    👤
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-xl text-white mb-1 truncate">
                      {creator.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {creator.templateCount} validator{creator.templateCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Bio */}
                {creator.bio && (
                  <p className="text-sm text-gray-300 line-clamp-2 mb-4">
                    {creator.bio}
                  </p>
                )}

                {/* View Channel Button */}
                <div className="pt-4 border-t border-gray-800">
                  <span className="text-sm text-neon-green group-hover:text-neon-green/80 transition-colors">
                    View Channel →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}