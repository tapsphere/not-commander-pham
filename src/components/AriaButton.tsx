import { useState } from 'react';
import { Button } from './ui/button';
import { Globe, Mic } from 'lucide-react';
import { VoiceOperator } from './VoiceOperator';

export const AriaButton = () => {
  const [isAriaActive, setIsAriaActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsAriaActive(true)}
        className="fixed top-4 left-4 z-40 gap-2 border-2 bg-black/80 backdrop-blur-sm hover:bg-primary/20 transition-all"
        style={{ 
          borderColor: 'hsl(var(--neon-green))',
          color: 'hsl(var(--neon-green))',
          animation: isSpeaking ? 'pulse 1.5s ease-in-out infinite' : 'none'
        }}
        size="sm"
      >
        {isSpeaking ? (
          <Mic className="w-4 h-4 animate-pulse" style={{ color: 'hsl(var(--neon-green))' }} />
        ) : (
          <Globe className="w-4 h-4" style={{ color: 'hsl(var(--neon-green))' }} />
        )}
        <span className="text-xs font-mono font-bold">ARIA</span>
      </Button>

      <VoiceOperator 
        isActive={isAriaActive}
        onSpeakingChange={setIsSpeaking}
        onClose={() => setIsAriaActive(false)}
      />
    </>
  );
};
