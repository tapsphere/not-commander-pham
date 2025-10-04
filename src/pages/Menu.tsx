import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, User, Package, Trophy, BookOpen, Wallet, ChevronRight } from 'lucide-react';
import { StarField } from '@/components/StarField';

const menuItems = [
  { icon: Home, label: 'Home', path: '/lobby' },
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: Package, label: 'Inventory', path: '/inventory' },
  { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
  { icon: BookOpen, label: 'Lore Drops', path: '/lore' },
  { icon: Wallet, label: 'Wallet', path: '/wallet' },
];

const Menu = () => {
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleNavigation = (path: string) => {
    if (path === '/lobby') {
      navigate('/lobby');
    } else {
      console.log(`Navigating to ${path}`);
      // Add navigation logic for other pages
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      <StarField />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div 
          className="border-b-2 p-6"
          style={{ borderColor: 'hsl(var(--neon-green))' }}
        >
          <h1 
            className="text-2xl md:text-3xl font-bold tracking-widest text-center text-glow-green"
            style={{ color: 'hsl(var(--neon-green))' }}
          >
            MAIN MENU
          </h1>
        </div>

        {/* Menu Grid */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-2xl space-y-4">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isHovered = hoveredIndex === index;
              
              return (
                <button
                  key={item.label}
                  onClick={() => handleNavigation(item.path)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="w-full group relative"
                  style={{
                    animation: `fade-in 0.5s ease-out ${index * 0.1}s backwards`
                  }}
                >
                  {/* Menu Item Card */}
                  <div
                    className={`
                      border-2 p-6 md:p-8 
                      flex items-center justify-between
                      transition-all duration-300
                      ${isHovered ? 'border-glow-green bg-primary/10 scale-105' : 'bg-black/50'}
                    `}
                    style={{ 
                      borderColor: 'hsl(var(--neon-green))',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <div className="flex items-center gap-4 md:gap-6">
                      <Icon 
                        className={`w-6 h-6 md:w-8 md:h-8 transition-all duration-300 ${isHovered ? 'text-glow-green' : ''}`}
                        style={{ color: 'hsl(var(--neon-green))' }}
                      />
                      <span 
                        className={`text-lg md:text-2xl font-bold tracking-wider ${isHovered ? 'text-glow-green' : ''}`}
                        style={{ color: 'hsl(var(--neon-green))' }}
                      >
                        {item.label}
                      </span>
                    </div>
                    
                    <ChevronRight 
                      className={`w-6 h-6 transition-all duration-300 ${isHovered ? 'translate-x-2' : ''}`}
                      style={{ color: 'hsl(var(--neon-green))' }}
                    />
                  </div>

                  {/* Hover glow effect */}
                  {isHovered && (
                    <div 
                      className="absolute inset-0 -z-10 blur-xl opacity-50"
                      style={{ backgroundColor: 'hsl(var(--neon-green))' }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Status */}
        <div 
          className="border-t-2 p-4"
          style={{ borderColor: 'hsl(var(--neon-green))' }}
        >
          <p 
            className="text-center text-xs md:text-sm font-mono"
            style={{ color: 'hsl(var(--neon-green))' }}
          >
            SYSTEM STATUS: ALL OPERATIONS NOMINAL
          </p>
        </div>
      </div>
    </div>
  );
};

export default Menu;
