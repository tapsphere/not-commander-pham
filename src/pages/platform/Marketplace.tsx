import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Search, Users, Brain, ShieldCheck, TrendingUp,
  Zap, Activity, BarChart3, Sparkles, ArrowRight,
  Target, Layers, AlertTriangle, CheckCircle2, Clock,
  Gauge, Map, FileDown, Fingerprint, Eye, HeartPulse
} from 'lucide-react';
import { toast } from 'sonner';
import { useComplianceMode } from '@/components/platform/PlatformLayout';

/* ═══════════════════════════════════════════════
   STATE A: TALENT MODE — Behavioral View
   ═══════════════════════════════════════════════ */

const pipelineStages = [
  { label: 'New Intake', count: 142, color: 'hsl(var(--muted-foreground))' },
  { label: 'Behavioral Screening', count: 89, color: 'hsl(var(--primary))' },
  { label: 'Competency Validation', count: 47, color: 'hsl(var(--primary))' },
  { label: 'L3 Mastery', count: 18, color: 'hsl(var(--primary))' },
];

const skillHeatmap = [
  { skill: 'Sequence Management', level: 94, status: 'elite' },
  { skill: 'Anticipatory Service', level: 87, status: 'advancing' },
  { skill: 'Crisis De-escalation', level: 72, status: 'developing' },
  { skill: 'Brand Articulation', level: 81, status: 'advancing' },
  { skill: 'Cognitive Load Mgmt', level: 65, status: 'developing' },
  { skill: 'Refined Hospitality', level: 91, status: 'elite' },
];

const aiShortlist = [
  { name: 'A. Reeves', role: 'Premium Cabin Lead', match: 94, reason: 'Demonstrated 94% match in anticipatory service simulations' },
  { name: 'M. Chen', role: 'Ground Ops Supervisor', match: 88, reason: 'Transferable crisis management from emergency medical background' },
  { name: 'L. Okafor', role: 'Brand Ambassador', match: 91, reason: 'Top-decile brand articulation and refined hospitality scores' },
];

const brandTraits = [
  { trait: 'Refined', score: 88 },
  { trait: 'Anticipatory', score: 76 },
  { trait: 'Composed', score: 92 },
  { trait: 'Culturally Attuned', score: 69 },
];

const complianceItems = [
  { role: 'Premium Cabin Lead', status: 'valid', days: 120 },
  { role: 'Ground Ops Supervisor', status: 'expiring', days: 14 },
  { role: 'Safety Compliance Officer', status: 'valid', days: 200 },
  { role: 'Customer Experience Mgr', status: 'flagged', days: 0 },
];

/* ═══════════════════════════════════════════════
   STATE B: COMPLIANCE MODE — Evidence View
   ═══════════════════════════════════════════════ */

/* Workforce heatmap data — 800 person grid */
function WorkforceHeatmap() {
  const cells = Array.from({ length: 800 }, (_, i) => {
    const rand = Math.random();
    if (rand > 0.7) return 'mastery';
    if (rand > 0.3) return 'proficient';
    return 'developing';
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">800 Personnel — Live Status</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[hsl(var(--compliance-primary))]" /><span className="text-[10px] text-muted-foreground">Mastery</span></div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[hsl(var(--compliance-accent))]" /><span className="text-[10px] text-muted-foreground">Proficient</span></div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-muted" /><span className="text-[10px] text-muted-foreground">Developing</span></div>
        </div>
      </div>
      <div className="grid gap-[2px]" style={{ gridTemplateColumns: 'repeat(40, 1fr)' }}>
        {cells.map((level, i) => (
          <div
            key={i}
            className="aspect-square rounded-[2px] transition-colors"
            style={{
              backgroundColor:
                level === 'mastery'
                  ? 'hsl(var(--compliance-accent))'
                  : level === 'proficient'
                  ? 'hsl(var(--compliance-primary))'
                  : 'hsl(var(--muted))',
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* The Pulse — Logic Latency Gauge */
function LogicLatencyGauge() {
  const latency = 540;
  const maxLatency = 1000;
  const pct = (latency / maxLatency) * 100;
  const angle = (pct / 100) * 180 - 90; // -90 to 90 degrees

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-40 h-24 overflow-hidden">
        {/* Gauge arc */}
        <svg viewBox="0 0 200 110" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Filled arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="hsl(var(--compliance-primary))"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${pct * 2.51} 251`}
          />
          {/* Needle */}
          <line
            x1="100" y1="100"
            x2={100 + 60 * Math.cos((angle * Math.PI) / 180)}
            y2={100 - 60 * Math.sin((angle * Math.PI) / 180)}
            stroke="hsl(var(--foreground))"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="100" cy="100" r="4" fill="hsl(var(--foreground))" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-3xl font-semibold text-foreground">{latency}<span className="text-sm text-muted-foreground ml-1">ms</span></p>
        <p className="text-xs text-muted-foreground">Logic Latency Measurement</p>
      </div>
    </div>
  );
}

/* ICV Tracker — In-Country Value */
function ICVTracker() {
  const icvScore = 88;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">In-Country Value</span>
        <span className="text-2xl font-semibold text-foreground">{icvScore}%</span>
      </div>
      <div className="relative w-full h-48 bg-muted/30 rounded-xl overflow-hidden">
        <div
          className="absolute bottom-0 left-0 right-0 rounded-xl transition-all duration-700"
          style={{
            height: `${icvScore}%`,
            background: `linear-gradient(to top, hsl(var(--compliance-primary)), hsl(var(--compliance-accent)))`,
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium text-foreground drop-shadow-sm">{icvScore}%</span>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground text-center">National Target: 75% | Current: {icvScore}%</p>
    </div>
  );
}

/* Forensic Stats Row */
function ForensicStats() {
  const stats = [
    { icon: Eye, label: 'Verified Signals', value: '847,329', color: 'compliance-primary' },
    { icon: Fingerprint, label: 'Forensic Integrity', value: '0% Fraud', color: 'compliance-primary' },
    { icon: HeartPulse, label: 'Body Language', value: 'Baseline', color: 'compliance-secondary' },
    { icon: Activity, label: 'Digital Stress', value: 'Normal', color: 'compliance-accent' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="glass-card p-3 rounded-xl text-center">
          <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: `hsl(var(--${s.color}) / 0.15)` }}>
            <s.icon className="w-4 h-4" style={{ color: `hsl(var(--${s.color}))` }} />
          </div>
          <p className="text-sm font-semibold text-foreground">{s.value}</p>
          <p className="text-[10px] text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Talent Mode sub-components ── */

function PipelineFunnel() {
  const maxCount = pipelineStages[0].count;
  return (
    <div className="space-y-3">
      {pipelineStages.map((stage, i) => {
        const widthPct = Math.max((stage.count / maxCount) * 100, 20);
        return (
          <div key={stage.label} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-40 shrink-0 text-right">{stage.label}</span>
            <div className="flex-1 relative h-8">
              <div
                className="h-full rounded-md flex items-center px-3 transition-all duration-500"
                style={{
                  width: `${widthPct}%`,
                  background: i === 0
                    ? 'hsl(var(--muted))'
                    : `hsl(var(--primary) / ${0.3 + i * 0.2})`,
                }}
              >
                <span className="text-xs font-medium text-foreground">{stage.count}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SkillHeatmapGrid() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {skillHeatmap.map((s) => (
        <div key={s.skill} className="glass-card p-3 rounded-xl">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-foreground truncate pr-2">{s.skill}</span>
            <Badge variant={s.status === 'elite' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0 shrink-0">
              {s.status === 'elite' ? '★ Elite' : s.status === 'advancing' ? '↑ Adv' : '○ Dev'}
            </Badge>
          </div>
          <Progress value={s.level} className="h-1.5" />
          <span className="text-[10px] text-muted-foreground mt-1 block">{s.level}%</span>
        </div>
      ))}
    </div>
  );
}

function ComplianceTicker() {
  return (
    <div className="space-y-2">
      {complianceItems.map((c) => (
        <div key={c.role} className="flex items-center justify-between glass-card p-2.5 rounded-lg">
          <div className="flex items-center gap-2">
            {c.status === 'valid' && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
            {c.status === 'expiring' && <Clock className="w-3.5 h-3.5 text-muted-foreground" />}
            {c.status === 'flagged' && <AlertTriangle className="w-3.5 h-3.5 text-destructive" />}
            <span className="text-xs text-foreground">{c.role}</span>
          </div>
          <span className={`text-[10px] font-medium ${c.status === 'valid' ? 'text-primary' : c.status === 'expiring' ? 'text-muted-foreground' : 'text-destructive'}`}>
            {c.status === 'flagged' ? 'Re-validate' : `${c.days}d`}
          </span>
        </div>
      ))}
    </div>
  );
}

function AIShortlistPanel() {
  return (
    <div className="space-y-3">
      {aiShortlist.map((c) => (
        <div key={c.name} className="glass-card p-3 rounded-xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-foreground">{c.name}</span>
            <Badge variant="secondary" className="text-[10px]">{c.match}% match</Badge>
          </div>
          <span className="text-xs text-muted-foreground block mb-1.5">{c.role}</span>
          <div className="flex items-start gap-1.5 bg-accent/50 rounded-md p-2">
            <Sparkles className="w-3 h-3 text-primary mt-0.5 shrink-0" />
            <span className="text-[11px] text-muted-foreground leading-tight">{c.reason}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function BrandAlignmentIndex() {
  const avg = Math.round(brandTraits.reduce((a, b) => a + b.score, 0) / brandTraits.length);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Overall Index</span>
        <span className="text-2xl font-semibold text-foreground">{avg}%</span>
      </div>
      {brandTraits.map((t) => (
        <div key={t.trait}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-foreground">{t.trait}</span>
            <span className="text-[10px] text-muted-foreground">{t.score}%</span>
          </div>
          <Progress value={t.score} className="h-1" />
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════════════ */

interface CreatorChannel {
  creator_id: string;
  creator_name: string | null;
  creator_bio: string | null;
  featured_game_image: string | null;
  featured_game_name: string | null;
  featured_game_id: string | null;
  total_games: number;
}

export default function Marketplace() {
  const navigate = useNavigate();
  const { isComplianceMode } = useComplianceMode();
  const [creators, setCreators] = useState<CreatorChannel[]>([]);
  const [filteredCreators, setFilteredCreators] = useState<CreatorChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchCreators(); }, []);
  useEffect(() => { applySearch(); }, [creators, searchQuery]);

  const fetchCreators = async () => {
    try {
      const { data: templatesData, error: templatesError } = await supabase
        .from('game_templates')
        .select('id, creator_id, name, preview_image')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (templatesError) throw templatesError;

      const creatorMap = new window.Map() as globalThis.Map<string, { games: any[]; creator_id: string | null }>;
      templatesData?.forEach(template => {
        const key = template.creator_id || 'playops-sample';
        if (!creatorMap.has(key)) creatorMap.set(key, { creator_id: template.creator_id, games: [] });
        creatorMap.get(key)?.games.push({ id: template.id, name: template.name, preview_image: template.preview_image });
      });

      const creatorsWithProfiles = await Promise.all(
        Array.from(creatorMap.values()).map(async ({ creator_id, games }) => {
          if (!creator_id) {
            const fg = games[0];
            return { creator_id: 'playops-sample', creator_name: 'PlayOps Sample Validators', creator_bio: 'Official PlayOps validator templates', featured_game_image: fg?.preview_image, featured_game_name: fg?.name, featured_game_id: fg?.id, total_games: games.length };
          }
          const { data: profile } = await supabase.from('profiles').select('full_name, bio').eq('user_id', creator_id).single();
          const fg = games[0];
          return { creator_id, creator_name: profile?.full_name || 'Unknown Creator', creator_bio: profile?.bio, featured_game_image: fg?.preview_image, featured_game_name: fg?.name, featured_game_id: fg?.id, total_games: games.length };
        })
      );
      setCreators(creatorsWithProfiles);
      setFilteredCreators(creatorsWithProfiles);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const applySearch = () => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      setFilteredCreators(creators.filter(c => c.creator_name?.toLowerCase().includes(q) || c.creator_bio?.toLowerCase().includes(q)));
    } else {
      setFilteredCreators(creators);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Loading Intelligence Hub...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isComplianceMode
              ? <ShieldCheck className="w-5 h-5" style={{ color: 'hsl(var(--compliance-primary))' }} />
              : <Activity className="w-5 h-5 text-primary" />
            }
            <span className="text-xs font-medium text-muted-foreground tracking-widest uppercase">
              {isComplianceMode ? 'Compliance & Audit' : 'Intelligence Hub'}
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-foreground">
            {isComplianceMode ? 'NDS3 Regulatory Compliance' : 'Talent Dashboard'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isComplianceMode
              ? 'Evidence-based audit — logic latency, workforce readiness & forensic integrity'
              : 'Real-time talent pipeline visibility, predictive readiness & compliance audit'
            }
          </p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isComplianceMode ? 'Search compliance, roles...' : 'Search talent, skills, roles...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
      </div>

      {/* ═══ Dual-State Bento Grid ═══ */}
      {isComplianceMode ? (
        /* ── STATE B: Compliance Mode ── */
        <div className="grid grid-cols-12 gap-4 transition-all duration-500">

          {/* Row 1: The Pulse + The Map */}
          <Card className="col-span-12 lg:col-span-4 glass-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4" style={{ color: 'hsl(var(--compliance-primary))' }} />
                <CardTitle className="text-base">The Pulse</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">Logic Latency Measurement</p>
            </CardHeader>
            <CardContent>
              <LogicLatencyGauge />
            </CardContent>
          </Card>

          <Card className="col-span-12 lg:col-span-8 glass-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4" style={{ color: 'hsl(var(--compliance-primary))' }} />
                <CardTitle className="text-base">Workforce Readiness Map</CardTitle>
                <Badge variant="secondary" className="text-[10px] ml-auto">800 Personnel</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Dark green = Proficient | Light green = Mastery</p>
            </CardHeader>
            <CardContent>
              <WorkforceHeatmap />
            </CardContent>
          </Card>

          {/* Row 2: ICV Tracker + Compliance Status */}
          <Card className="col-span-12 lg:col-span-4 glass-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" style={{ color: 'hsl(var(--compliance-primary))' }} />
                <CardTitle className="text-base">ICV Tracker</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">In-Country Value Score</p>
            </CardHeader>
            <CardContent>
              <ICVTracker />
            </CardContent>
          </Card>

          <Card className="col-span-12 lg:col-span-8 glass-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" style={{ color: 'hsl(var(--compliance-primary))' }} />
                <CardTitle className="text-base">Role Compliance Status</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">Live re-validation & certification tracking</p>
            </CardHeader>
            <CardContent>
              <ComplianceTicker />
            </CardContent>
          </Card>

          {/* Row 3: Forensic Stats */}
          <div className="col-span-12">
            <ForensicStats />
          </div>

          {/* Row 4: Evidence Export */}
          <div className="col-span-12 flex justify-center pt-2">
            <Button
              size="lg"
              className="gap-2 px-8 text-sm font-semibold"
              style={{
                backgroundColor: 'hsl(var(--compliance-primary))',
                color: '#FFFFFF',
              }}
              onClick={() => toast.info('Evidence Pack export coming soon')}
            >
              <FileDown className="w-4 h-4" />
              DOWNLOAD EVIDENCE PACK (PDF + JSON)
            </Button>
          </div>
        </div>
      ) : (
        /* ── STATE A: Talent Mode ── */
        <div className="grid grid-cols-12 gap-4 transition-all duration-500">

          {/* Row 1: Pipeline Funnel + Brand Alignment */}
          <Card className="col-span-12 lg:col-span-8 glass-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <CardTitle className="text-base">Talent Pipeline</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">Dynamic funnel from intake to L3 mastery</p>
            </CardHeader>
            <CardContent>
              <PipelineFunnel />
              <div className="mt-4 flex items-center gap-2 bg-accent/40 rounded-lg p-2.5">
                <Zap className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-[11px] text-muted-foreground">
                  <strong className="text-foreground">Predictive Readiness:</strong> 12 candidates trending toward mid-level mastery in Sequence Management within 30 days
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-12 lg:col-span-4 glass-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                <CardTitle className="text-base">Brand DNA Alignment</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">Behavioral culture-fit tracking</p>
            </CardHeader>
            <CardContent>
              <BrandAlignmentIndex />
            </CardContent>
          </Card>

          {/* Row 2: Skills Heatmap + AI Shortlist */}
          <Card className="col-span-12 lg:col-span-7 glass-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                <CardTitle className="text-base">Skills-Based Heatmap</CardTitle>
                <Badge variant="secondary" className="text-[10px] ml-auto">Pedigree-Free</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Skill adjacencies & transferable competency detection</p>
            </CardHeader>
            <CardContent>
              <SkillHeatmapGrid />
            </CardContent>
          </Card>

          <Card className="col-span-12 lg:col-span-5 glass-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <CardTitle className="text-base">AI Shortlist</CardTitle>
                <Badge variant="secondary" className="text-[10px] ml-auto">XAI</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Explainable AI rankings with justification</p>
            </CardHeader>
            <CardContent>
              <AIShortlistPanel />
            </CardContent>
          </Card>

          {/* Row 3: Compliance Ticker + Creator Channels */}
          <Card className="col-span-12 lg:col-span-4 glass-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <CardTitle className="text-base">Compliance Audit</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">Live re-validation status</p>
            </CardHeader>
            <CardContent>
              <ComplianceTicker />
            </CardContent>
          </Card>

          <div className="col-span-12 lg:col-span-8">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Validator Channels</h2>
              <span className="text-xs text-muted-foreground ml-auto">
                {filteredCreators.length} creator{filteredCreators.length !== 1 ? 's' : ''}
              </span>
            </div>

            {filteredCreators.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No creators found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredCreators.map((creator) => {
                  const handleClick = () => {
                    if (creator.total_games === 1 && creator.featured_game_id) {
                      navigate(`/platform/template/${creator.featured_game_id}`);
                    } else {
                      navigate(`/platform/creator/${creator.creator_id}`);
                    }
                  };
                  return (
                    <div
                      key={creator.creator_id}
                      onClick={handleClick}
                      className="glass-card overflow-hidden hover:border-primary/30 transition-all cursor-pointer hover-lift rounded-xl"
                    >
                      <div className="relative aspect-[2/1] bg-muted">
                        {creator.featured_game_image ? (
                          <img
                            src={creator.featured_game_image.startsWith('/') ? creator.featured_game_image.slice(1) : creator.featured_game_image}
                            alt={creator.creator_name || 'Creator'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-accent/30">
                            <span className="text-3xl text-muted-foreground">{creator.creator_name?.charAt(0) || '?'}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-sm text-foreground truncate">{creator.creator_name}</h3>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[11px] text-muted-foreground">{creator.total_games} validator{creator.total_games !== 1 ? 's' : ''}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Row 4: Quick stat cards */}
          {[
            { icon: Users, label: 'Active Candidates', value: '296', sub: '+18 this week' },
            { icon: BarChart3, label: 'Avg. Mastery Score', value: '78%', sub: '↑ 4% from last month' },
            { icon: Brain, label: 'Competencies Mapped', value: '16', sub: 'V5 Framework' },
          ].map((stat) => (
            <Card key={stat.label} className="col-span-12 sm:col-span-4 glass-card border-border">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.sub}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
