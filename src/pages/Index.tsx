import { GridBackground } from '@/components/GridBackground';
import { LoadingScreen } from '@/components/LoadingScreen';

const Index = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <GridBackground />
      <LoadingScreen />
    </div>
  );
};

export default Index;
