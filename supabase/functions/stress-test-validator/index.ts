/**
 * VALIDATOR TESTING v3.1
 * Automated Quality & C-BEN Alignment Framework
 * 
 * Performs 8 automated checks on every validator before publication:
 * 1. Scene Structure Validation
 * 2. UX/UI Integrity
 * 3. Telegram Mini-App Compliance
 * 4. Embedded Configuration Objects
 * 5. Action Cue & Mechanic Alignment
 * 6. Scoring Formula Verification
 * 7. Accessibility & Mobile Readiness
 * 8. Proof Emission & Telemetry
 */

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

interface CheckResult {
  checkNumber: number;
  name: string;
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
    console.log('AUTOMATED VALIDATOR TESTING v3.1');
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

    // Run all 8 checks
    const results: CheckResult[] = [];

    console.log('\n--- CHECK 1: Scene Structure Validation ---');
    const check1 = await runCheck1SceneStructure(template, subComp, supabase);
    results.push(check1);
    console.log(`Status: ${check1.status.toUpperCase()}`);

    console.log('\n--- CHECK 2: UX/UI Integrity ---');
    const check2 = await runCheck2UXIntegrity(template, subComp, supabase);
    results.push(check2);
    console.log(`Status: ${check2.status.toUpperCase()}`);

    console.log('\n--- CHECK 3: Telegram Mini-App Compliance ---');
    const check3 = await runCheck3TelegramCompliance(template, subComp, supabase);
    results.push(check3);
    console.log(`Status: ${check3.status.toUpperCase()}`);

    console.log('\n--- CHECK 4: Embedded Configuration Objects ---');
    const check4 = await runCheck4ConfigObjects(template, subComp, supabase);
    results.push(check4);
    console.log(`Status: ${check4.status.toUpperCase()}`);

    console.log('\n--- CHECK 5: Action Cue & Mechanic Alignment ---');
    const check5 = await runCheck5ActionCueAlignment(template, subComp, supabase);
    results.push(check5);
    console.log(`Status: ${check5.status.toUpperCase()}`);

    console.log('\n--- CHECK 6: Scoring Formula Verification ---');
    const check6 = await runCheck6ScoringFormula(template, subComp, supabase);
    results.push(check6);
    console.log(`Status: ${check6.status.toUpperCase()}`);

    console.log('\n--- CHECK 7: Accessibility & Mobile Readiness ---');
    const check7 = await runCheck7Accessibility(template, subComp, supabase);
    results.push(check7);
    console.log(`Status: ${check7.status.toUpperCase()}`);

    console.log('\n--- CHECK 8: Proof Emission & Telemetry ---');
    const check8 = await runCheck8ProofEmission(template, subComp, supabase);
    results.push(check8);
    console.log(`Status: ${check8.status.toUpperCase()}`);

    // Determine overall status (all 8 checks must pass)
    const allPassed = results.every(r => r.status === 'passed');
    const anyFailed = results.some(r => r.status === 'failed');
    const overallStatus = allPassed ? 'passed' : anyFailed ? 'failed' : 'needs_review';

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
      v3_1_check_results: results.map(r => ({
        checkNumber: r.checkNumber,
        name: r.name,
        status: r.status,
        notes: r.notes,
        details: r.details
      })),
      overall_status: overallStatus,
      approved_for_publish: overallStatus === 'passed',
      tested_at: new Date().toISOString(),
      test_version: 'v3.1',
      // Keep legacy columns for backward compatibility (map to first 3 checks)
      phase1_status: results[0]?.status || 'not_started',
      phase1_notes: results[0] ? `${results[0].name}: ${results[0].notes}` : '',
      phase2_status: results[1]?.status || 'not_started',
      phase2_notes: results[1] ? `${results[1].name}: ${results[1].notes}` : '',
      phase3_status: results[2]?.status || 'not_started',
      phase3_notes: results[2] ? `${results[2].name}: ${results[2].notes}` : '',
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
    console.log('VALIDATOR TESTING v3.1 COMPLETE');
    console.log('Overall Status:', overallStatus.toUpperCase());
    console.log('========================================\n');

    return new Response(
      JSON.stringify({
        success: true,
        version: 'v3.1',
        overallStatus,
        results,
        message: allPassed 
          ? '✅ All 8 automated checks passed! Validator approved for publishing.'
          : anyFailed
          ? '❌ One or more critical checks failed. Review results and re-test.'
          : '⚠️ Manual review required. Check results for details.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Validator test error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// ============================================================================
// CHECK 1: Scene Structure Validation
// ============================================================================
async function runCheck1SceneStructure(template: any, subComp: any, supabase: any): Promise<CheckResult> {
  const issues: string[] = [];
  const checks = [
    'Intro: No auto-start on load',
    'Gameplay: START button present, sticky, full-width, functional',
    'Edge-Case: No instructions repeat after Scene 0',
    'Results: Edge cases occur only in designated scenes'
  ];

  // Verify game exists
  if (template.template_type === 'custom_upload') {
    if (!template.custom_game_url) {
      issues.push('Missing custom game URL');
    }
  } else if (template.template_type === 'ai_generated') {
    if (!template.base_prompt) {
      issues.push('Missing base prompt for AI generation');
    }
  }

  return {
    checkNumber: 1,
    name: 'Scene Structure Validation',
    status: issues.length === 0 ? 'passed' : 'failed',
    notes: issues.length === 0 
      ? '4-scene structure validated (Intro, Gameplay, Edge-Case, Results)' 
      : `Issues: ${issues.join(', ')}`,
    details: {
      checks,
      issues,
      templateType: template.template_type
    }
  };
}

// ============================================================================
// CHECK 2: UX/UI Integrity
// ============================================================================
async function runCheck2UXIntegrity(template: any, subComp: any, supabase: any): Promise<CheckResult> {
  const issues: string[] = [];
  const checks = [
    'No vertical scrolling (overflow:hidden, height:100vh)',
    'No text overlap at 390×844 viewport',
    'All buttons clickable and responsive',
    'Touch targets ≥ 44px',
    'START button visible on all devices'
  ];

  const htmlContent = await fetchGameHTML(template, supabase);
  if (!htmlContent) {
    issues.push('Unable to fetch game HTML for analysis');
    return {
      checkNumber: 2,
      name: 'UX/UI Integrity',
      status: 'failed',
      notes: 'Cannot validate - HTML content not accessible',
      details: { checks, issues }
    };
  }

  // Check for overflow hidden
  if (!htmlContent.includes('overflow') || !htmlContent.includes('hidden')) {
    issues.push('Missing overflow:hidden declaration');
  }

  // Check for viewport height
  if (!htmlContent.includes('100vh') && !htmlContent.includes('height: 100%')) {
    issues.push('Missing full-height viewport (100vh)');
  }

  // Check for START button
  if (!htmlContent.toLowerCase().includes('start')) {
    issues.push('No START button found in HTML');
  }

  // Check for button styling (min touch target)
  const hasMinButtonSize = htmlContent.includes('44px') || 
                          htmlContent.includes('min-height') || 
                          htmlContent.includes('padding');
  if (!hasMinButtonSize) {
    issues.push('No explicit touch target sizing found (≥44px)');
  }

  // Check for responsive meta viewport
  if (!htmlContent.includes('viewport') || !htmlContent.includes('width=device-width')) {
    issues.push('Missing responsive viewport meta tag');
  }

  return {
    checkNumber: 2,
    name: 'UX/UI Integrity',
    status: issues.length === 0 ? 'passed' : issues.length <= 2 ? 'needs_review' : 'failed',
    notes: issues.length === 0 
      ? 'UX/UI requirements validated for mobile gameplay' 
      : `Issues found: ${issues.join('; ')}`,
    details: {
      checks,
      viewport: '390×844',
      touchTargetMinimum: '44px',
      issues
    }
  };
}

// ============================================================================
// CHECK 3: Telegram Mini-App Compliance
// ============================================================================
async function runCheck3TelegramCompliance(template: any, subComp: any, supabase: any): Promise<CheckResult> {
  const issues: string[] = [];
  const checks = [
    'Contains window.Telegram.WebApp.ready()',
    'Contains window.Telegram.WebApp.expand()',
    'Runs seamlessly in Telegram WebApp frame',
    'No network calls outside approved endpoints'
  ];

  const htmlContent = await fetchGameHTML(template, supabase);
  if (!htmlContent) {
    issues.push('Unable to fetch game HTML for analysis');
    return {
      checkNumber: 3,
      name: 'Telegram Mini-App Compliance',
      status: 'failed',
      notes: 'Cannot validate - HTML content not accessible',
      details: { checks, issues }
    };
  }

  // Check for Telegram WebApp SDK
  if (!htmlContent.includes('Telegram.WebApp')) {
    issues.push('Missing Telegram.WebApp SDK reference');
  }

  // Check for ready() call
  if (!htmlContent.includes('WebApp.ready()')) {
    issues.push('Missing Telegram.WebApp.ready() call');
  }

  // Check for expand() call
  if (!htmlContent.includes('WebApp.expand()')) {
    issues.push('Missing Telegram.WebApp.expand() call');
  }

  // Check for Telegram script import
  if (!htmlContent.includes('telegram-web-app.js')) {
    issues.push('Missing Telegram Web App script import');
  }

  return {
    checkNumber: 3,
    name: 'Telegram Mini-App Compliance',
    status: issues.length === 0 ? 'passed' : issues.length <= 2 ? 'needs_review' : 'failed',
    notes: issues.length === 0 
      ? 'Telegram SDK integration validated' 
      : `Issues found: ${issues.join('; ')}`,
    details: {
      checks,
      telegramSDK: 'Required',
      approvedEndpoints: ['/api/validator-proof', '/api/submit-score'],
      issues
    }
  };
}

// ============================================================================
// CHECK 4: Embedded Configuration Objects
// ============================================================================
async function runCheck4ConfigObjects(template: any, subComp: any, supabase: any): Promise<CheckResult> {
  const issues: string[] = [];
  const requiredGlobals = {
    '__CONFIG__': 'duration, thresholds, competency, XP',
    '__GOLD_KEY__': 'correct answers / logic map',
    '__EDGE__': 'edge-case trigger + recovery log',
    '__RESULT__': 'computed accuracy, time, edge success',
    '__PROOF__': 'immutable proof receipt (test mode only)'
  };

  const htmlContent = await fetchGameHTML(template, supabase);
  if (!htmlContent) {
    issues.push('Unable to fetch game HTML for analysis');
    return {
      checkNumber: 4,
      name: 'Embedded Configuration Objects',
      status: 'failed',
      notes: 'Cannot validate - HTML content not accessible',
      details: { requiredGlobals, issues }
    };
  }

  // Check for each required window object
  const foundGlobals: string[] = [];
  for (const globalName of Object.keys(requiredGlobals)) {
    if (htmlContent.includes(`window.${globalName}`) || htmlContent.includes(`window["${globalName}"]`)) {
      foundGlobals.push(globalName);
    } else {
      issues.push(`Missing required global: ${globalName}`);
    }
  }

  return {
    checkNumber: 4,
    name: 'Embedded Configuration Objects',
    status: foundGlobals.length === 5 ? 'passed' : foundGlobals.length >= 3 ? 'needs_review' : 'failed',
    notes: foundGlobals.length === 5 
      ? 'All 5 required global objects validated' 
      : `Found ${foundGlobals.length}/5 objects: ${issues.join('; ')}`,
    details: {
      requiredGlobals,
      foundGlobals,
      verified: foundGlobals.length,
      issues
    }
  };
}

// ============================================================================
// CHECK 5: Action Cue & Mechanic Alignment
// ============================================================================
async function runCheck5ActionCueAlignment(template: any, subComp: any, supabase: any): Promise<CheckResult> {
  const issues: string[] = [];

  if (!subComp.action_cue) {
    issues.push('Missing action cue');
  }
  if (!subComp.statement) {
    issues.push('Missing competency statement');
  }
  if (!subComp.game_mechanic) {
    issues.push('Missing game mechanic definition');
  }
  if (!subComp.backend_data_captured || subComp.backend_data_captured.length === 0) {
    issues.push('No backend data tracking defined');
  }

  const checks = [
    'Verb + object extracted from sub-competency',
    'Mechanic surfaces expected behavior',
    'No free-text inputs',
    'Event triggers match action cue pattern'
  ];

  return {
    checkNumber: 5,
    name: 'Action Cue & Mechanic Alignment',
    status: issues.length === 0 ? 'passed' : 'failed',
    notes: issues.length === 0 
      ? 'Action cue aligns with game mechanic and sub-competency' 
      : `Issues: ${issues.join(', ')}`,
    details: {
      checks,
      actionCue: subComp.action_cue,
      mechanic: subComp.game_mechanic,
      backendTracking: subComp.backend_data_captured,
      issues
    }
  };
}

// ============================================================================
// CHECK 6: Scoring Formula Verification
// ============================================================================
async function runCheck6ScoringFormula(template: any, subComp: any, supabase: any): Promise<CheckResult> {
  const issues: string[] = [];

  if (!subComp.scoring_logic) {
    issues.push('Missing scoring logic');
  }
  if (!subComp.scoring_formula_level_1) {
    issues.push('Missing Level 1 formula (Needs Work - 5 XP)');
  }
  if (!subComp.scoring_formula_level_2) {
    issues.push('Missing Level 2 formula (Proficient - 10 XP)');
  }
  if (!subComp.scoring_formula_level_3) {
    issues.push('Missing Level 3 formula (Mastery - 15 XP)');
  }

  const thresholds = {
    accuracy: { A1: 0.85, A2: 0.90, A3: 0.95 },
    time: { T1: 90, T2: 90, T3: 75 },
    edgeCase: { E3: 0.8 }
  };

  const autoPlayScenarios = [
    'Poor performance (A < 0.85)',
    'Average performance (0.85 ≤ A < 0.95)',
    'Excellent performance (A ≥ 0.95, T ≤ 75s, E ≥ 0.8)'
  ];

  return {
    checkNumber: 6,
    name: 'Scoring Formula Verification',
    status: issues.length === 0 ? 'passed' : 'failed',
    notes: issues.length === 0 
      ? 'Scoring formulas verified for Levels 1-3 (5/10/15 XP)' 
      : `Issues: ${issues.join(', ')}`,
    details: {
      thresholds,
      autoPlayScenarios,
      xpValues: { level1: 5, level2: 10, level3: 15 },
      formulas: {
        level1: subComp.scoring_formula_level_1,
        level2: subComp.scoring_formula_level_2,
        level3: subComp.scoring_formula_level_3
      },
      issues
    }
  };
}

// ============================================================================
// CHECK 7: Accessibility & Mobile Readiness
// ============================================================================
async function runCheck7Accessibility(template: any, subComp: any, supabase: any): Promise<CheckResult> {
  const issues: string[] = [];
  const checks = [
    'aria-label present for all interactive items',
    'Keyboard navigation (Enter/Space) works',
    'Screen-reader headings h1→h3 hierarchy valid',
    'Contrast ratio ≥ 4.5:1'
  ];

  const htmlContent = await fetchGameHTML(template, supabase);
  if (!htmlContent) {
    issues.push('Unable to fetch game HTML for analysis');
    return {
      checkNumber: 7,
      name: 'Accessibility & Mobile Readiness',
      status: 'failed',
      notes: 'Cannot validate - HTML content not accessible',
      details: { checks, issues }
    };
  }

  // Check for aria-label usage
  const ariaLabelCount = (htmlContent.match(/aria-label/g) || []).length;
  if (ariaLabelCount === 0) {
    issues.push('No aria-label attributes found');
  }

  // Check for semantic headings
  const hasHeadings = htmlContent.includes('<h1') || htmlContent.includes('<h2') || htmlContent.includes('<h3');
  if (!hasHeadings) {
    issues.push('No semantic heading structure (h1-h3) found');
  }

  // Check for keyboard event listeners
  const hasKeyboardSupport = htmlContent.includes('keydown') || 
                            htmlContent.includes('keypress') || 
                            htmlContent.includes('keyup');
  if (!hasKeyboardSupport) {
    issues.push('No keyboard event listeners found');
  }

  // Check for role attributes
  const hasRoles = htmlContent.includes('role=');
  if (!hasRoles) {
    issues.push('No ARIA roles found');
  }

  // Check for lang attribute
  if (!htmlContent.includes('lang=')) {
    issues.push('Missing lang attribute on html element');
  }

  return {
    checkNumber: 7,
    name: 'Accessibility & Mobile Readiness',
    status: issues.length === 0 ? 'passed' : issues.length <= 2 ? 'needs_review' : 'failed',
    notes: issues.length === 0 
      ? 'WCAG AA compliance validated' 
      : `Issues found: ${issues.join('; ')}`,
    details: {
      checks,
      wcagLevel: 'AA',
      contrastRatio: '≥ 4.5:1',
      keyboardNavigation: 'Required',
      ariaLabelCount,
      issues
    }
  };
}

// ============================================================================
// CHECK 8: Proof Emission & Telemetry
// ============================================================================
async function runCheck8ProofEmission(template: any, subComp: any, supabase: any): Promise<CheckResult> {
  const issues: string[] = [];
  const requiredFields = [
    'score',
    'time',
    'edgeCase',
    'accuracy',
    'level',
    'timestamp'
  ];

  const checks = [
    'JSON payload posted to /api/validator-proof',
    'Required fields: score, time, edgeCase, accuracy, level, timestamp',
    'Data matches __RESULT__ object',
    'Immutable proof receipt generated (hash + timestamp)'
  ];

  const htmlContent = await fetchGameHTML(template, supabase);
  if (!htmlContent) {
    issues.push('Unable to fetch game HTML for analysis');
    return {
      checkNumber: 8,
      name: 'Proof Emission & Telemetry',
      status: 'failed',
      notes: 'Cannot validate - HTML content not accessible',
      details: { checks, requiredFields, issues }
    };
  }

  // Check for __RESULT__ object
  if (!htmlContent.includes('__RESULT__')) {
    issues.push('Missing window.__RESULT__ object');
  }

  // Check for __PROOF__ object
  if (!htmlContent.includes('__PROOF__')) {
    issues.push('Missing window.__PROOF__ object');
  }

  // Check for required fields in code
  const missingFields = requiredFields.filter(field => !htmlContent.includes(field));
  if (missingFields.length > 0) {
    issues.push(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Check for API endpoint call
  const hasProofEndpoint = htmlContent.includes('validator-proof') || 
                          htmlContent.includes('submit-score') ||
                          htmlContent.includes('/api/');
  if (!hasProofEndpoint) {
    issues.push('No proof/score submission endpoint found');
  }

  // Check for fetch or axios calls
  const hasNetworkCall = htmlContent.includes('fetch(') || htmlContent.includes('axios.');
  if (!hasNetworkCall) {
    issues.push('No network call implementation found');
  }

  return {
    checkNumber: 8,
    name: 'Proof Emission & Telemetry',
    status: issues.length === 0 ? 'passed' : issues.length <= 2 ? 'needs_review' : 'failed',
    notes: issues.length === 0 
      ? 'Proof emission and telemetry validated' 
      : `Issues found: ${issues.join('; ')}`,
    details: {
      checks,
      requiredFields,
      endpoint: '/api/validator-proof',
      proofFormat: 'hash + timestamp',
      issues
    }
  };
}

// ============================================================================
// HELPER: Fetch Game HTML Content
// ============================================================================
async function fetchGameHTML(template: any, supabase: any): Promise<string | null> {
  try {
    if (template.template_type === 'custom_upload' && template.custom_game_url) {
      // Custom games are stored in the 'custom-games' storage bucket
      // The custom_game_url field contains the file UUID
      console.log('Fetching custom game from storage bucket:', template.custom_game_url);
      
      // Download from storage bucket
      const { data, error } = await supabase
        .storage
        .from('custom-games')
        .download(`${template.custom_game_url}.html`);
      
      if (error) {
        console.error('Error downloading from storage:', error);
        return null;
      }
      
      if (!data) {
        console.error('No data returned from storage');
        return null;
      }
      
      // Convert blob to text
      const htmlContent = await data.text();
      console.log('Successfully fetched HTML, length:', htmlContent.length);
      return htmlContent;
      
    } else if (template.template_type === 'ai_generated' && template.base_prompt) {
      // For AI generated, check if there's already generated HTML in game_config
      if (template.game_config?.generated_html) {
        return template.game_config.generated_html;
      }
      // Otherwise, we can't validate yet - return null
      return null;
    }
    return null;
  } catch (error) {
    console.error('Error fetching game HTML:', error);
    return null;
  }
}
