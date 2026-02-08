import React from 'react';
import { Brain, Target, Users, TrendingUp, MessageCircle, Shield, BookOpen, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Competency, SubCompetency } from './types';

// Creator-friendly tags for each competency category
const CREATOR_TAGS: Record<string, { tag: string; icon: React.ElementType; color: string; description: string }> = {
  'Analytical Thinking': { 
    tag: 'Best for Data Roles', 
    icon: Brain, 
    color: 'text-blue-500',
    description: 'Tests the ability to interpret data, identify patterns, and draw evidence-based conclusions.'
  },
  'Critical Thinking': { 
    tag: 'Decision Makers', 
    icon: Target, 
    color: 'text-purple-500',
    description: 'Evaluates logical reasoning, bias detection, and objective assessment of arguments.'
  },
  'Problem Solving': { 
    tag: 'Operations & Strategy', 
    icon: TrendingUp, 
    color: 'text-green-500',
    description: 'Measures creative solution generation, root cause analysis, and strategic planning.'
  },
  'Communication': { 
    tag: 'Client-Facing Roles', 
    icon: MessageCircle, 
    color: 'text-amber-500',
    description: 'Assesses clarity, empathy, persuasion, and conflict resolution in interactions.'
  },
  'Collaboration': { 
    tag: 'Team Leadership', 
    icon: Users, 
    color: 'text-cyan-500',
    description: 'Tests team coordination, delegation, consensus building, and cross-functional alignment.'
  },
  'Adaptability': { 
    tag: 'Fast-Paced Environments', 
    icon: Shield, 
    color: 'text-rose-500',
    description: 'Evaluates flexibility, resilience under pressure, and learning agility.'
  },
};

interface CompetencyPropertiesPanelProps {
  competency: Competency | null;
  subCompetencies: SubCompetency[];
  selectedSubCompetencies: string[];
}

export function CompetencyPropertiesPanel({
  competency,
  subCompetencies,
  selectedSubCompetencies,
}: CompetencyPropertiesPanelProps) {
  if (!competency) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
        <div className="p-4 bg-muted/50 rounded-full mb-4">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <h4 className="font-medium text-foreground mb-2">No Competency Selected</h4>
        <p className="text-sm text-muted-foreground max-w-[200px]">
          Use the AI search to find a competency that matches the skill you want to test.
        </p>
      </div>
    );
  }

  const tagInfo = CREATOR_TAGS[competency.name];
  const TagIcon = tagInfo?.icon || Brain;
  const relevantSubs = subCompetencies.filter(s => s.competency_id === competency.id);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2 mb-2">
          <div className={cn(
            "p-2 rounded-lg",
            tagInfo ? `bg-current/10 ${tagInfo.color}` : "bg-primary/10"
          )}>
            <TagIcon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground text-sm">
              {competency.name}
            </h4>
            {tagInfo && (
              <Badge 
                variant="outline" 
                className={cn("text-[10px] mt-0.5", tagInfo.color)}
              >
                {tagInfo.tag}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Description */}
        {tagInfo?.description && (
          <div>
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              What This Tests
            </h5>
            <p className="text-sm text-foreground leading-relaxed">
              {tagInfo.description}
            </p>
          </div>
        )}

        <Separator />

        {/* Category & Departments */}
        <div>
          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            C-BEN Category
          </h5>
          <Badge variant="secondary" className="text-xs">
            {competency.cbe_category}
          </Badge>
        </div>

        {competency.departments?.length > 0 && (
          <div>
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Applicable Departments
            </h5>
            <div className="flex flex-wrap gap-1">
              {competency.departments.map(dept => (
                <Badge key={dept} variant="outline" className="text-[10px]">
                  {dept}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Sub-Competencies Summary */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              Sub-Competencies
            </h5>
            <Badge variant="outline" className="text-[10px]">
              {selectedSubCompetencies.length}/6 selected
            </Badge>
          </div>
          
          <div className="space-y-3">
            {relevantSubs.slice(0, 6).map((sub, idx) => {
              const isSelected = selectedSubCompetencies.includes(sub.id);
              return (
                <div 
                  key={sub.id}
                  className={cn(
                    "p-3 rounded-lg text-xs transition-colors",
                    isSelected 
                      ? "bg-primary/10 border border-primary/30" 
                      : "bg-muted/30 border border-transparent"
                  )}
                >
                  <div className="flex items-start gap-2 mb-2">
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                        {selectedSubCompetencies.indexOf(sub.id) + 1}
                      </span>
                    )}
                    <p className={cn(
                      "line-clamp-2 font-medium",
                      isSelected ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {sub.statement}
                    </p>
                  </div>
                  
                  {/* V5 Scientific Profile - Show all 4 fields when selected */}
                  {isSelected && (
                    <div className="mt-2 space-y-1.5 pl-7">
                      {sub.action_cue && (
                        <div className="flex items-start gap-1.5">
                          <span className="text-[9px] font-semibold text-amber-600 uppercase shrink-0 w-16">Action:</span>
                          <span className="text-[10px] text-muted-foreground">{sub.action_cue}</span>
                        </div>
                      )}
                      {sub.game_mechanic && (
                        <div className="flex items-start gap-1.5">
                          <span className="text-[9px] font-semibold text-amber-600 uppercase shrink-0 w-16">Mechanic:</span>
                          <span className="text-[10px] text-muted-foreground">{sub.game_mechanic}</span>
                        </div>
                      )}
                      {sub.game_loop && (
                        <div className="flex items-start gap-1.5">
                          <span className="text-[9px] font-semibold text-purple-600 uppercase shrink-0 w-16">Physical:</span>
                          <span className="text-[10px] text-muted-foreground">{sub.game_loop}</span>
                        </div>
                      )}
                      {sub.validator_type && (
                        <div className="flex items-start gap-1.5">
                          <span className="text-[9px] font-semibold text-rose-600 uppercase shrink-0 w-16">Time Gate:</span>
                          <span className="text-[10px] text-muted-foreground">{sub.validator_type}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {relevantSubs.length > 6 && (
              <p className="text-[10px] text-muted-foreground text-center">
                +{relevantSubs.length - 6} more available
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
