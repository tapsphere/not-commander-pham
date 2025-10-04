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
  
  // Create multiple crackling/sparking sounds
  const createSpark = (startTime: number, intensity: number) => {
    // Create short burst of noise for spark
    const bufferSize = audioContext!.sampleRate * 0.05; // 50ms spark
    const noiseBuffer = audioContext!.createBuffer(1, bufferSize, audioContext!.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    // Generate crackling noise with sharp attack
    for (let i = 0; i < bufferSize; i++) {
      const envelope = Math.exp(-i / (bufferSize * 0.3)); // Sharp decay
      output[i] = (Math.random() * 2 - 1) * envelope;
    }
    
    const spark = audioContext!.createBufferSource();
    spark.buffer = noiseBuffer;
    
    // High-pass filter for electric crackle
    const filter = audioContext!.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000 + Math.random() * 2000;
    filter.Q.value = 2;
    
    const gainNode = audioContext!.createGain();
    gainNode.gain.value = intensity * 0.15;
    
    spark.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext!.destination);
    
    spark.start(startTime);
  };
  
  // Create multiple sparks over the duration for continuous crackling
  const sparkCount = 80; // Number of sparks
  for (let i = 0; i < sparkCount; i++) {
    const sparkTime = now + (i / sparkCount) * duration;
    const intensity = 0.5 + Math.random() * 0.5; // Varying intensities
    
    // Add some randomness to timing for natural crackle
    const jitter = (Math.random() - 0.5) * 0.05;
    createSpark(sparkTime + jitter, intensity);
  }
  
  // Add underlying arc sound
  const oscillator = audioContext.createOscillator();
  const oscGain = audioContext.createGain();
  
  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(80, now);
  oscillator.frequency.exponentialRampToValueAtTime(120, now + duration);
  
  oscGain.gain.setValueAtTime(0, now);
  oscGain.gain.linearRampToValueAtTime(0.03, now + 0.1);
  oscGain.gain.linearRampToValueAtTime(0.02, now + duration - 0.5);
  oscGain.gain.linearRampToValueAtTime(0, now + duration);
  
  oscillator.connect(oscGain);
  oscGain.connect(audioContext.destination);
  
  oscillator.start(now);
  oscillator.stop(now + duration);
  
  setTimeout(() => {
    isPlaying = false;
  }, duration * 1000);
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
