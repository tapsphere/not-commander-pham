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
 */

interface ValidateRequest {
  questions: Array<{
    question: string;
    userAnswer: string;
    correctAnswers: string[]; // Multiple accepted answers
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
      console.log('Correct answers:', q.correctAnswers);
      
      // CRITICAL: Check for empty or invalid user answers first
      if (!q.userAnswer || q.userAnswer.trim() === '') {
        console.log('Result: INCORRECT (empty answer)');
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
        console.log('Result: INCORRECT (no correct answers defined)');
        return {
          question: q.question,
          userAnswer: q.userAnswer,
          correctAnswers: q.correctAnswers,
          isCorrect: false,
          reason: 'No correct answers defined'
        };
      }

      const normalized = normalizeAnswer(q.userAnswer);
      console.log('Normalized user answer:', normalized);
      
      // Check each correct answer for a match
      let isCorrect = false;
      let matchedAnswer: string | undefined;
      let reason = 'No match found';
      
      for (const correctAns of q.correctAnswers) {
        if (!correctAns || correctAns.trim() === '') continue;
        
        const normalizedCorrect = normalizeAnswer(correctAns);
        console.log(`Comparing with: "${normalizedCorrect}"`);
        
        const matchResult = isAnswerMatch(normalized, normalizedCorrect);
        console.log(`Match result: ${matchResult.isMatch} (${matchResult.reason})`);
        
        if (matchResult.isMatch) {
          isCorrect = true;
          matchedAnswer = correctAns;
          reason = matchResult.reason;
          break;
        }
      }

      console.log(`Final result: ${isCorrect ? 'CORRECT' : 'INCORRECT'} - ${reason}`);

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
 * Normalize Answer
 * Converts answer to a standardized format for comparison
 * - Lowercase
 * - Trim whitespace
 * - Remove extra spaces
 * - Remove common punctuation
 * - Handle common variations
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
    // Remove leading "the", "a", "an" articles
    .replace(/^(the|a|an)\s+/i, '')
    // Handle number variations
    .replace(/\bone\b/g, '1')
    .replace(/\btwo\b/g, '2')
    .replace(/\bthree\b/g, '3')
    .replace(/\bfour\b/g, '4')
    .replace(/\bfive\b/g, '5');
}

/**
 * Check if Answer Matches
 * Determines if user answer matches the correct answer
 * Returns both match status and reason for debugging
 */
function isAnswerMatch(userAnswer: string, correctAnswer: string): { isMatch: boolean; reason: string } {
  // CRITICAL: Reject empty answers explicitly
  if (!userAnswer || userAnswer.trim() === '') {
    return { isMatch: false, reason: 'Empty user answer' };
  }
  
  if (!correctAnswer || correctAnswer.trim() === '') {
    return { isMatch: false, reason: 'Empty correct answer' };
  }

  // Exact match after normalization
  if (userAnswer === correctAnswer) {
    return { isMatch: true, reason: 'Exact match' };
  }

  // Handle very short answers differently - require exact match
  if (correctAnswer.length < 4) {
    return { isMatch: false, reason: 'Short answer requires exact match' };
  }

  // For longer answers, check word-based matching
  const userWords = userAnswer.split(' ').filter(w => w.length > 2);
  const correctWords = correctAnswer.split(' ').filter(w => w.length > 2);
  
  // No words to compare
  if (correctWords.length === 0) {
    return { isMatch: false, reason: 'No words to compare in correct answer' };
  }

  const userWordSet = new Set(userWords);
  const correctWordSet = new Set(correctWords);

  // Calculate word overlap percentage based on correct answer
  const commonWords = correctWords.filter(w => userWordSet.has(w)).length;
  const overlapPercentage = (commonWords / correctWords.length) * 100;

  console.log(`  Word analysis: ${commonWords}/${correctWords.length} words match (${Math.round(overlapPercentage)}%)`);

  // Require 70%+ of the correct answer's key words to be present
  if (overlapPercentage >= 70) {
    return { isMatch: true, reason: `Word overlap: ${Math.round(overlapPercentage)}%` };
  }

  // Handle common synonyms - but still require good word overlap
  const synonymPairs = [
    ['increase', 'improve', 'enhance', 'boost', 'raise', 'grow'],
    ['decrease', 'reduce', 'lower', 'minimize', 'cut', 'lessen'],
    ['customer', 'client', 'user', 'consumer'],
    ['satisfaction', 'happiness', 'contentment'],
    ['revenue', 'income', 'earnings', 'sales'],
    ['cost', 'expense', 'expenditure'],
    ['efficiency', 'productivity', 'performance'],
  ];

  for (const synonyms of synonymPairs) {
    const userHasSynonym = synonyms.some(syn => userAnswer.includes(syn));
    const correctHasSynonym = synonyms.some(syn => correctAnswer.includes(syn));
    
    if (userHasSynonym && correctHasSynonym) {
      // Even with synonyms, require at least 60% word overlap
      if (overlapPercentage >= 60) {
        return { isMatch: true, reason: `Synonym match + ${Math.round(overlapPercentage)}% overlap` };
      }
    }
  }

  // CRITICAL: No match found - explicitly return false
  return { isMatch: false, reason: `Insufficient overlap: ${Math.round(overlapPercentage)}%` };
}