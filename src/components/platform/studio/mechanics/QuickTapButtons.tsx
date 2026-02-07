/**
 * QuickTapButtons - Scenario Simulation / Decision Tree
 * 
 * DNA Library 3.1: "Vertical stack of glassmorphic buttons"
 * Telemetry: Decision Latency (time from scene start to first tap)
 */

import { useState, useRef, useEffect } from 'react';
import { DesignSettings, ChoiceData } from '../../template-steps/types';
import { CheckCircle } from 'lucide-react';

interface QuickTapButtonsProps {
  designSettings: DesignSettings;
  choices: ChoiceData[];
  isGhostState: boolean;
  onSelect?: (choice: ChoiceData, latencyMs: number) => void;
  disabled?: boolean;
}

export function QuickTapButtons({
  designSettings,
  choices,
  isGhostState,
  onSelect,
  disabled = false,
}: QuickTapButtonsProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const sceneStartTime = useRef(performance.now());

  // Reset timer when choices change
  useEffect(() => {
    sceneStartTime.current = performance.now();
    setSelectedId(null);
  }, [choices]);

  const handleTap = (choice: ChoiceData) => {
    if (disabled || selectedId) return;
    
    const latencyMs = performance.now() - sceneStartTime.current;
    setSelectedId(choice.id);
    onSelect?.(choice, latencyMs);
  };

  const displayChoices = choices.length > 0 ? choices : [
    { id: '1', text: 'Strategic Response A', isCorrect: true },
    { id: '2', text: 'Alternative Approach B', isCorrect: false },
    { id: '3', text: 'Tactical Option C', isCorrect: false },
    { id: '4', text: 'Fallback Decision D', isCorrect: false },
  ];

  return (
    <div className="px-4 space-y-2">
      {displayChoices.map((choice, idx) => {
        const isSelected = selectedId === choice.id;
        
        return (
          <button
            key={choice.id}
            onClick={() => handleTap(choice)}
            disabled={disabled || !!selectedId}
            className={`w-full rounded-xl p-3 flex items-center gap-3 transition-all ${
              isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01] active:scale-[0.99]'
            }`}
            style={{
              backgroundColor: isSelected 
                ? `${designSettings.highlight}30`
                : `${designSettings.background}`,
              border: `2px solid ${isSelected 
                ? designSettings.highlight 
                : `${designSettings.text}20`
              }`,
              boxShadow: isSelected 
                ? `0 4px 16px ${designSettings.highlight}30`
                : '0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            {/* Selection indicator */}
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                backgroundColor: isSelected 
                  ? designSettings.highlight 
                  : `${designSettings.text}10`,
                border: `2px solid ${isSelected 
                  ? designSettings.highlight 
                  : `${designSettings.text}30`
                }`,
              }}
            >
              {isSelected && (
                <CheckCircle className="h-4 w-4" style={{ color: designSettings.background }} />
              )}
            </div>

            {/* Choice text */}
            <span 
              className={`text-sm flex-1 text-left ${isGhostState && !choice.text ? 'opacity-40 italic' : ''}`}
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
