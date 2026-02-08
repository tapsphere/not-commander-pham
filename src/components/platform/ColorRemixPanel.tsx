import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Shuffle, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface ColorRemixPanelProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  onRemix: (colors: { primary: string; secondary: string; accent: string; background: string }) => void;
  isDarkMode?: boolean;
}

// ===== COLOR ZONE SEPARATION UTILITIES =====

// Convert hex to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const cleanHex = hex.replace('#', '');
  const bigint = parseInt(cleanHex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
};

// Convert RGB to hex
const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

// Calculate relative luminance (0-1 scale)
const getLuminance = (hex: string): number => {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map(c =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

// Calculate contrast ratio between two colors
const getContrastRatio = (color1: string, color2: string): number => {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

// Determine if color is dark (< 0.5 luminance)
const isDark = (hex: string): boolean => getLuminance(hex) < 0.5;

// Generate a darker/lighter version of a color for container (glassmorphic effect)
const adjustColorForContainer = (baseColor: string, targetDarkMode: boolean): string => {
  const { r, g, b } = hexToRgb(baseColor);
  
  if (targetDarkMode) {
    // For dark mode: lighter frosted version
    const factor = 0.2;
    return rgbToHex(
      r + (255 - r) * factor,
      g + (255 - g) * factor,
      b + (255 - b) * factor
    );
  } else {
    // For light mode: slightly darker frosted version
    const factor = 0.1;
    return rgbToHex(
      r * (1 - factor),
      g * (1 - factor),
      b * (1 - factor)
    );
  }
};

// Auto-calculate text color for optimal contrast
const getContrastTextColor = (backgroundColor: string): string => {
  const luminance = getLuminance(backgroundColor);
  
  // Use high-contrast colors for readability
  if (luminance < 0.5) {
    // Dark background → white/silver text
    return '#FAFAFA';
  } else {
    // Light background → black/charcoal text
    return '#1A1A1A';
  }
};

// Find the most vibrant color for action buttons
const getVibrance = (hex: string): number => {
  const { r, g, b } = hexToRgb(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;
  const brightness = max / 255;
  // Weight saturation higher for vibrance
  return saturation * 0.7 + brightness * 0.3;
};

export const ColorRemixPanel = ({
  primaryColor,
  secondaryColor,
  accentColor,
  backgroundColor,
  onRemix,
  isDarkMode = false
}: ColorRemixPanelProps) => {
  // All 4 brand colors in an array
  const brandColors = useMemo(
    () => [primaryColor, secondaryColor, accentColor, backgroundColor],
    [primaryColor, secondaryColor, accentColor, backgroundColor]
  );
  
  // Store the distributed 4-zone colors
  const [zoneColors, setZoneColors] = useState({
    surface: backgroundColor,      // --brand-bg
    container: secondaryColor,     // --brand-container
    action: primaryColor,          // --brand-primary
    typography: '#FFFFFF'          // --brand-text (auto-calculated)
  });

  // Initialize zone colors on mount and when props change
  useEffect(() => {
    const textColor = getContrastTextColor(backgroundColor);
    setZoneColors({
      surface: backgroundColor,
      container: secondaryColor,
      action: primaryColor,
      typography: textColor
    });
  }, [primaryColor, secondaryColor, accentColor, backgroundColor]);

  const shuffleColors = () => {
    // ===== THE SHUFFLE RULE =====
    // Generate a proper 4-color palette, not just rearrange 1 color
    
    // Step 1: Sort colors by luminance
    const sortedByLuminance = [...brandColors].sort((a, b) => getLuminance(a) - getLuminance(b));
    
    // Step 2: Sort colors by vibrance (for action color selection)
    const sortedByVibrance = [...brandColors].sort((a, b) => getVibrance(b) - getVibrance(a));
    
    // Step 3: Pick Surface (background) - prioritize dark/neutral colors
    // Randomly pick from the 2 darkest or 2 lightest depending on theme mode
    const darkColors = sortedByLuminance.slice(0, 2);
    const lightColors = sortedByLuminance.slice(2, 4);
    
    const surface = isDarkMode
      ? darkColors[Math.floor(Math.random() * darkColors.length)]
      : lightColors[Math.floor(Math.random() * lightColors.length)];
    
    // Step 4: Pick Action (buttons) - must have HIGH CONTRAST against surface
    // Choose the most vibrant color that has good contrast
    let action = sortedByVibrance[0];
    const minContrast = 4.5; // WCAG AA standard
    
    for (const color of sortedByVibrance) {
      const contrast = getContrastRatio(color, surface);
      if (contrast >= minContrast && color !== surface) {
        action = color;
        break;
      }
    }
    
    // If no color has good contrast, force a high-contrast action color
    if (getContrastRatio(action, surface) < minContrast || action === surface) {
      // Generate a contrasting action color
      action = isDark(surface) ? '#FFFFFF' : '#1A1A1A';
      // Or pick the color with maximum contrast from available
      const maxContrastColor = brandColors
        .filter(c => c !== surface)
        .sort((a, b) => getContrastRatio(b, surface) - getContrastRatio(a, surface))[0];
      if (maxContrastColor && getContrastRatio(maxContrastColor, surface) > getContrastRatio(action, surface)) {
        action = maxContrastColor;
      }
    }
    
    // Step 5: Pick Container - glassmorphic frosted version of surface
    const remainingColors = brandColors.filter(c => c !== surface && c !== action);
    let container = remainingColors.length > 0 
      ? remainingColors[Math.floor(Math.random() * remainingColors.length)]
      : adjustColorForContainer(surface, isDarkMode);
    
    // Ensure container is distinct from surface
    if (container === surface) {
      container = adjustColorForContainer(surface, isDarkMode);
    }
    
    // Step 6: Auto-calculate Typography for optimal contrast
    const typography = getContrastTextColor(surface);
    
    // Store the new zone colors
    const newZones = { surface, container, action, typography };
    setZoneColors(newZones);
    
    // Map back to the expected interface
    const newColors = {
      primary: action,
      secondary: container,
      accent: remainingColors.find(c => c !== container) || accentColor,
      background: surface
    };
    
    onRemix(newColors);
    
    // Apply CSS variables immediately
    document.documentElement.style.setProperty('--brand-bg', surface);
    document.documentElement.style.setProperty('--brand-container', container);
    document.documentElement.style.setProperty('--brand-primary', action);
    document.documentElement.style.setProperty('--brand-text', typography);
    // Also update legacy variables
    document.documentElement.style.setProperty('--brand-surface', surface);
    document.documentElement.style.setProperty('--brand-action', action);
    document.documentElement.style.setProperty('--brand-typography', typography);
    
    toast.success('4-zone palette generated! Buttons pop, text is readable.');
  };

  // Theme-aware styling
  const bgColor = isDarkMode ? 'bg-white/5' : 'bg-slate-50';
  const borderColor = isDarkMode ? 'border-white/10' : 'border-slate-200';
  const textColor = isDarkMode ? 'text-white' : 'text-slate-900';
  const mutedColor = isDarkMode ? 'text-white/60' : 'text-slate-500';

  // Zone label component
  const ZoneLabel = ({ label, color, locked }: { label: string; color: string; locked?: boolean }) => (
    <div className="flex flex-col items-center gap-1">
      <div 
        className="w-10 h-10 rounded-lg border-2 transition-all duration-300 shadow-sm" 
        style={{ 
          backgroundColor: color,
          borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
        }}
      />
      <div className="flex items-center gap-0.5">
        <span className={`text-[9px] font-medium ${mutedColor}`}>{label}</span>
        {locked && <Lock className="h-2 w-2 text-amber-500" />}
      </div>
    </div>
  );

  return (
    <div className={`rounded-lg ${bgColor} border ${borderColor} p-4`}>
      <div className="mb-4">
        <h3 className={`text-sm font-medium ${textColor} mb-1`}>4-Zone Color Palette</h3>
        <p className={`text-xs ${mutedColor}`}>
          Each zone is distinct for proper UI contrast
        </p>
      </div>

      {/* 4-Zone Palette Display with Labels */}
      <div className="mb-4">
        <div className="flex justify-around items-center py-2">
          <ZoneLabel label="Surface" color={zoneColors.surface} />
          <ZoneLabel label="Container" color={zoneColors.container} />
          <ZoneLabel label="Action" color={zoneColors.action} />
          <ZoneLabel label="Text" color={zoneColors.typography} locked />
        </div>
        
        {/* Visual preview bar */}
        <div className={`flex rounded-lg overflow-hidden border ${borderColor} mt-3`} style={{ height: '48px' }}>
          <div 
            className="flex-[2] transition-all duration-300 flex items-center justify-center" 
            style={{ backgroundColor: zoneColors.surface }}
          >
            <span 
              className="text-[10px] font-medium drop-shadow-sm"
              style={{ color: zoneColors.typography }}
            >
              BG
            </span>
          </div>
          <div 
            className="flex-1 transition-all duration-300 flex items-center justify-center opacity-80" 
            style={{ backgroundColor: zoneColors.container }}
          >
            <span className="text-[9px] font-medium text-white/80 drop-shadow-sm">Card</span>
          </div>
          <div 
            className="flex-1 transition-all duration-300 flex items-center justify-center" 
            style={{ backgroundColor: zoneColors.action }}
          >
            <span 
              className="text-[10px] font-bold drop-shadow-sm"
              style={{ color: isDark(zoneColors.action) ? '#FFFFFF' : '#000000' }}
            >
              BTN
            </span>
          </div>
          <div 
            className="flex-1 transition-all duration-300 flex items-center justify-center" 
            style={{ backgroundColor: zoneColors.surface }}
          >
            <span 
              className="text-[11px] font-semibold"
              style={{ color: zoneColors.typography }}
            >
              Aa
            </span>
          </div>
        </div>
      </div>

      {/* Shuffle Button */}
      <Button
        onClick={shuffleColors}
        variant="outline"
        className="w-full"
        size="sm"
      >
        <Shuffle className="w-4 h-4 mr-2" />
        Shuffle Zones
      </Button>

      <p className={`mt-3 text-[10px] ${mutedColor} text-center leading-relaxed`}>
        Action always contrasts Surface • Text auto-adjusts
      </p>
    </div>
  );
};
