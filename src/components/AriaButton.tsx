import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Globe } from 'lucide-react';

export const AriaButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate('/voice-chat')}
      className="fixed top-4 left-4 z-40 gap-2 bg-card/90 backdrop-blur-sm border border-border text-foreground hover:bg-accent transition-all"
      size="sm"
    >
      <Globe className="w-4 h-4" />
      <span className="text-xs font-mono font-medium">ARIA</span>
    </Button>
  );
};
