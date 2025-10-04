import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Home, User, Hexagon, TrendingUp, Wallet, Crown, Medal, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const mockLeaders = [
  { rank: 1, username: 'Player_Alpha', score: 15420, badges: 12, level: 'Mastery', avatar: '🥇' },
  { rank: 2, username: 'Player_Beta', score: 14230, badges: 11, level: 'Mastery', avatar: '🥈' },
  { rank: 3, username: 'Player_Gamma', score: 13150, badges: 10, level: 'Proficient', avatar: '🥉' },
  { rank: 4, username: 'Player_Delta', score: 12890, badges: 9, level: 'Proficient', avatar: '👤' },
  { rank: 5, username: 'Player_Epsilon', score: 11720, badges: 9, level: 'Proficient', avatar: '👤' },
  { rank: 6, username: 'Player_Zeta', score: 10450, badges: 8, level: 'Proficient', avatar: '👤' },
  { rank: 7, username: 'Player_Eta', score: 9230, badges: 7, level: 'Proficient', avatar: '👤' },
  { rank: 8, username: 'Player_Theta', score: 8120, badges: 6, level: 'Needs Work', avatar: '👤' },
];

const Leaderboard = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(3);

  const menuItems = [
    { icon: Home, label: 'Hub', path: '/lobby' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Hexagon, label: 'Inventory', path: '/inventory' },
    { icon: TrendingUp, label: 'Leaderboard', path: '/leaderboard' },
    { icon: Wallet, label: 'Wallet', path: '/wallet' },
  ];

  const handleNavigation = (path: string, index: number) => {
    setActiveIndex(index);
    navigate(path);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-400" />;
      default:
        return null;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Mastery':
        return 'bg-green-500/20 text-green-400 border-green-500';
      case 'Proficient':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      default:
        return 'bg-red-500/20 text-red-400 border-red-500';
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-black pb-24">
      {/* Header */}
      <div 
        className="border-b-2 p-6"
        style={{ borderColor: 'hsl(var(--neon-green))' }}
      >
        <div className="max-w-7xl mx-auto">
          <h1 
            className="text-2xl md:text-3xl font-bold tracking-widest text-center text-glow-green"
            style={{ color: 'hsl(var(--neon-green))' }}
          >
            LEADERBOARD
          </h1>
          <p className="text-center text-sm mt-2" style={{ color: 'hsl(var(--neon-green) / 0.7)' }}>
            Top performers worldwide
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="global" className="w-full">
          <TabsList className="w-full bg-black/50 border-2 mb-6" style={{ borderColor: 'hsl(var(--neon-green))' }}>
            <TabsTrigger value="global" className="flex-1 data-[state=active]:bg-primary/20">
              <Trophy className="w-5 h-5 mr-2" style={{ color: 'hsl(var(--neon-green))' }} strokeWidth={2.5} />
              Global
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex-1 data-[state=active]:bg-primary/20">
              <TrendingUp className="w-5 h-5 mr-2" style={{ color: 'hsl(var(--neon-green))' }} strokeWidth={2.5} />
              Weekly
            </TabsTrigger>
          </TabsList>

          <TabsContent value="global" className="space-y-4">
            {/* Top 3 Podium */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {mockLeaders.slice(0, 3).map((leader, idx) => {
                const borderColor = idx === 0 ? 'hsl(var(--neon-magenta))' : idx === 1 ? 'hsl(var(--neon-purple))' : 'hsl(var(--neon-green))';
                const glowClass = idx === 0 ? 'text-glow-magenta' : idx === 1 ? 'text-glow-purple' : 'text-glow-green';
                
                return (
                  <Card 
                    key={leader.rank} 
                    className="bg-black/50 border-2 p-4 text-center relative overflow-hidden"
                    style={{ borderColor }}
                  >
                    <div 
                      className="absolute inset-0 opacity-10"
                      style={{ 
                        background: `radial-gradient(circle at center, ${borderColor}, transparent 70%)`
                      }}
                    />
                    <div className="relative z-10">
                      <div className="text-4xl mb-2">{leader.avatar}</div>
                      <div className="mb-2">{getRankIcon(leader.rank)}</div>
                      <h3 className={`font-bold text-sm mb-2 ${glowClass} tracking-wide`} style={{ color: borderColor }}>
                        {leader.username}
                      </h3>
                      <p className="text-2xl font-bold mb-1" style={{ color: borderColor }}>
                        {leader.score.toLocaleString()}
                      </p>
                      <p className="text-xs font-mono" style={{ color: 'hsl(var(--neon-green) / 0.5)' }}>
                        XP Points
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Rest of leaderboard */}
            <div className="space-y-3">
              {mockLeaders.slice(3).map((leader) => (
                <Card 
                  key={leader.rank}
                  className="bg-black/50 border-2 p-4 hover:bg-black/70 transition-all"
                  style={{ borderColor: 'hsl(var(--neon-green))' }}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-black border-2 flex items-center justify-center" style={{ borderColor: 'hsl(var(--neon-green))' }}>
                        <span className="text-xl font-bold" style={{ color: 'hsl(var(--neon-green))' }}>
                          {leader.rank}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold mb-1 text-glow-green" style={{ color: 'hsl(var(--neon-green))' }}>
                          {leader.username}
                        </h3>
                        <div className="flex gap-2">
                          <Badge className={`text-xs font-mono border-2 ${getLevelColor(leader.level)}`}>
                            {leader.level}
                          </Badge>
                          <Badge variant="outline" className="text-xs font-mono" style={{ borderColor: 'hsl(var(--neon-green))', color: 'hsl(var(--neon-green))' }}>
                            {leader.badges} Badges
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold" style={{ color: 'hsl(var(--neon-green))' }}>
                        {leader.score.toLocaleString()}
                      </p>
                      <p className="text-xs font-mono" style={{ color: 'hsl(var(--neon-green) / 0.5)' }}>
                        XP
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Your Rank */}
            <Card className="bg-black/50 border-2 p-6 relative overflow-hidden" style={{ borderColor: 'hsl(var(--neon-purple))' }}>
              <div 
                className="absolute inset-0 opacity-10"
                style={{ 
                  background: 'radial-gradient(circle at center, hsl(var(--neon-purple)), transparent 70%)'
                }}
              />
              <div className="relative z-10 text-center">
                <p className="text-sm font-mono mb-2" style={{ color: 'hsl(var(--neon-green) / 0.7)' }}>
                  Your Current Rank
                </p>
                <p className="text-4xl font-bold mb-2 text-glow-purple" style={{ color: 'hsl(var(--neon-purple))' }}>
                  #42
                </p>
                <p className="text-sm font-mono" style={{ color: 'hsl(var(--neon-green) / 0.5)' }}>
                  Keep validating to climb the ranks!
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            <Card className="bg-black/50 border-2 p-8 text-center" style={{ borderColor: 'hsl(var(--neon-green))' }}>
              <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: 'hsl(var(--neon-green))' }} strokeWidth={2} />
              <h3 className="text-xl font-bold mb-2 text-glow-green" style={{ color: 'hsl(var(--neon-green))' }}>
                Weekly Rankings
              </h3>
              <p className="text-sm font-mono" style={{ color: 'hsl(var(--neon-green) / 0.7)' }}>
                Resets every Monday at 00:00 UTC
              </p>
            </Card>
          </TabsContent>
        </Tabs>
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
                {isActive && (
                  <div 
                    className="absolute inset-0 rounded-lg opacity-20 blur-md"
                    style={{ background: accentColor }}
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
    </div>
  );
};

export default Leaderboard;
