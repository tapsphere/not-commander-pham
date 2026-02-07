import { useState, useEffect } from 'react';
import { SceneData, DesignSettings, SubCompetency, TemplateFormData } from '../template-steps/types';
import { Clock, ChevronLeft, Undo, Sparkles, Play, Trophy, Award, RotateCcw } from 'lucide-react';
import { useStudioTheme } from './StudioThemeContext';
import { MechanicPreview } from './MechanicPreview';

interface StudioCenterCanvasProps {
  currentSceneIndex: number;
  formData: TemplateFormData;
  scenes: SceneData[];
  designSettings: DesignSettings;
  subCompetencies: SubCompetency[];
  mascotFile?: File | null;
  logoFile?: File | null;
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

export function StudioCenterCanvas({
  currentSceneIndex,
  formData,
  scenes,
  designSettings,
  subCompetencies,
  mascotFile,
  logoFile,
}: StudioCenterCanvasProps) {
  const { isDarkMode } = useStudioTheme();
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

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

    return (
      <div className="h-full overflow-hidden pt-6" style={{ backgroundColor: designSettings.background }}>
        {/* Header */}
        <div 
          className="px-4 py-3 flex items-center gap-3"
          style={{ backgroundColor: `${designSettings.primary}15` }}
        >
          <ChevronLeft className="h-5 w-5" style={{ color: designSettings.text }} />
          <div className="flex-1 min-w-0">
            <h3 
              className={`font-semibold text-sm truncate ${isGhostState && !currentScene ? 'opacity-40 italic' : ''}`}
              style={{ color: designSettings.text }}
            >
              {displayName}
            </h3>
            <p className="text-xs truncate opacity-70" style={{ color: designSettings.text }}>
              {currentSubCompetency?.action_cue || placeholder.description}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-4 py-2">
          <div className="h-2 rounded-full bg-black/10 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%`, backgroundColor: designSettings.primary }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px]" style={{ color: designSettings.text }}>
              Scene {currentSceneIndex} of 6
            </span>
            <span className="text-[10px] flex items-center gap-1" style={{ color: designSettings.text }}>
              <Clock className="h-3 w-3" />
              {currentScene?.timeLimit || 60}s
            </span>
          </div>
        </div>

        {/* Question */}
        <div className="px-4 py-3">
          <div 
            className="rounded-xl p-4 min-h-[50px]"
            style={{ backgroundColor: `${designSettings.secondary}15` }}
          >
            <p 
              className={`text-sm font-medium leading-relaxed ${!currentScene ? 'opacity-40 italic' : ''}`}
              style={{ color: designSettings.text }}
            >
              {displayQuestion}
            </p>
          </div>
        </div>

        {/* Choices */}
        <MechanicPreview
          mechanic={currentMechanic}
          choices={displayChoices}
          designSettings={designSettings}
          isGhostState={!currentScene}
        />

        {/* Telemetry Buttons (LOCKED) */}
        <div className="absolute bottom-[70px] left-4 flex gap-2">
          <div 
            className="px-2 py-1 rounded text-[10px] opacity-60 flex items-center gap-1"
            style={{ backgroundColor: `${designSettings.text}15`, color: designSettings.text }}
          >
            <Undo className="h-3 w-3" />
            Undo
          </div>
          <div 
            className="px-2 py-1 rounded text-[10px] opacity-60 flex items-center gap-1"
            style={{ backgroundColor: `${designSettings.text}15`, color: designSettings.text }}
          >
            <ChevronLeft className="h-3 w-3" />
            Back
          </div>
        </div>

        {/* Submit Button */}
        <div className="px-4 py-3 absolute bottom-4 left-0 right-0">
          <button
            className="w-full py-3 rounded-xl font-semibold text-sm shadow-lg"
            style={{ backgroundColor: designSettings.primary, color: designSettings.background }}
          >
            Submit Answer
          </button>
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
      {/* Scene type indicator */}
      <div className="text-center mb-4">
        <span className={`text-xs font-medium uppercase tracking-widest ${
          isDarkMode ? 'text-white/50' : 'text-slate-500'
        }`}>
          {currentSceneIndex === 0 ? 'Intro Screen' : currentSceneIndex === 7 ? 'Results Screen' : `Gameplay Scene ${currentSceneIndex}`}
        </span>
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
        {/* Notch */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 rounded-b-xl z-10 ${
          isDarkMode ? 'bg-slate-700' : 'bg-slate-300'
        }`} />
        
        {renderScreen()}
      </div>
    </div>
  );
}
