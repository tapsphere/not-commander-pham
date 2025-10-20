interface LotusBreathingProps {
  phase: 'in' | 'hold' | 'out' | 'idle';
  progress: number;
}

export const LotusBreathing = ({ phase, progress }: LotusBreathingProps) => {
  const getScale = () => {
    if (phase === 'idle') return 0.8;
    if (phase === 'in') return 0.8 + (progress * 0.4); // Scale from 0.8 to 1.2
    if (phase === 'hold') return 1.2;
    if (phase === 'out') return 1.2 - (progress * 0.4); // Scale from 1.2 to 0.8
    return 0.8;
  };

  const getGradient = () => {
    const greenAmount = phase === 'in' ? progress * 100 : (phase === 'hold' ? 100 : (phase === 'out' ? (1 - progress) * 100 : 50));
    return `linear-gradient(135deg, rgba(76, 175, 80, ${0.3 + (greenAmount / 200)}) 0%, rgba(156, 39, 176, ${0.3 + ((100 - greenAmount) / 200)}) 100%)`;
  };

  return (
    <div className="relative w-80 h-80 flex items-center justify-center">
      {/* Outer breathing circle */}
      <div
        className="absolute rounded-full transition-all duration-1000 ease-in-out"
        style={{
          width: '100%',
          height: '100%',
          background: getGradient(),
          transform: `scale(${getScale()})`,
          boxShadow: phase === 'hold' 
            ? '0 0 60px rgba(76, 175, 80, 0.6), 0 0 120px rgba(156, 39, 176, 0.4)'
            : phase === 'in'
            ? '0 0 40px rgba(76, 175, 80, 0.4)'
            : '0 0 30px rgba(156, 39, 176, 0.3)'
        }}
      />
      
      {/* Lotus flower SVG */}
      <div className="relative z-10">
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          {/* Center circle */}
          <circle cx="60" cy="65" r="8" fill="white" opacity="0.9" />
          
          {/* Petals */}
          <ellipse cx="60" cy="45" rx="12" ry="25" fill="white" opacity="0.7" />
          <ellipse cx="60" cy="45" rx="12" ry="25" fill="white" opacity="0.7" transform="rotate(45 60 60)" />
          <ellipse cx="60" cy="45" rx="12" ry="25" fill="white" opacity="0.7" transform="rotate(90 60 60)" />
          <ellipse cx="60" cy="45" rx="12" ry="25" fill="white" opacity="0.7" transform="rotate(135 60 60)" />
          <ellipse cx="60" cy="45" rx="12" ry="25" fill="white" opacity="0.7" transform="rotate(180 60 60)" />
          <ellipse cx="60" cy="45" rx="12" ry="25" fill="white" opacity="0.7" transform="rotate(225 60 60)" />
          <ellipse cx="60" cy="45" rx="12" ry="25" fill="white" opacity="0.7" transform="rotate(270 60 60)" />
          <ellipse cx="60" cy="45" rx="12" ry="25" fill="white" opacity="0.7" transform="rotate(315 60 60)" />
          
          {/* Inner petals */}
          <ellipse cx="60" cy="50" rx="8" ry="18" fill="white" opacity="0.85" />
          <ellipse cx="60" cy="50" rx="8" ry="18" fill="white" opacity="0.85" transform="rotate(60 60 60)" />
          <ellipse cx="60" cy="50" rx="8" ry="18" fill="white" opacity="0.85" transform="rotate(120 60 60)" />
          <ellipse cx="60" cy="50" rx="8" ry="18" fill="white" opacity="0.85" transform="rotate(180 60 60)" />
          <ellipse cx="60" cy="50" rx="8" ry="18" fill="white" opacity="0.85" transform="rotate(240 60 60)" />
          <ellipse cx="60" cy="50" rx="8" ry="18" fill="white" opacity="0.85" transform="rotate(300 60 60)" />
        </svg>
      </div>
      
      {/* Lotus Flower text */}
      <div className="absolute bottom-16 text-white/60 text-sm font-light tracking-wider">
        Lotus Flower
      </div>
    </div>
  );
};
