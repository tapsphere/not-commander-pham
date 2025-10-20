import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Loader2, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

interface CompetencyMapping {
  domain: string;
  competency: string;
  sub_competency: string;
  alignment_summary: string;
  validator_type: string;
  action_cue?: string;
  game_mechanic?: string;
  evidence_metric: string;
  scoring_formula: string;
}

interface BrandGameGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseName: string;
  mapping: CompetencyMapping;
  brandId: string;
  onSuccess?: () => void; // Add callback for when game is saved
}

interface FormData {
  industry: string;
  roleScenario: string;
  keyElement: string;
  edgeCaseDetails: string;
  visualTheme: string;
  interactionMethod: string;
  scenario: string;
  playerActions: string;
  scene1: string;
  scene2: string;
  scene3: string;
  scene4: string;
  edgeCaseTiming: 'early' | 'mid' | 'late';
  edgeCase: string;
  uiAesthetic: string;
}

export const BrandGameGenerator = ({
  open,
  onOpenChange,
  courseName,
  mapping,
  brandId,
  onSuccess,
}: BrandGameGeneratorProps) => {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [gameHtml, setGameHtml] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeScenes, setActiveScenes] = useState(3);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    industry: 'Technology',
    roleScenario: '',
    keyElement: '',
    edgeCaseDetails: '',
    visualTheme: 'modern',
    interactionMethod: 'Click to select options',
    scenario: '',
    playerActions: '',
    scene1: '',
    scene2: '',
    scene3: '',
    scene4: '',
    edgeCaseTiming: 'mid',
    edgeCase: '',
    uiAesthetic: '',
  });

  const handleAutoFill = async () => {
    try {
      setGenerating(true);
      setProgress(10);

      // Fetch full sub-competency data (use limit + first to handle duplicates)
      const { data: subCompDataArray, error: subError } = await supabase
        .from('sub_competencies')
        .select('*')
        .eq('statement', mapping.sub_competency)
        .limit(1);

      if (subError) throw subError;
      
      const subCompData = subCompDataArray?.[0];
      
      if (!subCompData) {
        toast.error('Sub-competency data not found');
        return;
      }

      setProgress(30);

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
        'Performance Demonstration': {
          scene1: 'Evaluate performance using primary metrics',
          scene2: 'Compare against benchmarks and identify gaps',
          scene3: '⚡ EDGE CASE: Priority KPI suddenly changes - pivot evaluation focus'
        }
      };
      
      const scenes = sceneExamples[subCompData.validator_type || mapping.validator_type] || {
        scene1: 'Complete baseline task using standard approach',
        scene2: 'Adapt to new information or constraint',
        scene3: '⚡ EDGE CASE: Critical rule change - adjust strategy in real-time'
      };

      const autoFilled: FormData = {
        industry: 'Technology',
        roleScenario: `You are working on ${courseName} training challenge`,
        keyElement: 'Key resources or data relevant to this challenge',
        edgeCaseDetails: 'Sudden constraint or variable change mid-task',
        visualTheme: 'modern',
        interactionMethod: 'Click to select options',
        scenario: `Apply "${mapping.sub_competency}" in a realistic ${courseName} scenario where ${subCompData.action_cue || 'a challenge arises'}`,
        playerActions: `ACTION CUE (C-BEN): ${subCompData.action_cue || mapping.action_cue || 'Demonstrate this competency'}

HOW: Click to select options to ${(subCompData.action_cue || '').toLowerCase() || 'interact with the challenge'}

The system tracks your actions throughout the ${subCompData.game_loop || 'gameplay'}.`,
        scene1: scenes.scene1,
        scene2: scenes.scene2,
        scene3: scenes.scene3,
        scene4: scenes.scene4 || '',
        edgeCaseTiming: 'mid',
        edgeCase: `${subCompData.game_loop || 'During gameplay'}, introduce an unexpected challenge that tests adaptability using the ${subCompData.validator_type || mapping.validator_type}`,
        uiAesthetic: `Design matches the ${subCompData.game_mechanic || mapping.game_mechanic || 'core mechanic'} with clear visual feedback. Use ${subCompData.validator_type || mapping.validator_type} to provide immediate player feedback.`,
      };

      setFormData(autoFilled);
      
      // Set active scenes
      const sceneCount = [scenes.scene1, scenes.scene2, scenes.scene3, scenes.scene4].filter(s => s).length;
      setActiveScenes(Math.max(1, sceneCount));
      
      setProgress(50);
      toast.success('Game template auto-filled from C-BEN framework!');
      
    } catch (error) {
      console.error('Auto-fill error:', error);
      toast.error('Failed to auto-fill. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const buildGamePrompt = () => {
    const sceneSection = [formData.scene1, formData.scene2, formData.scene3, formData.scene4]
      .filter(s => s)
      .length > 0
      ? `
Action Scenes:
${formData.scene1 ? `Scene 1: ${formData.scene1}` : ''}
${formData.scene2 ? `Scene 2: ${formData.scene2}` : ''}
${formData.scene3 ? `Scene 3: ${formData.scene3}` : ''}
${formData.scene4 ? `Scene 4: ${formData.scene4}` : ''}
` : '';

    return `🎯 VALIDATOR: ${courseName} - ${mapping.sub_competency}

📋 C-BEN COMPETENCY FRAMEWORK
Domain: ${mapping.domain}
Competency: ${mapping.competency}
Sub-Competency: ${mapping.sub_competency}
Validator Type: ${mapping.validator_type}
Action Cue: ${mapping.action_cue || formData.playerActions}
Game Mechanic: ${mapping.game_mechanic || 'Interactive simulation'}

🎮 SCENARIO DESIGN
Industry/Context: ${formData.industry}
Role: ${formData.roleScenario}
Key Element: ${formData.keyElement}
Visual Theme: ${formData.visualTheme}
Interaction: ${formData.interactionMethod}

Scenario: ${formData.scenario}

Player Actions:
${formData.playerActions}
${sceneSection}
Edge-Case Moment (${formData.edgeCaseTiming} game):
${formData.edgeCase}
Specific Edge Case Details: ${formData.edgeCaseDetails}

Scoring & Result Screens (CRITICAL):
✅ Level 1 (Needs Work): ${mapping.scoring_formula || '<80% accuracy'}
✅ Level 2 (Proficient): 80-94% accuracy
✅ Level 3 (Mastery): ≥95% accuracy + edge case handled

UI Aesthetic:
${formData.uiAesthetic}

📱 Telegram Mini App Requirements:
• Mobile-first responsive design
• Fast loading and smooth performance
• Touch-friendly interactions
• Built with standard web technologies (React, TypeScript)
• Integrates with Telegram Web App SDK
• 3-6 minute gameplay
• Real-time scoring and feedback`;
  };

  const handleGenerate = async () => {
    if (!formData.scenario || !formData.playerActions) {
      toast.error('Please fill in scenario and player actions first');
      return;
    }

    try {
      setGenerating(true);
      setProgress(60);

      // Fetch user's logo from profile
      const { data: { user } } = await supabase.auth.getUser();
      let logoUrl = null;
      
      if (user) {
        const { data: profileData } = await (supabase as any)
          .from('profiles')
          .select('company_logo_url')
          .eq('user_id', user.id)
          .single();
        logoUrl = profileData?.company_logo_url;
      }

      const gamePrompt = buildGamePrompt();

      const { data, error } = await supabase.functions.invoke('generate-game', {
        body: {
          templatePrompt: gamePrompt,
          primaryColor: '#00FF00',
          secondaryColor: '#9945FF',
          accentColor: '#FF5722',
          backgroundColor: '#1A1A1A',
          logoUrl: logoUrl,
          previewMode: true,
        },
      });

      if (error) throw error;
      
      setProgress(90);
      setGameHtml(data.generatedHtml);
      setProgress(100);
      
      toast.success('Game generated successfully!');
      
    } catch (error: any) {
      console.error('Generation error:', error);
      if (error.message?.includes('429')) {
        toast.error('Rate limit exceeded. Please wait a moment.');
      } else if (error.message?.includes('402')) {
        toast.error('Credits depleted. Please add funds.');
      } else {
        toast.error('Failed to generate game.');
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!gameHtml) {
      toast.error('Please generate a game first');
      return;
    }

    try {
      setSaving(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to save');
        return;
      }

      // Fetch user's logo from profile
      let logoUrl = null;
      const { data: profileData } = await (supabase as any)
        .from('profiles')
        .select('company_logo_url')
        .eq('user_id', user.id)
        .single();
      logoUrl = profileData?.company_logo_url;

      // Find matching template
      const { data: template } = await supabase
        .from('game_templates')
        .select('id')
        .eq('name', mapping.validator_type)
        .eq('is_published', true)
        .maybeSingle();

      // Create customization with logo
      const { error: saveError } = await supabase
        .from('brand_customizations')
        .insert({
          brand_id: user.id,
          template_id: template?.id || null,
          customization_prompt: buildGamePrompt(),
          generated_game_html: gameHtml,
          logo_url: logoUrl,
          primary_color: '#00FF00',
          secondary_color: '#9945FF',
          accent_color: '#FF5722',
          background_color: '#1A1A1A',
        });

      if (saveError) throw saveError;

      toast.success('Game saved to your dashboard!');
      onOpenChange(false);
      
      // Call success callback to refresh dashboard
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save game');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-neon-green">
            <Sparkles className="w-5 h-5" />
            Generate Validator: {courseName}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Auto-fill game design from C-BEN framework, then customize and generate
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Competency Info */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Sub-Competency</p>
                  <p className="font-medium text-white">{mapping.sub_competency}</p>
                </div>
                <div>
                  <p className="text-gray-400">Validator Type</p>
                  <p className="font-medium text-white">{mapping.validator_type}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Auto-Fill Button */}
          {!formData.scenario && (
            <Button
              onClick={handleAutoFill}
              disabled={generating}
              className="w-full bg-neon-green text-black hover:bg-neon-green/90 font-semibold"
              size="lg"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading Framework Data...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Auto-Fill from C-BEN Framework
                </>
              )}
            </Button>
          )}

          {/* Game Design Form */}
          {formData.scenario && (
            <div className="space-y-6">
              {/* Basic Customization */}
              <Card className="bg-gray-800 border-purple-500/30">
                <CardContent className="pt-4 space-y-4">
                  <h3 className="font-semibold text-purple-400">🎨 Customize Your Scenario</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="industry">Industry / Context</Label>
                      <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                        <SelectTrigger className="bg-gray-700 border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white z-[9999]">
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

                    <div>
                      <Label htmlFor="visualTheme">Visual Theme</Label>
                      <Select value={formData.visualTheme} onValueChange={(value) => setFormData({ ...formData, visualTheme: value })}>
                        <SelectTrigger className="bg-gray-700 border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white z-[9999]">
                          <SelectItem value="modern">Modern / Clean</SelectItem>
                          <SelectItem value="dashboard">Executive Dashboard</SelectItem>
                          <SelectItem value="casual">Casual / Friendly</SelectItem>
                          <SelectItem value="urgent">High-Stakes / Urgent</SelectItem>
                          <SelectItem value="minimal">Minimal / Focus Mode</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Your Role / Scenario (max 150 chars)</Label>
                    <Input
                      value={formData.roleScenario}
                      onChange={(e) => setFormData({ ...formData, roleScenario: e.target.value.slice(0, 150) })}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="e.g., You are a manager facing a budget crisis"
                      maxLength={150}
                    />
                    <p className="text-xs text-gray-400 mt-1">{formData.roleScenario.length}/150</p>
                  </div>

                  <div>
                    <Label>Key Element (max 100 chars)</Label>
                    <Input
                      value={formData.keyElement}
                      onChange={(e) => setFormData({ ...formData, keyElement: e.target.value.slice(0, 100) })}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="e.g., Budget & Staff, Projects A-D, Sales Data"
                      maxLength={100}
                    />
                    <p className="text-xs text-gray-400 mt-1">What will the player work with?</p>
                  </div>

                  <div>
                    <Label>Edge Case Details (max 80 chars)</Label>
                    <Input
                      value={formData.edgeCaseDetails}
                      onChange={(e) => setFormData({ ...formData, edgeCaseDetails: e.target.value.slice(0, 80) })}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="e.g., Budget cut from $100K to $60K"
                      maxLength={80}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Designer-Controlled Elements */}
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="pt-4 space-y-4">
                  <h3 className="font-semibold text-neon-green">Designer-Controlled Elements</h3>

                  <div>
                    <Label>Scenario / Theme</Label>
                    <Textarea
                      value={formData.scenario}
                      onChange={(e) => setFormData({ ...formData, scenario: e.target.value })}
                      rows={3}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <Label>Player Actions</Label>
                    <Textarea
                      value={formData.playerActions}
                      onChange={(e) => setFormData({ ...formData, playerActions: e.target.value })}
                      rows={5}
                      className="bg-gray-700 border-gray-600 text-white font-mono text-sm"
                    />
                  </div>

                  {/* Scenes */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Action Scenes ({activeScenes})</Label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map(num => (
                          <Button
                            key={num}
                            type="button"
                            variant={activeScenes === num ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveScenes(num)}
                            className="w-8 h-8 p-0"
                          >
                            {num}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Input
                      value={formData.scene1}
                      onChange={(e) => setFormData({ ...formData, scene1: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Scene 1"
                    />
                    {activeScenes >= 2 && (
                      <Input
                        value={formData.scene2}
                        onChange={(e) => setFormData({ ...formData, scene2: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Scene 2"
                      />
                    )}
                    {activeScenes >= 3 && (
                      <Input
                        value={formData.scene3}
                        onChange={(e) => setFormData({ ...formData, scene3: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Scene 3 (⚡ Edge Case)"
                      />
                    )}
                    {activeScenes >= 4 && (
                      <Input
                        value={formData.scene4}
                        onChange={(e) => setFormData({ ...formData, scene4: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Scene 4"
                      />
                    )}
                  </div>

                  {/* Advanced Options */}
                  <div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="gap-2 text-gray-400"
                    >
                      {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      Advanced Options
                    </Button>

                    {showAdvanced && (
                      <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-700">
                        <div>
                          <Label>Edge Case Description</Label>
                          <Textarea
                            value={formData.edgeCase}
                            onChange={(e) => setFormData({ ...formData, edgeCase: e.target.value })}
                            rows={3}
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>

                        <div>
                          <Label>UI Aesthetic</Label>
                          <Textarea
                            value={formData.uiAesthetic}
                            onChange={(e) => setFormData({ ...formData, uiAesthetic: e.target.value })}
                            rows={2}
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Progress */}
              {generating && progress > 0 && progress < 100 && (
                <Progress value={progress} className="w-full" />
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {!gameHtml && (
                  <Button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Game...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Generate Game
                      </>
                    )}
                  </Button>
                )}

                {gameHtml && (
                  <>
                    <Button
                      onClick={handleGenerate}
                      variant="outline"
                      disabled={generating}
                      className="flex-1"
                    >
                      Regenerate
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 bg-neon-green text-black hover:bg-neon-green/90"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save to Dashboard'
                      )}
                    </Button>
                  </>
                )}
              </div>

              {/* Preview */}
              {gameHtml && (
                <Card className="bg-black border-neon-green/30">
                  <CardContent className="pt-4">
                    <Label className="mb-2 block text-neon-green">Game Preview</Label>
                    <div className="border border-gray-700 rounded-lg overflow-hidden">
                      <iframe
                        srcDoc={gameHtml}
                        className="w-full h-[500px]"
                        title="Game Preview"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
