import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Search, Target, ChevronRight, Star, Zap, Rocket, Sparkles } from 'lucide-react';
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

  return (
    <div className="relative w-full min-h-screen bg-black pb-24">
      {/* Header */}
      <div 
        className="border-b-2 p-6"
        style={{ borderColor: 'hsl(var(--neon-green))' }}
      >
        <div className="max-w-7xl mx-auto">
          <h1 
            className="text-2xl md:text-3xl font-bold tracking-widest text-center text-glow-green mb-2"
            style={{ color: 'hsl(var(--neon-green))' }}
          >
            PLAYOPS HUB
          </h1>
          <p className="text-center text-sm" style={{ color: 'hsl(var(--neon-green) / 0.7)' }}>
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
              {mockBrands.map((brand, idx) => (
                <Card
                  key={brand.id}
                  className="bg-black/50 border-2 p-6 hover:bg-black/70 transition-all cursor-pointer group relative overflow-hidden"
                  style={{ borderColor: idx % 3 === 0 ? 'hsl(var(--neon-magenta))' : idx % 3 === 1 ? 'hsl(var(--neon-purple))' : 'hsl(var(--neon-green))' }}
                  onClick={() => navigate('/menu')}
                >
                  {/* Glow effect on hover */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
                    style={{ 
                      background: `radial-gradient(circle at center, ${idx % 3 === 0 ? 'hsl(var(--neon-magenta))' : idx % 3 === 1 ? 'hsl(var(--neon-purple))' : 'hsl(var(--neon-green))'}, transparent 70%)`
                    }}
                  />
                  
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div 
                      className="w-16 h-16 rounded-lg bg-white/5 border-2 p-2 flex items-center justify-center group-hover:border-primary transition-colors" 
                      style={{ borderColor: `${idx % 3 === 0 ? 'hsl(var(--neon-magenta) / 0.3)' : idx % 3 === 1 ? 'hsl(var(--neon-purple) / 0.3)' : 'hsl(var(--neon-green) / 0.3)'}` }}
                    >
                      <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" />
                    </div>
                    <Badge 
                      variant="outline" 
                      className="border-2 font-mono text-xs" 
                      style={{ borderColor: idx % 3 === 0 ? 'hsl(var(--neon-magenta))' : idx % 3 === 1 ? 'hsl(var(--neon-purple))' : 'hsl(var(--neon-green))', color: idx % 3 === 0 ? 'hsl(var(--neon-magenta))' : idx % 3 === 1 ? 'hsl(var(--neon-purple))' : 'hsl(var(--neon-green))' }}
                    >
                      {brand.department}
                    </Badge>
                  </div>
                  <h3 
                    className={`text-xl font-bold mb-2 tracking-wide relative z-10 ${idx % 3 === 0 ? 'text-glow-magenta' : idx % 3 === 1 ? 'text-glow-purple' : 'text-glow-green'}`}
                    style={{ color: idx % 3 === 0 ? 'hsl(var(--neon-magenta))' : idx % 3 === 1 ? 'hsl(var(--neon-purple))' : 'hsl(var(--neon-green))' }}
                  >
                    {brand.name}
                  </h3>
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-sm font-mono" style={{ color: 'hsl(var(--neon-green) / 0.7)' }}>
                      {brand.validators} Validators
                    </span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" style={{ color: idx % 3 === 0 ? 'hsl(var(--neon-magenta))' : idx % 3 === 1 ? 'hsl(var(--neon-purple))' : 'hsl(var(--neon-green))' }} />
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs" className="space-y-4">
            {mockPrograms.map((program, idx) => {
              const IconComponent = program.icon;
              const accentColor = idx % 2 === 0 ? 'hsl(var(--neon-magenta))' : 'hsl(var(--neon-purple))';
              const accentGlow = idx % 2 === 0 ? 'text-glow-magenta' : 'text-glow-purple';
              
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
    </div>
  );
};

export default Lobby;
