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
  const [creators, setCreators] = useState<{ id: string; name: string; bio?: string; avatar_url?: string; templateCount: number }[]>([]);
  const [filteredCreators, setFilteredCreators] = useState<{ id: string; name: string; bio?: string; avatar_url?: string; templateCount: number }[]>([]);
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
      
      // Fetch creator profiles with avatar
      const creatorsWithData = await Promise.all(
        uniqueCreatorIds.map(async (creatorId) => {
          const { data } = await supabase
            .from('profiles')
            .select('full_name, bio, avatar_url')
            .eq('user_id', creatorId)
            .single();
          
          return {
            id: creatorId,
            name: data?.full_name || 'Unknown Creator',
            bio: data?.bio,
            avatar_url: data?.avatar_url,
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
    <div className="min-h-screen bg-black pb-safe">
      {/* Mobile-First Header */}
      <div className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-4 py-3">
          <h1 className="text-xl md:text-2xl font-bold text-neon-green text-glow-green mb-3">
            Creator Channels
          </h1>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full bg-gray-800 border-gray-700"
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <p className="text-xs md:text-sm text-gray-400 mb-4">
          {filteredCreators.length} channel{filteredCreators.length !== 1 ? 's' : ''}
        </p>

        {/* Mobile-Optimized Creators Grid */}
        {filteredCreators.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No creators found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {filteredCreators.map((creator) => (
              <div
                key={creator.id}
                onClick={() => navigate(`/platform/creator/${creator.id}`)}
                className="bg-gray-900 border border-gray-800 rounded-lg p-4 active:bg-gray-800 transition-all cursor-pointer"
              >
                {/* Creator Avatar */}
                <div className="flex items-center gap-3 mb-3">
                  {creator.avatar_url ? (
                    <img 
                      src={creator.avatar_url} 
                      alt={creator.name}
                      className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-neon-green to-neon-purple flex items-center justify-center text-2xl flex-shrink-0">
                      {creator.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base md:text-lg text-white mb-0.5 truncate">
                      {creator.name}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {creator.templateCount} validator{creator.templateCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Bio */}
                {creator.bio && (
                  <p className="text-xs md:text-sm text-gray-300 line-clamp-2 mb-3">
                    {creator.bio}
                  </p>
                )}

                {/* View Channel Button */}
                <div className="pt-3 border-t border-gray-800">
                  <span className="text-xs md:text-sm text-neon-green">
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