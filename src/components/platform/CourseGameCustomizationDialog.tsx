import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, Palette, Loader2 } from 'lucide-react';

interface CompetencyMapping {
  domain: string;
  competency: string;
  sub_competency: string;
  alignment_summary: string;
  validator_type: string;
  evidence_metric: string;
  scoring_formula: string;
}

interface CourseGameCustomizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseName: string;
  competencyMappings: CompetencyMapping[];
  onSuccess: () => void;
}

export const CourseGameCustomizationDialog = ({
  open,
  onOpenChange,
  courseName,
  competencyMappings,
  onSuccess,
}: CourseGameCustomizationDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#00FF00');
  const [secondaryColor, setSecondaryColor] = useState('#9945FF');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be less than 2MB');
      return;
    }

    setLogoFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const ensureCompetenciesExist = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const competencyIds: { [key: string]: string } = {};
    
    for (const mapping of competencyMappings) {
      // Check if master competency exists
      let { data: existingComp } = await supabase
        .from('master_competencies')
        .select('id')
        .eq('name', mapping.competency)
        .single();

      let compId: string;
      
      if (!existingComp) {
        // Create master competency
        const { data: newComp, error: compError } = await supabase
          .from('master_competencies')
          .insert({
            name: mapping.competency,
            cbe_category: mapping.domain,
            departments: []
          })
          .select('id')
          .single();
        
        if (compError) throw compError;
        compId = newComp.id;
      } else {
        compId = existingComp.id;
      }

      competencyIds[mapping.competency] = compId;

      // Check if sub-competency exists
      const { data: existingSub } = await supabase
        .from('sub_competencies')
        .select('id')
        .eq('competency_id', compId)
        .eq('statement', mapping.sub_competency)
        .single();

      if (!existingSub) {
        // Create sub-competency
        const { error: subError } = await supabase
          .from('sub_competencies')
          .insert({
            competency_id: compId,
            statement: mapping.sub_competency,
            validator_type: mapping.validator_type,
            backend_data_captured: { metric: mapping.evidence_metric },
            scoring_formula_level_1: mapping.scoring_formula,
          });
        
        if (subError) throw subError;
      }
    }

    return competencyIds;
  };

  const handleGenerateGame = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      toast.info('Setting up competencies...');
      await ensureCompetenciesExist();

      let logoUrl = null;

      // Upload logo if provided
      if (logoFile) {
        toast.info('Uploading brand logo...');
        const fileName = `${user.id}/${Date.now()}-${logoFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('brand-logos')
          .upload(fileName, logoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('brand-logos')
          .getPublicUrl(fileName);

        logoUrl = publicUrl;
      }

      // Create prompt from competency mappings
      const competencyPrompt = competencyMappings.map((m, i) => 
        `${i + 1}. ${m.sub_competency} (${m.validator_type})\n   ${m.alignment_summary}\n   Evidence: ${m.evidence_metric}`
      ).join('\n\n');

      const gamePrompt = `Create an engaging gamified validator for: ${courseName}

COMPETENCIES TO TEST:
${competencyPrompt}

REQUIREMENTS:
- Make it interactive and engaging
- Capture the specified evidence metrics
- Provide immediate feedback
- Use game mechanics that fit the validator types
- Track all backend data for scoring`;

      // Save customization
      toast.info('Creating game customization...');
      const { data: customizationData, error } = await supabase
        .from('brand_customizations')
        .insert({
          brand_id: user.id,
          template_id: '00000000-0000-0000-0000-000000000000', // Placeholder for course-generated
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          logo_url: logoUrl,
          customization_prompt: gamePrompt,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Generating your game...');

      // Call edge function to generate game
      const { error: gameError } = await supabase.functions.invoke('generate-game', {
        body: {
          templatePrompt: gamePrompt,
          primaryColor,
          secondaryColor,
          logoUrl,
          customizationId: customizationData.id,
        }
      });

      if (gameError) {
        console.error('Game generation error:', gameError);
        toast.error('Game generation failed. You can try again later from your dashboard.');
      } else {
        toast.success('Game generated successfully! 🎮');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Game generation error:', error);
      toast.error(error.message || 'Failed to generate game');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gray-900 border-neon-green text-white">
        <DialogHeader>
          <DialogTitle className="text-neon-green text-glow-green">
            Customize Game for "{courseName}"
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Brand Colors */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Palette className="h-5 w-5 text-neon-green" />
              Brand Colors
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-20 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 bg-gray-800 border-gray-700"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-20 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1 bg-gray-800 border-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Color Preview */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <p className="text-sm text-gray-400 mb-3">Preview:</p>
              <div className="flex gap-4">
                <div
                  className="w-20 h-20 rounded-lg border-2"
                  style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                />
                <div
                  className="w-20 h-20 rounded-lg border-2"
                  style={{ backgroundColor: secondaryColor, borderColor: secondaryColor }}
                />
              </div>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Upload className="h-5 w-5 text-neon-green" />
              Brand Logo
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Logo
                </Button>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <span className="text-sm text-gray-400">
                  {logoFile ? logoFile.name : 'PNG, JPG, SVG (max 2MB)'}
                </span>
              </div>

              {logoPreview && (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-2">Logo Preview:</p>
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="max-w-[200px] max-h-[100px] object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Competencies Summary */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold mb-2 text-sm">Game Will Test:</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              {competencyMappings.map((m, i) => (
                <li key={i}>• {m.sub_competency} ({m.validator_type})</li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end border-t border-gray-700 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateGame}
              disabled={loading}
              className="bg-neon-green text-white hover:bg-neon-green/90"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Game'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}