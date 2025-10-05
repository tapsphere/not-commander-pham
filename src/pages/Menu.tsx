import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, User, Hexagon, TrendingUp, Wallet } from 'lucide-react';

const menuItems = [
  { icon: Home, label: 'Hub', path: '/lobby' },
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: Hexagon, label: 'Inventory', path: '/inventory' },
  { icon: TrendingUp, label: 'Leaderboard', path: '/leaderboard' },
  { icon: Wallet, label: 'Wallet', path: '/wallet' },
];

const Menu = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleNavigation = (path: string, index: number) => {
    setActiveIndex(index);
    navigate(path);
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-black">
      {/* Starfield background */}
      <div className="absolute inset-0 z-0">
        <div className="stars-small" />
        <div className="stars-medium" />
        <div className="stars-large" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col pb-24">
        {/* Header */}
        <div 
          className="border-b-2 p-6"
          style={{ borderColor: 'hsl(var(--neon-green))' }}
        >
          <h1 
            className="text-2xl md:text-3xl font-bold tracking-widest text-center text-glow-green"
            style={{ color: 'hsl(var(--neon-green))' }}
          >
            GAIN ACCESS
          </h1>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-6">
            <div className="relative">
              <div 
                className="absolute inset-0 rounded-lg opacity-20 blur-2xl"
                style={{ 
                  background: 'radial-gradient(circle, hsl(var(--neon-magenta)), hsl(var(--neon-purple)), hsl(var(--neon-green)))'
                }}
              />
              <div className="relative w-24 h-24 mx-auto rounded-lg bg-black border-2 flex items-center justify-center mb-6 animate-pulse" style={{ borderColor: 'hsl(var(--neon-green))' }}>
                <Wallet className="w-12 h-12" style={{ color: 'hsl(var(--neon-green))' }} strokeWidth={2.5} />
              </div>
            </div>
            <p 
              className="text-xl font-mono tracking-wide text-glow-green"
              style={{ color: 'hsl(var(--neon-green))' }}
            >
              Navigate to train, validate, and prove your competencies
            </p>
            <p 
              className="text-sm font-mono"
              style={{ color: 'hsl(var(--neon-green) / 0.6)' }}
            >
              Select a section from the menu below
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div 
        className="fixed bottom-0 left-0 right-0 border-t-2 bg-black/95 backdrop-blur-lg z-50"
        style={{ borderColor: 'hsl(var(--neon-green))' }}
      >
        <nav className="flex items-center justify-around px-2 py-2 max-w-screen-xl mx-auto">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeIndex === index;
            const usePurple = index === 2;
            const accentColor = usePurple ? 'hsl(var(--neon-purple))' : 'hsl(var(--neon-green))';
            const glowClass = usePurple ? 'text-glow-purple' : 'text-glow-green';
            
            return (
              <button
                key={item.label}
                onClick={() => handleNavigation(item.path, index)}
                className="flex flex-col items-center gap-1 flex-1 max-w-[90px] group transition-all duration-300 relative"
              >
                {/* Glow effect on active */}
                {isActive && (
                  <div 
                    className="absolute inset-0 rounded-lg opacity-20 blur-md"
                    style={{ 
                      background: accentColor
                    }}
                  />
                )}
                <div 
                  className={`
                    relative p-2.5 rounded-lg border-2 transition-all duration-300
                    ${isActive ? 'bg-primary/20 scale-110' : 'border-transparent hover:bg-primary/10 hover:border-primary/30'}
                  `}
                  style={isActive ? { borderColor: accentColor } : {}}
                >
                  <Icon 
                    className={`w-5 h-5 md:w-6 md:h-6 transition-all duration-300 ${isActive ? glowClass : ''}`}
                    style={{ color: accentColor }}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                <span 
                  className={`text-[10px] md:text-xs font-mono transition-all duration-300 truncate w-full text-center ${isActive ? glowClass + ' font-bold' : ''}`}
                  style={{ color: accentColor }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-30px) translateX(15px); }
          50% { transform: translateY(-15px) translateX(-15px); }
          75% { transform: translateY(-45px) translateX(8px); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.5); opacity: 1; }
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
          background-image: 
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%);
          background-position: 20% 30%, 60% 70%, 50% 50%, 80% 10%, 90% 60%, 15% 80%, 40% 15%, 75% 45%, 25% 65%, 55% 25%, 35% 85%, 85% 35%, 5% 55%, 95% 75%, 45% 5%, 12% 42%;
          background-size: 4px 4px, 3px 3px, 3px 3px, 3px 3px, 3px 3px, 3px 3px, 3px 3px, 3px 3px, 3px 3px, 3px 3px, 3px 3px, 3px 3px, 3px 3px, 3px 3px, 3px 3px, 3px 3px;
          background-repeat: no-repeat;
          animation: twinkle 2s infinite ease-in-out, float 15s infinite ease-in-out;
        }
        
        .stars-medium {
          background-image:
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%);
          background-position: 30% 80%, 70% 20%, 40% 40%, 85% 65%, 10% 15%, 65% 55%, 45% 90%, 92% 42%, 18% 68%, 72% 8%;
          background-size: 6px 6px, 5px 5px, 5px 5px, 5px 5px, 5px 5px, 5px 5px, 5px 5px, 5px 5px, 5px 5px, 5px 5px;
          background-repeat: no-repeat;
          animation: twinkle 3s infinite ease-in-out, float 20s infinite ease-in-out reverse;
        }
        
        .stars-large {
          background-image:
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%),
            radial-gradient(circle, #ffffff 0%, #ffffff 40%, transparent 60%);
          background-position: 10% 50%, 85% 85%, 25% 25%, 95% 15%, 50% 90%, 12% 72%, 78% 48%, 33% 58%;
          background-size: 8px 8px, 6px 6px, 6px 6px, 6px 6px, 6px 6px, 6px 6px, 6px 6px, 6px 6px;
          background-repeat: no-repeat;
          animation: pulse 4s infinite ease-in-out, float 25s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Menu;
