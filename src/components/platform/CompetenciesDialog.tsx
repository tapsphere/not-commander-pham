import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

interface SubCompetency {
  id: string;
  statement: string;
  display_order: number | null;
}

interface Competency {
  id: string;
  name: string;
  cbe_category: string;
  sub_competencies: SubCompetency[];
}

interface CompetenciesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
  templateName: string;
}

export const CompetenciesDialog = ({ open, onOpenChange, templateId, templateName }: CompetenciesDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [newCompetency, setNewCompetency] = useState('');
  const [newSubCompetency, setNewSubCompetency] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (open) {
      loadCompetencies();
    }
  }, [open, templateId]);

  const loadCompetencies = async () => {
    try {
      // Load master competencies with their sub-competencies
      const { data: masterCompetencies, error: compError } = await supabase
        .from('master_competencies')
        .select('*')
        .order('name');

      if (compError) throw compError;

      // Load all sub-competencies
      const { data: subCompData, error: subError } = await supabase
        .from('sub_competencies')
        .select('*')
        .order('display_order');

      if (subError) throw subError;

      // Group sub-competencies by competency_id
      const grouped = (masterCompetencies || []).map(comp => ({
        id: comp.id,
        name: comp.name,
        cbe_category: comp.cbe_category,
        sub_competencies: (subCompData || [])
          .filter(sub => sub.competency_id === comp.id)
          .map(sub => ({
            id: sub.id,
            statement: sub.statement,
            display_order: sub.display_order
          }))
          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
      }));

      setCompetencies(grouped);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAddCompetency = async () => {
    if (!newCompetency.trim()) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('master_competencies')
        .insert({
          name: newCompetency,
          cbe_category: 'Custom',
          departments: []
        });

      if (error) throw error;
      toast.success('Competency added!');
      setNewCompetency('');
      loadCompetencies();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubCompetency = async (competencyId: string) => {
    const newSub = newSubCompetency[competencyId]?.trim();
    if (!newSub) return;
    setLoading(true);

    try {
      // Get the highest display_order for this competency
      const { data: existingSubs } = await supabase
        .from('sub_competencies')
        .select('display_order')
        .eq('competency_id', competencyId)
        .order('display_order', { ascending: false })
        .limit(1);

      const nextOrder = existingSubs?.[0]?.display_order 
        ? existingSubs[0].display_order + 1 
        : 1;

      const { error } = await supabase
        .from('sub_competencies')
        .insert({
          competency_id: competencyId,
          statement: newSub,
          display_order: nextOrder
        });

      if (error) throw error;
      toast.success('Sub-competency added!');
      setNewSubCompetency({ ...newSubCompetency, [competencyId]: '' });
      loadCompetencies();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCompetency = async (competencyId: string) => {
    setLoading(true);
    try {
      // First delete all sub-competencies
      await supabase
        .from('sub_competencies')
        .delete()
        .eq('competency_id', competencyId);

      // Then delete the competency
      const { error } = await supabase
        .from('master_competencies')
        .delete()
        .eq('id', competencyId);

      if (error) throw error;
      toast.success('Competency deleted!');
      loadCompetencies();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSubCompetency = async (subCompetencyId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('sub_competencies')
        .delete()
        .eq('id', subCompetencyId);

      if (error) throw error;
      toast.success('Sub-competency removed!');
      loadCompetencies();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-gray-900 border-neon-green text-white">
        <DialogHeader>
          <DialogTitle style={{ color: 'hsl(var(--neon-green))' }}>
            Competencies for {templateName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add New Competency */}
          <Card className="p-4 bg-gray-800 border-gray-700">
            <Label>Add Competency</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newCompetency}
                onChange={(e) => setNewCompetency(e.target.value)}
                placeholder="e.g., Critical Thinking"
                className="bg-gray-700 border-gray-600"
              />
              <Button onClick={handleAddCompetency} disabled={loading}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          {/* List Competencies */}
          {competencies.map((comp) => (
            <Card key={comp.id} className="p-4 bg-gray-800 border-gray-700">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{comp.name}</h3>
                  <p className="text-xs text-gray-400">{comp.cbe_category}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteCompetency(comp.id)}
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>

              {/* Sub-competencies */}
              <div className="space-y-2">
                {comp.sub_competencies.map((sub) => (
                  <div key={sub.id} className="flex justify-between items-start bg-gray-700 px-3 py-2 rounded gap-2">
                    <span className="text-sm flex-1">{sub.statement}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSubCompetency(sub.id)}
                      disabled={loading}
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </Button>
                  </div>
                ))}

                {/* Add Sub-competency */}
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newSubCompetency[comp.id] || ''}
                    onChange={(e) => setNewSubCompetency({ ...newSubCompetency, [comp.id]: e.target.value })}
                    placeholder="Add sub-competency..."
                    className="bg-gray-700 border-gray-600 text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleAddSubCompetency(comp.id)}
                    disabled={loading}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
