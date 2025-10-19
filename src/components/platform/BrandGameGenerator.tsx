import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Loader2, Copy, Check } from 'lucide-react';
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
}

export const BrandGameGenerator = ({
  open,
  onOpenChange,
  courseName,
  mapping,
  brandId,
}: BrandGameGeneratorProps) => {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [customizationPrompt, setCustomizationPrompt] = useState('');
  const [gameHtml, setGameHtml] = useState('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAutoFill = async () => {
    try {
      setGenerating(true);
      setProgress(10);

      // Fetch the full sub-competency data from database
      const { data: subCompData, error: subError } = await supabase
        .from('sub_competencies')
        .select('*')
        .eq('statement', mapping.sub_competency)
        .maybeSingle();

      if (subError) throw subError;
      
      if (!subCompData) {
        toast.error('Sub-competency data not found in database');
        return;
      }

      setProgress(30);

      // Build auto-filled prompt using database data
      const autoPrompt = `
🎯 VALIDATOR: ${courseName} - ${mapping.sub_competency}

📋 C-BEN COMPETENCY FRAMEWORK
Domain: ${mapping.domain}
Competency: ${mapping.competency}
Sub-Competency: ${mapping.sub_competency}
Validator Type: ${subCompData.validator_type || mapping.validator_type}

🎮 GAME DESIGN (PlayOps Framework)
Action Cue: ${subCompData.action_cue || mapping.action_cue || 'Demonstrate this competency in realistic scenario'}
Game Mechanic: ${subCompData.game_mechanic || 'Interactive simulation'}
Game Loop: ${subCompData.game_loop || 'Input → Action → Feedback → Adjust → Submit'}

📊 SCORING & PROFICIENCY LEVELS
Level 1 (Needs Work): ${subCompData.scoring_formula_level_1 || '<80% accuracy'}
Level 2 (Proficient): ${subCompData.scoring_formula_level_2 || '80-94% accuracy'}
Level 3 (Mastery): ${subCompData.scoring_formula_level_3 || '≥95% accuracy + edge case handled'}

Evidence Metric: ${mapping.evidence_metric}

🎯 SCENARIO
Context: ${mapping.alignment_summary}
Course Application: "${courseName}" training module

Player Task:
• ${subCompData.action_cue || 'Complete the challenge'}
• Demonstrate mastery of: ${mapping.sub_competency}
• Meet scoring criteria for proficiency levels

📱 TECHNICAL REQUIREMENTS
• Mobile-first design (Telegram Mini App)
• 3-6 minute gameplay
• Real-time scoring
• Clear visual feedback
• Touch-friendly controls
• Auto-submit on completion

🎨 UI AESTHETIC
Clean, professional interface matching validator type: ${subCompData.validator_type}
Color scheme: Grayscale with neon accent for feedback
Typography: Clear, readable fonts for mobile

⚡ EDGE CASE
Include mid-game disruption that tests adaptability:
${subCompData.game_loop ? `Based on: ${subCompData.game_loop}` : 'Introduce unexpected constraint or rule change'}

📈 RESULT SCREEN
Display:
• Performance level (color-coded: red/yellow/green)
• Score breakdown by criteria
• Evidence statement: "${mapping.evidence_metric}"
• Next steps for improvement
`;

      setGeneratedPrompt(autoPrompt);
      setProgress(50);
      
      toast.success('Game template auto-filled from framework data!');
      
    } catch (error) {
      console.error('Auto-fill error:', error);
      toast.error('Failed to auto-fill. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!generatedPrompt && !customizationPrompt) {
      toast.error('Please auto-fill or enter a custom prompt first');
      return;
    }

    try {
      setGenerating(true);
      setProgress(60);

      const finalPrompt = customizationPrompt || generatedPrompt;

      const { data, error } = await supabase.functions.invoke('generate-game', {
        body: {
          templatePrompt: finalPrompt,
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
        toast.error('Rate limit exceeded. Please wait a moment and try again.');
      } else if (error.message?.includes('402')) {
        toast.error('Credits depleted. Please add funds to continue.');
      } else {
        toast.error('Failed to generate game. Please try again.');
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

      // Find matching template for this validator type
      const { data: template, error: templateError } = await supabase
        .from('game_templates')
        .select('id')
        .eq('name', mapping.validator_type)
        .eq('is_published', true)
        .maybeSingle();

      if (templateError) throw templateError;

      // Create brand customization
      const { error: saveError } = await supabase
        .from('brand_customizations')
        .insert({
          brand_id: user.id,
          template_id: template?.id || null,
          customization_prompt: customizationPrompt || generatedPrompt,
          generated_game_html: gameHtml,
        });

      if (saveError) throw saveError;

      toast.success('Game saved to your dashboard!');
      onOpenChange(false);
      
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save game');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    toast.success('Prompt copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-neon-green" />
            Generate Game: {courseName}
          </DialogTitle>
          <DialogDescription>
            Auto-fill game design from C-BEN framework data, then generate your custom validator
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Competency Info */}
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Sub-Competency</p>
                  <p className="font-medium">{mapping.sub_competency}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Validator Type</p>
                  <p className="font-medium">{mapping.validator_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Action Cue</p>
                  <p className="font-medium">{mapping.action_cue || 'Will be loaded from database'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Game Mechanic</p>
                  <p className="font-medium">{mapping.game_mechanic || 'Will be loaded from database'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Auto-Fill Button */}
          {!generatedPrompt && (
            <Button
              onClick={handleAutoFill}
              disabled={generating}
              className="w-full bg-neon-green text-white hover:bg-neon-green/90"
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

          {/* Generated Prompt */}
          {generatedPrompt && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Auto-Generated Game Prompt</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyPrompt}
                  className="gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <Textarea
                value={generatedPrompt}
                onChange={(e) => setGeneratedPrompt(e.target.value)}
                rows={15}
                className="font-mono text-xs"
              />
            </div>
          )}

          {/* Custom Prompt Override */}
          {generatedPrompt && (
            <div className="space-y-2">
              <Label>Customize Prompt (Optional)</Label>
              <Textarea
                value={customizationPrompt}
                onChange={(e) => setCustomizationPrompt(e.target.value)}
                placeholder="Add custom instructions or modifications here..."
                rows={5}
              />
            </div>
          )}

          {/* Progress */}
          {generating && progress > 0 && progress < 100 && (
            <Progress value={progress} className="w-full" />
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {generatedPrompt && !gameHtml && (
              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="flex-1 bg-primary"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Game...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Game
                  </>
                )}
              </Button>
            )}

            {gameHtml && (
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-neon-green text-white hover:bg-neon-green/90"
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
            )}
          </div>

          {/* Preview */}
          {gameHtml && (
            <Card>
              <CardContent className="pt-4">
                <Label className="mb-2 block">Game Preview</Label>
                <div className="border rounded-lg overflow-hidden bg-black">
                  <iframe
                    srcDoc={gameHtml}
                    className="w-full h-[500px]"
                    title="Game Preview"
                    sandbox="allow-scripts"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
