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
}

// Global sample prompt with full scoring and proficiency details
const SAMPLE_PROMPT_WITH_SCORING = `You are playing as a crisis communication manager at TechFlow Inc., a SaaS company that just experienced a data breach affecting 50,000 customer accounts.

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

export const TemplateDialog = ({ open, onOpenChange, template, onSuccess }: TemplateDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [templateType, setTemplateType] = useState<'ai_generated' | 'custom_upload'>('ai_generated');
  const [customGameFile, setCustomGameFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    scenario: '',
    playerActions: '',
    edgeCase: '',
    uiAesthetic: '',
  });
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  // Competency data
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [subCompetencies, setSubCompetencies] = useState<any[]>([]);
  const [selectedCompetency, setSelectedCompetency] = useState<string>('');
  const [selectedSubCompetencies, setSelectedSubCompetencies] = useState<string[]>([]);

  // Fetch competencies on mount
  useEffect(() => {
    const fetchCompetencies = async () => {
      const { data, error } = await supabase
        .from('master_competencies')
        .select('*')
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
        
        const sample = {
          name: `${subCompData.statement.substring(0, 50)}...`,
          description: `Tests: ${subCompData.statement}`,
          scenario: `Apply this competency in a realistic work scenario where ${actionCue}. 

You'll interact with a ${gameMechanic.toLowerCase()} interface that requires you to ${subCompData.statement.toLowerCase()}.`,
          playerActions: `${playerAction}

The system tracks your actions throughout the ${gameLoop}.`,
          edgeCase: `${edgeCase}`,
          uiAesthetic: `Interface style: ${gameMechanic} in a professional workspace. Clean, mobile-optimized design with clear visual feedback.`,
        };
        
        console.log('Setting sample:', sample);
        setFormData(prev => ({ ...prev, ...sample }));
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
📋 Design Requirements:

Scenario/Theme:
${formData.scenario || '[Describe the narrative wrapper and visual tone]'}

Player Actions:
${formData.playerActions || '[Define how the skill is expressed - e.g., drag-drop, select, type, prioritize]'}

Edge-Case Moment:
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
    const sample = {
      name: `${subCompData.statement.substring(0, 50)}...`,
      description: `Tests ability to demonstrate: ${subCompData.statement}`,
      scenario: `Apply this competency in a realistic work scenario where ${subCompData.action_cue || 'a challenge arises requiring this skill'}`,
      playerActions: subCompData.player_action || 'Interact with the game mechanics to demonstrate this skill',
      edgeCase: `${subCompData.game_loop || 'During gameplay'}, introduce an unexpected challenge that tests adaptability using the ${subCompData.validator_type || 'validation system'}`,
      uiAesthetic: `Design matches the ${subCompData.game_mechanic || 'core mechanic'} with clear visual feedback. Use ${subCompData.validator_type || 'real-time validation'} to provide immediate player feedback.`,
    };
    
    setFormData(sample);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

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
        const { error } = await supabase
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
          });

        if (error) throw error;
        toast.success('Template created!');
      }

      onSuccess();
      onOpenChange(false);
      setFormData({ name: '', description: '', scenario: '', playerActions: '', edgeCase: '', uiAesthetic: '' });
      setCustomGameFile(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-neon-green text-white pointer-events-auto">
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
                <Label>Select 1-2 Sub-Competencies *</Label>
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
                  These PlayOps parameters will be incorporated into your validator design. Scoring is handled automatically in the backend.
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
              <Label htmlFor="playerActions">Player Actions *</Label>
              <Textarea
                id="playerActions"
                value={formData.playerActions}
                onChange={(e) => setFormData({ ...formData, playerActions: e.target.value })}
                rows={3}
                className="bg-gray-800 border-gray-700"
                placeholder="How the skill is expressed. Example: 'Drag-and-drop to rank priorities' or 'Select trade-offs between competing KPIs'"
              />
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
            <Button 
              type="submit" 
              disabled={loading || (templateType === 'custom_upload' && !customGameFile)}
            >
              {loading ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </form>
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
                  sandbox="allow-scripts allow-same-origin"
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
