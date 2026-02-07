/**
 * MechanicPreview - Scene Assembler Integration
 * 
 * Renders mechanic-specific UI layouts based on game_mechanic column
 * from Excel Framework data. Uses DNA Library blueprints for mapping.
 * 
 * Player Toggle Logic:
 * - State A: Nothing selected → Next button hidden/greyed
 * - State B: Option clicked → Highlight, save data, show Next
 * - State C: Same option clicked again → Deselect, clear data, hide Next
 * - State D: Different option clicked → Auto-deselect old, select new
 */

import { DesignSettings, ChoiceData } from '../template-steps/types';
import { detectMechanicType, MechanicType } from './SceneAssembler';
import { 
  ScrubSlider, 
  SwipeCard, 
  QuickTapButtons, 
  DragConnect,
  PatternGrid,
  TradeoffMatrix,
} from './mechanics';
import { GripVertical, CheckCircle, Circle } from 'lucide-react';

interface MechanicPreviewProps {
  mechanic: string | null;
  choices: ChoiceData[];
  designSettings: DesignSettings;
  isGhostState: boolean;
  playerAction?: string | null;
  selectedChoiceId?: string | null;
  onChoiceSelect?: (choiceId: string | null) => void;
}

/**
 * Main MechanicPreview component
 * 
 * Maps Excel game_mechanic → DNA Library blueprint → Component
 */
export function MechanicPreview({
  mechanic,
  choices,
  designSettings,
  isGhostState,
  playerAction,
  selectedChoiceId,
  onChoiceSelect,
}: MechanicPreviewProps) {
  // Step 1: Detect mechanic type using SceneAssembler logic
  const mechanicType = detectMechanicType(mechanic, playerAction);
  
  // Step 2: Render appropriate component based on mechanic type
  return (
    <MechanicRenderer
      mechanicType={mechanicType}
      choices={choices}
      designSettings={designSettings}
      isGhostState={isGhostState}
      selectedChoiceId={selectedChoiceId}
      onChoiceSelect={onChoiceSelect}
    />
  );
}

interface MechanicRendererProps {
  mechanicType: MechanicType;
  choices: ChoiceData[];
  designSettings: DesignSettings;
  isGhostState: boolean;
  selectedChoiceId?: string | null;
  onChoiceSelect?: (choiceId: string | null) => void;
}

/**
 * Renders the actual mechanic component based on type
 */
function MechanicRenderer({
  mechanicType,
  choices,
  designSettings,
  isGhostState,
  selectedChoiceId,
  onChoiceSelect,
}: MechanicRendererProps) {
  switch (mechanicType) {
    case 'data_analysis':
      // Continuous Scrub - ScrubSlider with 60Hz telemetry
      return (
        <ScrubSlider
          isGhostState={isGhostState}
        />
      );
      
    case 'binary_choice':
      // Binary - SwipeCard
      return (
        <SwipeCard
          designSettings={designSettings}
          choices={choices}
          isGhostState={isGhostState}
        />
      );
      
    case 'scenario_simulation':
    case 'communication':
      // Quick Tap - Glassmorphic button stack
      return (
        <QuickTapButtons
          designSettings={designSettings}
          choices={choices}
          isGhostState={isGhostState}
        />
      );
      
    case 'collaboration':
      // Drag-to-Connect - SVG canvas
      return (
        <DragConnect
          designSettings={designSettings}
          isGhostState={isGhostState}
        />
      );
      
    case 'portfolio_timeline':
      // Pattern Grid - 5x5 selectable grid
      return (
        <PatternGrid
          designSettings={designSettings}
          isGhostState={isGhostState}
        />
      );
      
    case 'strategic_viability':
      // Trade-off Matrix - 2x2 quadrant placement
      return (
        <TradeoffMatrix
          designSettings={designSettings}
          isGhostState={isGhostState}
        />
      );
      
    case 'performance_demo':
    case 'ranking':
      // Ranking - Draggable list
      return (
        <RankingLayout
          choices={choices}
          designSettings={designSettings}
          isGhostState={isGhostState}
        />
      );
      
    case 'multi_choice':
    default:
      // Default - Multi-choice button stack with toggle
      return (
        <MultiChoiceLayout
          choices={choices}
          designSettings={designSettings}
          isGhostState={isGhostState}
          selectedChoiceId={selectedChoiceId}
          onChoiceSelect={onChoiceSelect}
        />
      );
  }
}

// ============================================================================
// FALLBACK LAYOUTS (for mechanics without dedicated components yet)
// ============================================================================

// Ranking: Draggable list with grip handles
function RankingLayout({ 
  choices, 
  designSettings, 
  isGhostState 
}: { 
  choices: ChoiceData[];
  designSettings: DesignSettings;
  isGhostState: boolean;
}) {
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

// Multi-choice: Dynamic grid with toggle selection
function MultiChoiceLayout({ 
  choices, 
  designSettings, 
  isGhostState,
  selectedChoiceId,
  onChoiceSelect,
}: { 
  choices: ChoiceData[];
  designSettings: DesignSettings;
  isGhostState: boolean;
  selectedChoiceId?: string | null;
  onChoiceSelect?: (choiceId: string | null) => void;
}) {
  const displayChoices = choices.length > 0 ? choices : [
    { id: '1', text: 'Strategic Response A', isCorrect: true },
    { id: '2', text: 'Alternative Approach B', isCorrect: false },
    { id: '3', text: 'Tactical Option C', isCorrect: false },
    { id: '4', text: 'Fallback Decision D', isCorrect: false },
  ];

  // Handle toggle logic
  const handleChoiceClick = (choiceId: string) => {
    if (!onChoiceSelect) return;
    
    // State C: Same option clicked again → Deselect
    if (selectedChoiceId === choiceId) {
      onChoiceSelect(null);
    } else {
      // State B & D: Select new option (auto-deselects old one)
      onChoiceSelect(choiceId);
    }
  };

  // Dynamic sizing based on choice count
  const choiceCount = displayChoices.length;
  const padding = choiceCount > 6 ? 'p-1.5' : choiceCount > 4 ? 'p-2' : 'p-2.5';
  const textSize = choiceCount > 6 ? 'text-[10px]' : 'text-xs';
  const iconSize = choiceCount > 6 ? 'h-3 w-3' : 'h-4 w-4';
  const gap = choiceCount > 6 ? 'space-y-1' : 'space-y-1.5';

  return (
    <div className={`px-4 ${gap} max-h-[140px] overflow-y-auto`}>
      {displayChoices.map((choice, idx) => {
        const isSelected = selectedChoiceId === choice.id;
        
        return (
          <button
            key={choice.id}
            onClick={() => handleChoiceClick(choice.id)}
            className={`w-full rounded-lg ${padding} flex items-center gap-2 border transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]`}
            style={{
              backgroundColor: isSelected 
                ? `${designSettings.primary}25`
                : designSettings.background,
              borderColor: isSelected 
                ? designSettings.primary
                : `${designSettings.text}20`,
              boxShadow: isSelected 
                ? `0 0 0 2px ${designSettings.primary}40`
                : 'none',
            }}
          >
            {isSelected ? (
              <CheckCircle className={`${iconSize} flex-shrink-0`} style={{ color: designSettings.primary }} />
            ) : (
              <Circle className={`${iconSize} flex-shrink-0 opacity-40`} style={{ color: designSettings.text }} />
            )}
            <span 
              className={`${textSize} flex-1 text-left ${!choice.text && isGhostState ? 'opacity-40 italic' : ''}`}
              style={{ color: designSettings.text }}
            >
              {choice.text || `Option ${idx + 1}`}
            </span>
          </button>
        );
      })}
    </div>
  );
}
