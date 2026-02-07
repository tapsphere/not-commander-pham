import { Check } from 'lucide-react';
import { useStudioTheme } from './StudioThemeContext';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: string;
}

interface StudioStepperNavProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  canNavigate: (step: number) => boolean;
}

// New tab order: Brand → Template Info → Framework → Scene Builder
const STEPS: Step[] = [
  { id: 1, title: 'Brand', description: 'Logo & colors', icon: '🎨' },
  { id: 2, title: 'Template', description: 'Name & cover', icon: '📝' },
  { id: 3, title: 'Framework', description: 'Competencies', icon: '🧠' },
  { id: 4, title: 'Scenes', description: 'Build content', icon: '🎬' },
];

export function StudioStepperNav({
  currentStep,
  setCurrentStep,
  canNavigate,
}: StudioStepperNavProps) {
  const { isDarkMode } = useStudioTheme();

  // Professional neutral colors
  const activeStyles = isDarkMode 
    ? 'bg-white/15 border-white/30 shadow-lg' 
    : 'bg-white border-slate-300 shadow-md';
  
  const completedStyles = isDarkMode
    ? 'bg-white/10 border-white/20'
    : 'bg-slate-100 border-slate-200';
  
  const inactiveStyles = isDarkMode
    ? 'bg-white/5 border-white/10 hover:bg-white/10'
    : 'bg-slate-50 border-slate-200 hover:bg-white';

  return (
    <div className="flex items-center justify-center gap-2 py-4 px-6">
      {STEPS.map((step, idx) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        const canClick = canNavigate(step.id);

        return (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => canClick && setCurrentStep(step.id)}
              disabled={!canClick}
              className={`
                group flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 border
                ${isActive ? activeStyles : isCompleted ? completedStyles : inactiveStyles}
                ${!canClick ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              `}
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${isActive 
                  ? isDarkMode ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
                  : isCompleted
                    ? isDarkMode ? 'bg-green-500/80 text-white' : 'bg-green-600 text-white'
                    : isDarkMode ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }
              `}>
                {isCompleted ? <Check className="h-4 w-4" /> : step.icon}
              </div>
              
              <div className="hidden sm:block text-left">
                <p className={`text-sm font-semibold ${
                  isActive 
                    ? isDarkMode ? 'text-white' : 'text-slate-900'
                    : isDarkMode ? 'text-white/70' : 'text-slate-700'
                }`}>
                  {step.title}
                </p>
                <p className={`text-[10px] ${
                  isDarkMode ? 'text-white/40' : 'text-slate-500'
                }`}>
                  {step.description}
                </p>
              </div>
            </button>
            
            {idx < STEPS.length - 1 && (
              <div className={`
                w-8 h-0.5 mx-1 rounded-full transition-all
                ${currentStep > step.id 
                  ? isDarkMode ? 'bg-white/40' : 'bg-slate-400'
                  : isDarkMode ? 'bg-white/10' : 'bg-slate-200'
                }
              `} />
            )}
          </div>
        );
      })}
    </div>
  );
}
