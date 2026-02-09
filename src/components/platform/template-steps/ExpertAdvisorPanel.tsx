import { Badge } from '@/components/ui/badge';
import { Brain, Target, Gauge, Clock, Sparkles, TrendingUp, Eye, Zap, FileText, BookOpen, CheckCircle2 } from 'lucide-react';
import { CompetencyTrack } from './types';
import type { DistillationResult } from './UnifiedCreativeInput';

// Behavioral Science explanations for competencies
const COMPETENCY_INSIGHTS: Record<string, {
  roleMapping: string;
  cbenWhy: string;
  measurementFocus: string;
  icon: React.ElementType;
  color: string;
}> = {
  'analytical thinking': {
    roleMapping: 'Forensic Systems Audit & Pressure Vessel Analysis',
    cbenWhy: 'C-BEN standards identify Analytical Thinking as critical for roles requiring forensic inspection of aircraft systems—validating 1,850 PSI oxygen cylinder integrity, verifying 15lb Halon discharge force, and interpreting multi-system fault cascades under FAA compliance.',
    measurementFocus: 'We measure your ability to detect pressure anomalies, cross-reference technical tolerances, and make safety-critical judgments under time pressure.',
    icon: Eye,
    color: 'amber',
  },
  'problem solving': {
    roleMapping: 'Systematic Survival Logic & Emergency Deployment',
    cbenWhy: 'Problem Solving under C-BEN standards tests systematic emergency response—executing 6-second slide deployment sequences, managing evacuation decision trees, and applying survival logic protocols across multi-scenario cabin emergencies.',
    measurementFocus: 'We measure diagnostic speed in emergency triage and procedural accuracy under escalating cabin threat levels.',
    icon: Zap,
    color: 'blue',
  },
  'digital & ai fluency': {
    roleMapping: 'VOCUS Retina Sync & Haptic Override Systems',
    cbenWhy: 'Digital & AI Fluency validates mastery of next-gen cockpit-cabin interfaces—achieving 45-second VOCUS Retina Sync calibration, executing 800ms Haptic override commands, and interpreting real-time AI diagnostic feeds for in-flight anomaly detection.',
    measurementFocus: 'We measure interface response latency, override execution precision, and digital system trust calibration.',
    icon: Brain,
    color: 'purple',
  },
  'adaptability & resilience': {
    roleMapping: 'Alert Grace Protocol & Premium Service Under Pressure',
    cbenWhy: 'Adaptability & Resilience in C-BEN frameworks tests the ability to maintain premium cabin standards under operational stress—executing 180-second wine aeration protocols, achieving 10mm linen alignment precision, and sustaining "Alert Grace" behavioral composure during turbulence and irregular operations.',
    measurementFocus: 'We measure service precision maintenance, emotional regulation speed, and protocol adherence under disruption.',
    icon: TrendingUp,
    color: 'emerald',
  },
  'growth design': {
    roleMapping: 'Operational Growth & Continuous Improvement',
    cbenWhy: 'Growth Design under C-BEN standards validates the ability to identify operational improvement opportunities, optimize passenger experience funnels, and drive measurable service quality metrics across cabin operations.',
    measurementFocus: 'We measure strategic identification of growth levers, conversion of service touchpoints, and data-driven optimization under operational constraints.',
    icon: TrendingUp,
    color: 'emerald',
  },
};

// Default fallback for competencies not in the map
const DEFAULT_INSIGHT = {
  roleMapping: 'Professional Skill Assessment',
  cbenWhy: 'This competency is validated against C-BEN (Competency-Based Education Network) standards to ensure behavioral readiness for real-world application.',
  measurementFocus: 'We measure cognitive speed, decision accuracy, and execution precision under timed conditions.',
  icon: Target,
  color: 'primary',
};

interface ExpertAdvisorPanelProps {
  tracks: CompetencyTrack[];
  roleContext?: string;
  brandContext?: string;
  distillationResult?: DistillationResult | null;
}

export function ExpertAdvisorPanel({
  tracks,
  roleContext = 'Professional',
  brandContext,
  distillationResult,
}: ExpertAdvisorPanelProps) {
  // IDLE STATE: No tracks and no distillation
  if (tracks.length === 0 && !distillationResult) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">C-BEN Expert Advisor</h3>
            <p className="text-xs text-muted-foreground">Behavioral Science Validation</p>
          </div>
        </div>

        {/* Idle Message */}
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border flex items-center justify-center mb-4">
            <Brain className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">System Ready</p>
          <p className="text-xs text-muted-foreground/70 max-w-[220px]">
            Awaiting PDF ingestion or prompt to initiate Instructional Engineering.
          </p>
        </div>
      </div>
    );
  }

  // Extract role from prompt if available
  const extractedRole = roleContext.includes('PCL') || roleContext.includes('Cabin')
    ? 'Premium Cabin Lead'
    : roleContext.includes('Safety')
    ? 'Safety Compliance Officer'
    : roleContext.includes('Ground') || roleContext.includes('Ops')
    ? 'Ground Ops Supervisor'
    : roleContext.includes('Customer') || roleContext.includes('Experience')
    ? 'Customer Experience Manager'
    : 'Aero-Airways Crew Member';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-border">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-foreground">C-BEN Expert Advisor</h3>
          <p className="text-xs text-muted-foreground">Behavioral Science Validation</p>
        </div>
      </div>

      {/* DISTILLATION RESULTS — Phase 1 AI Reasoning */}
      {distillationResult && (
        <>
          {/* Document Summary */}
          <div className="bg-gradient-to-r from-blue-500/5 to-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Phase 1: Document Distilled</span>
            </div>
            <p className="text-xs text-foreground font-medium mb-1">{distillationResult.filename}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{distillationResult.documentSummary}</p>
          </div>

          {/* Technical Core Extraction */}
          <div className="bg-muted/30 border border-border rounded-xl p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              🔬 Noise Filter Applied
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {distillationResult.technicalCoreExtracted}
            </p>
          </div>

          {/* Macro-Lessons Discovered */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-semibold text-foreground">
                {distillationResult.macroLessons.length} Macro-Lessons Identified
              </span>
            </div>
            {distillationResult.macroLessons.map((lesson, idx) => (
              <div 
                key={idx}
                className="bg-background border border-border rounded-lg p-3 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <p className="text-xs font-semibold text-foreground flex-1">{lesson.lessonName}</p>
                  <Badge variant="outline" className="text-[10px] ml-2 shrink-0">
                    {lesson.suggestedCompetency}
                  </Badge>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium mb-1">Condensed Standards:</p>
                  <ul className="space-y-0.5">
                    {lesson.condensedStandards.slice(0, 3).map((std, i) => (
                      <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{std}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-primary/5 rounded-md p-2">
                  <p className="text-[10px] text-primary font-medium">Why {lesson.suggestedCompetency}?</p>
                  <p className="text-[10px] text-muted-foreground">{lesson.rationale}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Role Mapping */}
      {tracks.length > 0 && (
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">Role Mapping</span>
          </div>
          <p className="text-sm text-foreground font-medium mb-1">
            {extractedRole}
            {brandContext && <span className="text-muted-foreground"> • {brandContext}</span>}
          </p>
          <p className="text-xs text-muted-foreground">
            → Target Goal: <span className="text-foreground font-medium">Wide-Body Jet Safety & Premium Service Readiness</span>
          </p>
        </div>
      )}

      {/* Track-by-Track C-BEN Explanations */}
      {tracks.map((track, idx) => {
        const competencyKey = track.competencyName.toLowerCase();
        const insight = COMPETENCY_INSIGHTS[competencyKey] || DEFAULT_INSIGHT;
        const IconComponent = insight.icon;
        
        const colorClasses: Record<string, { bg: string; border: string; text: string; badge: string }> = {
          amber: { bg: 'bg-amber-500/5', border: 'border-amber-500/20', text: 'text-amber-600', badge: 'bg-amber-500/20 text-amber-700' },
          emerald: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', text: 'text-emerald-600', badge: 'bg-emerald-500/20 text-emerald-700' },
          purple: { bg: 'bg-purple-500/5', border: 'border-purple-500/20', text: 'text-purple-600', badge: 'bg-purple-500/20 text-purple-700' },
          blue: { bg: 'bg-blue-500/5', border: 'border-blue-500/20', text: 'text-blue-600', badge: 'bg-blue-500/20 text-blue-700' },
          primary: { bg: 'bg-primary/5', border: 'border-primary/20', text: 'text-primary', badge: 'bg-primary/20 text-primary' },
        };
        
        const colors = colorClasses[insight.color] || colorClasses.primary;

        return (
          <div 
            key={track.id}
            className={`${colors.bg} ${colors.border} border rounded-xl p-4 space-y-3`}
          >
            {/* Track Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${colors.bg}`}>
                  <IconComponent className={`h-4 w-4 ${colors.text}`} />
                </div>
                <div>
                  <span className="text-sm font-semibold text-foreground">{track.competencyName}</span>
                  <Badge className={`ml-2 text-[10px] ${colors.badge}`}>
                    Track {idx + 1}
                  </Badge>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px]">
                6 Scenes
              </Badge>
            </div>

            {/* Why This Skill */}
            <div>
              <p className={`text-[10px] font-semibold uppercase tracking-wide ${colors.text} mb-1`}>
                Why This Skill?
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {insight.cbenWhy}
              </p>
            </div>

            {/* Role Application */}
            <div className="bg-background/50 rounded-lg p-2">
              <p className="text-[10px] text-muted-foreground mb-0.5">For a {extractedRole}, this means:</p>
              <p className="text-xs text-foreground font-medium">{insight.roleMapping}</p>
            </div>
          </div>
        );
      })}

      {/* Measurement Methodology */}
      {tracks.length > 0 && (
        <div className="bg-muted/50 border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground uppercase tracking-wide">What We Measure</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center p-2 bg-background rounded-lg border border-border">
              <Zap className="h-4 w-4 text-amber-500 mx-auto mb-1" />
              <p className="text-[10px] font-medium text-foreground">Cognitive Speed</p>
              <p className="text-[9px] text-muted-foreground">Decision Velocity</p>
            </div>
            <div className="text-center p-2 bg-background rounded-lg border border-border">
              <Target className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
              <p className="text-[10px] font-medium text-foreground">Precision</p>
              <p className="text-[9px] text-muted-foreground">Answer Accuracy</p>
            </div>
            <div className="text-center p-2 bg-background rounded-lg border border-border">
              <Clock className="h-4 w-4 text-rose-500 mx-auto mb-1" />
              <p className="text-[10px] font-medium text-foreground">Time Gate</p>
              <p className="text-[9px] text-muted-foreground">60s Pressure</p>
            </div>
          </div>
          
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            This isn't a knowledge test—we're measuring <span className="text-foreground font-medium">behavioral readiness</span> under 
            real-world time pressure. Each scene runs a 60-second gate to validate execution precision.
          </p>
        </div>
      )}

      {/* C-BEN Standard Footer */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <Brain className="h-3 w-3 text-muted-foreground" />
        <p className="text-[10px] text-muted-foreground">
          Validated against <span className="font-medium">C-BEN Standards</span>
        </p>
      </div>
    </div>
  );
}
