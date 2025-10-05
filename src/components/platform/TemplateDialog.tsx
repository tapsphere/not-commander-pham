import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Copy } from 'lucide-react';

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

export const TemplateDialog = ({ open, onOpenChange, template, onSuccess }: TemplateDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    scenario: '',
    playerActions: '',
    edgeCase: '',
    uiAesthetic: '',
  });
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  // Auto-generate prompt whenever form data changes
  useEffect(() => {
    if (formData.scenario || formData.playerActions || formData.edgeCase) {
      const prompt = `Design a 3–6 minute validator mini-game that tests a specific sub-competency through interactive gameplay.

⚙️ Quick Reference:
• Validator: a short interactive mini-game that tests one sub-competency
• Sub-Competency: the specific behavior the validator surfaces through gameplay
• Edge Case: a single twist mid-game that forces adaptation — used to test mastery

All scoring, timing, and proof logic are pre-baked into the system. Focus only on player experience, flow, and the edge-case moment.

📋 Design Requirements:

Scenario/Theme:
${formData.scenario || '[Describe the narrative wrapper and visual tone]'}

Player Actions:
${formData.playerActions || '[Define how the skill is expressed - e.g., drag-drop, select, type, prioritize]'}

Edge-Case Moment:
${formData.edgeCase || '[Describe how the disruption appears - e.g., timer cuts in half, data field vanishes, rule changes]'}

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
• Proof ledger integration and XP rewards`;
      
      setGeneratedPrompt(prompt);
    }
  }, [formData.scenario, formData.playerActions, formData.edgeCase, formData.uiAesthetic]);

  const handleLoadSample = () => {
    setFormData({
      name: 'Priority Trade-Off Navigator',
      description: 'Tests ability to make strategic decisions under competing constraints',
      scenario: 'You\'re a Product Manager during a critical launch week. The KPI dashboard is overloading — you must prioritize which metrics to stabilize first before the system crashes.',
      playerActions: 'Drag-and-drop to rank 6 competing KPIs (user retention, revenue, bug count, feature completion, team morale, tech debt). Each choice affects other metrics in real-time.',
      edgeCase: 'Halfway through, the CEO messages: "Revenue must be #1 or we lose funding." Timer cuts to 90 seconds. Players must re-prioritize while maintaining system stability.',
      uiAesthetic: 'Neon cyberpunk dashboard with glitching effects. Dark background with bright green/pink accent colors. Deloitte branding in corner. Animated metric cards with real-time % changes.',
    });
    toast.success('Sample template loaded!');
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast.success('Prompt copied to clipboard!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (template?.id) {
        // Update existing template
        const { error } = await supabase
          .from('game_templates')
          .update({
            name: formData.name,
            description: formData.description,
            base_prompt: generatedPrompt,
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
            base_prompt: generatedPrompt,
          });

        if (error) throw error;
        toast.success('Template created!');
      }

      onSuccess();
      onOpenChange(false);
      setFormData({ name: '', description: '', scenario: '', playerActions: '', edgeCase: '', uiAesthetic: '' });
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

        {/* Load Sample Button */}
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

          {/* Designer-Controlled Elements */}
          <div className="border-t border-gray-700 pt-4 space-y-4">
            <h3 className="font-semibold" style={{ color: 'hsl(var(--neon-green))' }}>
              Designer-Controlled Elements
            </h3>

            <div>
              <Label htmlFor="scenario">Scenario / Theme</Label>
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
              <Label htmlFor="playerActions">Player Actions</Label>
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
              <Label htmlFor="edgeCase">Edge-Case Moment</Label>
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
          {generatedPrompt && (
            <div className="border-t border-gray-700 pt-4">
              <div className="flex items-center justify-between mb-2">
                <Label>Generated AI Design Prompt</Label>
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
              <Textarea
                value={generatedPrompt}
                readOnly
                rows={10}
                className="bg-gray-800 border-gray-700 text-xs font-mono"
              />
              <p className="text-xs text-gray-400 mt-2">
                Copy this prompt and paste it into Lovable or another AI designer to build your validator.
              </p>
            </div>
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
