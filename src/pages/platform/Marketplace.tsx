import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

interface CreatorChannel {
  creator_id: string;
  creator_name: string | null;
  creator_bio: string | null;
  featured_game_image: string | null;
  featured_game_name: string | null;
  featured_game_id: string | null;
  total_games: number;
}

export default function Marketplace() {
  const navigate = useNavigate();
  const [creators, setCreators] = useState<CreatorChannel[]>([]);
  const [filteredCreators, setFilteredCreators] = useState<CreatorChannel[]>([]);
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
      const { data: templatesData, error: templatesError } = await supabase
        .from('game_templates')
        .select('id, creator_id, name, preview_image')
        .eq('is_published', true)
        .order('created_at', { ascending: false});

      if (templatesError) throw templatesError;

      // Group by creator and get unique creators
      const creatorMap = new Map<string, { games: any[], creator_id: string | null }>();
      
      templatesData?.forEach(template => {
        const creatorKey = template.creator_id || 'playops-sample';
        if (!creatorMap.has(creatorKey)) {
          creatorMap.set(creatorKey, {
            creator_id: template.creator_id,
            games: []
          });
        }
        creatorMap.get(creatorKey)?.games.push({
          id: template.id,
          name: template.name,
          preview_image: template.preview_image
        });
      });

      // Fetch creator profiles
      const creatorsWithProfiles = await Promise.all(
        Array.from(creatorMap.values()).map(async ({ creator_id, games }) => {
          // Handle sample validators (no creator)
          if (!creator_id) {
            const featuredGame = games[0];
            return {
              creator_id: 'playops-sample',
              creator_name: 'PlayOps Sample Validators',
              creator_bio: 'Official PlayOps validator templates for common competency assessments',
              featured_game_image: featuredGame?.preview_image || null,
              featured_game_name: featuredGame?.name || null,
              featured_game_id: featuredGame?.id || null,
              total_games: games.length
            };
          }

          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, bio')
            .eq('user_id', creator_id)
            .single();

          // Use first game's image as featured
          const featuredGame = games[0];

          return {
            creator_id,
            creator_name: profile?.full_name || 'Unknown Creator',
            creator_bio: profile?.bio || null,
            featured_game_image: featuredGame?.preview_image || null,
            featured_game_name: featuredGame?.name || null,
            featured_game_id: featuredGame?.id || null,
            total_games: games.length
          };
        })
      );
      
      setCreators(creatorsWithProfiles);
      setFilteredCreators(creatorsWithProfiles);
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
        creator => 
          creator.creator_name?.toLowerCase().includes(query) ||
          creator.creator_bio?.toLowerCase().includes(query)
      );
      setFilteredCreators(filtered);
    } else {
      setFilteredCreators(creators);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Loading creator channels...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">
          Gallery
        </h1>
        <p className="text-muted-foreground">Browse published templates from creators</p>
        
        <div className="relative mt-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        {filteredCreators.length} creator{filteredCreators.length !== 1 ? 's' : ''}
      </p>

      {/* Creator Channels Grid */}
      {filteredCreators.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No creators found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredCreators.map((creator) => {
            // If creator has only one game, go directly to template detail
            // Otherwise, go to their portfolio
            const handleClick = () => {
              if (creator.total_games === 1 && creator.featured_game_id) {
                navigate(`/platform/template/${creator.featured_game_id}`);
              } else {
                navigate(`/platform/creator/${creator.creator_id}`);
              }
            };

            return (
              <div
                key={creator.creator_id}
                onClick={handleClick}
                className="glass-card overflow-hidden hover:border-primary/30 transition-all cursor-pointer hover-lift"
              >
                {/* Featured Game Cover Image */}
                <div className="relative aspect-video bg-muted">
                  {creator.featured_game_image ? (
                    <img 
                      src={creator.featured_game_image.startsWith('/') ? creator.featured_game_image.slice(1) : creator.featured_game_image}
                      alt={creator.creator_name || 'Creator'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                      <span className="text-4xl text-muted-foreground">{creator.creator_name?.charAt(0) || '?'}</span>
                    </div>
                  )}
                </div>

                {/* Creator Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-base md:text-lg text-foreground mb-1 truncate">
                    {creator.creator_name}
                  </h3>
                  
                  {creator.creator_bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {creator.creator_bio}
                    </p>
                  )}

                  {/* Game Count */}
                  <p className="text-xs text-muted-foreground mb-2">
                    {creator.total_games} game{creator.total_games !== 1 ? 's' : ''}
                  </p>

                  {/* View Channel Button */}
                  <div className="pt-2 border-t border-border">
                    <span className="text-sm text-primary font-medium">
                      View Channel →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}