import { useState, useEffect } from 'react';
import { ReactiveStarField } from '@/components/ReactiveStarField';
import { ParallaxGrid } from '@/components/ParallaxGrid';
import { LoadingScreen } from '@/components/LoadingScreen';
import { AtmosphericEffects } from '@/components/AtmosphericEffects';

const Index = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        setMousePosition({ 
          x: e.touches[0].clientX, 
          y: e.touches[0].clientY 
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <ReactiveStarField mousePosition={mousePosition} />
      <ParallaxGrid 
        isFlipped={isFlipped} 
        progress={progress}
        mousePosition={mousePosition}
      />
      <AtmosphericEffects progress={progress} />
      <LoadingScreen 
        onProgressUpdate={setProgress}
        onFlip={() => setIsFlipped(true)}
      />
    </div>
  );
};

export default Index;
