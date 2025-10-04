import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Tunnel } from '@/components/TunnelScene';
import { LoadingScreen } from '@/components/LoadingScreen';

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
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* 3D Tunnel Canvas */}
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        className="absolute inset-0"
      >
        <Suspense fallback={null}>
          <Tunnel progress={progress} mousePosition={mousePosition} />
        </Suspense>
      </Canvas>

      {/* Loading UI Overlay */}
      <LoadingScreen 
        onProgressUpdate={setProgress}
        onFlip={() => setIsFlipped(true)}
      />
    </div>
  );
};

export default Index;
