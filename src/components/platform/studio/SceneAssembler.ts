/**
 * SceneAssembler - Master DNA Library Mapping Engine
 * 
 * Maps Excel Framework columns (Game Mechanic, Mobile Interaction) to 
 * component blueprints from the Master DNA Library v1.0
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
  layoutClass: string;
}

export interface AssembledScene {
  blueprint: MechanicBlueprint;
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
    layoutClass: 'flex flex-col gap-2',
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
    layoutClass: 'grid grid-cols-2 gap-3',
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
    layoutClass: 'px-4',
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
    layoutClass: 'relative h-40',
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
    layoutClass: 'space-y-2',
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
    layoutClass: 'px-4 py-2',
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
    layoutClass: 'grid grid-cols-5 gap-1',
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
    layoutClass: 'space-y-2',
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
    layoutClass: 'relative h-36',
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
    layoutClass: 'grid grid-cols-2 gap-2 aspect-square',
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
    layoutClass: 'flex gap-4',
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
    layoutClass: 'space-y-2',
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
    layoutClass: 'space-y-1.5',
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
    layoutClass: 'space-y-1.5',
  },
};

// ============================================================================
// MECHANIC DETECTION (Maps Excel text → MechanicType)
// ============================================================================

export function detectMechanicType(gameMechanic: string | null, playerAction?: string | null): MechanicType {
  if (!gameMechanic) return 'unknown';
  
  const mechLower = gameMechanic.toLowerCase();
  const actionLower = (playerAction || '').toLowerCase();
  
  // Binary detection
  if (mechLower.includes('binary') || mechLower.includes('toggle') || mechLower.includes('yes/no')) {
    return 'binary_choice';
  }
  
  // Scrub/Slider detection
  if (mechLower.includes('scrub') || mechLower.includes('continuous') || actionLower.includes('scrub')) {
    return 'data_analysis';
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
// SCENE ASSEMBLER (Core Function)
// ============================================================================

/**
 * Assembles a scene by reading tags from the Excel row (SubCompetency) 
 * and binding the appropriate mechanic logic from the DNA Library
 */
export function assembleScene(
  subCompetency: SubCompetency,
  designSettings: DesignSettings,
  choices: ChoiceData[],
  sceneIndex: number
): AssembledScene {
  // Step 1: Detect mechanic type from Excel data
  const mechanicType = detectMechanicType(
    subCompetency.game_mechanic,
    subCompetency.player_action
  );
  
  // Step 2: Get blueprint from DNA Library
  const blueprint = DNA_BLUEPRINTS[mechanicType];
  
  // Step 3: Return assembled scene with all bindings
  return {
    blueprint,
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
