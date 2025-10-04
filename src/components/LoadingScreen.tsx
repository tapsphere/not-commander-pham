import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface LoadingScreenProps {
  onProgressUpdate?: (progress: number) => void;
  onFlip?: () => void;
}

export const LoadingScreen = ({ onProgressUpdate, onFlip }: LoadingScreenProps) => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'initial' | 'loading' | 'complete'>('initial');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Connecting...');
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (phase === 'loading') {
      const statuses = [
        'Connecting...',
        'Loading assets...',
        'Initializing grid...',
        'Calibrating systems...',
        'Ready'
      ];
      
      let currentStatus = 0;
      const interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 1;
          
          // Update parent component
          if (onProgressUpdate) {
            onProgressUpdate(next);
          }
          
          if (next % 20 === 0 && currentStatus < statuses.length - 1) {
            currentStatus++;
            setStatus(statuses[currentStatus]);
          }
          
          if (next >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setIsFlipped(true);
              if (onFlip) {
                onFlip();
              }
              setTimeout(() => {
                setPhase('complete');
              }, 1000);
            }, 500);
          }
          
          return Math.min(next, 100);
        });
      }, 30);

      return () => clearInterval(interval);
    }
  }, [phase]);

  const handleInitialize = () => {
    setPhase('loading');
  };

  const handleEnterLobby = () => {
    navigate('/lobby');
  };

  return (
    <>
      <div className="fixed inset-0 flex flex-col items-center justify-end pb-24 z-10 px-4">
        {phase === 'initial' && (
          <div className="text-center space-y-8 animate-fade-in">
            <h1 
              className="text-xl font-bold tracking-wider text-glow-green"
              style={{ color: 'hsl(var(--neon-green))' }}
            >
              PLAYOPS
            </h1>

            <h2 
              className="text-3xl md:text-5xl font-bold tracking-widest text-glow-green uppercase"
              style={{ color: 'hsl(var(--neon-green))' }}
            >
              ENTER THE GRID EXPERIENCE
            </h2>

            <Button
              variant="outline"
              size="lg"
              onClick={handleInitialize}
              className="border-2 border-glow-green bg-transparent hover:bg-primary/20 text-lg tracking-widest px-12 py-6 font-bold transition-all duration-300 mt-8"
              style={{ 
                borderColor: 'hsl(var(--neon-green))',
                color: 'hsl(var(--neon-green))'
              }}
            >
              INITIALIZE
            </Button>
          </div>
        )}

        {phase === 'loading' && (
          <>
            {/* Top green line */}
            <div 
              className="fixed top-0 left-0 right-0 h-1 animate-pulse"
              style={{ backgroundColor: 'hsl(var(--neon-green))' }}
            />

            {/* Loading content */}
            <div className="w-full max-w-md space-y-6">
              <p 
                className="text-sm tracking-wider text-center font-mono"
                style={{ color: 'hsl(var(--neon-green))' }}
              >
                LOADING ASSETS...
              </p>
              
              <Progress 
                value={progress} 
                className="h-6 bg-black border-2"
                style={{ borderColor: 'hsl(var(--neon-green))' }}
              />
              
              <p 
                className="text-2xl font-mono text-center"
                style={{ color: 'hsl(var(--neon-green))' }}
              >
                {progress}%
              </p>
              
              <p 
                className="text-sm tracking-wider text-center animate-pulse font-mono"
                style={{ color: 'hsl(var(--neon-green))' }}
              >
                {status}
              </p>
            </div>

            {/* Bottom green line */}
            <div 
              className="fixed bottom-0 left-0 right-0 h-1 animate-pulse"
              style={{ backgroundColor: 'hsl(var(--neon-green))' }}
            />
          </>
        )}

        {phase === 'complete' && (
          <div 
            className="fixed top-0 left-0 right-0 border-4 p-4 animate-slide-in-right cursor-pointer hover:bg-primary/10 transition-all"
            style={{ borderColor: 'hsl(var(--neon-green))' }}
            onClick={handleEnterLobby}
          >
            <p 
              className="text-center text-xl tracking-widest font-bold text-glow-green"
              style={{ color: 'hsl(var(--neon-green))' }}
            >
              ENTER LOBBY →
            </p>
          </div>
        )}
      </div>

      {/* Pass flip state to parent if needed */}
      <div className="hidden">{isFlipped ? 'flipped' : 'normal'}</div>
    </>
  );
};
