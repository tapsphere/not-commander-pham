import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

type ValidatorData = {
  id: string;
  customization_prompt: string;
  primary_color: string;
  secondary_color: string;
  logo_url: string | null;
  game_templates: {
    name: string;
    description: string | null;
    preview_image: string | null;
  };
};

export default function Play() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [validator, setValidator] = useState<ValidatorData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (code) {
      loadValidator();
    }
  }, [code]);

  const loadValidator = async () => {
    try {
      const { data, error } = await supabase
        .from('brand_customizations')
        .select(`
          id,
          customization_prompt,
          primary_color,
          secondary_color,
          logo_url,
          game_templates (
            name,
            description,
            preview_image
          )
        `)
        .eq('unique_code', code)
        .eq('published_at', 'NOT NULL')
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setError('Validator not found or not published');
        return;
      }

      setValidator(data as ValidatorData);
    } catch (error: any) {
      console.error('Failed to load validator:', error);
      setError('Failed to load validator');
      toast.error('Failed to load validator');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-neon-green mx-auto mb-4" />
          <p className="text-white">Loading validator...</p>
        </div>
      </div>
    );
  }

  if (error || !validator) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-gray-900 border-red-500 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Validator Not Found</h2>
          <p className="text-gray-400 mb-6">
            {error || 'This validator link may be invalid or has been unpublished.'}
          </p>
          <Button onClick={() => navigate('/')} variant="outline">
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div 
        className="relative py-20 px-4"
        style={{
          background: `linear-gradient(135deg, ${validator.primary_color}22, ${validator.secondary_color}22)`
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          {validator.logo_url && (
            <img
              src={validator.logo_url}
              alt="Brand Logo"
              className="h-16 mx-auto mb-6 object-contain"
            />
          )}
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {validator.game_templates.name}
          </h1>
          {validator.game_templates.description && (
            <p className="text-xl text-gray-300 mb-8">
              {validator.game_templates.description}
            </p>
          )}
          <Button
            size="lg"
            className="text-lg px-8 py-6"
            style={{
              backgroundColor: validator.primary_color,
              color: '#000',
            }}
            onClick={() => toast.info('Game will launch here - connect to your game logic')}
          >
            Start Validator
          </Button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4" style={{ color: validator.primary_color }}>
              About This Validator
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                This is a branded competency validator designed to assess your skills
                through interactive gameplay scenarios.
              </p>
              <div className="flex gap-4 pt-4">
                <div 
                  className="w-16 h-16 rounded-lg"
                  style={{ backgroundColor: validator.primary_color }}
                />
                <div 
                  className="w-16 h-16 rounded-lg"
                  style={{ backgroundColor: validator.secondary_color }}
                />
              </div>
            </div>
          </div>

          {validator.game_templates.preview_image && (
            <div className="rounded-lg overflow-hidden border-2" style={{ borderColor: validator.primary_color }}>
              <img
                src={validator.game_templates.preview_image}
                alt="Validator Preview"
                className="w-full h-auto"
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 py-8 text-center text-gray-500">
        <p className="text-sm">Powered by TON Validator Platform</p>
      </div>
    </div>
  );
}
