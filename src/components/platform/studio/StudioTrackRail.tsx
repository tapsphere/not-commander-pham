import { useState, useRef } from 'react';
import { 
  Play, Trophy, Gamepad2, Lock, Plus, Minus, GripVertical, 
  Layers, Sparkles, ChevronDown, ChevronUp 
} from 'lucide-react';
import { DesignSettings, SceneData, SubCompetency, createDefaultScene } from '../template-steps/types';
import { useStudioTheme } from './StudioThemeContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Scene types for the unified track
type SceneType = 'intro' | 'gameplay' | 'results' | 'flex-intro' | 'flex-outro';

interface TrackScene {
  type: SceneType;
  index: number;           // Visual index in the track
  sceneDataIndex?: number; // Index in the scenes array (for gameplay scenes)
  sceneData?: SceneData;
  subCompetency?: SubCompetency;
  isFlexScene?: boolean;
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
  // Flex scenes
  flexIntroScenes?: TrackScene[];
  flexOutroScenes?: TrackScene[];
  onAddFlexScene?: (position: 'intro' | 'outro') => void;
  onRemoveFlexScene?: (position: 'intro' | 'outro', index: number) => void;
}

export function StudioTrackRail({
  currentSceneIndex,
  setCurrentSceneIndex,
  scenes,
  setScenes,
  subCompetencies,
  designSettings,
  flexIntroScenes = [],
  flexOutroScenes = [],
  onAddFlexScene,
  onRemoveFlexScene,
}: StudioTrackRailProps) {
  const { isDarkMode } = useStudioTheme();
  const [isExpanded, setIsExpanded] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  // Build the complete track structure
  const buildTrackScenes = (): TrackScene[] => {
    const trackScenes: TrackScene[] = [];
    let visualIndex = 0;

    // Flex Intro Scenes (optional)
    flexIntroScenes.forEach((flex, i) => {
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

    // Gameplay Scenes (Competency Block - up to 6 scenes)
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

    // Main Results (Scene 7)
    trackScenes.push({
      type: 'results',
      index: visualIndex++,
    });

    // Flex Outro Scenes (optional)
    flexOutroScenes.forEach((flex, i) => {
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
  const totalScenes = trackScenes.length;
  const configuredScenes = scenes.filter(s => s.question.trim()).length;

  // Map visual index to actual scene index for navigation
  const getActualSceneIndex = (track: TrackScene): number => {
    if (track.type === 'intro') return 0;
    if (track.type === 'results') return 7;
    if (track.type === 'gameplay' && track.sceneDataIndex !== undefined) {
      return track.sceneDataIndex + 1; // Scenes 1-6
    }
    // Flex scenes - return -1 for now (could be extended)
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
      // Only allow reordering within gameplay scenes (indices that map to scenes array)
      const draggedTrack = trackScenes.find(t => t.type === 'gameplay' && t.sceneDataIndex === draggedIndex);
      const targetTrack = trackScenes.find(t => t.type === 'gameplay' && t.sceneDataIndex === dragOverIndex);

      if (draggedTrack && targetTrack && draggedTrack.sceneDataIndex !== undefined && targetTrack.sceneDataIndex !== undefined) {
        const newScenes = [...scenes];
        const [removed] = newScenes.splice(draggedTrack.sceneDataIndex, 1);
        newScenes.splice(targetTrack.sceneDataIndex, 0, removed);
        setScenes(newScenes);
        toast.success(`Scene reordered: ${draggedTrack.sceneDataIndex + 1} → ${targetTrack.sceneDataIndex + 1}`);
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

  const renderSceneThumbnail = (track: TrackScene) => {
    const isActive = getActualSceneIndex(track) === currentSceneIndex;
    const isConfigured = track.type === 'intro' || track.type === 'results' || !!track.sceneData;
    const isDragging = draggedIndex === track.sceneDataIndex;
    const isDragOver = dragOverIndex === track.sceneDataIndex;
    const isGameplay = track.type === 'gameplay';
    const isLocked = track.subCompetency?.action_cue;

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

        {/* Thumbnail Container */}
        <div
          className={`
            w-14 h-20 rounded-lg border-2 flex flex-col items-center justify-between py-1.5 overflow-hidden transition-all
            ${isActive ? 'ring-2 ring-primary ring-offset-1 scale-105' : 'hover:scale-102'}
            ${isConfigured ? '' : 'border-dashed opacity-50'}
            ${track.isFlexScene ? 'border-emerald-500/50' : ''}
          `}
          style={{
            backgroundColor: designSettings.background,
            borderColor: isActive
              ? designSettings.primary
              : isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
          }}
        >
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

          {/* Chapter indicator */}
          <Badge 
            variant="outline" 
            className={`text-[10px] ${isDarkMode ? 'border-primary/30 text-primary' : 'border-primary/50 text-primary'}`}
          >
            Competency Block: {configuredScenes}/6 scenes
          </Badge>
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
        <div ref={dragRef} className="px-4 py-3 overflow-x-auto">
          <div className="flex items-center gap-3 min-w-max group">
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
