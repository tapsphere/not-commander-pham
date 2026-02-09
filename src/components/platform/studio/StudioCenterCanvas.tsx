import { useState, useEffect, useRef, useCallback } from 'react';
import { SceneData, DesignSettings, SubCompetency, TemplateFormData } from '../template-steps/types';
import { Clock, ChevronLeft, ChevronRight, Play, Trophy, Award, RotateCcw, Send } from 'lucide-react';
import { useStudioTheme } from './StudioThemeContext';
import { MechanicPreview } from './MechanicPreview';
import { ScrubSlider } from './mechanics/ScrubSlider';
import { TelegramNativeOverlay, TelegramPreviewToggle } from './TelegramNativeOverlay';
import { 
  performThreeWayStitch, 
  initializeBiometricTrace,
  TelemetrySample,
  UNIVERSAL_LAYOUT,
} from './SceneAssembler';
import { toast } from 'sonner';
import { useUndoHistory, HistoryAction } from '@/hooks/useUndoHistory';

interface StudioCenterCanvasProps {
  currentSceneIndex: number;
  formData: TemplateFormData;
  scenes: SceneData[];
  designSettings: DesignSettings;
  subCompetencies: SubCompetency[];
  mascotFile?: File | null;
  logoFile?: File | null;
  onSceneChange?: (index: number) => void;
  // Telegram Mini App Preview
  telegramPreviewEnabled?: boolean;
  onTelegramPreviewToggle?: () => void;
}

// Industry-specific placeholders
const INDUSTRY_PLACEHOLDERS: Record<string, { name: string; description: string }> = {
  'Marketing': { name: 'Brand Campaign Audit', description: 'Evaluate marketing campaign effectiveness' },
  'Finance': { name: 'Budget Allocation Challenge', description: 'Strategic financial decision-making' },
  'Healthcare': { name: 'Patient Care Protocol', description: 'Clinical decision-making scenarios' },
  'Retail': { name: 'Luxury Collection Audit', description: 'Customer journey optimization' },
  'Technology': { name: 'Security Threat Response', description: 'Cybersecurity threat response' },
  'default': { name: 'Competency Validator', description: 'Test your decision-making skills' },
};

// Canvas state for undo/redo tracking
interface CanvasState {
  selectedChoiceId: string | null;
  sliderValue: number;
  currentSceneIndex: number;
}

export function StudioCenterCanvas({
  currentSceneIndex,
  formData,
  scenes,
  designSettings,
  subCompetencies,
  mascotFile,
  logoFile,
  onSceneChange,
  telegramPreviewEnabled = false,
  onTelegramPreviewToggle,
}: StudioCenterCanvasProps) {
  const { isDarkMode } = useStudioTheme();
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  
  // Player selection state (toggle logic)
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  
  // Undo/Redo system for canvas actions
  const {
    state: canvasState,
    setState: setCanvasState,
    undo,
    redo,
    canUndo,
    canRedo,
    history,
  } = useUndoHistory<CanvasState>({
    selectedChoiceId: null,
    sliderValue: 50,
    currentSceneIndex: 0,
  });
  
  // Telemetry state (DNA Library Section 2 & 3)
  const [verifiedSignals, setVerifiedSignals] = useState(0);
  const telemetrySamplesRef = useRef<TelemetrySample[]>([]);

  // Create preview URL for logo
  useEffect(() => {
    if (logoFile) {
      const url = URL.createObjectURL(logoFile);
      setLogoPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setLogoPreviewUrl(null);
    }
  }, [logoFile]);
  
  // Reset selection when scene changes
  useEffect(() => {
    setSelectedChoiceId(null);
  }, [currentSceneIndex]);

  const placeholder = INDUSTRY_PLACEHOLDERS[formData.industry] || INDUSTRY_PLACEHOLDERS['default'];
  const isGhostState = !formData.name.trim();
  const displayName = formData.name || placeholder.name;
  const displayDescription = formData.description || placeholder.description;

  // Get current scene data for gameplay screens
  const currentScene = currentSceneIndex > 0 && currentSceneIndex < 7 
    ? scenes[currentSceneIndex - 1] 
    : null;
  const currentSubCompetency = currentScene 
    ? subCompetencies.find(s => s.id === currentScene.subCompetencyId)
    : null;

  const progressPercent = scenes.length > 0 
    ? (currentSceneIndex / 7) * 100 
    : 15;
    
  // Dynamic XP values from PlayOps Framework (Tab 4)
  // Based on proficiency level - defaults to L2 (Proficient) for preview
  const XP_VALUES = { L1: 100, L2: 250, L3: 500 } as const;
  const currentPXP = XP_VALUES.L2; // Shows expected L2 award in preview
  
  // Dynamic time limit from scene or sub-competency
  const currentTimeLimit = currentScene?.timeLimit || 30;

  // Render Intro Screen (Scene 0)
  const renderIntroScreen = () => (
    <div 
      className="h-full flex flex-col items-center justify-center p-6 text-center relative overflow-hidden"
      style={{ backgroundColor: designSettings.background }}
    >
      {/* Gradient background effect */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{ 
          background: `radial-gradient(circle at 50% 30%, ${designSettings.primary}50, transparent 70%)`,
        }}
      />
      
      {/* Logo */}
      <div className="relative z-10 mb-6">
        {logoPreviewUrl ? (
          <div 
            className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg flex items-center justify-center"
            style={{ backgroundColor: `${designSettings.primary}15` }}
          >
            <img 
              src={logoPreviewUrl} 
              alt="Brand Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
        ) : (
          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center border-2 border-dashed"
            style={{ 
              borderColor: `${designSettings.primary}40`,
              backgroundColor: `${designSettings.primary}10`,
            }}
          >
            <Play className="h-8 w-8" style={{ color: designSettings.primary }} />
          </div>
        )}
      </div>
      
      <h2 
        className={`text-xl font-bold mb-2 relative z-10 ${isGhostState ? 'opacity-40 italic' : ''}`}
        style={{ color: designSettings.text }}
      >
        {displayName}
      </h2>
      
      <p 
        className={`text-sm opacity-70 mb-8 max-w-[200px] relative z-10 ${isGhostState ? 'opacity-30' : ''}`}
        style={{ color: designSettings.text }}
      >
        {displayDescription}
      </p>
      
      <button
        className="px-10 py-3.5 rounded-xl font-semibold text-sm shadow-lg relative z-10"
        style={{
          backgroundColor: designSettings.primary,
          color: designSettings.background,
          boxShadow: `0 8px 24px ${designSettings.primary}40`,
        }}
      >
        Start Challenge
      </button>
      
      {/* Color swatches */}
      <div className="absolute bottom-4 flex gap-2">
        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: designSettings.primary }} />
        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: designSettings.secondary }} />
        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: designSettings.accent }} />
      </div>
    </div>
  );

  // Handle slider value change with telemetry
  const handleSliderChange = (value: number, samples: TelemetrySample[]) => {
    telemetrySamplesRef.current = samples;
    setVerifiedSignals(prev => prev + 1);
    console.log(`[Telemetry] Value: ${value}%, Samples: ${samples.length}, Verified: ${verifiedSignals + 1}`);
  };

  // Check if current scene should use DNA Library mechanic (Scene 3 = Data Analysis)
  const isDataAnalysisScene = currentSceneIndex === 3;

  // Render Gameplay Screen (Scenes 1-6)
  const renderGameplayScreen = () => {
    const displayQuestion = currentScene?.question || 'Select the most effective approach for this scenario...';
    const ghostChoices = [
      { id: '1', text: 'Strategic Response A', isCorrect: true },
      { id: '2', text: 'Alternative Approach B', isCorrect: false },
      { id: '3', text: 'Tactical Option C', isCorrect: false },
      { id: '4', text: 'Fallback Decision D', isCorrect: false },
    ];
    const displayChoices = currentScene?.choices || ghostChoices;
    const currentMechanic = currentSubCompetency?.game_mechanic || null;

    // Scene 3 uses DNA Library 30/50/20 layout with ScrubSlider
    // Updated with Aero Studio Standard header/footer
    if (isDataAnalysisScene) {
      const actionCue = currentSubCompetency?.action_cue || 
        'Adjust the slider to filter the noise and reveal the optimal data threshold.';
      
      return (
        <div className="h-full flex flex-col overflow-hidden relative" style={{ 
          background: currentScene?.backgroundPrompt?.trim()
            ? `linear-gradient(135deg, ${designSettings.background}, ${designSettings.primary}20, ${designSettings.secondary}15, ${designSettings.accent}10)`
            : designSettings.background
        }}>
          {/* ═══════════════════════════════════════════════════════════════
              AERO STATUS BAR HEADER
              Left: PXP Counter | Center: 30s Timer | Right: Scene Progress
          ═══════════════════════════════════════════════════════════════ */}
          <div className="flex-none px-4 pt-6 pb-2">
            <div 
              className="rounded-xl px-4 py-2.5 flex items-center justify-between"
              style={{ backgroundColor: `${designSettings.primary}10` }}
            >
              {/* Left: PXP Counter - Dynamic from PlayOps Framework Tab 4 */}
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold" style={{ color: designSettings.primary }}>{currentPXP}</span>
                <span className="text-[10px] font-medium opacity-70" style={{ color: designSettings.text }}>PXP</span>
              </div>
              
              {/* Center: Timer - Dynamic from scene.timeLimit */}
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" style={{ color: designSettings.text }} />
                <span className="text-sm font-bold" style={{ color: designSettings.text }}>{currentTimeLimit}s</span>
              </div>
              
              {/* Right: Scene Progress */}
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold" style={{ color: designSettings.text }}>{currentSceneIndex}</span>
                <span className="text-[10px] opacity-60" style={{ color: designSettings.text }}>OF</span>
                <span className="text-xs font-bold" style={{ color: designSettings.text }}>7</span>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              TOP 30% - Context Zone (Action Cue / Soul)
              DNA Library: text-sm, Scrollable if overflow
          ═══════════════════════════════════════════════════════════════ */}
          <div 
            className="flex-none px-4"
            style={{ height: `${UNIVERSAL_LAYOUT.topZone}%` }}
          >
            {/* Progress Bar */}
            <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ backgroundColor: `${designSettings.text}15` }}>
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%`, backgroundColor: designSettings.primary }}
              />
            </div>

            {/* Action Cue (Soul) - text-sm per Aero Standard */}
            <div 
              className="rounded-xl p-3"
              style={{ backgroundColor: `${designSettings.secondary}15` }}
            >
              <p className="text-sm leading-relaxed" style={{ color: designSettings.text }}>
                {actionCue}
              </p>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              MIDDLE 50% - Visual Stage (Mascot/Feedback Area)
              DNA Library: Central visual area, Scrollable if overflow
          ═══════════════════════════════════════════════════════════════ */}
          <div 
            className="flex-1 overflow-auto px-4 flex items-center justify-center"
          >
            <div className="w-full">
              {/* Continuous Scrub Mechanic (Scene 3) - pass designSettings for branding */}
              <ScrubSlider
                targetValue={65}
                targetTolerance={10}
                onValueChange={handleSliderChange}
                isGhostState={!currentScene}
                designSettings={designSettings}
              />
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              AERO NAVIGATION FOOTER
              Single row: [ ← Back ] [ Next → ] (No Undo button)
          ═══════════════════════════════════════════════════════════════ */}
          <div className="flex-none px-4 pb-4">
            <div className="flex gap-3">
              <button 
                className="flex-1 py-3 rounded-xl font-semibold text-sm border flex items-center justify-center gap-2 transition-all hover:opacity-80"
                style={{ 
                  borderColor: `${designSettings.text}30`, 
                  color: designSettings.text,
                  backgroundColor: `${designSettings.background}`
                }}
                onClick={() => onSceneChange?.(currentSceneIndex - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
              <button 
                className="flex-1 py-3 rounded-xl font-semibold text-sm shadow-lg transition-all flex items-center justify-center gap-2 hover:opacity-90"
                style={{ 
                  backgroundColor: designSettings.primary, 
                  color: designSettings.background,
                  boxShadow: `0 4px 12px ${designSettings.primary}40`
                }}
                onClick={() => onSceneChange?.(currentSceneIndex + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Determine if this is the last gameplay scene (Scene 6 leads to Scene 7)
    const isLastGameplayScene = currentSceneIndex === 6;

    // Default gameplay screen for other scenes (1, 2, 4, 5, 6)
    // Updated with Aero Studio Standard
    return (
      <div className="h-full overflow-hidden flex flex-col relative" style={{ 
        background: currentScene?.backgroundPrompt?.trim()
          ? `linear-gradient(${135 + (currentSceneIndex * 15)}deg, ${designSettings.background}, ${designSettings.primary}20, ${designSettings.secondary}15, ${designSettings.accent}10)`
          : designSettings.background
      }}>
        {/* ═══════════════════════════════════════════════════════════════
            AERO STATUS BAR HEADER
            Left: PXP Counter | Center: 30s Timer | Right: Scene Progress
        ═══════════════════════════════════════════════════════════════ */}
        <div className="flex-none px-4 pt-6 pb-2">
          <div 
            className="rounded-xl px-4 py-2.5 flex items-center justify-between"
            style={{ backgroundColor: `${designSettings.primary}10` }}
          >
              {/* Left: PXP Counter - Dynamic from PlayOps Framework Tab 4 */}
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold" style={{ color: designSettings.primary }}>{currentPXP}</span>
                <span className="text-[10px] font-medium opacity-70" style={{ color: designSettings.text }}>PXP</span>
              </div>
              
              {/* Center: Timer - Dynamic from scene.timeLimit */}
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" style={{ color: designSettings.text }} />
                <span className="text-sm font-bold" style={{ color: designSettings.text }}>{currentTimeLimit}s</span>
              </div>
            
            {/* Right: Scene Progress */}
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold" style={{ color: designSettings.text }}>{currentSceneIndex}</span>
              <span className="text-[10px] opacity-60" style={{ color: designSettings.text }}>OF</span>
              <span className="text-xs font-bold" style={{ color: designSettings.text }}>7</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex-none px-4 py-1">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${designSettings.text}15` }}>
            <div 
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%`, backgroundColor: designSettings.primary }}
            />
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            TOP ZONE - Action Cue (text-sm per Aero Standard)
        ═══════════════════════════════════════════════════════════════ */}
        <div className="flex-none px-4 py-2">
          <div 
            className="rounded-xl p-3"
            style={{ backgroundColor: `${designSettings.secondary}15` }}
          >
            <p 
              className={`text-sm leading-relaxed ${!currentScene ? 'opacity-40 italic' : ''}`}
              style={{ color: designSettings.text }}
            >
              {displayQuestion}
            </p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            MIDDLE ZONE - Scrollable Interaction Stage (50%)
            Click-to-Undo: Clicking active choice deselects it
        ═══════════════════════════════════════════════════════════════ */}
        <div className="flex-1 overflow-auto px-4">
          <MechanicPreview
            mechanic={currentMechanic}
            choices={displayChoices}
            designSettings={designSettings}
            isGhostState={!currentScene}
            selectedChoiceId={selectedChoiceId}
            onChoiceSelect={(id) => {
              // AERO Click-to-Undo: Clicking same choice deselects it
              if (id === selectedChoiceId) {
                setSelectedChoiceId(null);
              } else {
                setSelectedChoiceId(id);
              }
            }}
            // Visual Choice Mode props
            displayMode={currentScene?.displayMode}
            gridLayout={currentScene?.gridLayout}
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            AERO NAVIGATION FOOTER
            Single row: [ ← Back ] [ Next → ] (Scenes 1-5)
            Scene 6: [ ← Back ] [ Submit ]
            No Undo/Redo buttons - Click-to-Undo via choice interaction
        ═══════════════════════════════════════════════════════════════ */}
        <div className="flex-none px-4 pb-4 pt-2">
          <div className="flex gap-3">
            <button 
              className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-80"
              style={{ 
                backgroundColor: designSettings.background, 
                color: designSettings.text,
                border: `1px solid ${designSettings.text}25`
              }}
              onClick={() => onSceneChange?.(currentSceneIndex - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
            
            {isLastGameplayScene ? (
              // Scene 6 → Submit button
              <button 
                className="flex-1 py-3 rounded-xl font-semibold text-sm shadow-lg transition-all flex items-center justify-center gap-2 hover:opacity-90"
                style={{ 
                  backgroundColor: designSettings.primary, 
                  color: designSettings.background,
                  boxShadow: `0 4px 12px ${designSettings.primary}40`
                }}
                onClick={() => {
                  // End telemetry session and trigger Scene 7 proof receipt
                  toast.success('Telemetry session ended. Generating Proof Receipt...');
                  onSceneChange?.(7);
                }}
              >
                <Send className="h-4 w-4" />
                Submit
              </button>
            ) : (
              // Scenes 1-5 → Next button
              <button 
                className="flex-1 py-3 rounded-xl font-semibold text-sm shadow-lg transition-all flex items-center justify-center gap-2 hover:opacity-90"
                style={{ 
                  backgroundColor: designSettings.primary, 
                  color: designSettings.background,
                  boxShadow: `0 4px 12px ${designSettings.primary}40`
                }}
                onClick={() => onSceneChange?.(currentSceneIndex + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render Results Screen (Scene 7)
  const renderResultsScreen = () => (
    <div 
      className="h-full flex flex-col items-center justify-center p-6 text-center relative overflow-hidden"
      style={{ backgroundColor: designSettings.background }}
    >
      {/* Success gradient */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{ 
          background: `radial-gradient(circle at 50% 40%, ${designSettings.highlight || '#22c55e'}40, transparent 60%)`,
        }}
      />
      
      {/* Trophy */}
      <div 
        className="w-24 h-24 rounded-full flex items-center justify-center mb-6 relative z-10"
        style={{ backgroundColor: `${designSettings.primary}20` }}
      >
        <Trophy className="h-12 w-12" style={{ color: designSettings.primary }} />
      </div>
      
      <h2 
        className="text-2xl font-bold mb-2 relative z-10"
        style={{ color: designSettings.text }}
      >
        Assessment Complete!
      </h2>
      
      <p 
        className="text-sm opacity-70 mb-4 relative z-10"
        style={{ color: designSettings.text }}
      >
        You scored <span className="font-bold">85%</span> on this validator
      </p>

      {/* Score breakdown */}
      <div 
        className="w-full max-w-[200px] p-4 rounded-xl mb-6 relative z-10"
        style={{ backgroundColor: `${designSettings.secondary}15` }}
      >
        <div className="flex justify-between text-xs mb-2" style={{ color: designSettings.text }}>
          <span className="opacity-70">Correct Answers</span>
          <span className="font-bold">5/6</span>
        </div>
        <div className="flex justify-between text-xs mb-2" style={{ color: designSettings.text }}>
          <span className="opacity-70">Time Taken</span>
          <span className="font-bold">4:32</span>
        </div>
        <div className="flex justify-between text-xs" style={{ color: designSettings.text }}>
          <span className="opacity-70">Edge Score</span>
          <span className="font-bold">+127 XP</span>
        </div>
      </div>
      
      {/* CTA Buttons */}
      <div className="space-y-3 w-full max-w-[200px] relative z-10">
        <button
          className="w-full py-3 rounded-xl font-semibold text-sm shadow-lg flex items-center justify-center gap-2"
          style={{ backgroundColor: designSettings.primary, color: designSettings.background }}
        >
          <Award className="h-4 w-4" />
          Claim Badge
        </button>
        <button
          className="w-full py-2.5 rounded-xl font-medium text-sm border flex items-center justify-center gap-2"
          style={{ borderColor: `${designSettings.text}30`, color: designSettings.text }}
        >
          <RotateCcw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    </div>
  );

  const renderScreen = () => {
    if (currentSceneIndex === 0) return renderIntroScreen();
    if (currentSceneIndex === 7) return renderResultsScreen();
    return renderGameplayScreen();
  };

return (
    <div className="h-full flex flex-col items-center justify-center p-6">
      {/* Scene type indicator + TMA Toggle */}
      <div className="flex items-center justify-between w-full max-w-[340px] mb-4 px-2">
        <span className={`text-xs font-medium uppercase tracking-widest ${
          isDarkMode ? 'text-white/50' : 'text-slate-500'
        }`}>
          {currentSceneIndex === 0 ? 'Intro Screen' : currentSceneIndex === 7 ? 'Results Screen' : `Gameplay Scene ${currentSceneIndex}`}
        </span>
        {onTelegramPreviewToggle && (
          <TelegramPreviewToggle 
            isEnabled={telegramPreviewEnabled} 
            onToggle={onTelegramPreviewToggle} 
          />
        )}
      </div>
      
      {/* Mobile Frame */}
      <div 
        className={`w-[300px] h-[560px] rounded-[2.5rem] border-[10px] shadow-2xl overflow-hidden relative ${
          isDarkMode 
            ? 'border-slate-700 shadow-black/50' 
            : 'border-slate-300 shadow-slate-400/30'
        }`}
        style={{ 
          backgroundColor: designSettings.background,
          fontFamily: designSettings.font,
        }}
      >
        {/* Telegram Native Overlay (when enabled) */}
        <TelegramNativeOverlay
          isEnabled={telegramPreviewEnabled}
          headerColor={designSettings.background}
          sceneIndex={currentSceneIndex}
          showBackButton={currentSceneIndex >= 2 && currentSceneIndex <= 6}
          showMainButton={currentSceneIndex === 7}
          mainButtonText="SUBMIT PERFORMANCE"
          mainButtonColor={designSettings.primary}
          onBackClick={() => onSceneChange?.(Math.max(0, currentSceneIndex - 1))}
          onMainButtonClick={() => toast.success('Performance submitted!')}
        />
        
        {/* Notch (hidden in TMA mode) */}
        {!telegramPreviewEnabled && (
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 rounded-b-xl z-10 ${
            isDarkMode ? 'bg-slate-700' : 'bg-slate-300'
          }`} />
        )}
        
        {/* Content with safe area padding for TMA mode */}
        <div className={telegramPreviewEnabled ? 'pt-[44px]' : ''}>
          {renderScreen()}
        </div>
      </div>
    </div>
  );
}
