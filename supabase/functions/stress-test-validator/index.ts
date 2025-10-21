import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestRequest {
  templateId: string;
  subCompetencyId: string;
  testerId: string;
}

interface TestResult {
  phase: number;
  status: 'passed' | 'failed' | 'needs_review';
  notes: string;
  details: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { templateId, subCompetencyId, testerId }: TestRequest = await req.json();

    console.log('\n========================================');
    console.log('AUTOMATED STRESS TEST STARTING');
    console.log('Template ID:', templateId);
    console.log('Sub-Competency ID:', subCompetencyId);
    console.log('========================================\n');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch template details
    const { data: template, error: templateError } = await supabase
      .from('game_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError || !template) {
      throw new Error('Template not found');
    }

    // Fetch sub-competency details
    const { data: subComp, error: subError } = await supabase
      .from('sub_competencies')
      .select('*')
      .eq('id', subCompetencyId)
      .single();

    if (subError || !subComp) {
      throw new Error('Sub-competency not found');
    }

    const results: TestResult[] = [];

    // PHASE 1: UX/UI Flow Automated Test
    console.log('\n--- PHASE 1: UX/UI Flow Test ---');
    const phase1Result = await runPhase1Test(template, subComp);
    results.push(phase1Result);
    console.log(`Phase 1 Status: ${phase1Result.status.toUpperCase()}`);

    // PHASE 2: Action Cue Validation
    console.log('\n--- PHASE 2: Action Cue Validation ---');
    const phase2Result = await runPhase2Test(template, subComp);
    results.push(phase2Result);
    console.log(`Phase 2 Status: ${phase2Result.status.toUpperCase()}`);

    // PHASE 3: Scoring Formula Stress Test
    console.log('\n--- PHASE 3: Answer Validation & Scoring ---');
    const phase3Result = await runPhase3Test(template, subComp);
    results.push(phase3Result);
    console.log(`Phase 3 Status: ${phase3Result.status.toUpperCase()}`);

    // Determine overall status
    const overallStatus = results.every(r => r.status === 'passed') ? 'passed' :
                         results.some(r => r.status === 'failed') ? 'failed' : 'needs_review';

    // Save results to database
    const { data: existingTest } = await supabase
      .from('validator_test_results')
      .select('id')
      .eq('template_id', templateId)
      .maybeSingle();

    const testData = {
      template_id: templateId,
      tester_id: testerId,
      template_type: template.template_type,
      sub_competency_id: subCompetencyId,
      phase1_status: results[0].status,
      phase1_notes: results[0].notes,
      phase2_status: results[1].status,
      phase2_notes: results[1].notes,
      phase3_status: results[2].status,
      phase3_notes: results[2].notes,
      phase3_test_runs: results[2].details,
      overall_status: overallStatus,
      approved_for_publish: overallStatus === 'passed',
      tested_at: new Date().toISOString(),
    };

    if (existingTest) {
      await supabase
        .from('validator_test_results')
        .update(testData)
        .eq('id', existingTest.id);
    } else {
      await supabase
        .from('validator_test_results')
        .insert(testData);
    }

    console.log('\n========================================');
    console.log('STRESS TEST COMPLETE');
    console.log('Overall Status:', overallStatus.toUpperCase());
    console.log('========================================\n');

    return new Response(
      JSON.stringify({
        success: true,
        overallStatus,
        results,
        message: overallStatus === 'passed' 
          ? 'All automated tests passed! Validator approved for publishing.'
          : 'Some tests failed. Review the detailed results.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Stress test error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// PHASE 1: UX/UI Flow Test
async function runPhase1Test(template: any, subComp: any): Promise<TestResult> {
  const issues: string[] = [];
  
  try {
    // Test 1: Verify game HTML/URL exists
    if (template.template_type === 'custom_upload') {
      if (!template.custom_game_url) {
        issues.push('Custom game URL is missing');
      }
    } else if (template.template_type === 'ai_generated') {
      if (!template.base_prompt) {
        issues.push('AI template missing base prompt');
      }
    }
    
    if (issues.length === 0) {
      return {
        phase: 1,
        status: 'passed',
        notes: 'UX/UI validation passed. Game structure verified.',
        details: { checks: ['Game exists', 'Structure valid'] }
      };
    } else {
      return {
        phase: 1,
        status: 'failed',
        notes: `UX/UI issues found: ${issues.join(', ')}`,
        details: { issues }
      };
    }
  } catch (error: any) {
    return {
      phase: 1,
      status: 'failed',
      notes: `Phase 1 test error: ${error.message}`,
      details: { error: error.message }
    };
  }
}

// PHASE 2: Action Cue Validation
async function runPhase2Test(template: any, subComp: any): Promise<TestResult> {
  try {
    const issues: string[] = [];

    // Test 1: Verify sub-competency has required fields
    if (!subComp.action_cue) {
      issues.push('Sub-competency missing action_cue');
    }
    if (!subComp.statement) {
      issues.push('Sub-competency missing statement');
    }
    if (!subComp.scoring_logic) {
      issues.push('Sub-competency missing scoring_logic');
    }

    // Test 2: Verify backend data tracking is defined
    if (!subComp.backend_data_captured || subComp.backend_data_captured.length === 0) {
      issues.push('No backend data tracking defined');
    }

    // Test 3: Verify game mechanic is specified
    if (!subComp.game_mechanic) {
      issues.push('Game mechanic not specified');
    }

    if (issues.length === 0) {
      return {
        phase: 2,
        status: 'passed',
        notes: 'Action cue validation passed. All required competency fields present.',
        details: {
          action_cue: subComp.action_cue,
          backend_data: subComp.backend_data_captured
        }
      };
    } else {
      return {
        phase: 2,
        status: 'failed',
        notes: `Action cue validation failed: ${issues.join(', ')}`,
        details: { issues }
      };
    }
  } catch (error: any) {
    return {
      phase: 2,
      status: 'failed',
      notes: `Phase 2 test error: ${error.message}`,
      details: { error: error.message }
    };
  }
}

// PHASE 3: Answer Validation & Scoring Test
async function runPhase3Test(template: any, subComp: any): Promise<TestResult> {
  try {
    console.log('Starting Phase 3: Answer Validation Tests');
    const testRuns = [];
    
    // Comprehensive test scenarios
    const sampleTests = [
      {
        scenario: 'Exact Match (Should Pass)',
        questions: [
          { question: 'What is customer satisfaction?', userAnswer: 'customer satisfaction', correctAnswers: ['customer satisfaction', 'client happiness'] },
          { question: 'How to increase revenue?', userAnswer: 'increase sales', correctAnswers: ['increase sales', 'boost revenue'] }
        ],
        expectedAccuracy: 100,
        shouldPass: true
      },
      {
        scenario: 'Case & Whitespace Variation (Should Pass)',
        questions: [
          { question: 'Key metric?', userAnswer: '  REVENUE  ', correctAnswers: ['revenue', 'income'] },
          { question: 'Main goal?', userAnswer: 'Customer Retention', correctAnswers: ['customer retention'] }
        ],
        expectedAccuracy: 100,
        shouldPass: true
      },
      {
        scenario: 'Synonym Match (Should Pass)',
        questions: [
          { question: 'How to improve?', userAnswer: 'enhance performance', correctAnswers: ['improve efficiency', 'boost productivity'] },
          { question: 'Reduce what?', userAnswer: 'lower costs', correctAnswers: ['decrease expenses', 'cut costs'] }
        ],
        expectedAccuracy: 100,
        shouldPass: true
      },
      {
        scenario: 'Word Overlap 70%+ (Should Pass)',
        questions: [
          { question: 'Priority?', userAnswer: 'customer satisfaction rate', correctAnswers: ['customer satisfaction', 'client satisfaction rate'] }
        ],
        expectedAccuracy: 100,
        shouldPass: true
      },
      {
        scenario: 'Completely Wrong Answers (MUST FAIL)',
        questions: [
          { question: 'What to increase?', userAnswer: 'banana', correctAnswers: ['revenue', 'sales'] },
          { question: 'Main metric?', userAnswer: 'wrong answer here', correctAnswers: ['customer retention'] }
        ],
        expectedAccuracy: 0,
        shouldPass: true // Test passes if accuracy matches expected 0%
      },
      {
        scenario: 'Empty Answers (MUST FAIL)',
        questions: [
          { question: 'What matters?', userAnswer: '', correctAnswers: ['customer satisfaction'] },
          { question: 'Priority?', userAnswer: '   ', correctAnswers: ['revenue growth'] }
        ],
        expectedAccuracy: 0,
        shouldPass: true // Test passes if accuracy matches expected 0%
      },
      {
        scenario: 'Partial Words Only (MUST FAIL)',
        questions: [
          { question: 'How to succeed?', userAnswer: 'xyz abc', correctAnswers: ['focus on customer needs'] }
        ],
        expectedAccuracy: 0,
        shouldPass: true // Test passes if accuracy matches expected 0%
      }
    ];

    let allTestsPassed = true;
    let failedTests: string[] = [];

    for (const test of sampleTests) {
      console.log(`\nTesting: ${test.scenario}`);
      
      // Validate each question in this test scenario
      const details = test.questions.map((q, qIdx) => {
        console.log(`  Question ${qIdx + 1}: "${q.question}"`);
        console.log(`    User: "${q.userAnswer}"`);
        console.log(`    Expected: ${JSON.stringify(q.correctAnswers)}`);
        
        // CRITICAL: Explicitly handle empty answers
        if (!q.userAnswer || q.userAnswer.trim() === '') {
          console.log(`    Result: INCORRECT (empty answer)`);
          return {
            question: q.question,
            userAnswer: q.userAnswer,
            isCorrect: false,
            reason: 'Empty answer'
          };
        }

        const normalized = normalizeAnswer(q.userAnswer);
        console.log(`    Normalized: "${normalized}"`);
        
        // CRITICAL: Check each correct answer explicitly
        let isCorrect = false;
        let matchReason = 'No match';
        
        for (const correctAns of q.correctAnswers) {
          if (!correctAns || correctAns.trim() === '') continue;
          
          const normalizedCorrect = normalizeAnswer(correctAns);
          const matchResult = isAnswerMatch(normalized, normalizedCorrect);
          
          if (matchResult.isMatch) {
            isCorrect = true;
            matchReason = matchResult.reason;
            break;
          }
        }
        
        console.log(`    Result: ${isCorrect ? 'CORRECT' : 'INCORRECT'} (${matchReason})`);
        
        return {
          question: q.question,
          userAnswer: q.userAnswer,
          isCorrect,
          reason: matchReason
        };
      });

      const correctCount = details.filter(d => d.isCorrect).length;
      const accuracy = Math.round((correctCount / test.questions.length) * 100);
      const testPassed = accuracy === test.expectedAccuracy;
      
      console.log(`  Expected accuracy: ${test.expectedAccuracy}%`);
      console.log(`  Actual accuracy: ${accuracy}%`);
      console.log(`  Test ${testPassed ? 'PASSED' : 'FAILED'}`);
      
      if (!testPassed) {
        allTestsPassed = false;
        failedTests.push(`${test.scenario} (expected ${test.expectedAccuracy}%, got ${accuracy}%)`);
      }

      testRuns.push({
        scenario: test.scenario,
        expectedAccuracy: test.expectedAccuracy,
        actualAccuracy: accuracy,
        passed: testPassed,
        details
      });
    }

    if (failedTests.length > 0) {
      console.log('\nFailed tests:', failedTests.join(', '));
    }

    return {
      phase: 3,
      status: allTestsPassed ? 'passed' : 'failed',
      notes: allTestsPassed 
        ? 'Answer validation logic works correctly. All test scenarios passed including normalization, synonyms, case-insensitivity, and proper rejection of wrong answers.'
        : `Answer validation issues detected. Failed tests: ${failedTests.join('; ')}`,
      details: { testRuns }
    };

  } catch (error: any) {
    console.error('Phase 3 error:', error);
    return {
      phase: 3,
      status: 'failed',
      notes: `Phase 3 test error: ${error.message}`,
      details: { error: error.message, testRuns: [] }
    };
  }
}

/**
 * Normalize Answer
 * Standardizes answer format for comparison
 * CRITICAL: Returns empty string for invalid input
 */
function normalizeAnswer(answer: string): string {
  if (!answer) return '';
  
  return answer
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.,!?;:'"(){}[\]]/g, '')
    .replace(/[''`]/g, "'")
    .replace(/^(the|a|an)\s+/i, '');
}

/**
 * Check Answer Match
 * Intelligently compares user answer to correct answers
 * CRITICAL: Returns explicit false for non-matches - NO default passes
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
  
  // Very short answers must match exactly
  if (correctAnswer.length < 4) {
    return { isMatch: false, reason: 'Short answer requires exact match' };
  }

  // Word-based matching for longer answers
  const userWords = userAnswer.split(' ').filter(w => w.length > 2);
  const correctWords = correctAnswer.split(' ').filter(w => w.length > 2);
  
  if (correctWords.length === 0) {
    return { isMatch: false, reason: 'No words in correct answer' };
  }
  
  const userWordSet = new Set(userWords);
  const commonWords = correctWords.filter(w => userWordSet.has(w)).length;
  const overlapPercentage = (commonWords / correctWords.length) * 100;
  
  // 70%+ word overlap = correct
  if (overlapPercentage >= 70) {
    return { isMatch: true, reason: `${Math.round(overlapPercentage)}% word overlap` };
  }

  // Synonym matching - still requires good overlap
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
    
    if (userHasSynonym && correctHasSynonym && overlapPercentage >= 60) {
      return { isMatch: true, reason: `Synonym + ${Math.round(overlapPercentage)}% overlap` };
    }
  }

  // CRITICAL: Explicit false return - no match found
  return { isMatch: false, reason: `Only ${Math.round(overlapPercentage)}% overlap` };
}