import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from './ui/button';

interface VoiceOperatorProps {
  isActive: boolean;
  onSpeakingChange: (speaking: boolean) => void;
  onClose: () => void;
}

export const VoiceOperator = ({ isActive, onSpeakingChange, onClose }: VoiceOperatorProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const { toast } = useToast();
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  console.log('VoiceOperator render - isActive:', isActive);

  useEffect(() => {
    if (!isActive) return;

    console.log('VoiceOperator activated!');

    // Initialize speech synthesis
    synthRef.current = window.speechSynthesis;

    // Initialize speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = async (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        console.log('User said:', text);
        
        // Send to AI and get response
        await handleAIResponse(text);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Error",
          description: "Could not understand audio. Please try again.",
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      console.error('Speech recognition not supported');
      toast({
        title: "Not Supported",
        description: "Voice recognition not supported in this browser.",
        variant: "destructive",
      });
    }

    // Greeting when activated
    console.log('Playing greeting...');
    speakText("Hello Nitin. I am ARIA, your AI survival companion. You can use voice commands and speak to me anytime. I will help and assist you building your human-proof profile.");

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [isActive]);

  const handleAIResponse = async (userMessage: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('voice-chat', {
        body: { message: userMessage }
      });

      if (error) throw error;

      const aiMessage = data.message;
      console.log('AI response:', aiMessage);
      await speakText(aiMessage);
      
    } catch (error) {
      console.error('AI error:', error);
      toast({
        title: "Communication Error",
        description: "Unable to reach mission control. Please try again.",
        variant: "destructive",
      });
    }
  };

  const speakText = async (text: string) => {
    return new Promise<void>((resolve) => {
      if (!synthRef.current) {
        resolve();
        return;
      }

      // Cancel any ongoing speech
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      // Try to use a female voice like Siri
      const voices = synthRef.current.getVoices();
      const femaleVoice = voices.find(v => 
        v.name.includes('Samantha') || 
        v.name.includes('Female') ||
        v.name.includes('Karen') ||
        v.name.includes('Moira') ||
        (v.lang.startsWith('en') && !v.name.includes('Male'))
      ) || voices[0];

      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        onSpeakingChange(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        onSpeakingChange(false);
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        onSpeakingChange(false);
        resolve();
      };

      synthRef.current.speak(utterance);
    });
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-center gap-4 bg-black/80 backdrop-blur-sm p-8 rounded-lg border border-primary/30">
        <div className="flex items-center gap-3">
          {isSpeaking && <Volume2 className="w-6 h-6 text-primary animate-pulse" />}
          <h2 className="text-xl font-bold text-primary">ARIA SYSTEM</h2>
        </div>

        {transcript && (
          <p className="text-sm text-gray-300 max-w-md text-center">
            You: {transcript}
          </p>
        )}

        <div className="flex gap-4">
          <Button
            size="lg"
            variant={isListening ? "destructive" : "default"}
            onClick={isListening ? stopListening : startListening}
            disabled={isSpeaking}
            className="gap-2"
          >
            {isListening ? (
              <>
                <MicOff className="w-5 h-5" />
                Stop
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                Speak
              </>
            )}
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </div>

        <p className="text-xs text-gray-400 text-center max-w-sm">
          {isListening ? "Listening..." : isSpeaking ? "ARIA speaking..." : "Click Speak to talk to ARIA"}
        </p>
      </div>
    </div>
  );
};
