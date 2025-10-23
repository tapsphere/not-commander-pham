/**
 * BASE LAYER 1 v3.1 Validation Utility
 * Validates generated games against the BAKED & LOCKED specification
 */

export interface WindowConfig {
  brandName: string;
  primaryColor: string;
  secondaryColor: string;
  logo: string;
  timeLimit: number;
}

export interface WindowGoldKey {
  subCompetency: string;
  correctAnswers: any[];
  scoringRubric: {
    mastery: { threshold: number; xp: number };
    proficient: { threshold: number; xp: number };
    needsWork: { threshold: number; xp: number };
  };
}

export interface WindowEdge {
  scenario: string;
  triggerCondition: string;
}

export interface WindowResult {
  score: number;
  level: 'Mastery' | 'Proficient' | 'Needs Work';
  xp: number;
  time_spent: number;
  competency_name?: string;
}

export interface WindowProof {
  actions: Array<{
    timestamp: number;
    action: string;
    data: any;
  }>;
  timestamps: number[];
  competency_scores: Record<string, number>;
  raw_answers?: any[];
}

export interface V3ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100
  details: {
    hasConfig: boolean;
    hasGoldKey: boolean;
    hasEdge: boolean;
    hasResult: boolean;
    hasProof: boolean;
    sceneStructure: {
      hasIntro: boolean;
      hasActions: boolean;
      hasFinalResults: boolean;
    };
    scoring: {
      usesV31Formulas: boolean;
      hasCorrectLevels: boolean;
      hasXpValues: boolean;
    };
    mobile: {
      hasViewportMeta: boolean;
      hasTouchOptimization: boolean;
    };
    accessibility: {
      hasAriaLabels: boolean;
      hasKeyboardNav: boolean;
      hasFocusIndicators: boolean;
    };
  };
}

/**
 * Validate v3.1 compliance by checking window objects in generated HTML
 */
export function validateV31Compliance(html: string): V3ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 0;

  const details = {
    hasConfig: false,
    hasGoldKey: false,
    hasEdge: false,
    hasResult: false,
    hasProof: false,
    sceneStructure: {
      hasIntro: false,
      hasActions: false,
      hasFinalResults: false,
    },
    scoring: {
      usesV31Formulas: false,
      hasCorrectLevels: false,
      hasXpValues: false,
    },
    mobile: {
      hasViewportMeta: false,
      hasTouchOptimization: false,
    },
    accessibility: {
      hasAriaLabels: false,
      hasKeyboardNav: false,
      hasFocusIndicators: false,
    },
  };

  // Check for required window objects
  if (html.includes('window.__CONFIG__')) {
    details.hasConfig = true;
    score += 15;
  } else {
    errors.push('Missing window.__CONFIG__ object');
  }

  if (html.includes('window.__GOLD_KEY__')) {
    details.hasGoldKey = true;
    score += 15;
  } else {
    errors.push('Missing window.__GOLD_KEY__ object');
  }

  if (html.includes('window.__EDGE__')) {
    details.hasEdge = true;
    score += 10;
  } else {
    warnings.push('Missing window.__EDGE__ object (edge-case scenario)');
  }

  if (html.includes('window.__RESULT__')) {
    details.hasResult = true;
    score += 20;
  } else {
    errors.push('Missing window.__RESULT__ object - required for scoring');
  }

  if (html.includes('window.__PROOF__')) {
    details.hasProof = true;
    score += 15;
  } else {
    errors.push('Missing window.__PROOF__ object - required for telemetry');
  }

  // Check scene structure
  if (html.includes('scene-0') || html.includes('intro-screen') || html.includes('Scene 0')) {
    details.sceneStructure.hasIntro = true;
    score += 5;
  } else {
    warnings.push('Cannot detect Scene 0 (Intro Screen)');
  }

  if (html.includes('scene-1') || html.includes('Scene 1')) {
    details.sceneStructure.hasActions = true;
    score += 5;
  } else {
    warnings.push('Cannot detect Scene 1 (First Action)');
  }

  if (html.includes('results') || html.includes('final-score') || html.includes('Scene') && html.includes('Results')) {
    details.sceneStructure.hasFinalResults = true;
    score += 5;
  } else {
    warnings.push('Cannot detect Final Results Screen');
  }

  // Check v3.1 scoring
  const hasMastery = html.includes('Mastery') || html.includes('mastery');
  const hasProficient = html.includes('Proficient') || html.includes('proficient');
  const hasNeedsWork = html.includes('Needs Work') || html.includes('needsWork');

  if (hasMastery && hasProficient && hasNeedsWork) {
    details.scoring.hasCorrectLevels = true;
    score += 5;
  } else {
    warnings.push('Missing v3.1 proficiency levels (Mastery, Proficient, Needs Work)');
  }

  if (html.includes('xp') || html.includes('XP')) {
    details.scoring.hasXpValues = true;
    score += 5;
  } else {
    warnings.push('Cannot detect XP values in scoring');
  }

  // Check mobile optimization
  if (html.includes('viewport') && html.includes('width=device-width')) {
    details.mobile.hasViewportMeta = true;
    score += 3;
  } else {
    errors.push('Missing viewport meta tag for mobile');
  }

  if (html.includes('touch') || html.includes('pointer')) {
    details.mobile.hasTouchOptimization = true;
    score += 2;
  } else {
    warnings.push('Cannot detect touch optimization');
  }

  // Check accessibility
  if (html.includes('aria-label') || html.includes('aria-')) {
    details.accessibility.hasAriaLabels = true;
    score += 2;
  } else {
    warnings.push('Missing ARIA labels for accessibility');
  }

  if (html.includes('tabindex') || html.includes('tabIndex')) {
    details.accessibility.hasKeyboardNav = true;
    score += 2;
  } else {
    warnings.push('Missing keyboard navigation support');
  }

  if (html.includes('focus') || html.includes(':focus')) {
    details.accessibility.hasFocusIndicators = true;
    score += 1;
  } else {
    warnings.push('Missing focus indicators');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.min(100, score),
    details,
  };
}

/**
 * Extract window objects from iframe
 */
export function extractWindowObjects(iframeWindow: Window): {
  config: WindowConfig | null;
  goldKey: WindowGoldKey | null;
  edge: WindowEdge | null;
  result: WindowResult | null;
  proof: WindowProof | null;
} {
  try {
    return {
      config: (iframeWindow as any).__CONFIG__ || null,
      goldKey: (iframeWindow as any).__GOLD_KEY__ || null,
      edge: (iframeWindow as any).__EDGE__ || null,
      result: (iframeWindow as any).__RESULT__ || null,
      proof: (iframeWindow as any).__PROOF__ || null,
    };
  } catch (error) {
    console.error('Failed to extract window objects:', error);
    return {
      config: null,
      goldKey: null,
      edge: null,
      result: null,
      proof: null,
    };
  }
}

/**
 * Calculate v3.1 proficiency level based on score
 */
export function calculateV31Level(
  score: number,
  threshold: number = 0.8
): 'Mastery' | 'Proficient' | 'Needs Work' {
  if (score >= 90) return 'Mastery';
  if (score >= threshold * 100) return 'Proficient';
  return 'Needs Work';
}

/**
 * Calculate XP based on PlayOps Framework (CBEN_PlayOps_Framework_Lian.xlsx)
 * Source: Tab 4 - XP Award column
 */
export function calculateV31XP(
  level: 'Mastery' | 'Proficient' | 'Needs Work',
  score: number
): number {
  // From PlayOps spreadsheet Tab 4 - DO NOT MODIFY without updating source
  const baseXP = {
    Mastery: 15,         // L3: 15 XP
    Proficient: 10,      // L2: 10 XP
    'Needs Work': 5,     // L1: 5 XP
  };

  return Math.floor(baseXP[level] * (score / 100));
}
