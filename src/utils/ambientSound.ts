// Ambient background sound for immersive atmosphere
let audioContext: AudioContext | null = null;
let isPlaying = false;
let audioNodes: AudioScheduledSourceNode[] = [];
let gainNodes: GainNode[] = [];

export const playAmbientSound = () => {
  // Prevent multiple simultaneous plays
  if (isPlaying) return;
  
  // Create audio context if it doesn't exist
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  isPlaying = true;
  const now = audioContext.currentTime;
  
  // Create deep space ambient drone with multiple layers
  const frequencies = [55, 82.5, 110, 165]; // Deep bass frequencies (A1, E2, A2, E3)
  
  frequencies.forEach((freq, index) => {
    const oscillator = audioContext!.createOscillator();
    const gainNode = audioContext!.createGain();
    const filter = audioContext!.createBiquadFilter();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = freq;
    
    // Lowpass filter for warmth
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.Q.value = 0.5;
    
    // Very subtle volume with slow fade in
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.02 / (index + 1), now + 3); // Slow 3-second fade in
    
    // Add slow modulation for movement
    const lfo = audioContext!.createOscillator();
    const lfoGain = audioContext!.createGain();
    lfo.frequency.value = 0.1 + (index * 0.05); // Very slow modulation
    lfoGain.gain.value = 0.003; // Subtle
    
    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain);
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext!.destination);
    
    oscillator.start(now);
    lfo.start(now);
    
    audioNodes.push(oscillator);
    audioNodes.push(lfo);
    gainNodes.push(gainNode);
  });
  
  // Add subtle noise layer for texture
  const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 2, audioContext.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseData.length; i++) {
    noiseData[i] = (Math.random() * 2 - 1) * 0.02;
  }
  
  const noiseSource = audioContext.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  noiseSource.loop = true;
  
  const noiseFilter = audioContext.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.value = 200;
  
  const noiseGain = audioContext.createGain();
  noiseGain.gain.setValueAtTime(0, now);
  noiseGain.gain.linearRampToValueAtTime(0.008, now + 4); // Even more subtle
  
  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(audioContext.destination);
  
  noiseSource.start(now);
  audioNodes.push(noiseSource);
  gainNodes.push(noiseGain);
};

export const stopAmbientSound = () => {
  if (!audioContext || !isPlaying) return;
  
  const now = audioContext.currentTime;
  
  // Fade out all sounds
  gainNodes.forEach(gainNode => {
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.linearRampToValueAtTime(0, now + 2); // 2-second fade out
  });
  
  // Stop all oscillators after fade out
  setTimeout(() => {
    audioNodes.forEach(node => {
      try {
        node.stop();
      } catch (e) {
        // Ignore if already stopped
      }
    });
    audioNodes = [];
    gainNodes = [];
    isPlaying = false;
  }, 2000);
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
