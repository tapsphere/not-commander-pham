import { useState, useEffect } from 'react';
import { StarField } from '@/components/StarField';
import { GridPerspective } from '@/components/GridPerspective';
import { LoadingScreen } from '@/components/LoadingScreen';

const Index = () => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Listen for flip trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      // This will be triggered by LoadingScreen component
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <StarField />
      <GridPerspective isFlipped={isFlipped} />
      <LoadingScreen />
    </div>
  );
};

export default Index;
