import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

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
    base_prompt: template?.base_prompt || '',
  });

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
            base_prompt: formData.base_prompt,
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
            base_prompt: formData.base_prompt,
          });

        if (error) throw error;
        toast.success('Template created!');
      }

      onSuccess();
      onOpenChange(false);
      setFormData({ name: '', description: '', base_prompt: '' });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gray-900 border-neon-green text-white">
        <DialogHeader>
          <DialogTitle style={{ color: 'hsl(var(--neon-green))' }}>
            {template ? 'Edit Template' : 'Create New Template'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="bg-gray-800 border-gray-700"
              placeholder="Describe your game template..."
            />
          </div>

          <div>
            <Label htmlFor="base_prompt">Base System Prompt</Label>
            <Textarea
              id="base_prompt"
              value={formData.base_prompt}
              onChange={(e) => setFormData({ ...formData, base_prompt: e.target.value })}
              rows={6}
              className="bg-gray-800 border-gray-700"
              placeholder="Define the AI personality and game rules..."
            />
            <p className="text-xs text-gray-400 mt-1">
              This prompt defines how the AI will behave in the game
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : template ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
