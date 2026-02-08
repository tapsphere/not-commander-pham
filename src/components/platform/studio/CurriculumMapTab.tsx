import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BookOpen, ChevronRight, GripVertical, Trash2, 
  Plus, Target, Layers 
} from 'lucide-react';
import { useStudioTheme } from './StudioThemeContext';
import { CompetencyTrack } from '../template-steps/types';

interface CurriculumMapTabProps {
  tracks: CompetencyTrack[];
  activeTrackId: string | null;
  totalScenes: number;
  onTrackClick: (trackId: string, firstSceneIndex: number) => void;
  onRemoveTrack: (trackId: string) => void;
  onAddTrack: () => void;
}

export function CurriculumMapTab({
  tracks,
  activeTrackId,
  totalScenes,
  onTrackClick,
  onRemoveTrack,
  onAddTrack,
}: CurriculumMapTabProps) {
  const { isDarkMode } = useStudioTheme();
  const [hoveredTrack, setHoveredTrack] = useState<string | null>(null);

  const bgColor = isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50';
  const borderColor = isDarkMode ? 'border-white/10' : 'border-slate-200';
  const textColor = isDarkMode ? 'text-white' : 'text-slate-900';
  const mutedColor = isDarkMode ? 'text-white/60' : 'text-slate-600';

  // Calculate scene ranges for each track
  const getTrackSceneRange = (trackIndex: number): { start: number; end: number } => {
    // Intro (Scene 0) + gameplay scenes per track
    const scenesPerTrack = 6;
    const start = 1 + (trackIndex * scenesPerTrack); // Skip intro
    const end = start + scenesPerTrack - 1;
    return { start, end };
  };

  return (
    <div className={`rounded-xl border ${borderColor} ${bgColor} p-4`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className={`h-4 w-4 ${isDarkMode ? 'text-primary' : 'text-primary'}`} />
          <span className={`text-sm font-semibold ${textColor}`}>Curriculum Map</span>
        </div>
        <Badge variant="outline" className="text-xs">
          {tracks.length} Track{tracks.length !== 1 ? 's' : ''} • {totalScenes} Scenes
        </Badge>
      </div>

      <ScrollArea className="h-[280px]">
        <div className="space-y-2">
          {/* Intro Scene (always present) */}
          <div 
            className={`
              flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer
              ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'}
              hover:border-primary/50
            `}
            onClick={() => onTrackClick('intro', 0)}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Target className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <span className={`text-sm font-medium ${textColor}`}>Intro</span>
              <p className={`text-xs ${mutedColor}`}>Brand identity & welcome</p>
            </div>
            <Badge className="bg-blue-500/20 text-blue-500 border-0">Scene 0</Badge>
          </div>

          {/* Competency Tracks */}
          {tracks.map((track, index) => {
            const range = getTrackSceneRange(index);
            const isActive = activeTrackId === track.id;
            const isHovered = hoveredTrack === track.id;

            return (
              <div
                key={track.id}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer group
                  ${isActive 
                    ? 'border-primary bg-primary/10' 
                    : isDarkMode 
                      ? 'border-white/10 bg-white/5 hover:border-primary/50' 
                      : 'border-slate-200 bg-white hover:border-primary/50'
                  }
                `}
                onClick={() => onTrackClick(track.id, range.start)}
                onMouseEnter={() => setHoveredTrack(track.id)}
                onMouseLeave={() => setHoveredTrack(null)}
              >
                <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${mutedColor}`}>
                  <GripVertical className="h-4 w-4" />
                </div>
                
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white"
                  style={{ 
                    background: `linear-gradient(135deg, hsl(${(index * 60) % 360}, 70%, 50%), hsl(${(index * 60 + 30) % 360}, 70%, 40%))` 
                  }}
                >
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-medium truncate block ${textColor}`}>
                    Track {index + 1}: {track.competencyName}
                  </span>
                  <p className={`text-xs ${mutedColor}`}>
                    {track.subCompetencyIds.length}/6 sub-competencies
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${isActive ? 'border-primary text-primary' : ''}`}
                  >
                    S{range.start}-{range.end}
                  </Badge>
                  
                  {(isHovered || isActive) && tracks.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveTrack(track.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                  
                  <ChevronRight className={`h-4 w-4 ${mutedColor}`} />
                </div>
              </div>
            );
          })}

          {/* Results Scene (always at end) */}
          <div 
            className={`
              flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer
              ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'}
              hover:border-primary/50
            `}
            onClick={() => onTrackClick('results', totalScenes - 1)}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <span className={`text-sm font-medium ${textColor}`}>Results</span>
              <p className={`text-xs ${mutedColor}`}>Mastery receipt & proof</p>
            </div>
            <Badge className="bg-amber-500/20 text-amber-600 border-0">
              Scene {totalScenes - 1}
            </Badge>
          </div>
        </div>
      </ScrollArea>

      {/* Add Track Button */}
      <Button
        variant="outline"
        className={`w-full mt-4 border-dashed ${isDarkMode ? 'border-white/20' : 'border-slate-300'}`}
        onClick={onAddTrack}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Another Competency Track
      </Button>
    </div>
  );
}
