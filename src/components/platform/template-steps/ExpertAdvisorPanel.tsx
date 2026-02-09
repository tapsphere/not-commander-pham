import { Badge } from '@/components/ui/badge';
import { Brain, Target, Gauge, Clock, Sparkles, TrendingUp, Eye, Zap } from 'lucide-react';
import { CompetencyTrack } from './types';

// Behavioral Science explanations for competencies
const COMPETENCY_INSIGHTS: Record<string, {
  roleMapping: string;
  cbenWhy: string;
  measurementFocus: string;
  icon: React.ElementType;
  color: string;
}> = {
  'analytical thinking': {
    roleMapping: 'Visual Pattern Recognition & Spatial Decision-Making',
    cbenWhy: 'C-BEN standards identify Analytical Thinking as critical for roles requiring rapid visual assessment—reading boutique floor layouts, optimizing mannequin depth, and controlling focal lighting to guide consumer eye-flow.',
    measurementFocus: 'We measure your ability to detect patterns, prioritize visual elements, and make spatial decisions under time pressure.',
    icon: Eye,
    color: 'amber',
  },
  'growth design': {
    roleMapping: 'Conversion Optimization & Friction Reduction',
    cbenWhy: 'Growth Design under C-BEN standards tests the ability to identify UI friction points, map referral loops, and optimize digital funnels—essential for VIP reservation management and customer journey acceleration.',
    measurementFocus: 'We measure your speed in spotting conversion blockers and precision in recommending funnel improvements.',
    icon: TrendingUp,
    color: 'emerald',
  },
  'emotional intelligence': {
    roleMapping: 'Interpersonal Dynamics & Empathy Calibration',
    cbenWhy: 'Emotional Intelligence in C-BEN frameworks validates your ability to read social cues, manage high-stakes client relationships, and adapt communication style to individual stakeholders.',
    measurementFocus: 'We measure your recognition speed for emotional states and accuracy in selecting appropriate responses.',
    icon: Brain,
    color: 'purple',
  },
  'problem solving': {
    roleMapping: 'Root Cause Analysis & Solution Architecture',
    cbenWhy: 'Problem Solving competency tests systematic debugging—identifying root causes, evaluating solution tradeoffs, and executing under constraints. Critical for operational excellence.',
    measurementFocus: 'We measure diagnostic speed and solution quality under escalating complexity.',
    icon: Zap,
    color: 'blue',
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
}

export function ExpertAdvisorPanel({
  tracks,
  roleContext = 'Professional',
  brandContext,
}: ExpertAdvisorPanelProps) {
  if (tracks.length === 0) {
    return null;
  }

  // Extract role from prompt if available
  const extractedRole = roleContext.includes('Sales Associate') 
    ? 'Luxury Sales Associate'
    : roleContext.includes('Manager')
    ? 'Manager'
    : 'Professional';

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

      {/* Role Mapping */}
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
          → Target Goal: <span className="text-foreground font-medium">High-Stakes VIP Management & Behavioral Readiness</span>
        </p>
      </div>

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
