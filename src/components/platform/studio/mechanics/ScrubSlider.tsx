/**
 * ScrubSlider - Continuous Scrub Interaction (Data Analysis)
 * 
 * DNA Library 3.3: "Horizontal metallic track. Background clarity tied to slider %"
 * Telemetry: Velocity Consistency - Sample X-coordinate every 16ms (60Hz)
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { DesignSettings } from '../../template-steps/types';
import { TelemetrySample } from '../SceneAssembler';

interface ScrubSliderProps {
  designSettings: DesignSettings;
  isGhostState: boolean;
  targetValue?: number; // 0-100, the "correct" zone
  targetTolerance?: number; // ± tolerance for correct answer
  onValueChange?: (value: number, samples: TelemetrySample[]) => void;
  disabled?: boolean;
}

export function ScrubSlider({
  designSettings,
  isGhostState,
  targetValue = 65,
  targetTolerance = 10,
  onValueChange,
  disabled = false,
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
      {/* Context indicator */}
      <div 
        className={`text-xs text-center mb-2 ${isGhostState ? 'opacity-40 italic' : ''}`}
        style={{ color: designSettings.text }}
      >
        Adjust the slider to find the optimal value
      </div>

      {/* Background visual that responds to slider */}
      <div 
        className="relative h-16 rounded-lg overflow-hidden mb-3"
        style={{ 
          backgroundColor: `${designSettings.secondary}20`,
          filter: `blur(${blurAmount}px)`,
          transition: 'filter 0.1s ease-out',
        }}
      >
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: `${designSettings.primary}${Math.round(proximityToTarget * 40)}` }}
        >
          <div 
            className="text-2xl font-bold transition-opacity"
            style={{ 
              color: designSettings.text,
              opacity: proximityToTarget,
            }}
          >
            {value}%
          </div>
        </div>
      </div>

      {/* Slider Track */}
      <div 
        ref={trackRef}
        className="relative h-10 rounded-full cursor-pointer select-none"
        style={{
          background: `linear-gradient(90deg, 
            ${designSettings.secondary}30 0%, 
            ${designSettings.primary}50 50%, 
            ${designSettings.secondary}30 100%
          )`,
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
        }}
        onMouseDown={(e) => handleStart(e.clientX)}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => isDragging && handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
      >
        {/* Target Zone Indicator */}
        <div 
          className="absolute top-0 bottom-0 rounded-full opacity-30"
          style={{
            left: `${targetLeft}%`,
            width: `${targetWidth}%`,
            backgroundColor: designSettings.highlight,
            border: `2px dashed ${designSettings.highlight}`,
          }}
        />

        {/* Filled Track */}
        <div 
          className="absolute top-0 left-0 bottom-0 rounded-l-full transition-all"
          style={{
            width: `${value}%`,
            backgroundColor: isInTargetZone 
              ? `${designSettings.highlight}80`
              : `${designSettings.primary}60`,
          }}
        />

        {/* Thumb */}
        <div 
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full shadow-lg transition-transform ${
            isDragging ? 'scale-125' : 'scale-100'
          }`}
          style={{
            left: `${value}%`,
            backgroundColor: isInTargetZone ? designSettings.highlight : designSettings.primary,
            boxShadow: `0 4px 12px ${designSettings.primary}50`,
            border: `3px solid ${designSettings.background}`,
          }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-[10px]" style={{ color: designSettings.text }}>
        <span className="opacity-50">0%</span>
        <span className={`font-medium ${isInTargetZone ? '' : 'opacity-50'}`}>
          {isInTargetZone ? '✓ Target Zone' : 'Find Target'}
        </span>
        <span className="opacity-50">100%</span>
      </div>
    </div>
  );
}
