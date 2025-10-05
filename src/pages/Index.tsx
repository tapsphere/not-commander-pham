import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Globe } from '@/components/GlobeScene';
import { LoadingScreen } from '@/components/LoadingScreen';

const Index = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [phase, setPhase] = useState<'initial' | 'loading' | 'complete'>('initial');

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
      {/* Starfield background with parallax */}
      <div 
        className={`absolute inset-0 z-0 ${phase === 'complete' ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
        style={{
          transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <div className="stars-small" />
        <div className="stars-medium" />
        <div className="stars-large" />
      </div>

      {/* 3D Globe Canvas with post-processing */}
      <div 
        className={`absolute inset-0 z-5 ${phase === 'complete' ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
        style={{
          transform: `translate(${-mousePosition.x * 0.01}px, ${-mousePosition.y * 0.01}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 4], fov: 50 }}
          className="w-full h-full"
          style={{ background: 'transparent' }}
          gl={{ 
            antialias: true,
            powerPreference: 'high-performance'
          }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 3, 5]} intensity={2.5} color="#ffffff" castShadow />
          <directionalLight position={[-5, -3, -5]} intensity={0.3} color="#1a2a4a" />
          <pointLight position={[-3, 0, 3]} intensity={1.2} color="#4a90e2" />
          <pointLight position={[0, 5, 0]} intensity={0.5} color="#ffffff" />
          <Suspense fallback={null}>
            <Globe progress={progress} mousePosition={mousePosition} />
          </Suspense>
        </Canvas>
      </div>

      {/* Loading UI Overlay */}
      <LoadingScreen 
        onProgressUpdate={setProgress}
        onFlip={() => setIsFlipped(true)}
        onPhaseChange={setPhase}
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
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%);
          background-position: 20% 30%, 60% 70%, 50% 50%, 80% 10%, 90% 60%, 15% 80%, 40% 15%, 75% 45%, 25% 65%, 55% 25%, 35% 85%, 85% 35%, 5% 55%, 95% 75%, 45% 5%, 12% 42%;
          background-size: 4px 4px, 3px 3px, 3px 3px, 3px 3px, 3px 3px, 3px 3px, 3px 3px, 3px 3px, 3px 3px, 3px 3px, 3px 3px, 3px 3px, 3px 3px, 3px 3px, 3px 3px, 3px 3px;
          background-repeat: no-repeat;
          animation: twinkle 2s infinite ease-in-out, float 15s infinite ease-in-out;
        }
        
        .stars-medium {
          background-image:
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%);
          background-position: 30% 80%, 70% 20%, 40% 40%, 85% 65%, 10% 15%, 65% 55%, 45% 90%, 92% 42%, 18% 68%, 72% 8%;
          background-size: 6px 6px, 5px 5px, 5px 5px, 5px 5px, 5px 5px, 5px 5px, 5px 5px, 5px 5px, 5px 5px, 5px 5px;
          background-repeat: no-repeat;
          animation: twinkle 3s infinite ease-in-out, float 20s infinite ease-in-out reverse;
        }
        
        .stars-large {
          background-image:
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%);
          background-position: 10% 50%, 85% 85%, 25% 25%, 95% 15%, 50% 90%, 12% 72%, 78% 48%, 33% 58%;
          background-size: 8px 8px, 6px 6px, 6px 6px, 6px 6px, 6px 6px, 6px 6px, 6px 6px, 6px 6px;
          background-repeat: no-repeat;
          animation: pulse 4s infinite ease-in-out, float 25s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Index;
