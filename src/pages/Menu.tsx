import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, User, Package, Trophy, BookOpen, Wallet } from 'lucide-react';

const menuItems = [
  { icon: Home, label: 'Home', path: '/lobby' },
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: Package, label: 'Inventory', path: '/inventory' },
  { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
  { icon: BookOpen, label: 'Lore', path: '/lore' },
  { icon: Wallet, label: 'Wallet', path: '/wallet' },
];

const Menu = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleNavigation = (path: string, index: number) => {
    setActiveIndex(index);
    if (path === '/lobby') {
      navigate('/lobby');
    } else {
      console.log(`Navigating to ${path}`);
      // Add navigation logic for other pages
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-black">
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
            PLAYOPS COMMAND CENTER
          </h1>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <p 
              className="text-xl font-mono"
              style={{ color: 'hsl(var(--neon-green))' }}
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
        <nav className="flex items-center justify-around px-4 py-3">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeIndex === index;
            
            return (
              <button
                key={item.label}
                onClick={() => handleNavigation(item.path, index)}
                className="flex flex-col items-center gap-1 min-w-[60px] group transition-all duration-300"
              >
                <div 
                  className={`
                    p-3 rounded-lg transition-all duration-300
                    ${isActive ? 'bg-primary/20 scale-110' : 'hover:bg-primary/10'}
                  `}
                >
                  <Icon 
                    className={`w-6 h-6 transition-all duration-300 ${isActive ? 'text-glow-green' : ''}`}
                    style={{ color: 'hsl(var(--neon-green))' }}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                <span 
                  className={`text-xs font-mono transition-all duration-300 ${isActive ? 'text-glow-green font-bold' : ''}`}
                  style={{ color: 'hsl(var(--neon-green))' }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Menu;
