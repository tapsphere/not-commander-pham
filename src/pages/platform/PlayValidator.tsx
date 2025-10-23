import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ModeChooser } from "@/components/platform/ModeChooser";
import { GamePlayer } from "@/components/platform/GamePlayer";
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
  generated_game_html?: string | null;
}

export default function PlayValidator() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template | null>(null);
  const [runtimes, setRuntimes] = useState<Runtime[]>([]);
  const [selectedRuntime, setSelectedRuntime] = useState<Runtime | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplateAndRuntimes();
  }, [templateId]);

  const loadTemplateAndRuntimes = async () => {
    try {
      // Get template (generated_game_html will be added to schema later)
      const { data: templateData, error: templateError } = await supabase
        .from('game_templates')
        .select('id, name, description')
        .eq('id', templateId)
        .eq('is_published', true)
        .single();

      if (templateError) throw templateError;
      setTemplate({ ...templateData, generated_game_html: null });

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

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    // Testing mode requires login
    if (mode === 'testing' && !user) {
      toast.error('Please sign in to access Validation Mode');
      navigate('/auth');
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
      
      const sessionIdentifier = data.session?.id || data.session_id;
      setSessionId(sessionIdentifier);
      setIsDemo(data.demo || false);
      
      if (data.demo) {
        toast.info('Demo mode - Your progress will not be saved');
      } else {
        toast.success(`${mode === 'training' ? 'Practice' : 'Validation'} session started!`);
      }
    } catch (error: any) {
      console.error('Error starting session:', error);
      toast.error(error.message || 'Failed to start session');
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

  // Game play view
  if (sessionId) {
    return (
      <GamePlayer
        sessionId={sessionId}
        templateName={template.name}
        templateDescription={template.description}
        runtime={selectedRuntime}
        isDemo={isDemo}
        onExit={() => {
          setSelectedRuntime(null);
          setSessionId(null);
          setIsDemo(false);
        }}
        generatedGameHtml={template.generated_game_html}
      />
    );
  }

  // Should not reach here
  return null;
}
