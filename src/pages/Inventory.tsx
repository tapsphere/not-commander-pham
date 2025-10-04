import { Package, Trophy, FileCheck, Download, Sparkles, Hexagon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const mockReceipts = [
  { id: 'R-2025-001', skill: 'Excel Data Analysis', level: 'Mastery', date: '2025-03-15', validator: 'TechCorp' },
  { id: 'R-2025-002', skill: 'SQL Queries', level: 'Proficient', date: '2025-03-10', validator: 'DataSystems' },
  { id: 'R-2025-003', skill: 'Social Media Marketing', level: 'Mastery', date: '2025-02-28', validator: 'MarketPro' },
  { id: 'R-2025-004', skill: 'Content Writing', level: 'Proficient', date: '2025-02-20', validator: 'CreativeStudio' },
];

const mockBadges = [
  { name: 'Excel Master', icon: '📊', rarity: 'Epic', earned: '2025-03' },
  { name: 'Marketing Pro', icon: '📢', rarity: 'Rare', earned: '2025-02' },
  { name: 'SQL Certified', icon: '🗄️', rarity: 'Rare', earned: '2025-01' },
  { name: 'First Validator', icon: '🎯', rarity: 'Common', earned: '2025-01' },
  { name: 'Speed Runner', icon: '⚡', rarity: 'Epic', earned: '2025-02' },
  { name: 'Perfectionist', icon: '💎', rarity: 'Legendary', earned: '2025-03' },
];

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'Legendary':
      return 'text-purple-400 border-purple-500';
    case 'Epic':
      return 'text-blue-400 border-blue-500';
    case 'Rare':
      return 'text-yellow-400 border-yellow-500';
    default:
      return 'text-gray-400 border-gray-500';
  }
};

const Inventory = () => {
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
            INVENTORY
          </h1>
          <p className="text-center text-sm mt-2" style={{ color: 'hsl(var(--neon-green) / 0.7)' }}>
            Your badges, receipts & proof of work
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="badges" className="w-full">
          <TabsList className="w-full bg-black/50 border-2 mb-6" style={{ borderColor: 'hsl(var(--neon-green))' }}>
            <TabsTrigger value="badges" className="flex-1 data-[state=active]:bg-primary/20">
              <Trophy className="w-5 h-5 mr-2" style={{ color: 'hsl(var(--neon-green))' }} strokeWidth={2.5} />
              Badges
            </TabsTrigger>
            <TabsTrigger value="receipts" className="flex-1 data-[state=active]:bg-primary/20">
              <FileCheck className="w-5 h-5 mr-2" style={{ color: 'hsl(var(--neon-green))' }} strokeWidth={2.5} />
              Receipts
            </TabsTrigger>
          </TabsList>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mockBadges.map((badge, idx) => (
                <Card 
                  key={idx} 
                  className="bg-black/50 border-2 p-6 text-center hover:bg-black/70 transition-all cursor-pointer group relative overflow-hidden"
                  style={{ borderColor: 'hsl(var(--neon-green))' }}
                >
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                    style={{ 
                      background: 'radial-gradient(circle at center, hsl(var(--neon-green)), transparent 70%)'
                    }}
                  />
                  <div className="relative z-10">
                    <div className="w-20 h-20 mx-auto mb-3 rounded-lg bg-black border-2 flex items-center justify-center group-hover:scale-110 transition-transform" style={{ borderColor: 'hsl(var(--neon-green))' }}>
                      <Hexagon className="w-12 h-12" style={{ color: 'hsl(var(--neon-green))' }} strokeWidth={2} fill="hsl(var(--neon-green) / 0.2)" />
                    </div>
                    <h3 className="font-bold mb-2 text-glow-green tracking-wide" style={{ color: 'hsl(var(--neon-green))' }}>
                      {badge.name}
                    </h3>
                    <Badge className={`mb-2 border-2 font-mono text-xs ${getRarityColor(badge.rarity)}`}>
                      {badge.rarity}
                    </Badge>
                    <div className="text-xs font-mono" style={{ color: 'hsl(var(--neon-green) / 0.5)' }}>
                      Earned: {badge.earned}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="bg-black/50 border-2 p-6 text-center relative overflow-hidden group" style={{ borderColor: 'hsl(var(--neon-green))' }}>
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                style={{ 
                  background: 'radial-gradient(circle at center, hsl(var(--neon-green)), transparent 70%)'
                }}
              />
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-black border-2 flex items-center justify-center" style={{ borderColor: 'hsl(var(--neon-green))' }}>
                  <Sparkles className="w-8 h-8" style={{ color: 'hsl(var(--neon-green))' }} strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold mb-2 tracking-wide" style={{ color: 'hsl(var(--neon-green))' }}>
                  {mockBadges.length} Badges Collected
                </h3>
                <p className="text-sm font-mono" style={{ color: 'hsl(var(--neon-green) / 0.7)' }}>
                  Complete more validators to unlock rare badges
                </p>
              </div>
            </Card>
          </TabsContent>

          {/* Receipts Tab */}
          <TabsContent value="receipts" className="space-y-4">
            {mockReceipts.map((receipt) => (
              <Card 
                key={receipt.id}
                className="bg-black/50 border-2 p-6 hover:bg-black/70 transition-all"
                style={{ borderColor: 'hsl(var(--neon-green))' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileCheck className="w-5 h-5" style={{ color: 'hsl(var(--neon-green))' }} strokeWidth={2.5} />
                      <span className="font-mono text-sm" style={{ color: 'hsl(var(--neon-green) / 0.7)' }}>
                        {receipt.id}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-glow-green mb-1" style={{ color: 'hsl(var(--neon-green))' }}>
                      {receipt.skill}
                    </h3>
                    <div className="flex gap-2 mb-2">
                      <Badge variant="outline" style={{ borderColor: 'hsl(var(--neon-green))', color: 'hsl(var(--neon-green))' }}>
                        {receipt.validator}
                      </Badge>
                      <Badge 
                        className={receipt.level === 'Mastery' ? 'bg-green-500/20 text-green-400 border-green-500' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500'}
                      >
                        {receipt.level}
                      </Badge>
                    </div>
                    <p className="text-xs font-mono" style={{ color: 'hsl(var(--neon-green) / 0.5)' }}>
                      Validated: {receipt.date}
                    </p>
                  </div>
                  <button 
                    className="p-2 border-2 rounded-lg hover:bg-primary/20 transition-all hover:scale-110"
                    style={{ borderColor: 'hsl(var(--neon-green))' }}
                  >
                    <Download className="w-5 h-5" style={{ color: 'hsl(var(--neon-green))' }} strokeWidth={2.5} />
                  </button>
                </div>
                <div className="text-xs font-mono p-3 bg-black/50 rounded border" style={{ borderColor: 'hsl(var(--neon-green) / 0.3)', color: 'hsl(var(--neon-green) / 0.6)' }}>
                  🔐 Immutable on-chain receipt • Timestamp: {receipt.date}
                </div>
              </Card>
            ))}

            <Card className="bg-black/50 border-2 p-6 text-center relative overflow-hidden group" style={{ borderColor: 'hsl(var(--neon-green))' }}>
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                style={{ 
                  background: 'radial-gradient(circle at center, hsl(var(--neon-green)), transparent 70%)'
                }}
              />
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-black border-2 flex items-center justify-center" style={{ borderColor: 'hsl(var(--neon-green))' }}>
                  <FileCheck className="w-8 h-8" style={{ color: 'hsl(var(--neon-green))' }} strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold mb-2 tracking-wide" style={{ color: 'hsl(var(--neon-green))' }}>
                  {mockReceipts.length} Validated Skills
                </h3>
                <p className="text-sm font-mono mb-4" style={{ color: 'hsl(var(--neon-green) / 0.7)' }}>
                  Portable proof employers can verify instantly
                </p>
                <button 
                  className="px-6 py-2 border-2 rounded-lg font-mono font-bold hover:bg-primary/20 transition-all hover:scale-105"
                  style={{ borderColor: 'hsl(var(--neon-green))', color: 'hsl(var(--neon-green))' }}
                >
                  EXPORT ALL RECEIPTS
                </button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Inventory;
