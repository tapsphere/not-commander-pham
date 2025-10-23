import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Play, Timer, CheckCircle2 } from 'lucide-react';
import { BudgetAllocationGame } from './BudgetAllocationGame';

interface GamePlayerProps {
  sessionId: string;
  templateName: string;
  templateDescription: string;
  runtime: {
    mode: 'training' | 'testing';
    time_limit_s: number;
    accuracy_threshold: number;
    feedback_mode: string;
    randomize: boolean;
  };
  isDemo: boolean;
  onExit: () => void;
}

export function GamePlayer({
  sessionId,
  templateName,
  templateDescription,
  runtime,
  isDemo,
  onExit
}: GamePlayerProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');
  const [timeLeft, setTimeLeft] = useState(runtime.time_limit_s);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  const startGame = () => {
    setGameState('playing');
    setTimeLeft(runtime.time_limit_s);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="p-8">
            <div className="text-center space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{templateName}</h1>
                <p className="text-muted-foreground">{templateDescription}</p>
              </div>

              <div className="bg-muted p-6 rounded-lg space-y-4">
                <h2 className="text-xl font-semibold">
                  {runtime.mode === 'training' ? '🧠 Practice Mode' : '🏁 Validation Mode'}
                </h2>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-primary" />
                    <span>Time Limit: {runtime.time_limit_s}s</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Required: {(runtime.accuracy_threshold * 100).toFixed(0)}%</span>
                  </div>
                </div>

                <div className="text-sm space-y-1 text-left">
                  <p>• Feedback: {runtime.feedback_mode}</p>
                  <p>• Questions: {runtime.randomize ? 'Randomized' : 'Fixed order'}</p>
                  {isDemo && (
                    <p className="text-yellow-500">• Demo mode - Progress not saved</p>
                  )}
                </div>
              </div>

              <Button
                onClick={startGame}
                size="lg"
                className="w-full max-w-md"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Game
              </Button>

              <Button
                onClick={onExit}
                variant="ghost"
              >
                Back
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    return (
      <BudgetAllocationGame
        timeLimit={runtime.time_limit_s}
        onComplete={(finalScore, metrics) => {
          setScore(finalScore);
          setGameState('finished');
        }}
      />
    );
  }

  // Finished state
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-8">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold">Game Complete!</h2>
            
            <div className="bg-muted p-6 rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">Results</p>
              <p className="text-4xl font-bold">{score}%</p>
              <p className="text-sm text-muted-foreground mt-2">
                Required: {(runtime.accuracy_threshold * 100).toFixed(0)}%
              </p>
            </div>

            {isDemo && (
              <p className="text-sm text-yellow-500">
                Demo mode - Your results were not saved. Sign in to track your progress!
              </p>
            )}

            <div className="flex gap-4 justify-center">
              <Button onClick={startGame}>
                Play Again
              </Button>
              <Button onClick={onExit} variant="outline">
                Exit
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
