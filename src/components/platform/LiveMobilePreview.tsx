import { SceneData, DesignSettings, SubCompetency, TemplateFormData } from './template-steps/types';
import { CheckCircle, XCircle, Clock, ChevronLeft } from 'lucide-react';

interface LiveMobilePreviewProps {
  formData: TemplateFormData;
  scenes: SceneData[];
  currentSceneIndex: number;
  designSettings: DesignSettings;
  subCompetencies: SubCompetency[];
}

export function LiveMobilePreview({
  formData,
  scenes,
  currentSceneIndex,
  designSettings,
  subCompetencies,
}: LiveMobilePreviewProps) {
  const currentScene = scenes[currentSceneIndex] || null;
  const currentSub = currentScene 
    ? subCompetencies.find(s => s.id === currentScene.subCompetencyId) 
    : null;

  const progressPercent = scenes.length > 0 
    ? ((currentSceneIndex + 1) / scenes.length) * 100 
    : 0;

  return (
    <div className="sticky top-4 h-fit">
      <div className="text-center mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Live Preview
        </span>
      </div>
      
      {/* Mobile Frame */}
      <div 
        className="mx-auto w-[280px] h-[560px] rounded-[2.5rem] border-[10px] border-foreground/20 shadow-2xl overflow-hidden relative"
        style={{ 
          backgroundColor: designSettings.background,
          fontFamily: designSettings.font,
        }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-foreground/20 rounded-b-xl z-10" />
        
        {/* Screen Content */}
        <div className="h-full overflow-hidden pt-6">
          {/* Header */}
          <div 
            className="px-4 py-3 flex items-center gap-3"
            style={{ backgroundColor: `${designSettings.primary}20` }}
          >
            <ChevronLeft className="h-5 w-5" style={{ color: designSettings.text }} />
            <div className="flex-1">
              <h3 
                className="font-semibold text-sm truncate"
                style={{ color: designSettings.text }}
              >
                {formData.name || 'Template Name'}
              </h3>
              <p 
                className="text-xs opacity-70 truncate"
                style={{ color: designSettings.text }}
              >
                {currentSub?.action_cue || 'Scene description'}
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
                Scene {currentSceneIndex + 1} of {scenes.length || 1}
              </span>
              <span className="text-[10px] flex items-center gap-1" style={{ color: designSettings.text }}>
                <Clock className="h-3 w-3" />
                {currentScene?.timeLimit || 60}s
              </span>
            </div>
          </div>

          {/* Question Area */}
          <div className="px-4 py-4">
            <div 
              className="rounded-xl p-4 min-h-[80px]"
              style={{ backgroundColor: `${designSettings.secondary}20` }}
            >
              <p 
                className="text-sm font-medium leading-relaxed"
                style={{ color: designSettings.text }}
              >
                {currentScene?.question || 'Your question will appear here...'}
              </p>
            </div>
          </div>

          {/* Choices */}
          <div className="px-4 space-y-2">
            {(currentScene?.choices || [
              { id: '1', text: 'Choice 1', isCorrect: true },
              { id: '2', text: 'Choice 2', isCorrect: false },
              { id: '3', text: 'Choice 3', isCorrect: false },
              { id: '4', text: 'Choice 4', isCorrect: false },
            ]).map((choice, idx) => (
              <div
                key={choice.id}
                className="rounded-lg p-3 flex items-center gap-2 border transition-all"
                style={{
                  backgroundColor: choice.isCorrect 
                    ? `${designSettings.highlight}30`
                    : `${designSettings.background}`,
                  borderColor: choice.isCorrect 
                    ? designSettings.highlight
                    : `${designSettings.text}20`,
                }}
              >
                {choice.isCorrect ? (
                  <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: designSettings.highlight }} />
                ) : (
                  <XCircle className="h-4 w-4 flex-shrink-0 opacity-40" style={{ color: designSettings.text }} />
                )}
                <span 
                  className="text-xs flex-1"
                  style={{ color: designSettings.text }}
                >
                  {choice.text || `Option ${idx + 1}`}
                </span>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="px-4 py-4 absolute bottom-6 left-0 right-0">
            <button
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
              style={{
                backgroundColor: designSettings.primary,
                color: designSettings.background,
              }}
            >
              Submit Answer
            </button>
          </div>

          {/* Telemetry Buttons (Locked) */}
          <div className="absolute bottom-20 left-4 flex gap-2">
            <div 
              className="px-2 py-1 rounded text-[10px] opacity-50"
              style={{ 
                backgroundColor: `${designSettings.text}20`,
                color: designSettings.text,
              }}
            >
              ↩ Undo
            </div>
            <div 
              className="px-2 py-1 rounded text-[10px] opacity-50"
              style={{ 
                backgroundColor: `${designSettings.text}20`,
                color: designSettings.text,
              }}
            >
              ← Back
            </div>
          </div>
        </div>
      </div>

      {/* Scene Navigator */}
      {scenes.length > 0 && (
        <div className="flex justify-center gap-1 mt-4">
          {scenes.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentSceneIndex 
                  ? 'scale-125' 
                  : 'opacity-40'
              }`}
              style={{ backgroundColor: designSettings.primary }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
