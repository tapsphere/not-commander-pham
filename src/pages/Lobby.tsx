import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GridPerspective } from '@/components/GridPerspective';
import { Button } from '@/components/ui/button';

const Lobby = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in effect
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleEnter = () => {
    navigate('/menu');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <GridPerspective isFlipped={true} />
      
      <div className={`fixed inset-0 flex flex-col items-center justify-center z-10 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {/* Top banner */}
        <div 
          className="fixed top-0 left-0 right-0 border-4 p-6 animate-slide-in-right"
          style={{ borderColor: 'hsl(var(--neon-green))' }}
        >
          <h1 
            className="text-center text-2xl md:text-3xl tracking-widest font-bold text-glow-green"
            style={{ color: 'hsl(var(--neon-green))' }}
          >
            THE GRID ACCESS GRANTED
          </h1>
        </div>

        {/* Center content */}
        <div className="text-center space-y-12 px-4 mt-20">
          <div className="space-y-4">
            <h2 
              className="text-xl md:text-2xl font-bold tracking-wider text-glow-green"
              style={{ color: 'hsl(var(--neon-green))' }}
            >
              PLAYOPS COMMAND CENTER
            </h2>
            <p 
              className="text-sm md:text-base font-mono"
              style={{ color: 'hsl(var(--neon-green))' }}
            >
              Systems Online • Grid Stable • Ready for Operations
            </p>
          </div>

          <Button
            variant="outline"
            size="lg"
            onClick={handleEnter}
            className="border-2 border-glow-green bg-transparent hover:bg-primary/20 text-lg tracking-widest px-16 py-8 font-bold transition-all duration-300 animate-pulse"
            style={{ 
              borderColor: 'hsl(var(--neon-green))',
              color: 'hsl(var(--neon-green))'
            }}
          >
            ACCESS MENU
          </Button>

          {/* Decorative lines */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div 
              className="h-px w-20 md:w-32"
              style={{ backgroundColor: 'hsl(var(--neon-green))' }}
            />
            <div 
              className="w-2 h-2 rotate-45"
              style={{ 
                backgroundColor: 'hsl(var(--neon-green))',
                boxShadow: '0 0 10px hsl(var(--neon-green))'
              }}
            />
            <div 
              className="h-px w-20 md:w-32"
              style={{ backgroundColor: 'hsl(var(--neon-green))' }}
            />
          </div>
        </div>

        {/* Bottom status bar */}
        <div 
          className="fixed bottom-0 left-0 right-0 border-t-2 p-4 backdrop-blur-sm"
          style={{ borderColor: 'hsl(var(--neon-green))' }}
        >
          <div className="flex justify-between items-center text-xs md:text-sm font-mono px-4">
            <span style={{ color: 'hsl(var(--neon-green))' }}>STATUS: ACTIVE</span>
            <span style={{ color: 'hsl(var(--neon-green))' }}>GRID: OPERATIONAL</span>
            <span style={{ color: 'hsl(var(--neon-green))' }}>LATENCY: 0ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
