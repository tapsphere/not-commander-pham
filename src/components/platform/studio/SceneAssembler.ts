/**
 * SceneAssembler - Master DNA Library Mapping Engine
 * 
 * Implements the 3-Way Stitch (Section 6 of DNA Library v1.0):
 * 1. Brain (Logic): Game Mechanic → Scoring + Validation
 * 2. Body (Interaction): Mobile Interaction → UI Layout + 60Hz Telemetry
 * 3. Soul (Content): Action Cue + Scenario → Top 30% Context Zone
 * 
 * Universal UX Constraints (Section 5):
 * - Layout Ratio: 30% Top (Context) / 50% Middle (Visuals) / 20% Bottom (Interaction)
 * - Typography: text-sm or text-base (Slate-500 equivalent)
 * - Positioning: Interactive elements in bottom third
 * 
 * Reference: PlayOps_Studio_Unified_Mechanic_Interaction_Library.pdf
 */

import { SubCompetency, DesignSettings, ChoiceData } from '../template-steps/types';

// ============================================================================
// TYPES
// ============================================================================

export type MechanicType = 
  | 'scenario_simulation'    // Decision Tree - Quick Tap
  | 'case_analysis'          // Data Panel - Multi-Tap
  | 'data_analysis'          // Noise Filter - Continuous Scrub
  | 'collaboration'          // Alignment Puzzle - Drag-to-Connect
  | 'performance_demo'       // Sequence - Drag & Drop
  | 'project_artifact'       // Constraint - Slider Adjust
  | 'portfolio_timeline'     // Pattern Grid - Drag-to-Select
  | 'communication'          // Headline Builder - Quick Tap
  | 'technical_research'     // Diagnostic - Multi-Touch Tap
  | 'strategic_viability'    // Trade-off - Toggle/Slide
  | 'binary_choice'          // Binary - Swipe or Tap
  | 'ranking'                // Prioritization - Drag list
  | 'multi_choice'           // Default - Button stack
  | 'unknown';

export type InteractionType = 
  | 'quick_tap'
  | 'multi_tap'
  | 'continuous_scrub'
  | 'drag_connect'
  | 'drag_drop'
  | 'slider_adjust'
  | 'drag_select'
  | 'multi_touch'
  | 'toggle_slide'
  | 'swipe';

export interface TelemetryConfig {
  type: string;
  sampleRate: number; // Hz
  metrics: string[];
}

export interface MechanicBlueprint {
  mechanicType: MechanicType;
  interactionType: InteractionType;
  componentName: string;
  uiDna: string;
  telemetry: TelemetryConfig;
}

/**
 * 3-Way Stitch Structure (DNA Library Section 6)
 */
export interface ThreeWayStitch {
  brain: {
    mechanicType: MechanicType;
    scoringLogic: string;
    validationRules: string[];
  };
  body: {
    interactionType: InteractionType;
    componentName: string;
    telemetryConfig: TelemetryConfig;
    uiDna: string;
  };
  soul: {
    actionCue: string;
    scenario: string;
    contextText: string;
  };
}

/**
 * Universal UX Layout Configuration (Section 5)
 */
export interface LayoutConfig {
  topZone: number;      // 30% - Context/Action Cue
  middleZone: number;   // 50% - Visuals/Mascot
  bottomZone: number;   // 20% - Interaction
  typography: {
    actionCue: string;  // text-sm
    buttons: string;    // text-sm max
  };
  positioning: {
    interactionZone: 'bottom-third';
  };
}

export const UNIVERSAL_LAYOUT: LayoutConfig = {
  topZone: 30,
  middleZone: 50,
  bottomZone: 20,
  typography: {
    actionCue: 'text-sm',
    buttons: 'text-sm',
  },
  positioning: {
    interactionZone: 'bottom-third',
  },
};

export interface AssembledScene {
  stitch: ThreeWayStitch;
  blueprint: MechanicBlueprint;
  layout: LayoutConfig;
  subCompetency: SubCompetency;
  designSettings: DesignSettings;
  choices: ChoiceData[];
  sceneIndex: number;
}

// ============================================================================
// DNA LIBRARY BLUEPRINTS (From PDF Section 3)
// ============================================================================

const DNA_BLUEPRINTS: Record<MechanicType, MechanicBlueprint> = {
  scenario_simulation: {
    mechanicType: 'scenario_simulation',
    interactionType: 'quick_tap',
    componentName: 'QuickTapButtons',
    uiDna: 'Vertical stack of glassmorphic buttons',
    telemetry: {
      type: 'decision_latency',
      sampleRate: 60,
      metrics: ['time_to_first_tap', 'hesitation_count'],
    },
  },
  case_analysis: {
    mechanicType: 'case_analysis',
    interactionType: 'multi_tap',
    componentName: 'DataPanel',
    uiDna: 'Two-pane view. Left: Evidence. Right: Selection list',
    telemetry: {
      type: 'scan_speed',
      sampleRate: 30,
      metrics: ['dwell_time', 'scan_pattern', 'selection_order'],
    },
  },
  data_analysis: {
    mechanicType: 'data_analysis',
    interactionType: 'continuous_scrub',
    componentName: 'ScrubSlider',
    uiDna: 'Horizontal metallic track. Background clarity tied to slider %',
    telemetry: {
      type: 'velocity_consistency',
      sampleRate: 60, // 60Hz = sample every 16ms
      metrics: ['x_velocity', 'direction_changes', 'overshoot_count'],
    },
  },
  collaboration: {
    mechanicType: 'collaboration',
    interactionType: 'drag_connect',
    componentName: 'DragConnect',
    uiDna: 'SVG Canvas with nodes. User draws lines between concepts',
    telemetry: {
      type: 'path_deviation',
      sampleRate: 60,
      metrics: ['rms_error', 'path_smoothness', 'connection_time'],
    },
  },
  performance_demo: {
    mechanicType: 'performance_demo',
    interactionType: 'drag_drop',
    componentName: 'DragDropList',
    uiDna: 'Reorderable list or bucket grid. Fisher-Yates shuffle on start',
    telemetry: {
      type: 'reversals',
      sampleRate: 30,
      metrics: ['reversal_count', 'final_order_accuracy', 'time_per_item'],
    },
  },
  project_artifact: {
    mechanicType: 'project_artifact',
    interactionType: 'slider_adjust',
    componentName: 'PrecisionSlider',
    uiDna: 'Precision range input with target zones marked on track',
    telemetry: {
      type: 'fine_motor_control',
      sampleRate: 60,
      metrics: ['over_correction_count', 'target_precision', 'time_in_zone'],
    },
  },
  portfolio_timeline: {
    mechanicType: 'portfolio_timeline',
    interactionType: 'drag_select',
    componentName: 'PatternGrid',
    uiDna: '5x5 grid. Correct nodes pulse in sync every 1s',
    telemetry: {
      type: 'xy_stability',
      sampleRate: 60,
      metrics: ['slip_count', 'selection_accuracy', 'pattern_time'],
    },
  },
  communication: {
    mechanicType: 'communication',
    interactionType: 'quick_tap',
    componentName: 'ChatBubbleSelect',
    uiDna: 'Chat-bubble interface. Select most professional response',
    telemetry: {
      type: 'choice_accuracy',
      sampleRate: 30,
      metrics: ['response_time', 'is_correct'],
    },
  },
  technical_research: {
    mechanicType: 'technical_research',
    interactionType: 'multi_touch',
    componentName: 'HotspotMap',
    uiDna: 'Hotspot map. Tap 3-5 specific faulty regions on diagram',
    telemetry: {
      type: 'rhythmic_jitter',
      sampleRate: 60,
      metrics: ['tap_consistency', 'force_variance', 'rhythm_score'],
    },
  },
  strategic_viability: {
    mechanicType: 'strategic_viability',
    interactionType: 'toggle_slide',
    componentName: 'TradeoffMatrix',
    uiDna: '2x2 Matrix (Risk vs Reward). Drag icon into quadrant',
    telemetry: {
      type: 'hesitation_jitter',
      sampleRate: 60,
      metrics: ['micro_movements', 'release_time', 'quadrant_accuracy'],
    },
  },
  binary_choice: {
    mechanicType: 'binary_choice',
    interactionType: 'swipe',
    componentName: 'SwipeCard',
    uiDna: 'Swipeable card. Left/Right for binary decision',
    telemetry: {
      type: 'swipe_velocity',
      sampleRate: 60,
      metrics: ['swipe_speed', 'direction_confidence', 'hesitation_time'],
    },
  },
  ranking: {
    mechanicType: 'ranking',
    interactionType: 'drag_drop',
    componentName: 'RankingList',
    uiDna: 'Draggable ordered list with grip handles',
    telemetry: {
      type: 'reorder_efficiency',
      sampleRate: 30,
      metrics: ['move_count', 'final_accuracy', 'time_per_reorder'],
    },
  },
  multi_choice: {
    mechanicType: 'multi_choice',
    interactionType: 'quick_tap',
    componentName: 'MultiChoiceStack',
    uiDna: 'Vertical button stack (2-10 options)',
    telemetry: {
      type: 'selection_pattern',
      sampleRate: 30,
      metrics: ['time_to_select', 'change_count', 'is_correct'],
    },
  },
  unknown: {
    mechanicType: 'unknown',
    interactionType: 'quick_tap',
    componentName: 'MultiChoiceStack',
    uiDna: 'Default button layout',
    telemetry: {
      type: 'basic',
      sampleRate: 30,
      metrics: ['time_to_select', 'is_correct'],
    },
  },
};

// ============================================================================
// MECHANIC DETECTION (Maps Excel text → MechanicType)
// ============================================================================

export function detectMechanicType(gameMechanic: string | null, playerAction?: string | null): MechanicType {
  if (!gameMechanic) return 'unknown';
  
  const mechLower = gameMechanic.toLowerCase();
  const actionLower = (playerAction || '').toLowerCase();
  
  // Data Analysis / Continuous Scrub detection (Scene 3)
  if (mechLower.includes('data analysis') || mechLower.includes('noise filter') || 
      mechLower.includes('scrub') || mechLower.includes('continuous') || 
      actionLower.includes('scrub') || actionLower.includes('slider')) {
    return 'data_analysis';
  }
  
  // Binary detection
  if (mechLower.includes('binary') || mechLower.includes('toggle') || mechLower.includes('yes/no')) {
    return 'binary_choice';
  }
  
  // Ranking detection
  if (mechLower.includes('rank') || mechLower.includes('priorit') || mechLower.includes('order') || mechLower.includes('sequence')) {
    return 'performance_demo';
  }
  
  // Decision tree / Simulation
  if (mechLower.includes('decision') || mechLower.includes('simulation') || mechLower.includes('scenario')) {
    return 'scenario_simulation';
  }
  
  // Case/Data analysis
  if (mechLower.includes('case analysis') || mechLower.includes('data panel') || mechLower.includes('evidence')) {
    return 'case_analysis';
  }
  
  // Pattern/Grid
  if (mechLower.includes('pattern') || mechLower.includes('grid') || mechLower.includes('portfolio') || mechLower.includes('timeline')) {
    return 'portfolio_timeline';
  }
  
  // Collaboration / Connect
  if (mechLower.includes('collaborat') || mechLower.includes('alignment') || mechLower.includes('connect') || actionLower.includes('connect')) {
    return 'collaboration';
  }
  
  // Project/Constraint/Slider precision
  if (mechLower.includes('constraint') || mechLower.includes('artifact') || mechLower.includes('precision')) {
    return 'project_artifact';
  }
  
  // Communication / Chat
  if (mechLower.includes('communicat') || mechLower.includes('headline') || mechLower.includes('chat')) {
    return 'communication';
  }
  
  // Technical / Diagnostic / Hotspot
  if (mechLower.includes('technical') || mechLower.includes('diagnostic') || mechLower.includes('research') || mechLower.includes('hotspot')) {
    return 'technical_research';
  }
  
  // Strategic / Trade-off / Matrix
  if (mechLower.includes('strategic') || mechLower.includes('viability') || mechLower.includes('trade-off') || mechLower.includes('matrix')) {
    return 'strategic_viability';
  }
  
  // Default to multi-choice
  return 'multi_choice';
}

// ============================================================================
// 3-WAY STITCH ASSEMBLY (Core Function - DNA Library Section 6)
// ============================================================================

/**
 * Performs the 3-Way Stitch to assemble a scene:
 * 1. Brain (Logic): Pull 'Game Mechanic' tag → Apply scoring/validation
 * 2. Body (Interaction): Pull 'Mobile Interaction' tag → Load UI layout + telemetry
 * 3. Soul (Content): Pull 'Action Cue' + 'Scenario' → Inject into Context Zone
 */
export function performThreeWayStitch(subCompetency: SubCompetency): ThreeWayStitch {
  const mechanicType = detectMechanicType(
    subCompetency.game_mechanic,
    subCompetency.player_action
  );
  
  const blueprint = DNA_BLUEPRINTS[mechanicType];
  
  return {
    // Brain: Logic layer from Excel 'game_mechanic'
    brain: {
      mechanicType,
      scoringLogic: getScoringLogic(subCompetency),
      validationRules: getValidationRules(mechanicType),
    },
    // Body: Interaction layer from Excel 'player_action' / mechanic mapping
    body: {
      interactionType: blueprint.interactionType,
      componentName: blueprint.componentName,
      telemetryConfig: blueprint.telemetry,
      uiDna: blueprint.uiDna,
    },
    // Soul: Content layer from Excel 'action_cue' + 'statement'
    soul: {
      actionCue: subCompetency.action_cue || 'Complete this challenge',
      scenario: subCompetency.statement || '',
      contextText: buildContextText(subCompetency),
    },
  };
}

/**
 * Build context text for the top 30% zone
 */
function buildContextText(sub: SubCompetency): string {
  if (sub.action_cue) return sub.action_cue;
  if (sub.statement) return sub.statement;
  return 'Analyze the data and make your decision';
}

/**
 * Get scoring logic from sub-competency
 */
function getScoringLogic(sub: SubCompetency): string {
  return sub.scoring_formula_level_1 || sub.scoring_formula_level_2 || 'standard';
}

/**
 * Get validation rules based on mechanic type
 */
function getValidationRules(mechanicType: MechanicType): string[] {
  switch (mechanicType) {
    case 'data_analysis':
      return ['velocity_threshold', 'target_zone_accuracy', 'time_limit'];
    case 'binary_choice':
      return ['swipe_direction', 'confidence_threshold'];
    case 'collaboration':
      return ['path_accuracy', 'connection_completeness'];
    case 'portfolio_timeline':
      return ['pattern_match', 'selection_accuracy'];
    default:
      return ['is_correct', 'time_limit'];
  }
}

/**
 * Main scene assembler - combines 3-Way Stitch with layout constraints
 */
export function assembleScene(
  subCompetency: SubCompetency,
  designSettings: DesignSettings,
  choices: ChoiceData[],
  sceneIndex: number
): AssembledScene {
  // Step 1: Perform 3-Way Stitch
  const stitch = performThreeWayStitch(subCompetency);
  
  // Step 2: Get blueprint
  const blueprint = DNA_BLUEPRINTS[stitch.brain.mechanicType];
  
  // Step 3: Apply Universal UX Layout
  const layout = UNIVERSAL_LAYOUT;
  
  return {
    stitch,
    blueprint,
    layout,
    subCompetency,
    designSettings,
    choices,
    sceneIndex,
  };
}

/**
 * Get the component name for rendering based on mechanic
 */
export function getComponentForMechanic(mechanicType: MechanicType): string {
  return DNA_BLUEPRINTS[mechanicType].componentName;
}

/**
 * Get telemetry configuration for a mechanic
 */
export function getTelemetryConfig(mechanicType: MechanicType): TelemetryConfig {
  return DNA_BLUEPRINTS[mechanicType].telemetry;
}

/**
 * Get all available blueprints
 */
export function getAllBlueprints(): Record<MechanicType, MechanicBlueprint> {
  return DNA_BLUEPRINTS;
}

/**
 * Get universal layout configuration
 */
export function getUniversalLayout(): LayoutConfig {
  return UNIVERSAL_LAYOUT;
}

// ============================================================================
// TELEMETRY INITIALIZATION
// ============================================================================

export interface BiometricTrace {
  sessionId: string;
  sceneIndex: number;
  mechanicType: MechanicType;
  startTime: number;
  samples: TelemetrySample[];
  verifiedSignals: number;
}

export interface TelemetrySample {
  timestamp: number;
  x: number;
  y: number;
  velocity?: number;
  pressure?: number;
  eventType: 'touch_start' | 'touch_move' | 'touch_end' | 'tap';
}

/**
 * Initialize biometric trace for a scene
 * Per DNA Library: "Every scene must initialize biometricTrace and verifiedSignals upon first interaction"
 */
export function initializeBiometricTrace(
  sceneIndex: number,
  mechanicType: MechanicType
): BiometricTrace {
  return {
    sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    sceneIndex,
    mechanicType,
    startTime: performance.now(),
    samples: [],
    verifiedSignals: 0,
  };
}

/**
 * Calculate jitter variance from samples
 * Per DNA Library: Variance > 15% flags as "Unstable"
 */
export function calculateJitterVariance(samples: TelemetrySample[]): number {
  if (samples.length < 2) return 0;
  
  const movements = samples.filter(s => s.eventType === 'touch_move');
  if (movements.length < 2) return 0;
  
  const distances: number[] = [];
  for (let i = 1; i < movements.length; i++) {
    const dx = movements[i].x - movements[i - 1].x;
    const dy = movements[i].y - movements[i - 1].y;
    distances.push(Math.sqrt(dx * dx + dy * dy));
  }
  
  const mean = distances.reduce((a, b) => a + b, 0) / distances.length;
  const variance = distances.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / distances.length;
  const stdDev = Math.sqrt(variance);
  
  return (stdDev / mean) * 100; // Return as percentage
}

// ============================================================================
// PROFICIENCY CALCULATION (Triple-Gate System)
// ============================================================================

export type ProficiencyLevel = 1 | 2 | 3;

export interface TripleGateResult {
  gate1_accuracy: boolean;
  gate2_time: boolean; // < 30s
  gate3_jitter: boolean; // variance < 15%
  proficiencyLevel: ProficiencyLevel;
  attemptNumber: number;
}

/**
 * Calculate proficiency using the Triple-Gate system
 * 
 * Level 3 (Mastery): Accuracy (100%) + Time (<30s) + Jitter (Stable) on 1st Attempt
 * Level 2 (Proficient): Accuracy (100%) + Time (<30s) + (Unstable OR 2nd Attempt)
 * Level 1 (Needs Work): Accuracy (<100%) OR Timeout (>30s)
 */
export function calculateProficiency(
  isCorrect: boolean,
  timeSeconds: number,
  jitterVariance: number,
  attemptNumber: number
): TripleGateResult {
  const gate1 = isCorrect;
  const gate2 = timeSeconds < 30;
  const gate3 = jitterVariance <= 15;
  
  let level: ProficiencyLevel;
  
  if (!gate1 || !gate2) {
    // Level 1: Accuracy failed OR timeout
    level = 1;
  } else if (gate3 && attemptNumber === 1) {
    // Level 3: All gates pass on first attempt
    level = 3;
  } else {
    // Level 2: Correct in time, but unstable jitter OR 2nd+ attempt
    level = 2;
  }
  
  return {
    gate1_accuracy: gate1,
    gate2_time: gate2,
    gate3_jitter: gate3,
    proficiencyLevel: level,
    attemptNumber,
  };
}
