import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Play, Timer, CheckCircle2, Trophy, Zap, TrendingUp } from 'lucide-react';
import { useGameIframe } from '@/hooks/useGameIframe';
import { calculateV31Level, calculateV31XP } from '@/utils/v3Validator';
import { Badge } from '@/components/ui/badge';

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
  generatedGameHtml?: string | null; // v3.1 generated HTML
}

export function GamePlayer({
  sessionId,
  templateName,
  templateDescription,
  runtime,
  isDemo,
  onExit,
  generatedGameHtml
}: GamePlayerProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');
  const [timeLeft, setTimeLeft] = useState(runtime.time_limit_s);
  const [score, setScore] = useState(0);
  const [v31Level, setV31Level] = useState<'Mastery' | 'Proficient' | 'Needs Work'>('Needs Work');
  const [xp, setXp] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);

  // Use iframe hook for v3.1 games
  const { iframeRef, isReady, result, proof, handleIframeLoad } = useGameIframe({
    onComplete: (gameResult, gameProof) => {
      if (gameResult) {
        // Use v3.1 result if available
        setScore(gameResult.score);
        setV31Level(gameResult.level);
        setXp(gameResult.xp);
        setTimeSpent(gameResult.time_spent);
      }
      setGameState('finished');
    },
    onError: (error) => {
      console.error('Game error:', error);
    }
  });

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
    // If we have generated HTML, use iframe
    if (generatedGameHtml) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="w-full max-w-[425px] space-y-4">
            {/* Timer Header */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Timer className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="text-xl font-bold">{formatTime(timeLeft)}</p>
                  </div>
                </div>
                <Button onClick={onExit} variant="outline" size="sm">
                  Exit
                </Button>
              </div>
            </Card>

            {/* Game Iframe - Mobile View */}
            <Card className="overflow-hidden">
              <iframe
                ref={iframeRef}
                srcDoc={generatedGameHtml}
                className="w-full border-0"
                style={{ height: '812px', minHeight: '600px' }}
                title="Validator Game"
                sandbox="allow-scripts allow-same-origin allow-forms"
                onLoad={handleIframeLoad}
              />
            </Card>
          </div>
        </div>
      );
    }

    // Fallback to hardcoded game for testing
    return (
      <div className="min-h-screen bg-background p-8">
        <Card className="max-w-4xl mx-auto p-8">
          <p className="text-center text-muted-foreground mb-4">
            No generated game available. Using demo game.
          </p>
          <Button onClick={() => {
            setScore(85);
            setV31Level(calculateV31Level(85));
            setXp(calculateV31XP(calculateV31Level(85)));
            setTimeSpent(120);
            setGameState('finished');
          }}>
            Complete Demo Game
          </Button>
        </Card>
      </div>
    );
  }

  // Finished state with v3.1 scoring
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-8">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <h2 className="text-3xl font-bold">Game Complete!</h2>
            </div>
            
            {/* v3.1 Proficiency Level */}
            <div className="space-y-4">
              <Badge 
                className={`text-xl px-6 py-2 ${
                  v31Level === 'Mastery' ? 'bg-green-500' :
                  v31Level === 'Proficient' ? 'bg-blue-500' :
                  'bg-yellow-500'
                }`}
              >
                {v31Level}
              </Badge>
              
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                {/* Score */}
                <div className="bg-muted p-6 rounded-lg">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground mb-2">Score</p>
                  <p className="text-3xl font-bold">{score}%</p>
                </div>

                {/* XP Earned */}
                <div className="bg-muted p-6 rounded-lg">
                  <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                  <p className="text-sm text-muted-foreground mb-2">XP Earned</p>
                  <p className="text-3xl font-bold">{xp}</p>
                </div>

                {/* Time */}
                <div className="bg-muted p-6 rounded-lg">
                  <Timer className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-sm text-muted-foreground mb-2">Time</p>
                  <p className="text-3xl font-bold">{formatTime(timeSpent)}</p>
                </div>
              </div>

              <Progress 
                value={(score / 100) * 100} 
                className="h-3"
              />

              <p className="text-sm text-muted-foreground">
                Required: {(runtime.accuracy_threshold * 100).toFixed(0)}% 
                {score >= (runtime.accuracy_threshold * 100) ? ' ✓ Passed' : ' ✗ Below threshold'}
              </p>
            </div>

            {/* v3.1 Level Descriptions */}
            <div className="bg-muted p-4 rounded-lg text-left text-sm space-y-2">
              <p className="font-semibold">Proficiency Levels (v3.1):</p>
              <p><span className="text-green-500 font-bold">Mastery (90-100%):</span> Expert understanding, 1000 XP</p>
              <p><span className="text-blue-500 font-bold">Proficient (80-89%):</span> Competent performance, 500 XP</p>
              <p><span className="text-yellow-500 font-bold">Needs Work (&lt;80%):</span> Requires improvement, 100 XP</p>
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
