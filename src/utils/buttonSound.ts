// Button click sound effects with operator voice confirmations
let audioContext: AudioContext | null = null;
let speechSynth: SpeechSynthesis | null = null;

const initAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
};

const initSpeechSynth = () => {
  if (!speechSynth && 'speechSynthesis' in window) {
    speechSynth = window.speechSynthesis;
  }
  return speechSynth;
};

// Terminal click sounds - sharp and digital
const soundProfiles = {
  default: { frequency: 1200, duration: 0.03, volume: 0.15 }, // Sharp terminal click
  secondary: { frequency: 1000, duration: 0.03, volume: 0.12 }, // Mid click
  destructive: { frequency: 800, duration: 0.04, volume: 0.18 }, // Warning click
  outline: { frequency: 1100, duration: 0.025, volume: 0.1 }, // Subtle click
  ghost: { frequency: 1050, duration: 0.02, volume: 0.08 }, // Softest click
  link: { frequency: 1150, duration: 0.025, volume: 0.09 }, // Quick tick
};

// Operator voice confirmations for each button type
const voiceConfirmations = {
  default: ['Confirmed', 'Acknowledged', 'Affirmative'],
  secondary: ['Processing', 'Stand by', 'Roger that'],
  destructive: ['Warning', 'Alert', 'Caution advised'],
  outline: ['Access granted', 'Proceeding', 'Copy'],
  ghost: ['Noted', 'Check', 'Received'],
  link: ['Navigation confirmed', 'Accessing', 'Online'],
};

const playTerminalClick = (profile: typeof soundProfiles.default) => {
  try {
    const ctx = initAudioContext();
    const now = ctx.currentTime;
    
    // Create sharp terminal click
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    // Square wave for digital/terminal sound
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(profile.frequency, now);
    
    // Very sharp attack and quick decay for terminal click
    gainNode.gain.setValueAtTime(profile.volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + profile.duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(now);
    oscillator.stop(now + profile.duration);
  } catch (error) {
    console.debug('Terminal click failed:', error);
  }
};

const playOperatorVoice = (variant: keyof typeof voiceConfirmations) => {
  try {
    const synth = initSpeechSynth();
    if (!synth) return;
    
    // Cancel any ongoing speech
    synth.cancel();
    
    const confirmations = voiceConfirmations[variant] || voiceConfirmations.default;
    const message = confirmations[Math.floor(Math.random() * confirmations.length)];
    
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 1.1; // Slightly faster for operator feel
    utterance.pitch = 0.9; // Slightly lower for authority
    utterance.volume = 0.6; // Not too loud
    
    // Try to use a male voice for operator feel
    const voices = synth.getVoices();
    const operatorVoice = voices.find(v => 
      v.name.includes('Male') || v.name.includes('Daniel') || v.name.includes('David')
    ) || voices[0];
    
    if (operatorVoice) {
      utterance.voice = operatorVoice;
    }
    
    synth.speak(utterance);
  } catch (error) {
    console.debug('Operator voice failed:', error);
  }
};

export const playButtonSound = (variant: keyof typeof soundProfiles = 'default') => {
  const profile = soundProfiles[variant] || soundProfiles.default;
  
  // Play terminal click immediately
  playTerminalClick(profile);
  
  // Play operator voice confirmation
  playOperatorVoice(variant as keyof typeof voiceConfirmations);
};
