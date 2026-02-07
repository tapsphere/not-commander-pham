import { DesignSettings, ChoiceData } from '../template-steps/types';
import { CheckCircle, XCircle, GripVertical } from 'lucide-react';

interface MechanicPreviewProps {
  mechanic: string | null;
  choices: ChoiceData[];
  designSettings: DesignSettings;
  isGhostState: boolean;
}

/**
 * Renders different UI layouts based on game_mechanic type
 */
export function MechanicPreview({
  mechanic,
  choices,
  designSettings,
  isGhostState,
}: MechanicPreviewProps) {
  const mechanicLower = (mechanic || '').toLowerCase();

  // Binary mechanic: 2 large toggle buttons
  if (mechanicLower.includes('binary') || mechanicLower.includes('toggle') || choices.length === 2) {
    return <BinaryLayout choices={choices} designSettings={designSettings} isGhostState={isGhostState} />;
  }

  // Ranking/Prioritization mechanic: draggable list
  if (mechanicLower.includes('ranking') || mechanicLower.includes('priorit') || mechanicLower.includes('order')) {
    return <RankingLayout choices={choices} designSettings={designSettings} isGhostState={isGhostState} />;
  }

  // Default: Multi-choice grid (2-10 buttons)
  return <MultiChoiceLayout choices={choices} designSettings={designSettings} isGhostState={isGhostState} />;
}

// Binary: 2 large side-by-side buttons
function BinaryLayout({ choices, designSettings, isGhostState }: Omit<MechanicPreviewProps, 'mechanic'>) {
  const displayChoices = choices.length >= 2 ? choices.slice(0, 2) : [
    { id: '1', text: 'Yes', isCorrect: true },
    { id: '2', text: 'No', isCorrect: false },
  ];

  return (
    <div className="px-4 flex gap-3">
      {displayChoices.map((choice, idx) => (
        <button
          key={choice.id}
          className="flex-1 py-6 rounded-xl font-semibold text-sm transition-all border-2"
          style={{
            backgroundColor: choice.isCorrect 
              ? `${designSettings.highlight}30`
              : designSettings.background,
            borderColor: choice.isCorrect 
              ? designSettings.highlight
              : `${designSettings.text}30`,
            color: designSettings.text,
          }}
        >
          <div className="flex flex-col items-center gap-1">
            {choice.isCorrect ? (
              <CheckCircle className="h-5 w-5" style={{ color: designSettings.highlight }} />
            ) : (
              <XCircle className="h-5 w-5 opacity-40" />
            )}
            <span className={isGhostState && !choice.text ? 'opacity-40 italic' : ''}>
              {choice.text || (idx === 0 ? 'Option A' : 'Option B')}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

// Ranking: Draggable list with grip handles
function RankingLayout({ choices, designSettings, isGhostState }: Omit<MechanicPreviewProps, 'mechanic'>) {
  const displayChoices = choices.length > 0 ? choices : [
    { id: '1', text: 'Priority Item 1', isCorrect: true },
    { id: '2', text: 'Priority Item 2', isCorrect: false },
    { id: '3', text: 'Priority Item 3', isCorrect: false },
    { id: '4', text: 'Priority Item 4', isCorrect: false },
  ];

  return (
    <div className="px-4 space-y-2 max-h-[140px] overflow-y-auto">
      {displayChoices.map((choice, idx) => (
        <div
          key={choice.id}
          className="rounded-lg p-2.5 flex items-center gap-2 border transition-all cursor-grab"
          style={{
            backgroundColor: `${designSettings.secondary}15`,
            borderColor: `${designSettings.text}20`,
          }}
        >
          <GripVertical className="h-4 w-4 flex-shrink-0 opacity-40" style={{ color: designSettings.text }} />
          <span 
            className="text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center"
            style={{ 
              backgroundColor: `${designSettings.primary}30`,
              color: designSettings.text,
            }}
          >
            {idx + 1}
          </span>
          <span 
            className={`text-xs flex-1 ${isGhostState && !choice.text ? 'opacity-40 italic' : ''}`}
            style={{ color: designSettings.text }}
          >
            {choice.text || `Rank Item ${idx + 1}`}
          </span>
        </div>
      ))}
      <p className="text-[9px] text-center opacity-50" style={{ color: designSettings.text }}>
        ↕ Drag to reorder
      </p>
    </div>
  );
}

// Multi-choice: Dynamic grid (2-10 buttons)
function MultiChoiceLayout({ choices, designSettings, isGhostState }: Omit<MechanicPreviewProps, 'mechanic'>) {
  const displayChoices = choices.length > 0 ? choices : [
    { id: '1', text: 'Strategic Response A', isCorrect: true },
    { id: '2', text: 'Alternative Approach B', isCorrect: false },
    { id: '3', text: 'Tactical Option C', isCorrect: false },
    { id: '4', text: 'Fallback Decision D', isCorrect: false },
  ];

  // Dynamic sizing based on choice count
  const choiceCount = displayChoices.length;
  const padding = choiceCount > 6 ? 'p-1.5' : choiceCount > 4 ? 'p-2' : 'p-2.5';
  const textSize = choiceCount > 6 ? 'text-[10px]' : 'text-xs';
  const iconSize = choiceCount > 6 ? 'h-3 w-3' : 'h-4 w-4';
  const gap = choiceCount > 6 ? 'space-y-1' : 'space-y-1.5';

  return (
    <div className={`px-4 ${gap} max-h-[140px] overflow-y-auto`}>
      {displayChoices.map((choice, idx) => (
        <div
          key={choice.id}
          className={`rounded-lg ${padding} flex items-center gap-2 border transition-all`}
          style={{
            backgroundColor: choice.isCorrect 
              ? `${designSettings.highlight}30`
              : designSettings.background,
            borderColor: choice.isCorrect 
              ? designSettings.highlight
              : `${designSettings.text}20`,
          }}
        >
          {choice.isCorrect ? (
            <CheckCircle className={`${iconSize} flex-shrink-0`} style={{ color: designSettings.highlight }} />
          ) : (
            <XCircle className={`${iconSize} flex-shrink-0 opacity-40`} style={{ color: designSettings.text }} />
          )}
          <span 
            className={`${textSize} flex-1 ${!choice.text && isGhostState ? 'opacity-40 italic' : ''}`}
            style={{ color: designSettings.text }}
          >
            {choice.text || `Option ${idx + 1}`}
          </span>
        </div>
      ))}
    </div>
  );
}
