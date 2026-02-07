import { SceneData, DesignSettings, SubCompetency, TemplateFormData } from '../template-steps/types';
import { CheckCircle, XCircle, Clock, ChevronLeft, Undo } from 'lucide-react';
import { useStudioTheme } from './StudioThemeContext';

interface StudioLiveMirrorProps {
  formData: TemplateFormData;
  scenes: SceneData[];
  currentSceneIndex: number;
  setCurrentSceneIndex: (index: number) => void;
  designSettings: DesignSettings;
  subCompetencies: SubCompetency[];
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
}: StudioLiveMirrorProps) {
  const { isDarkMode } = useStudioTheme();
  const currentScene = scenes[currentSceneIndex] || null;
  const currentSub = currentScene 
    ? subCompetencies.find(s => s.id === currentScene.subCompetencyId) 
    : null;

  const progressPercent = scenes.length > 0 
    ? ((currentSceneIndex + 1) / scenes.length) * 100 
    : 25; // Default ghost progress

  // Get placeholder based on industry or default
  const placeholder = INDUSTRY_PLACEHOLDERS[formData.industry] || INDUSTRY_PLACEHOLDERS['default'];
  
  // Check if content is in "ghost" state (empty)
  const isGhostState = !formData.name.trim();
  const displayName = formData.name || placeholder.name;
  const displayDescription = currentSub?.action_cue || placeholder.description;

  // Ghost choices for empty state
  const ghostChoices = [
    { id: '1', text: 'Strategic Response A', isCorrect: true },
    { id: '2', text: 'Alternative Approach B', isCorrect: false },
    { id: '3', text: 'Tactical Option C', isCorrect: false },
    { id: '4', text: 'Fallback Decision D', isCorrect: false },
  ];

  const displayChoices = currentScene?.choices || ghostChoices;
  const displayQuestion = currentScene?.question || 'Select the most effective approach for this scenario...';

  return (
    <div className="h-full flex flex-col items-center justify-start pt-4 overflow-hidden">
      <div className="text-center mb-3">
        <span className={`text-xs font-medium uppercase tracking-widest ${
          isDarkMode ? 'text-white/50' : 'text-foreground/50'
        }`}>
          Live Mirror Preview
        </span>
      </div>
      
      {/* Mobile Frame with Glassmorphism */}
      <div 
        className={`mx-auto w-[280px] h-[520px] rounded-[2.5rem] border-[10px] shadow-2xl overflow-hidden relative ${
          isDarkMode 
            ? 'border-white/20 bg-black/20 backdrop-blur-xl' 
            : 'border-foreground/20 bg-white/80 backdrop-blur-xl'
        }`}
        style={{ 
          backgroundColor: designSettings.background,
          fontFamily: designSettings.font,
        }}
      >
        {/* Notch */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 rounded-b-xl z-10 ${
          isDarkMode ? 'bg-white/10' : 'bg-foreground/20'
        }`} />
        
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
              className="rounded-xl p-4 min-h-[60px]"
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

          {/* Choices - Dynamic sizing based on count */}
          <div className="px-4 space-y-1.5 overflow-y-auto max-h-[140px]">
            {displayChoices.map((choice, idx) => {
              // Dynamic sizing: smaller padding for more choices
              const choiceCount = displayChoices.length;
              const padding = choiceCount > 6 ? 'p-1.5' : choiceCount > 4 ? 'p-2' : 'p-2.5';
              const textSize = choiceCount > 6 ? 'text-[10px]' : 'text-xs';
              const iconSize = choiceCount > 6 ? 'h-3 w-3' : 'h-4 w-4';
              
              return (
                <div
                  key={choice.id}
                  className={`rounded-lg ${padding} flex items-center gap-2 border transition-all`}
                  style={{
                    backgroundColor: choice.isCorrect 
                      ? `${designSettings.highlight}30`
                      : designSettings.background,
                    borderColor: choice.isCorrect 
                      ? designSettings.highlight
                      : `${designSettings.text}20`,
                  }}
                >
                  {choice.isCorrect ? (
                    <CheckCircle className={`${iconSize} flex-shrink-0`} style={{ color: designSettings.highlight }} />
                  ) : (
                    <XCircle className={`${iconSize} flex-shrink-0 opacity-40`} style={{ color: designSettings.text }} />
                  )}
                  <span 
                    className={`${textSize} flex-1 ${!choice.text && isGhostState ? 'opacity-40 italic' : ''}`}
                    style={{ color: designSettings.text }}
                  >
                    {choice.text || `Option ${idx + 1}`}
                  </span>
                </div>
              );
            })}
          </div>

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
      </div>

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
              style={{ 
                backgroundColor: designSettings.primary,
              }}
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
                isDarkMode ? 'bg-white' : 'bg-foreground'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
