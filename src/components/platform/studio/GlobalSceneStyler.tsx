import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, Sparkles, Palette, ChevronDown, ChevronUp, Loader2, Lock } from 'lucide-react';
import { useStudioTheme } from './StudioThemeContext';
import { DesignSettings, SceneData } from '../template-steps/types';

interface GlobalSceneStylerProps {
  globalStylePrompt: string;
  onGlobalStyleChange: (prompt: string) => void;
  onApplyToAllScenes: () => void;
  scenes: SceneData[];
  designSettings: DesignSettings;
  brandName?: string;
  isApplying?: boolean;
}

export function GlobalSceneStyler({
  globalStylePrompt,
  onGlobalStyleChange,
  onApplyToAllScenes,
  scenes,
  designSettings,
  brandName,
  isApplying = false,
}: GlobalSceneStylerProps) {
  const { isDarkMode } = useStudioTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const bgColor = isDarkMode ? 'bg-slate-900/80' : 'bg-white/90';
  const borderColor = isDarkMode ? 'border-white/10' : 'border-slate-200';
  const textColor = isDarkMode ? 'text-white' : 'text-slate-900';
  const mutedColor = isDarkMode ? 'text-white/50' : 'text-slate-500';

  const scenesWithOverride = scenes.filter(s => s.backgroundPrompt?.trim()).length;

  return (
    <div className={`${bgColor} border ${borderColor} rounded-xl backdrop-blur-xl`}
      style={{ borderColor: designSettings.primary + '40' }}
    >
      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between border-b ${borderColor}`}>
        <div className="flex items-center gap-2">
          <span className="text-base">🧬</span>
          <span className={`text-sm font-bold ${textColor}`}>
            Global Visual DNA
          </span>
          <Badge variant="outline" className="text-[9px] border-primary/30 text-primary">
            All Scenes
          </Badge>
          {scenesWithOverride > 0 && (
            <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30 text-[9px]">
              {scenesWithOverride} override{scenesWithOverride > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1 rounded hover:bg-accent transition-colors ${mutedColor}`}
        >
          {isCollapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="px-4 pb-4 pt-3 space-y-3">
          {/* Sub-text */}
          <p className={`text-xs ${mutedColor}`}>
            Global commands style the entire track — <span className="text-amber-500 font-medium">DNA Layout is locked.</span>
          </p>
          {/* Brand color reference chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <Palette className={`h-3 w-3 ${mutedColor}`} />
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: designSettings.primary }} title="Primary" />
              <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: designSettings.secondary }} title="Secondary" />
              <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: designSettings.accent }} title="Accent" />
              <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: designSettings.highlight }} title="Highlight" />
            </div>
            {brandName && (
              <span className={`text-[10px] ${mutedColor}`}>
                {brandName} palette active
              </span>
            )}
          </div>

          {/* Global style textarea - EXPANDED */}
          <Textarea
            value={globalStylePrompt}
            onChange={(e) => onGlobalStyleChange(e.target.value)}
            placeholder="Describe the visual DNA for all scenes... e.g. 'Cinematic 35mm luxury boutique, Amber Haze lighting'"
            className={`text-sm resize-none ${
              isDarkMode 
                ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30' 
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
            }`}
            style={{ minHeight: '250px' }}
          />

          {/* Apply button */}
          <Button
            onClick={onApplyToAllScenes}
            disabled={isApplying || !globalStylePrompt.trim()}
            className="w-full h-10 text-sm font-semibold"
            style={{ 
              backgroundColor: designSettings.primary,
              color: '#FFFFFF',
            }}
          >
            {isApplying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating {scenes.length} backgrounds...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Apply to All Scenes
              </>
            )}
          </Button>

          {/* Footer note - mechanics lock */}
          <div className={`flex items-start gap-1.5 px-1`}>
            <Lock className={`h-3 w-3 mt-0.5 flex-shrink-0 ${mutedColor}`} />
            <p className={`text-[10px] leading-relaxed ${mutedColor}`}>
              This prompt updates background aesthetics only. Game mechanics are locked to C-BEN standards.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
