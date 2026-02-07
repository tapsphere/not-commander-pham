/**
 * ScrubSlider - Continuous Scrub Interaction (Data Analysis / Scene 3)
 * 
 * DNA Library 3.3: "Horizontal metallic track. Background clarity tied to slider %"
 * Telemetry: Velocity Consistency - Sample X-coordinate every 16ms (60Hz)
 * 
 * Universal UX (Section 5):
 * - Typography: text-sm max
 * - Positioning: In bottom third of screen
 * - Uses Brand CSS Variables - NO hard-coded hex
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { TelemetrySample } from '../SceneAssembler';

interface ScrubSliderProps {
  targetValue?: number; // 0-100, the "correct" zone
  targetTolerance?: number; // ± tolerance for correct answer
  onValueChange?: (value: number, samples: TelemetrySample[]) => void;
  disabled?: boolean;
  isGhostState?: boolean;
}

export function ScrubSlider({
  targetValue = 65,
  targetTolerance = 10,
  onValueChange,
  disabled = false,
  isGhostState = false,
}: ScrubSliderProps) {
  const [value, setValue] = useState(30);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const samplesRef = useRef<TelemetrySample[]>([]);
  const lastSampleTime = useRef(0);

  // 60Hz sampling (every ~16ms)
  const SAMPLE_RATE_MS = 16;

  const handleMove = useCallback((clientX: number) => {
    if (!trackRef.current || disabled) return;

    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newValue = Math.round(x * 100);
    
    setValue(newValue);

    // Sample at 60Hz
    const now = performance.now();
    if (now - lastSampleTime.current >= SAMPLE_RATE_MS) {
      const sample: TelemetrySample = {
        timestamp: now,
        x: clientX,
        y: 0,
        velocity: samplesRef.current.length > 0 
          ? Math.abs(newValue - value) / SAMPLE_RATE_MS * 1000 
          : 0,
        eventType: 'touch_move',
      };
      samplesRef.current.push(sample);
      lastSampleTime.current = now;
    }
  }, [value, disabled]);

  const handleStart = useCallback((clientX: number) => {
    if (disabled) return;
    setIsDragging(true);
    samplesRef.current = [{
      timestamp: performance.now(),
      x: clientX,
      y: 0,
      eventType: 'touch_start',
    }];
    handleMove(clientX);
  }, [handleMove, disabled]);

  const handleEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      samplesRef.current.push({
        timestamp: performance.now(),
        x: 0,
        y: 0,
        eventType: 'touch_end',
      });
      onValueChange?.(value, samplesRef.current);
    }
  }, [isDragging, value, onValueChange]);

  // Mouse events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) handleMove(e.clientX);
    };
    const handleMouseUp = () => handleEnd();

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMove, handleEnd]);

  // Calculate if in target zone
  const isInTargetZone = Math.abs(value - targetValue) <= targetTolerance;
  const targetLeft = ((targetValue - targetTolerance) / 100) * 100;
  const targetWidth = (targetTolerance * 2 / 100) * 100;

  // Background blur effect - clarity tied to proximity to target
  const proximityToTarget = 1 - Math.min(Math.abs(value - targetValue) / 50, 1);
  const blurAmount = (1 - proximityToTarget) * 4;

  return (
    <div className="px-4 py-3 space-y-3">
      {/* Context indicator - text-sm per UX constraints */}
      <div 
        className={`text-xs text-center text-muted-foreground ${isGhostState ? 'opacity-40 italic' : ''}`}
      >
        Adjust the slider to find the optimal value
      </div>

      {/* Background visual that responds to slider - uses CSS variables */}
      <div 
        className="relative h-16 rounded-lg overflow-hidden bg-secondary/20"
        style={{ 
          filter: `blur(${blurAmount}px)`,
          transition: 'filter 0.1s ease-out',
        }}
      >
        <div 
          className="absolute inset-0 flex items-center justify-center bg-primary/20"
          style={{ opacity: proximityToTarget * 0.4 }}
        >
          <div 
            className="text-2xl font-bold text-foreground transition-opacity"
            style={{ opacity: proximityToTarget }}
          >
            {value}%
          </div>
        </div>
      </div>

      {/* Slider Track - Metallic appearance using CSS variables */}
      <div 
        ref={trackRef}
        className="relative h-10 rounded-full cursor-pointer select-none bg-gradient-to-r from-muted via-secondary to-muted shadow-inner"
        onMouseDown={(e) => handleStart(e.clientX)}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => isDragging && handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
      >
        {/* Target Zone Indicator */}
        <div 
          className="absolute top-0 bottom-0 rounded-full bg-accent/30 border-2 border-dashed border-accent"
          style={{
            left: `${targetLeft}%`,
            width: `${targetWidth}%`,
          }}
        />

        {/* Filled Track */}
        <div 
          className={`absolute top-0 left-0 bottom-0 rounded-l-full transition-all ${
            isInTargetZone ? 'bg-accent/60' : 'bg-primary/40'
          }`}
          style={{ width: `${value}%` }}
        />

        {/* Thumb */}
        <div 
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full shadow-lg transition-transform border-[3px] border-background ${
            isDragging ? 'scale-125' : 'scale-100'
          } ${isInTargetZone ? 'bg-accent' : 'bg-primary'}`}
          style={{ left: `${value}%` }}
        />
      </div>

      {/* Labels - text-sm per UX constraints */}
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>0%</span>
        <span className={`font-medium ${isInTargetZone ? 'text-accent' : ''}`}>
          {isInTargetZone ? '✓ Target Zone' : 'Find Target'}
        </span>
        <span>100%</span>
      </div>
    </div>
  );
}
