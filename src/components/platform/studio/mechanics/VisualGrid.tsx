/**
 * VisualGrid - Icon & Image Visual Choice Grid
 * 
 * DNA Library 3.1: "2x2 or 3x2 grid of glassmorphic icon cards"
 * Supports hybrid mode: mix of uploaded images and vector icons
 * Icons respond to Brand Remix colors (stroke color = accent)
 * Images get Apple-style treatment: center-fit, drop-shadow, rounded corners
 * Telemetry: Decision Latency (time from scene start to first tap)
 */

import { useState, useRef, useEffect } from 'react';
import { DesignSettings, ChoiceData, SceneData } from '../../template-steps/types';
import * as LucideIcons from 'lucide-react';
import { LucideIcon, CheckCircle, ImageOff } from 'lucide-react';

// Extended interface for styling metadata
interface VisualGridProps {
  designSettings: DesignSettings;
  choices: ChoiceData[];
  gridLayout: SceneData['gridLayout'];
  isGhostState: boolean;
  onSelect?: (choice: ChoiceData, latencyMs: number) => void;
  disabled?: boolean;
}

// Map common item names to Lucide icons
const ICON_MAP: Record<string, string> = {
  // Fashion/Retail
  shoe: 'Footprints',
  shoes: 'Footprints',
  dress: 'Shirt',       // Closest available
  shirt: 'Shirt',
  hat: 'Crown',         // Using crown as hat proxy
  cap: 'Crown',
  watch: 'Watch',
  bag: 'ShoppingBag',
  gift: 'Gift',
  jewelry: 'Gem',
  diamond: 'Gem',
  
  // Business
  chart: 'BarChart3',
  graph: 'TrendingUp',
  pie: 'PieChart',
  target: 'Target',
  goal: 'Target',
  money: 'DollarSign',
  dollar: 'DollarSign',
  budget: 'Wallet',
  
  // Communication
  team: 'Users',
  people: 'Users',
  message: 'MessageCircle',
  chat: 'MessageCircle',
  email: 'Mail',
  phone: 'Phone',
  call: 'Phone',
  
  // Status/Feedback
  success: 'CheckCircle',
  check: 'CheckCircle',
  error: 'XCircle',
  warning: 'AlertTriangle',
  info: 'Info',
  
  // Elements
  fire: 'Flame',
  hot: 'Flame',
  sun: 'Sun',
  moon: 'Moon',
  star: 'Star',
  heart: 'Heart',
  like: 'ThumbsUp',
  love: 'Heart',
  sparkle: 'Sparkles',
  magic: 'Wand2',
  
  // Default
  option: 'Circle',
};

// Get Lucide icon component by name
function getIconComponent(iconName: string | undefined): LucideIcon {
  if (!iconName) return LucideIcons.Circle;
  
  // Check if it's a direct Lucide icon name
  const icons = LucideIcons as unknown as Record<string, unknown>;
  const directIcon = icons[iconName];
  if (directIcon && typeof directIcon === 'function' && '$$typeof' in directIcon) {
    return directIcon as LucideIcon;
  }
  
  // Check our custom mapping
  const mappedName = ICON_MAP[iconName.toLowerCase()];
  if (mappedName) {
    const mappedIcon = icons[mappedName];
    if (mappedIcon && typeof mappedIcon === 'function' && '$$typeof' in mappedIcon) {
      return mappedIcon as LucideIcon;
    }
  }
  
  return LucideIcons.Circle;
}

// Extended ChoiceData with styling
interface ChoiceWithStyle extends ChoiceData {
  imageStyle?: {
    scale?: number;
    animation?: 'pulse' | 'glow' | 'bounce';
  };
}

// Apple-style image component with center-fit, shadow, rounded corners, and styling
function AppleStyleImage({ 
  src, 
  alt, 
  isSelected,
  accentColor,
  scale = 1,
  animation,
}: { 
  src: string; 
  alt: string;
  isSelected: boolean;
  accentColor: string;
  scale?: number;
  animation?: 'pulse' | 'glow' | 'bounce';
}) {
  const [error, setError] = useState(false);
  
  // Animation classes
  const animationClass = isSelected && animation 
    ? animation === 'pulse' 
      ? 'animate-pulse' 
      : animation === 'bounce' 
        ? 'animate-bounce' 
        : ''
    : '';
  
  // Glow style for selected items with glow animation
  const glowStyle = isSelected && animation === 'glow' 
    ? { boxShadow: `0 0 20px ${accentColor}, 0 0 40px ${accentColor}40` }
    : {};
  
  if (error) {
    return (
      <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center">
        <ImageOff className="h-6 w-6 text-slate-400" />
      </div>
    );
  }
  
  return (
    <div 
      className={`relative rounded-xl overflow-hidden transition-all ${animationClass}`}
      style={{
        width: `${56 * scale}px`,
        height: `${56 * scale}px`,
        boxShadow: isSelected 
          ? `0 8px 20px ${accentColor}40, 0 4px 8px rgba(0,0,0,0.15)`
          : '0 4px 12px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)',
        ...glowStyle,
      }}
    >
      {/* Background removal simulation - transparent grid pattern */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-white"
        style={{
          backgroundImage: 'linear-gradient(45deg, #f8fafc 25%, transparent 25%), linear-gradient(-45deg, #f8fafc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f8fafc 75%), linear-gradient(-45deg, transparent 75%, #f8fafc 75%)',
          backgroundSize: '8px 8px',
          backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
          opacity: 0.3,
        }}
      />
      <img 
        src={src} 
        alt={alt}
        onError={() => setError(true)}
        className="absolute inset-0 w-full h-full object-contain p-1 drop-shadow-lg"
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
        }}
      />
    </div>
  );
}

export function VisualGrid({
  designSettings,
  choices,
  gridLayout = '2x2',
  isGhostState,
  onSelect,
  disabled = false,
}: VisualGridProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const sceneStartTime = useRef(performance.now());

  // Reset timer when choices change
  useEffect(() => {
    sceneStartTime.current = performance.now();
    setSelectedId(null);
  }, [choices]);

  const handleTap = (choice: ChoiceData) => {
    if (disabled) return;
    
    // Click-to-Undo: if already selected, deselect
    if (selectedId === choice.id) {
      setSelectedId(null);
      return;
    }
    
    const latencyMs = performance.now() - sceneStartTime.current;
    setSelectedId(choice.id);
    onSelect?.(choice, latencyMs);
  };

  // Default visual choices for ghost state - smart placeholders
  const displayChoices: ChoiceWithStyle[] = choices.length > 0 ? choices : [
    { id: '1', text: 'Option A', isCorrect: true, icon: 'Footprints', iconLabel: 'Shoes' },
    { id: '2', text: 'Option B', isCorrect: false, icon: 'Shirt', iconLabel: 'Dress' },
    { id: '3', text: 'Option C', isCorrect: false, icon: 'Crown', iconLabel: 'Hat' },
    { id: '4', text: 'Option D', isCorrect: false, icon: 'Watch', iconLabel: 'Watch' },
  ];

  // Determine grid columns based on layout
  const gridCols = gridLayout === '3x2' ? 'grid-cols-3' : 'grid-cols-2';
  
  // Check if any choice has styling
  const hasCustomStyling = displayChoices.some((c: ChoiceWithStyle) => c.imageStyle);
  
  return (
    <div className={`px-4 grid ${gridCols} gap-3`}>
      {displayChoices.map((choice: ChoiceWithStyle, idx: number) => {
        const isSelected = selectedId === choice.id;
        const hasImage = !!choice.imageUrl;
        const IconComponent = getIconComponent(choice.icon);
        const label = choice.imageLabel || choice.iconLabel || choice.text || `Option ${idx + 1}`;
        const imageScale = choice.imageStyle?.scale || 1;
        const imageAnimation = choice.imageStyle?.animation;
        
        // Animation class for icon selection
        const selectionAnimation = isSelected && imageAnimation
          ? imageAnimation === 'pulse' 
            ? 'animate-pulse' 
            : imageAnimation === 'bounce' 
              ? 'animate-bounce' 
              : ''
          : '';
        
        return (
          <button
            key={choice.id}
            onClick={() => handleTap(choice)}
            disabled={disabled}
            className={`relative aspect-square rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${
              isSelected ? 'scale-[1.03]' : 'hover:scale-[1.02] active:scale-[0.98]'
            } ${selectionAnimation}`}
            style={{
              // Glassmorphic card style
              backgroundColor: isSelected 
                ? `${designSettings.accent}25`
                : `${designSettings.background}`,
              border: `2px solid ${isSelected 
                ? designSettings.accent 
                : `${designSettings.text}15`
              }`,
              boxShadow: isSelected 
                ? imageAnimation === 'glow'
                  ? `0 0 20px ${designSettings.accent}, 0 8px 24px ${designSettings.accent}30`
                  : `0 8px 24px ${designSettings.accent}30`
                : '0 4px 12px rgba(0,0,0,0.08)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {/* Selection indicator */}
            {isSelected && (
              <div 
                className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: designSettings.accent }}
              >
                <CheckCircle className="h-3 w-3" style={{ color: designSettings.background }} />
              </div>
            )}
            
            {/* Content: Image (priority) or Icon */}
            {hasImage ? (
              <AppleStyleImage 
                src={choice.imageUrl!}
                alt={label}
                isSelected={isSelected}
                accentColor={designSettings.accent}
                scale={imageScale}
                animation={imageAnimation}
              />
            ) : (
              <div 
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${selectionAnimation}`}
                style={{
                  backgroundColor: isSelected 
                    ? `${designSettings.accent}20`
                    : `${designSettings.text}08`,
                  boxShadow: isSelected && imageAnimation === 'glow'
                    ? `0 0 15px ${designSettings.accent}`
                    : undefined,
                }}
              >
                <IconComponent 
                  className="h-7 w-7 transition-colors"
                  style={{ 
                    color: isSelected ? designSettings.accent : designSettings.primary,
                    strokeWidth: 1.5,
                  }}
                />
              </div>
            )}
            
            {/* Label */}
            <span 
              className={`text-xs font-medium text-center leading-tight ${isGhostState && !choice.imageLabel && !choice.iconLabel && !choice.text ? 'opacity-40 italic' : ''}`}
              style={{ color: designSettings.text }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
