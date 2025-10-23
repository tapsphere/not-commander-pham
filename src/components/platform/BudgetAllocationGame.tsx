import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { AlertTriangle, DollarSign, Users } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  priority: 'high' | 'medium' | 'low';
  teamAllocation: number;
  budgetAllocation: number;
}

interface BudgetAllocationGameProps {
  timeLimit: number;
  onComplete: (score: number, metrics: any) => void;
}

export function BudgetAllocationGame({ timeLimit, onComplete }: BudgetAllocationGameProps) {
  const [scene, setScene] = useState(1);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [totalTeam] = useState(10);
  const [totalBudget, setTotalBudget] = useState(100000);
  const [edgeCaseTriggered, setEdgeCaseTriggered] = useState(false);
  const [showEdgeCase, setShowEdgeCase] = useState(false);

  const [projects, setProjects] = useState<Project[]>([
    { id: '1', name: 'Customer Portal', priority: 'high', teamAllocation: 0, budgetAllocation: 0 },
    { id: '2', name: 'Mobile App', priority: 'high', teamAllocation: 0, budgetAllocation: 0 },
    { id: '3', name: 'Analytics Dashboard', priority: 'medium', teamAllocation: 0, budgetAllocation: 0 },
    { id: '4', name: 'Internal Tools', priority: 'low', teamAllocation: 0, budgetAllocation: 0 },
  ]);

  const [decisionHistory, setDecisionHistory] = useState<any[]>([]);

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Scene progression and edge case trigger
  useEffect(() => {
    const sceneTime = timeLimit / 4;
    const elapsed = timeLimit - timeLeft;
    const currentScene = Math.floor(elapsed / sceneTime) + 1;
    
    if (currentScene !== scene && currentScene <= 4) {
      setScene(currentScene);
      
      // Trigger edge case in scene 3
      if (currentScene === 3 && !edgeCaseTriggered) {
        triggerEdgeCase();
      }
    }
  }, [timeLeft]);

  const triggerEdgeCase = () => {
    setEdgeCaseTriggered(true);
    setShowEdgeCase(true);
    // 40% budget cut
    const newBudget = Math.floor(totalBudget * 0.6);
    setTotalBudget(newBudget);
    
    // Proportionally reduce allocations
    setProjects(prev => prev.map(p => ({
      ...p,
      budgetAllocation: Math.floor(p.budgetAllocation * 0.6)
    })));

    setTimeout(() => setShowEdgeCase(false), 4000);
  };

  const updateTeamAllocation = (projectId: string, value: number) => {
    setProjects(prev => {
      const updated = prev.map(p => 
        p.id === projectId ? { ...p, teamAllocation: value } : p
      );
      
      // Ensure total doesn't exceed available
      const total = updated.reduce((sum, p) => sum + p.teamAllocation, 0);
      if (total > totalTeam) return prev;
      
      return updated;
    });
    
    recordDecision('team', projectId, value);
  };

  const updateBudgetAllocation = (projectId: string, value: number) => {
    setProjects(prev => {
      const updated = prev.map(p => 
        p.id === projectId ? { ...p, budgetAllocation: value } : p
      );
      
      // Ensure total doesn't exceed available
      const total = updated.reduce((sum, p) => sum + p.budgetAllocation, 0);
      if (total > totalBudget) return prev;
      
      return updated;
    });
    
    recordDecision('budget', projectId, value);
  };

  const recordDecision = (type: string, projectId: string, value: number) => {
    setDecisionHistory(prev => [...prev, {
      timestamp: Date.now(),
      scene,
      type,
      projectId,
      value,
      afterEdgeCase: edgeCaseTriggered
    }]);
  };

  const handleSubmit = () => {
    const totalTeamUsed = projects.reduce((sum, p) => sum + p.teamAllocation, 0);
    const totalBudgetUsed = projects.reduce((sum, p) => sum + p.budgetAllocation, 0);
    
    // Calculate score based on allocation efficiency
    const teamUtilization = (totalTeamUsed / totalTeam) * 100;
    const budgetUtilization = (totalBudgetUsed / totalBudget) * 100;
    
    // Check priority alignment
    const highPriorityProjects = projects.filter(p => p.priority === 'high');
    const highPriorityAllocation = highPriorityProjects.reduce((sum, p) => sum + p.budgetAllocation, 0);
    const priorityScore = (highPriorityAllocation / totalBudgetUsed) * 100;
    
    // Calculate final score
    let score = (teamUtilization + budgetUtilization + priorityScore) / 3;
    
    // Bonus for completing after edge case
    if (edgeCaseTriggered && totalTeamUsed > 0 && totalBudgetUsed > 0) {
      score = Math.min(100, score + 10);
    }
    
    const metrics = {
      scene: scene,
      teamUtilization,
      budgetUtilization,
      priorityScore,
      edgeCaseRecovered: edgeCaseTriggered,
      decisionCount: decisionHistory.length,
      timeUsed: timeLimit - timeLeft,
      allocations: projects.map(p => ({
        project: p.name,
        team: p.teamAllocation,
        budget: p.budgetAllocation
      }))
    };
    
    onComplete(Math.round(score), metrics);
  };

  const usedTeam = projects.reduce((sum, p) => sum + p.teamAllocation, 0);
  const usedBudget = projects.reduce((sum, p) => sum + p.budgetAllocation, 0);
  const availableTeam = totalTeam - usedTeam;
  const availableBudget = totalBudget - usedBudget;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount: number) => {
    return `$${(amount / 1000).toFixed(0)}k`;
  };

  if (showEdgeCase) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 max-w-2xl w-full border-destructive">
          <div className="text-center space-y-4 animate-pulse">
            <AlertTriangle className="w-16 h-16 text-destructive mx-auto" />
            <h2 className="text-3xl font-bold text-destructive">URGENT: Budget Cut!</h2>
            <p className="text-xl">
              The CEO just announced a 40% budget reduction across all projects.
            </p>
            <p className="text-muted-foreground">
              You must immediately reallocate resources to adapt to the new constraints.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xl font-bold">Budget Allocation Challenge</h2>
              <p className="text-sm text-muted-foreground">Scene {scene}/4 {edgeCaseTriggered && '(Crisis Mode)'}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-mono font-bold">{formatTime(timeLeft)}</div>
              <Progress value={((timeLimit - timeLeft) / timeLimit) * 100} className="h-2 w-32" />
            </div>
          </div>

          {/* Resources */}
          <div className="flex gap-4 mt-4">
            <div className="flex-1 bg-muted p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Team Members</span>
              </div>
              <div className="text-lg font-bold">
                {availableTeam} / {totalTeam} Available
              </div>
            </div>
            <div className="flex-1 bg-muted p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-medium">Budget</span>
              </div>
              <div className="text-lg font-bold">
                {formatCurrency(availableBudget)} / {formatCurrency(totalBudget)}
              </div>
            </div>
          </div>
        </Card>

        {/* Projects */}
        <div className="grid gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">{project.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      project.priority === 'high' ? 'bg-red-500/20 text-red-500' :
                      project.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-blue-500/20 text-blue-500'
                    }`}>
                      {project.priority.toUpperCase()} PRIORITY
                    </span>
                  </div>
                  <div className="text-right text-sm">
                    <div>{project.teamAllocation} team</div>
                    <div>{formatCurrency(project.budgetAllocation)}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-sm text-muted-foreground">Team Members: {project.teamAllocation}</label>
                    <Slider
                      value={[project.teamAllocation]}
                      onValueChange={([value]) => updateTeamAllocation(project.id, value)}
                      max={totalTeam}
                      step={1}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">
                      Budget: {formatCurrency(project.budgetAllocation)}
                    </label>
                    <Slider
                      value={[project.budgetAllocation]}
                      onValueChange={([value]) => updateBudgetAllocation(project.id, value)}
                      max={totalBudget}
                      step={1000}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          className="w-full"
          size="lg"
          disabled={usedTeam === 0 || usedBudget === 0}
        >
          Submit Allocation Plan
        </Button>

        {scene === 1 && (
          <p className="text-xs text-center text-muted-foreground">
            Tip: Allocate more resources to high-priority projects for better scores
          </p>
        )}
      </div>
    </div>
  );
}
