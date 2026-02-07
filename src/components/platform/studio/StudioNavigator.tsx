import { Palette, FileText, Layers, Layout, CheckCircle2 } from 'lucide-react';
import { useStudioTheme } from './StudioThemeContext';

interface StudioNavigatorProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  completedSteps: number[];
}

const STEPS = [
  { id: 1, label: 'Brand', icon: Palette, description: 'Logo, colors, mascot' },
  { id: 2, label: 'Info', icon: FileText, description: 'Name & description' },
  { id: 3, label: 'Framework', icon: Layers, description: 'C-BEN competencies' },
  { id: 4, label: 'Scenes', icon: Layout, description: 'Build gameplay' },
];

export function StudioNavigator({
  currentStep,
  setCurrentStep,
  completedSteps,
}: StudioNavigatorProps) {
  const { isDarkMode } = useStudioTheme();

  const bgColor = isDarkMode ? 'bg-slate-900/90' : 'bg-white/95';
  const borderColor = isDarkMode ? 'border-white/10' : 'border-slate-200';
  const textColor = isDarkMode ? 'text-white' : 'text-slate-900';
  const mutedColor = isDarkMode ? 'text-white/50' : 'text-slate-500';

  return (
    <div className={`h-full ${bgColor} border-r ${borderColor} backdrop-blur-xl flex flex-col`}>
      {/* Navigator Header */}
      <div className={`px-4 py-4 border-b ${borderColor}`}>
        <h2 className={`text-sm font-semibold ${textColor}`}>Workflow</h2>
        <p className={`text-xs mt-0.5 ${mutedColor}`}>4 steps to create</p>
      </div>

      {/* Step List */}
      <div className="flex-1 p-3 space-y-1">
        {STEPS.map((step, idx) => {
          const isActive = currentStep === step.id;
          const isCompleted = completedSteps.includes(step.id);
          const Icon = step.icon;

          return (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`
                w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left
                ${isActive 
                  ? isDarkMode 
                    ? 'bg-white/10 ring-1 ring-white/20' 
                    : 'bg-slate-100 ring-1 ring-slate-200'
                  : 'hover:bg-white/5'
                }
              `}
            >
              {/* Step Number / Icon */}
              <div 
                className={`
                  w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all
                  ${isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : isDarkMode ? 'bg-white/10 text-white/50' : 'bg-slate-100 text-slate-400'
                  }
                `}
              >
                {isCompleted && !isActive ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span 
                    className={`text-sm font-medium ${
                      isActive ? textColor : isDarkMode ? 'text-white/70' : 'text-slate-600'
                    }`}
                  >
                    {step.label}
                  </span>
                  {isCompleted && !isActive && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-500">
                      Done
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-0.5 truncate ${mutedColor}`}>
                  {step.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Progress Indicator */}
      <div className={`p-4 border-t ${borderColor}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs ${mutedColor}`}>Progress</span>
          <span className={`text-xs font-medium ${textColor}`}>
            {completedSteps.length}/4
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-black/10 overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${(completedSteps.length / 4) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
