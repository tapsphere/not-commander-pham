import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, Sparkles, X, Brain, Target, Users, TrendingUp, MessageCircle, Shield, Lightbulb, Heart, Scale, BookOpen, Zap, Handshake, AlertCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Competency } from './types';
import { useCompetencySearch, CompetencySearchResult } from '@/hooks/useCompetencySearch';

// ===== HIERARCHICAL BEST-MATCH SEARCH =====
// Smart Search Pool: Searches Column A (Domain), Column B (Competency), Departments
// Strict Population: ONLY Column B (Competency Name) can be selected
// Database is the ONLY source of truth - NO hardcoded competency data
//
// Flow:
// 1. User types "analyzing" or "data stuff" → Smart match finds "Analytical Thinking"
// 2. User types "Sales" (domain) → Shows competencies IN that domain, not "Sales" itself
// 3. User types "Pattern Grid" (mechanic) → Blocked with helpful message
// 4. Selection → Fetches 6 sub-competencies from Column C for scene building

// ===== MECHANIC BLOCKLIST =====
// Game mechanics are interaction patterns, NOT competencies
// If user searches these, show guidance to search for skills instead
const MECHANIC_TERMS = [
  'pattern grid', 'decision tree', 'noise filter', 'alignment puzzle',
  'sequence validator', 'constraint puzzle', 'headline picker',
  'diagnostic panel', 'trade-off eval', 'data panel', 'quick tap',
  'drag', 'scrub', 'slider', 'swipe', 'toggle', 'tap', 'connect',
  'visual grid', 'tradeoff matrix', 'swipe card'
];

// ===== CREATOR-FRIENDLY ROLE TAGS =====
// Helps creators understand which competencies fit which job contexts
const CREATOR_TAGS: Record<string, { tag: string; icon: React.ElementType; color: string }> = {
  'Analytical Thinking': { tag: 'Best for Data Roles', icon: Brain, color: 'text-blue-500' },
  'Critical Reasoning': { tag: 'Decision Makers', icon: Target, color: 'text-purple-500' },
  'Problem Solving': { tag: 'Operations & Strategy', icon: TrendingUp, color: 'text-green-500' },
  'Communication & Interpersonal Fluency': { tag: 'Client-Facing Roles', icon: MessageCircle, color: 'text-amber-500' },
  'Team Connection': { tag: 'Team Leadership', icon: Users, color: 'text-cyan-500' },
  'Adaptive Mindset & Resilience': { tag: 'Fast-Paced Environments', icon: Shield, color: 'text-rose-500' },
  'Creative Thinking': { tag: 'Innovation Roles', icon: Lightbulb, color: 'text-yellow-500' },
  'Emotional Intelligence & Self-Management': { tag: 'People Management', icon: Heart, color: 'text-pink-500' },
  'Ethical & Purpose-Driven Leadership': { tag: 'Leadership & Governance', icon: Scale, color: 'text-indigo-500' },
  'Coaching & Mentorship': { tag: 'L&D & HR Roles', icon: BookOpen, color: 'text-emerald-500' },
  'Initiative': { tag: 'Entrepreneurial Roles', icon: Zap, color: 'text-orange-500' },
  'Feedback & Reflection': { tag: 'Growth-Oriented Teams', icon: Handshake, color: 'text-teal-500' },
};

interface CompetencyAISearchProps {
  competencies: Competency[];
  selectedCompetency: string;
  onSelect: (competencyId: string) => void;
  onClearAll: () => void;
  onHighlight?: (competency: Competency | null) => void;
}

export function CompetencyAISearch({
  competencies,
  selectedCompetency,
  onSelect,
  onClearAll,
  onHighlight,
}: CompetencyAISearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  // Use database-driven search hook
  const { 
    search, 
    isLoading: isSearchLoading, 
    error: searchError,
    categories 
  } = useCompetencySearch();

  // ===== DATABASE-DRIVEN SEARCH =====
  // No hardcoded mappings - all results come from Supabase
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    // Check if this is a mechanic term - block it
    const isMechanicTerm = MECHANIC_TERMS.some(mechanic => 
      searchQuery.toLowerCase().includes(mechanic) || mechanic.includes(searchQuery.toLowerCase())
    );
    if (isMechanicTerm) return [];
    
    // Query the database through the hook
    return search(searchQuery);
  }, [searchQuery, search]);

  // Map database results to include creator tags
  const enrichedResults = useMemo(() => {
    return searchResults.map(result => ({
      ...result,
      creatorTag: CREATOR_TAGS[result.name] || null,
    }));
  }, [searchResults]);

  // Find selected competency from props (legacy support)
  const selectedComp = competencies.find(c => c.id === selectedCompetency);

  const handleSelect = (competencyId: string) => {
    onSelect(competencyId);
    setSearchQuery('');
    setIsFocused(false);
  };

  const handleClear = () => {
    setSearchQuery('');
    onClearAll();
  };

  // Check if the search term is a mechanic
  const isMechanicSearch = useMemo(() => {
    if (!searchQuery.trim()) return false;
    return MECHANIC_TERMS.some(m => searchQuery.toLowerCase().includes(m));
  }, [searchQuery]);

  return (
    <div className="space-y-4">
      {/* AI Search Bar */}
      <div className="relative">
        <div className={cn(
          "relative flex items-center bg-background border rounded-xl transition-all duration-200",
          isFocused ? "border-primary ring-2 ring-primary/20" : "border-border",
          selectedComp && "border-primary/50 bg-primary/5"
        )}>
          <div className="pl-4 pr-2">
            {isSearchLoading ? (
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            ) : (
              <Sparkles className={cn(
                "h-5 w-5 transition-colors",
                isFocused ? "text-primary" : "text-muted-foreground"
              )} />
            )}
          </div>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="What skill are we testing? (e.g., Sales, data analysis, communication...)"
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-12 text-sm"
          />
          {(searchQuery || selectedCompetency) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="mr-2 h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        {/* Search Results Dropdown - Data from Supabase */}
        {isFocused && searchQuery && enrichedResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="p-2 border-b border-border bg-muted/30">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-primary" />
                AI matched {enrichedResults.length} scientific competencies to "{searchQuery}"
              </p>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                Results from C-BEN database • Only official competency names are populated
              </p>
            </div>
            <div className="p-2 space-y-1">
              {enrichedResults.map((result, idx) => {
                const TagIcon = result.creatorTag?.icon || Brain;
                const matchTypeBadge = result.matchType === 'category' 
                  ? { label: 'Domain Match', color: 'border-blue-500 text-blue-600' }
                  : result.matchType === 'department'
                  ? { label: 'Industry Match', color: 'border-amber-500 text-amber-600' }
                  : result.matchType === 'exact'
                  ? { label: 'Best Match', color: '' }
                  : null;

                return (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result.id)}
                    onMouseEnter={() => {
                      // Find the competency in the prop list for highlighting
                      const comp = competencies.find(c => c.id === result.id);
                      if (comp) onHighlight?.(comp);
                    }}
                    onMouseLeave={() => onHighlight?.(null)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg transition-all",
                      "hover:bg-primary/10 hover:border-primary/30 border border-transparent",
                      idx === 0 && "bg-primary/5 border-primary/20"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-medium text-foreground">
                            {result.name}
                          </span>
                          {idx === 0 && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              Best Match
                            </Badge>
                          )}
                          {matchTypeBadge && matchTypeBadge.label !== 'Best Match' && (
                            <Badge 
                              variant="outline" 
                              className={cn("text-[10px] px-1.5 py-0", matchTypeBadge.color)}
                            >
                              {matchTypeBadge.label}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {result.matchReason}
                        </p>
                        {result.subCompetencies.length > 0 && (
                          <p className="text-[10px] text-muted-foreground/70 mt-1">
                            {result.subCompetencies.length} sub-competencies available
                          </p>
                        )}
                      </div>
                      {result.creatorTag && (
                        <div className={cn(
                          "flex items-center gap-1 text-xs shrink-0",
                          result.creatorTag.color
                        )}>
                          <TagIcon className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">{result.creatorTag.tag}</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* No Results State */}
        {isFocused && searchQuery && enrichedResults.length === 0 && searchQuery.length > 2 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-lg z-50 p-4">
            {/* Check if this was a mechanic term search */}
            {isMechanicSearch ? (
              <div className="text-center mb-4">
                <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">
                  "{searchQuery}" is a game mechanic, not a competency
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  <strong>Tip:</strong> Search for the <em>skill</em> you want to test (e.g., "analytical thinking", "communication").
                  <br />
                  The game mechanic will be auto-assigned based on the competency you select.
                </p>
              </div>
            ) : searchError ? (
              <div className="text-center mb-4">
                <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                <p className="text-sm text-destructive">
                  Error loading competencies
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {searchError}
                </p>
              </div>
            ) : (
              <div className="text-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No matches for "{searchQuery}" in the C-BEN database
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try describing the behavior or skill you want to test
                </p>
              </div>
            )}
            
            {/* Show categories from database */}
            {categories.length > 0 && (
              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground mb-2">Browse by C-BEN domain:</p>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 5).map(cat => (
                    <Badge 
                      key={cat} 
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10"
                      onClick={() => setSearchQuery(cat)}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Competency Display */}
      {selectedComp && !searchQuery && (
        <div className="bg-primary/5 border border-primary/30 rounded-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-semibold text-foreground">
                  {selectedComp.name}
                </span>
                {CREATOR_TAGS[selectedComp.name] && (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[10px] border-current",
                      CREATOR_TAGS[selectedComp.name].color
                    )}
                  >
                    {CREATOR_TAGS[selectedComp.name].tag}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Category: {selectedComp.cbe_category}
              </p>
              {selectedComp.departments?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedComp.departments.slice(0, 4).map(dept => (
                    <Badge key={dept} variant="secondary" className="text-[10px]">
                      {dept}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery(selectedComp.name)}
              className="text-xs text-muted-foreground"
            >
              Change
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
