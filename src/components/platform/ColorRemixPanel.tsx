import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface ColorRemixPanelProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  onRemix: (colors: { primary: string; secondary: string; accent: string; background: string }) => void;
}

const colorVariations = [
  {
    name: "Original",
    description: "Your custom colors",
    variant: 0
  },
  {
    name: "High Contrast",
    description: "Maximum visibility",
    variant: 1
  },
  {
    name: "Pastel Soft",
    description: "Gentle tones",
    variant: 2
  },
  {
    name: "Bold & Vibrant",
    description: "Eye-catching",
    variant: 3
  },
  {
    name: "Dark Mode",
    description: "Night-friendly",
    variant: 4
  },
  {
    name: "Light Mode",
    description: "Bright & clean",
    variant: 5
  }
];

export const ColorRemixPanel = ({
  primaryColor,
  secondaryColor,
  accentColor,
  backgroundColor,
  onRemix
}: ColorRemixPanelProps) => {
  const [selectedVariation, setSelectedVariation] = useState(0);

  const generateVariation = (variant: number) => {
    // Original colors
    if (variant === 0) {
      return {
        primary: primaryColor,
        secondary: secondaryColor,
        accent: accentColor,
        background: backgroundColor
      };
    }

    // High Contrast
    if (variant === 1) {
      return {
        primary: primaryColor,
        secondary: accentColor,
        accent: secondaryColor,
        background: '#000000'
      };
    }

    // Pastel Soft
    if (variant === 2) {
      return {
        primary: lightenColor(primaryColor, 40),
        secondary: lightenColor(secondaryColor, 40),
        accent: lightenColor(accentColor, 40),
        background: '#F5F5F5'
      };
    }

    // Bold & Vibrant
    if (variant === 3) {
      return {
        primary: saturateColor(primaryColor),
        secondary: saturateColor(secondaryColor),
        accent: saturateColor(accentColor),
        background: darkenColor(backgroundColor, 20)
      };
    }

    // Dark Mode
    if (variant === 4) {
      return {
        primary: primaryColor,
        secondary: secondaryColor,
        accent: accentColor,
        background: '#0A0A0A'
      };
    }

    // Light Mode
    if (variant === 5) {
      return {
        primary: darkenColor(primaryColor, 10),
        secondary: darkenColor(secondaryColor, 10),
        accent: darkenColor(accentColor, 10),
        background: '#FFFFFF'
      };
    }

    return { primary: primaryColor, secondary: secondaryColor, accent: accentColor, background: backgroundColor };
  };

  const lightenColor = (hex: string, percent: number) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return '#' + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
  };

  const darkenColor = (hex: string, percent: number) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return '#' + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
  };

  const saturateColor = (hex: string) => {
    // Simple saturation boost - increase color intensity
    const num = parseInt(hex.replace('#', ''), 16);
    let R = (num >> 16);
    let G = ((num >> 8) & 0x00FF);
    let B = (num & 0x0000FF);
    
    // Boost the dominant color channel
    const max = Math.max(R, G, B);
    if (R === max) R = Math.min(255, R + 30);
    else if (G === max) G = Math.min(255, G + 30);
    else if (B === max) B = Math.min(255, B + 30);
    
    return '#' + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
  };

  const handleApplyVariation = (variant: number) => {
    setSelectedVariation(variant);
    const colors = generateVariation(variant);
    onRemix(colors);
    toast.success(`Applied ${colorVariations[variant].name} variation`);
  };

  return (
    <Card className="bg-gray-800 border-gray-700 p-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 bg-purple-500/10 rounded-lg">
          <Palette className="w-6 h-6 text-purple-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-2">Brand Color Remix</h3>
          <p className="text-gray-400 text-sm">
            Try different color variations to see what works best for your game
          </p>
        </div>
      </div>

      {/* Current Color Preview */}
      <div className="mb-6">
        <p className="text-sm text-gray-400 mb-3">Current Colors:</p>
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center">
            <div
              className="w-full h-16 rounded-lg border-2 border-gray-600 mb-2"
              style={{ backgroundColor: generateVariation(selectedVariation).primary }}
            />
            <p className="text-xs text-gray-500">Primary</p>
          </div>
          <div className="text-center">
            <div
              className="w-full h-16 rounded-lg border-2 border-gray-600 mb-2"
              style={{ backgroundColor: generateVariation(selectedVariation).secondary }}
            />
            <p className="text-xs text-gray-500">Secondary</p>
          </div>
          <div className="text-center">
            <div
              className="w-full h-16 rounded-lg border-2 border-gray-600 mb-2"
              style={{ backgroundColor: generateVariation(selectedVariation).accent }}
            />
            <p className="text-xs text-gray-500">Accent</p>
          </div>
          <div className="text-center">
            <div
              className="w-full h-16 rounded-lg border-2 border-gray-600 mb-2"
              style={{ backgroundColor: generateVariation(selectedVariation).background }}
            />
            <p className="text-xs text-gray-500">Background</p>
          </div>
        </div>
      </div>

      {/* Variation Options */}
      <div className="space-y-2">
        <p className="text-sm text-gray-400 mb-3">Choose a variation:</p>
        {colorVariations.map((variation) => {
          const colors = generateVariation(variation.variant);
          const isSelected = selectedVariation === variation.variant;
          
          return (
            <button
              key={variation.variant}
              onClick={() => handleApplyVariation(variation.variant)}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                isSelected 
                  ? 'border-neon-green bg-neon-green/10' 
                  : 'border-gray-600 hover:border-gray-500 bg-gray-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className={`font-medium ${isSelected ? 'text-neon-green' : 'text-white'}`}>
                    {variation.name}
                  </p>
                  <p className="text-xs text-gray-500">{variation.description}</p>
                </div>
                <div className="flex gap-1 ml-4">
                  <div
                    className="w-8 h-8 rounded border border-gray-600"
                    style={{ backgroundColor: colors.primary }}
                  />
                  <div
                    className="w-8 h-8 rounded border border-gray-600"
                    style={{ backgroundColor: colors.secondary }}
                  />
                  <div
                    className="w-8 h-8 rounded border border-gray-600"
                    style={{ backgroundColor: colors.accent }}
                  />
                  <div
                    className="w-8 h-8 rounded border border-gray-600"
                    style={{ backgroundColor: colors.background }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          <RefreshCw className="w-3 h-3 inline mr-1" />
          These variations are previews only. To permanently change colors, edit them in the Brand Customization settings.
        </p>
      </div>
    </Card>
  );
};