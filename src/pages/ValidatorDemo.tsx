import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MobileViewport } from '@/components/MobileViewport';

/**
 * KPI Data Structure
 * Represents a Key Performance Indicator with its current state
 */
interface KPI {
  id: string;
  name: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
}

/**
 * Competency-Based Grading Scale (0-4)
 * 0 = Not Yet Proficient
 * 1 = Emerging
 * 2 = Developing
 * 3 = Proficient
 * 4 = Exemplary
 */
interface CompetencyFeedback {
  score: 0 | 1 | 2 | 3 | 4;
  level: 'Not Yet Proficient' | 'Emerging' | 'Developing' | 'Proficient' | 'Exemplary';
  message: string;
  improvement: string;
}

/**
 * Round Configuration
 * Each round lasts exactly 60 seconds with specific challenges
 */
type GameRound = 1 | 2 | 3;

export default function ValidatorDemo() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'edge-case' | 'results'>('intro');
  
  /**
   * Timer Management
   * Starts at 180 seconds (3 minutes) and counts down to 0
   * Game automatically ends when timer reaches 0
   */
  const [timeLeft, setTimeLeft] = useState(180);
  
  /**
   * Round Tracking
   * Round 1: 180-121s (Initial KPI assessment)
   * Round 2: 120-61s (Value fluctuations and adaptation)
   * Round 3: 60-0s (Edge case crisis management)
   */
  const [currentRound, setCurrentRound] = useState<GameRound>(1);
  
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [edgeCaseTriggered, setEdgeCaseTriggered] = useState(false);
  const [score, setScore] = useState(0);
  
  /**
   * Competency Feedback System
   * Stores feedback for each player action to provide transparent grading
   */
  const [feedbackHistory, setFeedbackHistory] = useState<CompetencyFeedback[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<CompetencyFeedback | null>(null);
  
  const [kpis, setKpis] = useState<KPI[]>([
    { id: '1', name: 'User Retention', value: 78, trend: 'down' },
    { id: '2', name: 'Revenue', value: 92, trend: 'stable' },
    { id: '3', name: 'Bug Count', value: 45, trend: 'up' },
    { id: '4', name: 'Feature Completion', value: 67, trend: 'down' },
    { id: '5', name: 'Team Morale', value: 83, trend: 'stable' },
    { id: '6', name: 'Tech Debt', value: 56, trend: 'up' },
  ]);

  const [rankedKpis, setRankedKpis] = useState<KPI[]>([]);

  /**
   * Timer Countdown Effect
   * Decrements timer every second and triggers round transitions
   * Automatically ends game at 0 seconds
   */
  useEffect(() => {
    if (gameState !== 'playing' && gameState !== 'edge-case') return;
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState('results');
          calculateScore();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  /**
   * Round Transition Logic
   * Round 1: 180-121s
   * Round 2: 120-61s (increased KPI volatility)
   * Round 3: 60-0s (edge case crisis)
   */
  useEffect(() => {
    if (gameState !== 'playing' && gameState !== 'edge-case') return;
    
    // Transition to Round 2 at 120s
    if (timeLeft === 120 && currentRound === 1) {
      setCurrentRound(2);
      toast.info('Round 2: KPI values are becoming more volatile!');
    }
    
    // Transition to Round 3 at 60s (edge case)
    if (timeLeft === 60 && currentRound === 2 && !edgeCaseTriggered) {
      setEdgeCaseTriggered(true);
      setCurrentRound(3);
      setGameState('edge-case');
    }
  }, [timeLeft, gameState, currentRound, edgeCaseTriggered]);

  /**
   * KPI Value Simulation
   * Values fluctuate based on current round
   * Round 1: Minimal changes (±2%)
   * Round 2: Moderate volatility (±5%)
   * Round 3: High volatility (±8%)
   */
  useEffect(() => {
    if (gameState !== 'playing' && gameState !== 'edge-case') return;
    
    // Volatility increases with each round
    const volatility = currentRound === 1 ? 2 : currentRound === 2 ? 5 : 8;
    
    const interval = setInterval(() => {
      setKpis(prev => prev.map(kpi => ({
        ...kpi,
        value: Math.max(0, Math.min(100, kpi.value + (Math.random() - 0.5) * volatility)),
      })));
      
      setRankedKpis(prev => prev.map(kpi => ({
        ...kpi,
        value: Math.max(0, Math.min(100, kpi.value + (Math.random() - 0.5) * volatility)),
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, [gameState, currentRound]);

  const calculateScore = async () => {
    // Sub-competencies for this validator (Pass/Fail logic)
    let passes = 0;
    const totalSubs = 5;
    
    const subResults = {
      identifiedMetrics: rankedKpis.length >= 2,
      prioritizedCritical: rankedKpis.slice(0, 3).some(k => k.id === '3' || k.id === '6'),
      addressedDeclining: rankedKpis.some(k => k.id === '1' || k.id === '4'),
      completedAnalysis: rankedKpis.length === 6,
      edgeCaseHandled: edgeCaseTriggered && rankedKpis[0]?.id === '2'
    };
    
    // Count passes
    passes = Object.values(subResults).filter(Boolean).length;
    
    // Final score = (passes / total_subs) × 100%
    const finalScore = Math.round((passes / totalSubs) * 100);
    setScore(finalScore);
    
    // Save to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const proficiencyLevel = 
          finalScore >= 95 && subResults.edgeCaseHandled ? 'Mastery' :
          finalScore >= 80 ? 'Proficient' :
          'Needs Work';
        
        const { error } = await supabase
          .from('game_results')
          .insert({
            user_id: user.id,
            passed: finalScore >= 80,
            proficiency_level: proficiencyLevel,
            scoring_metrics: {
              score: finalScore,
              passes: passes,
              totalSubs: totalSubs,
              subResults: subResults,
              timeRemaining: timeLeft
            },
            gameplay_data: {
              rankedKpis: rankedKpis.map(k => k.name),
              edgeCaseTriggered: edgeCaseTriggered
            }
          });
        
        if (error) {
          console.error('Failed to save result:', error);
        } else {
          toast.success('Result saved to your profile!');
        }
      }
    } catch (error) {
      console.error('Error saving result:', error);
    }
  };

  const handleDragStart = (e: React.DragEvent, kpiId: string) => {
    setDraggedItem(kpiId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  /**
   * Competency-Based Grading Function
   * Evaluates player actions on a 0-4 scale
   * Provides constructive feedback aligned with competency rubric
   */
  const evaluateAction = (kpi: KPI, action: 'ranked' | 'unranked'): CompetencyFeedback => {
    const isCritical = kpi.id === '3' || kpi.id === '6'; // Bug Count or Tech Debt
    const isDeclining = kpi.trend === 'down';
    const isRevenue = kpi.id === '2';
    const isInRound3 = currentRound === 3;
    
    if (action === 'ranked') {
      // Exemplary (4): Correctly prioritizes critical declining metrics
      if (isCritical && rankedKpis.length < 3) {
        return {
          score: 4,
          level: 'Exemplary',
          message: `Excellent decision! You correctly identified ${kpi.name} as a critical priority that requires immediate attention.`,
          improvement: 'Continue identifying high-impact metrics that affect system stability.'
        };
      }
      
      // Proficient (3): Addresses declining metrics appropriately
      if (isDeclining && rankedKpis.length < 4) {
        return {
          score: 3,
          level: 'Proficient',
          message: `Good choice! Addressing ${kpi.name} shows solid analytical thinking.`,
          improvement: 'Consider how this metric impacts other KPIs in your ranking.'
        };
      }
      
      // Proficient (3): Prioritizes revenue in Round 3 edge case
      if (isRevenue && isInRound3) {
        return {
          score: 3,
          level: 'Proficient',
          message: `Smart adaptation! Prioritizing ${kpi.name} during the crisis demonstrates stakeholder awareness.`,
          improvement: 'Balance stakeholder demands with technical realities.'
        };
      }
      
      // Developing (2): Makes reasonable but non-critical choices
      if (rankedKpis.length < 4) {
        return {
          score: 2,
          level: 'Developing',
          message: `${kpi.name} is ranked. Consider whether more urgent metrics need attention first.`,
          improvement: 'Look for declining trends and critical system issues that impact multiple areas.'
        };
      }
      
      // Emerging (1): Late or low-priority rankings
      return {
        score: 1,
        level: 'Emerging',
        message: `You're building your ranking. Think about which metrics have the highest impact on overall success.`,
        improvement: 'Prioritize metrics that are declining or critical to system stability.'
      };
    } else {
      // Unranking - generally a neutral or negative action
      if (isCritical && !isInRound3) {
        return {
          score: 0,
          level: 'Not Yet Proficient',
          message: `Be careful! Removing ${kpi.name} from priorities could lead to system instability.`,
          improvement: 'Critical metrics like bugs and tech debt usually need consistent attention.'
        };
      }
      
      return {
        score: 1,
        level: 'Emerging',
        message: `${kpi.name} removed from ranking. Make sure you're not overlooking important trends.`,
        improvement: 'Re-evaluate your priorities based on current trends and system health.'
      };
    }
  };

  /**
   * Handle Drop Event with Competency Evaluation
   * Provides immediate feedback after each ranking decision
   */
  const handleDrop = (e: React.DragEvent, dropZone: 'ranked' | 'unranked') => {
    e.preventDefault();
    if (!draggedItem) return;

    if (dropZone === 'ranked') {
      const kpi = kpis.find(k => k.id === draggedItem);
      if (kpi && !rankedKpis.find(k => k.id === draggedItem)) {
        const feedback = evaluateAction(kpi, 'ranked');
        setCurrentFeedback(feedback);
        setShowFeedback(true);
        setFeedbackHistory([...feedbackHistory, feedback]);
        
        setRankedKpis([...rankedKpis, kpi]);
        setKpis(kpis.filter(k => k.id !== draggedItem));
      }
    } else {
      const kpi = rankedKpis.find(k => k.id === draggedItem);
      if (kpi) {
        const feedback = evaluateAction(kpi, 'unranked');
        setCurrentFeedback(feedback);
        setShowFeedback(true);
        setFeedbackHistory([...feedbackHistory, feedback]);
        
        setKpis([...kpis, kpi]);
        setRankedKpis(rankedKpis.filter(k => k.id !== draggedItem));
      }
    }
    
    setDraggedItem(null);
  };

  const startGame = () => {
    setGameState('playing');
    setTimeLeft(180);
  };

  const continueAfterEdgeCase = () => {
    setGameState('playing');
  };

  /**
   * Get Round Description
   * Provides context for current round challenges
   */
  const getRoundDescription = (round: GameRound): string => {
    switch (round) {
      case 1:
        return 'Round 1: Initial Assessment - Identify critical metrics';
      case 2:
        return 'Round 2: Adaptation - KPIs are fluctuating rapidly';
      case 3:
        return 'Round 3: Crisis Mode - Handle unexpected stakeholder demands';
      default:
        return '';
    }
  };

  const getProficiencyLevel = (score: number) => {
    // Mastery: ≥ 95% pass and all edge-case triggers passed
    if (score >= 95 && edgeCaseTriggered && rankedKpis[0]?.id === '2') {
      return { level: 'Mastery', numericLevel: 3, color: 'text-neon-green', bg: 'bg-neon-green/10' };
    }
    // Proficient: ≥ 80% and < 95% pass
    if (score >= 80) return { level: 'Proficient', numericLevel: 2, color: 'text-yellow-400', bg: 'bg-yellow-400/10' };
    // Needs Work: < 80% pass
    return { level: 'Needs Work', numericLevel: 1, color: 'text-red-400', bg: 'bg-red-400/10' };
  };

  if (gameState === 'intro') {
    return (
      <MobileViewport>
        <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
          <div className="max-w-2xl w-full space-y-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/platform/creator')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          
          <div className="border-2 border-neon-green rounded-lg p-8 space-y-6 border-glow-green">
            <h1 className="text-4xl font-bold text-neon-green text-glow-green">
              Priority Trade-Off Navigator
            </h1>
            
            <div className="space-y-4 text-gray-300">
              <p className="text-lg">
                You're a Product Manager during a critical launch week. The KPI dashboard is overloading — 
                you must prioritize which metrics to stabilize first before the system crashes.
              </p>
              
              <div className="bg-gray-900 border border-neon-magenta/30 rounded-lg p-4">
                <h3 className="font-semibold text-neon-magenta mb-2">🎯 Your Mission:</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Drag and drop KPIs to rank them by priority</li>
                  <li>• Each choice affects other metrics in real-time</li>
                  <li>• Complete the ranking before time runs out</li>
                  <li>• Expect the unexpected... 👀</li>
                </ul>
              </div>
              
              <div className="flex gap-2 text-sm text-gray-400">
                <span className="bg-gray-800 px-3 py-1 rounded">⏱ 3 minutes</span>
                <span className="bg-gray-800 px-3 py-1 rounded">📱 Mobile-optimized</span>
                <span className="bg-gray-800 px-3 py-1 rounded">🎮 Interactive</span>
              </div>
            </div>
            
            <Button
              onClick={startGame}
              className="w-full bg-neon-green text-white hover:bg-neon-green/90 text-lg h-14 border-glow-green"
            >
              Start Validator
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            This is a sample validator built from the template system
          </p>
        </div>
      </div>
      </MobileViewport>
    );
  }

  if (gameState === 'edge-case') {
    return (
      <MobileViewport>
        <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
          <div className="max-w-2xl w-full">
          <div className="border-2 border-red-500 rounded-lg p-8 space-y-6 animate-pulse bg-red-950/20">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-12 h-12 text-red-500" />
              <h2 className="text-3xl font-bold text-red-500">URGENT MESSAGE FROM CEO</h2>
            </div>
            
            <div className="bg-black border border-red-500/50 rounded-lg p-6">
              <p className="text-xl mb-4">
                "Revenue must be #1 or we lose funding."
              </p>
              <p className="text-gray-400">
                Timer has been cut to 90 seconds. You must re-prioritize while maintaining system stability.
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-4xl font-bold text-red-500 mb-4">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </p>
            </div>
            
            <Button
              onClick={continueAfterEdgeCase}
              className="w-full bg-red-500 text-white hover:bg-red-600 text-lg h-14"
            >
              Continue Game
            </Button>
          </div>
        </div>
      </div>
      </MobileViewport>
    );
  }

  if (gameState === 'results') {
    const proficiency = getProficiencyLevel(score);
    
    return (
      <MobileViewport>
        <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
        <div className="max-w-2xl w-full space-y-6">
          <div className={`border-2 rounded-lg p-8 space-y-6 ${proficiency.bg} border-${proficiency.color.split('-')[1]}`}>
            <h2 className="text-3xl font-bold text-center">Validator Complete</h2>
            
            <div className="text-center space-y-4">
              <div className="text-6xl font-bold">
                {score}%
              </div>
              
              <div className={`text-2xl font-semibold ${proficiency.color}`}>
                Level {proficiency.numericLevel} - {proficiency.level}
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6 space-y-3">
              <h3 className="font-semibold text-neon-green">Sub-Competencies Passed:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Identified Concerning Metrics (≥2):</span>
                  <span className={rankedKpis.length >= 2 ? 'text-neon-green' : 'text-red-400'}>
                    {rankedKpis.length >= 2 ? '✓ Pass' : '✗ Fail'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Prioritized Critical Issues (Top 3):</span>
                  <span className={rankedKpis.slice(0, 3).some(k => k.id === '3' || k.id === '6') ? 'text-neon-green' : 'text-red-400'}>
                    {rankedKpis.slice(0, 3).some(k => k.id === '3' || k.id === '6') ? '✓ Pass' : '✗ Fail'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Addressed Declining Metrics:</span>
                  <span className={rankedKpis.some(k => k.id === '1' || k.id === '4') ? 'text-neon-green' : 'text-red-400'}>
                    {rankedKpis.some(k => k.id === '1' || k.id === '4') ? '✓ Pass' : '✗ Fail'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Completed Full Analysis:</span>
                  <span className={rankedKpis.length === 6 ? 'text-neon-green' : 'text-red-400'}>
                    {rankedKpis.length === 6 ? '✓ Pass' : '✗ Fail'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Edge-Case: Revenue Priority:</span>
                  <span className={edgeCaseTriggered && rankedKpis[0]?.id === '2' ? 'text-neon-green' : 'text-red-400'}>
                    {edgeCaseTriggered && rankedKpis[0]?.id === '2' ? '✓ Pass' : '✗ Fail'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => navigate('/platform/creator')}
                className="flex-1 bg-neon-green text-white hover:bg-neon-green/90"
              >
                Back to Dashboard
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="flex-1"
              >
                Try Again
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            In production, results are stored in your proof ledger and XP is awarded
          </p>
          
          {/* Average Competency Score Display */}
          {feedbackHistory.length > 0 && (
            <div className="bg-gray-900 rounded-lg p-4 border border-neon-green/30">
              <h3 className="font-semibold text-neon-green mb-2">Average Competency Score:</h3>
              <div className="text-3xl font-bold text-center text-neon-magenta">
                {(feedbackHistory.reduce((sum, f) => sum + f.score, 0) / feedbackHistory.length).toFixed(1)}/4
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">
                Based on {feedbackHistory.length} graded actions during gameplay
              </p>
            </div>
          )}
        </div>
      </div>
      </MobileViewport>
    );
  }

  // Playing state
  return (
    <MobileViewport>
      <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Round Indicator */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-neon-green text-glow-green">
              KPI Dashboard Reboot
            </h1>
            <p className="text-sm text-gray-400 mt-1">{getRoundDescription(currentRound)}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-neon-magenta text-glow-magenta">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-400">Round {currentRound}/3</div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-900 border border-neon-green/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-300">
            🎯 Drag KPIs to the ranking area to prioritize them. System stability depends on your choices! 
            You'll receive feedback on each decision.
          </p>
        </div>

        {/* Competency Feedback Pop-up */}
        {showFeedback && currentFeedback && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border-2 border-neon-green rounded-lg p-6 max-w-md w-full space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-neon-green">
                    Score: {currentFeedback.score}/4
                  </div>
                  <div className="text-lg text-gray-300">{currentFeedback.level}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowFeedback(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500 uppercase mb-1">Feedback</div>
                  <p className="text-sm text-gray-300">{currentFeedback.message}</p>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500 uppercase mb-1">How to Improve</div>
                  <p className="text-sm text-gray-300">{currentFeedback.improvement}</p>
                </div>
              </div>
              
              <Button
                onClick={() => setShowFeedback(false)}
                className="w-full bg-neon-green text-black hover:bg-neon-green/90"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Available KPIs */}
          <div>
            <h2 className="text-lg font-semibold mb-3 text-neon-green">Available Metrics</h2>
            <div
              className="space-y-3 min-h-[400px] border-2 border-dashed border-gray-700 rounded-lg p-4"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'unranked')}
            >
              {kpis.map((kpi) => (
                <div
                  key={kpi.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, kpi.id)}
                  className="bg-gray-900 border border-neon-purple rounded-lg p-4 cursor-move hover:border-neon-magenta transition-all hover:border-glow-purple"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-white">{kpi.name}</span>
                    <span className={`text-sm ${
                      kpi.trend === 'up' ? 'text-green-400' : 
                      kpi.trend === 'down' ? 'text-red-400' : 
                      'text-gray-400'
                    }`}>
                      {kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-neon-green h-2 rounded-full transition-all"
                        style={{ width: `${kpi.value}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400">{Math.round(kpi.value)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ranked KPIs */}
          <div>
            <h2 className="text-lg font-semibold mb-3 text-neon-magenta">Priority Ranking</h2>
            <div
              className="space-y-3 min-h-[400px] border-2 border-dashed border-neon-magenta/50 rounded-lg p-4"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'ranked')}
            >
              {rankedKpis.length === 0 && (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Drop KPIs here to rank them
                </div>
              )}
              {rankedKpis.map((kpi, index) => (
                <div
                  key={kpi.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, kpi.id)}
                  className="bg-gray-900 border border-neon-magenta rounded-lg p-4 cursor-move hover:border-neon-green transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-neon-magenta text-black flex items-center justify-center font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-white">{kpi.name}</span>
                        <span className={`text-sm ${
                          kpi.trend === 'up' ? 'text-green-400' : 
                          kpi.trend === 'down' ? 'text-red-400' : 
                          'text-gray-400'
                        }`}>
                          {kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-800 rounded-full h-2">
                          <div
                            className="bg-neon-magenta h-2 rounded-full transition-all"
                            style={{ width: `${kpi.value}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-400">{Math.round(kpi.value)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        {rankedKpis.length === 6 && (
          <div className="mt-6">
            <Button
              onClick={() => {
                setGameState('results');
                calculateScore();
              }}
              className="w-full bg-neon-green text-white hover:bg-neon-green/90 text-lg h-14 border-glow-green"
            >
              Submit Ranking
            </Button>
          </div>
        )}
      </div>
    </div>
    </MobileViewport>
  );
}

/**
 * <<END>>
 * 
 * AI Generation Stop Marker
 * ===========================
 * This marker indicates the end of the structured 180-second game content.
 * AI-generated content should not extend beyond this point.
 * 
 * The game includes:
 * - Exactly 180 seconds of gameplay (3 minutes total runtime)
 * - Three distinct 60-second rounds with unique challenges:
 *   * Round 1 (180-121s): Initial assessment with minimal KPI volatility
 *   * Round 2 (120-61s): Increased volatility and adaptation challenges
 *   * Round 3 (60-0s): Crisis management with edge-case scenario
 * - Competency-based grading on 0-4 scale with transparent feedback
 * - Real-time competency evaluation with growth-mindset language
 * - Comprehensive documentation for future modifications
 * 
 * Design Identity:
 * - Maintains existing neon-green/purple cyberpunk aesthetic
 * - Preserves all original color schemes and typography
 * - Keeps consistent spacing and layout structure
 * 
 * Technical Implementation:
 * - Timer automatically ends game at 0 seconds
 * - Round transitions handled by useEffect hooks monitoring timeLeft
 * - Competency scoring uses evaluateAction() function
 * - Feedback displayed via modal overlay with dismissible interface
 * - All grading focuses on evidence of learning, not habits of work
 */