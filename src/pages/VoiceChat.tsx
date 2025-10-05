import { useState, useEffect, useRef, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Globe } from '@/components/GlobeScene';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, MicOff, X, MessageSquare } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function VoiceChat() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [messages, setMessages] = useState<Message[]>([]);
  const [showConversation, setShowConversation] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
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
        setIsUserSpeaking(false);
      };
    }

    // Mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Greeting
    const greeting = "Ready to assist. You can speak now.";
    speakText(greeting);
    setMessages([{ role: 'assistant', content: greeting, timestamp: new Date() }]);

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleAIResponse = async (userMessage: string) => {
    try {
      // Add user message to conversation
      setMessages(prev => [...prev, { 
        role: 'user', 
        content: userMessage, 
        timestamp: new Date() 
      }]);

      const { data, error } = await supabase.functions.invoke('voice-chat', {
        body: { message: userMessage }
      });

      if (error) throw error;

      const aiMessage = data.message;
      
      // Add AI response to conversation
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: aiMessage, 
        timestamp: new Date() 
      }]);
      
      await speakText(aiMessage);
      
    } catch (error) {
      console.error('AI error:', error);
      toast({
        title: "Communication Error",
        description: "Unable to reach ARIA. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speakText = async (text: string) => {
    return new Promise<void>((resolve) => {
      if (!synthRef.current) {
        resolve();
        return;
      }

      synthRef.current.cancel();

      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.1;
        utterance.volume = 0.9;

        const voices = synthRef.current!.getVoices();
        const preferredVoices = [
          'Samantha', 'Karen', 'Victoria', 'Alex',
          'Google US English', 'Microsoft Zira',
          'Google UK English Female'
        ];
        
        const femaleVoice = voices.find(v => 
          preferredVoices.some(pv => v.name.includes(pv))
        ) || voices.find(v => 
          v.lang.startsWith('en-US') && v.name.includes('Female')
        ) || voices[0];

        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }

        utterance.onstart = () => {
          setIsSpeaking(true);
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          resolve();
        };

        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          setIsSpeaking(false);
          resolve();
        };

        synthRef.current!.speak(utterance);
      }, 100);
    });
  };

  const startListening = async () => {
    if (recognitionRef.current && !isListening) {
      try {
        // Set up audio analysis for visual feedback
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 256;

          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const source = audioContextRef.current.createMediaStreamSource(stream);
          source.connect(analyserRef.current);

          // Monitor audio levels
          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const checkAudioLevel = () => {
            if (!analyserRef.current || !isListening) return;

            analyserRef.current.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / bufferLength;
            
            setIsUserSpeaking(average > 30); // Threshold for detecting speech
            
            animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
          };

          checkAudioLevel();
        }

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
      setIsUserSpeaking(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  const handleClose = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    navigate(-1);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Starfield background */}
      <div className="absolute inset-0 z-0">
        <div className="stars-small" />
        <div className="stars-medium" />
        <div className="stars-large" />
      </div>

      {/* 3D Globe */}
      <div className="absolute inset-0 z-5">
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
            <Globe 
              progress={100} 
              mousePosition={mousePosition}
              isSpeaking={isSpeaking || isUserSpeaking}
              onEarthClick={() => {}}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Top controls */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Button
          onClick={() => setShowConversation(!showConversation)}
          className="gap-2 border-2 bg-black/80 backdrop-blur-sm hover:bg-primary/20"
          style={{ 
            borderColor: 'hsl(var(--neon-green))',
            color: 'hsl(var(--neon-green))'
          }}
          size="sm"
        >
          <MessageSquare className="w-4 h-4" />
        </Button>
        <Button
          onClick={handleClose}
          className="gap-2 border-2 bg-black/80 backdrop-blur-sm hover:bg-destructive/20"
          style={{ 
            borderColor: 'hsl(var(--neon-green))',
            color: 'hsl(var(--neon-green))'
          }}
          size="sm"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Conversation Log */}
      {showConversation && messages.length > 1 && (
        <div className="fixed left-4 top-4 bottom-24 w-80 z-50 pointer-events-auto">
          <div className="h-full bg-black/80 backdrop-blur-sm border-2 rounded-lg p-4" style={{ borderColor: 'hsl(var(--neon-green))' }}>
            <h3 className="text-sm font-bold font-mono mb-3 text-glow-green" style={{ color: 'hsl(var(--neon-green))' }}>
              CONVERSATION LOG
            </h3>
            <ScrollArea className="h-[calc(100%-2rem)]">
              <div className="space-y-3 pr-4">
                {messages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 rounded border ${
                      msg.role === 'user' 
                        ? 'bg-black/50 border-white/20' 
                        : 'bg-primary/10 border-primary/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold" style={{ 
                        color: msg.role === 'user' ? 'hsl(var(--neon-green))' : 'hsl(var(--neon-green))' 
                      }}>
                        {msg.role === 'user' ? 'YOU' : 'ARIA'}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {msg.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">{msg.content}</p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Voice Interface */}
      <div className="fixed top-8 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-center gap-3 bg-black/80 backdrop-blur-sm p-6 rounded-lg border-2" style={{ borderColor: 'hsl(var(--neon-green))' }}>
          <h2 className="text-xl font-bold text-glow-green" style={{ color: 'hsl(var(--neon-green))' }}>
            ARIA SYSTEM
          </h2>

          {transcript && (
            <p className="text-sm text-gray-300 max-w-md text-center">
              You: {transcript}
            </p>
          )}

          <Button
            size="lg"
            variant={isListening ? "destructive" : "default"}
            onClick={isListening ? stopListening : startListening}
            disabled={isSpeaking}
            className="gap-2 border-2"
            style={{
              borderColor: isListening ? 'hsl(var(--neon-magenta))' : 'hsl(var(--neon-green))',
              color: isListening ? 'hsl(var(--neon-magenta))' : 'hsl(var(--neon-green))'
            }}
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

          <p className="text-xs text-gray-400 text-center max-w-sm font-mono">
            {isListening ? (isUserSpeaking ? "Listening..." : "Speak now...") : isSpeaking ? "ARIA speaking..." : "Click Speak to talk to ARIA"}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
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
          background-image: radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%);
          background-size: 3px 3px;
          animation: twinkle 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
