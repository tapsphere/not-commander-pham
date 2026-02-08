import React, { useState, useMemo, useCallback } from 'react';
import { Search, Sparkles, X, Brain, Target, Users, TrendingUp, MessageCircle, Shield, Lightbulb, Heart, Scale, BookOpen, Briefcase, BarChart3, Megaphone, Palette, Code, Handshake, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Competency } from './types';

// Creator-friendly tags for each competency category - maps scientific names to role contexts
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

// Fallback category badges when no strong match is found
const FALLBACK_CATEGORIES = [
  { label: 'Soft Skills', keywords: ['communication', 'teamwork', 'leadership', 'empathy', 'emotional'], color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' },
  { label: 'Technical', keywords: ['data', 'analysis', 'code', 'technical', 'engineering', 'system'], color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { label: 'Leadership', keywords: ['lead', 'manage', 'direct', 'executive', 'strategy', 'vision'], color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  { label: 'Creative', keywords: ['design', 'creative', 'innovation', 'ideate', 'brand', 'content'], color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
  { label: 'Operations', keywords: ['process', 'efficiency', 'logistics', 'supply', 'operations', 'optimize'], color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
];

// ENHANCED SEMANTIC MAPPINGS - Now includes industry/department terms that map to scientific competencies
// This is the key mapping from "Tab 3, Column B" scientific names to real-world terms
const SEMANTIC_MAPPINGS: Record<string, { keywords: string[]; industries: string[]; roles: string[]; matchPhrase: string }> = {
  'Analytical Thinking': {
    keywords: [
      'data', 'analysis', 'metrics', 'patterns', 'insights', 'numbers', 'statistics',
      'spreadsheet', 'dashboard', 'kpi', 'performance', 'trend', 'forecast', 'report',
      'excel', 'sql', 'visualization', 'interpret', 'quantitative', 'measure', 'research',
      'bi', 'business intelligence', 'tableau', 'power bi', 'analytics'
    ],
    industries: ['finance', 'data', 'bi', 'strategy', 'product', 'research', 'consulting'],
    roles: ['analyst', 'data scientist', 'researcher', 'strategist', 'business analyst'],
    matchPhrase: 'requires analytical and data interpretation skills'
  },
  'Critical Reasoning': {
    keywords: [
      'decision', 'evaluate', 'judge', 'assess', 'reasoning', 'logic', 'argument',
      'evidence', 'conclusion', 'bias', 'assumption', 'skeptical', 'objective',
      'weighing options', 'pros cons', 'trade-off', 'priority', 'risk', 'critical thinking'
    ],
    industries: ['legal', 'compliance', 'audit', 'risk', 'quality assurance'],
    roles: ['manager', 'director', 'executive', 'consultant', 'auditor'],
    matchPhrase: 'involves critical evaluation and logical reasoning'
  },
  'Problem Solving': {
    keywords: [
      'solution', 'fix', 'resolve', 'troubleshoot', 'debug', 'challenge', 'obstacle',
      'creative', 'innovative', 'brainstorm', 'strategy', 'approach', 'method',
      'workaround', 'alternative', 'root cause', 'diagnose', 'improve', 'optimize'
    ],
    industries: ['technology', 'engineering', 'operations', 'consulting', 'product'],
    roles: ['engineer', 'developer', 'consultant', 'operations manager', 'product manager'],
    matchPhrase: 'requires creative problem-solving and solution design'
  },
  'Communication & Interpersonal Fluency': {
    keywords: [
      'client', 'customer', 'explain', 'present', 'pitch', 'negotiate', 'persuade',
      'email', 'meeting', 'call', 'difficult', 'luxury', 'empathy', 'listen',
      'feedback', 'conflict', 'rapport', 'relationship', 'stakeholder', 'influence',
      'public speaking', 'presentation', 'writing', 'messaging', 'articulate'
    ],
    industries: ['sales', 'marketing', 'customer service', 'public relations', 'communications', 'retail'],
    roles: ['sales rep', 'account manager', 'customer success', 'pr specialist', 'communications manager'],
    matchPhrase: 'requires strategic communication and interpersonal skills'
  },
  'Team Connection': {
    keywords: [
      'team', 'group', 'together', 'coordinate', 'delegate', 'lead', 'manage',
      'cross-functional', 'department', 'align', 'consensus', 'share', 'contribute',
      'support', 'mentor', 'coach', 'partner', 'cooperate', 'collaboration'
    ],
    industries: ['project management', 'hr', 'operations', 'consulting'],
    roles: ['team lead', 'project manager', 'scrum master', 'coordinator'],
    matchPhrase: 'involves team coordination and collaborative leadership'
  },
  'Adaptive Mindset & Resilience': {
    keywords: [
      'change', 'flexible', 'agile', 'pivot', 'adjust', 'uncertain', 'ambiguous',
      'pressure', 'stress', 'deadline', 'crisis', 'unexpected', 'new', 'learn',
      'evolve', 'dynamic', 'resilient', 'cope', 'transition', 'fast-paced'
    ],
    industries: ['startup', 'consulting', 'technology', 'media', 'entertainment'],
    roles: ['startup founder', 'consultant', 'project manager', 'change manager'],
    matchPhrase: 'requires adaptability and resilience under pressure'
  },
  'Creative Thinking': {
    keywords: [
      'design', 'creative', 'ideate', 'innovate', 'brand', 'concept', 'vision',
      'art', 'aesthetic', 'original', 'imagination', 'unconventional', 'out of the box',
      'campaign', 'content', 'story', 'narrative', 'visual', 'user experience'
    ],
    industries: ['marketing', 'advertising', 'design', 'media', 'entertainment', 'fashion'],
    roles: ['designer', 'creative director', 'brand manager', 'content creator', 'art director'],
    matchPhrase: 'requires creative ideation and innovative thinking'
  },
  'Emotional Intelligence & Self-Management': {
    keywords: [
      'empathy', 'emotion', 'self-aware', 'regulate', 'mood', 'patience', 'composure',
      'understanding', 'compassion', 'difficult people', 'conflict resolution',
      'interpersonal', 'sensitivity', 'awareness', 'mindfulness', 'eq'
    ],
    industries: ['healthcare', 'hr', 'education', 'social work', 'customer service', 'hospitality'],
    roles: ['hr manager', 'therapist', 'counselor', 'nurse', 'teacher', 'social worker'],
    matchPhrase: 'requires emotional intelligence and self-regulation'
  },
  'Ethical & Purpose-Driven Leadership': {
    keywords: [
      'ethics', 'integrity', 'values', 'purpose', 'moral', 'governance', 'compliance',
      'responsible', 'sustainable', 'esg', 'corporate responsibility', 'transparency',
      'accountability', 'trust', 'fair', 'honest', 'principled'
    ],
    industries: ['nonprofit', 'government', 'legal', 'compliance', 'csr'],
    roles: ['ceo', 'executive', 'compliance officer', 'ethics officer', 'board member'],
    matchPhrase: 'involves ethical decision-making and purpose-driven leadership'
  },
  'Coaching & Mentorship': {
    keywords: [
      'coach', 'mentor', 'develop', 'teach', 'train', 'guide', 'nurture',
      'feedback', 'growth', 'potential', 'career', 'onboarding', 'learning',
      'upskill', 'reskill', 'talent development', 'performance management'
    ],
    industries: ['hr', 'l&d', 'education', 'consulting', 'training'],
    roles: ['coach', 'mentor', 'trainer', 'l&d manager', 'hr business partner'],
    matchPhrase: 'involves coaching, mentorship, and talent development'
  },
  'Initiative': {
    keywords: [
      'proactive', 'self-starter', 'entrepreneurial', 'take charge', 'ownership',
      'independent', 'drive', 'ambition', 'go-getter', 'motivated', 'eager',
      'volunteer', 'initiate', 'propose', 'champion', 'pioneer'
    ],
    industries: ['startup', 'sales', 'business development', 'entrepreneurship'],
    roles: ['entrepreneur', 'sales executive', 'business developer', 'intrapreneur'],
    matchPhrase: 'requires proactive initiative and self-direction'
  },
  'Feedback & Reflection': {
    keywords: [
      'feedback', 'reflect', 'review', 'retrospective', 'learn', 'improve',
      'self-assessment', 'critique', 'constructive', 'growth mindset', 'iterate',
      'continuous improvement', 'agile', 'scrum', 'lessons learned'
    ],
    industries: ['agile', 'product', 'education', 'hr', 'consulting'],
    roles: ['agile coach', 'product owner', 'team lead', 'facilitator'],
    matchPhrase: 'involves feedback integration and reflective practice'
  },
};

// Industry-to-Competency mapping for terms like "Marketing", "Sales", "Finance"
const INDUSTRY_COMPETENCY_MAP: Record<string, { primary: string[]; secondary: string[]; reason: string }> = {
  'marketing': {
    primary: ['Communication & Interpersonal Fluency', 'Creative Thinking'],
    secondary: ['Analytical Thinking', 'Problem Solving'],
    reason: 'Marketing requires strategic communication and creative ideation'
  },
  'sales': {
    primary: ['Communication & Interpersonal Fluency', 'Initiative'],
    secondary: ['Emotional Intelligence & Self-Management', 'Adaptive Mindset & Resilience'],
    reason: 'Sales requires persuasive communication and proactive initiative'
  },
  'finance': {
    primary: ['Analytical Thinking', 'Critical Reasoning'],
    secondary: ['Ethical & Purpose-Driven Leadership', 'Problem Solving'],
    reason: 'Finance requires analytical skills and critical evaluation'
  },
  'operations': {
    primary: ['Problem Solving', 'Analytical Thinking'],
    secondary: ['Adaptive Mindset & Resilience', 'Team Connection'],
    reason: 'Operations requires problem-solving and process optimization'
  },
  'hr': {
    primary: ['Emotional Intelligence & Self-Management', 'Coaching & Mentorship'],
    secondary: ['Communication & Interpersonal Fluency', 'Ethical & Purpose-Driven Leadership'],
    reason: 'HR requires emotional intelligence and people development skills'
  },
  'technology': {
    primary: ['Problem Solving', 'Analytical Thinking'],
    secondary: ['Creative Thinking', 'Adaptive Mindset & Resilience'],
    reason: 'Technology requires logical problem-solving and innovation'
  },
  'customer service': {
    primary: ['Emotional Intelligence & Self-Management', 'Communication & Interpersonal Fluency'],
    secondary: ['Adaptive Mindset & Resilience', 'Problem Solving'],
    reason: 'Customer service requires empathy and clear communication'
  },
  'product': {
    primary: ['Problem Solving', 'Creative Thinking'],
    secondary: ['Analytical Thinking', 'Communication & Interpersonal Fluency'],
    reason: 'Product management requires creative problem-solving and stakeholder communication'
  },
  'design': {
    primary: ['Creative Thinking', 'Problem Solving'],
    secondary: ['Communication & Interpersonal Fluency', 'Feedback & Reflection'],
    reason: 'Design requires creative vision and iterative refinement'
  },
  'consulting': {
    primary: ['Analytical Thinking', 'Communication & Interpersonal Fluency'],
    secondary: ['Problem Solving', 'Critical Reasoning'],
    reason: 'Consulting requires analytical insight and client communication'
  },
  'healthcare': {
    primary: ['Emotional Intelligence & Self-Management', 'Ethical & Purpose-Driven Leadership'],
    secondary: ['Communication & Interpersonal Fluency', 'Problem Solving'],
    reason: 'Healthcare requires empathy and ethical decision-making'
  },
  'education': {
    primary: ['Coaching & Mentorship', 'Communication & Interpersonal Fluency'],
    secondary: ['Emotional Intelligence & Self-Management', 'Creative Thinking'],
    reason: 'Education requires mentorship and clear knowledge transfer'
  },
  'retail': {
    primary: ['Communication & Interpersonal Fluency', 'Emotional Intelligence & Self-Management'],
    secondary: ['Initiative', 'Adaptive Mindset & Resilience'],
    reason: 'Retail requires customer rapport and emotional awareness'
  },
  'luxury': {
    primary: ['Communication & Interpersonal Fluency', 'Emotional Intelligence & Self-Management'],
    secondary: ['Creative Thinking', 'Ethical & Purpose-Driven Leadership'],
    reason: 'Luxury requires sophisticated client communication and brand stewardship'
  },
};

interface SearchResult {
  competency: Competency;
  score: number;
  matchReason: string;
  creatorTag: { tag: string; icon: React.ElementType; color: string } | null;
  isIndustryMatch?: boolean;
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

  // Enhanced semantic search function with industry/role mapping
  const semanticSearch = useCallback((query: string): SearchResult[] => {
    if (!query.trim()) return [];

    const queryLower = query.toLowerCase().trim();
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

    // First, check for direct industry term matches
    const matchedIndustry = Object.keys(INDUSTRY_COMPETENCY_MAP).find(industry => 
      queryLower.includes(industry) || industry.includes(queryLower)
    );

    const results: SearchResult[] = competencies.map(comp => {
      let score = 0;
      let matchedKeywords: string[] = [];
      let isIndustryMatch = false;
      let customMatchReason = '';

      // Get semantic data for this competency
      const semanticData = SEMANTIC_MAPPINGS[comp.name];

      // ===== INDUSTRY TERM MATCHING (e.g., "Marketing" -> Strategic Communication) =====
      if (matchedIndustry) {
        const industryData = INDUSTRY_COMPETENCY_MAP[matchedIndustry];
        if (industryData.primary.includes(comp.name)) {
          score += 150; // Highest priority for primary industry matches
          isIndustryMatch = true;
          customMatchReason = industryData.reason;
        } else if (industryData.secondary.includes(comp.name)) {
          score += 80;
          isIndustryMatch = true;
          customMatchReason = `Also valuable for ${matchedIndustry} roles`;
        }
      }

      // ===== EXACT NAME MATCH =====
      if (comp.name.toLowerCase().includes(queryLower)) {
        score += 200;
        matchedKeywords.push(comp.name);
      }

      // ===== CATEGORY MATCH =====
      if (comp.cbe_category?.toLowerCase().includes(queryLower)) {
        score += 75;
        matchedKeywords.push(comp.cbe_category);
      }

      // ===== SEMANTIC KEYWORD MATCHING =====
      if (semanticData) {
        // Check keyword matches
        queryWords.forEach(word => {
          semanticData.keywords.forEach(keyword => {
            if (keyword.includes(word) || word.includes(keyword)) {
              score += 15;
              if (!matchedKeywords.includes(keyword)) {
                matchedKeywords.push(keyword);
              }
            }
          });

          // Check industry matches in semantic data
          semanticData.industries.forEach(industry => {
            if (industry.includes(word) || word.includes(industry)) {
              score += 25;
              if (!matchedKeywords.includes(industry)) {
                matchedKeywords.push(industry);
              }
            }
          });

          // Check role matches
          semanticData.roles.forEach(role => {
            if (role.includes(word) || word.includes(role)) {
              score += 20;
              if (!matchedKeywords.includes(role)) {
                matchedKeywords.push(role);
              }
            }
          });
        });
      }

      // ===== DEPARTMENT MATCHES FROM DATABASE =====
      comp.departments?.forEach(dept => {
        const deptLower = dept.toLowerCase();
        if (deptLower.includes(queryLower) || queryLower.includes(deptLower)) {
          score += 40;
          matchedKeywords.push(dept);
        }
      });

      // ===== GENERATE MATCH REASON =====
      let matchReason = customMatchReason;
      if (!matchReason && matchedKeywords.length > 0) {
        const topMatches = matchedKeywords.slice(0, 3);
        if (score >= 200) {
          matchReason = `Direct match: "${comp.name}"`;
        } else if (score >= 100) {
          matchReason = semanticData?.matchPhrase || `Strong match for ${topMatches.join(', ')} skills`;
        } else if (score >= 50) {
          matchReason = `Relevant to ${topMatches.join(', ')}`;
        } else if (score >= 20) {
          matchReason = `Related to ${topMatches[0] || 'this area'}`;
        }
      }

      return {
        competency: comp,
        score,
        matchReason,
        creatorTag: CREATOR_TAGS[comp.name] || null,
        isIndustryMatch,
      };
    });

    return results
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Show top 5 matches
  }, [competencies]);

  const searchResults = useMemo(() => semanticSearch(searchQuery), [searchQuery, semanticSearch]);

  // Get fallback categories when no strong matches
  const getFallbackCategories = useCallback((query: string) => {
    if (!query.trim()) return [];
    const queryLower = query.toLowerCase();
    return FALLBACK_CATEGORIES.filter(cat => 
      cat.keywords.some(kw => queryLower.includes(kw) || kw.includes(queryLower))
    );
  }, []);

  const fallbackCategories = useMemo(() => {
    if (searchResults.length > 0) return [];
    return getFallbackCategories(searchQuery);
  }, [searchQuery, searchResults.length, getFallbackCategories]);

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
            placeholder="What skill are we testing? (e.g., Marketing, data analysis, luxury client handling...)"
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
                AI matched {searchResults.length} scientific competencies to "{searchQuery}"
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
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-medium text-foreground">
                            {result.competency.name}
                          </span>
                          {idx === 0 && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              Best Match
                            </Badge>
                          )}
                          {result.isIndustryMatch && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500 text-amber-600">
                              Industry Match
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
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

        {/* No Results State with Fallback Categories */}
        {isFocused && searchQuery && searchResults.length === 0 && searchQuery.length > 2 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-lg z-50 p-4">
            <div className="text-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No exact matches for "{searchQuery}"
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Try describing the behavior or skill you want to test
              </p>
            </div>
            
            {/* Fallback Category Suggestions */}
            {fallbackCategories.length > 0 && (
              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground mb-2">Browse by category:</p>
                <div className="flex flex-wrap gap-2">
                  {fallbackCategories.map(cat => (
                    <Badge key={cat.label} className={cn("cursor-pointer", cat.color)}>
                      {cat.label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Show all categories if no fallback match */}
            {fallbackCategories.length === 0 && (
              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground mb-2">Browse by category:</p>
                <div className="flex flex-wrap gap-2">
                  {FALLBACK_CATEGORIES.map(cat => (
                    <Badge 
                      key={cat.label} 
                      className={cn("cursor-pointer", cat.color)}
                      onClick={() => setSearchQuery(cat.keywords[0])}
                    >
                      {cat.label}
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
