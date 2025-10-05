// Button click sound effects
let audioContext: AudioContext | null = null;

const initAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
};

// Different sound profiles for button variants
const soundProfiles = {
  default: { frequency: 800, duration: 0.08, volume: 0.15 }, // Primary - higher pitch
  secondary: { frequency: 600, duration: 0.08, volume: 0.12 }, // Secondary - mid tone
  destructive: { frequency: 400, duration: 0.12, volume: 0.18 }, // Warning - lower, longer
  outline: { frequency: 700, duration: 0.06, volume: 0.1 }, // Subtle click
  ghost: { frequency: 650, duration: 0.05, volume: 0.08 }, // Softest
  link: { frequency: 750, duration: 0.05, volume: 0.09 }, // Quick tick
};

export const playButtonSound = (variant: keyof typeof soundProfiles = 'default') => {
  try {
    const ctx = initAudioContext();
    const profile = soundProfiles[variant] || soundProfiles.default;
    
    const now = ctx.currentTime;
    
    // Create a short, punchy click sound
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    // Use a sine wave for a clean click
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(profile.frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(profile.frequency * 0.5, now + profile.duration);
    
    // Add a bandpass filter for more realistic sound
    filter.type = 'bandpass';
    filter.frequency.value = profile.frequency;
    filter.Q.value = 1;
    
    // Quick attack and release for a click sound
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(profile.volume, now + 0.01); // Fast attack
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + profile.duration); // Fast decay
    
    // Connect nodes
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Play the sound
    oscillator.start(now);
    oscillator.stop(now + profile.duration);
  } catch (error) {
    // Silently fail if audio context isn't available
    console.debug('Button sound failed:', error);
  }
};
