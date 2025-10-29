import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Upload, Copy, Palette } from 'lucide-react';

interface BrandCustomizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: {
    id: string;
    name: string;
    description: string | null;
    base_prompt: string | null;
  };
  courseInfo?: {
    courseName: string;
    competencyMappings: any[];
  } | null;
  onSuccess: () => void;
}

export const BrandCustomizationDialog = ({
  open,
  onOpenChange,
  template,
  courseInfo,
  onSuccess,
}: BrandCustomizationDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [loadingDefaults, setLoadingDefaults] = useState(true);
  const [primaryColor, setPrimaryColor] = useState('#00FF00');
  const [secondaryColor, setSecondaryColor] = useState('#9945FF');
  const [accentColor, setAccentColor] = useState('#FF5722');
  const [backgroundColor, setBackgroundColor] = useState('#1A1A1A');
  const [highlightColor, setHighlightColor] = useState('#F0C7A0');
  const [textColor, setTextColor] = useState('#2D5556');
  const [fontFamily, setFontFamily] = useState('Inter, sans-serif');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [particleEffect, setParticleEffect] = useState('sparkles');
  const [mascotAnimationType, setMascotAnimationType] = useState<'static' | 'gif' | 'lottie' | 'sprite'>('static');
  const [editablePrompt, setEditablePrompt] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  // Load creator's profile defaults
  useEffect(() => {
    const loadCreatorDefaults = async () => {
      if (!open || !template.id) return;
      
      setLoadingDefaults(true);
      try {
        // Get template creator's profile to load defaults
        const { data: templateData } = await supabase
          .from('game_templates')
          .select('creator_id')
          .eq('id', template.id)
          .single();

        if (templateData?.creator_id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('design_palette, default_particle_effect, game_avatar_url, mascot_animation_type')
            .eq('user_id', templateData.creator_id)
            .single();

          if (profileData) {
            // Load design palette defaults
            if (profileData.design_palette) {
              const palette = profileData.design_palette as any;
              setPrimaryColor(palette.primary || '#C8DBDB');
              setSecondaryColor(palette.secondary || '#6C8FA4');
              setAccentColor(palette.accent || '#2D5556');
              setBackgroundColor(palette.background || '#F5EDD3');
              setHighlightColor(palette.highlight || '#F0C7A0');
              setTextColor(palette.text || '#2D5556');
              setFontFamily(palette.font || 'Inter, sans-serif');
            }
            
            // Load particle effect default
            if (profileData.default_particle_effect) {
              setParticleEffect(profileData.default_particle_effect);
            }
            
            // Load game avatar default
            if (profileData.game_avatar_url) {
              setAvatarPreview(profileData.game_avatar_url);
              const animType = profileData.mascot_animation_type as 'static' | 'gif' | 'lottie' | 'sprite';
              setMascotAnimationType(animType || 'static');
            }
          }
        }
      } catch (error) {
        console.error('Failed to load creator defaults:', error);
      } finally {
        setLoadingDefaults(false);
      }
    };

    loadCreatorDefaults();
  }, [open, template.id]);

  useEffect(() => {
    if (template.base_prompt && !editablePrompt) {
      let prompt = template.base_prompt;
      
      // If we have course info, append it to the prompt
      if (courseInfo) {
        const courseContext = `

📚 COURSE CONTEXT:

This validator is being customized for the course: "${courseInfo.courseName}"

Mapped Competencies:
${courseInfo.competencyMappings.map((mapping: any, idx: number) => 
  `${idx + 1}. ${mapping.sub_competency || mapping.competency}
   Domain: ${mapping.domain}
   Alignment: ${mapping.alignment_summary}
   Evidence Metric: ${mapping.evidence_metric}`
).join('\n\n')}

Please ensure the validator content and scenarios are relevant to this course material.
`;
        prompt = prompt + courseContext;
      }
      
      setEditablePrompt(prompt);
    }
  }, [template, courseInfo]);

  useEffect(() => {
    if (editablePrompt) {
      generateBrandedPrompt();
    }
  }, [editablePrompt, primaryColor, secondaryColor, accentColor, backgroundColor, highlightColor, textColor, fontFamily, particleEffect, avatarPreview, mascotAnimationType]);

  const generateBrandedPrompt = () => {
    const brandSection = `

🎨 BRAND CUSTOMIZATION:

Brand Colors & Typography:
• Primary: ${primaryColor} - Main brand color for primary actions and highlights
• Secondary: ${secondaryColor} - Supporting brand color for secondary elements
• Accent: ${accentColor} - Accent color for emphasis and call-to-actions
• Background: ${backgroundColor} - Background color for the main interface
• Highlight: ${highlightColor} - Highlight color for important elements and hover states
• Text: ${textColor} - Primary text color throughout the interface
• Font Family: ${fontFamily} - Apply this font to all text elements

Game Character & Effects:
• ${avatarPreview ? `MASCOT/AVATAR (${mascotAnimationType.toUpperCase()}): Include the uploaded mascot/character prominently in the game (center stage, animated reactions to player actions)` : 'No custom mascot provided - use generic game elements'}
• PARTICLE EFFECT: ${particleEffect} - Use this particle effect for ALL positive feedback (correct answers, successful actions, score increases)
  - On button clicks: burst of ${particleEffect}
  - On correct answers: celebration with ${particleEffect}
  - On score increases: ${particleEffect} animation around the score counter
  - On game completion: screen-wide ${particleEffect} effect

UI Styling Instructions:
• Use ${primaryColor} for primary buttons, key UI elements, and main highlights
• Use ${secondaryColor} for secondary buttons, borders, and supporting elements
• Use ${accentColor} for warnings, important notifications, and accents
• Use ${backgroundColor} as the base background color for the interface
• Use ${highlightColor} for hover states, active elements, and important highlights
• Use ${textColor} for all text content (ensure proper contrast with backgrounds)
• Apply ${fontFamily} to all typography elements
• ${logoPreview ? 'Display brand logo in the top corner' : 'Reserve space for brand logo placement'}
• ${avatarPreview ? 'Make the mascot/avatar the visual focal point with idle animations and reactions' : ''}
• Add particle effects liberally - on every tap, click, and success moment
• Maintain high contrast for accessibility
• Apply brand colors consistently throughout all UI components
• Ensure font is loaded and applied consistently across all scenes
`;

    const modifiedPrompt = editablePrompt + '\n\n' + brandSection;
    setGeneratedPrompt(modifiedPrompt);
  };

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

  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Cover photo must be less than 5MB');
      return;
    }

    setCoverPhotoFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setCoverPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast.error('Avatar must be less than 3MB');
      return;
    }

    setAvatarFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast.success('Branded prompt copied! Paste it into Lovable to build your custom validator.');
  };

  const handleSaveCustomization = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let logoUrl = null;
      let coverPhotoUrl = null;
      let avatarUrl = null;

      // Upload logo if provided
      if (logoFile) {
        const fileName = `${user.id}/${Date.now()}-${logoFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('brand-logos')
          .upload(fileName, logoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('brand-logos')
          .getPublicUrl(fileName);

        logoUrl = publicUrl;
      }

      // Upload cover photo if provided
      if (coverPhotoFile) {
        const fileName = `${user.id}/cover-${Date.now()}-${coverPhotoFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('brand-logos')
          .upload(fileName, coverPhotoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('brand-logos')
          .getPublicUrl(fileName);

        coverPhotoUrl = publicUrl;
      }

      // Upload avatar if provided
      if (avatarFile) {
        const fileName = `${user.id}/avatar-${Date.now()}-${avatarFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('brand-logos')
          .upload(fileName, avatarFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('brand-logos')
          .getPublicUrl(fileName);

        avatarUrl = publicUrl;
      }

      // Save customization
      const { data: customizationData, error } = await supabase
        .from('brand_customizations')
        .insert({
          brand_id: user.id,
          template_id: template.id,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          accent_color: accentColor,
          background_color: backgroundColor,
          highlight_color: highlightColor,
          text_color: textColor,
          font_family: fontFamily,
          logo_url: logoUrl,
          cover_photo_url: coverPhotoUrl,
          avatar_url: avatarUrl,
          particle_effect: particleEffect,
          mascot_animation_type: mascotAnimationType,
          customization_prompt: generatedPrompt,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Customization saved! Generating your game...');

      // Call edge function to generate game
      const { data: gameData, error: gameError } = await supabase.functions.invoke('generate-game', {
        body: {
          templatePrompt: editablePrompt,
          primaryColor,
          secondaryColor,
          accentColor,
          backgroundColor,
          highlightColor,
          textColor,
          fontFamily,
          logoUrl,
          avatarUrl,
          particleEffect,
          mascotAnimationType,
          customizationId: customizationData.id,
          previewMode: false, // Ensure it saves to database
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
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-neon-green text-white">
        <DialogHeader>
          <DialogTitle className="text-neon-green text-glow-green">
            Customize "{template.name}" with Your Brand
          </DialogTitle>
          {loadingDefaults && (
            <p className="text-xs text-gray-400 mt-2">Loading creator defaults...</p>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Editable AI Prompt Area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                ✨ AI Prompt
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditablePrompt(template.base_prompt || '')}
                className="text-xs"
              >
                Reset to Original
              </Button>
            </div>
            
            <Textarea
              value={editablePrompt}
              onChange={(e) => setEditablePrompt(e.target.value)}
              rows={8}
              className="bg-gray-800 border-gray-700 font-mono text-sm"
              placeholder="Edit the validator design prompt here..."
            />
            
            <p className="text-xs text-gray-400">
              Edit this prompt to customize the validator for your brand. Add specific requirements, adjust the theme, or modify the gameplay mechanics.
            </p>
          </div>

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

              <div>
                <Label htmlFor="accentColor">Accent Color</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="accentColor"
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-20 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="flex-1 bg-gray-800 border-gray-700"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="backgroundColor">Background Color</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-20 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1 bg-gray-800 border-gray-700"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="highlightColor">Highlight Color</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="highlightColor"
                    type="color"
                    value={highlightColor}
                    onChange={(e) => setHighlightColor(e.target.value)}
                    className="w-20 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={highlightColor}
                    onChange={(e) => setHighlightColor(e.target.value)}
                    className="flex-1 bg-gray-800 border-gray-700"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="textColor">Text Color</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="textColor"
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-20 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="flex-1 bg-gray-800 border-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Font Family */}
            <div>
              <Label htmlFor="fontFamily">Font Family</Label>
              <Input
                id="fontFamily"
                type="text"
                placeholder="e.g., Inter, sans-serif"
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white mt-2"
              />
              <p className="text-xs text-gray-400 mt-1">
                Enter a Google Font name or system font stack
              </p>
            </div>
            </div>

            {/* Color Preview */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mt-4">
              <p className="text-sm text-gray-400 mb-3">Color Palette Preview:</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div
                    className="w-20 h-20 rounded-lg border-2 mx-auto"
                    style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                  />
                  <p className="text-xs text-gray-400 mt-2">Primary</p>
                </div>
                <div className="text-center">
                  <div
                    className="w-20 h-20 rounded-lg border-2 mx-auto"
                    style={{ backgroundColor: secondaryColor, borderColor: secondaryColor }}
                  />
                  <p className="text-xs text-gray-400 mt-2">Secondary</p>
                </div>
                <div className="text-center">
                  <div
                    className="w-20 h-20 rounded-lg border-2 mx-auto"
                    style={{ backgroundColor: accentColor, borderColor: accentColor }}
                  />
                  <p className="text-xs text-gray-400 mt-2">Accent</p>
                </div>
                <div className="text-center">
                  <div
                    className="w-20 h-20 rounded-lg border-2 mx-auto"
                    style={{ backgroundColor: backgroundColor, borderColor: backgroundColor }}
                  />
                  <p className="text-xs text-gray-400 mt-2">Background</p>
                </div>
                <div className="text-center">
                  <div
                    className="w-20 h-20 rounded-lg border-2 mx-auto"
                    style={{ backgroundColor: highlightColor, borderColor: highlightColor }}
                  />
                  <p className="text-xs text-gray-400 mt-2">Highlight</p>
                </div>
                <div className="text-center">
                  <div
                    className="w-20 h-20 rounded-lg border-2 mx-auto flex items-center justify-center"
                    style={{ backgroundColor: backgroundColor, borderColor: textColor }}
                  >
                    <span style={{ color: textColor, fontFamily }}>Aa</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Text</p>
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

          {/* Cover Photo Upload */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Upload className="h-5 w-5 text-neon-green" />
              Cover Photo
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('cover-photo-upload')?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Cover Photo
                </Button>
                <input
                  id="cover-photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverPhotoChange}
                  className="hidden"
                />
                <span className="text-sm text-gray-400">
                  {coverPhotoFile ? coverPhotoFile.name : '1200x630px recommended (max 5MB)'}
                </span>
              </div>

              {coverPhotoPreview ? (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-2">Cover Photo Preview:</p>
                  <img
                    src={coverPhotoPreview}
                    alt="Cover photo preview"
                    className="w-full max-h-[200px] object-cover rounded"
                    style={{ aspectRatio: '16/9' }}
                  />
                </div>
              ) : (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-2">Default Cover:</p>
                  <div 
                    className="w-full bg-black flex items-center justify-center rounded"
                    style={{ aspectRatio: '16/9', height: '150px' }}
                  >
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo"
                        className="max-w-[120px] max-h-[80px] object-contain"
                      />
                    ) : (
                      <p className="text-white text-lg font-bold">Brand Name</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Without a cover photo, a black background with your logo (or brand name) will be displayed
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Custom Mascot - Set in Brand Profile */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400">
              <strong className="text-white">Custom Mascot:</strong> Configure your default game mascot in Brand Profile Settings
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Supported formats: PNG (static), GIF (animated), Lottie JSON (advanced animations)
            </p>
          </div>

          {/* Particle Effect Selector */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                ✨ Particle Effects
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Choose the visual effect that appears on taps, correct answers, and celebrations
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'sparkles', label: '✨ Sparkles', desc: 'Classic twinkling stars' },
                { value: 'coins', label: '🪙 Coins', desc: 'Flying golden coins' },
                { value: 'stars', label: '⭐ Stars', desc: 'Bursting star shapes' },
                { value: 'hearts', label: '❤️ Hearts', desc: 'Floating hearts' },
                { value: 'confetti', label: '🎉 Confetti', desc: 'Colorful celebration' },
                { value: 'lightning', label: '⚡ Lightning', desc: 'Electric bolts' },
              ].map((effect) => (
                <button
                  key={effect.value}
                  type="button"
                  onClick={() => setParticleEffect(effect.value)}
                  className={`p-6 rounded-lg border-2 transition-all text-center ${
                    particleEffect === effect.value
                      ? 'border-neon-green bg-gray-800 text-white'
                      : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <div className="text-5xl mb-2">{effect.label}</div>
                  <div className="text-sm">{effect.desc}</div>
                </button>
              ))}
            </div>
          </div>


          {/* Final Branded Prompt Preview */}
          <div className="space-y-4 border-t border-gray-700 pt-6">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Final Branded Prompt</Label>
              <Button
                type="button"
                onClick={handleCopyPrompt}
                className="gap-2 bg-neon-green text-white hover:bg-neon-green/90"
              >
                <Copy className="h-4 w-4" />
                Copy to Build in Lovable
              </Button>
            </div>
            <div className="bg-black border border-neon-green/30 rounded-lg p-4 max-h-64 overflow-y-auto">
              <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                {generatedPrompt}
              </pre>
            </div>
            <p className="text-xs text-gray-400">
              This is your complete branded validator prompt. Copy it and paste into Lovable to generate the validator with your brand identity.
            </p>
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
              onClick={handleSaveCustomization}
              disabled={loading}
              className="bg-neon-green text-white hover:bg-neon-green/90"
            >
              {loading ? 'Generating Game...' : 'Generate & Save Game'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}