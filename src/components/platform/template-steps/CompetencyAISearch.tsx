import React, { useState, useMemo, useCallback } from 'react';
import { Search, Sparkles, X, Brain, Target, Users, TrendingUp, MessageCircle, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Competency } from './types';

// Creator-friendly tags for each competency category
const CREATOR_TAGS: Record<string, { tag: string; icon: React.ElementType; color: string }> = {
  'Analytical Thinking': { tag: 'Best for Data Roles', icon: Brain, color: 'text-blue-500' },
  'Critical Thinking': { tag: 'Decision Makers', icon: Target, color: 'text-purple-500' },
  'Problem Solving': { tag: 'Operations & Strategy', icon: TrendingUp, color: 'text-green-500' },
  'Communication': { tag: 'Client-Facing Roles', icon: MessageCircle, color: 'text-amber-500' },
  'Collaboration': { tag: 'Team Leadership', icon: Users, color: 'text-cyan-500' },
  'Adaptability': { tag: 'Fast-Paced Environments', icon: Shield, color: 'text-rose-500' },
};

// Semantic keyword mappings for intent matching
const SEMANTIC_MAPPINGS: Record<string, string[]> = {
  'Analytical Thinking': [
    'data', 'analysis', 'metrics', 'patterns', 'insights', 'numbers', 'statistics',
    'spreadsheet', 'dashboard', 'kpi', 'performance', 'trend', 'forecast', 'report',
    'excel', 'sql', 'visualization', 'interpret', 'quantitative', 'measure'
  ],
  'Critical Thinking': [
    'decision', 'evaluate', 'judge', 'assess', 'reasoning', 'logic', 'argument',
    'evidence', 'conclusion', 'bias', 'assumption', 'skeptical', 'objective',
    'weighing options', 'pros cons', 'trade-off', 'priority', 'risk'
  ],
  'Problem Solving': [
    'solution', 'fix', 'resolve', 'troubleshoot', 'debug', 'challenge', 'obstacle',
    'creative', 'innovative', 'brainstorm', 'strategy', 'approach', 'method',
    'workaround', 'alternative', 'root cause', 'diagnose', 'improve'
  ],
  'Communication': [
    'client', 'customer', 'explain', 'present', 'pitch', 'negotiate', 'persuade',
    'email', 'meeting', 'call', 'difficult', 'luxury', 'empathy', 'listen',
    'feedback', 'conflict', 'rapport', 'relationship', 'stakeholder', 'influence'
  ],
  'Collaboration': [
    'team', 'group', 'together', 'coordinate', 'delegate', 'lead', 'manage',
    'cross-functional', 'department', 'align', 'consensus', 'share', 'contribute',
    'support', 'mentor', 'coach', 'partner', 'cooperate'
  ],
  'Adaptability': [
    'change', 'flexible', 'agile', 'pivot', 'adjust', 'uncertain', 'ambiguous',
    'pressure', 'stress', 'deadline', 'crisis', 'unexpected', 'new', 'learn',
    'evolve', 'dynamic', 'resilient', 'cope', 'transition'
  ],
};

interface SearchResult {
  competency: Competency;
  score: number;
  matchReason: string;
  creatorTag: { tag: string; icon: React.ElementType; color: string } | null;
}

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

  // Semantic search function
  const semanticSearch = useCallback((query: string): SearchResult[] => {
    if (!query.trim()) return [];

    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

    const results: SearchResult[] = competencies.map(comp => {
      let score = 0;
      let matchedKeywords: string[] = [];

      // Get semantic keywords for this competency
      const semanticKeywords = SEMANTIC_MAPPINGS[comp.name] || [];

      // Check exact name match
      if (comp.name.toLowerCase().includes(queryLower)) {
        score += 100;
        matchedKeywords.push(comp.name);
      }

      // Check category match
      if (comp.cbe_category?.toLowerCase().includes(queryLower)) {
        score += 50;
        matchedKeywords.push(comp.cbe_category);
      }

      // Check semantic keyword matches
      queryWords.forEach(word => {
        semanticKeywords.forEach(keyword => {
          if (keyword.includes(word) || word.includes(keyword)) {
            score += 10;
            if (!matchedKeywords.includes(keyword)) {
              matchedKeywords.push(keyword);
            }
          }
        });
      });

      // Check department matches
      comp.departments?.forEach(dept => {
        if (dept.toLowerCase().includes(queryLower)) {
          score += 30;
          matchedKeywords.push(dept);
        }
      });

      // Generate match reason
      let matchReason = '';
      if (matchedKeywords.length > 0) {
        const topMatches = matchedKeywords.slice(0, 3);
        if (score >= 100) {
          matchReason = `Direct match for "${comp.name}"`;
        } else if (score >= 50) {
          matchReason = `Matches your intent for ${topMatches.join(', ')}`;
        } else if (score >= 20) {
          matchReason = `Related to ${topMatches.join(', ')} skills`;
        } else {
          matchReason = `Possible fit for ${topMatches[0] || 'this area'}`;
        }
      }

      return {
        competency: comp,
        score,
        matchReason,
        creatorTag: CREATOR_TAGS[comp.name] || null,
      };
    });

    return results
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [competencies]);

  const searchResults = useMemo(() => semanticSearch(searchQuery), [searchQuery, semanticSearch]);

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
            <Sparkles className={cn(
              "h-5 w-5 transition-colors",
              isFocused ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="What real-world skill are we testing? (e.g., Handling difficult luxury clients, data-driven sales...)"
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

        {/* Search Results Dropdown */}
        {isFocused && searchQuery && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="p-2 border-b border-border bg-muted/30">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-primary" />
                AI matched {searchResults.length} competencies to your intent
              </p>
            </div>
            <div className="p-2 space-y-1">
              {searchResults.map((result, idx) => {
                const TagIcon = result.creatorTag?.icon || Brain;
                return (
                  <button
                    key={result.competency.id}
                    onClick={() => handleSelect(result.competency.id)}
                    onMouseEnter={() => onHighlight?.(result.competency)}
                    onMouseLeave={() => onHighlight?.(null)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg transition-all",
                      "hover:bg-primary/10 hover:border-primary/30 border border-transparent",
                      idx === 0 && "bg-primary/5 border-primary/20"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground">
                            {result.competency.name}
                          </span>
                          {idx === 0 && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              Best Match
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {result.matchReason}
                        </p>
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
        {isFocused && searchQuery && searchResults.length === 0 && searchQuery.length > 2 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-lg z-50 p-4 text-center">
            <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No competencies match "{searchQuery}"
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Try describing the behavior or skill you want to test
            </p>
          </div>
        )}
      </div>

      {/* Selected Competency Display */}
      {selectedComp && !searchQuery && (
        <div className="bg-primary/5 border border-primary/30 rounded-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
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
