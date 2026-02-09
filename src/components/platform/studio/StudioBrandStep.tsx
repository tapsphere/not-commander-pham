import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DesignSettings } from '../template-steps/types';
import { useStudioTheme } from './StudioThemeContext';
import { Palette, Upload, Sparkles, Box } from 'lucide-react';
import { useState } from 'react';

interface StudioBrandStepProps {
  designSettings: DesignSettings;
  setDesignSettings: (settings: DesignSettings) => void;
  mascotFile: File | null;
  setMascotFile: (file: File | null) => void;
  logoFile: File | null;
  setLogoFile: (file: File | null) => void;
  logoUrl?: string | null; // v31.0: URL-based logo for demo injection
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
  isDarkMode: boolean;
}

function ColorInput({ label, value, onChange, description, isDarkMode }: ColorInputProps) {
  const inputStyles = isDarkMode 
    ? 'bg-white/5 border-white/10 text-white' 
    : 'bg-slate-50 border-slate-200 text-slate-900';

  return (
    <div className="space-y-1.5">
      <Label className={`text-sm font-medium ${isDarkMode ? 'text-white/80' : 'text-slate-700'}`}>
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border cursor-pointer"
          style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`flex-1 font-mono text-xs h-10 ${inputStyles}`}
          placeholder="#000000"
        />
      </div>
      {description && (
        <p className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>
          {description}
        </p>
      )}
    </div>
  );
}

export function StudioBrandStep({
  designSettings,
  setDesignSettings,
  mascotFile,
  setMascotFile,
  logoFile,
  setLogoFile,
  logoUrl,
}: StudioBrandStepProps) {
  const { isDarkMode } = useStudioTheme();

  const updateSetting = <K extends keyof DesignSettings>(key: K, value: DesignSettings[K]) => {
    setDesignSettings({ ...designSettings, [key]: value });
  };

  const cardStyles = isDarkMode 
    ? 'bg-white/5 border-white/10 backdrop-blur-sm' 
    : 'bg-white border-slate-200 shadow-sm';

  const labelStyles = isDarkMode ? 'text-white/80' : 'text-slate-700';
  const mutedStyles = isDarkMode ? 'text-white/40' : 'text-slate-500';
  const inputStyles = isDarkMode 
    ? 'bg-white/5 border-white/10 text-white' 
    : 'bg-slate-50 border-slate-200 text-slate-900';

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <Palette className={`h-5 w-5 ${isDarkMode ? 'text-white/70' : 'text-slate-600'}`} />
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Brand Identity
          </h2>
        </div>
        <p className={mutedStyles}>
          Define your visual brand. These settings apply to the Live Mirror instantly.
        </p>
      </div>

      {/* Logo & Mascot Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Logo Upload */}
        <div className={`rounded-xl border p-4 ${cardStyles}`}>
          <div className="flex items-center gap-2 mb-3">
            <Upload className={`h-4 w-4 ${isDarkMode ? 'text-white/60' : 'text-slate-500'}`} />
            <Label className={labelStyles}>Brand Logo</Label>
          </div>
          <input
            type="file"
            id="logo-upload"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setLogoFile(file);
                // Create URL for avatar
                const url = URL.createObjectURL(file);
                updateSetting('avatar', url);
              }
            }}
            className="hidden"
          />
          <label htmlFor="logo-upload" className="cursor-pointer block">
            <div className={`
              h-24 rounded-lg border-2 border-dashed flex items-center justify-center transition-all
              ${isDarkMode 
                ? 'border-white/20 hover:border-white/40 bg-white/5' 
                : 'border-slate-300 hover:border-slate-400 bg-slate-50'
              }
            `}>
              {logoFile ? (
                <img 
                  src={URL.createObjectURL(logoFile)} 
                  alt="Logo preview" 
                  className="h-16 w-16 object-contain"
                />
              ) : logoUrl ? (
                // v31.0: Display URL-based logo from demo injection
                <img 
                  src={logoUrl} 
                  alt="Demo logo" 
                  className="h-16 w-16 object-contain"
                />
              ) : (
                <span className={mutedStyles}>Click to upload</span>
              )}
            </div>
          </label>
        </div>

        {/* 3D Mascot Upload */}
        <div className={`rounded-xl border p-4 ${cardStyles}`}>
          <div className="flex items-center gap-2 mb-3">
            <Box className={`h-4 w-4 ${isDarkMode ? 'text-white/60' : 'text-slate-500'}`} />
            <Label className={labelStyles}>3D Mascot (Lottie)</Label>
          </div>
          <input
            type="file"
            id="mascot-upload"
            accept=".json,.lottie"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setMascotFile(file);
            }}
            className="hidden"
          />
          <label htmlFor="mascot-upload" className="cursor-pointer block">
            <div className={`
              h-24 rounded-lg border-2 border-dashed flex items-center justify-center transition-all
              ${isDarkMode 
                ? 'border-white/20 hover:border-white/40 bg-white/5' 
                : 'border-slate-300 hover:border-slate-400 bg-slate-50'
              }
            `}>
              {mascotFile ? (
                <div className="text-center">
                  <Sparkles className={`h-6 w-6 mx-auto mb-1 ${isDarkMode ? 'text-white/60' : 'text-slate-500'}`} />
                  <span className={`text-xs ${mutedStyles}`}>{mascotFile.name}</span>
                </div>
              ) : (
                <span className={mutedStyles}>Optional .json</span>
              )}
            </div>
          </label>
          <p className={`text-xs mt-2 ${mutedStyles}`}>
            Shows on Scene 0 intro
          </p>
        </div>
      </div>

      {/* Colors Grid */}
      <div className={`rounded-xl border p-5 ${cardStyles}`}>
        <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Brand Colors
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <ColorInput
            label="Primary"
            value={designSettings.primary}
            onChange={(v) => updateSetting('primary', v)}
            description="Buttons, progress"
            isDarkMode={isDarkMode}
          />
          <ColorInput
            label="Secondary"
            value={designSettings.secondary}
            onChange={(v) => updateSetting('secondary', v)}
            description="Accents, cards"
            isDarkMode={isDarkMode}
          />
          <ColorInput
            label="Background"
            value={designSettings.background}
            onChange={(v) => updateSetting('background', v)}
            description="Main background"
            isDarkMode={isDarkMode}
          />
          <ColorInput
            label="Text"
            value={designSettings.text}
            onChange={(v) => updateSetting('text', v)}
            description="Primary text"
            isDarkMode={isDarkMode}
          />
          <ColorInput
            label="Highlight"
            value={designSettings.highlight}
            onChange={(v) => updateSetting('highlight', v)}
            description="Success states"
            isDarkMode={isDarkMode}
          />
          <ColorInput
            label="Accent"
            value={designSettings.accent}
            onChange={(v) => updateSetting('accent', v)}
            description="Interactive"
            isDarkMode={isDarkMode}
          />
        </div>
      </div>

      {/* Typography & Effects */}
      <div className={`rounded-xl border p-5 ${cardStyles}`}>
        <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Typography & Effects
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className={labelStyles}>Font Family</Label>
            <Select 
              value={designSettings.font} 
              onValueChange={(v) => updateSetting('font', v)}
            >
              <SelectTrigger className={`mt-1.5 h-10 ${inputStyles}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={isDarkMode ? 'bg-slate-900 border-white/10' : ''}>
                {FONTS.map(f => (
                  <SelectItem key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className={labelStyles}>Particle Effect</Label>
            <Select 
              value={designSettings.particleEffect} 
              onValueChange={(v) => updateSetting('particleEffect', v)}
            >
              <SelectTrigger className={`mt-1.5 h-10 ${inputStyles}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={isDarkMode ? 'bg-slate-900 border-white/10' : ''}>
                {PARTICLE_EFFECTS.map(p => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
