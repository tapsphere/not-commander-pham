/**
 * TelegramNativeOverlay - Simulates Telegram Mini App system UI
 * 
 * Used in Studio Preview to help creators design with TMA constraints in mind.
 * Shows the Telegram header bar, safe areas, and Main Button mockup.
 */

import { ChevronLeft, MoreVertical, X } from 'lucide-react';
import { useStudioTheme } from './StudioThemeContext';

interface TelegramNativeOverlayProps {
  isEnabled: boolean;
  headerColor?: string;
  mainButtonText?: string;
  mainButtonColor?: string;
  showBackButton?: boolean;
  showMainButton?: boolean;
  sceneIndex: number;
  onBackClick?: () => void;
  onMainButtonClick?: () => void;
}

export function TelegramNativeOverlay({
  isEnabled,
  headerColor = '#1C1C1D',
  mainButtonText = 'SUBMIT PERFORMANCE',
  mainButtonColor = '#007AFF',
  showBackButton = false,
  showMainButton = false,
  sceneIndex,
  onBackClick,
  onMainButtonClick,
}: TelegramNativeOverlayProps) {
  const { isDarkMode } = useStudioTheme();
  
  if (!isEnabled) return null;
  
  // Auto-determine button visibility based on scene
  // Scene 1: no back, no main
  // Scenes 2-6: back button visible
  // Scene 7: back + main button visible
  const shouldShowBack = showBackButton || (sceneIndex >= 2 && sceneIndex <= 7);
  const shouldShowMain = showMainButton || sceneIndex === 7;
  
  return (
    <>
      {/* Telegram Top Bar (Header) */}
      <div 
        className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-3"
        style={{ 
          backgroundColor: headerColor,
          height: '44px',
          paddingTop: '0px', // Safe area handled by parent
        }}
      >
        {/* Left: Back Button or Close */}
        <div className="flex items-center gap-2">
          {shouldShowBack ? (
            <button 
              onClick={onBackClick}
              className="flex items-center gap-1 text-white/90 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
          ) : (
            <button 
              onClick={onBackClick}
              className="flex items-center text-white/90 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        
        {/* Center: App Name */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <span className="text-sm font-semibold text-black">
            PlayOps
          </span>
        </div>
        
        {/* Right: Menu */}
        <button className="text-white/70 hover:text-white transition-colors">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>
      
      {/* Safe Area Indicator (Top) */}
      <div 
        className="absolute top-11 left-0 right-0 h-px z-50"
        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
      />
      
      {/* Telegram Main Button (Bottom) */}
      {shouldShowMain && (
        <div 
          className="absolute bottom-0 left-0 right-0 z-50"
          style={{ 
            backgroundColor: headerColor,
            paddingBottom: '20px', // Safe area for home indicator
          }}
        >
          <button
            onClick={onMainButtonClick}
            className="w-full py-3.5 font-semibold text-sm text-white transition-all active:opacity-80"
            style={{ backgroundColor: mainButtonColor }}
          >
            {mainButtonText}
          </button>
        </div>
      )}
      
      {/* Safe Area Indicator (Bottom) */}
      {!shouldShowMain && (
        <div 
          className="absolute bottom-0 left-0 right-0 z-40"
          style={{ 
            height: '20px',
            background: `linear-gradient(to top, ${headerColor}33, transparent)`,
          }}
        />
      )}
      
      {/* TMA Mode Badge */}
      <div className="absolute top-12 right-2 z-50">
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-500/30">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[9px] font-medium text-blue-400">TMA</span>
        </div>
      </div>
    </>
  );
}

/**
 * TelegramPreviewToggle - Toggle button for enabling TMA preview mode
 */
interface TelegramPreviewToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
}

export function TelegramPreviewToggle({
  isEnabled,
  onToggle,
}: TelegramPreviewToggleProps) {
  const { isDarkMode } = useStudioTheme();
  
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        isEnabled
          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
          : isDarkMode
            ? 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
            : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
      }`}
    >
      <TelegramIcon className="h-3.5 w-3.5" />
      <span>{isEnabled ? 'TMA Active' : 'TMA Preview'}</span>
    </button>
  );
}

// Telegram logo icon
function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}
