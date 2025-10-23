import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ModeChooser } from "@/components/platform/ModeChooser";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Runtime {
  id: string;
  mode: 'training' | 'testing';
  template_id: string;
  randomize: boolean;
  feedback_mode: string;
  time_limit_s: number;
  accuracy_threshold: number;
}

interface Template {
  id: string;
  name: string;
  description: string;
}

export default function PlayValidator() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template | null>(null);
  const [runtimes, setRuntimes] = useState<Runtime[]>([]);
  const [selectedRuntime, setSelectedRuntime] = useState<Runtime | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplateAndRuntimes();
  }, [templateId]);

  const loadTemplateAndRuntimes = async () => {
    try {
      // Get template
      const { data: templateData, error: templateError } = await supabase
        .from('game_templates')
        .select('id, name, description')
        .eq('id', templateId)
        .eq('is_published', true)
        .single();

      if (templateError) throw templateError;
      setTemplate(templateData);

      // Get runtimes
      const { data: runtimesData, error: runtimesError } = await supabase
        .from('validators_runtime')
        .select('*')
        .eq('template_id', templateId);

      if (runtimesError) throw runtimesError;
      setRuntimes((runtimesData || []) as Runtime[]);
    } catch (error: any) {
      console.error('Error loading:', error);
      toast.error('Failed to load validator');
      navigate('/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMode = async (mode: 'training' | 'testing') => {
    const runtime = runtimes.find(r => r.mode === mode);
    if (!runtime) {
      toast.error(`${mode} mode not available`);
      return;
    }

    setSelectedRuntime(runtime);
    
    // Start session
    try {
      const { data, error } = await supabase.functions.invoke('session-manager', {
        body: {
          action: 'start',
          runtime_id: runtime.id
        }
      });

      if (error) throw error;

      console.log('Session started:', data);
      toast.success(`${mode === 'training' ? 'Practice' : 'Validation'} session started!`);
      
      // TODO: Navigate to actual game play
      // For now, show session info
    } catch (error: any) {
      console.error('Error starting session:', error);
      toast.error('Failed to start session');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading validator...</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Validator not found</p>
          <Button onClick={() => navigate('/marketplace')}>
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  if (!selectedRuntime) {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          className="absolute top-4 left-4 z-10"
          onClick={() => navigate('/marketplace')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <ModeChooser
          templateName={template.name}
          onSelectMode={handleSelectMode}
        />
      </div>
    );
  }

  // Game play view (placeholder)
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => setSelectedRuntime(null)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Mode Selection
        </Button>

        <div className="bg-card p-8 rounded-lg border">
          <h2 className="text-2xl font-bold mb-4">
            {selectedRuntime.mode === 'training' ? '🧠 Practice Mode' : '🏁 Validation Mode'}
          </h2>
          <p className="text-muted-foreground mb-6">{template.description}</p>

          <div className="space-y-4 bg-muted p-4 rounded">
            <p className="font-medium">Session Active</p>
            <div className="text-sm space-y-1">
              <p>Mode: {selectedRuntime.mode}</p>
              <p>Time Limit: {selectedRuntime.time_limit_s}s</p>
              <p>Accuracy Threshold: {(selectedRuntime.accuracy_threshold * 100).toFixed(0)}%</p>
              <p>Feedback: {selectedRuntime.feedback_mode}</p>
              <p>Randomized: {selectedRuntime.randomize ? 'Yes' : 'No (fixed seed)'}</p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded">
            <p className="text-sm text-yellow-500">
              <strong>Demo Mode:</strong> This is a placeholder. The actual game interface will be 
              integrated here, using the runtime config above to control game behavior.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
