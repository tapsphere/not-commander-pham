import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Shuffle } from 'lucide-react';
import { toast } from 'sonner';

interface ColorRemixPanelProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  onRemix: (colors: { primary: string; secondary: string; accent: string; background: string }) => void;
  isDarkMode?: boolean;
}

export const ColorRemixPanel = ({
  primaryColor,
  secondaryColor,
  accentColor,
  backgroundColor,
  onRemix,
  isDarkMode = false
}: ColorRemixPanelProps) => {
  // All 4 brand colors in an array - memoize so it updates when props change
  const brandColors = useMemo(
    () => [primaryColor, secondaryColor, accentColor, backgroundColor],
    [primaryColor, secondaryColor, accentColor, backgroundColor]
  );
  
  const [currentArrangement, setCurrentArrangement] = useState([0, 1, 2, 3]);
  
  // Store current colors in state to force re-render
  const [displayColors, setDisplayColors] = useState({
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor,
    background: backgroundColor
  });

  // Sync display colors when props change
  useEffect(() => {
    setDisplayColors({
      primary: primaryColor,
      secondary: secondaryColor,
      accent: accentColor,
      background: backgroundColor
    });
  }, [primaryColor, secondaryColor, accentColor, backgroundColor]);

  const shuffleColors = () => {
    // Fisher-Yates shuffle algorithm
    const shuffled = [...currentArrangement];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    setCurrentArrangement(shuffled);
    
    const newColors = {
      primary: brandColors[shuffled[0]],      // Buttons/Main actions
      secondary: brandColors[shuffled[1]],    // Supporting elements
      accent: brandColors[shuffled[2]],       // Highlights/Warnings
      background: brandColors[shuffled[3]]    // Background
    };
    
    // Update display colors to force re-render
    setDisplayColors(newColors);
    
    onRemix(newColors);
    
    toast.success('Colors shuffled!');
  };

  // Theme-aware styling
  const bgColor = isDarkMode ? 'bg-white/5' : 'bg-slate-50';
  const borderColor = isDarkMode ? 'border-white/10' : 'border-slate-200';
  const textColor = isDarkMode ? 'text-white' : 'text-slate-900';
  const mutedColor = isDarkMode ? 'text-white/60' : 'text-slate-500';

  return (
    <div className={`rounded-lg ${bgColor} border ${borderColor} p-4`}>
      <div className="mb-4">
        <h3 className={`text-sm font-medium ${textColor} mb-1`}>Color Palette</h3>
        <p className={`text-xs ${mutedColor}`}>
          Your brand colors in different positions
        </p>
      </div>

      {/* Color Palette Display */}
      <div className="mb-4">
        <div className={`flex rounded-lg overflow-hidden border ${borderColor}`} style={{ height: '60px' }}>
          <div 
            className="flex-1 transition-all duration-300 relative group" 
            style={{ backgroundColor: displayColors.primary }}
            title="Primary"
          >
            <span className="absolute bottom-1 left-1 text-[9px] font-medium text-white/80 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-sm">
              Primary
            </span>
          </div>
          <div 
            className="flex-1 transition-all duration-300 relative group" 
            style={{ backgroundColor: displayColors.secondary }}
            title="Secondary"
          >
            <span className="absolute bottom-1 left-1 text-[9px] font-medium text-white/80 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-sm">
              Second.
            </span>
          </div>
          <div 
            className="flex-1 transition-all duration-300 relative group" 
            style={{ backgroundColor: displayColors.accent }}
            title="Accent"
          >
            <span className="absolute bottom-1 left-1 text-[9px] font-medium text-white/80 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-sm">
              Accent
            </span>
          </div>
          <div 
            className="flex-1 transition-all duration-300 relative group" 
            style={{ backgroundColor: displayColors.background }}
            title="Background"
          >
            <span className="absolute bottom-1 left-1 text-[9px] font-medium text-white/80 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-sm">
              BG
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
        Shuffle
      </Button>

      <p className={`mt-3 text-[10px] ${mutedColor} text-center`}>
        Click to randomly rearrange your brand colors
      </p>
    </div>
  );
};