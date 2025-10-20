import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Copy, Eye } from 'lucide-react';
import { TemplateTypeSelector } from './TemplateTypeSelector';
import { CustomGameUpload } from './CustomGameUpload';

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: {
    id: string;
    name: string;
    description: string | null;
    base_prompt: string | null;
  } | null;
  onSuccess: () => void;
  onTemplateCreated?: (templateId: string, templateName: string, subCompetencyId: string) => void;
}

// Global sample prompt with full scoring and proficiency details
const SAMPLE_PROMPT_WITH_SCORING = `🎮 HOW TO PLAY:
You are a crisis communication manager at TechFlow Inc. A data breach just happened affecting 50,000 accounts.

YOUR GOAL: Draft a public statement and response strategy within 2 hours.

HOW TO INTERACT:
• Read incoming messages from stakeholders (scroll through messages)
• Type your statement in the composer
• Click priority buttons to contact stakeholder groups
• Select communication channels (checkboxes)
• Set timeline using dropdown
• Click "Publish" when ready

SUCCESS: 
- Level 1: Complete task but miss key elements
- Level 2: Balanced, timely communication
- Level 3: Perfect execution + adapt to edge case twist

---

SCENARIO:
Your task: Draft an initial public statement and response strategy within the next 2 hours.

Available information:
- Breach discovered 45 minutes ago
- Engineering team is still investigating the scope
- Legal team is reviewing disclosure requirements
- CEO wants to be "transparent but not alarming"

Player actions:
1. Review incoming stakeholder messages (customers, investors, press)
2. Draft initial public statement
3. Prioritize which stakeholder groups to contact first
4. Decide on communication channels (email, social media, press release)
5. Set timeline for follow-up communications

Edge case twist: Just as you're about to publish, the engineering team reports the breach may be larger than initially thought, but they need 3 more hours to confirm. Do you:
- Publish your statement now with current information?
- Delay and risk news leaking from other sources?
- Publish a holding statement acknowledging the investigation?

Scoring formulas (from sub_competencies table):
- Level 1 (Needs Work): Published without acknowledging uncertainty OR delayed more than 4 hours OR failed to contact key stakeholders within 2 hours. Score = (timeliness * 0.3) + (stakeholder_coverage * 0.3) + (transparency * 0.4). XP: 50
- Level 2 (Proficient): Published holding statement within 1 hour, contacted all key stakeholders, acknowledged investigation ongoing. Score = (timeliness * 0.3) + (stakeholder_coverage * 0.3) + (transparency * 0.4). XP: 150
- Level 3 (Mastery): Published nuanced holding statement within 45 minutes, proactively set up stakeholder-specific communication channels, framed uncertainty as commitment to accuracy, established clear follow-up timeline. Score = (timeliness * 0.2) + (stakeholder_coverage * 0.3) + (transparency * 0.3) + (strategic_framing * 0.2). XP: 300

Backend data captured:
- timestamp_first_action
- statement_draft_versions (array)
- stakeholder_contact_order (array)
- communication_channels_selected (array)
- decision_on_edge_case (string: "publish_now" | "delay" | "holding_statement")
- time_to_first_publication (seconds)

End result screens:
- Level 1: "Crisis Escalated" - Shows news headlines about the company's silence, customer complaints on social media, and stock price impact. Feedback: "Speed matters, but so does acknowledging what you don't know."
- Level 2: "Crisis Contained" - Shows positive reception to transparency, stakeholders appreciate honesty, minimal negative press. Feedback: "Good crisis management. You balanced speed with accuracy."
- Level 3: "Crisis Transformed" - Shows media praising the company's transparent approach, customers expressing trust, and stakeholders viewing this as a model response. Feedback: "Masterful. You turned a crisis into a trust-building moment."

UI aesthetic: Modern dashboard with a ticking clock, incoming message notifications, and a statement composer with real-time sentiment analysis of your draft.`;

export const TemplateDialog = ({ open, onOpenChange, template, onSuccess, onTemplateCreated }: TemplateDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [templateType, setTemplateType] = useState<'ai_generated' | 'custom_upload'>('ai_generated');
  const [customGameFile, setCustomGameFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    industry: '',
    roleScenario: '',
    keyElement: '',
    edgeCaseDetails: '',
    visualTheme: 'modern',
    interactionMethod: '',
    scenario: '',
    playerActions: '',
    scene1: '',
    scene2: '',
    scene3: '',
    scene4: '',
    edgeCaseTiming: 'mid' as 'early' | 'mid' | 'late',
    edgeCase: '',
    uiAesthetic: '',
  });
  const [activeScenes, setActiveScenes] = useState(1); // Track how many scene fields are shown
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  // Competency data
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [subCompetencies, setSubCompetencies] = useState<any[]>([]);
  const [selectedCompetency, setSelectedCompetency] = useState<string>('');
  const [selectedSubCompetencies, setSelectedSubCompetencies] = useState<string[]>([]);
  
  // Get selected sub-competency data
  const selectedSub = subCompetencies.find(sub => selectedSubCompetencies.includes(sub.id));
  
  // Get interaction method options based on game mechanic
  const getInteractionMethods = () => {
    if (!selectedSub?.game_mechanic) return [];
    
    const mechanic = selectedSub.game_mechanic;
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
    if (mechanic.includes('Pattern Transfer') && mechanic.includes('application scenario')) {
      return ['Click feedback points to adjust design', 'Toggle design options based on feedback', 'Type adjustments in response to feedback', 'Drag sliders to refine based on input'];
    }
    if (mechanic.includes('Constraint Challenge') || mechanic.includes('Convergent')) {
      return ['Select best option from list', 'Rate ideas with star ratings', 'Drag to feasibility matrix', 'Click checkboxes for criteria'];
    }
    if (mechanic.includes('Logic') || mechanic.includes('Argument')) {
      return ['Highlight text to mark assumptions', 'Click statements to tag logic', 'Drag claims to conclusion boxes', 'Select fallacy types from dropdown'];
    }
    if (mechanic.includes('Evidence') || mechanic.includes('Weighing')) {
      return ['Drag sources into ranking order', 'Rate reliability with sliders', 'Click to select best evidence', 'Type justification for ranking'];
    }
    if (mechanic.includes('Mapping') || mechanic.includes('Systems') || mechanic.includes('Causal')) {
      return ['Drag boxes to create flowchart', 'Click to add nodes and connections', 'Draw lines between causes/effects', 'Select relationships from dropdown'];
    }
    if (mechanic.includes('Prototype') || mechanic.includes('Refinement')) {
      return ['Upload/modify design iterations', 'Click feedback points to adjust', 'Type changes to implement', 'Select improvement options'];
    }
    if (mechanic.includes('Communication') || mechanic.includes('Report') || mechanic.includes('Pitch')) {
      return ['Type message in text editor', 'Select template and customize', 'Drag content blocks to structure', 'Click tone/style options'];
    }
    if (mechanic.includes('Decision-Tree') || mechanic.includes('Simulation')) {
      return ['Click choice buttons at each fork', 'Select from dropdown decisions', 'Type rationale for decisions', 'Drag actions to timeline'];
    }
    if (mechanic.includes('Retrospective') || mechanic.includes('Reflective')) {
      return ['Type observations in text fields', 'Select insights from categories', 'Rate performance aspects', 'Drag lessons to priority list'];
    }
    
    // Default for any other mechanic
    return ['Click to select options', 'Type responses in text fields', 'Drag elements to interact', 'Use buttons to make choices'];
  };

  // Fetch competencies on mount
  useEffect(() => {
    const fetchCompetencies = async () => {
      const { data, error } = await supabase
        .from('master_competencies')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        console.error('Error fetching competencies:', error);
        return;
      }
      
      setCompetencies(data || []);
    };
    
    fetchCompetencies();
  }, []);

  // Fetch sub-competencies when competency is selected
  useEffect(() => {
    if (!selectedCompetency) {
      setSubCompetencies([]);
      setSelectedSubCompetencies([]);
      return;
    }

    const fetchSubCompetencies = async () => {
      const { data, error } = await supabase
        .from('sub_competencies')
        .select('*')
        .eq('competency_id', selectedCompetency)
        .order('display_order', { nullsFirst: false });
      
      if (error) {
        console.error('Error fetching sub-competencies:', error);
        return;
      }
      
      setSubCompetencies(data || []);
    };
    
    fetchSubCompetencies();
  }, [selectedCompetency]);

  // Auto-load sample when sub-competency changes
  useEffect(() => {
    if (selectedSubCompetencies.length > 0 && subCompetencies.length > 0) {
      const loadSampleAuto = async () => {
        const selectedSub = subCompetencies.find(sub => selectedSubCompetencies[0] === sub.id);
        if (!selectedSub) return;

        const { data: subCompData, error: subError } = await supabase
          .from('sub_competencies')
          .select('*')
          .eq('id', selectedSub.id)
          .single();

        if (subError || !subCompData) {
          console.error('Error loading sub-competency:', subError);
          return;
        }

        console.log('Loading sample for:', subCompData.statement);

        // Create concrete examples based on the PlayOps framework with proper fallbacks
        const actionCue = subCompData.action_cue || 'a critical challenge emerges';
        const playerAction = subCompData.player_action || 'make strategic decisions';
        const validatorType = subCompData.validator_type || 'behavioral tracking';
        const gameLoop = subCompData.game_loop || 'during a key decision point';
        const gameMechanic = subCompData.game_mechanic || 'interactive decision-making';
        const backendData = subCompData.backend_data_captured || [];
        const scoringLogic = subCompData.scoring_logic || {};
        
        // Format backend data captured
        const dataTracked = Array.isArray(backendData) && backendData.length > 0 
          ? backendData.join(', ')
          : 'decision quality, response time, accuracy rate';
        
        // Get scoring formulas
        const level1Formula = subCompData.scoring_formula_level_1 || 'Accuracy < 60% OR Time > 6min OR Failed edge case';
        const level2Formula = subCompData.scoring_formula_level_2 || 'Accuracy 60-84% AND Time 3-6min AND Partial edge case recovery';
        const level3Formula = subCompData.scoring_formula_level_3 || 'Accuracy ≥ 85% AND Time < 3min AND Full edge case recovery';
        
        // Create unique edge cases based on validator type and context
        const edgeCaseScenarios: { [key: string]: string } = {
          'Scenario-Based Simulation': 'Suddenly, a key constraint changes: the budget is cut by 40% or a critical resource becomes unavailable. You must quickly reassess your strategy and reallocate without compromising the core objective.',
          'Communication Product': 'Midway through, the target stakeholder changes - what was meant for executives now needs to be rewritten for frontline staff. The KPIs remain but your messaging must completely shift to match the new audience.',
          'Data Analysis': 'Halfway through the analysis, new contradictory data appears that challenges your initial pattern recognition. You must reconcile the conflicting information and update your insights under time pressure.',
          'Performance Assessment': 'The evaluation criteria suddenly shifts - a metric you thought was low priority is now the primary KPI. You must rapidly pivot your approach while maintaining quality in your initial work.',
        };
        
        const edgeCase = edgeCaseScenarios[validatorType] || 
          `During a critical decision point (${gameLoop}), an unexpected variable changes the rules of engagement - testing whether you can maintain performance quality while adapting your strategy in real-time.`;
        
        // Create scene progression based on validator type
        const sceneExamples: { [key: string]: { scene1: string, scene2: string, scene3: string, scene4?: string } } = {
          'Scenario-Based Simulation': {
            scene1: 'Review initial scenario data and make baseline decisions using normal constraints',
            scene2: 'New variable introduced - adjust strategy while maintaining core objectives',
            scene3: '⚡ EDGE CASE: Budget cut 40% - rapidly reallocate resources',
            scene4: 'Finalize and submit optimized plan under new constraints'
          },
          'Communication Product': {
            scene1: 'Draft initial message for target audience with given KPIs',
            scene2: 'Refine messaging based on feedback and additional context',
            scene3: '⚡ EDGE CASE: Audience changed - rewrite for different stakeholder group'
          },
          'Data Analysis': {
            scene1: 'Analyze baseline dataset and identify initial patterns',
            scene2: 'Apply filters and validate findings against criteria',
            scene3: '⚡ EDGE CASE: Contradictory data appears - reconcile and update insights',
            scene4: 'Present final analysis with updated recommendations'
          },
          'Performance Assessment': {
            scene1: 'Evaluate performance using primary metrics',
            scene2: 'Compare against benchmarks and identify gaps',
            scene3: '⚡ EDGE CASE: Priority KPI suddenly changes - pivot evaluation focus'
          }
        };
        
        const scenes = sceneExamples[validatorType] || {
          scene1: 'Complete baseline task using standard approach',
          scene2: 'Adapt to new information or constraint',
          scene3: '⚡ EDGE CASE: Critical rule change - adjust strategy in real-time'
        };
        
        // Generate context-specific defaults based on game mechanic
        const getKeyElementDefault = (mechanic: string) => {
          if (mechanic.includes('Resource Allocation')) return 'Budget, Staff, Time';
          if (mechanic.includes('Ranking') || mechanic.includes('Prioritization')) return 'Projects A, B, C, D';
          if (mechanic.includes('Data Analysis') || mechanic.includes('Pattern Recognition')) return 'Sales data, performance metrics';
          if (mechanic.includes('Error-Detection') || mechanic.includes('Diagnosis')) return 'System logs, diagnostic reports';
          if (mechanic.includes('Divergent') || mechanic.includes('Idea Builder')) return 'Brainstorming constraints, ideation prompts';
          if (mechanic.includes('Concept Remix')) return 'Problem statement to reframe';
          if (mechanic.includes('Prototype Refinement')) return 'Initial design concept, feedback rounds';
          if (mechanic.includes('Constraint Challenge') || mechanic.includes('Convergent')) return 'Generated ideas, feasibility criteria';
          if (mechanic.includes('Pattern Transfer') && mechanic.includes('application')) return 'Prototype v1, simulated feedback';
          if (mechanic.includes('Storyboard') || mechanic.includes('Pitch Builder')) return 'Creative concept, rationale points';
          if (mechanic.includes('Logic Scenario') || mechanic.includes('Argument evaluation')) return 'Argument text, hidden assumptions';
          if (mechanic.includes('Bias Detector')) return 'Mixed statements (facts, inferences, opinions)';
          if (mechanic.includes('Evidence Weighing')) return 'Source documents, reliability indicators';
          if (mechanic.includes('Causal Mapping')) return 'Multi-step argument, logical fallacies';
          if (mechanic.includes('Adaptive Logic Loop')) return 'Incomplete dataset, conclusion options';
          if (mechanic.includes('Debate Response')) return 'Argument facts, persuasive elements';
          if (mechanic.includes('Systems Mapping')) return 'Problem symptoms, root cause clues';
          if (mechanic.includes('Solution Generator')) return 'Problem parameters, solution constraints';
          if (mechanic.includes('Criteria Scoring')) return 'Problem types, solution tools/methods';
          if (mechanic.includes('Execution Simulation')) return 'Action steps, timeline, resources';
          if (mechanic.includes('Adaptive Fix-Flow')) return 'Implementation status, rule changes';
          if (mechanic.includes('Retrospective Builder')) return 'Performance data, outcome metrics';
          if (mechanic.includes('Report-Builder') || mechanic.includes('KPI Matching')) return 'Results summary, defined KPIs';
          if (mechanic.includes('Decision-Tree') || mechanic.includes('Simulation')) return 'Decision points, stakeholder conflicts';
          return 'Key decision factors and constraints';
        };
        
        const getEdgeCaseDefault = (mechanic: string) => {
          if (mechanic.includes('Resource Allocation')) return 'Budget suddenly cut by 40%';
          if (mechanic.includes('Ranking') || mechanic.includes('Prioritization')) return 'Priority criteria flips mid-task';
          if (mechanic.includes('Data Analysis') || mechanic.includes('Pattern Recognition')) return 'Contradictory data appears requiring reconciliation';
          if (mechanic.includes('Error-Detection') || mechanic.includes('Diagnosis')) return 'New error type emerges not in initial framework';
          if (mechanic.includes('Divergent') || mechanic.includes('Idea Builder')) return 'Client adds major constraint after ideation phase';
          if (mechanic.includes('Concept Remix')) return 'Stakeholder rejects initial reframe, demands new angle';
          if (mechanic.includes('Prototype Refinement')) return 'User feedback contradicts initial design assumptions';
          if (mechanic.includes('Constraint Challenge') || mechanic.includes('Convergent')) return 'Feasibility constraint becomes stricter mid-evaluation';
          if (mechanic.includes('Pattern Transfer') && mechanic.includes('application')) return 'Feedback round 2 contradicts round 1 guidance';
          if (mechanic.includes('Storyboard') || mechanic.includes('Pitch Builder')) return 'Audience changes requiring different communication style';
          if (mechanic.includes('Logic Scenario') || mechanic.includes('Argument evaluation')) return 'New evidence invalidates marked assumption';
          if (mechanic.includes('Bias Detector')) return 'Timer reduced by 50% mid-sorting task';
          if (mechanic.includes('Evidence Weighing')) return 'New source appears that contradicts top-ranked evidence';
          if (mechanic.includes('Causal Mapping')) return 'Additional argument step reveals earlier fallacy was valid';
          if (mechanic.includes('Adaptive Logic Loop')) return 'Critical data point appears changing best conclusion';
          if (mechanic.includes('Debate Response')) return 'Counter-argument introduced requiring pivot';
          if (mechanic.includes('Systems Mapping')) return 'Root cause leads to unexpected second-order problem';
          if (mechanic.includes('Solution Generator')) return 'One solution option becomes unavailable mid-selection';
          if (mechanic.includes('Criteria Scoring')) return 'Problem type shifts requiring different tool/method';
          if (mechanic.includes('Execution Simulation')) return 'Resource disappears requiring re-sequencing';
          if (mechanic.includes('Adaptive Fix-Flow')) return 'Implementation rule changes mid-execution';
          if (mechanic.includes('Retrospective Builder')) return 'New outcome data reveals missed insight';
          if (mechanic.includes('Report-Builder') || mechanic.includes('KPI Matching')) return 'KPI priorities reordered by leadership';
          if (mechanic.includes('Decision-Tree') || mechanic.includes('Simulation')) return 'Stakeholder conflict escalates requiring new path';
          return 'Unexpected variable changes the rules mid-task';
        };
        
        const getDefaultInteraction = (mechanic: string) => {
          if (mechanic.includes('Resource Allocation')) return 'Drag-and-drop resource tiles';
          if (mechanic.includes('Ranking') || mechanic.includes('Prioritization')) return 'Drag items to reorder list';
          if (mechanic.includes('Data Analysis') || mechanic.includes('Pattern Recognition')) return 'Click data points to tag patterns';
          if (mechanic.includes('Error-Detection') || mechanic.includes('Diagnosis')) return 'Click on errors to flag them';
          if (mechanic.includes('Divergent') || mechanic.includes('Idea Builder')) return 'Type ideas in text fields';
          if (mechanic.includes('Concept Remix')) return 'Type "How might we..." reframe statements';
          if (mechanic.includes('Bias Detector')) return 'Drag statements into category bins (fact/inference/opinion)';
          if (mechanic.includes('Pattern Transfer') && mechanic.includes('application scenario')) return 'Click feedback points to adjust design';
          if (mechanic.includes('Constraint Challenge') || mechanic.includes('Convergent')) return 'Rate ideas with star ratings';
          if (mechanic.includes('Logic') || mechanic.includes('Argument')) return 'Highlight text to mark assumptions';
          if (mechanic.includes('Evidence') || mechanic.includes('Weighing')) return 'Drag sources into ranking order';
          if (mechanic.includes('Mapping') || mechanic.includes('Systems') || mechanic.includes('Causal')) return 'Drag boxes to create flowchart';
          if (mechanic.includes('Prototype') || mechanic.includes('Refinement')) return 'Click feedback points to adjust';
          if (mechanic.includes('Communication') || mechanic.includes('Report') || mechanic.includes('Pitch')) return 'Type message in text editor';
          if (mechanic.includes('Decision-Tree') || mechanic.includes('Simulation')) return 'Click choice buttons at each fork';
          if (mechanic.includes('Retrospective') || mechanic.includes('Reflective')) return 'Type observations in text fields';
          return 'Click to select options';
        };
        
        const sample = {
          name: `${subCompData.statement.substring(0, 50)}...`,
          description: `Tests: ${subCompData.statement}`,
          industry: 'Technology',
          roleScenario: `You are a professional applying ${subCompData.statement.toLowerCase()} in a realistic scenario`,
          keyElement: getKeyElementDefault(gameMechanic),
          edgeCaseDetails: getEdgeCaseDefault(gameMechanic),
          visualTheme: 'modern',
          interactionMethod: getDefaultInteraction(gameMechanic),
          scenario: `Apply this competency in a realistic work scenario where ${actionCue}. 

You'll interact with a ${gameMechanic.toLowerCase()} interface that requires you to ${subCompData.statement.toLowerCase()}.`,
          playerActions: `ACTION CUE (C-BEN): ${actionCue}

HOW: ${getDefaultInteraction(gameMechanic)} to ${actionCue.toLowerCase()}

The system tracks your actions throughout the ${gameLoop}.`,
          scene1: scenes.scene1,
          scene2: scenes.scene2,
          scene3: scenes.scene3,
          scene4: scenes.scene4 || '',
          edgeCaseTiming: 'mid' as 'early' | 'mid' | 'late',
          edgeCase: `${edgeCase}`,
          uiAesthetic: `Interface style: ${gameMechanic} in a professional workspace. Clean, mobile-optimized design with clear visual feedback.`,
        };
        
        console.log('Setting sample:', sample);
        setFormData(prev => ({ ...prev, ...sample }));
        
        // Set active scenes based on how many scenes have data
        const sceneCount = [sample.scene1, sample.scene2, sample.scene3, sample.scene4].filter(s => s).length;
        setActiveScenes(Math.max(1, sceneCount));
      };
      
      loadSampleAuto();
    }
  }, [selectedSubCompetencies, subCompetencies]);

  // Auto-generate prompt whenever form data changes
  useEffect(() => {
    if (formData.scenario || formData.playerActions || formData.edgeCase) {
      const selectedComp = competencies.find(c => c.id === selectedCompetency);
      const selectedSubs = subCompetencies.filter(sc => selectedSubCompetencies.includes(sc.id));
      
      const competencySection = selectedComp ? `
🎯 Target Competency:
${selectedComp.name} (${selectedComp.cbe_category})

Sub-Competencies Being Tested:
${selectedSubs.map((sc, idx) => `${idx + 1}. ${sc.statement}

📊 PlayOps Framework:
   • Validator Type: ${sc.validator_type || 'Not specified'}
   • Action Cue: ${sc.action_cue || 'Not specified'}
   • Player Action: ${sc.player_action || 'Not specified'}
   • Game Mechanic: ${sc.game_mechanic || 'Not specified'}
   • Game Loop: ${sc.game_loop || 'Not specified'}
   • Backend Data: ${Array.isArray(sc.backend_data_captured) ? sc.backend_data_captured.join(', ') : 'Not specified'}
   
🎯 Scoring Formulas:
   • Level 1 (Needs Work): ${sc.scoring_formula_level_1 || 'Not specified'}
   • Level 2 (Proficient): ${sc.scoring_formula_level_2 || 'Not specified'}
   • Level 3 (Mastery): ${sc.scoring_formula_level_3 || 'Not specified'}
`).join('\n\n') || '[Select 1 sub-competency]'}
` : '';

      const prompt = `Design a 3–6 minute validator mini-game that tests a specific sub-competency through interactive gameplay.

⚙️ Quick Reference:
• Validator: a short interactive mini-game that tests one sub-competency
• Sub-Competency: the specific behavior the validator surfaces through gameplay
• Edge Case: a single twist mid-game that forces adaptation — used to test mastery

All scoring, timing, and proof logic are pre-baked into the system. Focus only on player experience, flow, and the edge-case moment.
${competencySection}
🎮 HOW TO PLAY (CRITICAL - Must be clear and concrete):
The game MUST include a "How to Play" section on the start screen that tells players:
1. WHO they are (role/scenario context)
2. WHAT they need to do (specific, concrete goal)
3. HOW to interact (drag items, click buttons, type text, etc.)
4. WHAT success looks like (what determines Level 1/2/3)
5. TIME limits or constraints

Example: "You are a project manager at TechCo. Your goal: Allocate your team and budget across 4 projects. HOW: Drag team members to projects. Click +/- buttons to adjust budget. Submit when all resources are allocated. You have 3 minutes. Optimal allocation = Mastery level."

Make instructions VISUAL and OBVIOUS - players should immediately understand what to do.

📋 Design Requirements:

Scenario/Theme:
${formData.scenario || '[Describe the narrative wrapper and visual tone]'}

Player Actions:
${formData.playerActions || '[Define how the skill is expressed - e.g., drag-drop, select, type, prioritize]'}

${formData.scene1 || formData.scene2 || formData.scene3 || formData.scene4 ? `Action Scenes / Rounds:
${formData.scene1 ? `Scene 1 (Baseline): ${formData.scene1}` : ''}
${formData.scene2 ? `Scene 2: ${formData.scene2}` : ''}
${formData.scene3 ? `Scene 3: ${formData.scene3}` : ''}
${formData.scene4 ? `Scene 4: ${formData.scene4}` : ''}

Edge-Case Timing: ${formData.edgeCaseTiming.toUpperCase()}
${(() => {
  const filledScenes = [formData.scene1, formData.scene2, formData.scene3, formData.scene4].filter(s => s).length;
  if (filledScenes === 2) return '(Edge-case occurs in Scene 2)';
  if (filledScenes === 3) return formData.edgeCaseTiming === 'early' ? '(Edge-case in Scene 2)' : '(Edge-case in Scene 3)';
  if (filledScenes === 4) {
    if (formData.edgeCaseTiming === 'early') return '(Edge-case in Scene 2)';
    if (formData.edgeCaseTiming === 'mid') return '(Edge-case in Scene 3)';
    return '(Edge-case in Scene 4)';
  }
  return '(System defaults to 3 scenes with Mid timing)';
})()}

Time Allocation: System auto-divides 3 minutes (±30s) across ${[formData.scene1, formData.scene2, formData.scene3, formData.scene4].filter(s => s).length || 3} scenes

` : ''}Edge-Case Moment:
${formData.edgeCase || '[Describe how the disruption appears - e.g., timer cuts in half, data field vanishes, rule changes]'}

Scoring & Result Screens (CRITICAL - include in every game):
${formData.edgeCase ? '✅ Scoring logic included in edge case section above' : '[MUST include: Level 1/2/3 formulas, XP values, result screen descriptions, backend data tracked]'}

UI Aesthetic:
${formData.uiAesthetic || '[Define visual style - e.g., greyscale minimalist, neon cyberpunk, branded corporate]'}

📱 Telegram Mini App Requirements:
• Mobile-first responsive design (works on all phone screens)
• Fast loading and smooth performance
• Touch-friendly interactions (buttons, swipes, taps)
• Built with standard web technologies (React, TypeScript)
• Integrates with Telegram Web App SDK for seamless user experience
• Runs inside Telegram messenger interface
• No external app download required

🎯 System Handles Automatically:
• 3 proficiency levels: Needs Work / Proficient / Mastery
• Accuracy %, time tracking, edge-case recovery rate
• Result screen with color-coded feedback (red/yellow/green)
• Proof ledger integration and XP rewards

📖 EXAMPLE COMPLETE PROMPT (use as reference):
${SAMPLE_PROMPT_WITH_SCORING}`;
      
      setGeneratedPrompt(prompt);
    }
  }, [formData.scenario, formData.playerActions, formData.edgeCase, formData.uiAesthetic, selectedCompetency, selectedSubCompetencies, competencies, subCompetencies]);

  const handleLoadSample = async () => {
    const selectedSub = subCompetencies.find(sub => selectedSubCompetencies[0] === sub.id);
    
    if (!selectedSub) {
      toast.error('Please select a sub-competency first');
      return;
    }

    // Fetch the actual PlayOps framework data for the selected sub-competency
    const { data: subCompData, error: subError } = await supabase
      .from('sub_competencies')
      .select('*')
      .eq('id', selectedSub.id)
      .single();

    if (subError || !subCompData) {
      toast.error('Failed to load framework data');
      return;
    }

    // Build sample using actual PlayOps framework data from the database
    const gameMechanic = subCompData.game_mechanic || 'Interactive Simulation';
    const validatorType = subCompData.validator_type || 'Scenario-Based Simulation';
    
    // Create scene progression based on validator type
    const sceneExamples: { [key: string]: { scene1: string, scene2: string, scene3: string, scene4?: string } } = {
      'Scenario-Based Simulation': {
        scene1: 'Review initial scenario data and make baseline decisions using normal constraints',
        scene2: 'New variable introduced - adjust strategy while maintaining core objectives',
        scene3: '⚡ EDGE CASE: Budget cut 40% - rapidly reallocate resources',
        scene4: 'Finalize and submit optimized plan under new constraints'
      },
      'Communication Product': {
        scene1: 'Draft initial message for target audience with given KPIs',
        scene2: 'Refine messaging based on feedback and additional context',
        scene3: '⚡ EDGE CASE: Audience changed - rewrite for different stakeholder group'
      },
      'Data Analysis': {
        scene1: 'Analyze baseline dataset and identify initial patterns',
        scene2: 'Apply filters and validate findings against criteria',
        scene3: '⚡ EDGE CASE: Contradictory data appears - reconcile and update insights',
        scene4: 'Present final analysis with updated recommendations'
      },
      'Performance Assessment': {
        scene1: 'Evaluate performance using primary metrics',
        scene2: 'Compare against benchmarks and identify gaps',
        scene3: '⚡ EDGE CASE: Priority KPI suddenly changes - pivot evaluation focus'
      }
    };
    
    const scenes = sceneExamples[validatorType] || {
      scene1: 'Complete baseline task using standard approach',
      scene2: 'Adapt to new information or constraint',
      scene3: '⚡ EDGE CASE: Critical rule change - adjust strategy in real-time'
    };
    
    const sample = {
      name: `${subCompData.statement.substring(0, 50)}...`,
      description: `Tests ability to demonstrate: ${subCompData.statement}`,
      industry: 'Technology',
      roleScenario: 'You are a professional working on a time-sensitive challenge',
      keyElement: 'Key resources or data relevant to this challenge',
      edgeCaseDetails: 'Sudden constraint or variable change mid-task',
      visualTheme: 'modern',
      interactionMethod: 'Click to select options',
      scenario: `Apply this competency in a realistic work scenario where ${subCompData.action_cue || 'a challenge arises requiring this skill'}`,
      playerActions: `ACTION CUE (C-BEN): ${subCompData.action_cue || 'Demonstrate this competency'}

HOW: Click to select options to ${(subCompData.action_cue || '').toLowerCase() || 'interact with the challenge'}

The system tracks your actions throughout the ${subCompData.game_loop || 'gameplay'}.`,
      scene1: scenes.scene1,
      scene2: scenes.scene2,
      scene3: scenes.scene3,
      scene4: scenes.scene4 || '',
      edgeCaseTiming: 'mid' as 'early' | 'mid' | 'late',
      edgeCase: `${subCompData.game_loop || 'During gameplay'}, introduce an unexpected challenge that tests adaptability using the ${subCompData.validator_type || 'validation system'}`,
      uiAesthetic: `Design matches the ${subCompData.game_mechanic || 'core mechanic'} with clear visual feedback. Use ${subCompData.validator_type || 'real-time validation'} to provide immediate player feedback.`,
    };
    
    setFormData(sample);
    
    // Set active scenes based on how many scenes have data
    const sceneCount = [sample.scene1, sample.scene2, sample.scene3, sample.scene4].filter(s => s).length;
    setActiveScenes(Math.max(1, sceneCount));
    
    toast.success(`Sample loaded using ${subCompData.statement} framework!`);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast.success('Prompt copied to clipboard!');
  };

  const handleTestPreview = async () => {
    if (!generatedPrompt) {
      toast.error('Please fill in the template details first');
      return;
    }

    setGenerating(true);
    try {
      toast.info('Generating game preview... This may take 30-60 seconds');
      
      // Fetch full sub-competency data including scoring logic
      let subCompetenciesData = [];
      if (selectedSubCompetencies.length > 0) {
        const { data: subComps, error: subError } = await supabase
          .from('sub_competencies')
          .select('*')
          .in('id', selectedSubCompetencies);
        
        if (!subError && subComps) {
          subCompetenciesData = subComps;
        }
      }
      
      const { data, error } = await supabase.functions.invoke('generate-game', {
        body: {
          templatePrompt: generatedPrompt,
          primaryColor: '#00FF00',
          secondaryColor: '#9945FF',
          logoUrl: null,
          customizationId: null,
          previewMode: true,
          subCompetencies: subCompetenciesData,
        }
      });

      if (error) throw error;

      if (data?.html) {
        setPreviewHtml(data.html);
        setPreviewOpen(true);
        toast.success('Preview generated! 🎮');
      } else {
        throw new Error('No HTML returned from preview');
      }
    } catch (error: any) {
      console.error('Preview generation error:', error);
      toast.error('Failed to generate preview: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, saveAsDraft: boolean = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Validate scene requirements if any scene is filled
      const filledScenes = [formData.scene1, formData.scene2, formData.scene3, formData.scene4].filter(s => s.trim()).length;
      if (filledScenes === 1 && formData.edgeCase) {
        toast.error('Edge-case requires at least 2 scenes. Please add Scene 2 or remove Scene 1.');
        setLoading(false);
        return;
      }

      let customGameUrl = null;

      // Handle custom game upload
      if (templateType === 'custom_upload' && customGameFile) {
        const fileExt = customGameFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('custom-games')
          .upload(fileName, customGameFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('custom-games')
          .getPublicUrl(fileName);

        customGameUrl = publicUrl;
      }

      if (template?.id) {
        // Update existing template
        const { error } = await supabase
          .from('game_templates')
          .update({
            name: formData.name,
            description: formData.description,
            base_prompt: templateType === 'ai_generated' ? generatedPrompt : null,
            template_type: templateType,
            custom_game_url: customGameUrl,
            competency_id: selectedCompetency || null,
            selected_sub_competencies: selectedSubCompetencies,
          })
          .eq('id', template.id);

        if (error) throw error;
        toast.success('Template updated!');
      } else {
        // Create new template
        const { data: newTemplate, error } = await supabase
          .from('game_templates')
          .insert({
            creator_id: user.id,
            name: formData.name,
            description: formData.description,
            base_prompt: templateType === 'ai_generated' ? generatedPrompt : null,
            template_type: templateType,
            custom_game_url: customGameUrl,
            competency_id: selectedCompetency || null,
            selected_sub_competencies: selectedSubCompetencies,
          })
          .select()
          .single();

        if (error) throw error;
        
        if (saveAsDraft) {
          toast.success('Template saved as draft! Test it when ready.');
        } else {
          toast.success('Template created! Opening test wizard...');
          // Trigger test wizard if not saving as draft and callback exists
          if (onTemplateCreated && newTemplate && selectedSubCompetencies[0]) {
            onTemplateCreated(newTemplate.id, formData.name, selectedSubCompetencies[0]);
          }
        }
      }

      onSuccess();
      onOpenChange(false);
      setFormData({ 
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
        scene1: '', 
        scene2: '', 
        scene3: '', 
        scene4: '', 
        edgeCaseTiming: 'mid', 
        edgeCase: '', 
        uiAesthetic: '' 
      });
      setActiveScenes(1);
      setCustomGameFile(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-gray-900 border-neon-green text-white pointer-events-auto flex flex-col">
        <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
        <DialogHeader>
          <DialogTitle style={{ color: 'hsl(var(--neon-green))' }}>
            {template ? 'Edit Template' : 'Create Validator Template'}
          </DialogTitle>
        </DialogHeader>

        {/* Template Type Selector */}
        <TemplateTypeSelector
          selectedType={templateType}
          onTypeChange={setTemplateType}
        />

        {/* Load Sample Button - Only for AI Generated */}
        {templateType === 'ai_generated' && (
          <div className="flex justify-end -mt-2 mb-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLoadSample}
              className="gap-2"
            >
              Load Sample Template
            </Button>
          </div>
        )}

        {/* Quick Reference */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-2" style={{ color: 'hsl(var(--neon-green))' }}>
            ⚙️ Quick Reference (Read Before Designing)
          </h3>
          <div className="space-y-2 text-sm text-gray-300">
            <p><strong>Validator:</strong> a short interactive mini-game (3–6 min) that tests one sub-competency.</p>
            <p><strong>Sub-Competency:</strong> the specific behavior the validator surfaces through gameplay.</p>
            <p><strong>Edge Case:</strong> a single twist mid-game that forces adaptation — used to test mastery.</p>
            <p className="text-xs text-gray-400 mt-2">
              All validators automatically handle scoring, timers, and ledger receipts. Designers focus only on player experience, actions, and flow.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-gray-800 border-gray-700"
                placeholder="e.g., Trade-Off Navigator"
              />
            </div>

            <div>
              <Label htmlFor="description">Template Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="bg-gray-800 border-gray-700"
                placeholder="Brief overview of what this validator tests..."
              />
            </div>
          </div>

          {/* Custom Upload Section */}
          {templateType === 'custom_upload' && (
            <CustomGameUpload
              onFileSelect={setCustomGameFile}
              selectedFile={customGameFile}
            />
          )}

          {/* AI Generated Template Form */}
          {templateType === 'ai_generated' && (
            <>

          {/* Competency Selection */}
          <div className="border-t border-gray-700 pt-4 space-y-4">
            <h3 className="font-semibold" style={{ color: 'hsl(var(--neon-green))' }}>
              CBE Competency Framework
            </h3>

            <div className="relative z-[100]">
              <Label htmlFor="competency">Select Competency *</Label>
              <Select value={selectedCompetency} onValueChange={setSelectedCompetency}>
                <SelectTrigger id="competency" className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Choose a competency..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white z-[9999]">
                  {competencies.map((comp) => (
                    <SelectItem 
                      key={comp.id} 
                      value={comp.id} 
                      className="cursor-pointer hover:bg-gray-700 focus:bg-gray-700 text-white"
                    >
                      {comp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCompetency && subCompetencies.length > 0 && (
              <div>
                <Label>Select 1 Sub-Competency *</Label>
                <div className="space-y-2 mt-2 max-h-60 overflow-y-auto bg-gray-800 border border-gray-700 rounded-md p-3">
                  {subCompetencies.map((sub) => (
                    <div key={sub.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={sub.id}
                        checked={selectedSubCompetencies.includes(sub.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            // Replace with new selection (only 1 allowed)
                            setSelectedSubCompetencies([sub.id]);
                          } else {
                            setSelectedSubCompetencies([]);
                          }
                        }}
                      />
                      <label
                        htmlFor={sub.id}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {sub.statement}
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Select 1 behavior this validator will test
                </p>
              </div>
            )}

            {/* Show PlayOps Framework for Selected Sub-Competencies */}
            {selectedSubCompetencies.length > 0 && (
              <div className="bg-gray-800 border border-neon-green/30 rounded-lg p-4">
                <h4 className="font-semibold mb-3 text-sm" style={{ color: 'hsl(var(--neon-green))' }}>
                  🎮 PlayOps Framework
                </h4>
                <div className="space-y-6">
                  {subCompetencies
                    .filter(sub => selectedSubCompetencies.includes(sub.id))
                    .map((sub, idx) => (
                      <div key={sub.id} className="border-b border-gray-700 pb-4 last:border-0 last:pb-0">
                        <p className="font-semibold text-white mb-3">
                          {idx + 1}. {sub.statement}
                        </p>
                        
                        <div className="space-y-3 pl-4">
                          <div>
                            <p className="text-xs text-gray-400 font-medium">Validator Type</p>
                            <p className="text-sm text-gray-300">{sub.validator_type || 'Not defined'}</p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-gray-400 font-medium">Action Cue (to surface)</p>
                            <p className="text-sm text-gray-300">{sub.action_cue || 'Not defined'}</p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-gray-400 font-medium">Game Mechanic</p>
                            <p className="text-sm text-gray-300">{sub.game_mechanic || 'Not defined'}</p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-gray-400 font-medium">Loop</p>
                            <p className="text-sm text-gray-300">{sub.game_loop || 'Not defined'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                <p className="text-xs text-gray-500 mt-3 italic">
                  🔒 These mechanics are LOCKED per C-BEN standards and will be used in the AI generation.
                </p>
              </div>
            )}
            
            {/* Customize Your Scenario - Dynamic Fields */}
            {selectedSubCompetencies.length > 0 && (
              <div className="bg-gray-800 border border-purple-500/30 rounded-lg p-4">
                <h4 className="font-semibold mb-3 text-sm text-purple-400">
                  🎨 Customize Your Scenario
                </h4>
                <div className="space-y-4">
                  {/* Industry Context */}
                  <div>
                    <Label htmlFor="industry">Industry / Context *</Label>
                    <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-white z-50">
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Human Resources">Human Resources</SelectItem>
                        <SelectItem value="Communications">Communications</SelectItem>
                        <SelectItem value="Customer Service">Customer Service</SelectItem>
                        <SelectItem value="Technology">Technology / IT</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="Legal">Legal</SelectItem>
                        <SelectItem value="Supply Chain">Supply Chain</SelectItem>
                        <SelectItem value="Nonprofit">Nonprofit</SelectItem>
                        <SelectItem value="Government">Government</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Role / Scenario */}
                  <div>
                    <Label htmlFor="roleScenario">Your Role / Scenario (max 150 chars) *</Label>
                    <Input
                      id="roleScenario"
                      value={formData.roleScenario}
                      onChange={(e) => setFormData({ ...formData, roleScenario: e.target.value.slice(0, 150) })}
                      className="bg-gray-700 border-gray-600"
                      placeholder="e.g., You are a project manager facing a budget crisis"
                      maxLength={150}
                    />
                    <p className="text-xs text-gray-400 mt-1">{formData.roleScenario.length}/150</p>
                  </div>

                  {/* Key Element - Universal Field */}
                  <div>
                    <Label htmlFor="keyElement">Key Element (max 100 chars) *</Label>
                    <Input
                      id="keyElement"
                      value={formData.keyElement}
                      onChange={(e) => setFormData({ ...formData, keyElement: e.target.value.slice(0, 100) })}
                      className="bg-gray-700 border-gray-600"
                      placeholder="e.g., Budget & Staff (for allocation), Projects A-D (for ranking), Sales Data (for analysis)"
                      maxLength={100}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      What will the player work with? Examples: resources, items to rank, data to analyze, constraints, ideas
                    </p>
                  </div>

                  {/* Edge Case Details */}
                  <div>
                    <Label htmlFor="edgeCaseDetails">Edge Case Specific Details (max 80 chars) *</Label>
                    <Input
                      id="edgeCaseDetails"
                      value={formData.edgeCaseDetails}
                      onChange={(e) => setFormData({ ...formData, edgeCaseDetails: e.target.value.slice(0, 80) })}
                      className="bg-gray-700 border-gray-600"
                      placeholder="e.g., Budget cut from $100K to $60K"
                      maxLength={80}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      The locked edge case type is: {selectedSub?.game_loop || 'defined by validator'} • Customize the specific details
                    </p>
                  </div>

                  {/* Visual Theme */}
                  <div>
                    <Label htmlFor="visualTheme">Visual Theme *</Label>
                    <Select value={formData.visualTheme} onValueChange={(value) => setFormData({ ...formData, visualTheme: value })}>
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-white z-50">
                        <SelectItem value="modern">Modern / Clean</SelectItem>
                        <SelectItem value="dashboard">Executive Dashboard</SelectItem>
                        <SelectItem value="casual">Casual / Friendly</SelectItem>
                        <SelectItem value="urgent">High-Stakes / Urgent</SelectItem>
                        <SelectItem value="minimal">Minimal / Focus Mode</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Interaction Method - Contextual Dropdown */}
                  {getInteractionMethods().length > 0 && (
                    <div>
                      <Label htmlFor="interactionMethod">How Players Interact (updates Player Actions) *</Label>
                      <Select 
                        value={formData.interactionMethod} 
                        onValueChange={(value) => {
                          setFormData({ ...formData, interactionMethod: value });
                          // Auto-update playerActions template
                          const actionCue = selectedSub?.action_cue || 'perform this action';
                          const updatedActions = `ACTION CUE (C-BEN): ${actionCue}

HOW: ${value} to ${actionCue.toLowerCase()}

The system tracks your actions throughout the ${selectedSub?.game_loop || 'gameplay'}.`;
                          setFormData(prev => ({ ...prev, interactionMethod: value, playerActions: updatedActions }));
                        }}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600">
                          <SelectValue placeholder="Select interaction method" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white z-50">
                          {getInteractionMethods().map((method) => (
                            <SelectItem key={method} value={method} className="cursor-pointer hover:bg-gray-700 focus:bg-gray-700">
                              {method}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-400 mt-1">
                        ⚡ This auto-fills the "Player Actions" field below with C-BEN-aligned implementation
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-3 italic">
                  🎨 These fields customize the theme and context only - the core mechanics remain locked per C-BEN.
                </p>
              </div>
            )}
          </div>

          {/* Designer-Controlled Elements */}
          <div className="border-t border-gray-700 pt-4 space-y-4">
            <h3 className="font-semibold" style={{ color: 'hsl(var(--neon-green))' }}>
              Designer-Controlled Elements
            </h3>
            <p className="text-xs text-yellow-400 mb-2">
              ⚠️ Fill in these fields to generate the AI prompt and unlock the Test Preview button
            </p>

            <div>
              <Label htmlFor="scenario">Scenario / Theme *</Label>
              <Textarea
                id="scenario"
                value={formData.scenario}
                onChange={(e) => setFormData({ ...formData, scenario: e.target.value })}
                rows={3}
                className="bg-gray-800 border-gray-700"
                placeholder="Describe the narrative wrapper & visual tone. Example: 'Reboot the KPI system before it collapses.'"
              />
            </div>

            <div>
              <Label htmlFor="playerActions">Player Actions (auto-generated from interaction method) *</Label>
              <Textarea
                id="playerActions"
                value={formData.playerActions}
                onChange={(e) => setFormData({ ...formData, playerActions: e.target.value })}
                rows={5}
                className="bg-gray-800 border-gray-700 font-mono text-sm"
                placeholder="Select interaction method above to auto-fill this template..."
              />
              <p className="text-xs text-gray-400 mt-1">
                ⚠️ CRITICAL: This must implement the locked Action Cue from PlayOps Framework.<br />
                ✅ Auto-filled when you select interaction method - you can edit but must keep Action Cue aligned.<br />
                Template structure: ACTION CUE (locked) + HOW (interaction method) + Tracking note
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <Label>Action Scenes / Rounds (optional)</Label>
                <p className="text-xs text-gray-400 mt-1">
                  Use this section only if your validator has multiple short scenes (2–4).<br />
                  Each scene is one screen of play (~30–60s).<br />
                  Example:<br />
                  • Scene 1 = Baseline decision<br />
                  • Scene 2 = New variable introduced<br />
                  • Scene 3 = Edge-case twist<br />
                  • Scene 4 = Recover & submit final plan<br />
                  (Leave blank if the validator plays in one continuous round.)
                </p>
              </div>

              <div>
                <Label htmlFor="scene1" className="text-sm">Scene 1</Label>
                <Input
                  id="scene1"
                  value={formData.scene1}
                  onChange={(e) => setFormData({ ...formData, scene1: e.target.value })}
                  className="bg-gray-800 border-gray-700"
                  placeholder="e.g., Baseline decision or initial challenge"
                />
              </div>

              {activeScenes >= 2 && (
                <div>
                  <Label htmlFor="scene2" className="text-sm">Scene 2</Label>
                  <Input
                    id="scene2"
                    value={formData.scene2}
                    onChange={(e) => setFormData({ ...formData, scene2: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                    placeholder="e.g., New variable introduced"
                  />
                </div>
              )}

              {activeScenes >= 3 && (
                <div>
                  <Label htmlFor="scene3" className="text-sm">Scene 3</Label>
                  <Input
                    id="scene3"
                    value={formData.scene3}
                    onChange={(e) => setFormData({ ...formData, scene3: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                    placeholder="e.g., Edge-case rule flip"
                  />
                </div>
              )}

              {activeScenes >= 4 && (
                <div>
                  <Label htmlFor="scene4" className="text-sm">Scene 4</Label>
                  <Input
                    id="scene4"
                    value={formData.scene4}
                    onChange={(e) => setFormData({ ...formData, scene4: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                    placeholder="e.g., Recover and submit final plan"
                  />
                </div>
              )}

              <div className="flex gap-2">
                {activeScenes < 4 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveScenes(prev => Math.min(4, prev + 1))}
                    className="text-xs"
                  >
                    + Add Scene {activeScenes + 1}
                  </Button>
                )}
                {activeScenes > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActiveScenes(prev => prev - 1);
                      // Clear the last scene when removing
                      if (activeScenes === 4) setFormData({ ...formData, scene4: '' });
                      if (activeScenes === 3) setFormData({ ...formData, scene3: '' });
                      if (activeScenes === 2) setFormData({ ...formData, scene2: '' });
                    }}
                    className="text-xs"
                  >
                    Remove Scene {activeScenes}
                  </Button>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="edgeCaseTiming">Edge-Case Timing *</Label>
              <Select
                value={formData.edgeCaseTiming}
                onValueChange={(value: 'early' | 'mid' | 'late') => 
                  setFormData({ ...formData, edgeCaseTiming: value })
                }
              >
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Select timing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="early">Early (Scene 2 of 3-4)</SelectItem>
                  <SelectItem value="mid">Mid (Scene 2-3 of 3-4)</SelectItem>
                  <SelectItem value="late">Late (Scene 3-4 of 3-4)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400 mt-1">
                When should the rule-flip or disruption occur during gameplay?
              </p>
            </div>

            <div>
              <Label htmlFor="edgeCase">Edge-Case Moment *</Label>
              <Textarea
                id="edgeCase"
                value={formData.edgeCase}
                onChange={(e) => setFormData({ ...formData, edgeCase: e.target.value })}
                rows={3}
                className="bg-gray-800 border-gray-700"
                placeholder="How the disruption appears. Example: 'Timer cuts in half' or 'Key data field vanishes mid-game'"
              />
            </div>

            <div>
              <Label htmlFor="uiAesthetic">UI Aesthetic</Label>
              <Textarea
                id="uiAesthetic"
                value={formData.uiAesthetic}
                onChange={(e) => setFormData({ ...formData, uiAesthetic: e.target.value })}
                rows={2}
                className="bg-gray-800 border-gray-700"
                placeholder="Visual style. Example: 'Greyscale minimalist' or 'Neon cyberpunk with Deloitte branding'"
              />
            </div>
          </div>

          {/* Generated Prompt Preview */}
          <div className="border-t border-gray-700 pt-4">
            {!generatedPrompt ? (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
                <p className="text-yellow-400 font-semibold mb-2">⚠️ Test Preview Not Available Yet</p>
                <p className="text-sm text-gray-300">
                  Fill in at least the <strong>Scenario</strong>, <strong>Player Actions</strong>, and <strong>Edge-Case Moment</strong> fields above to generate the prompt and unlock the Test Preview button.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <Label>Generated AI Design Prompt</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('/validator-demo', '_blank')}
                    >
                      View Sample Demo
                    </Button>
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={handleTestPreview}
                      disabled={generating}
                      className="gap-2 bg-neon-green text-white hover:bg-neon-green/90 animate-pulse border-2 border-neon-green"
                    >
                      <Eye className="h-4 w-4" />
                      {generating ? 'Generating...' : 'Test Preview 🎮'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopyPrompt}
                      className="gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy to Use in Lovable
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={generatedPrompt}
                  readOnly
                  rows={10}
                  className="bg-gray-800 border-gray-700 text-xs font-mono"
                />
                <p className="text-xs text-gray-400 mt-2">
                  Copy this prompt and paste it into Lovable or another AI designer to build your validator.
                </p>
              </>
            )}
          </div>
          </>
          )}

          <div className="flex gap-3 justify-end border-t border-gray-700 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            {template ? (
              <Button 
                type="submit" 
                disabled={loading || (templateType === 'custom_upload' && !customGameFile)}
              >
                {loading ? 'Updating...' : 'Update Template'}
              </Button>
            ) : (
              <>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={loading || (templateType === 'custom_upload' && !customGameFile)}
                  className="border-gray-600 text-gray-300"
                >
                  {loading ? 'Saving...' : 'Save as Draft'}
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || (templateType === 'custom_upload' && !customGameFile)}
                  className="bg-neon-green text-black hover:bg-neon-green/80"
                >
                  {loading ? 'Creating...' : 'Create & Test'}
                </Button>
              </>
            )}
          </div>
        </form>
        </div>
      </DialogContent>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-[430px] w-full h-[90vh] bg-black border-neon-green p-0">
          <div className="flex flex-col h-full">
            <DialogHeader className="px-4 py-3 border-b border-neon-green/30">
              <DialogTitle className="text-neon-green text-glow-green text-sm">
                Mobile Preview - {formData.name}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              {previewHtml && (
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-full"
                  title="Game Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
                />
              )}
            </div>
            <div className="px-4 py-3 border-t border-neon-green/30">
              <Button
                variant="outline"
                onClick={() => setPreviewOpen(false)}
                className="w-full bg-gray-800 text-white hover:bg-gray-700"
              >
                Close Preview
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
