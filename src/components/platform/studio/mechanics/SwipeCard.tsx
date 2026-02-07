/**
 * SwipeCard - Binary Choice via Swipe Gesture
 * 
 * DNA Library: Binary Choice - Swipe left/right for decision
 * Telemetry: Swipe velocity, direction confidence, hesitation time
 */

import { useState, useRef, useCallback } from 'react';
import { DesignSettings, ChoiceData } from '../../template-steps/types';
import { CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface SwipeCardProps {
  designSettings: DesignSettings;
  choices: ChoiceData[];
  isGhostState: boolean;
  onSwipe?: (direction: 'left' | 'right', choice: ChoiceData) => void;
  disabled?: boolean;
}

export function SwipeCard({
  designSettings,
  choices,
  isGhostState,
  onSwipe,
  disabled = false,
}: SwipeCardProps) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Use first two choices for binary
  const leftChoice = choices[1] || { id: 'left', text: 'No', isCorrect: false };
  const rightChoice = choices[0] || { id: 'right', text: 'Yes', isCorrect: true };

  const SWIPE_THRESHOLD = 80;

  const handleStart = useCallback((clientX: number) => {
    if (disabled) return;
    setIsDragging(true);
    startX.current = clientX;
  }, [disabled]);

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging || disabled) return;
    const delta = clientX - startX.current;
    setOffset(Math.max(-150, Math.min(150, delta)));
  }, [isDragging, disabled]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (Math.abs(offset) > SWIPE_THRESHOLD) {
      const direction = offset > 0 ? 'right' : 'left';
      const choice = direction === 'right' ? rightChoice : leftChoice;
      onSwipe?.(direction, choice);
    }
    
    setOffset(0);
  }, [isDragging, offset, leftChoice, rightChoice, onSwipe]);

  const swipeProgress = Math.abs(offset) / SWIPE_THRESHOLD;
  const direction = offset > 0 ? 'right' : offset < 0 ? 'left' : null;

  return (
    <div className="px-4 py-3">
      {/* Swipe indicators */}
      <div className="flex justify-between mb-3 px-2">
        <div 
          className="flex items-center gap-1 transition-opacity"
          style={{ 
            color: designSettings.text,
            opacity: direction === 'left' ? 0.3 + swipeProgress * 0.7 : 0.3,
          }}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="text-xs">{leftChoice.text}</span>
        </div>
        <div 
          className="flex items-center gap-1 transition-opacity"
          style={{ 
            color: designSettings.text,
            opacity: direction === 'right' ? 0.3 + swipeProgress * 0.7 : 0.3,
          }}
        >
          <span className="text-xs">{rightChoice.text}</span>
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>

      {/* Swipeable Card */}
      <div 
        ref={cardRef}
        className={`relative rounded-2xl p-6 cursor-grab select-none transition-shadow ${
          isDragging ? 'cursor-grabbing shadow-2xl' : 'shadow-lg'
        }`}
        style={{
          backgroundColor: designSettings.background,
          border: `2px solid ${direction === 'right' 
            ? designSettings.highlight 
            : direction === 'left' 
            ? `${designSettings.text}40`
            : `${designSettings.text}20`
          }`,
          transform: `translateX(${offset}px) rotate(${offset * 0.05}deg)`,
          transition: isDragging ? 'none' : 'all 0.3s ease-out',
        }}
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
      >
        {/* Left indicator overlay */}
        <div 
          className="absolute inset-0 rounded-2xl flex items-center justify-center transition-opacity"
          style={{ 
            backgroundColor: `${designSettings.text}10`,
            opacity: direction === 'left' ? swipeProgress : 0,
          }}
        >
          <XCircle 
            className="h-16 w-16" 
            style={{ color: `${designSettings.text}60` }} 
          />
        </div>

        {/* Right indicator overlay */}
        <div 
          className="absolute inset-0 rounded-2xl flex items-center justify-center transition-opacity"
          style={{ 
            backgroundColor: `${designSettings.highlight}20`,
            opacity: direction === 'right' ? swipeProgress : 0,
          }}
        >
          <CheckCircle 
            className="h-16 w-16" 
            style={{ color: designSettings.highlight }} 
          />
        </div>

        {/* Card content */}
        <div 
          className={`text-center relative z-10 ${isGhostState ? 'opacity-40' : ''}`}
          style={{ color: designSettings.text }}
        >
          <p className="text-sm font-medium">Swipe to decide</p>
          <p className="text-xs opacity-60 mt-1">← {leftChoice.text} | {rightChoice.text} →</p>
        </div>
      </div>

      {/* Instructions */}
      <p 
        className="text-[10px] text-center mt-3 opacity-50"
        style={{ color: designSettings.text }}
      >
        Swipe card left or right to make your choice
      </p>
    </div>
  );
}
