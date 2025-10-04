import { User, Award, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const mockSkills = [
  { name: 'Excel Data Analysis', department: 'Operations', level: 'mastery', progress: 100 },
  { name: 'SQL Queries', department: 'Operations', level: 'proficient', progress: 75 },
  { name: 'Social Media Marketing', department: 'Marketing', level: 'mastery', progress: 100 },
  { name: 'Email Campaign Design', department: 'Marketing', level: 'proficient', progress: 80 },
  { name: 'Financial Modeling', department: 'Finance', level: 'needs-work', progress: 45 },
  { name: 'Prompt Engineering', department: 'Operations', level: 'proficient', progress: 70 },
  { name: 'Content Writing', department: 'Communications', level: 'mastery', progress: 95 },
  { name: 'Data Visualization', department: 'Operations', level: 'proficient', progress: 65 },
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
  const masteryCount = mockSkills.filter(s => s.level === 'mastery').length;
  const proficientCount = mockSkills.filter(s => s.level === 'proficient').length;

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
            PLAYER PROFILE
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Player Card */}
        <Card className="bg-black/50 border-2 p-6" style={{ borderColor: 'hsl(var(--neon-green))' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border-2" style={{ borderColor: 'hsl(var(--neon-green))' }}>
              <User className="w-10 h-10" style={{ color: 'hsl(var(--neon-green))' }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-glow-green mb-1" style={{ color: 'hsl(var(--neon-green))' }}>
                Player_001
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
            <Award className="w-5 h-5" />
            Earned Badges
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mockBadges.map((badge, idx) => (
              <Card key={idx} className="bg-black/50 border-2 p-4 text-center hover:bg-black/70 transition-all cursor-pointer" style={{ borderColor: 'hsl(var(--neon-green))' }}>
                <div className="text-4xl mb-2">{badge.icon}</div>
                <div className="font-bold text-sm mb-1" style={{ color: 'hsl(var(--neon-green))' }}>
                  {badge.name}
                </div>
                <div className="text-xs font-mono" style={{ color: 'hsl(var(--neon-green) / 0.5)' }}>
                  {badge.date}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Skills Grid */}
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'hsl(var(--neon-green))' }}>
            <TrendingUp className="w-5 h-5" />
            Validated Skills
          </h3>
          <div className="space-y-3">
            {mockSkills.map((skill, idx) => {
              const colors = getLevelColor(skill.level);
              return (
                <Card key={idx} className="bg-black/50 border-2 p-4" style={{ borderColor: 'hsl(var(--neon-green))' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold" style={{ color: 'hsl(var(--neon-green))' }}>
                          {skill.name}
                        </h4>
                        <Badge variant="outline" className="text-xs" style={{ borderColor: 'hsl(var(--neon-green))', color: 'hsl(var(--neon-green))' }}>
                          {skill.department}
                        </Badge>
                      </div>
                      <Progress value={skill.progress} className="h-2" />
                    </div>
                    <Badge className={`ml-4 ${colors.bg} ${colors.text} border-2 ${colors.border}`}>
                      {getLevelLabel(skill.level)}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Portable Resume CTA */}
        <Card className="bg-black/50 border-2 p-6 text-center" style={{ borderColor: 'hsl(var(--neon-green))' }}>
          <CheckCircle2 className="w-12 h-12 mx-auto mb-4" style={{ color: 'hsl(var(--neon-green))' }} />
          <h3 className="text-lg font-bold mb-2" style={{ color: 'hsl(var(--neon-green))' }}>
            Export Your Validated Skills
          </h3>
          <p className="text-sm font-mono mb-4" style={{ color: 'hsl(var(--neon-green) / 0.7)' }}>
            Download immutable receipts & portable resume
          </p>
          <button 
            className="px-6 py-2 border-2 rounded-lg font-mono font-bold hover:bg-primary/20 transition-all"
            style={{ borderColor: 'hsl(var(--neon-green))', color: 'hsl(var(--neon-green))' }}
          >
            EXPORT RESUME
          </button>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
