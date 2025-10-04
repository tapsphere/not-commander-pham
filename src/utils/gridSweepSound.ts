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

  const now = audioContext.currentTime;
  const duration = 8; // Match the grid sweep duration
  
  // Create white noise buffer for static effect
  const bufferSize = audioContext.sampleRate * duration;
  const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  
  // Generate filtered static noise
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  
  // Create buffer source
  const whiteNoise = audioContext.createBufferSource();
  whiteNoise.buffer = noiseBuffer;
  
  // Create filter to shape the static sound
  const filter = audioContext.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2000, now);
  filter.Q.value = 0.5;
  
  // Add some frequency modulation for movement
  filter.frequency.exponentialRampToValueAtTime(4000, now + duration * 0.3);
  filter.frequency.exponentialRampToValueAtTime(1500, now + duration);
  
  // Create gain for volume control
  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.12, now + 0.2); // Quick fade in
  gainNode.gain.linearRampToValueAtTime(0.08, now + duration - 0.5); // Sustain
  gainNode.gain.linearRampToValueAtTime(0, now + duration); // Fade out
  
  // Connect nodes
  whiteNoise.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Start the static sound
  whiteNoise.start(now);
  whiteNoise.stop(now + duration);
  
  whiteNoise.onended = () => {
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
