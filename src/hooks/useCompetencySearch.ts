import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CompetencyFromDB {
  id: string;
  name: string;
  cbe_category: string;
  departments: string[];
  is_active: boolean;
}

interface SubCompetencyFromDB {
  id: string;
  competency_id: string;
  statement: string;
  action_cue: string | null;
  game_mechanic: string | null;
  game_loop: string | null;
  validator_type: string | null;
}

export interface CompetencySearchResult {
  id: string;
  name: string;
  cbe_category: string;
  departments: string[];
  subCompetencies: SubCompetencyFromDB[];
  score: number;
  matchReason: string;
  matchType: 'exact' | 'category' | 'department' | 'fuzzy';
}

/**
 * useCompetencySearch - Database-driven competency search
 * 
 * Strict Population Filter Rules:
 * 1. Match by Domain: If user searches "Sales", query cbe_category (Column A) 
 *    and return all associated competencies (Column B)
 * 2. Best Match (Fuzzy): Use fuzzy match on competency name (Column B)
 * 3. Output Restriction: ONLY populate with official names from Column B
 * 4. No Hardcoding: Database is the only source of truth
 */
export function useCompetencySearch() {
  const [competencies, setCompetencies] = useState<CompetencyFromDB[]>([]);
  const [subCompetencies, setSubCompetencies] = useState<SubCompetencyFromDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all competencies and sub-competencies from database
  useEffect(() => {
    async function fetchCompetencies() {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch master competencies
        const { data: compData, error: compError } = await supabase
          .from('master_competencies')
          .select('id, name, cbe_category, departments, is_active')
          .eq('is_active', true)
          .order('name');

        if (compError) throw compError;

        // Fetch sub-competencies
        const { data: subData, error: subError } = await supabase
          .from('sub_competencies')
          .select('id, competency_id, statement, action_cue, game_mechanic, game_loop, validator_type')
          .order('display_order');

        if (subError) throw subError;

        setCompetencies(compData || []);
        setSubCompetencies(subData || []);
      } catch (err: any) {
        console.error('Error fetching competencies:', err);
        setError(err.message || 'Failed to load competencies');
      } finally {
        setIsLoading(false);
      }
    }

    fetchCompetencies();
  }, []);

  // Build a map of competency_id -> sub_competencies for fast lookup
  const subCompetencyMap = useMemo(() => {
    const map = new Map<string, SubCompetencyFromDB[]>();
    subCompetencies.forEach(sub => {
      const existing = map.get(sub.competency_id) || [];
      map.set(sub.competency_id, [...existing, sub]);
    });
    return map;
  }, [subCompetencies]);

  // Extract unique categories (domains) from the database
  const categories = useMemo(() => {
    const cats = new Set<string>();
    competencies.forEach(c => cats.add(c.cbe_category));
    return Array.from(cats);
  }, [competencies]);

  // Extract unique departments from the database
  const departments = useMemo(() => {
    const depts = new Set<string>();
    competencies.forEach(c => {
      c.departments?.forEach(d => depts.add(d.toLowerCase()));
    });
    return Array.from(depts);
  }, [competencies]);

  // ===== INTENT SYNONYMS FOR SMART SEARCH =====
  // Maps informal/natural language to competency name fragments
  // This enables "smart" understanding while "strict" population
  const INTENT_SYNONYMS: Record<string, string[]> = {
    'analytical thinking': ['analyzing', 'analysis', 'data stuff', 'data analysis', 'analytics', 'examine', 'evaluate data'],
    'critical reasoning': ['critical', 'reasoning', 'logic', 'logical', 'deduce', 'deduction'],
    'problem solving': ['problem', 'solve', 'solution', 'troubleshoot', 'fix', 'resolve'],
    'communication': ['communicate', 'talking', 'speaking', 'writing', 'presenting', 'client handling', 'customer service'],
    'team connection': ['teamwork', 'collaboration', 'team', 'collaborate', 'group work'],
    'adaptive mindset': ['adapt', 'flexible', 'resilience', 'change', 'pivot', 'agile'],
    'creative thinking': ['creative', 'creativity', 'innovate', 'innovation', 'ideation', 'brainstorm'],
    'emotional intelligence': ['empathy', 'emotions', 'eq', 'feelings', 'self-awareness'],
    'ethical': ['ethics', 'integrity', 'moral', 'values', 'purpose'],
    'coaching': ['mentor', 'mentorship', 'teach', 'guide', 'develop others'],
    'initiative': ['proactive', 'self-starter', 'drive', 'motivation', 'ownership'],
    'feedback': ['reflection', 'review', 'critique', 'improve', 'growth'],
  };

  /**
   * Fuzzy string matching with intent detection - calculates similarity score
   * Uses synonym mapping to understand user intent
   * 
   * STRICT RULES:
   * - Do NOT match numeric IDs (1, 2, 3, etc.)
   * - Only match against text in Column A (domain), Column B (competency name), and Departments
   */
  const fuzzyMatch = useCallback((query: string, target: string): number => {
    const q = query.toLowerCase().trim();
    const t = target.toLowerCase().trim();

    // RULE: Skip pure numeric queries - we don't want ID matching
    if (/^\d+$/.test(q)) return 0;
    
    // RULE: Skip if query is just 1-2 characters (too ambiguous)
    if (q.length < 3) return 0;

    // Exact match - highest priority
    if (q === t) return 100;

    // Check intent synonyms - if query matches a synonym, boost the target competency
    for (const [competencyFragment, synonyms] of Object.entries(INTENT_SYNONYMS)) {
      if (t.includes(competencyFragment)) {
        // Check if query matches any synonym for this competency
        if (synonyms.some(syn => q.includes(syn) || syn.includes(q))) {
          return 95; // High score for intent match
        }
      }
    }

    // Contains match - query is within target
    if (t.includes(q)) return 80;
    
    // Word-based matching (not character substring)
    // Split into words and match whole words only
    const queryWords = q.split(/\s+/).filter(w => w.length > 2 && !/^\d+$/.test(w));
    const targetWords = t.split(/\s+/).filter(w => w.length > 2);
    
    if (queryWords.length === 0) return 0;
    
    let matchCount = 0;
    queryWords.forEach(qw => {
      // Check for word-level matches (not arbitrary substrings)
      if (targetWords.some(tw => 
        tw === qw || // Exact word match
        tw.startsWith(qw) || qw.startsWith(tw) || // Prefix match for stemming
        (qw.length >= 4 && tw.includes(qw)) // Substring only if 4+ chars
      )) {
        matchCount++;
      }
    });

    if (queryWords.length > 0) {
      return (matchCount / queryWords.length) * 60;
    }

    return 0;
  }, []);

  /**
   * Main search function - queries database records with fuzzy matching
   * 
   * Logic:
   * 1. If query matches a cbe_category (domain), return all competencies in that category
   * 2. If query matches a department, return competencies with that department
   * 3. Fuzzy match against competency names
   * 4. NEVER return the domain/category itself - always return competency names (Column B)
   */
  /**
   * Main search function - queries database records with fuzzy matching
   * 
   * BLIND SEARCH RULES:
   * 1. Search Pool: Match against Column A (domain), Column B (competency name), and Departments
   * 2. Population Rule: ONLY populate with Column B competency names - never IDs or categories
   * 3. No ID Matching: Disable fuzzy matching for numeric IDs (1, 2, 3, etc.)
   * 4. Display: Show match reason separately, but bold text is ALWAYS the Column B name
   */
  const search = useCallback((query: string): CompetencySearchResult[] => {
    if (!query.trim() || competencies.length === 0) return [];

    const queryLower = query.toLowerCase().trim();
    
    // RULE: Block pure numeric queries - we don't match ID numbers
    if (/^\d+$/.test(queryLower)) return [];
    
    // RULE: Minimum 3 characters for search
    if (queryLower.length < 3) return [];
    
    const results: CompetencySearchResult[] = [];
    const addedIds = new Set<string>();

    // Helper to add a competency to results
    // CRITICAL: Only adds the competency NAME (Column B), never IDs or category names
    const addResult = (
      comp: CompetencyFromDB, 
      score: number, 
      matchReason: string,
      matchType: 'exact' | 'category' | 'department' | 'fuzzy'
    ) => {
      if (addedIds.has(comp.id)) return;
      addedIds.add(comp.id);

      // STRICT POPULATION: Only Column B name goes into results
      results.push({
        id: comp.id,
        name: comp.name, // COLUMN B ONLY - the official competency name
        cbe_category: comp.cbe_category,
        departments: comp.departments,
        subCompetencies: subCompetencyMap.get(comp.id) || [],
        score,
        matchReason, // This is display-only, not populated into the field
        matchType
      });
    };

    // PRIORITY 1: Direct name match on Column B (highest priority)
    competencies.forEach(comp => {
      const nameScore = fuzzyMatch(queryLower, comp.name);
      if (nameScore >= 30) {
        addResult(
          comp,
          nameScore + 100, // Highest priority for Column B matches
          nameScore >= 80 ? 'Exact match' : `Matches "${query}"`,
          nameScore >= 80 ? 'exact' : 'fuzzy'
        );
      }
    });

    // PRIORITY 2: Domain/category match (Column A) - returns competencies IN that domain
    competencies.forEach(comp => {
      const categoryMatch = fuzzyMatch(queryLower, comp.cbe_category);
      if (categoryMatch >= 40) {
        addResult(
          comp, 
          categoryMatch + 50,
          `Found in domain: ${comp.cbe_category}`,
          'category'
        );
      }
    });

    // PRIORITY 3: Department match - returns competencies relevant to that industry
    competencies.forEach(comp => {
      const matchedDept = comp.departments?.find(dept => {
        const deptLower = dept.toLowerCase();
        return deptLower.includes(queryLower) || queryLower.includes(deptLower);
      });

      if (matchedDept) {
        addResult(
          comp,
          80,
          `Relevant for ${matchedDept}`,
          'department'
        );
      }
    });

    // Sort by score descending, limit to top 6
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [competencies, subCompetencyMap, fuzzyMatch]);

  /**
   * Get sub-competencies for a specific competency ID
   * These come from Column C in the spreadsheet
   */
  const getSubCompetencies = useCallback((competencyId: string): SubCompetencyFromDB[] => {
    return subCompetencyMap.get(competencyId) || [];
  }, [subCompetencyMap]);

  return {
    competencies,
    subCompetencies,
    categories,
    departments,
    isLoading,
    error,
    search,
    getSubCompetencies,
  };
}
