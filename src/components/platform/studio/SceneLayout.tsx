/**
 * SceneLayout - Universal UX Layout (DNA Library Section 5)
 * 
 * Enforces the 30/50/20 layout ratio:
 * - Top 30%: Context/Action Cue zone (text-sm typography)
 * - Middle 50%: Visuals/Mascot zone
 * - Bottom 20%: Interaction zone (buttons/sliders in bottom third)
 * 
 * Uses Brand CSS Variables - NO hard-coded hex codes
 */

import { ReactNode } from 'react';
import { ChevronLeft, Undo, Clock } from 'lucide-react';
import { UNIVERSAL_LAYOUT, ThreeWayStitch } from './SceneAssembler';

interface SceneLayoutProps {
  stitch: ThreeWayStitch;
  children: ReactNode; // Interaction component goes here
  sceneIndex: number;
  totalScenes: number;
  timeLimit: number;
  onBack?: () => void;
  onUndo?: () => void;
  isPreview?: boolean;
}

/**
 * Main Scene Layout Component
 * Enforces DNA Library Section 5 constraints
 */
export function SceneLayout({
  stitch,
  children,
  sceneIndex,
  totalScenes,
  timeLimit,
  onBack,
  onUndo,
  isPreview = true,
}: SceneLayoutProps) {
  const progressPercent = ((sceneIndex + 1) / totalScenes) * 100;

  return (
    <div className="h-full flex flex-col bg-background text-foreground">
      {/* TOP ZONE (30%) - Context/Action Cue */}
      <div 
        className="flex-none"
        style={{ height: `${UNIVERSAL_LAYOUT.topZone}%` }}
      >
        {/* Header */}
        <div className="px-4 py-2 flex items-center gap-3 bg-secondary/30">
          <ChevronLeft className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-foreground truncate">
              Scene {sceneIndex + 1}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {stitch.brain.mechanicType.replace(/_/g, ' ')}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-4 py-2">
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div 
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">
              Scene {sceneIndex + 1} of {totalScenes}
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeLimit}s
            </span>
          </div>
        </div>

        {/* Action Cue / Context Text (Soul) */}
        <div className="px-4 py-2">
          <div className="rounded-xl p-3 bg-card border border-border">
            <p className="text-sm text-foreground leading-relaxed">
              {stitch.soul.actionCue}
            </p>
          </div>
        </div>
      </div>

      {/* MIDDLE ZONE (50%) - Visuals/Mascot */}
      <div 
        className="flex-none flex items-center justify-center px-4"
        style={{ height: `${UNIVERSAL_LAYOUT.middleZone}%` }}
      >
        {/* Interaction component renders here */}
        <div className="w-full">
          {children}
        </div>
      </div>

      {/* BOTTOM ZONE (20%) - Interaction Controls */}
      <div 
        className="flex-none px-4 pb-4 flex flex-col justify-end"
        style={{ height: `${UNIVERSAL_LAYOUT.bottomZone}%` }}
      >
        {/* Telemetry Buttons (LOCKED - Mandatory for biometric jitter tracking) */}
        <div className="flex gap-2 mb-3">
          <button 
            onClick={onUndo}
            className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground bg-muted/50 hover:bg-muted transition-colors flex items-center gap-1"
          >
            <Undo className="h-3 w-3" />
            Undo
          </button>
          <button 
            onClick={onBack}
            className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground bg-muted/50 hover:bg-muted transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="h-3 w-3" />
            Back
          </button>
        </div>

        {/* Submit Button */}
        <button
          className="w-full py-3 rounded-xl font-semibold text-sm bg-primary text-primary-foreground shadow-lg transition-all hover:opacity-90"
        >
          Submit Answer
        </button>
      </div>
    </div>
  );
}

/**
 * Standalone Context Zone Component
 * For use when you need just the top 30%
 */
export function ContextZone({ 
  actionCue, 
  scenario 
}: { 
  actionCue: string; 
  scenario?: string;
}) {
  return (
    <div className="px-4 py-3">
      <div className="rounded-xl p-4 bg-card border border-border">
        <p className="text-sm text-foreground leading-relaxed">
          {actionCue}
        </p>
        {scenario && (
          <p className="text-xs text-muted-foreground mt-2">
            {scenario}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Standalone Interaction Zone Component
 * For use when you need just the bottom 20%
 */
export function InteractionZone({ 
  children,
  onSubmit,
  onBack,
  onUndo,
  submitLabel = 'Submit Answer',
}: { 
  children?: ReactNode;
  onSubmit?: () => void;
  onBack?: () => void;
  onUndo?: () => void;
  submitLabel?: string;
}) {
  return (
    <div className="px-4 pb-4">
      {/* Telemetry Buttons (LOCKED) */}
      <div className="flex gap-2 mb-3">
        <button 
          onClick={onUndo}
          className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground bg-muted/50 hover:bg-muted transition-colors flex items-center gap-1"
        >
          <Undo className="h-3 w-3" />
          Undo
        </button>
        <button 
          onClick={onBack}
          className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground bg-muted/50 hover:bg-muted transition-colors flex items-center gap-1"
        >
          <ChevronLeft className="h-3 w-3" />
          Back
        </button>
      </div>

      {children}

      {/* Submit Button */}
      <button
        onClick={onSubmit}
        className="w-full py-3 rounded-xl font-semibold text-sm bg-primary text-primary-foreground shadow-lg transition-all hover:opacity-90"
      >
        {submitLabel}
      </button>
    </div>
  );
}
