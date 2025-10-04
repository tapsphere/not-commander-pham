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
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-30px) translateX(15px); }
          50% { transform: translateY(-15px) translateX(-15px); }
          75% { transform: translateY(-45px) translateX(8px); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.5); opacity: 1; }
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
            radial-gradient(4px 4px at 20% 30%, #ffffff, transparent),
            radial-gradient(4px 4px at 60% 70%, #ffffff, transparent),
            radial-gradient(4px 4px at 50% 50%, #ffffff, transparent),
            radial-gradient(4px 4px at 80% 10%, #ffffff, transparent),
            radial-gradient(4px 4px at 90% 60%, #ffffff, transparent),
            radial-gradient(3px 3px at 15% 80%, #ffffff, transparent),
            radial-gradient(3px 3px at 40% 15%, #ffffff, transparent),
            radial-gradient(3px 3px at 75% 45%, #ffffff, transparent),
            radial-gradient(3px 3px at 25% 65%, #ffffff, transparent),
            radial-gradient(3px 3px at 55% 25%, #ffffff, transparent),
            radial-gradient(3px 3px at 35% 85%, #ffffff, transparent),
            radial-gradient(3px 3px at 85% 35%, #ffffff, transparent),
            radial-gradient(3px 3px at 5% 55%, #ffffff, transparent),
            radial-gradient(3px 3px at 95% 75%, #ffffff, transparent),
            radial-gradient(3px 3px at 45% 5%, #ffffff, transparent),
            radial-gradient(3px 3px at 12% 42%, #ffffff, transparent);
          background-size: 100% 100%;
          background-repeat: no-repeat;
          animation: twinkle 2s infinite ease-in-out, float 15s infinite ease-in-out;
        }
        
        .stars-medium {
          background-image:
            radial-gradient(6px 6px at 30% 80%, #ffffff, transparent),
            radial-gradient(6px 6px at 70% 20%, #ffffff, transparent),
            radial-gradient(6px 6px at 40% 40%, #ffffff, transparent),
            radial-gradient(5px 5px at 85% 65%, #ffffff, transparent),
            radial-gradient(5px 5px at 10% 15%, #ffffff, transparent),
            radial-gradient(5px 5px at 65% 55%, #ffffff, transparent),
            radial-gradient(5px 5px at 45% 90%, #ffffff, transparent),
            radial-gradient(5px 5px at 92% 42%, #ffffff, transparent),
            radial-gradient(5px 5px at 18% 68%, #ffffff, transparent),
            radial-gradient(5px 5px at 72% 8%, #ffffff, transparent);
          background-size: 100% 100%;
          background-repeat: no-repeat;
          animation: twinkle 3s infinite ease-in-out, float 20s infinite ease-in-out reverse;
        }
        
        .stars-large {
          background-image:
            radial-gradient(8px 8px at 10% 50%, #ffffff, transparent),
            radial-gradient(8px 8px at 85% 85%, #ffffff, transparent),
            radial-gradient(7px 7px at 25% 25%, #00ff66, transparent),
            radial-gradient(7px 7px at 95% 15%, #00ff66, transparent),
            radial-gradient(7px 7px at 50% 90%, #ffffff, transparent),
            radial-gradient(7px 7px at 12% 72%, #ffffff, transparent),
            radial-gradient(6px 6px at 78% 48%, #00ff66, transparent),
            radial-gradient(6px 6px at 33% 58%, #ffffff, transparent);
          background-size: 100% 100%;
          background-repeat: no-repeat;
          animation: pulse 4s infinite ease-in-out, float 25s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Index;
