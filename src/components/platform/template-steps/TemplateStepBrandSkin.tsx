import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DesignSettings } from './types';
import { Palette } from 'lucide-react';

interface TemplateStepBrandSkinProps {
  designSettings: DesignSettings;
  setDesignSettings: (settings: DesignSettings) => void;
}

const FONTS = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'Open Sans, sans-serif', label: 'Open Sans' },
  { value: 'Poppins, sans-serif', label: 'Poppins' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat' },
  { value: 'system-ui, sans-serif', label: 'System' },
];

const PARTICLE_EFFECTS = [
  { value: 'sparkles', label: '✨ Sparkles' },
  { value: 'confetti', label: '🎊 Confetti' },
  { value: 'stars', label: '⭐ Stars' },
  { value: 'bubbles', label: '🫧 Bubbles' },
  { value: 'none', label: '❌ None' },
];

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

function ColorInput({ label, value, onChange, description }: ColorInputProps) {
  return (
    <div className="space-y-1">
      <Label className="text-sm text-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-md border border-border cursor-pointer"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-muted border-border font-mono text-xs"
          placeholder="#000000"
        />
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

export function TemplateStepBrandSkin({
  designSettings,
  setDesignSettings,
}: TemplateStepBrandSkinProps) {
  const updateSetting = <K extends keyof DesignSettings>(key: K, value: DesignSettings[K]) => {
    setDesignSettings({ ...designSettings, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Palette className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Brand Skin</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Customize colors and fonts. Changes appear instantly in the Live Preview.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Primary Colors */}
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">Primary Colors</h3>
          
          <ColorInput
            label="Primary Color"
            value={designSettings.primary}
            onChange={(v) => updateSetting('primary', v)}
            description="Buttons, progress bars, highlights"
          />
          
          <ColorInput
            label="Secondary Color"
            value={designSettings.secondary}
            onChange={(v) => updateSetting('secondary', v)}
            description="Accents, secondary buttons"
          />
          
          <ColorInput
            label="Accent Color"
            value={designSettings.accent}
            onChange={(v) => updateSetting('accent', v)}
            description="Interactive elements"
          />
        </div>

        {/* Background Colors */}
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">Background & Text</h3>
          
          <ColorInput
            label="Background Color"
            value={designSettings.background}
            onChange={(v) => updateSetting('background', v)}
            description="Main background"
          />
          
          <ColorInput
            label="Text Color"
            value={designSettings.text}
            onChange={(v) => updateSetting('text', v)}
            description="Primary text"
          />
          
          <ColorInput
            label="Highlight Color"
            value={designSettings.highlight}
            onChange={(v) => updateSetting('highlight', v)}
            description="Success states, correct answers"
          />
        </div>
      </div>

      {/* Typography & Effects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
        <div>
          <Label className="text-foreground">Font Family</Label>
          <Select 
            value={designSettings.font} 
            onValueChange={(v) => updateSetting('font', v)}
          >
            <SelectTrigger className="mt-1 bg-muted border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONTS.map(f => (
                <SelectItem key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-foreground">Particle Effect</Label>
          <Select 
            value={designSettings.particleEffect} 
            onValueChange={(v) => updateSetting('particleEffect', v)}
          >
            <SelectTrigger className="mt-1 bg-muted border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PARTICLE_EFFECTS.map(p => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Avatar Upload */}
      <div className="pt-4 border-t border-border">
        <Label className="text-foreground">Avatar / Logo URL</Label>
        <Input
          value={designSettings.avatar}
          onChange={(e) => updateSetting('avatar', e.target.value)}
          placeholder="https://example.com/logo.png"
          className="mt-1 bg-muted border-border"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Optional: Add your brand avatar or logo URL
        </p>
      </div>
    </div>
  );
}
