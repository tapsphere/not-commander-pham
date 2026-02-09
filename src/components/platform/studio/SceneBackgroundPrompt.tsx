import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Pencil, X, ImageIcon } from 'lucide-react';
import { useStudioTheme } from './StudioThemeContext';

interface SceneBackgroundPromptProps {
  sceneIndex: number;
  backgroundPrompt: string | undefined;
  globalStylePrompt: string;
  onBackgroundPromptChange: (prompt: string) => void;
  onClearOverride: () => void;
}

export function SceneBackgroundPrompt({
  sceneIndex,
  backgroundPrompt,
  globalStylePrompt,
  onBackgroundPromptChange,
  onClearOverride,
}: SceneBackgroundPromptProps) {
  const { isDarkMode } = useStudioTheme();
  const [isEditing, setIsEditing] = useState(false);

  const hasOverride = !!backgroundPrompt?.trim();
  const displayText = hasOverride ? backgroundPrompt : globalStylePrompt;

  const mutedColor = isDarkMode ? 'text-white/40' : 'text-slate-400';

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all hover:opacity-80 ${
          isDarkMode ? 'bg-white/5 hover:bg-white/8' : 'bg-slate-50 hover:bg-slate-100'
        }`}
      >
        <ImageIcon className={`h-3.5 w-3.5 flex-shrink-0 ${hasOverride ? 'text-amber-500' : mutedColor}`} />
        <span className={`text-[11px] truncate ${hasOverride ? (isDarkMode ? 'text-white/70' : 'text-slate-700') : mutedColor} italic`}>
          {displayText || 'No background style set...'}
        </span>
        <Pencil className={`h-3 w-3 flex-shrink-0 ml-auto ${mutedColor}`} />
      </button>
    );
  }

  return (
    <div className={`rounded-lg p-2 space-y-2 ${
      isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-200'
    }`}>
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-medium ${isDarkMode ? 'text-white/60' : 'text-slate-500'}`}>
          Scene {sceneIndex} Background Override
        </span>
        <button onClick={() => setIsEditing(false)} className={mutedColor}>
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* Ghost text showing inherited global style */}
      {!hasOverride && globalStylePrompt && (
        <p className={`text-[10px] italic ${mutedColor} px-1`}>
          Inherits: "{globalStylePrompt.slice(0, 80)}{globalStylePrompt.length > 80 ? '...' : ''}"
        </p>
      )}

      <Textarea
        value={backgroundPrompt || ''}
        onChange={(e) => onBackgroundPromptChange(e.target.value)}
        placeholder={globalStylePrompt 
          ? `Add to global style: "${globalStylePrompt.slice(0, 40)}..." e.g. "Make it rain"` 
          : 'Describe this scene\'s unique background...'}
        className={`text-xs min-h-[50px] max-h-[80px] resize-none ${
          isDarkMode
            ? 'bg-white/5 border-white/10 text-white placeholder:text-white/25'
            : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
        }`}
      />
      
      {/* Show merged prompt preview when local override is set */}
      {hasOverride && globalStylePrompt && (
        <p className={`text-[9px] italic px-1 ${isDarkMode ? 'text-emerald-400/60' : 'text-emerald-600/60'}`}>
          Final prompt: "{globalStylePrompt.slice(0, 40)}... + {backgroundPrompt?.slice(0, 30)}..."
        </p>
      )}

      {hasOverride && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => { onClearOverride(); setIsEditing(false); }}
          className="h-6 text-[10px] text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 w-full"
        >
          Reset to Global Style
        </Button>
      )}
    </div>
  );
}
