import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trophy, Sparkles, ChevronRight } from 'lucide-react';
import { useStudioTheme } from './StudioThemeContext';

interface AddTrackNudgeProps {
  currentTrackNumber: number;
  currentTrackName: string;
  onAddTrack: () => void;
}

export function AddTrackNudge({
  currentTrackNumber,
  currentTrackName,
  onAddTrack,
}: AddTrackNudgeProps) {
  const { isDarkMode } = useStudioTheme();

  return (
    <div 
      className={`
        relative overflow-hidden rounded-xl border-2 border-dashed p-5
        ${isDarkMode 
          ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 to-teal-500/10' 
          : 'border-emerald-500/50 bg-gradient-to-br from-emerald-50 to-teal-50'
        }
      `}
    >
      {/* Decorative sparkles */}
      <div className="absolute top-2 right-2 opacity-50">
        <Sparkles className="h-5 w-5 text-emerald-500" />
      </div>

      {/* Completion badge */}
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-emerald-500/20">
          <Trophy className="h-4 w-4 text-emerald-500" />
        </div>
        <Badge 
          className="bg-emerald-500/20 text-emerald-600 border-0 text-xs"
        >
          Track {currentTrackNumber} Complete
        </Badge>
      </div>

      {/* Message */}
      <h4 className={`font-semibold text-sm mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
        Mastery Track Complete! 🎉
      </h4>
      <p className={`text-xs mb-4 ${isDarkMode ? 'text-white/70' : 'text-slate-600'}`}>
        You've configured all 6 scenes for <strong>{currentTrackName}</strong>.
        <br />
        Add another competency to build a comprehensive learning journey.
      </p>

      {/* CTA Button */}
      <Button
        onClick={onAddTrack}
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Another Competency
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>

      {/* Subtle hint */}
      <p className={`text-[10px] text-center mt-3 ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>
        Multi-track journeys increase completion rates by 40%
      </p>
    </div>
  );
}
