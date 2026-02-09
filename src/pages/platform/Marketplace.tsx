import { useState, useEffect, useMemo } from 'react';
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

// Aero-Airways professional role imagery
import aeroPCL from '@/assets/aero/premium-cabin-lead.jpg';
import aeroOCC from '@/assets/aero/operations-control-center.jpg';
import aeroLogistics from '@/assets/aero/logistics-cargo-supervisor.jpg';
import aeroSafety from '@/assets/aero/safety-compliance-officer.jpg';

/** Maps role keywords to Aero-Airways imagery */
const AERO_ROLE_IMAGES: Record<string, string> = {
  'premium cabin lead': aeroPCL,
  'cabin lead': aeroPCL,
  'ground ops': aeroOCC,
  'operations': aeroOCC,
  'control': aeroOCC,
  'logistics': aeroLogistics,
  'cargo': aeroLogistics,
  'safety': aeroSafety,
  'compliance': aeroSafety,
  'customer experience': aeroPCL,
  'brand ambassador': aeroPCL,
};

/** Get the best matching Aero role image for a given name/role string */
function getAeroImage(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [keyword, img] of Object.entries(AERO_ROLE_IMAGES)) {
    if (lower.includes(keyword)) return img;
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════════
   SHARED DATA
   ═══════════════════════════════════════════════════════════════ */

const pipelineStages = [
  { label: 'New Intake', count: 142 },
  { label: 'Behavioral Screening', count: 89 },
  { label: 'Competency Validation', count: 47 },
  { label: 'L3 Mastery', count: 18 },
];

const skillHeatmap = [
  { skill: 'Sequence Management', level: 94, status: 'elite' as const, category: 'technical' as const },
  { skill: 'Anticipatory Service', level: 87, status: 'advancing' as const, category: 'hospitality' as const },
  { skill: 'Crisis De-escalation', level: 72, status: 'developing' as const, category: 'technical' as const },
  { skill: 'Brand Articulation', level: 81, status: 'advancing' as const, category: 'hospitality' as const },
  { skill: 'Cognitive Load Mgmt', level: 65, status: 'developing' as const, category: 'technical' as const },
  { skill: 'Refined Hospitality', level: 91, status: 'elite' as const, category: 'hospitality' as const },
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
  { role: 'Premium Cabin Lead', status: 'valid' as const, days: 120 },
  { role: 'Ground Ops Supervisor', status: 'expiring' as const, days: 14 },
  { role: 'Safety Compliance Officer', status: 'valid' as const, days: 200 },
  { role: 'Customer Experience Mgr', status: 'flagged' as const, days: 0 },
];

/* ═══════════════════════════════════════════════════════════════
   STATE A: TALENT MODE — The Blue Path
   ═══════════════════════════════════════════════════════════════ */

function PipelineFunnel() {
  const maxCount = pipelineStages[0].count;
  return (
    <div className="space-y-3">
      {pipelineStages.map((stage, i) => {
        const widthPct = Math.max((stage.count / maxCount) * 100, 20);
        const isFirst = i === 0;
        const isLast = i === pipelineStages.length - 1; // L3 Mastery = Gold
        return (
          <div key={stage.label} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-40 shrink-0 text-right">{stage.label}</span>
            <div className="flex-1 relative h-8">
              <div
                className="h-full rounded-md flex items-center px-3 transition-all duration-700"
                style={{
                  width: `${widthPct}%`,
                  background: isFirst
                    ? 'hsl(var(--muted))'
                    : isLast
                    ? `linear-gradient(90deg, hsl(var(--talent-blue)), hsl(var(--talent-gold)))`
                    : `linear-gradient(90deg, hsl(var(--talent-blue-deep)), hsl(var(--talent-blue)))`,
                  boxShadow: isFirst
                    ? 'none'
                    : isLast
                    ? '0 0 10px hsl(var(--talent-gold) / 0.25)'
                    : '0 0 8px hsl(var(--talent-blue) / 0.2)',
                }}
              >
                <span className="text-xs font-semibold text-foreground">{stage.count}</span>
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
      {skillHeatmap.map((s) => {
        const isHospitality = s.category === 'hospitality';
        const colorToken = isHospitality ? '--brand-purple' : '--talent-blue';
        const deepToken = isHospitality ? '--brand-purple-light' : '--talent-blue-deep';

        return (
          <div key={s.skill} className="glass-card p-3 rounded-xl transition-all duration-500">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-foreground truncate pr-2">{s.skill}</span>
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 shrink-0"
                style={
                  s.status === 'elite'
                    ? {
                        backgroundColor: 'hsl(var(--talent-gold) / 0.2)',
                        color: 'hsl(var(--talent-gold))',
                        borderWidth: '1px',
                        borderColor: 'hsl(var(--talent-gold) / 0.3)',
                        boxShadow: '0 0 8px hsl(var(--talent-gold) / 0.15)',
                      }
                    : { backgroundColor: 'hsl(var(--muted) / 0.6)' }
                }
              >
                {s.status === 'elite' ? '★ Mastery' : s.status === 'advancing' ? '↑ Adv' : '○ Dev'}
              </Badge>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${s.level}%`,
                  background: s.status === 'elite'
                    ? `linear-gradient(90deg, hsl(var(${colorToken})), hsl(var(--talent-gold)))`
                    : `linear-gradient(90deg, hsl(var(${deepToken})), hsl(var(${colorToken})))`,
                }}
              />
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground mt-1 block">{s.level}%</span>
          </div>
        );
      })}
    </div>
  );
}

function ComplianceTicker() {
  return (
    <div className="space-y-2">
      {complianceItems.map((c) => (
        <div key={c.role} className="flex items-center justify-between glass-card p-2.5 rounded-lg transition-all duration-500">
          <div className="flex items-center gap-2">
            {(() => { const img = getAeroImage(c.role); return img ? <img src={img} alt={c.role} className="w-6 h-6 rounded-md object-cover shrink-0" /> : null; })()}
            {c.status === 'valid' && <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'hsl(var(--talent-blue))' }} />}
            {c.status === 'expiring' && <Clock className="w-3.5 h-3.5 text-muted-foreground" />}
            {c.status === 'flagged' && <AlertTriangle className="w-3.5 h-3.5 text-destructive" />}
            <span className="text-xs text-foreground">{c.role}</span>
          </div>
          <span className={`text-[10px] font-semibold ${c.status === 'valid' ? 'text-[hsl(var(--talent-blue))]' : c.status === 'expiring' ? 'text-muted-foreground' : 'text-destructive'}`}>
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
        <div key={c.name} className="glass-card p-3 rounded-xl transition-all duration-500">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              {(() => { const img = getAeroImage(c.role); return img ? <img src={img} alt={c.role} className="w-7 h-7 rounded-full object-cover shrink-0" /> : null; })()}
              <span className="text-sm font-semibold text-foreground">{c.name}</span>
            </div>
            <Badge variant="secondary" className="text-[10px] bg-muted/60 text-muted-foreground">{c.match}% match</Badge>
          </div>
          <span className="text-xs text-muted-foreground block mb-1.5">{c.role}</span>
          <div className="flex items-start gap-1.5 rounded-md p-2" style={{ backgroundColor: 'hsl(var(--talent-blue) / 0.08)' }}>
            <Sparkles className="w-3 h-3 mt-0.5 shrink-0" style={{ color: 'hsl(var(--talent-blue))' }} />
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
        <span className="text-2xl font-bold text-foreground">{avg}%</span>
      </div>
      {brandTraits.map((t) => (
        <div key={t.trait}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-foreground">{t.trait}</span>
            <span className="text-[10px] font-semibold text-muted-foreground">{t.score}%</span>
          </div>
          <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${t.score}%`,
                background: `linear-gradient(90deg, hsl(var(--brand-purple)), hsl(var(--brand-purple-light)))`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STATE B: COMPLIANCE MODE — The Green Path
   ═══════════════════════════════════════════════════════════════ */

function WorkforceHeatmap() {
  /* Stable cells — memoized so they don't re-randomize on toggle */
  const cells = useMemo(() =>
    Array.from({ length: 800 }, () => {
      const r = Math.random();
      if (r > 0.75) return 'mastery';   // Tier 4 — Glowing Mint
      if (r > 0.45) return 'high';      // Tier 3 — Forest Deep
      if (r > 0.2) return 'mid';        // Tier 2 — True Emerald
      return 'low';                      // Tier 1 — Soft Sage
    }), []
  );

  const tierColor = (t: string) => {
    switch (t) {
      case 'mastery': return 'hsl(var(--compliance-accent))';
      case 'high': return 'hsl(var(--compliance-primary))';
      case 'mid': return 'hsl(var(--compliance-emerald))';
      default: return 'hsl(var(--compliance-sage))';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs text-muted-foreground">800 Personnel — Live Status</span>
        <div className="flex items-center gap-3">
          {[
            { label: 'Mastery', token: '--compliance-accent' },
            { label: 'High', token: '--compliance-primary' },
            { label: 'Mid', token: '--compliance-emerald' },
            { label: 'Low', token: '--compliance-sage' },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: `hsl(var(${l.token}))` }} />
              <span className="text-[10px] text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-[2px]" style={{ gridTemplateColumns: 'repeat(40, 1fr)' }}>
        {cells.map((level, i) => (
          <div
            key={i}
            className="aspect-square rounded-[2px] transition-colors duration-500"
            style={{ backgroundColor: tierColor(level) }}
          />
        ))}
      </div>
    </div>
  );
}

function LogicLatencyGauge() {
  const latency = 540;
  const maxLatency = 1000;
  const pct = (latency / maxLatency) * 100;
  const angle = (pct / 100) * 180 - 90;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-44 h-28 overflow-hidden">
        <svg viewBox="0 0 200 115" className="w-full h-full">
          {/* Background arc */}
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="hsl(var(--muted))" strokeWidth="14" strokeLinecap="round" />
          {/* Filled arc — emerald gradient */}
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--compliance-primary))" />
              <stop offset="100%" stopColor="hsl(var(--compliance-accent))" />
            </linearGradient>
          </defs>
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#gaugeGrad)" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${pct * 2.51} 251`} />
          {/* Metallic green needle */}
          <line
            x1="100" y1="100"
            x2={100 + 60 * Math.cos((angle * Math.PI) / 180)}
            y2={100 - 60 * Math.sin((angle * Math.PI) / 180)}
            stroke="hsl(var(--compliance-primary))"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="drop-shadow(0 1px 3px hsl(var(--compliance-primary) / 0.5))"
          />
          <circle cx="100" cy="100" r="5" fill="hsl(var(--compliance-primary))" filter="drop-shadow(0 1px 3px hsl(var(--compliance-primary) / 0.4))" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-3xl font-bold text-foreground tracking-tight">{latency}<span className="text-sm font-normal text-muted-foreground ml-1">ms</span></p>
        <p className="text-xs text-muted-foreground">Logic Latency Measurement</p>
      </div>
    </div>
  );
}

function ICVTracker() {
  const icvScore = 88.4;
  const threshold = 85;
  const isAboveThreshold = icvScore >= threshold;

  return (
    <div className="space-y-4">
      {/* Data Overlay — Top Row */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-foreground tracking-wide" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          In-Country Value Score
        </span>
        <span
          className="text-2xl font-bold text-foreground tracking-tighter"
          style={{ fontFamily: '"SF Mono", "Fira Code", "Cascadia Code", monospace' }}
        >
          {icvScore.toFixed(1)}%
        </span>
      </div>

      {/* Regulatory Progress Track */}
      <div
        className="relative w-full h-8 rounded-lg overflow-hidden"
        style={{
          backdropFilter: 'blur(25px)',
          border: '0.5px solid rgba(255, 255, 255, 0.1)',
          backgroundColor: 'hsl(var(--compliance-sage) / 0.12)',
          boxShadow: isAboveThreshold
            ? '0 0 20px hsl(var(--compliance-accent) / 0.15), inset 0 1px 0 rgba(255,255,255,0.05)'
            : '0 2px 8px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* Fill bar with liquid pulse */}
        <div
          className="absolute inset-y-0 left-0 rounded-lg"
          style={{
            width: `${icvScore}%`,
            background: isAboveThreshold
              ? 'linear-gradient(90deg, #004D40, #00C853, #00FFAB)'
              : 'linear-gradient(90deg, #BF8A30, #C0B283)',
            transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {/* Liquid pulse overlay */}
          <div
            className="absolute inset-0 rounded-lg"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'liquidPulse 2.5s ease-in-out infinite',
            }}
          />
        </div>

        {/* Threshold marker at 85% */}
        <div
          className="absolute top-0 bottom-0 flex flex-col items-center z-10"
          style={{ left: `${threshold}%`, transform: 'translateX(-50%)' }}
        >
          <div
            className="w-[1px] h-full"
            style={{
              background: 'hsl(var(--talent-gold))',
              boxShadow: '0 0 4px hsl(var(--talent-gold) / 0.5)',
            }}
          />
        </div>

        {/* Threshold label */}
        <div
          className="absolute -top-5 text-center z-10"
          style={{ left: `${threshold}%`, transform: 'translateX(-50%)' }}
        >
          <span className="text-[9px] font-semibold text-muted-foreground whitespace-nowrap">
            National Requirement
          </span>
        </div>
      </div>

      {/* Bottom sub-text */}
      <p className="text-[10px] text-muted-foreground">
        Verified against <span className="font-semibold text-foreground">v2.1</span> Local Content Regulations
      </p>
    </div>
  );
}

function ForensicStats() {
  const stats = [
    { icon: Eye, label: 'Verified Signals', value: '847,329', token: '--compliance-primary' },
    { icon: Fingerprint, label: 'Forensic Integrity', value: '0% Fraud', token: '--compliance-primary' },
    { icon: HeartPulse, label: 'Body Language', value: 'Baseline', token: '--compliance-emerald' },
    { icon: Activity, label: 'Digital Stress', value: 'Normal', token: '--compliance-accent' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="glass-card p-3 rounded-xl text-center transition-all duration-500">
          <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: `hsl(var(${s.token}) / 0.12)` }}>
            <s.icon className="w-4 h-4" style={{ color: `hsl(var(${s.token}))` }} />
          </div>
          <p className="text-sm font-bold text-foreground">{s.value}</p>
          <p className="text-[10px] text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════════════════════════════ */

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

  /* Morphic transition wrapper — 0.8s slide + color shift */
  const morphicClass = 'transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)]';

  return (
    <div className={`max-w-[1400px] mx-auto space-y-6 ${morphicClass}`}>

      {/* ── Header ── */}
      <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 ${morphicClass}`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isComplianceMode
              ? <ShieldCheck className="w-5 h-5" style={{ color: 'hsl(var(--compliance-primary))' }} />
              : <Activity className="w-5 h-5" style={{ color: 'hsl(var(--talent-blue))' }} />
            }
            <span className={`text-xs font-medium tracking-widest uppercase ${morphicClass}`} style={{
              color: isComplianceMode ? 'hsl(var(--compliance-primary))' : 'hsl(var(--talent-blue))',
            }}>
              {isComplianceMode ? 'Compliance & Audit' : 'Intelligence Hub'}
            </span>
          </div>
          <h1 className={`text-3xl font-semibold text-foreground ${morphicClass}`}>
            {isComplianceMode ? 'NDS3 Regulatory Compliance' : 'Aero-Airways Talent Dashboard'}
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
        <div className={`grid grid-cols-12 gap-4 ${morphicClass} animate-fade-in`}>

          <Card className={`col-span-12 lg:col-span-4 glass-card ${morphicClass}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4" style={{ color: 'hsl(var(--compliance-primary))' }} />
                <CardTitle className="text-base">The Pulse</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">Logic Latency Measurement</p>
            </CardHeader>
            <CardContent><LogicLatencyGauge /></CardContent>
          </Card>

          <Card className={`col-span-12 lg:col-span-8 glass-card ${morphicClass}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4" style={{ color: 'hsl(var(--compliance-primary))' }} />
                <CardTitle className="text-base">Workforce Readiness Map</CardTitle>
                <Badge variant="secondary" className="text-[10px] ml-auto bg-muted/60 text-muted-foreground">800 Personnel</Badge>
              </div>
              <p className="text-xs text-muted-foreground">4-tier green scale: Sage → Emerald → Forest → Mint</p>
            </CardHeader>
            <CardContent><WorkforceHeatmap /></CardContent>
          </Card>

          <Card className={`col-span-12 lg:col-span-4 glass-card ${morphicClass}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" style={{ color: 'hsl(var(--compliance-primary))' }} />
                <CardTitle className="text-base">ICV Tracker</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">In-Country Value Score</p>
            </CardHeader>
            <CardContent><ICVTracker /></CardContent>
          </Card>

          <Card className={`col-span-12 lg:col-span-8 glass-card ${morphicClass}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" style={{ color: 'hsl(var(--compliance-primary))' }} />
                <CardTitle className="text-base">Role Compliance Status</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">Live re-validation & certification tracking</p>
            </CardHeader>
            <CardContent><ComplianceTicker /></CardContent>
          </Card>

          <div className="col-span-12"><ForensicStats /></div>

          <div className="col-span-12 flex justify-center pt-2">
            <Button
              size="lg"
              className={`gap-2 px-8 text-sm font-bold tracking-wide ${morphicClass}`}
              style={{ backgroundColor: 'hsl(var(--compliance-primary))', color: '#FFFFFF' }}
              onClick={() => toast.info('Evidence Pack export coming soon')}
            >
              <FileDown className="w-4 h-4" />
              DOWNLOAD EVIDENCE PACK (PDF + JSON)
            </Button>
          </div>
        </div>
      ) : (
        /* ── STATE A: Talent Mode ── */
        <div className={`grid grid-cols-12 gap-4 ${morphicClass} animate-fade-in`}>

          <Card className={`col-span-12 lg:col-span-8 glass-card ${morphicClass}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" style={{ color: 'hsl(var(--talent-blue))' }} />
                <CardTitle className="text-base">Talent Pipeline</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">Dynamic funnel from intake to L3 mastery</p>
            </CardHeader>
            <CardContent>
              <PipelineFunnel />
              <div className="mt-4 flex items-center gap-2 rounded-lg p-2.5" style={{ backgroundColor: 'hsl(var(--talent-blue) / 0.06)' }}>
                <Zap className="w-3.5 h-3.5 shrink-0" style={{ color: 'hsl(var(--talent-blue))' }} />
                <span className="text-[11px] text-muted-foreground">
                  <strong className="text-foreground font-semibold">Predictive Readiness:</strong> 12 candidates trending toward mid-level mastery in Sequence Management within 30 days
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className={`col-span-12 lg:col-span-4 glass-card ${morphicClass}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" style={{ color: 'hsl(var(--brand-purple))' }} />
                <CardTitle className="text-base">Brand DNA Alignment</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">Behavioral culture-fit tracking</p>
            </CardHeader>
            <CardContent><BrandAlignmentIndex /></CardContent>
          </Card>

          <Card className={`col-span-12 lg:col-span-7 glass-card ${morphicClass}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4" style={{ color: 'hsl(var(--talent-blue))' }} />
                <CardTitle className="text-base">Skills-Based Heatmap</CardTitle>
                <Badge variant="secondary" className="text-[10px] ml-auto bg-muted/60 text-muted-foreground">Pedigree-Free</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Skill adjacencies & transferable competency detection</p>
            </CardHeader>
            <CardContent><SkillHeatmapGrid /></CardContent>
          </Card>

          <Card className={`col-span-12 lg:col-span-5 glass-card ${morphicClass}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: 'hsl(var(--talent-blue))' }} />
                <CardTitle className="text-base">AI Shortlist</CardTitle>
                <Badge variant="secondary" className="text-[10px] ml-auto bg-muted/60 text-muted-foreground">XAI</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Explainable AI rankings with justification</p>
            </CardHeader>
            <CardContent><AIShortlistPanel /></CardContent>
          </Card>

          <Card className={`col-span-12 lg:col-span-4 glass-card ${morphicClass}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" style={{ color: 'hsl(var(--talent-blue))' }} />
                <CardTitle className="text-base">Compliance Audit</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">Live re-validation status</p>
            </CardHeader>
            <CardContent><ComplianceTicker /></CardContent>
          </Card>

          <div className="col-span-12 lg:col-span-8">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4" style={{ color: 'hsl(var(--talent-blue))' }} />
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
                      className="glass-card overflow-hidden transition-all duration-300 cursor-pointer hover-lift rounded-xl"
                    >
                      <div className="relative aspect-[2/1] bg-muted">
                        {(() => {
                          // Always prefer Aero-Airways imagery for unknown/placeholder creators
                          const isUnknown = !creator.creator_name || creator.creator_name === 'Unknown Creator';
                          const aeroImg = getAeroImage(creator.creator_name || '') || getAeroImage(creator.featured_game_name || '');
                          const fallbackAero = [aeroPCL, aeroOCC, aeroLogistics, aeroSafety][Math.abs((creator.creator_name || '').length + (creator.creator_id || '').length) % 4];

                          if (isUnknown || !creator.featured_game_image) {
                            return <img src={aeroImg || fallbackAero} alt={creator.featured_game_name || 'Aero Role'} className="w-full h-full object-cover" />;
                          }

                          return (
                            <img
                              src={creator.featured_game_image.startsWith('/') ? creator.featured_game_image.slice(1) : creator.featured_game_image}
                              alt={creator.creator_name || 'Creator'}
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).src = aeroImg || fallbackAero; }}
                            />
                          );
                        })()}
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

          {[
            { icon: Users, label: 'Active Candidates', value: '296', sub: '+18 this week' },
            { icon: BarChart3, label: 'Avg. Mastery Score', value: '78%', sub: '↑ 4% from last month' },
            { icon: Brain, label: 'Competencies Mapped', value: '16', sub: 'V5 Framework' },
          ].map((stat) => (
            <Card key={stat.label} className={`col-span-12 sm:col-span-4 glass-card ${morphicClass}`}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'hsl(var(--talent-blue) / 0.1)' }}>
                  <stat.icon className="w-5 h-5" style={{ color: 'hsl(var(--talent-blue))' }} />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
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
