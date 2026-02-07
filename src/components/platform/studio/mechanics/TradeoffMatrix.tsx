/**
 * TradeoffMatrix - Strategic Viability Assessment
 * 
 * DNA Library 3.10: "2x2 Matrix (Risk vs Reward). Drag icon into quadrant"
 * Telemetry: Hesitation Jitter (micro-movements before releasing icon)
 */

import { useState, useRef, useCallback } from 'react';
import { DesignSettings } from '../../template-steps/types';
import { Target } from 'lucide-react';

interface TradeoffMatrixProps {
  designSettings: DesignSettings;
  isGhostState: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  quadrantLabels?: [string, string, string, string]; // TL, TR, BL, BR
  correctQuadrant?: 0 | 1 | 2 | 3;
  onPlacement?: (quadrant: number, position: { x: number; y: number }) => void;
  disabled?: boolean;
}

export function TradeoffMatrix({
  designSettings,
  isGhostState,
  xAxisLabel = 'Risk',
  yAxisLabel = 'Reward',
  quadrantLabels = ['Low Risk\nHigh Reward', 'High Risk\nHigh Reward', 'Low Risk\nLow Reward', 'High Risk\nLow Reward'],
  correctQuadrant = 0,
  onPlacement,
  disabled = false,
}: TradeoffMatrixProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [iconPosition, setIconPosition] = useState({ x: 80, y: -20 }); // Start above matrix
  const matrixRef = useRef<HTMLDivElement>(null);

  const getQuadrant = (x: number, y: number): number => {
    const midX = 80;
    const midY = 70;
    if (x < midX && y < midY) return 0; // TL
    if (x >= midX && y < midY) return 1; // TR
    if (x < midX && y >= midY) return 2; // BL
    return 3; // BR
  };

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !matrixRef.current || disabled) return;
    
    const rect = matrixRef.current.getBoundingClientRect();
    const x = Math.max(10, Math.min(150, clientX - rect.left));
    const y = Math.max(10, Math.min(130, clientY - rect.top));
    
    setIconPosition({ x, y });
  }, [isDragging, disabled]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (iconPosition.y > 0) {
      setPosition(iconPosition);
      const quadrant = getQuadrant(iconPosition.x, iconPosition.y);
      onPlacement?.(quadrant, iconPosition);
    }
  }, [isDragging, iconPosition, onPlacement]);

  const placedQuadrant = position ? getQuadrant(position.x, position.y) : null;
  const isCorrect = placedQuadrant === correctQuadrant;

  return (
    <div className="px-4 py-2">
      <p 
        className={`text-xs text-center mb-2 ${isGhostState ? 'opacity-40 italic' : ''}`}
        style={{ color: designSettings.text }}
      >
        Drag the marker to the best strategic position
      </p>
      
      <div className="relative mx-auto" style={{ width: '180px', height: '160px' }}>
        {/* Draggable icon (above matrix initially) */}
        {!position && (
          <div
            className={`absolute z-10 cursor-grab ${isDragging ? 'cursor-grabbing scale-125' : 'hover:scale-110'}`}
            style={{
              left: iconPosition.x - 12,
              top: iconPosition.y - 12,
              transition: isDragging ? 'none' : 'transform 0.2s',
            }}
            onMouseDown={() => !disabled && setIsDragging(true)}
            onTouchStart={() => !disabled && setIsDragging(true)}
          >
            <Target 
              className="h-6 w-6" 
              style={{ color: designSettings.primary }}
            />
          </div>
        )}
        
        {/* Matrix */}
        <div 
          ref={matrixRef}
          className="absolute bottom-0 left-0 right-0 grid grid-cols-2 gap-0.5 rounded-lg overflow-hidden"
          style={{ 
            height: '140px',
            backgroundColor: `${designSettings.text}10`,
          }}
          onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
          onMouseUp={handleEnd}
          onMouseLeave={() => isDragging && handleEnd()}
          onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchEnd={handleEnd}
        >
          {quadrantLabels.map((label, idx) => (
            <div
              key={idx}
              className="relative flex items-center justify-center p-2 transition-all"
              style={{
                backgroundColor: placedQuadrant === idx 
                  ? isCorrect 
                    ? `${designSettings.highlight}30`
                    : `${designSettings.text}20`
                  : designSettings.background,
                border: `1px solid ${designSettings.text}10`,
              }}
            >
              <span 
                className="text-[8px] text-center whitespace-pre-line leading-tight opacity-60"
                style={{ color: designSettings.text }}
              >
                {label}
              </span>
              
              {/* Placed marker */}
              {position && placedQuadrant === idx && (
                <Target 
                  className="absolute h-5 w-5"
                  style={{ 
                    color: isCorrect ? designSettings.highlight : designSettings.primary,
                    left: position.x - 10 - (idx % 2 === 0 ? 0 : 90),
                    top: position.y - 10 - (idx < 2 ? 0 : 70),
                  }}
                />
              )}
            </div>
          ))}
        </div>
        
        {/* Axis labels */}
        <div 
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px]"
          style={{ color: designSettings.text }}
        >
          {xAxisLabel} →
        </div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] origin-center"
          style={{ color: designSettings.text }}
        >
          ← {yAxisLabel}
        </div>
      </div>
      
      <p 
        className="text-[9px] text-center mt-5 opacity-50"
        style={{ color: designSettings.text }}
      >
        {position ? (isCorrect ? '✓ Good placement!' : 'Consider your choice carefully') : 'Drag marker into a quadrant'}
      </p>
    </div>
  );
}
