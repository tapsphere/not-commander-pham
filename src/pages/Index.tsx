import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Globe } from '@/components/GlobeScene';
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
      {/* Starfield background */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black to-black">
        <div className="stars-small" />
        <div className="stars-medium" />
        <div className="stars-large" />
      </div>

      {/* 3D Globe Canvas */}
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        className="absolute inset-0"
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 3, 5]} intensity={2} color="#ffffff" />
        <pointLight position={[-5, -3, -5]} intensity={0.8} color="#4a90e2" />
        <Suspense fallback={null}>
          <Globe progress={progress} mousePosition={mousePosition} />
        </Suspense>
      </Canvas>

      {/* Loading UI Overlay */}
      <LoadingScreen 
        onProgressUpdate={setProgress}
        onFlip={() => setIsFlipped(true)}
      />

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        
        .stars-small,
        .stars-medium,
        .stars-large {
          position: absolute;
          inset: 0;
          background: transparent;
        }
        
        .stars-small {
          background-image: 
            radial-gradient(1px 1px at 20% 30%, rgba(0, 255, 102, 0.4), transparent),
            radial-gradient(1px 1px at 60% 70%, rgba(0, 255, 102, 0.3), transparent),
            radial-gradient(1px 1px at 50% 50%, rgba(0, 255, 102, 0.4), transparent),
            radial-gradient(1px 1px at 80% 10%, rgba(0, 255, 102, 0.3), transparent),
            radial-gradient(1px 1px at 90% 60%, rgba(0, 255, 102, 0.4), transparent);
          background-size: 200% 200%;
          animation: twinkle 3s infinite;
        }
        
        .stars-medium {
          background-image:
            radial-gradient(2px 2px at 30% 80%, rgba(0, 255, 102, 0.5), transparent),
            radial-gradient(2px 2px at 70% 20%, rgba(0, 255, 102, 0.4), transparent),
            radial-gradient(2px 2px at 40% 40%, rgba(0, 255, 102, 0.5), transparent);
          background-size: 300% 300%;
          animation: twinkle 5s infinite;
        }
        
        .stars-large {
          background-image:
            radial-gradient(3px 3px at 10% 50%, rgba(0, 255, 102, 0.6), transparent),
            radial-gradient(3px 3px at 85% 85%, rgba(0, 255, 102, 0.5), transparent);
          background-size: 400% 400%;
          animation: twinkle 7s infinite;
        }
      `}</style>
    </div>
  );
};

export default Index;
