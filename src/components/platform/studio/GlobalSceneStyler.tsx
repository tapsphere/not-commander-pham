import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, Sparkles, Palette, ChevronDown, ChevronUp } from 'lucide-react';
import { useStudioTheme } from './StudioThemeContext';
import { DesignSettings, SceneData } from '../template-steps/types';

interface GlobalSceneStylerProps {
  globalStylePrompt: string;
  onGlobalStyleChange: (prompt: string) => void;
  onApplyToAllScenes: () => void;
  scenes: SceneData[];
  designSettings: DesignSettings;
  brandName?: string;
}

export function GlobalSceneStyler({
  globalStylePrompt,
  onGlobalStyleChange,
  onApplyToAllScenes,
  scenes,
  designSettings,
  brandName,
}: GlobalSceneStylerProps) {
  const { isDarkMode } = useStudioTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const bgColor = isDarkMode ? 'bg-slate-900/80' : 'bg-white/90';
  const borderColor = isDarkMode ? 'border-white/10' : 'border-slate-200';
  const textColor = isDarkMode ? 'text-white' : 'text-slate-900';
  const mutedColor = isDarkMode ? 'text-white/50' : 'text-slate-500';

  const scenesWithOverride = scenes.filter(s => s.backgroundPrompt?.trim()).length;

  return (
    <div className={`${bgColor} border-b ${borderColor} backdrop-blur-xl`}>
      {/* Header */}
      <div className={`px-4 py-2 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <span className={`text-xs font-semibold uppercase tracking-wider ${mutedColor}`}>
            Global Scene Style
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
        <div className="px-4 pb-3 space-y-2">
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

          {/* Global style textarea */}
          <Textarea
            value={globalStylePrompt}
            onChange={(e) => onGlobalStyleChange(e.target.value)}
            placeholder="Describe the visual DNA for all scenes..."
            className={`text-sm min-h-[60px] max-h-[100px] resize-none ${
              isDarkMode 
                ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30' 
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
            }`}
          />

          {/* Apply button */}
          <div className="flex items-center justify-between">
            <span className={`text-[10px] ${mutedColor}`}>
              Changes propagate to all scenes without local overrides
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={onApplyToAllScenes}
              className="h-7 text-xs border-primary/40 text-primary hover:bg-primary/10"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Apply to All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
