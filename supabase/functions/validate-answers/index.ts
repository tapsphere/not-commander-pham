import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Answer Validation Service
 * Compares user answers against knowledgebase with intelligent normalization
 * CRITICAL: Only marks as correct when there is a TRUE match - no default passes
 * 
 * KNOWLEDGEBASE FORMAT EXPECTED:
 * - correctAnswers should be an array of accepted answers AND their synonyms
 * - If synonyms are in spreadsheet as "answer1; synonym1; synonym2", split on ";" before passing
 * - Example: ["customer satisfaction", "client happiness", "user contentment"]
 */

interface ValidateRequest {
  questions: Array<{
    question: string;
    userAnswer: string;
    correctAnswers: string[]; // Primary answer + all synonyms (pre-split from knowledgebase)
  }>;
}

interface ValidationResult {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  details: Array<{
    question: string;
    userAnswer: string;
    correctAnswers: string[];
    isCorrect: boolean;
    matchedAnswer?: string;
    reason?: string; // Why it was marked correct or incorrect
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { questions }: ValidateRequest = await req.json();

    console.log('=== ANSWER VALIDATION START ===');
    console.log('Validating answers for', questions.length, 'questions');

    const details = questions.map((q, index) => {
      console.log(`\n--- Question ${index + 1} ---`);
      console.log('Question:', q.question);
      console.log('User answer:', q.userAnswer);
      console.log('Correct answers/synonyms:', q.correctAnswers);
      
      // CRITICAL: Check for empty or invalid user answers first
      if (!q.userAnswer || q.userAnswer.trim() === '') {
        console.log('✗ Result: INCORRECT (empty answer)');
        return {
          question: q.question,
          userAnswer: q.userAnswer,
          correctAnswers: q.correctAnswers,
          isCorrect: false,
          reason: 'Empty or missing answer'
        };
      }

      // CRITICAL: Check for empty or invalid correct answers
      if (!q.correctAnswers || q.correctAnswers.length === 0) {
        console.log('✗ Result: INCORRECT (no correct answers defined in knowledgebase)');
        return {
          question: q.question,
          userAnswer: q.userAnswer,
          correctAnswers: q.correctAnswers,
          isCorrect: false,
          reason: 'No correct answers defined in knowledgebase'
        };
      }

      // Parse and expand correct answers (in case they contain delimiters)
      const expandedAnswers = expandAnswers(q.correctAnswers);
      console.log(`Expanded to ${expandedAnswers.length} acceptable answers:`, expandedAnswers);

      const normalized = normalizeAnswer(q.userAnswer);
      console.log('Normalized user answer:', normalized);
      
      // CRITICAL: Check each acceptable answer explicitly - NO fallback passes
      let isCorrect = false;
      let matchedAnswer: string | undefined;
      let reason = 'No match found';
      
      for (const acceptableAns of expandedAnswers) {
        if (!acceptableAns || acceptableAns.trim() === '') continue;
        
        const normalizedAcceptable = normalizeAnswer(acceptableAns);
        console.log(`  Comparing with: "${normalizedAcceptable}"`);
        
        const matchResult = isAnswerMatch(normalized, normalizedAcceptable);
        console.log(`  → ${matchResult.isMatch ? '✓' : '✗'} ${matchResult.reason}`);
        
        if (matchResult.isMatch) {
          isCorrect = true;
          matchedAnswer = acceptableAns;
          reason = matchResult.reason;
          console.log(`  ✓ MATCH FOUND!`);
          break;
        }
      }

      console.log(`\n${isCorrect ? '✓ CORRECT' : '✗ INCORRECT'} - ${reason}`);

      return {
        question: q.question,
        userAnswer: q.userAnswer,
        correctAnswers: q.correctAnswers,
        isCorrect,
        matchedAnswer,
        reason
      };
    });

    const correctAnswers = details.filter(d => d.isCorrect).length;
    const totalQuestions = questions.length;
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    const result: ValidationResult = {
      totalQuestions,
      correctAnswers,
      incorrectAnswers: totalQuestions - correctAnswers,
      accuracy: Math.round(accuracy * 100) / 100,
      details
    };

    console.log('\n=== VALIDATION SUMMARY ===');
    console.log('Total questions:', totalQuestions);
    console.log('Correct:', correctAnswers);
    console.log('Incorrect:', result.incorrectAnswers);
    console.log('Accuracy:', result.accuracy + '%');
    console.log('=== VALIDATION END ===\n');

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Answer validation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

/**
 * Expand Answers
 * Splits answers that may contain multiple synonyms separated by delimiters
 * Handles: semicolon, comma, pipe separators
 * Example: "revenue; income; sales" → ["revenue", "income", "sales"]
 */
function expandAnswers(answers: string[]): string[] {
  const expanded: string[] = [];
  
  for (const ans of answers) {
    if (!ans) continue;
    
    // Split on common delimiters and add all parts
    const parts = ans.split(/[;,|]/).map(part => part.trim()).filter(part => part.length > 0);
    expanded.push(...parts);
  }
  
  console.log(`  Expanded ${answers.length} entries into ${expanded.length} acceptable answers`);
  return expanded;
}

/**
 * Normalize Answer
 * Converts answer to a standardized format for comparison
 * CRITICAL: Consistent normalization ensures fair comparison
 */
function normalizeAnswer(answer: string): string {
  if (!answer) return '';
  
  return answer
    .toLowerCase()
    .trim()
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Remove common punctuation that doesn't change meaning
    .replace(/[.,!?;:'"(){}[\]]/g, '')
    // Standardize apostrophes
    .replace(/[''`]/g, "'")
    // Remove leading articles
    .replace(/^(the|a|an)\s+/i, '');
}

/**
 * Check if Answer Matches
 * Determines if user answer matches the acceptable answer
 * CRITICAL: No default passes - explicit match required
 */
function isAnswerMatch(userAnswer: string, acceptableAnswer: string): { isMatch: boolean; reason: string } {
  // CRITICAL: Reject empty answers explicitly - NO exceptions
  if (!userAnswer || userAnswer.trim() === '') {
    return { isMatch: false, reason: 'Empty user answer' };
  }
  
  if (!acceptableAnswer || acceptableAnswer.trim() === '') {
    return { isMatch: false, reason: 'Empty acceptable answer' };
  }

  // Exact match after normalization - PASS
  if (userAnswer === acceptableAnswer) {
    return { isMatch: true, reason: 'Exact match' };
  }

  // Very short answers must match exactly - NO partial matching
  if (acceptableAnswer.length < 4) {
    return { isMatch: false, reason: 'Short answer requires exact match' };
  }

  // Word-based matching for longer answers
  // CRITICAL: Filter out very short words (2 chars or less) to avoid false matches
  const userWords = userAnswer.split(' ').filter(w => w.length > 2);
  const acceptableWords = acceptableAnswer.split(' ').filter(w => w.length > 2);
  
  // No substantial words to compare
  if (acceptableWords.length === 0) {
    return { isMatch: false, reason: 'No substantial words in acceptable answer' };
  }
  
  if (userWords.length === 0) {
    return { isMatch: false, reason: 'No substantial words in user answer' };
  }

  const userWordSet = new Set(userWords);
  
  // Calculate word overlap based on acceptable answer's words
  const commonWords = acceptableWords.filter(w => userWordSet.has(w)).length;
  const overlapPercentage = (commonWords / acceptableWords.length) * 100;

  console.log(`    Word analysis: ${commonWords}/${acceptableWords.length} words match (${Math.round(overlapPercentage)}%)`);

  // STRICT THRESHOLD: Require 80%+ word overlap for automatic pass
  if (overlapPercentage >= 80) {
    return { isMatch: true, reason: `High word overlap: ${Math.round(overlapPercentage)}%` };
  }

  // Check semantic similarity BEFORE checking word overlap percentage
  // This allows synonyms to match even with low word overlap
  const semanticMatch = checkSemanticSimilarity(userWords, acceptableWords);
  
  // MODERATE THRESHOLD: 70%+ word overlap OR strong semantic similarity
  if (overlapPercentage >= 70) {
    if (semanticMatch) {
      return { isMatch: true, reason: `Semantic match with ${Math.round(overlapPercentage)}% overlap` };
    }
  }
  
  // SEMANTIC-ONLY MATCH: Check if semantic similarity is strong enough on its own
  // Requires at least 2 synonym group matches for multi-word answers
  if (semanticMatch) {
    const synonymMatchCount = countSemanticMatches(userWords, acceptableWords);
    console.log(`    → ${synonymMatchCount} synonym group matches found`);
    
    // For 2-3 word answers: require 2 synonym matches
    // For 4+ word answers: require 2+ matches OR 50%+ word overlap with semantic match
    if (acceptableWords.length <= 3 && synonymMatchCount >= 2) {
      return { isMatch: true, reason: `Strong semantic match (${synonymMatchCount} synonym groups)` };
    } else if (acceptableWords.length > 3 && (synonymMatchCount >= 2 || overlapPercentage >= 50)) {
      return { isMatch: true, reason: `Semantic match (${synonymMatchCount} groups, ${Math.round(overlapPercentage)}% overlap)` };
    }
  }

  // CRITICAL: No match found - explicitly return false
  return { isMatch: false, reason: `Insufficient match: ${Math.round(overlapPercentage)}% overlap, no strong semantic match` };
}

/**
 * Check Semantic Similarity
 * Verifies if user and acceptable answers contain semantically similar concepts
 * Uses word-level synonym checking with EXACT word matching (not substring)
 */
function checkSemanticSimilarity(userWords: string[], acceptableWords: string[]): boolean {
  const synonymGroups = getSynonymGroups();

  // Check if user and acceptable answers share synonym concepts
  for (const group of synonymGroups) {
    const userHasConcept = userWords.some(word => group.includes(word));
    const acceptableHasConcept = acceptableWords.some(word => group.includes(word));
    
    if (userHasConcept && acceptableHasConcept) {
      console.log(`    → Semantic match found: ${group.filter(s => userWords.includes(s) || acceptableWords.includes(s)).join(', ')}`);
      return true;
    }
  }

  return false;
}

/**
 * Count Semantic Matches
 * Returns the number of synonym group matches between user and acceptable answers
 */
function countSemanticMatches(userWords: string[], acceptableWords: string[]): number {
  const synonymGroups = getSynonymGroups();
  let matchCount = 0;

  for (const group of synonymGroups) {
    const userHasConcept = userWords.some(word => group.includes(word));
    const acceptableHasConcept = acceptableWords.some(word => group.includes(word));
    
    if (userHasConcept && acceptableHasConcept) {
      matchCount++;
    }
  }

  return matchCount;
}

/**
 * Get Synonym Groups
 * Returns common business concept synonym groups for semantic matching
 */
function getSynonymGroups(): string[][] {
  return [
    ['increase', 'improve', 'enhance', 'boost', 'raise', 'grow', 'elevate'],
    ['decrease', 'reduce', 'lower', 'minimize', 'cut', 'lessen', 'diminish'],
    ['customer', 'client', 'user', 'consumer', 'patron'],
    ['satisfaction', 'happiness', 'contentment', 'fulfillment'],
    ['revenue', 'income', 'earnings', 'sales', 'proceeds'],
    ['cost', 'expense', 'expenditure', 'spending'],
    ['efficiency', 'productivity', 'performance', 'effectiveness'],
    ['quality', 'excellence', 'standard', 'grade'],
    ['retention', 'loyalty', 'keeping', 'maintaining'],
  ];
}