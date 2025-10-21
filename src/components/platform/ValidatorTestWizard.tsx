import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertCircle, ArrowRight, ArrowLeft, PlayCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ValidatorTestWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: {
    id: string;
    name: string;
    template_type: string;
    custom_game_url?: string;
  };
  subCompetency: {
    id: string;
    statement: string;
    action_cue: string;
  } | null;
  onComplete: () => void;
}

type PhaseStatus = 'not_started' | 'passed' | 'failed' | 'needs_review';

interface PhaseData {
  status: PhaseStatus;
  notes: string;
}

export function ValidatorTestWizard({ 
  open, 
  onOpenChange, 
  template, 
  subCompetency,
  onComplete 
}: ValidatorTestWizardProps) {
  const [currentPhase, setCurrentPhase] = useState(0); // Start at preview phase
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  
  const [phase1, setPhase1] = useState<PhaseData>({ status: 'not_started', notes: '' });
  const [phase2, setPhase2] = useState<PhaseData>({ status: 'not_started', notes: '' });
  const [phase3, setPhase3] = useState<PhaseData>({ status: 'not_started', notes: '' });

  const phases = [
    {
      number: 0,
      title: 'Preview Your Validator',
      description: 'Review your created validator before testing',
      data: { status: 'not_started' as PhaseStatus, notes: '' },
      setData: () => {},
      checklist: [
        'Template name and description are accurate',
        'Selected sub-competency is correct',
        'Game type matches your expectations',
        template.template_type === 'custom_upload' ? 'Custom game URL is accessible' : 'AI prompt is appropriate'
      ],
      instructions: template.template_type === 'custom_upload'
        ? `Custom Game URL: ${template.custom_game_url || 'Not set'}\n\nReview your uploaded validator before proceeding to testing.`
        : `Review the validator you've created before proceeding to comprehensive testing. Make sure everything looks correct.`
    },
    {
      number: 1,
      title: 'UX/UI Flow Test',
      description: 'Test the user experience and interface',
      data: phase1,
      setData: setPhase1,
      checklist: [
        'Game loads without errors',
        'All UI elements render correctly',
        'Navigation works smoothly',
        'Responsive on different screen sizes',
        'No console errors or warnings',
        template.template_type === 'custom_upload' ? 'Custom game URL loads properly' : 'Game renders in browser'
      ],
      instructions: template.template_type === 'custom_upload'
        ? 'Open the custom game and verify it loads correctly. Check the browser console for errors.'
        : 'Play through the game and verify all visual elements work as expected.'
    },
    {
      number: 2,
      title: 'Action Cue Validation',
      description: 'Verify the game measures the correct competency',
      data: phase2,
      setData: setPhase2,
      checklist: [
        'Player actions align with the sub-competency statement',
        'Game mechanic demonstrates the skill clearly',
        'Action cue is intuitive and measurable',
        'No ambiguity in what skill is being tested',
        template.template_type === 'custom_upload' ? 'Backend API calls capture correct data' : 'Action cue matches game behavior'
      ],
      instructions: subCompetency
        ? `This validator tests: "${subCompetency.statement}"\n\nAction Cue: "${subCompetency.action_cue}"\n\nVerify that playing the game actually measures this skill.`
        : 'Review the selected sub-competency and verify the game measures it accurately.'
    },
    {
      number: 3,
      title: 'Scoring Formula Test',
      description: 'Validate scoring accuracy and fairness',
      data: phase3,
      setData: setPhase3,
      checklist: [
        'Run test with poor performance → appropriate low score',
        'Run test with average performance → mid-range score',
        'Run test with excellent performance → high score',
        'Proficiency levels match actual skill demonstration',
        'Pass/fail thresholds are appropriate',
        'Scoring is consistent across multiple attempts'
      ],
      instructions: 'Play the game multiple times with varying performance levels. Verify the scoring accurately reflects your performance in each attempt.'
    }
  ];

  const currentPhaseData = phases[currentPhase];
  const progress = currentPhase === 0 ? 0 : (currentPhase / 3) * 100;

  const canProceed = currentPhaseData.data.status !== 'not_started';

  const getOverallStatus = (): PhaseStatus => {
    const statuses = [phase1.status, phase2.status, phase3.status];
    if (statuses.includes('failed')) return 'failed';
    if (statuses.includes('needs_review')) return 'needs_review';
    if (statuses.every(s => s === 'passed')) return 'passed';
    return 'not_started';
  };

  const handleRunAutomatedTests = async () => {
    if (!subCompetency) {
      toast.error('Sub-competency data required for testing');
      return;
    }

    try {
      setTesting(true);
      toast.info('🤖 Running automated stress tests...', {
        description: 'This will take a few moments'
      });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Call the stress-test-validator edge function
      const { data, error } = await supabase.functions.invoke('stress-test-validator', {
        body: {
          templateId: template.id,
          subCompetencyId: subCompetency?.id || null,
          testerId: user.id
        }
      });

      if (error) throw error;

      // Update local state with results
      const results = data.results;
      setPhase1({ status: results[0].status, notes: results[0].notes });
      setPhase2({ status: results[1].status, notes: results[1].notes });
      setPhase3({ status: results[2].status, notes: results[2].notes });
      setTestComplete(true);

      // Show appropriate feedback
      if (data.overallStatus === 'passed') {
        toast.success('✅ All automated tests passed!', {
          description: 'Validator approved for publishing'
        });
      } else if (data.overallStatus === 'failed') {
        toast.error('❌ Tests failed', {
          description: 'Review issues and fix before publishing'
        });
      } else {
        toast.warning('⚠️ Tests need review', {
          description: 'Some concerns detected'
        });
      }
      
      onComplete();
      
    } catch (error: any) {
      console.error('Automated test error:', error);
      toast.error('Failed to run automated tests: ' + error.message);
    } finally {
      setTesting(false);
    }
  };

  const handleNext = () => {
    if (currentPhase < 3) {
      setCurrentPhase(currentPhase + 1);
    }
  };

  const handleBack = () => {
    if (currentPhase > 0) {
      setCurrentPhase(currentPhase - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-gray-900 border-gray-700 text-white max-h-[90vh] overflow-y-auto p-0">
        <div className="p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white">
            {template.template_type === 'ai_generated' ? '🤖' : '📤'} {template.name}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {currentPhase === 0 ? 'Preview your validator' : `Phase ${currentPhase} of 3 • ${Math.round(progress)}% Complete`}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <Progress value={progress} className="h-2" />

        {/* Phase Content */}
        <div className="space-y-6 py-4">
          {/* Phase Header */}
          <div>
            <h3 className="text-xl font-bold text-white mb-2">
              {currentPhaseData.title}
            </h3>
            <p className="text-gray-400 mb-4">{currentPhaseData.description}</p>
          </div>

          {/* Instructions */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">📋 Instructions</h4>
            <p className="text-sm text-gray-300 whitespace-pre-line">
              {currentPhaseData.instructions}
            </p>
          </div>

          {/* Checklist */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-3">✓ Checklist</h4>
            <ul className="space-y-2">
              {currentPhaseData.checklist.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-neon-green mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Play Game CTA */}
          {(currentPhase === 0 || currentPhase === 1) && template.custom_game_url && (
            <Button
              onClick={() => window.open(template.custom_game_url, '_blank')}
              className="w-full bg-neon-green text-black hover:bg-neon-green/80 gap-2"
            >
              <PlayCircle className="w-5 h-5" />
              Open Game in New Tab
            </Button>
          )}
          
          {/* Template Info Display for Preview Phase */}
          {currentPhase === 0 && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-1">Template Name</h4>
                <p className="text-white">{template.name}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-1">Type</h4>
                <p className="text-white">
                  {template.template_type === 'ai_generated' ? '🤖 AI Generated' : '📤 Custom Upload'}
                </p>
              </div>
              {subCompetency && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-1">Testing Sub-Competency</h4>
                  <p className="text-white">{subCompetency.statement}</p>
                  {subCompetency.action_cue && (
                    <p className="text-sm text-gray-400 mt-1">Action Cue: {subCompetency.action_cue}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Automated Test Results - Skip for preview phase */}
          {currentPhase > 0 && currentPhaseData.data.status !== 'not_started' ? (
            <div className={`border-2 rounded-lg p-4 ${
              currentPhaseData.data.status === 'passed' ? 'bg-green-500/10 border-green-500' :
              currentPhaseData.data.status === 'failed' ? 'bg-red-500/10 border-red-500' :
              'bg-yellow-500/10 border-yellow-500'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {currentPhaseData.data.status === 'passed' && <CheckCircle className="w-6 h-6 text-green-500" />}
                {currentPhaseData.data.status === 'failed' && <XCircle className="w-6 h-6 text-red-500" />}
                {currentPhaseData.data.status === 'needs_review' && <AlertCircle className="w-6 h-6 text-yellow-500" />}
                <h4 className="font-semibold text-white text-lg">
                  Automated Test Result: {currentPhaseData.data.status.replace('_', ' ').toUpperCase()}
                </h4>
              </div>
              <p className="text-sm text-gray-300">
                {currentPhaseData.data.notes}
              </p>
            </div>
          ) : currentPhase > 0 ? (
            <div className="bg-gray-800 border-2 border-gray-600 rounded-lg p-4 text-center">
              <p className="text-gray-400 mb-2">Automated testing not yet run for this phase</p>
              <p className="text-sm text-gray-500">Click "Run Automated Tests" below to begin</p>
            </div>
          ) : null}

          {/* Notes - Hidden since automated */}
          {currentPhaseData.data.notes && (
            <div>
              <h4 className="font-semibold text-white mb-2">Test Details</h4>
              <div className="bg-gray-800 border border-gray-700 rounded p-3 text-sm text-gray-300">
                {currentPhaseData.data.notes}
              </div>
            </div>
          )}

          {/* Phase Summary - Only show after preview */}
          {currentPhase > 0 && (
            <div className="flex gap-2 justify-center">
              {[phase1, phase2, phase3].map((phase, idx) => (
                <Badge
                  key={idx}
                  variant={currentPhase === idx + 1 ? 'default' : 'outline'}
                  onClick={() => testComplete && setCurrentPhase(idx + 1)}
                  className={`${
                    phase.status === 'passed' ? 'bg-green-500' :
                    phase.status === 'failed' ? 'bg-red-500' :
                    phase.status === 'needs_review' ? 'bg-yellow-500' :
                    'bg-gray-600'
                  } text-white ${testComplete ? 'cursor-pointer hover:opacity-80' : ''}`}
                >
                  Phase {idx + 1}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-3 pt-4 border-t border-gray-700">
          {currentPhase === 0 ? (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="gap-2 border-gray-600"
              >
                Close
              </Button>
              <Button
                onClick={handleNext}
                className="gap-2 bg-neon-green text-black hover:bg-neon-green/80"
              >
                Proceed to Testing
                <ArrowRight className="w-4 h-4" />
              </Button>
            </>
          ) : !testComplete ? (
            <Button
              onClick={handleRunAutomatedTests}
              disabled={testing}
              className="flex-1 gap-2 bg-neon-green text-black hover:bg-neon-green/80 text-lg py-6"
            >
              {testing ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full" />
                  Running Automated Tests...
                </>
              ) : (
                <>
                  <PlayCircle className="w-6 h-6" />
                  Run Automated Stress Tests
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentPhase === 1}
                className="gap-2 border-gray-600"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>

              {currentPhase < 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="gap-2 bg-neon-green text-black hover:bg-neon-green/80"
                >
                  Next Phase
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    toast.success('Tests complete! Closing wizard.');
                    onOpenChange(false);
                  }}
                  className="gap-2 bg-neon-green text-black hover:bg-neon-green/80"
                >
                  Done
                  <CheckCircle className="w-4 h-4" />
                </Button>
              )}
            </>
          )}
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
