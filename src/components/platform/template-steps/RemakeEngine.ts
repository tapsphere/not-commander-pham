/**
 * REMAKE LOGIC ENGINE v1.0
 * 
 * This is the permanent rules engine for the 'Send' button on Step 3.
 * It handles semantic matching, 6-scene population, V5 mechanic locking,
 * and narrative theming for any prompt.
 */

import { SceneData, SubCompetency, Competency, createDefaultScene } from './types';

// ============================================
// RULE 1: SEMANTIC MATCH - V5 Core Competencies
// ============================================
const COMPETENCY_KEYWORDS: Record<string, string[]> = {
  'analytical thinking': [
    'analysis', 'analytical', 'thinking', 'data', 'pattern', 'logic', 'reasoning',
    'evaluate', 'assess', 'diagnose', 'investigate', 'research', 'study',
    'fashion', 'merchandising', 'retail', 'display', 'window'
  ],
  'problem solving': [
    'problem', 'solving', 'solution', 'fix', 'resolve', 'troubleshoot',
    'debug', 'repair', 'optimize', 'improve', 'enhance'
  ],
  'emotional intelligence': [
    'emotional', 'intelligence', 'empathy', 'feelings', 'relationship',
    'communication', 'interpersonal', 'team', 'conflict', 'leadership'
  ],
  'creative thinking': [
    'creative', 'creativity', 'innovation', 'design', 'ideation',
    'brainstorm', 'imagine', 'invent', 'artistic'
  ],
  'decision making': [
    'decision', 'making', 'choose', 'judgment', 'evaluate', 'risk',
    'strategy', 'planning', 'priority', 'trade-off'
  ],
  'digital fluency': [
    'digital', 'technology', 'software', 'coding', 'programming',
    'automation', 'AI', 'machine', 'computer', 'cyber'
  ],
};

// ============================================
// RULE 3: V5 MECHANIC LOCK - Scene Index Mapping
// ============================================
const V5_SCENE_MECHANICS: Record<number, { mechanic: string; interaction: string; timeGate: number }> = {
  1: { mechanic: 'Quick Tap', interaction: 'tap_select', timeGate: 30 },
  2: { mechanic: 'Pattern Grid', interaction: 'pattern_recognition', timeGate: 45 },
  3: { mechanic: 'Noise Filter', interaction: 'noise_filter', timeGate: 45 },
  4: { mechanic: 'Scrub Slider', interaction: 'scrub_precision', timeGate: 60 },
  5: { mechanic: 'Trade-off Matrix', interaction: 'matrix_selection', timeGate: 60 },
  6: { mechanic: 'Drag Connect', interaction: 'drag_connect', timeGate: 45 },
};

// ============================================
// RULE 1: Semantic Competency Matcher
// ============================================
export function matchCompetencyFromPrompt(
  prompt: string,
  competencies: Competency[]
): Competency | null {
  const input = prompt.toLowerCase();
  
  // Score each competency based on keyword matches
  let bestMatch: Competency | null = null;
  let bestScore = 0;

  for (const competency of competencies) {
    const compName = competency.name.toLowerCase();
    const keywords = COMPETENCY_KEYWORDS[compName] || [];
    
    // Direct name match gets highest priority
    if (input.includes(compName)) {
      return competency;
    }
    
    // Count keyword matches
    let score = 0;
    for (const keyword of keywords) {
      if (input.includes(keyword)) {
        score += 1;
      }
    }
    
    // Check competency name words
    const nameWords = compName.split(/\s+/);
    for (const word of nameWords) {
      if (input.includes(word)) {
        score += 2;
      }
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = competency;
    }
  }
  
  // Default to Analytical Thinking if no strong match
  if (!bestMatch || bestScore < 1) {
    bestMatch = competencies.find(c => 
      c.name.toLowerCase().includes('analytical')
    ) || competencies[0];
  }
  
  return bestMatch;
}

// ============================================
// RULE 2 & 3: 6-Scene Population with V5 Lock
// ============================================
export function populateSixScenes(
  subCompetencies: SubCompetency[],
  competencyId: string,
  theme: string,
  trackId?: string
): SceneData[] {
  // Filter to matching sub-competencies and take exactly 6
  const matchingSubs = subCompetencies
    .filter(s => s.competency_id === competencyId)
    .slice(0, 6);
  
  // Pad with first subs if we don't have 6
  while (matchingSubs.length < 6) {
    const fallbackSub = subCompetencies.find(s => s.competency_id === competencyId);
    if (fallbackSub) {
      matchingSubs.push({ ...fallbackSub, id: `fallback-${matchingSubs.length}` });
    } else {
      break;
    }
  }
  
  // Create exactly 6 scenes with V5 mechanic lock
  const scenes: SceneData[] = matchingSubs.map((sub, idx) => {
    const sceneNumber = idx + 1;
    const v5Config = V5_SCENE_MECHANICS[sceneNumber];
    
    const scene = createDefaultScene(sub.id, sceneNumber, trackId);
    
    // Apply V5 mechanic lock
    scene.timeLimit = (v5Config?.timeGate || 60) as 30 | 45 | 60;
    
    // Generate themed question (Rule 4 placeholder - AI will enhance)
    scene.question = generateThemedQuestion(sub, theme, sceneNumber);
    
    return scene;
  });
  
  return scenes;
}

// ============================================
// RULE 4: Narrative 'Remake' - Theme Adaptation
// ============================================
export function generateThemedQuestion(
  sub: SubCompetency,
  theme: string,
  sceneNumber: number
): string {
  const v5Config = V5_SCENE_MECHANICS[sceneNumber];
  const mechanic = v5Config?.mechanic || 'Quick Tap';
  
  // Extract theme context (first 50 chars)
  const themeContext = theme.length > 50 ? `${theme.substring(0, 50)}...` : theme;
  
  // Use action_cue if available, otherwise create from statement
  const baseAction = sub.action_cue || sub.statement;
  
  return `[${themeContext}] Scene ${sceneNumber} (${mechanic}): ${baseAction}`;
}

// ============================================
// RULE 5: Visual Generation - Background Prompts
// ============================================
export function generateBackgroundPrompts(
  theme: string,
  competencyName: string
): string[] {
  const prompts: string[] = [];
  
  const sceneContexts = [
    'establishing shot, wide angle',
    'detail focus, pattern analysis',
    'filtered view, data overlay',
    'precision measurement, close-up',
    'decision matrix, strategic view',
    'connection diagram, flow visualization',
  ];
  
  for (let i = 0; i < 6; i++) {
    const context = sceneContexts[i];
    prompts.push(
      `${theme} themed scene for ${competencyName}, ${context}, professional training environment, clean modern aesthetic, 16:9 aspect ratio`
    );
  }
  
  return prompts;
}

// ============================================
// MASTER REMAKE FUNCTION
// ============================================
export interface RemakeResult {
  competency: Competency;
  subCompetencyIds: string[];
  scenes: SceneData[];
  backgroundPrompts: string[];
  pathUsed: 'theme' | 'skill' | 'upload';
}

export async function executeRemake(
  prompt: string,
  competencies: Competency[],
  subCompetencies: SubCompetency[],
  pathUsed: 'theme' | 'skill' | 'upload' = 'theme',
  trackId?: string
): Promise<RemakeResult> {
  // Step 1: Semantic match to competency
  const matchedCompetency = matchCompetencyFromPrompt(prompt, competencies);
  
  if (!matchedCompetency) {
    throw new Error('No matching competency found');
  }
  
  // Step 2 & 3: Populate exactly 6 scenes with V5 mechanics locked
  const matchingSubs = subCompetencies
    .filter(s => s.competency_id === matchedCompetency.id)
    .slice(0, 6);
  
  const scenes = populateSixScenes(
    subCompetencies,
    matchedCompetency.id,
    prompt,
    trackId
  );
  
  // Step 5: Generate background image prompts
  const backgroundPrompts = generateBackgroundPrompts(prompt, matchedCompetency.name);
  
  return {
    competency: matchedCompetency,
    subCompetencyIds: matchingSubs.map(s => s.id),
    scenes,
    backgroundPrompts,
    pathUsed,
  };
}

// ============================================
// UTILITY: Get V5 Mechanic for Scene
// ============================================
export function getV5MechanicForScene(sceneIndex: number): {
  mechanic: string;
  interaction: string;
  timeGate: number;
  isLocked: boolean;
} {
  const config = V5_SCENE_MECHANICS[sceneIndex];
  return {
    mechanic: config?.mechanic || 'Quick Tap',
    interaction: config?.interaction || 'tap_select',
    timeGate: config?.timeGate || 60,
    isLocked: true, // V5 mechanics are always locked
  };
}

// ============================================
// UTILITY: Check if Scene Mechanic is Read-Only
// ============================================
export function isSceneMechanicReadOnly(sceneIndex: number): boolean {
  // Scene 2 (Pattern Grid) and Scene 3 (Noise Filter) are specifically read-only
  return sceneIndex === 2 || sceneIndex === 3;
}
