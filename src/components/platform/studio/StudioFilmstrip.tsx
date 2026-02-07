import { Play, Gamepad2, Trophy, Lock, Plus } from 'lucide-react';
import { DesignSettings, SceneData, SubCompetency } from '../template-steps/types';
import { useStudioTheme } from './StudioThemeContext';

interface FilmstripScene {
  type: 'intro' | 'gameplay' | 'results';
  index: number; // 0=intro, 1-6=gameplay, 7=results
  sceneData?: SceneData;
  subCompetency?: SubCompetency;
}

interface StudioFilmstripProps {
  currentSceneIndex: number;
  setCurrentSceneIndex: (index: number) => void;
  scenes: SceneData[];
  subCompetencies: SubCompetency[];
  designSettings: DesignSettings;
  onAddScene?: () => void;
}

export function StudioFilmstrip({
  currentSceneIndex,
  setCurrentSceneIndex,
  scenes,
  subCompetencies,
  designSettings,
  onAddScene,
}: StudioFilmstripProps) {
  const { isDarkMode } = useStudioTheme();

  // Build the 8-scene filmstrip structure
  const filmstripScenes: FilmstripScene[] = [
    // Scene 0: Intro
    { type: 'intro', index: 0 },
    // Scenes 1-6: Gameplay (mapped from actual scenes)
    ...Array.from({ length: 6 }, (_, i) => {
      const sceneData = scenes[i];
      const subComp = sceneData 
        ? subCompetencies.find(s => s.id === sceneData.subCompetencyId)
        : undefined;
      return {
        type: 'gameplay' as const,
        index: i + 1,
        sceneData,
        subCompetency: subComp,
      };
    }),
    // Scene 7: Results
    { type: 'results', index: 7 },
  ];

  const getSceneLabel = (scene: FilmstripScene) => {
    switch (scene.type) {
      case 'intro':
        return 'Intro';
      case 'results':
        return 'Results';
      default:
        return `Scene ${scene.index}`;
    }
  };

  const getSceneIcon = (scene: FilmstripScene) => {
    switch (scene.type) {
      case 'intro':
        return <Play className="h-4 w-4" />;
      case 'results':
        return <Trophy className="h-4 w-4" />;
      default:
        return scene.sceneData 
          ? <Gamepad2 className="h-4 w-4" />
          : <Plus className="h-3.5 w-3.5 opacity-40" />;
    }
  };

  const isSceneConfigured = (scene: FilmstripScene) => {
    if (scene.type === 'intro' || scene.type === 'results') return true;
    return !!scene.sceneData;
  };

  const bgColor = isDarkMode ? 'bg-slate-900/80' : 'bg-white/90';
  const borderColor = isDarkMode ? 'border-white/10' : 'border-slate-200';
  const textColor = isDarkMode ? 'text-white' : 'text-slate-900';
  const mutedColor = isDarkMode ? 'text-white/50' : 'text-slate-500';

  return (
    <div className={`${bgColor} border-t ${borderColor} backdrop-blur-xl`}>
      {/* Timeline header */}
      <div className={`px-4 py-2 border-b ${borderColor} flex items-center justify-between`}>
        <span className={`text-xs font-medium uppercase tracking-wider ${mutedColor}`}>
          Timeline
        </span>
        <div className="flex items-center gap-2">
          <span className={`text-xs ${mutedColor}`}>
            {scenes.length}/6 scenes configured
          </span>
        </div>
      </div>

      {/* Filmstrip thumbnails */}
      <div className="px-4 py-3 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {filmstripScenes.map((scene) => {
            const isActive = currentSceneIndex === scene.index;
            const isConfigured = isSceneConfigured(scene);
            const isLocked = scene.subCompetency?.action_cue;

            return (
              <button
                key={scene.index}
                onClick={() => setCurrentSceneIndex(scene.index)}
                className={`
                  relative flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all
                  ${isActive 
                    ? 'ring-2 ring-offset-2 ring-primary scale-105' 
                    : 'hover:scale-102'
                  }
                  ${isDarkMode ? 'ring-offset-slate-900' : 'ring-offset-white'}
                `}
                style={{
                  backgroundColor: isActive 
                    ? `${designSettings.primary}20` 
                    : isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                }}
              >
                {/* Thumbnail preview */}
                <div 
                  className={`
                    w-16 h-24 rounded-lg border-2 flex flex-col items-center justify-center transition-all overflow-hidden
                    ${isConfigured ? '' : 'border-dashed opacity-50'}
                  `}
                  style={{
                    backgroundColor: designSettings.background,
                    borderColor: isActive 
                      ? designSettings.primary 
                      : isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                  }}
                >
                  {/* Mini preview content */}
                  <div 
                    className="w-full h-5 flex items-center justify-center"
                    style={{ backgroundColor: `${designSettings.primary}30` }}
                  >
                    <div 
                      className="w-6 h-1 rounded-full"
                      style={{ backgroundColor: designSettings.primary }}
                    />
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center p-1">
                    <div style={{ color: designSettings.text }}>
                      {getSceneIcon(scene)}
                    </div>
                  </div>

                  {/* Choice indicators for gameplay scenes */}
                  {scene.type === 'gameplay' && scene.sceneData && (
                    <div className="w-full px-1 pb-1 space-y-0.5">
                      {scene.sceneData.choices.slice(0, 3).map((_, i) => (
                        <div 
                          key={i}
                          className="h-1 rounded-full"
                          style={{ backgroundColor: `${designSettings.secondary}60` }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Scene label */}
                <span 
                  className={`text-[10px] font-medium ${isActive ? textColor : mutedColor}`}
                >
                  {getSceneLabel(scene)}
                </span>

                {/* Locked indicator */}
                {isLocked && (
                  <div 
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: designSettings.primary }}
                  >
                    <Lock className="h-2 w-2 text-white" />
                  </div>
                )}

                {/* Active indicator */}
                {isActive && (
                  <div 
                    className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                    style={{ backgroundColor: designSettings.primary }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
