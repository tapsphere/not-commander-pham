/**
 * PatternGrid - Portfolio/Timeline Pattern Recognition
 * 
 * DNA Library 3.7: "5x5 grid. Correct nodes pulse in sync every 1s"
 * Telemetry: X/Y Stability - ensure finger doesn't slip onto adjacent nodes
 */

import { useState, useEffect, useCallback } from 'react';
import { DesignSettings } from '../../template-steps/types';

interface PatternGridProps {
  designSettings: DesignSettings;
  isGhostState: boolean;
  gridSize?: number;
  correctPattern?: number[]; // Indices of correct cells
  onPatternComplete?: (selectedCells: number[], isCorrect: boolean) => void;
  disabled?: boolean;
}

export function PatternGrid({
  designSettings,
  isGhostState,
  gridSize = 5,
  correctPattern = [6, 7, 8, 11, 12, 13, 16, 17, 18], // Cross pattern
  onPatternComplete,
  disabled = false,
}: PatternGridProps) {
  const [selectedCells, setSelectedCells] = useState<Set<number>>(new Set());
  const [pulsePhase, setPulsePhase] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const totalCells = gridSize * gridSize;

  // Pulse animation for hint (only in ghost state)
  useEffect(() => {
    if (!isGhostState) return;
    
    const interval = setInterval(() => {
      setPulsePhase(p => (p + 1) % 2);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isGhostState]);

  const handleCellToggle = useCallback((index: number) => {
    if (disabled) return;
    
    setSelectedCells(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, [disabled]);

  const handleCellEnter = useCallback((index: number) => {
    if (!isDragging || disabled) return;
    setSelectedCells(prev => new Set([...prev, index]));
  }, [isDragging, disabled]);

  const handleSubmit = () => {
    const selected = Array.from(selectedCells);
    const isCorrect = correctPattern.length === selected.length && 
      correctPattern.every(i => selected.includes(i));
    onPatternComplete?.(selected, isCorrect);
  };

  return (
    <div className="px-4 py-2">
      <p 
        className={`text-xs text-center mb-2 ${isGhostState ? 'opacity-40 italic' : ''}`}
        style={{ color: designSettings.text }}
      >
        Select the pattern that matches the criteria
      </p>
      
      <div 
        className="grid gap-1 mx-auto"
        style={{ 
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          maxWidth: '180px',
        }}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        {Array.from({ length: totalCells }).map((_, idx) => {
          const isSelected = selectedCells.has(idx);
          const isHint = isGhostState && correctPattern.includes(idx);
          const isPulsing = isHint && pulsePhase === 1;
          
          return (
            <button
              key={idx}
              className="aspect-square rounded transition-all"
              style={{
                backgroundColor: isSelected 
                  ? `${designSettings.highlight}` 
                  : isPulsing 
                  ? `${designSettings.primary}40`
                  : `${designSettings.secondary}20`,
                border: `1.5px solid ${isSelected 
                  ? designSettings.highlight 
                  : `${designSettings.text}15`
                }`,
                transform: isSelected ? 'scale(0.9)' : 'scale(1)',
                boxShadow: isSelected 
                  ? `0 2px 8px ${designSettings.highlight}50`
                  : 'none',
              }}
              onClick={() => handleCellToggle(idx)}
              onMouseEnter={() => handleCellEnter(idx)}
              disabled={disabled}
            />
          );
        })}
      </div>
      
      <div className="flex justify-between items-center mt-3 px-2">
        <span 
          className="text-[10px] opacity-50"
          style={{ color: designSettings.text }}
        >
          {selectedCells.size} cells selected
        </span>
        <button
          onClick={handleSubmit}
          className="text-[10px] px-3 py-1 rounded-full"
          style={{
            backgroundColor: selectedCells.size > 0 
              ? designSettings.primary 
              : `${designSettings.text}20`,
            color: selectedCells.size > 0 
              ? designSettings.background 
              : designSettings.text,
          }}
          disabled={selectedCells.size === 0 || disabled}
        >
          Check Pattern
        </button>
      </div>
    </div>
  );
}
