export interface TemplateFormData {
  name: string;
  description: string;
  industry: string;
  roleScenario: string;
  keyElement: string;
  edgeCaseDetails: string;
  visualTheme: string;
  interactionMethod: string;
  scenario: string;
  playerActions: string;
  edgeCaseTiming: 'early' | 'mid' | 'late';
  edgeCase: string;
  uiAesthetic: string;
}

export interface SceneData {
  id: string;
  question: string;
  choices: ChoiceData[];
  timeLimit: 30 | 45 | 60;
  subCompetencyId: string;
  // Visual choice rendering options
  displayMode?: 'text' | 'visual';       // Text buttons vs icon/image choices
  gridLayout?: '1x4' | '2x2' | '3x2';    // Layout: vertical list, 2x2 grid, or 3x2 grid
}

// Lucide icon names for visual choices (fashion/retail example set)
export type VisualChoiceIcon = 
  | 'Footprints' | 'Shirt' | 'Crown' | 'Watch'      // Accessories
  | 'ShoppingBag' | 'Package' | 'Gift' | 'Gem'      // Shopping
  | 'Sparkles' | 'Star' | 'Heart' | 'ThumbsUp'      // Reactions
  | 'TrendingUp' | 'BarChart3' | 'PieChart' | 'Target' // Business
  | 'Users' | 'MessageCircle' | 'Mail' | 'Phone'    // Communication
  | 'CheckCircle' | 'XCircle' | 'AlertTriangle' | 'Info' // Status
  | 'Zap' | 'Flame' | 'Sun' | 'Moon'                // Elements
  | string;                                          // Allow custom icons

export interface ChoiceData {
  id: string;
  text: string;
  isCorrect: boolean;       // Scientific correct answer (hidden from creator, used for proficiency scoring)
  brandAligned?: boolean;   // Brand-aligned answer (visible to creator, for alignment tracking)
  // Visual choice fields
  icon?: VisualChoiceIcon;  // Lucide icon name for visual mode
  iconLabel?: string;       // Short label under the icon (e.g., "Shoes")
}

export interface DesignSettings {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  highlight: string;
  text: string;
  font: string;
  avatar: string;
  particleEffect: string;
}

export interface SubCompetency {
  id: string;
  statement: string;
  competency_id: string;
  action_cue: string | null;
  game_mechanic: string | null;
  game_loop: string | null;
  validator_type: string | null;
  player_action: string | null;
  scoring_formula_level_1: string | null;
  scoring_formula_level_2: string | null;
  scoring_formula_level_3: string | null;
  backend_data_captured: any;
  display_order: number | null;
  scoring_logic?: any;
  created_at?: string | null;
}

export interface Competency {
  id: string;
  name: string;
  cbe_category: string;
  departments: string[];
  is_active: boolean;
}

export const DEFAULT_DESIGN_SETTINGS: DesignSettings = {
  primary: '#C8DBDB',
  secondary: '#6C8FA4',
  accent: '#2D5556',
  background: '#F5EDD3',
  highlight: '#F0C7A0',
  text: '#2D5556',
  font: 'Inter, sans-serif',
  avatar: '',
  particleEffect: 'sparkles'
};

export const DEFAULT_FORM_DATA: TemplateFormData = {
  name: '',
  description: '',
  industry: '',
  roleScenario: '',
  keyElement: '',
  edgeCaseDetails: '',
  visualTheme: 'modern',
  interactionMethod: '',
  scenario: '',
  playerActions: '',
  edgeCaseTiming: 'mid',
  edgeCase: '',
  uiAesthetic: '',
};

export const INDUSTRIES = [
  'Marketing', 'Operations', 'Sales', 'Finance', 'Human Resources', 
  'Communications', 'Customer Service', 'Technology', 'Healthcare', 
  'Education', 'Retail', 'Manufacturing', 'Legal', 'Supply Chain', 
  'Nonprofit', 'Government'
] as const;

export const VISUAL_THEMES = [
  { value: 'modern', label: 'Modern / Clean' },
  { value: 'dashboard', label: 'Executive Dashboard' },
  { value: 'casual', label: 'Casual / Friendly' },
  { value: 'urgent', label: 'High-Stakes / Urgent' },
  { value: 'minimal', label: 'Minimal / Focus Mode' },
] as const;

export const TIME_LIMITS = [30, 45, 60] as const;

export function createDefaultScene(subCompetencyId: string, sceneNumber: number): SceneData {
  return {
    id: `scene-${sceneNumber}-${Date.now()}`,
    question: '',
    choices: [
      { id: `choice-1-${Date.now()}`, text: '', isCorrect: true },
      { id: `choice-2-${Date.now() + 1}`, text: '', isCorrect: false },
      { id: `choice-3-${Date.now() + 2}`, text: '', isCorrect: false },
      { id: `choice-4-${Date.now() + 3}`, text: '', isCorrect: false },
    ],
    timeLimit: 60,
    subCompetencyId,
  };
}

export function getInteractionMethodsForMechanic(gameMechanic: string | null): string[] {
  if (!gameMechanic) return [];
  
  const mechanic = gameMechanic;
  if (mechanic.includes('Resource Allocation')) {
    return ['Drag-and-drop resource tiles', 'Slider-based percentage allocation', 'Click +/- buttons to distribute', 'Type numerical values'];
  }
  if (mechanic.includes('Ranking') || mechanic.includes('Prioritization')) {
    return ['Drag items to reorder list', 'Click arrows to move up/down', 'Select ranking number per item', 'Drop into priority buckets'];
  }
  if (mechanic.includes('Data Analysis') || mechanic.includes('Pattern Recognition')) {
    return ['Click data points to tag patterns', 'Draw trend lines on charts', 'Select filters and view results', 'Highlight matching data'];
  }
  if (mechanic.includes('Error-Detection') || mechanic.includes('Diagnosis')) {
    return ['Click on errors to flag them', 'Select from error type dropdown', 'Drag items to correct/incorrect bins', 'Type error descriptions'];
  }
  if (mechanic.includes('Divergent') || mechanic.includes('Idea Builder')) {
    return ['Type ideas in text fields', 'Select from idea cards and remix', 'Click prompts to generate variants', 'Drag concepts to combine'];
  }
  if (mechanic.includes('Concept Remix')) {
    return ['Type "How might we..." reframe statements', 'Select reframing prompts and customize', 'Drag word tiles to create new phrasing', 'Click perspective cards to shift viewpoint'];
  }
  if (mechanic.includes('Bias Detector')) {
    return ['Drag statements into category bins (fact/inference/opinion)', 'Click category button for each statement', 'Swipe cards left/right to categorize', 'Select category from dropdown per statement'];
  }
  if (mechanic.includes('Decision-Tree') || mechanic.includes('Simulation')) {
    return ['Click choice buttons at each fork', 'Select from dropdown decisions', 'Type rationale for decisions', 'Drag actions to timeline'];
  }
  
  // Default for any other mechanic
  return ['Click to select options', 'Type responses in text fields', 'Drag elements to interact', 'Use buttons to make choices'];
}
