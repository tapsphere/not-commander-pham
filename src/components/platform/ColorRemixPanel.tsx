import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shuffle } from 'lucide-react';
import { toast } from 'sonner';

interface ColorRemixPanelProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  onRemix: (colors: { primary: string; secondary: string; accent: string; background: string }) => void;
}

export const ColorRemixPanel = ({
  primaryColor,
  secondaryColor,
  accentColor,
  backgroundColor,
  onRemix
}: ColorRemixPanelProps) => {
  // All 4 brand colors in an array
  const brandColors = [primaryColor, secondaryColor, accentColor, backgroundColor];
  
  const [currentArrangement, setCurrentArrangement] = useState([0, 1, 2, 3]);

  const shuffleColors = () => {
    // Fisher-Yates shuffle algorithm
    const shuffled = [...currentArrangement];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    setCurrentArrangement(shuffled);
    
    onRemix({
      primary: brandColors[shuffled[0]],      // Buttons/Main actions
      secondary: brandColors[shuffled[1]],    // Supporting elements
      accent: brandColors[shuffled[2]],       // Highlights/Warnings
      background: brandColors[shuffled[3]]    // Background
    });
    
    toast.success('Colors shuffled!');
  };

  const getCurrentColors = () => ({
    primary: brandColors[currentArrangement[0]],
    secondary: brandColors[currentArrangement[1]],
    accent: brandColors[currentArrangement[2]],
    background: brandColors[currentArrangement[3]]
  });

  return (
    <Card className="bg-gray-800 border-gray-700 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Color Palette</h3>
        <p className="text-sm text-gray-400">
          Your brand colors in different positions
        </p>
      </div>

      {/* Color Palette Display */}
      <div className="mb-4">
        <div className="flex rounded-lg overflow-hidden border-2 border-gray-600" style={{ height: '80px' }}>
          <div 
            className="flex-1 transition-all" 
            style={{ backgroundColor: getCurrentColors().primary }}
            title="Buttons/Primary"
          />
          <div 
            className="flex-1 transition-all" 
            style={{ backgroundColor: getCurrentColors().secondary }}
            title="Text/Secondary"
          />
          <div 
            className="flex-1 transition-all" 
            style={{ backgroundColor: getCurrentColors().accent }}
            title="Accents"
          />
          <div 
            className="flex-1 transition-all" 
            style={{ backgroundColor: getCurrentColors().background }}
            title="Background"
          />
        </div>
      </div>

      {/* Shuffle Button */}
      <Button
        onClick={shuffleColors}
        className="w-full bg-gray-700 hover:bg-gray-600 text-white border-2 border-gray-600 h-12"
        size="lg"
      >
        <Shuffle className="w-5 h-5 mr-2" />
        Shuffle
      </Button>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Click to randomly rearrange your brand colors
      </div>
    </Card>
  );
};