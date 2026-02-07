import { SceneData, DesignSettings, SubCompetency, TemplateFormData } from '../template-steps/types';
import { Clock, ChevronLeft, Undo, Sparkles, Play } from 'lucide-react';
import { useStudioTheme } from './StudioThemeContext';
import { MechanicPreview } from './MechanicPreview';
import { useState, useEffect } from 'react';

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
}

// Industry-specific placeholders for ghost state
const INDUSTRY_PLACEHOLDERS: Record<string, { name: string; description: string }> = {
  'Marketing': { name: 'Brand Campaign Audit', description: 'Evaluate marketing campaign effectiveness and ROI' },
  'Finance': { name: 'Budget Allocation Challenge', description: 'Strategic financial decision-making under pressure' },
  'Healthcare': { name: 'Patient Care Protocol', description: 'Clinical decision-making scenarios' },
  'Retail': { name: 'Luxury Collection Audit', description: 'Customer journey optimization challenge' },
  'Technology': { name: 'Security Threat Response', description: 'Identify and respond to cyber threats' },
  'Sales': { name: 'Enterprise Deal Navigator', description: 'Complex B2B negotiation scenarios' },
  'Human Resources': { name: 'Talent Assessment Suite', description: 'Candidate evaluation and culture fit' },
  'Operations': { name: 'Supply Chain Crisis', description: 'Logistics disruption management' },
  'Communications': { name: 'Crisis PR Response', description: 'Real-time media crisis handling' },
  'Customer Service': { name: 'Escalation Handler', description: 'Complex customer complaint resolution' },
  'Education': { name: 'Curriculum Design Lab', description: 'Learning objective assessment' },
  'Manufacturing': { name: 'Quality Control Check', description: 'Production line decision-making' },
  'Legal': { name: 'Case Strategy Builder', description: 'Legal reasoning and precedent analysis' },
  'Supply Chain': { name: 'Vendor Risk Assessment', description: 'Supplier evaluation scenarios' },
  'Nonprofit': { name: 'Donor Impact Tracker', description: 'Resource allocation optimization' },
  'Government': { name: 'Policy Impact Analysis', description: 'Public sector decision-making' },
  'default': { name: 'Competency Validator', description: 'Test critical thinking and decision-making skills' },
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
}: StudioLiveMirrorProps) {
  const { isDarkMode } = useStudioTheme();
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [mascotPreviewUrl, setMascotPreviewUrl] = useState<string | null>(null);

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
    : null;

  const progressPercent = scenes.length > 0 
    ? ((currentSceneIndex + 1) / scenes.length) * 100 
    : 25;

  // Get placeholder based on industry or default
  const placeholder = INDUSTRY_PLACEHOLDERS[formData.industry] || INDUSTRY_PLACEHOLDERS['default'];
  
  // Check if content is in "ghost" state (empty)
  const isGhostState = !formData.name.trim();
  const displayName = formData.name || placeholder.name;
  const displayDescription = currentSub?.action_cue || placeholder.description;
  const displayQuestion = currentScene?.question || 'Select the most effective approach for this scenario...';

  // Get the current mechanic for layout selection
  const currentMechanic = currentSub?.game_mechanic || null;

  // Ghost choices for empty state
  const ghostChoices = [
    { id: '1', text: 'Strategic Response A', isCorrect: true },
    { id: '2', text: 'Alternative Approach B', isCorrect: false },
    { id: '3', text: 'Tactical Option C', isCorrect: false },
    { id: '4', text: 'Fallback Decision D', isCorrect: false },
  ];

  const displayChoices = currentScene?.choices || ghostChoices;

  // Scene 0 intro screen (Brand Identity Preview)
  if (showScene0) {
    return (
      <div className="h-full flex flex-col items-center justify-start pt-4 overflow-hidden">
        <div className="text-center mb-3">
          <span className={`text-xs font-medium uppercase tracking-widest ${
            isDarkMode ? 'text-white/50' : 'text-slate-500'
          }`}>
            Scene 0 · Brand Intro
          </span>
        </div>
        
        <MobileFrame designSettings={designSettings} isDarkMode={isDarkMode}>
          <div 
            className="h-full flex flex-col items-center justify-center p-6 text-center relative overflow-hidden"
            style={{ backgroundColor: designSettings.background }}
          >
            {/* Animated gradient background */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{ 
                background: `radial-gradient(circle at 50% 30%, ${designSettings.primary}40, transparent 70%)`,
              }}
            />
            
            {/* Logo or Mascot display */}
            <div className="relative z-10 mb-6">
              {logoPreviewUrl ? (
                <div 
                  className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg flex items-center justify-center"
                  style={{ backgroundColor: `${designSettings.primary}20` }}
                >
                  <img 
                    src={logoPreviewUrl} 
                    alt="Brand Logo" 
                    className="w-16 h-16 object-contain"
                  />
                </div>
              ) : mascotPreviewUrl ? (
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center animate-pulse"
                  style={{ backgroundColor: `${designSettings.primary}30` }}
                >
                  <Sparkles 
                    className="h-10 w-10 animate-spin" 
                    style={{ 
                      color: designSettings.primary,
                      animationDuration: '3s',
                    }} 
                  />
                </div>
              ) : (
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center border-2 border-dashed"
                  style={{ 
                    borderColor: `${designSettings.primary}50`,
                    backgroundColor: `${designSettings.primary}10`,
                  }}
                >
                  <Play 
                    className="h-8 w-8" 
                    style={{ color: designSettings.primary }} 
                  />
                </div>
              )}
            </div>
            
            {/* Title */}
            <h2 
              className={`text-xl font-bold mb-2 relative z-10 ${isGhostState ? 'opacity-40 italic' : ''}`}
              style={{ color: designSettings.text }}
            >
              {displayName}
            </h2>
            
            {/* Subtitle */}
            <p 
              className={`text-sm opacity-70 mb-8 max-w-[200px] relative z-10 ${isGhostState ? 'opacity-30' : ''}`}
              style={{ color: designSettings.text }}
            >
              {placeholder.description}
            </p>
            
            {/* Start Button */}
            <button
              className="px-10 py-3.5 rounded-xl font-semibold text-sm shadow-lg transition-transform hover:scale-105 relative z-10"
              style={{
                backgroundColor: designSettings.primary,
                color: designSettings.background,
                boxShadow: `0 8px 24px ${designSettings.primary}40`,
              }}
            >
              Start Challenge
            </button>
            
            {/* Brand colors indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              <div 
                className="w-3 h-3 rounded-full shadow-sm" 
                style={{ backgroundColor: designSettings.primary }}
                title="Primary"
              />
              <div 
                className="w-3 h-3 rounded-full shadow-sm" 
                style={{ backgroundColor: designSettings.secondary }}
                title="Secondary"
              />
              <div 
                className="w-3 h-3 rounded-full shadow-sm" 
                style={{ backgroundColor: designSettings.accent }}
                title="Accent"
              />
            </div>
          </div>
        </MobileFrame>
        
        {/* Scene 0 indicator */}
        <div className="flex justify-center gap-2 mt-4">
          <div
            className="w-3 h-3 rounded-full ring-2 ring-offset-2 ring-primary"
            style={{ 
              backgroundColor: designSettings.primary,
            }}
          />
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className={`w-2.5 h-2.5 rounded-full opacity-20 ${
                isDarkMode ? 'bg-white' : 'bg-slate-400'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-start pt-4 overflow-hidden">
      <div className="text-center mb-3">
        <span className={`text-xs font-medium uppercase tracking-widest ${
          isDarkMode ? 'text-white/50' : 'text-slate-500'
        }`}>
          Live Mirror Preview
        </span>
      </div>
      
      <MobileFrame designSettings={designSettings} isDarkMode={isDarkMode}>
        {/* Screen Content */}
        <div className="h-full overflow-hidden pt-6">
          {/* Header */}
          <div 
            className="px-4 py-3 flex items-center gap-3"
            style={{ backgroundColor: `${designSettings.primary}20` }}
          >
            <ChevronLeft className="h-5 w-5" style={{ color: designSettings.text }} />
            <div className="flex-1 min-w-0">
              <h3 
                className={`font-semibold text-sm truncate ${isGhostState ? 'opacity-40 italic' : ''}`}
                style={{ color: designSettings.text }}
              >
                {displayName}
              </h3>
              <p 
                className={`text-xs truncate ${isGhostState ? 'opacity-30' : 'opacity-70'}`}
                style={{ color: designSettings.text }}
              >
                {displayDescription}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-4 py-2">
            <div className="h-2 rounded-full bg-black/10 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{ 
                  width: `${progressPercent}%`,
                  backgroundColor: designSettings.primary,
                }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px]" style={{ color: designSettings.text }}>
                Scene {currentSceneIndex + 1} of {scenes.length || 6}
              </span>
              <span className="text-[10px] flex items-center gap-1" style={{ color: designSettings.text }}>
                <Clock className="h-3 w-3" />
                {currentScene?.timeLimit || 60}s
              </span>
            </div>
          </div>

          {/* Question Area */}
          <div className="px-4 py-3">
            <div 
              className="rounded-xl p-4 min-h-[50px]"
              style={{ backgroundColor: `${designSettings.secondary}20` }}
            >
              <p 
                className={`text-sm font-medium leading-relaxed ${isGhostState && !currentScene ? 'opacity-40 italic' : ''}`}
                style={{ color: designSettings.text }}
              >
                {displayQuestion}
              </p>
            </div>
          </div>

          {/* Mechanic-based layout */}
          <MechanicPreview
            mechanic={currentMechanic}
            choices={displayChoices}
            designSettings={designSettings}
            isGhostState={isGhostState}
          />

          {/* Telemetry Buttons (LOCKED - Mandatory for biometric jitter tracking) */}
          <div className="absolute bottom-[70px] left-4 flex gap-2">
            <div 
              className="px-2 py-1 rounded text-[10px] opacity-60 flex items-center gap-1"
              style={{ 
                backgroundColor: `${designSettings.text}20`,
                color: designSettings.text,
              }}
            >
              <Undo className="h-3 w-3" />
              Undo
            </div>
            <div 
              className="px-2 py-1 rounded text-[10px] opacity-60 flex items-center gap-1"
              style={{ 
                backgroundColor: `${designSettings.text}20`,
                color: designSettings.text,
              }}
            >
              <ChevronLeft className="h-3 w-3" />
              Back
            </div>
          </div>

          {/* Submit Button */}
          <div className="px-4 py-3 absolute bottom-4 left-0 right-0">
            <button
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all shadow-lg"
              style={{
                backgroundColor: designSettings.primary,
                color: designSettings.background,
              }}
            >
              Submit Answer
            </button>
          </div>
        </div>
      </MobileFrame>

      {/* Scene Navigator Dots */}
      {scenes.length > 0 ? (
        <div className="flex justify-center gap-2 mt-4">
          {scenes.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSceneIndex(idx)}
              className={`w-3 h-3 rounded-full transition-all cursor-pointer hover:scale-125 ${
                idx === currentSceneIndex 
                  ? 'scale-125 ring-2 ring-offset-2 ring-primary' 
                  : 'opacity-40 hover:opacity-70'
              }`}
              style={{ backgroundColor: designSettings.primary }}
              title={`Scene ${idx + 1}`}
            />
          ))}
        </div>
      ) : (
        <div className="flex justify-center gap-2 mt-4">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className={`w-2.5 h-2.5 rounded-full opacity-20 ${
                isDarkMode ? 'bg-white' : 'bg-slate-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Mobile Frame Component
function MobileFrame({ 
  children, 
  designSettings, 
  isDarkMode 
}: { 
  children: React.ReactNode; 
  designSettings: DesignSettings; 
  isDarkMode: boolean;
}) {
  return (
    <div 
      className={`mx-auto w-[280px] h-[520px] rounded-[2.5rem] border-[10px] shadow-2xl overflow-hidden relative ${
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
      
      {children}
    </div>
  );
}
