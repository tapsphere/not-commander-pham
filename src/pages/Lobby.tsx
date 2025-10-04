import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Search, Target, ChevronRight, Star, Zap, Rocket, Sparkles, Home, User, Hexagon, TrendingUp, Wallet } from 'lucide-react';
import microsoftLogo from '@/assets/logos/microsoft.png';
import stripeLogo from '@/assets/logos/stripe.png';
import adobeLogo from '@/assets/logos/adobe.png';
import salesforceLogo from '@/assets/logos/salesforce.png';
import hubspotLogo from '@/assets/logos/hubspot.png';
import mondayLogo from '@/assets/logos/monday.png';

const mockBrands = [
  { id: 1, name: 'Microsoft', department: 'Marketing', validators: 12, logo: microsoftLogo },
  { id: 2, name: 'Stripe', department: 'Finance', validators: 8, logo: stripeLogo },
  { id: 3, name: 'Adobe', department: 'Communications', validators: 15, logo: adobeLogo },
  { id: 4, name: 'Salesforce', department: 'Operations', validators: 10, logo: salesforceLogo },
  { id: 5, name: 'HubSpot', department: 'Marketing', validators: 9, logo: hubspotLogo },
  { id: 6, name: 'Monday.com', department: 'Operations', validators: 11, logo: mondayLogo },
];

const mockPrograms = [
  { title: 'Future Skills 2025', duration: '1 Month = 2 Years XP', skills: 24, icon: Zap },
  { title: 'Marketing Mastery', duration: '6 Weeks Program', skills: 18, icon: Rocket },
  { title: 'Data Analytics Fast Track', duration: '4 Weeks Intensive', skills: 15, icon: Sparkles },
];

const Lobby = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

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
            className="text-2xl md:text-3xl font-bold tracking-widest text-center mb-2"
            style={{ color: 'hsl(var(--neon-green))' }}
          >
            PLAYOPS HUB
          </h1>
          <p className="text-center text-sm text-white/70">
            Train • Validate • Prove Your Skills
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'hsl(var(--neon-green))' }} />
          <input
            type="text"
            placeholder="Search brands, skills, validators..."
            className="w-full bg-black/50 border-2 rounded-lg pl-12 pr-4 py-3 text-sm font-mono focus:outline-none focus:ring-2"
            style={{ 
              borderColor: 'hsl(var(--neon-green))',
              color: 'hsl(var(--neon-green))'
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4">
        <Tabs defaultValue="brands" className="w-full">
          <TabsList className="w-full bg-black/50 border-2 mb-6" style={{ borderColor: 'hsl(var(--neon-green))' }}>
            <TabsTrigger value="brands" className="flex-1 data-[state=active]:bg-primary/20">
              <Building2 className="w-4 h-4 mr-2" />
              Brand Stores
            </TabsTrigger>
            <TabsTrigger value="programs" className="flex-1 data-[state=active]:bg-primary/20">
              <Target className="w-4 h-4 mr-2" />
              Programs
            </TabsTrigger>
          </TabsList>

          {/* Brand Stores Tab */}
          <TabsContent value="brands" className="space-y-6">
            {/* Department Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['All', 'Marketing', 'Operations', 'Finance', 'Communications'].map((dept) => (
                <Button
                  key={dept}
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap border-2 font-mono"
                  style={{ borderColor: 'hsl(var(--neon-green))', color: 'hsl(var(--neon-green))' }}
                >
                  {dept}
                </Button>
              ))}
            </div>

            {/* Brand Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockBrands.map((brand, idx) => {
                const useMagenta = idx === 1;
                const usePurple = idx === 4;
                const borderColor = useMagenta ? 'hsl(var(--neon-magenta))' : usePurple ? 'hsl(var(--neon-purple))' : 'hsl(var(--neon-green))';
                const glowClass = useMagenta ? 'text-glow-magenta' : usePurple ? 'text-glow-purple' : 'text-glow-green';
                
                return (
                  <Card
                    key={brand.id}
                    className="bg-black/50 border-2 p-6 hover:bg-black/70 transition-all cursor-pointer group relative overflow-hidden"
                    style={{ borderColor }}
                    onClick={() => navigate('/menu')}
                  >
                    {/* Glow effect on hover */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
                      style={{ 
                        background: `radial-gradient(circle at center, ${borderColor}, transparent 70%)`
                      }}
                    />
                    
                    <div className="flex items-start justify-between mb-4 relative z-10">
                      <div 
                        className="w-16 h-16 rounded-lg bg-white/5 border-2 p-2 flex items-center justify-center group-hover:border-primary transition-colors" 
                        style={{ borderColor: `${borderColor}33` }}
                      >
                        <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" />
                      </div>
                      <Badge 
                        variant="outline" 
                        className="border-2 font-mono text-xs" 
                        style={{ borderColor, color: borderColor }}
                      >
                        {brand.department}
                      </Badge>
                    </div>
                    <h3 
                      className={`text-xl font-bold mb-2 tracking-wide relative z-10 ${glowClass}`}
                      style={{ color: borderColor }}
                    >
                      {brand.name}
                    </h3>
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-sm font-mono" style={{ color: 'hsl(var(--neon-green) / 0.7)' }}>
                        {brand.validators} Validators
                      </span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" style={{ color: borderColor }} />
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs" className="space-y-4">
            {mockPrograms.map((program, idx) => {
              const IconComponent = program.icon;
              const usePurple = idx === 1;
              const accentColor = usePurple ? 'hsl(var(--neon-purple))' : 'hsl(var(--neon-green))';
              const accentGlow = usePurple ? 'text-glow-purple' : 'text-glow-green';
              
              return (
                <Card
                  key={idx}
                  className="bg-black/50 border-2 p-6 hover:bg-black/70 transition-all cursor-pointer group relative overflow-hidden"
                  style={{ borderColor: accentColor }}
                >
                  {/* Glow effect on hover */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
                    style={{ 
                      background: `radial-gradient(circle at left, ${accentColor}, transparent 70%)`
                    }}
                  />
                  
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-20 h-20 rounded-lg bg-black border-2 flex items-center justify-center group-hover:scale-110 transition-transform" style={{ borderColor: accentColor }}>
                      <IconComponent className="w-10 h-10" style={{ color: accentColor }} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold mb-1 tracking-wide ${accentGlow}`} style={{ color: accentColor }}>
                        {program.title}
                      </h3>
                      <p className="text-sm font-mono mb-2" style={{ color: 'hsl(var(--neon-green) / 0.7)' }}>
                        {program.duration} • {program.skills} Competencies
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs font-mono" style={{ borderColor: accentColor, color: accentColor }}>
                          <Star className="w-3 h-3 mr-1" fill={accentColor} />
                          Featured
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" style={{ color: accentColor }} />
                  </div>
                </Card>
              );
            })}
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

export default Lobby;
