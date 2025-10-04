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
      <div className="absolute inset-0 z-0">
        <div className="stars-small" />
        <div className="stars-medium" />
        <div className="stars-large" />
      </div>

      {/* 3D Globe Canvas */}
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        className="absolute inset-0 z-5"
        style={{ background: 'transparent' }}
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
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
        
        @keyframes drift {
          0% { transform: translateX(0px); }
          100% { transform: translateX(100vw); }
        }
        
        .stars-small,
        .stars-medium,
        .stars-large {
          position: absolute;
          inset: 0;
          background: transparent;
          pointer-events: none;
        }
        
        .stars-small {
          background-image: 
            radial-gradient(3px 3px at 20% 30%, rgba(255, 255, 255, 1), transparent),
            radial-gradient(3px 3px at 60% 70%, rgba(255, 255, 255, 0.9), transparent),
            radial-gradient(3px 3px at 50% 50%, rgba(255, 255, 255, 1), transparent),
            radial-gradient(3px 3px at 80% 10%, rgba(255, 255, 255, 0.8), transparent),
            radial-gradient(3px 3px at 90% 60%, rgba(255, 255, 255, 1), transparent),
            radial-gradient(2px 2px at 15% 80%, rgba(255, 255, 255, 0.9), transparent),
            radial-gradient(2px 2px at 40% 15%, rgba(255, 255, 255, 0.8), transparent),
            radial-gradient(2px 2px at 75% 45%, rgba(255, 255, 255, 1), transparent),
            radial-gradient(2px 2px at 25% 65%, rgba(255, 255, 255, 0.9), transparent),
            radial-gradient(2px 2px at 55% 25%, rgba(255, 255, 255, 0.8), transparent),
            radial-gradient(2px 2px at 35% 85%, rgba(255, 255, 255, 1), transparent),
            radial-gradient(2px 2px at 85% 35%, rgba(255, 255, 255, 0.9), transparent),
            radial-gradient(2px 2px at 5% 55%, rgba(255, 255, 255, 0.8), transparent),
            radial-gradient(2px 2px at 95% 75%, rgba(255, 255, 255, 1), transparent);
          background-size: 100% 100%;
          background-repeat: no-repeat;
          animation: twinkle 2s infinite, float 20s infinite ease-in-out;
        }
        
        .stars-medium {
          background-image:
            radial-gradient(4px 4px at 30% 80%, rgba(255, 255, 255, 1), transparent),
            radial-gradient(4px 4px at 70% 20%, rgba(255, 255, 255, 0.9), transparent),
            radial-gradient(4px 4px at 40% 40%, rgba(255, 255, 255, 1), transparent),
            radial-gradient(3px 3px at 85% 65%, rgba(255, 255, 255, 0.9), transparent),
            radial-gradient(3px 3px at 10% 15%, rgba(255, 255, 255, 0.8), transparent),
            radial-gradient(3px 3px at 65% 55%, rgba(255, 255, 255, 1), transparent),
            radial-gradient(3px 3px at 45% 90%, rgba(255, 255, 255, 0.9), transparent),
            radial-gradient(3px 3px at 92% 42%, rgba(255, 255, 255, 0.8), transparent);
          background-size: 100% 100%;
          background-repeat: no-repeat;
          animation: twinkle 4s infinite, float 25s infinite ease-in-out reverse;
        }
        
        .stars-large {
          background-image:
            radial-gradient(5px 5px at 10% 50%, rgba(255, 255, 255, 1), transparent),
            radial-gradient(5px 5px at 85% 85%, rgba(255, 255, 255, 1), transparent),
            radial-gradient(4px 4px at 25% 25%, rgba(0, 255, 102, 1), transparent),
            radial-gradient(4px 4px at 95% 15%, rgba(0, 255, 102, 0.9), transparent),
            radial-gradient(4px 4px at 50% 90%, rgba(255, 255, 255, 1), transparent),
            radial-gradient(4px 4px at 12% 72%, rgba(255, 255, 255, 0.9), transparent),
            radial-gradient(3px 3px at 78% 48%, rgba(0, 255, 102, 0.8), transparent);
          background-size: 100% 100%;
          background-repeat: no-repeat;
          animation: twinkle 6s infinite, float 30s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Index;
