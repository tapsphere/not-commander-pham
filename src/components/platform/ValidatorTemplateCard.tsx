import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface CompetencyMapping {
  domain: string;
  competency: string;
  sub_competency: string;
  alignment_summary: string;
  validator_type: string;
  evidence_metric: string;
  scoring_formula: string;
}

interface Validator {
  validator_name: string;
  competencies_tested: string[];
  priority: string;
  reason: string;
}

interface ValidatorTemplateCardProps {
  validator: Validator;
  courseName: string;
  competencyMappings: CompetencyMapping[];
}

interface GameTemplate {
  id: string;
  name: string;
  description: string | null;
  preview_image: string | null;
}

export const ValidatorTemplateCard = ({
  validator,
  courseName,
  competencyMappings,
}: ValidatorTemplateCardProps) => {
  const navigate = useNavigate();
  const [template, setTemplate] = useState<GameTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplate();
  }, [validator.validator_name]);

  const loadTemplate = async () => {
    try {
      const { data, error } = await supabase
        .from('game_templates')
        .select('id, name, description, preview_image')
        .eq('name', validator.validator_name)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;
      setTemplate(data);
    } catch (error) {
      console.error('Failed to load template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomize = () => {
    if (!template) {
      toast.error('Template not found');
      return;
    }
    
    // Navigate to template detail with course context
    navigate(`/platform/template/${template.id}`, {
      state: {
        fromCourse: true,
        courseName,
        competencyMappings,
      }
    });
  };

  if (loading) {
    return (
      <Card className="border-l-4 border-gray-500 animate-pulse">
        <CardContent className="pt-4">
          <div className="h-20 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!template) {
    return (
      <Card className="border-l-4 border-yellow-500">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between mb-2">
            <p className="font-medium">{validator.validator_name}</p>
            <span className="text-xs uppercase px-2 py-1 rounded bg-yellow-500/20 text-yellow-600">
              Template Not Available
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{validator.reason}</p>
          <p className="text-xs text-muted-foreground italic">
            This validator type is not yet available as a template.
          </p>
        </CardContent>
      </Card>
    );
  }

  const borderColor = validator.priority === 'high' ? 'hsl(var(--neon-green))' :
                      validator.priority === 'medium' ? 'hsl(var(--primary))' : 
                      'hsl(var(--muted))';

  return (
    <Card className="border-l-4 hover:shadow-lg transition-shadow" style={{ borderLeftColor: borderColor }}>
      <CardContent className="pt-4">
        <div className="flex gap-4">
          {/* Template Preview */}
          {template.preview_image && (
            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
              <img 
                src={template.preview_image} 
                alt={template.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-lg">{template.name}</p>
                <span className="text-xs uppercase px-2 py-1 rounded bg-muted inline-block mt-1">
                  {validator.priority} priority
                </span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">{validator.reason}</p>
            
            <div className="flex items-center gap-2 mt-3">
              <Button 
                onClick={handleCustomize}
                className="gap-2 bg-neon-green text-white hover:bg-neon-green/90"
                size="sm"
              >
                <Sparkles className="w-3 h-3" />
                Customize for "{courseName}"
              </Button>
              
              <Button
                onClick={() => navigate(`/platform/template/${template.id}`)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <ExternalLink className="w-3 h-3" />
                View Details
              </Button>
            </div>
          </div>
        </div>

        {/* Competencies Tested */}
        {competencyMappings.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-800">
            <p className="text-xs font-medium mb-2">Will Test These Skills:</p>
            <div className="flex flex-wrap gap-1">
              {competencyMappings.map((mapping, idx) => (
                <span 
                  key={idx}
                  className="text-xs px-2 py-1 rounded bg-primary/10 text-primary"
                >
                  {mapping.sub_competency}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};