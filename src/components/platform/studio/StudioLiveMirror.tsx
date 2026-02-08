/**
 * StudioLiveMirror - DNA Library v1.0 Implementation
 * 
 * Implements the 3-Way Stitch (Section 6):
 * - Brain (Logic): Game Mechanic → Scoring/Validation
 * - Body (Interaction): Mobile Interaction → UI + 60Hz Telemetry
 * - Soul (Content): Action Cue → Top 30% Context Zone
 * 
 * Universal UX (Section 5):
 * - 30% Top: Action Cue/Text (text-sm, Slate-500)
 * - 50% Middle: Visuals/Mascot
 * - 20% Bottom: Interaction (metallic track, buttons)
 * 
 * Apple Studio Aesthetic (Section 1):
 * - glass-card, glass-button classes
 * - Brand CSS variables (no hard-coded hex)
 * 
 * Telegram Mini App Preview (SDK 8.0+):
 * - Native header bar with back button
 * - Main button simulation
 * - Safe area inset preview
 */

import { SceneData, DesignSettings, SubCompetency, TemplateFormData } from '../template-steps/types';
import { Clock, ChevronLeft, Undo, Sparkles, Play, Activity } from 'lucide-react';
import { useStudioTheme } from './StudioThemeContext';
import { useState, useEffect, useRef } from 'react';
import { 
  performThreeWayStitch, 
  initializeBiometricTrace,
  ThreeWayStitch,
  BiometricTrace,
  TelemetrySample,
  UNIVERSAL_LAYOUT,
} from './SceneAssembler';
import { ScrubSlider } from './mechanics/ScrubSlider';
import { TelegramNativeOverlay, TelegramPreviewToggle } from './TelegramNativeOverlay';

interface StudioLiveMirrorProps {
  formData: TemplateFormData;
  scenes: SceneData[];
  currentSceneIndex: number;
  setCurrentSceneIndex: (index: number) => void;
  designSettings: DesignSettings;
  subCompetencies: SubCompetency[];
  mascotFile?: File | null;
  logoFile?: File | null;
  showScene0?: boolean;
  // Telegram Mini App Preview
  telegramPreviewEnabled?: boolean;
  onTelegramPreviewToggle?: () => void;
}

// Default Scene 3 (Data Analysis) SubCompetency for demo
const SCENE_3_DATA_ANALYSIS: SubCompetency = {
  id: 'scene-3-data-analysis',
  statement: 'Analyze patterns in complex data sets to identify actionable insights',
  competency_id: 'data-analysis-comp',
  action_cue: 'Adjust the slider to filter the noise and reveal the optimal data threshold.',
  game_mechanic: 'Data Analysis (Noise Filter)',
  game_loop: 'Continuous Scrub',
  validator_type: 'precision',
  player_action: 'Scrub slider to find target zone',
  scoring_formula_level_1: 'accuracy * time_bonus',
  scoring_formula_level_2: 'accuracy * time_bonus * stability',
  scoring_formula_level_3: 'accuracy * time_bonus * stability * first_attempt',
  backend_data_captured: { velocity: true, jitter: true, target_accuracy: true },
  display_order: 3,
};

export function StudioLiveMirror({
  formData,
  scenes,
  currentSceneIndex,
  setCurrentSceneIndex,
  designSettings,
  subCompetencies,
  mascotFile,
  logoFile,
  showScene0 = false,
  telegramPreviewEnabled = false,
  onTelegramPreviewToggle,
}: StudioLiveMirrorProps) {
  const { isDarkMode } = useStudioTheme();
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [mascotPreviewUrl, setMascotPreviewUrl] = useState<string | null>(null);
  
  // Telemetry state (DNA Library Section 2 & 3)
  const [biometricTrace, setBiometricTrace] = useState<BiometricTrace | null>(null);
  const [verifiedSignals, setVerifiedSignals] = useState(0);
  const telemetrySamplesRef = useRef<TelemetrySample[]>([]);

  // Create preview URLs for uploaded files
  useEffect(() => {
    if (logoFile) {
      const url = URL.createObjectURL(logoFile);
      setLogoPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setLogoPreviewUrl(null);
    }
  }, [logoFile]);

  useEffect(() => {
    if (mascotFile) {
      const url = URL.createObjectURL(mascotFile);
      setMascotPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setMascotPreviewUrl(null);
    }
  }, [mascotFile]);

  const currentScene = scenes[currentSceneIndex] || null;
  const currentSub = currentScene 
    ? subCompetencies.find(s => s.id === currentScene.subCompetencyId) 
    : SCENE_3_DATA_ANALYSIS; // Default to Scene 3 for demo

  // Perform 3-Way Stitch (DNA Library Section 6)
  const stitch: ThreeWayStitch = currentSub 
    ? performThreeWayStitch(currentSub)
    : performThreeWayStitch(SCENE_3_DATA_ANALYSIS);

  const progressPercent = scenes.length > 0 
    ? ((currentSceneIndex + 1) / scenes.length) * 100 
    : 50; // Scene 3 of 6 = 50%

  // Initialize telemetry on first interaction
  const handleInteractionStart = () => {
    if (!biometricTrace) {
      const trace = initializeBiometricTrace(currentSceneIndex, stitch.brain.mechanicType);
      setBiometricTrace(trace);
      console.log('[Telemetry] Initialized biometricTrace:', trace.sessionId);
    }
  };

  // Handle slider value change with telemetry
  const handleSliderChange = (value: number, samples: TelemetrySample[]) => {
    telemetrySamplesRef.current = samples;
    setVerifiedSignals(prev => prev + 1);
    console.log(`[Telemetry] Value: ${value}%, Samples: ${samples.length}, Verified: ${verifiedSignals + 1}`);
  };

  // Scene 0 intro screen (Brand Identity Preview)
  if (showScene0) {
    return (
      <Scene0Preview
        formData={formData}
        designSettings={designSettings}
        logoPreviewUrl={logoPreviewUrl}
        mascotPreviewUrl={mascotPreviewUrl}
        isDarkMode={isDarkMode}
      />
    );
  }

// Main Scene Preview with 30/50/20 Layout
  return (
    <div className="h-full flex flex-col items-center justify-start pt-4 overflow-hidden">
      {/* Scene Label + TMA Toggle */}
      <div className="flex items-center justify-between w-full px-4 mb-3">
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Scene 3 · Data Analysis
        </span>
        {onTelegramPreviewToggle && (
          <TelegramPreviewToggle 
            isEnabled={telegramPreviewEnabled} 
            onToggle={onTelegramPreviewToggle} 
          />
        )}
      </div>
      
      <MobileFrame 
        isDarkMode={isDarkMode}
        telegramMode={telegramPreviewEnabled}
        headerColor={designSettings.background}
        sceneIndex={currentSceneIndex}
        onNavigateBack={() => setCurrentSceneIndex(Math.max(0, currentSceneIndex - 1))}
      >
        <div 
          className="h-full flex flex-col overflow-hidden pt-6"
          onMouseDown={handleInteractionStart}
          onTouchStart={handleInteractionStart}
        >
          {/* ═══════════════════════════════════════════════════════════════
              TOP 30% - Context Zone (Action Cue / Soul)
              DNA Library: text-sm or text-base, Slate-500
          ═══════════════════════════════════════════════════════════════ */}
          <div 
            className="flex-none px-4"
            style={{ height: `${UNIVERSAL_LAYOUT.topZone}%` }}
          >
            {/* Header Bar */}
            <div className="glass-card px-3 py-2 flex items-center gap-3 mb-2">
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-foreground truncate">
                  Data Analysis
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {stitch.brain.mechanicType.replace(/_/g, ' ')}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>30s</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-2">
              <div 
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Action Cue (Soul) - text-sm per DNA Library */}
            <div className="glass-card p-3">
              <p className="text-sm text-foreground leading-relaxed">
                {stitch.soul.actionCue}
              </p>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              MIDDLE 50% - Visual Stage (Mascot/Feedback Area)
              DNA Library: Central visual area, blur tied to slider
          ═══════════════════════════════════════════════════════════════ */}
          <div 
            className="flex-none flex items-center justify-center px-4"
            style={{ height: `${UNIVERSAL_LAYOUT.middleZone}%` }}
          >
            <div className="w-full">
              {/* Continuous Scrub Mechanic (Scene 3) */}
              <ScrubSlider
                targetValue={65}
                targetTolerance={10}
                onValueChange={handleSliderChange}
                isGhostState={false}
              />
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              BOTTOM 20% - Interaction Zone
              DNA Library: Telemetry buttons + Submit
          ═══════════════════════════════════════════════════════════════ */}
          <div 
            className="flex-none px-4 pb-4 flex flex-col justify-end"
            style={{ height: `${UNIVERSAL_LAYOUT.bottomZone}%` }}
          >
            {/* Telemetry Buttons (LOCKED - Mandatory for biometric jitter tracking) */}
            <div className="flex gap-2 mb-3">
              <button className="glass-button px-3 py-1.5 rounded-lg text-xs text-muted-foreground flex items-center gap-1">
                <Undo className="h-3 w-3" />
                Undo
              </button>
              <button className="glass-button px-3 py-1.5 rounded-lg text-xs text-muted-foreground flex items-center gap-1">
                <ChevronLeft className="h-3 w-3" />
                Back
              </button>
              {/* Telemetry indicator */}
              <div className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
                <Activity className="h-3 w-3" />
                <span>{verifiedSignals} signals</span>
              </div>
            </div>

            {/* Submit Button */}
            <button className="w-full py-3 rounded-xl font-semibold text-sm bg-primary text-primary-foreground shadow-lg transition-all hover:opacity-90">
              Submit Answer
            </button>
          </div>
        </div>
      </MobileFrame>

      {/* Scene Navigator Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {[0, 1, 2, 3, 4, 5].map((idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSceneIndex(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer hover:scale-125 ${
              idx === 2 // Scene 3 is index 2
                ? 'scale-125 ring-2 ring-offset-2 ring-primary bg-primary' 
                : 'opacity-40 hover:opacity-70 bg-muted-foreground'
            }`}
            title={`Scene ${idx + 1}`}
          />
        ))}
      </div>

      {/* Debug info */}
      <div className="mt-3 text-[10px] text-muted-foreground text-center space-y-1">
        <div>3-Way Stitch: {stitch.brain.mechanicType} → {stitch.body.componentName}</div>
        <div>Telemetry: {stitch.body.telemetryConfig.sampleRate}Hz ({stitch.body.telemetryConfig.type})</div>
      </div>
    </div>
  );
}

// ============================================================================
// Scene 0 Preview Component
// ============================================================================

function Scene0Preview({
  formData,
  designSettings,
  logoPreviewUrl,
  mascotPreviewUrl,
  isDarkMode,
}: {
  formData: TemplateFormData;
  designSettings: DesignSettings;
  logoPreviewUrl: string | null;
  mascotPreviewUrl: string | null;
  isDarkMode: boolean;
}) {
  const isGhostState = !formData.name.trim();
  const displayName = formData.name || 'Competency Validator';

  return (
    <div className="h-full flex flex-col items-center justify-start pt-4 overflow-hidden">
      <div className="text-center mb-3">
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Scene 0 · Brand Intro
        </span>
      </div>
      
      <MobileFrame isDarkMode={isDarkMode}>
        <div className="h-full flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-background">
          {/* Animated gradient background */}
          <div className="absolute inset-0 opacity-20 bg-gradient-radial from-primary/30 to-transparent" />
          
          {/* Logo or Mascot display */}
          <div className="relative z-10 mb-6">
            {logoPreviewUrl ? (
              <div className="glass-card w-20 h-20 rounded-2xl overflow-hidden shadow-lg flex items-center justify-center">
                <img 
                  src={logoPreviewUrl} 
                  alt="Brand Logo" 
                  className="w-16 h-16 object-contain"
                />
              </div>
            ) : mascotPreviewUrl ? (
              <div className="glass-card w-24 h-24 rounded-full flex items-center justify-center animate-pulse">
                <Sparkles className="h-10 w-10 text-primary animate-spin" style={{ animationDuration: '3s' }} />
              </div>
            ) : (
              <div className="glass-card w-20 h-20 rounded-2xl flex items-center justify-center border-2 border-dashed border-border">
                <Play className="h-8 w-8 text-primary" />
              </div>
            )}
          </div>
          
          {/* Title */}
          <h2 className={`text-xl font-bold mb-2 relative z-10 text-foreground ${isGhostState ? 'opacity-40 italic' : ''}`}>
            {displayName}
          </h2>
          
          {/* Subtitle */}
          <p className="text-sm text-muted-foreground mb-8 max-w-[200px] relative z-10">
            Test critical thinking and decision-making skills
          </p>
          
          {/* Start Button */}
          <button className="glass-button px-10 py-3.5 rounded-xl font-semibold text-sm bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 relative z-10">
            Start Challenge
          </button>
        </div>
      </MobileFrame>
      
      {/* Scene 0 indicator */}
      <div className="flex justify-center gap-2 mt-4">
        <div className="w-3 h-3 rounded-full ring-2 ring-offset-2 ring-primary bg-primary" />
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div key={idx} className="w-2.5 h-2.5 rounded-full opacity-20 bg-muted-foreground" />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Mobile Frame Component - Apple Studio Aesthetic + Telegram Native Preview
// ============================================================================

interface MobileFrameProps {
  children: React.ReactNode;
  isDarkMode: boolean;
  telegramMode?: boolean;
  headerColor?: string;
  sceneIndex?: number;
  onNavigateBack?: () => void;
  onSubmit?: () => void;
}

function MobileFrame({ 
  children, 
  isDarkMode,
  telegramMode = false,
  headerColor = '#1C1C1D',
  sceneIndex = 0,
  onNavigateBack,
  onSubmit,
}: MobileFrameProps) {
  return (
    <div 
      className={`mx-auto w-[280px] h-[520px] rounded-[2.5rem] border-[10px] shadow-2xl overflow-hidden relative bg-background ${
        isDarkMode 
          ? 'border-slate-700 shadow-black/50' 
          : 'border-slate-300 shadow-slate-400/30'
      }`}
    >
      {/* Telegram Native Overlay (when enabled) */}
      <TelegramNativeOverlay
        isEnabled={telegramMode}
        headerColor={headerColor}
        sceneIndex={sceneIndex}
        showBackButton={sceneIndex >= 2}
        showMainButton={sceneIndex === 7}
        mainButtonText="SUBMIT PERFORMANCE"
        onBackClick={onNavigateBack}
        onMainButtonClick={onSubmit}
      />
      
      {/* Notch (hidden in TMA mode, replaced by Telegram header) */}
      {!telegramMode && (
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 rounded-b-xl z-10 ${
          isDarkMode ? 'bg-slate-700' : 'bg-slate-300'
        }`} />
      )}
      
      {/* Content with safe area padding for TMA mode */}
      <div className={telegramMode ? 'pt-[44px] pb-0' : ''}>
        {children}
      </div>
    </div>
  );
}
