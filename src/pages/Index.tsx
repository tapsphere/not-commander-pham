import { useEffect } from 'react';

const Index = () => {
  useEffect(() => {
    // Redirect to the Power of Insight game
    window.location.href = '/demo/emotional-intelligence-animals.html';
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-white">Loading...</p>
    </div>
  );
};

export default Index;
