import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Shuffle } from 'lucide-react';
import { toast } from 'sonner';

interface ColorRemixPanelProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  onRemix: (colors: { primary: string; secondary: string; accent: string; background: string }) => void;
}

// Define color arrangements - using the SAME 4 colors in different positions
const colorArrangements = [
  {
    name: "Original Layout",
    description: "Your default setup",
    // [Primary, Secondary, Accent, Background]
    mapping: [0, 1, 2, 3] 
  },
  {
    name: "Bold Buttons",
    description: "Accent on buttons",
    mapping: [2, 0, 1, 3] // Accent -> Primary (buttons), Primary -> Secondary, Secondary -> Accent
  },
  {
    name: "Dark Background",
    description: "Primary as background",
    mapping: [1, 2, 0, 0] // Secondary -> Primary, Accent -> Secondary, Primary -> Accent, Primary -> Background
  },
  {
    name: "Bright Pop",
    description: "Secondary on buttons",
    mapping: [1, 0, 2, 3] // Secondary -> Primary (buttons), Primary -> Secondary
  },
  {
    name: "Inverted",
    description: "Swap main colors",
    mapping: [2, 3, 0, 1] // Accent -> Primary, Background -> Secondary, Primary -> Accent, Secondary -> Background
  },
  {
    name: "Accent Focus",
    description: "Accent everywhere",
    mapping: [2, 2, 1, 3] // Accent as both Primary and Secondary
  }
];

export const ColorRemixPanel = ({
  primaryColor,
  secondaryColor,
  accentColor,
  backgroundColor,
  onRemix
}: ColorRemixPanelProps) => {
  const [selectedArrangement, setSelectedArrangement] = useState(0);

  // All 4 brand colors in an array
  const brandColors = [primaryColor, secondaryColor, accentColor, backgroundColor];

  const getArrangement = (arrangementIndex: number) => {
    const mapping = colorArrangements[arrangementIndex].mapping;
    return {
      primary: brandColors[mapping[0]],      // Buttons/Main actions
      secondary: brandColors[mapping[1]],    // Supporting elements
      accent: brandColors[mapping[2]],       // Highlights/Warnings
      background: brandColors[mapping[3]]    // Background
    };
  };

  const handleApplyArrangement = (arrangementIndex: number) => {
    setSelectedArrangement(arrangementIndex);
    const colors = getArrangement(arrangementIndex);
    onRemix(colors);
    toast.success(`Applied ${colorArrangements[arrangementIndex].name}`);
  };

  return (
    <Card className="bg-gray-800 border-gray-700 p-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 bg-purple-500/10 rounded-lg">
          <Shuffle className="w-6 h-6 text-purple-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-2">Color Remix</h3>
          <p className="text-gray-400 text-sm">
            See your brand colors in different arrangements - same colors, different layouts
          </p>
        </div>
      </div>

      {/* Your Brand Colors */}
      <div className="mb-6 p-4 bg-gray-900 rounded-lg">
        <p className="text-sm text-gray-400 mb-3">Your Brand Colors:</p>
        <div className="grid grid-cols-4 gap-2">
          {brandColors.map((color, idx) => (
            <div key={idx} className="text-center">
              <div
                className="w-full h-12 rounded-lg border-2 border-gray-600"
                style={{ backgroundColor: color }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Current Layout Preview */}
      <div className="mb-6">
        <p className="text-sm text-gray-400 mb-3">Current Layout:</p>
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center">
            <div
              className="w-full h-16 rounded-lg border-2 border-gray-600 mb-2"
              style={{ backgroundColor: getArrangement(selectedArrangement).primary }}
            />
            <p className="text-xs text-gray-500">Buttons</p>
          </div>
          <div className="text-center">
            <div
              className="w-full h-16 rounded-lg border-2 border-gray-600 mb-2"
              style={{ backgroundColor: getArrangement(selectedArrangement).secondary }}
            />
            <p className="text-xs text-gray-500">Text</p>
          </div>
          <div className="text-center">
            <div
              className="w-full h-16 rounded-lg border-2 border-gray-600 mb-2"
              style={{ backgroundColor: getArrangement(selectedArrangement).accent }}
            />
            <p className="text-xs text-gray-500">Accents</p>
          </div>
          <div className="text-center">
            <div
              className="w-full h-16 rounded-lg border-2 border-gray-600 mb-2"
              style={{ backgroundColor: getArrangement(selectedArrangement).background }}
            />
            <p className="text-xs text-gray-500">Background</p>
          </div>
        </div>
      </div>

      {/* Layout Options */}
      <div className="space-y-2">
        <p className="text-sm text-gray-400 mb-3">Try different layouts:</p>
        {colorArrangements.map((arrangement, idx) => {
          const colors = getArrangement(idx);
          const isSelected = selectedArrangement === idx;
          
          return (
            <button
              key={idx}
              onClick={() => handleApplyArrangement(idx)}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                isSelected 
                  ? 'border-neon-green bg-neon-green/10' 
                  : 'border-gray-600 hover:border-gray-500 bg-gray-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className={`font-medium ${isSelected ? 'text-neon-green' : 'text-white'}`}>
                    {arrangement.name}
                  </p>
                  <p className="text-xs text-gray-500">{arrangement.description}</p>
                </div>
                <div className="flex gap-1 ml-4">
                  <div className="text-center">
                    <div
                      className="w-8 h-8 rounded border border-gray-600"
                      style={{ backgroundColor: colors.primary }}
                      title="Buttons"
                    />
                  </div>
                  <div className="text-center">
                    <div
                      className="w-8 h-8 rounded border border-gray-600"
                      style={{ backgroundColor: colors.secondary }}
                      title="Text"
                    />
                  </div>
                  <div className="text-center">
                    <div
                      className="w-8 h-8 rounded border border-gray-600"
                      style={{ backgroundColor: colors.accent }}
                      title="Accents"
                    />
                  </div>
                  <div className="text-center">
                    <div
                      className="w-8 h-8 rounded border border-gray-600"
                      style={{ backgroundColor: colors.background }}
                      title="Background"
                    />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          <Shuffle className="w-3 h-3 inline mr-1" />
          Click any layout to instantly see your colors rearranged. These are preview-only changes.
        </p>
      </div>
    </Card>
  );
};