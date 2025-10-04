import { User, Award, TrendingUp, Shield, Home, Hexagon, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import profileImage from '@/assets/profile-nitin.jpeg';

const mockCompetencies = [
  { 
    name: 'Analytical Thinking / Critical Reasoning', 
    department: 'Operations', 
    level: 'mastery', 
    progress: 100,
    subCompetencies: 6,
    validator: 'Advanced Ops Puzzle'
  },
  { 
    name: 'AI & Big Data Skills', 
    department: 'All Departments', 
    level: 'proficient', 
    progress: 75,
    subCompetencies: 5,
    validator: 'AI Data Symphony'
  },
  { 
    name: 'Technological Literacy', 
    department: 'Operations', 
    level: 'mastery', 
    progress: 100,
    subCompetencies: 4,
    validator: 'Tech Stack Challenge'
  },
  { 
    name: 'Creative Thinking', 
    department: 'Marketing', 
    level: 'proficient', 
    progress: 80,
    subCompetencies: 5,
    validator: 'Innovation Sprint'
  },
  { 
    name: 'Networks & Cybersecurity', 
    department: 'IT/Security', 
    level: 'needs-work', 
    progress: 45,
    subCompetencies: 6,
    validator: 'Security Defense Sim'
  },
  { 
    name: 'Resilience & Adaptability', 
    department: 'All Departments', 
    level: 'proficient', 
    progress: 70,
    subCompetencies: 4,
    validator: 'Change Navigator'
  },
  { 
    name: 'Leadership & Social Influence', 
    department: 'Management', 
    level: 'mastery', 
    progress: 95,
    subCompetencies: 5,
    validator: 'Team Dynamics Challenge'
  },
  { 
    name: 'Service Orientation', 
    department: 'Customer Success', 
    level: 'proficient', 
    progress: 65,
    subCompetencies: 4,
    validator: 'Customer Impact Scenarios'
  },
];

const mockBadges = [
  { name: 'Excel Master', icon: '📊', date: '2025-03' },
  { name: 'Marketing Pro', icon: '📢', date: '2025-02' },
  { name: 'SQL Certified', icon: '🗄️', date: '2025-01' },
];

const getLevelColor = (level: string) => {
  switch (level) {
    case 'mastery':
      return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500' };
    case 'proficient':
      return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500' };
    default:
      return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500' };
  }
};

const getLevelLabel = (level: string) => {
  switch (level) {
    case 'mastery':
      return 'Mastery';
    case 'proficient':
      return 'Proficient';
    default:
      return 'Needs Work';
  }
};

const Profile = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(1);
  const masteryCount = mockCompetencies.filter(s => s.level === 'mastery').length;
  const proficientCount = mockCompetencies.filter(s => s.level === 'proficient').length;

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

  return (
    <div className="relative w-full min-h-screen bg-black pb-24">
      {/* Header */}
      <div 
        className="border-b-2 p-6"
        style={{ borderColor: 'white' }}
      >
        <div className="max-w-7xl mx-auto">
          <h1 
            className="text-2xl md:text-3xl font-bold tracking-widest text-center"
            style={{ color: 'white' }}
          >
            PLAYER PROFILE
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Player Card */}
        <Card className="bg-black/50 border-2 p-6" style={{ borderColor: 'hsl(var(--neon-green))' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-black border-2 relative overflow-hidden group" style={{ borderColor: 'hsl(var(--neon-green))' }}>
              <img 
                src={profileImage} 
                alt="Nitin Kumar" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-glow-green mb-1" style={{ color: 'hsl(var(--neon-green))' }}>
                Nitin Kumar
              </h2>
              <p className="text-sm font-mono" style={{ color: 'hsl(var(--neon-green) / 0.7)' }}>
                Level 12 • XP: 2,450
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{masteryCount}</div>
              <div className="text-xs font-mono text-green-400/70">Mastery</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">{proficientCount}</div>
              <div className="text-xs font-mono text-yellow-400/70">Proficient</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: 'hsl(var(--neon-green))' }}>{mockBadges.length}</div>
              <div className="text-xs font-mono" style={{ color: 'hsl(var(--neon-green) / 0.7)' }}>Badges</div>
            </div>
          </div>
        </Card>

        {/* Badges Section */}
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'hsl(var(--neon-green))' }}>
            <Award className="w-6 h-6" style={{ color: 'hsl(var(--neon-green))' }} strokeWidth={2.5} />
            Earned Badges
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mockBadges.map((badge, idx) => {
              const usePurple = idx === 0;
              const borderColor = usePurple ? 'hsl(var(--neon-purple))' : 'hsl(var(--neon-green))';
              const glowClass = usePurple ? 'text-glow-purple' : 'text-glow-green';
              
              return (
                <Card 
                  key={idx} 
                  className="bg-black/50 border-2 p-4 text-center hover:bg-black/70 transition-all cursor-pointer" 
                  style={{ borderColor }}
                >
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <div 
                    className={`font-bold text-sm mb-1 ${glowClass}`}
                    style={{ color: borderColor }}
                  >
                    {badge.name}
                  </div>
                  <div className="text-xs font-mono" style={{ color: 'hsl(var(--neon-green) / 0.5)' }}>
                    {badge.date}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Competencies Grid */}
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'hsl(var(--neon-green))' }}>
            <TrendingUp className="w-6 h-6" style={{ color: 'hsl(var(--neon-green))' }} strokeWidth={2.5} />
            Validated Competencies
          </h3>
          <div className="space-y-3">
            {mockCompetencies.map((competency, idx) => {
              const colors = getLevelColor(competency.level);
              return (
                <Card key={idx} className="bg-black/50 border-2 p-4" style={{ borderColor: 'hsl(var(--neon-green))' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold" style={{ color: 'hsl(var(--neon-green))' }}>
                          {competency.name}
                        </h4>
                        <Badge variant="outline" className="text-xs" style={{ borderColor: 'hsl(var(--neon-green))', color: 'hsl(var(--neon-green))' }}>
                          {competency.department}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono mb-2" style={{ color: 'hsl(var(--neon-green) / 0.6)' }}>
                        <span>{competency.subCompetencies} Sub-Competencies</span>
                        <span>•</span>
                        <span>Assessment: {competency.validator}</span>
                      </div>
                      <Progress value={competency.progress} className="h-2" />
                    </div>
                    <Badge className={`ml-4 ${colors.bg} ${colors.text} border-2 ${colors.border}`}>
                      {getLevelLabel(competency.level)}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Portable Resume CTA */}
        <Card className="bg-black/50 border-2 p-6 text-center relative overflow-hidden group" style={{ borderColor: 'hsl(var(--neon-green))' }}>
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
            style={{ 
              background: 'radial-gradient(circle at center, hsl(var(--neon-green)), transparent 70%)'
            }}
          />
          <div className="relative z-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-black border-2 flex items-center justify-center" style={{ borderColor: 'hsl(var(--neon-green))' }}>
              <Shield className="w-8 h-8" style={{ color: 'hsl(var(--neon-green))' }} strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-bold mb-2 tracking-wide" style={{ color: 'hsl(var(--neon-green))' }}>
              Export Your Validated Competencies
            </h3>
            <p className="text-sm font-mono mb-4" style={{ color: 'hsl(var(--neon-green) / 0.7)' }}>
              Download immutable receipts & portable CBE resume
            </p>
            <button 
              className="px-6 py-2 border-2 rounded-lg font-mono font-bold hover:bg-primary/20 transition-all hover:scale-105"
              style={{ borderColor: 'hsl(var(--neon-green))', color: 'hsl(var(--neon-green))' }}
            >
              EXPORT RESUME
            </button>
          </div>
        </Card>
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

export default Profile;
