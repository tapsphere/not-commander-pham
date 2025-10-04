import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Search, Target, ChevronRight, Star } from 'lucide-react';

const mockBrands = [
  { id: 1, name: 'TechCorp', department: 'Marketing', validators: 12, logo: '🚀' },
  { id: 2, name: 'FinanceHub', department: 'Finance', validators: 8, logo: '💰' },
  { id: 3, name: 'CreativeStudio', department: 'Communications', validators: 15, logo: '🎨' },
  { id: 4, name: 'DataSystems', department: 'Operations', validators: 10, logo: '📊' },
  { id: 5, name: 'MarketPro', department: 'Marketing', validators: 9, logo: '📈' },
  { id: 6, name: 'OptiFlow', department: 'Operations', validators: 11, logo: '⚙️' },
];

const mockPrograms = [
  { title: 'Future Skills 2025', duration: '1 Month = 2 Years XP', skills: 24, badge: '🎯' },
  { title: 'Marketing Mastery', duration: '6 Weeks Program', skills: 18, badge: '📢' },
  { title: 'Data Analytics Fast Track', duration: '4 Weeks Intensive', skills: 15, badge: '📊' },
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
              {mockBrands.map((brand) => (
                <Card
                  key={brand.id}
                  className="bg-black/50 border-2 p-6 hover:bg-black/70 transition-all cursor-pointer group"
                  style={{ borderColor: 'hsl(var(--neon-green))' }}
                  onClick={() => navigate('/menu')}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{brand.logo}</div>
                    <Badge variant="outline" className="border-2" style={{ borderColor: 'hsl(var(--neon-green))', color: 'hsl(var(--neon-green))' }}>
                      {brand.department}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-glow-green" style={{ color: 'hsl(var(--neon-green))' }}>
                    {brand.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono" style={{ color: 'hsl(var(--neon-green) / 0.7)' }}>
                      {brand.validators} Validators
                    </span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" style={{ color: 'hsl(var(--neon-green))' }} />
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs" className="space-y-4">
            {mockPrograms.map((program, idx) => (
              <Card
                key={idx}
                className="bg-black/50 border-2 p-6 hover:bg-black/70 transition-all cursor-pointer group"
                style={{ borderColor: 'hsl(var(--neon-green))' }}
              >
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{program.badge}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-glow-green mb-1" style={{ color: 'hsl(var(--neon-green))' }}>
                      {program.title}
                    </h3>
                    <p className="text-sm font-mono mb-2" style={{ color: 'hsl(var(--neon-green) / 0.7)' }}>
                      {program.duration} • {program.skills} Skills
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="outline" style={{ borderColor: 'hsl(var(--neon-green))', color: 'hsl(var(--neon-green))' }}>
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" style={{ color: 'hsl(var(--neon-green))' }} />
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Lobby;
