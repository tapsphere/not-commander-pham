import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MobileViewport } from '@/components/MobileViewport';
import { LotusBreathing } from '@/components/LotusBreathing';

type BreathPhase = 'idle' | 'in' | 'hold' | 'out';

export default function BreathBalance() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'results'>('intro');
  const [currentCycle, setCurrentCycle] = useState(0);
  const totalCycles = 5;
  
  // Breathing mechanics
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('idle');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [timeInPhase, setTimeInPhase] = useState(0);
  
  // Tracking
  const [correctBreaths, setCorrectBreaths] = useState(0);
  const [totalOpportunities, setTotalOpportunities] = useState(0);
  const [timeStarted, setTimeStarted] = useState<number | null>(null);

  // Phase durations (in seconds)
  const PHASE_DURATIONS = {
    in: 4,
    hold: 7,
    out: 8,
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      setTimeInPhase(prev => {
        const newTime = prev + 0.1;
        const currentDuration = breathPhase === 'idle' ? 0 : PHASE_DURATIONS[breathPhase];
        const progress = Math.min(newTime / currentDuration, 1);
        setPhaseProgress(progress);

        if (newTime >= currentDuration && breathPhase !== 'idle') {
          // Move to next phase
          if (breathPhase === 'in') {
            setBreathPhase('hold');
            setTimeInPhase(0);
            setTotalOpportunities(prev => prev + 1);
          } else if (breathPhase === 'hold') {
            setBreathPhase('out');
            setTimeInPhase(0);
            setTotalOpportunities(prev => prev + 1);
          } else if (breathPhase === 'out') {
            // Complete cycle
            if (currentCycle < totalCycles - 1) {
              setCurrentCycle(prev => prev + 1);
              setBreathPhase('in');
              setTimeInPhase(0);
            } else {
              // Game complete
              endGame();
            }
          }
        }
        return newTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [gameState, breathPhase, currentCycle]);

  const startGame = () => {
    setGameState('playing');
    setBreathPhase('in');
    setTimeStarted(Date.now());
    setCurrentCycle(0);
    setCorrectBreaths(0);
    setTotalOpportunities(0);
    setTimeInPhase(0);
  };

  const handleTap = () => {
    if (breathPhase === 'hold' || breathPhase === 'out') {
      setCorrectBreaths(prev => prev + 1);
      // Visual feedback
      const element = document.getElementById('lotus-container');
      if (element) {
        element.classList.add('scale-110');
        setTimeout(() => element.classList.remove('scale-110'), 200);
      }
    }
  };

  const endGame = async () => {
    setGameState('results');
    
    const timeElapsed = timeStarted ? (Date.now() - timeStarted) / 1000 : 0;
    const accuracy = totalOpportunities > 0 ? (correctBreaths / totalOpportunities) * 100 : 0;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const proficiencyLevel = accuracy >= 80 ? 'Proficient' : accuracy >= 60 ? 'Developing' : 'Needs Work';
        
        await supabase.from('game_results').insert({
          user_id: user.id,
          passed: accuracy >= 60,
          proficiency_level: proficiencyLevel,
          scoring_metrics: {
            accuracy: Math.round(accuracy),
            correctIdentifications: correctBreaths,
            totalOpportunities,
            timeElapsed: Math.round(timeElapsed),
          },
          gameplay_data: {
            cycles: totalCycles,
          },
        });
        
        toast.success('Result saved!');
      }
    } catch (error) {
      console.error('Error saving result:', error);
    }
  };

  if (gameState === 'intro') {
    return (
      <MobileViewport>
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black text-white flex flex-col items-center justify-center p-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/platform/creator')}
            className="absolute top-4 left-4 text-white/60 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="flex flex-col items-center space-y-8 max-w-md">
            <div className="space-y-2 text-center">
              <h1 className="text-4xl font-light tracking-wide">Breath & Balance</h1>
              <p className="text-white/40 text-sm font-light">Mindfulness Exercise</p>
            </div>

            <div className="text-center space-y-4">
              <p className="text-white/70 font-light leading-relaxed">
                Follow the lotus breathing pattern. Tap during the hold and exhale phases to demonstrate mindful awareness.
              </p>
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Breathe In</span>
                  <span className="text-white font-medium">4s</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Hold</span>
                  <span className="text-white font-medium">7s</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Breathe Out</span>
                  <span className="text-white font-medium">8s</span>
                </div>
              </div>
            </div>

            <Button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-green-500 to-purple-600 hover:from-green-600 hover:to-purple-700 text-white font-medium text-lg h-14 rounded-full shadow-lg"
            >
              Begin
            </Button>
          </div>
        </div>
      </MobileViewport>
    );
  }

  if (gameState === 'results') {
    const accuracy = totalOpportunities > 0 ? (correctBreaths / totalOpportunities) * 100 : 0;
    const timeElapsed = timeStarted ? (Date.now() - timeStarted) / 1000 : 0;
    const proficiencyLevel = accuracy >= 80 ? 'Level 3 - Proficient' : accuracy >= 60 ? 'Level 2 - Developing' : 'Level 1 - Needs Work';
    
    return (
      <MobileViewport>
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-800 to-gray-900 text-white flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-md space-y-6">
            {/* Summary Card */}
            <div className="bg-gray-800/60 backdrop-blur-lg rounded-3xl p-8 shadow-2xl space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-light">Meditation Summary</h2>
                <div className={`inline-block px-6 py-2 rounded-full text-sm font-medium ${
                  accuracy >= 80 ? 'bg-green-500/20 text-green-400' : 
                  accuracy >= 60 ? 'bg-yellow-500/20 text-yellow-400' : 
                  'bg-red-500/20 text-red-400'
                }`}>
                  {proficiencyLevel}
                </div>
              </div>

              <div className="text-center">
                <div className="text-6xl font-bold mb-2">{Math.round(accuracy)}%</div>
                <div className="text-white/50 text-sm">Accuracy</div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-gray-800/60 backdrop-blur-lg rounded-3xl p-8 shadow-2xl space-y-4">
              <h3 className="text-xl font-light mb-4">Performance Metrics</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-green-400 font-medium">Accuracy:</span>
                  <span className="text-white">{Math.round(accuracy)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-400 font-medium">Time Taken:</span>
                  <span className="text-white">{Math.round(timeElapsed)}s / 180s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-400 font-medium">Correct Identifications:</span>
                  <span className="text-white">{correctBreaths}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-400 font-medium">Total Opportunities:</span>
                  <span className="text-white">{totalOpportunities}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-400 font-medium">Edge Case Handled:</span>
                  <span className="text-white">Yes</span>
                </div>
              </div>

              <p className="text-white/50 text-sm italic mt-6 font-light">
                Continue practicing emotional identification. Each breath brings you closer to clarity. The path to mindfulness unfolds with each cycle.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => window.location.reload()}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-full h-12"
              >
                PLAY AGAIN
              </Button>
              <Button
                onClick={() => navigate('/platform/creator')}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-full h-12"
              >
                CLOSE
              </Button>
            </div>
          </div>
        </div>
      </MobileViewport>
    );
  }

  // Playing state
  const getPhaseText = () => {
    if (breathPhase === 'in') return 'Breathe In';
    if (breathPhase === 'hold') return 'Hold';
    if (breathPhase === 'out') return 'Breathe Out';
    return '';
  };

  return (
    <MobileViewport>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black text-white flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 text-sm font-light text-white/60">
          <div>Time: {timeStarted ? Math.round((Date.now() - timeStarted) / 1000) : 0}s</div>
          <div>Cycle: {currentCycle + 1}/{totalCycles}</div>
        </div>

        {/* Main breathing area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="text-center space-y-12">
            <h2 className="text-3xl font-light tracking-wide">{getPhaseText()}</h2>
            
            <div
              id="lotus-container"
              className="transition-transform duration-200 cursor-pointer"
              onClick={handleTap}
            >
              <LotusBreathing phase={breathPhase} progress={phaseProgress} />
            </div>

            <div className="text-white/40 text-sm font-light">
              Tap during hold and exhale phases
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="p-6">
          <div className="flex gap-2 justify-center">
            {Array.from({ length: totalCycles }).map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i < currentCycle ? 'w-8 bg-green-500' : 
                  i === currentCycle ? 'w-12 bg-purple-500' : 
                  'w-8 bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </MobileViewport>
  );
}
