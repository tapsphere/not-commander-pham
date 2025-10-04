import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Connecting...');
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const statuses = [
      'Connecting...',
      'Loading assets...',
      'Initializing grid...',
      'Calibrating systems...',
      'Ready to enter'
    ];
    
    let currentStatus = 0;
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;
        
        // Update status based on progress
        if (next % 20 === 0 && currentStatus < statuses.length - 1) {
          currentStatus++;
          setStatus(statuses[currentStatus]);
        }
        
        if (next >= 100) {
          clearInterval(interval);
          setShowButton(true);
          setStatus('Ready to enter');
        }
        
        return Math.min(next, 100);
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-10">
      <div className="text-center space-y-8 px-4">
        {/* Brand */}
        <h1 className="text-2xl font-bold tracking-wider text-glow-pink" style={{ color: 'hsl(var(--neon-pink))' }}>
          PLAYOPS
        </h1>

        {/* Main Title */}
        <h2 
          className="text-4xl md:text-6xl font-bold tracking-widest text-glow-orange uppercase"
          style={{ color: 'hsl(var(--neon-orange))' }}
        >
          ENTER THE GRID EXPERIENCE
        </h2>

        {/* Initialize Button or Loading */}
        {!showButton ? (
          <div className="space-y-6 max-w-md mx-auto">
            <div className="space-y-2">
              <p className="text-sm tracking-wider" style={{ color: 'hsl(var(--neon-cyan))' }}>
                LOADING ASSETS...
              </p>
              <Progress value={progress} className="h-2 bg-muted" />
              <p className="text-lg font-mono" style={{ color: 'hsl(var(--neon-cyan))' }}>
                {progress}%
              </p>
            </div>
            <p className="text-sm tracking-wider animate-pulse" style={{ color: 'hsl(var(--neon-cyan))' }}>
              {status}
            </p>
          </div>
        ) : (
          <Button
            variant="outline"
            size="lg"
            className="border-2 border-glow-green bg-transparent hover:bg-accent/20 text-lg tracking-widest px-12 py-6 font-bold transition-all duration-300"
            style={{ 
              borderColor: 'hsl(var(--neon-green))',
              color: 'hsl(var(--neon-green))'
            }}
            onClick={() => {
              // Add your navigation logic here
              console.log('Entering lobby...');
            }}
          >
            INITIALIZE
          </Button>
        )}

        {showButton && (
          <p 
            className="text-sm tracking-wider animate-pulse text-glow-cyan mt-4"
            style={{ color: 'hsl(var(--neon-cyan))' }}
          >
            Enter Lobby
          </p>
        )}
      </div>
    </div>
  );
};
