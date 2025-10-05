import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { BrandCustomizationDialog } from '@/components/platform/BrandCustomizationDialog';

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
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [customizeDialogOpen, setCustomizeDialogOpen] = useState(false);
  
  // Filter options
  const [creators, setCreators] = useState<{ id: string; name: string }[]>([]);
  const [competencies, setCompetencies] = useState<{ id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    fetchTemplates();
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [templates, filterType, selectedFilter, searchQuery]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('game_templates')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch related data separately
      const templatesWithData = await Promise.all(
        (data || []).map(async (template) => {
          const [profileData, competencyData] = await Promise.all([
            supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', template.creator_id)
              .single(),
            template.competency_id
              ? supabase
                  .from('master_competencies')
                  .select('name, cbe_category, departments')
                  .eq('id', template.competency_id)
                  .single()
              : null,
          ]);

          return {
            ...template,
            profiles: profileData.data || null,
            master_competencies: competencyData?.data || null,
          };
        })
      );

      setTemplates(templatesWithData as any);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      // Fetch creators who have published templates
      const { data: templatesData } = await supabase
        .from('game_templates')
        .select('creator_id')
        .eq('is_published', true);

      if (templatesData) {
        const uniqueCreatorIds = Array.from(new Set(templatesData.map(t => t.creator_id)));
        
        const creatorsWithNames = await Promise.all(
          uniqueCreatorIds.map(async (creatorId) => {
            const { data } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', creatorId)
              .single();
            
            return {
              id: creatorId,
              name: data?.full_name || 'Unknown Creator'
            };
          })
        );
        
        setCreators(creatorsWithNames);
      }

      // Fetch competencies
      const { data: competenciesData } = await supabase
        .from('master_competencies')
        .select('id, name')
        .order('name');

      if (competenciesData) {
        setCompetencies(competenciesData);
      }

      // Extract unique departments from competencies
      const { data: deptData } = await supabase
        .from('master_competencies')
        .select('departments');

      if (deptData) {
        const allDepts = deptData.flatMap((d: any) => d.departments || []);
        const uniqueDepts = Array.from(new Set(allDepts)).sort();
        setDepartments(uniqueDepts);
      }
    } catch (error: any) {
      console.error('Error fetching filter options:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...templates];

    // Apply filter type
    if (filterType === 'creator' && selectedFilter) {
      filtered = filtered.filter(t => t.creator_id === selectedFilter);
    } else if (filterType === 'competency' && selectedFilter) {
      filtered = filtered.filter(t => t.competency_id === selectedFilter);
    } else if (filterType === 'department' && selectedFilter) {
      filtered = filtered.filter(
        t => t.master_competencies?.departments?.includes(selectedFilter)
      );
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.name.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.master_competencies?.name.toLowerCase().includes(query)
      );
    }

    setFilteredTemplates(filtered);
  };

  const handleCustomize = (template: Template) => {
    setSelectedTemplate(template);
    setCustomizeDialogOpen(true);
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
              Validator Marketplace
            </h1>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search validators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-gray-800 border-gray-700"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Channel Navigation */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
            Browse Channels
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              onClick={() => {
                setFilterType('all');
                setSelectedFilter('');
              }}
              className={filterType === 'all' ? 'bg-neon-green text-black' : ''}
            >
              🎮 All Validators
            </Button>
            
            {/* Creator Channels */}
            {creators.length > 0 && (
              <>
                {creators.map((creator) => (
                  <Button
                    key={creator.id}
                    variant={
                      filterType === 'creator' && selectedFilter === creator.id
                        ? 'default'
                        : 'outline'
                    }
                    onClick={() => {
                      setFilterType('creator');
                      setSelectedFilter(creator.id);
                    }}
                    className={
                      filterType === 'creator' && selectedFilter === creator.id
                        ? 'bg-neon-green text-black'
                        : ''
                    }
                  >
                    👤 {creator.name}
                  </Button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Competency & Department Filters */}
        <div className="mb-6 flex gap-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Filter by Competency</label>
            <select
              value={filterType === 'competency' ? selectedFilter : ''}
              onChange={(e) => {
                if (e.target.value) {
                  setFilterType('competency');
                  setSelectedFilter(e.target.value);
                } else {
                  setFilterType('all');
                  setSelectedFilter('');
                }
              }}
              className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
            >
              <option value="">All Competencies</option>
              {competencies.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Filter by Department</label>
            <select
              value={filterType === 'department' ? selectedFilter : ''}
              onChange={(e) => {
                if (e.target.value) {
                  setFilterType('department');
                  setSelectedFilter(e.target.value);
                } else {
                  setFilterType('all');
                  setSelectedFilter('');
                }
              }}
              className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Channel Header */}
        {filterType === 'creator' && selectedFilter && (
          <div className="mb-6 bg-gray-900 border border-neon-green/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-neon-green/20 flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {creators.find(c => c.id === selectedFilter)?.name}'s Validators
                </h2>
                <p className="text-sm text-gray-400">
                  {filteredTemplates.length} published validator{filteredTemplates.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        {filterType !== 'creator' && (
          <p className="text-sm text-gray-400 mb-4">
            Showing {filteredTemplates.length} validator{filteredTemplates.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Template Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No validators found matching your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-neon-green/50 transition-all group"
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
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      onClick={() => handleCustomize(template)}
                      className="bg-neon-green text-black hover:bg-neon-green/90 gap-2"
                    >
                      <Palette className="h-4 w-4" />
                      Customize with Your Brand
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3 bg-gray-900">
                  <h3 className="font-semibold text-lg text-white leading-tight">{template.name}</h3>
                  
                  {template.description && (
                    <p className="text-sm text-gray-300 line-clamp-2 min-h-[2.5rem]">
                      {template.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 text-xs pt-2 border-t border-gray-800">
                    <span className="bg-gray-800 px-2 py-1 rounded text-gray-400 flex items-center gap-1">
                      👤 {template.profiles?.full_name || 'Creator'}
                    </span>
                    
                    {template.master_competencies && (
                      <span className="bg-neon-purple/20 text-neon-purple px-2 py-1 rounded border border-neon-purple/30">
                        {template.master_competencies.cbe_category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customization Dialog */}
      {selectedTemplate && (
        <BrandCustomizationDialog
          open={customizeDialogOpen}
          onOpenChange={setCustomizeDialogOpen}
          template={selectedTemplate}
          onSuccess={fetchTemplates}
        />
      )}
    </div>
  );
}