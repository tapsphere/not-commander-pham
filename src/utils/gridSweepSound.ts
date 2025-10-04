// Grid sweep sound effect using Web Audio API
let audioContext: AudioContext | null = null;
let isPlaying = false;

export const playGridSweepSound = () => {
  // Prevent multiple simultaneous plays
  if (isPlaying) return;
  
  // Create audio context if it doesn't exist
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  isPlaying = true;

  // Create oscillator for the sweep sound
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  // Connect nodes
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Configure the sweep sound - futuristic scanning effect
  oscillator.type = 'sine';
  
  const now = audioContext.currentTime;
  const duration = 8; // Match the grid sweep duration
  
  // Frequency sweep from low to high (scanning effect)
  oscillator.frequency.setValueAtTime(150, now);
  oscillator.frequency.exponentialRampToValueAtTime(800, now + duration * 0.5);
  oscillator.frequency.exponentialRampToValueAtTime(400, now + duration);
  
  // Volume envelope - fade in and out
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.08, now + 0.3); // Gentle fade in
  gainNode.gain.linearRampToValueAtTime(0.06, now + duration - 1); // Sustain
  gainNode.gain.linearRampToValueAtTime(0, now + duration); // Fade out
  
  // Add subtle pulse effect
  const lfo = audioContext.createOscillator();
  const lfoGain = audioContext.createGain();
  
  lfo.frequency.value = 4; // Pulse 4 times per second
  lfoGain.gain.value = 0.02; // Subtle modulation
  
  lfo.connect(lfoGain);
  lfoGain.connect(gainNode.gain);
  
  // Start the sound
  oscillator.start(now);
  lfo.start(now);
  
  // Stop after duration
  oscillator.stop(now + duration);
  lfo.stop(now + duration);
  
  oscillator.onended = () => {
    isPlaying = false;
  };
};

// Initialize audio context on user interaction (required by browsers)
export const initAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  
  // Resume if suspended (some browsers suspend audio contexts)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
};
