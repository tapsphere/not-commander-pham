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

  /**
   * Fuzzy string matching - calculates similarity score
   */
  const fuzzyMatch = useCallback((query: string, target: string): number => {
    const q = query.toLowerCase().trim();
    const t = target.toLowerCase().trim();

    // Exact match
    if (q === t) return 100;

    // Contains match
    if (t.includes(q)) return 80;
    if (q.includes(t)) return 70;

    // Word overlap matching
    const queryWords = q.split(/\s+/).filter(w => w.length > 2);
    const targetWords = t.split(/\s+/).filter(w => w.length > 2);
    
    let matchCount = 0;
    queryWords.forEach(qw => {
      if (targetWords.some(tw => tw.includes(qw) || qw.includes(tw))) {
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
  const search = useCallback((query: string): CompetencySearchResult[] => {
    if (!query.trim() || competencies.length === 0) return [];

    const queryLower = query.toLowerCase().trim();
    const results: CompetencySearchResult[] = [];

    // Track which competencies we've already added
    const addedIds = new Set<string>();

    // Helper to add a competency to results
    const addResult = (
      comp: CompetencyFromDB, 
      score: number, 
      matchReason: string,
      matchType: 'exact' | 'category' | 'department' | 'fuzzy'
    ) => {
      if (addedIds.has(comp.id)) return;
      addedIds.add(comp.id);

      results.push({
        id: comp.id,
        name: comp.name,
        cbe_category: comp.cbe_category,
        departments: comp.departments,
        subCompetencies: subCompetencyMap.get(comp.id) || [],
        score,
        matchReason,
        matchType
      });
    };

    // RULE 1: Check if query matches a category/domain (cbe_category)
    // If so, return ALL competencies within that category
    competencies.forEach(comp => {
      const categoryMatch = fuzzyMatch(queryLower, comp.cbe_category);
      if (categoryMatch >= 40) {
        // This is a domain search - return competencies in this domain
        addResult(
          comp, 
          categoryMatch + 50, // Boost for category match
          `Part of "${comp.cbe_category}" domain`,
          'category'
        );
      }
    });

    // RULE 2: Check if query matches a department
    competencies.forEach(comp => {
      const deptMatch = comp.departments?.some(dept => {
        const deptLower = dept.toLowerCase();
        return deptLower.includes(queryLower) || queryLower.includes(deptLower);
      });

      if (deptMatch) {
        addResult(
          comp,
          80,
          `Relevant for ${comp.departments.find(d => d.toLowerCase().includes(queryLower)) || 'this department'}`,
          'department'
        );
      }
    });

    // RULE 3: Fuzzy match on competency name (Column B) - this is what gets populated
    competencies.forEach(comp => {
      const nameScore = fuzzyMatch(queryLower, comp.name);
      if (nameScore >= 30) {
        addResult(
          comp,
          nameScore + 100, // Higher priority for direct name matches
          nameScore >= 80 ? `Exact match: "${comp.name}"` : `Matches "${query}"`,
          nameScore >= 80 ? 'exact' : 'fuzzy'
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
