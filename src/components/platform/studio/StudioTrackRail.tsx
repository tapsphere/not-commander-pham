import { useState, useRef } from 'react';
import { 
  Play, Trophy, Gamepad2, Lock, Plus, GripVertical, 
  Layers, Sparkles, ChevronDown, ChevronUp, Minus, Loader2
} from 'lucide-react';
import { DesignSettings, SceneData, SubCompetency, CompetencyTrack, createDefaultScene } from '../template-steps/types';
import { useStudioTheme } from './StudioThemeContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Scene types for the unified track
type SceneType = 'intro' | 'gameplay' | 'results' | 'flex-intro' | 'flex-outro' | 'chapter-divider';

interface TrackScene {
  type: SceneType;
  index: number;           // Visual index in the track
  sceneDataIndex?: number; // Index in the scenes array (for gameplay scenes)
  sceneData?: SceneData;
  subCompetency?: SubCompetency;
  isFlexScene?: boolean;
  trackId?: string;        // For chaptered tracks
  trackName?: string;      // Display name for chapter dividers
  trackNumber?: number;    // Track number (1, 2, 3...)
}

// Interaction type icons mapping from DNA Library
const MECHANIC_ICONS: Record<string, string> = {
  'Continuous Scrub': '↔️',
  'Tap Selection': '👆',
  'Quick Tap': '⚡',
  'Swipe Card': '👈',
  'Drag Connect': '🔗',
  'Pattern Grid': '🎯',
  'Trade-off Matrix': '⚖️',
  default: '🎮',
};

interface StudioTrackRailProps {
  currentSceneIndex: number;
  setCurrentSceneIndex: (index: number) => void;
  scenes: SceneData[];
  setScenes: (scenes: SceneData[]) => void;
  subCompetencies: SubCompetency[];
  designSettings: DesignSettings;
  // Multi-track props
  tracks?: CompetencyTrack[];
  onScrollToTrack?: (trackId: string) => void;
  // Flex scenes
  flexIntroScenes?: TrackScene[];
  flexOutroScenes?: TrackScene[];
  onAddFlexScene?: (position: 'intro' | 'outro') => void;
  onRemoveFlexScene?: (position: 'intro' | 'outro', index: number) => void;
  // Global apply loading state
  isApplyingGlobal?: boolean;
}

export function StudioTrackRail({
  currentSceneIndex,
  setCurrentSceneIndex,
  scenes,
  setScenes,
  subCompetencies,
  designSettings,
  tracks = [],
  onScrollToTrack,
  flexIntroScenes = [],
  flexOutroScenes = [],
  onAddFlexScene,
  onRemoveFlexScene,
  isApplyingGlobal = false,
}: StudioTrackRailProps) {
  const { isDarkMode } = useStudioTheme();
  const [isExpanded, setIsExpanded] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Build the complete track structure with chapter support
  const buildTrackScenes = (): TrackScene[] => {
    const trackScenes: TrackScene[] = [];
    let visualIndex = 0;
    let sceneDataIndex = 0;

    // Flex Intro Scenes (optional)
    flexIntroScenes.forEach((flex) => {
      trackScenes.push({
        ...flex,
        type: 'flex-intro',
        index: visualIndex++,
        isFlexScene: true,
      });
    });

    // Main Intro (Scene 0)
    trackScenes.push({
      type: 'intro',
      index: visualIndex++,
    });

    // If we have multiple tracks, add chapter dividers
    if (tracks.length > 0) {
      tracks.forEach((track, trackIdx) => {
        // Chapter Divider
        if (tracks.length > 1) {
          trackScenes.push({
            type: 'chapter-divider',
            index: visualIndex++,
            trackId: track.id,
            trackName: track.competencyName,
            trackNumber: trackIdx + 1,
          });
        }

        // Gameplay Scenes for this track (up to 6)
        const trackSceneData = scenes.filter(s => s.trackId === track.id);
        for (let i = 0; i < 6; i++) {
          const sceneData = trackSceneData[i];
          const subComp = sceneData
            ? subCompetencies.find(s => s.id === sceneData.subCompetencyId)
            : undefined;

          trackScenes.push({
            type: 'gameplay',
            index: visualIndex++,
            sceneDataIndex: sceneDataIndex++,
            sceneData,
            subCompetency: subComp,
            trackId: track.id,
            trackNumber: trackIdx + 1,
          });
        }
      });
    } else {
      // Single track mode (legacy) - 6 gameplay scenes
      for (let i = 0; i < 6; i++) {
        const sceneData = scenes[i];
        const subComp = sceneData
          ? subCompetencies.find(s => s.id === sceneData.subCompetencyId)
          : undefined;

        trackScenes.push({
          type: 'gameplay',
          index: visualIndex++,
          sceneDataIndex: i,
          sceneData,
          subCompetency: subComp,
        });
      }
    }

    // Main Results (final scene)
    trackScenes.push({
      type: 'results',
      index: visualIndex++,
    });

    // Flex Outro Scenes (optional)
    flexOutroScenes.forEach((flex) => {
      trackScenes.push({
        ...flex,
        type: 'flex-outro',
        index: visualIndex++,
        isFlexScene: true,
      });
    });

    return trackScenes;
  };

  const trackScenes = buildTrackScenes();
  const totalScenes = trackScenes.filter(t => t.type !== 'chapter-divider').length;
  const configuredScenes = scenes.filter(s => s.question.trim()).length;

  // Map visual index to actual scene index for navigation
  const getActualSceneIndex = (track: TrackScene): number => {
    if (track.type === 'intro') return 0;
    if (track.type === 'results') return totalScenes - 1;
    if (track.type === 'gameplay' && track.sceneDataIndex !== undefined) {
      return track.sceneDataIndex + 1; // +1 for intro
    }
    if (track.type === 'chapter-divider') {
      // Find the first gameplay scene of this track
      const firstGameplay = trackScenes.find(
        t => t.type === 'gameplay' && t.trackId === track.trackId
      );
      return firstGameplay?.sceneDataIndex !== undefined 
        ? firstGameplay.sceneDataIndex + 1 
        : track.index;
    }
    return track.index;
  };

  // Get mechanic icon
  const getMechanicIcon = (subComp?: SubCompetency): string => {
    if (!subComp?.game_mechanic) return MECHANIC_ICONS.default;
    const mechanic = Object.keys(MECHANIC_ICONS).find(key => 
      subComp.game_mechanic?.includes(key)
    );
    return mechanic ? MECHANIC_ICONS[mechanic] : MECHANIC_ICONS.default;
  };

  // Get short sub-competency ID for display
  const getShortSubId = (subComp?: SubCompetency): string => {
    if (!subComp) return '—';
    return subComp.id.slice(-6).toUpperCase();
  };

  // Scroll to a specific track
  const scrollToTrack = (trackId: string) => {
    if (!scrollRef.current) return;
    
    const trackDivider = scrollRef.current.querySelector(`[data-track-id="${trackId}"]`);
    if (trackDivider) {
      trackDivider.scrollIntoView({ behavior: 'smooth', inline: 'start' });
    }
    onScrollToTrack?.(trackId);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const draggedTrack = trackScenes.find(t => t.type === 'gameplay' && t.sceneDataIndex === draggedIndex);
      const targetTrack = trackScenes.find(t => t.type === 'gameplay' && t.sceneDataIndex === dragOverIndex);

      if (draggedTrack && targetTrack && draggedTrack.sceneDataIndex !== undefined && targetTrack.sceneDataIndex !== undefined) {
        // Only allow reordering within the same track
        if (draggedTrack.trackId === targetTrack.trackId) {
          const newScenes = [...scenes];
          const [removed] = newScenes.splice(draggedTrack.sceneDataIndex, 1);
          newScenes.splice(targetTrack.sceneDataIndex, 0, removed);
          setScenes(newScenes);
          toast.success(`Scene reordered: ${draggedTrack.sceneDataIndex + 1} → ${targetTrack.sceneDataIndex + 1}`);
        } else {
          toast.error('Cannot reorder scenes across different tracks');
        }
      }
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  // Theme styles
  const bgColor = isDarkMode ? 'bg-slate-900/95' : 'bg-white/98';
  const borderColor = isDarkMode ? 'border-white/10' : 'border-slate-200';
  const textColor = isDarkMode ? 'text-white' : 'text-slate-900';
  const mutedColor = isDarkMode ? 'text-white/50' : 'text-slate-500';

  // Render chapter divider
  const renderChapterDivider = (track: TrackScene) => {
    return (
      <div
        key={`divider-${track.trackId}`}
        data-track-id={track.trackId}
        className="flex flex-col items-center justify-center px-2 cursor-pointer"
        onClick={() => track.trackId && scrollToTrack(track.trackId)}
      >
        {/* Vertical Divider Line */}
        <div className={`w-px h-16 ${isDarkMode ? 'bg-white/20' : 'bg-slate-300'}`} />
        
        {/* Track Label */}
        <div 
          className={`
            px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap
            ${isDarkMode ? 'bg-white/10 text-white/80' : 'bg-slate-100 text-slate-700'}
          `}
        >
          Track {track.trackNumber}: {track.trackName?.slice(0, 12)}
          {(track.trackName?.length ?? 0) > 12 && '...'}
        </div>
        
        {/* Bottom Divider Line */}
        <div className={`w-px h-4 ${isDarkMode ? 'bg-white/20' : 'bg-slate-300'}`} />
      </div>
    );
  };

  const renderSceneThumbnail = (track: TrackScene) => {
    // Render chapter divider differently
    if (track.type === 'chapter-divider') {
      return renderChapterDivider(track);
    }

    const isActive = getActualSceneIndex(track) === currentSceneIndex;
    const isConfigured = track.type === 'intro' || track.type === 'results' || !!track.sceneData;
    const isDragging = draggedIndex === track.sceneDataIndex;
    const isDragOver = dragOverIndex === track.sceneDataIndex;
    const isGameplay = track.type === 'gameplay';
    const isLocked = track.subCompetency?.action_cue;
    const hasBackgroundPrompt = isGameplay && track.sceneData?.backgroundPrompt?.trim();
    const isLoadingScene = isApplyingGlobal && isGameplay && isConfigured;

    return (
      <div
        key={`${track.type}-${track.index}`}
        draggable={isGameplay && isConfigured}
        onDragStart={(e) => isGameplay && track.sceneDataIndex !== undefined && handleDragStart(e, track.sceneDataIndex)}
        onDragOver={(e) => isGameplay && track.sceneDataIndex !== undefined && handleDragOver(e, track.sceneDataIndex)}
        onDragEnd={handleDragEnd}
        onDragLeave={handleDragLeave}
        onClick={() => setCurrentSceneIndex(getActualSceneIndex(track))}
        className={`
          relative flex flex-col items-center gap-1 cursor-pointer transition-all duration-200
          ${isDragging ? 'opacity-50 scale-95' : ''}
          ${isDragOver ? 'ring-2 ring-primary ring-offset-2' : ''}
          ${isDarkMode ? 'ring-offset-slate-900' : 'ring-offset-white'}
        `}
      >
        {/* Drag handle for gameplay scenes */}
        {isGameplay && isConfigured && (
          <div className={`absolute -left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab ${mutedColor}`}>
            <GripVertical className="h-3 w-3" />
          </div>
        )}

        {/* Track indicator badge for multi-track */}
        {tracks.length > 1 && track.trackNumber && isGameplay && (
          <div 
            className="absolute -top-2 -left-1 w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center text-white"
            style={{ 
              background: `hsl(${((track.trackNumber - 1) * 60) % 360}, 70%, 50%)` 
            }}
          >
            {track.trackNumber}
          </div>
        )}

        {/* Thumbnail Container */}
        <div
          className={`
            w-14 h-20 rounded-lg border-2 flex flex-col items-center justify-between py-1.5 overflow-hidden transition-all
            ${isActive ? 'ring-2 ring-primary ring-offset-1 scale-105' : 'hover:scale-102'}
            ${isConfigured ? '' : 'border-dashed opacity-50'}
            ${track.isFlexScene ? 'border-emerald-500/50' : ''}
          `}
          style={{
            background: hasBackgroundPrompt
              ? `linear-gradient(135deg, ${designSettings.primary}30, ${designSettings.secondary}40, ${designSettings.accent}30)`
              : designSettings.background,
            borderColor: isActive
              ? designSettings.primary
              : isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
          }}
        >
          {/* Loading overlay during Apply to All */}
          {isLoadingScene && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg"
              style={{ backgroundColor: `${designSettings.primary}40` }}
            >
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            </div>
          )}

          {/* Background prompt indicator */}
          {hasBackgroundPrompt && !isLoadingScene && (
            <div className="absolute top-0 right-0 w-2 h-2 rounded-bl-md"
              style={{ backgroundColor: designSettings.highlight }}
              title="Background styled"
            />
          )}

          {/* Mini header bar */}
          <div
            className="w-full h-3 flex items-center justify-center"
            style={{ backgroundColor: `${designSettings.primary}25` }}
          >
            <div
              className="w-4 h-0.5 rounded-full"
              style={{ backgroundColor: designSettings.primary }}
            />
          </div>

          {/* Center icon + mechanic indicator */}
          <div className="flex-1 flex flex-col items-center justify-center gap-0.5">
            {/* Scene type icon */}
            <div style={{ color: designSettings.text }}>
              {track.type === 'intro' && <Play className="h-3.5 w-3.5" />}
              {track.type === 'results' && <Trophy className="h-3.5 w-3.5" />}
              {track.type === 'gameplay' && (
                isConfigured ? (
                  <span className="text-sm">{getMechanicIcon(track.subCompetency)}</span>
                ) : (
                  <Plus className="h-3 w-3 opacity-40" />
                )
              )}
              {track.isFlexScene && <Sparkles className="h-3.5 w-3.5 text-emerald-500" />}
            </div>

            {/* Sub-competency ID for gameplay scenes */}
            {track.type === 'gameplay' && track.subCompetency && (
              <span 
                className="text-[7px] font-mono tracking-tight opacity-60"
                style={{ color: designSettings.text }}
              >
                {getShortSubId(track.subCompetency)}
              </span>
            )}
          </div>

          {/* Choice indicators for gameplay */}
          {track.type === 'gameplay' && track.sceneData && (
            <div className="w-full px-1 space-y-0.5">
              {track.sceneData.choices.slice(0, 2).map((_, i) => (
                <div
                  key={i}
                  className="h-0.5 rounded-full"
                  style={{ backgroundColor: `${designSettings.secondary}60` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Scene label */}
        <span className={`text-[9px] font-medium ${isActive ? textColor : mutedColor}`}>
          {track.type === 'intro' && 'Intro'}
          {track.type === 'results' && 'Results'}
          {track.type === 'gameplay' && `S${(track.sceneDataIndex ?? 0) + 1}`}
          {track.type === 'flex-intro' && `F${track.index + 1}`}
          {track.type === 'flex-outro' && `O${track.index + 1}`}
        </span>

        {/* Locked badge */}
        {isLocked && (
          <div
            className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: designSettings.primary }}
          >
            <Lock className="h-1.5 w-1.5 text-white" />
          </div>
        )}

        {/* Active indicator dot */}
        {isActive && (
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: designSettings.primary }}
          />
        )}
      </div>
    );
  };

  return (
    <div className={`${bgColor} border-t ${borderColor} backdrop-blur-xl`}>
      {/* Track Rail Header */}
      <div className={`px-4 py-2 border-b ${borderColor} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1 rounded hover:bg-accent transition-colors ${mutedColor}`}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <Layers className={`h-4 w-4 ${mutedColor}`} />
            <span className={`text-xs font-semibold uppercase tracking-wider ${mutedColor}`}>
              Track Rail
            </span>
          </div>

          {/* Multi-track or single block indicator */}
          {tracks.length > 1 ? (
            <Badge 
              variant="outline" 
              className={`text-[10px] ${isDarkMode ? 'border-primary/30 text-primary' : 'border-primary/50 text-primary'}`}
            >
              {tracks.length} Tracks • {configuredScenes}/{tracks.length * 6} scenes
            </Badge>
          ) : (
            <Badge 
              variant="outline" 
              className={`text-[10px] ${isDarkMode ? 'border-primary/30 text-primary' : 'border-primary/50 text-primary'}`}
            >
              Competency Block: {configuredScenes}/6 scenes
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Progress indicator */}
          <span className={`text-xs ${mutedColor}`}>
            Scene {currentSceneIndex + 1} of {totalScenes}
          </span>

          {/* Flex scene controls */}
          {onAddFlexScene && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddFlexScene('intro')}
                className="h-6 px-2 text-xs gap-1"
              >
                <Plus className="h-3 w-3" />
                Intro
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddFlexScene('outro')}
                className="h-6 px-2 text-xs gap-1"
              >
                <Plus className="h-3 w-3" />
                Outro
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Track Rail Content */}
      {isExpanded && (
        <div ref={scrollRef} className="px-4 py-3 overflow-x-auto">
          <div ref={dragRef} className="flex items-center gap-3 min-w-max group">
            {/* Flex Intro Add Button */}
            {onAddFlexScene && flexIntroScenes.length === 0 && (
              <button
                onClick={() => onAddFlexScene('intro')}
                className={`
                  w-10 h-20 rounded-lg border-2 border-dashed flex items-center justify-center
                  transition-all hover:scale-105 hover:border-primary
                  ${isDarkMode ? 'border-white/20 hover:bg-white/5' : 'border-slate-300 hover:bg-slate-50'}
                `}
              >
                <Plus className={`h-4 w-4 ${mutedColor}`} />
              </button>
            )}

            {/* All Track Scenes */}
            {trackScenes.map(renderSceneThumbnail)}

            {/* Flex Outro Add Button */}
            {onAddFlexScene && flexOutroScenes.length === 0 && (
              <button
                onClick={() => onAddFlexScene('outro')}
                className={`
                  w-10 h-20 rounded-lg border-2 border-dashed flex items-center justify-center
                  transition-all hover:scale-105 hover:border-emerald-500
                  ${isDarkMode ? 'border-white/20 hover:bg-white/5' : 'border-slate-300 hover:bg-slate-50'}
                `}
              >
                <Plus className={`h-4 w-4 ${mutedColor}`} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
