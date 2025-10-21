import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Answer Validation Service
 * Compares user answers against knowledgebase with intelligent normalization
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
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { questions }: ValidateRequest = await req.json();

    console.log('Validating answers for', questions.length, 'questions');

    const details = questions.map(q => {
      const normalized = normalizeAnswer(q.userAnswer);
      const isCorrect = q.correctAnswers.some(correctAns => 
        isAnswerMatch(normalized, normalizeAnswer(correctAns))
      );
      
      const matchedAnswer = isCorrect 
        ? q.correctAnswers.find(correctAns => 
            isAnswerMatch(normalized, normalizeAnswer(correctAns))
          )
        : undefined;

      return {
        question: q.question,
        userAnswer: q.userAnswer,
        correctAnswers: q.correctAnswers,
        isCorrect,
        matchedAnswer
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

    console.log('Validation complete:', {
      accuracy: result.accuracy,
      correct: correctAnswers,
      total: totalQuestions
    });

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
 * Uses multiple matching strategies:
 * 1. Exact match (after normalization)
 * 2. Contains match (for longer answers)
 * 3. Synonym match (common alternatives)
 */
function isAnswerMatch(userAnswer: string, correctAnswer: string): boolean {
  // Exact match after normalization
  if (userAnswer === correctAnswer) {
    return true;
  }

  // Handle very short answers differently
  if (correctAnswer.length < 4) {
    return userAnswer === correctAnswer;
  }

  // For longer answers, check if user answer contains the correct answer or vice versa
  // This handles cases like "customer satisfaction" vs "satisfaction of customers"
  const userWords = new Set(userAnswer.split(' ').filter(w => w.length > 2));
  const correctWords = new Set(correctAnswer.split(' ').filter(w => w.length > 2));

  // Calculate word overlap percentage
  const commonWords = [...userWords].filter(w => correctWords.has(w)).length;
  const totalUniqueWords = new Set([...userWords, ...correctWords]).size;
  const overlapPercentage = (commonWords / Math.max(correctWords.size, 1)) * 100;

  // If 70%+ of the key words match, consider it correct
  if (overlapPercentage >= 70) {
    return true;
  }

  // Handle common synonyms and variations
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
      // If both contain synonyms from the same group, boost match likelihood
      if (overlapPercentage >= 50) {
        return true;
      }
    }
  }

  return false;
}
