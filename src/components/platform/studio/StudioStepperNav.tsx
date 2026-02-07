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

const STEPS: Step[] = [
  { id: 1, title: 'Identity', description: 'Name & cover', icon: '✨' },
  { id: 2, title: 'Framework', description: 'Competencies', icon: '🧠' },
  { id: 3, title: 'Scenes', description: 'Build content', icon: '🎬' },
  { id: 4, title: 'Brand Skin', description: 'Colors & fonts', icon: '🎨' },
];

export function StudioStepperNav({
  currentStep,
  setCurrentStep,
  canNavigate,
}: StudioStepperNavProps) {
  const { isDarkMode } = useStudioTheme();

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
                group flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300
                ${isActive 
                  ? isDarkMode 
                    ? 'bg-white/20 backdrop-blur-md border border-white/30 shadow-lg shadow-white/10' 
                    : 'bg-primary/20 backdrop-blur-md border border-primary/30 shadow-lg shadow-primary/10'
                  : isCompleted
                    ? isDarkMode
                      ? 'bg-white/10 border border-white/20'
                      : 'bg-primary/10 border border-primary/20'
                    : isDarkMode
                      ? 'bg-white/5 border border-white/10 hover:bg-white/10'
                      : 'bg-muted border border-border hover:bg-muted/80'
                }
                ${!canClick ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              `}
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${isActive 
                  ? isDarkMode ? 'bg-white text-black' : 'bg-primary text-primary-foreground'
                  : isCompleted
                    ? isDarkMode ? 'bg-green-400/80 text-black' : 'bg-primary text-primary-foreground'
                    : isDarkMode ? 'bg-white/20 text-white' : 'bg-muted-foreground/20 text-muted-foreground'
                }
              `}>
                {isCompleted ? <Check className="h-4 w-4" /> : step.icon}
              </div>
              
              <div className="hidden sm:block text-left">
                <p className={`text-sm font-semibold ${
                  isActive 
                    ? isDarkMode ? 'text-white' : 'text-primary'
                    : isDarkMode ? 'text-white/70' : 'text-foreground'
                }`}>
                  {step.title}
                </p>
                <p className={`text-[10px] ${
                  isDarkMode ? 'text-white/40' : 'text-muted-foreground'
                }`}>
                  {step.description}
                </p>
              </div>
            </button>
            
            {idx < STEPS.length - 1 && (
              <div className={`
                w-8 h-0.5 mx-1 rounded-full transition-all
                ${currentStep > step.id 
                  ? isDarkMode ? 'bg-white/50' : 'bg-primary/50'
                  : isDarkMode ? 'bg-white/10' : 'bg-border'
                }
              `} />
            )}
          </div>
        );
      })}
    </div>
  );
}
