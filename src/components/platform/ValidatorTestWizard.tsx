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
  const [currentPhase, setCurrentPhase] = useState(1);
  const [saving, setSaving] = useState(false);
  
  const [phase1, setPhase1] = useState<PhaseData>({ status: 'not_started', notes: '' });
  const [phase2, setPhase2] = useState<PhaseData>({ status: 'not_started', notes: '' });
  const [phase3, setPhase3] = useState<PhaseData>({ status: 'not_started', notes: '' });

  const phases = [
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

  const currentPhaseData = phases[currentPhase - 1];
  const progress = (currentPhase / 3) * 100;

  const setPhaseStatus = (status: PhaseStatus) => {
    currentPhaseData.setData({ ...currentPhaseData.data, status });
  };

  const setPhaseNotes = (notes: string) => {
    currentPhaseData.setData({ ...currentPhaseData.data, notes });
  };

  const canProceed = currentPhaseData.data.status !== 'not_started';

  const getOverallStatus = (): PhaseStatus => {
    const statuses = [phase1.status, phase2.status, phase3.status];
    if (statuses.includes('failed')) return 'failed';
    if (statuses.includes('needs_review')) return 'needs_review';
    if (statuses.every(s => s === 'passed')) return 'passed';
    return 'not_started';
  };

  const handleSaveAndFinish = async () => {
    if (!canProceed) {
      toast.error('Please mark the current phase status before finishing');
      return;
    }

    try {
      setSaving(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const overallStatus = getOverallStatus();

      // Check if test result already exists
      const { data: existing } = await supabase
        .from('validator_test_results')
        .select('id')
        .eq('template_id', template.id)
        .maybeSingle();

      const testData = {
        template_id: template.id,
        tester_id: user.id,
        template_type: template.template_type,
        sub_competency_id: subCompetency ? '00000000-0000-0000-0000-000000000000' : null, // Replace with actual ID if available
        phase1_status: phase1.status,
        phase1_notes: phase1.notes,
        phase2_status: phase2.status,
        phase2_notes: phase2.notes,
        phase3_status: phase3.status,
        phase3_notes: phase3.notes,
        overall_status: overallStatus,
        tested_at: new Date().toISOString(),
      };

      if (existing) {
        const { error } = await supabase
          .from('validator_test_results')
          .update(testData)
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('validator_test_results')
          .insert(testData);
        
        if (error) throw error;
      }

      // Provide contextual feedback based on test results
      if (overallStatus === 'passed') {
        toast.success('🎉 All tests passed! You can now approve this validator for publishing.', {
          description: 'Go to your dashboard to approve and publish to marketplace'
        });
      } else if (overallStatus === 'failed') {
        toast.error('Tests failed. Review your notes and improve the validator.', {
          description: 'Fix the issues and re-test before publishing'
        });
      } else if (overallStatus === 'needs_review') {
        toast.info('Test marked for review. Address concerns before publishing.', {
          description: 'Review the noted issues and re-test when ready'
        });
      } else {
        toast.success('Test results saved!');
      }
      
      onComplete();
      onOpenChange(false);
      
      // Reset for next test
      setCurrentPhase(1);
      setPhase1({ status: 'not_started', notes: '' });
      setPhase2({ status: 'not_started', notes: '' });
      setPhase3({ status: 'not_started', notes: '' });
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error('Failed to save test results');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (!canProceed) {
      toast.error('Please mark the phase status before continuing');
      return;
    }
    if (currentPhase < 3) {
      setCurrentPhase(currentPhase + 1);
    }
  };

  const handleBack = () => {
    if (currentPhase > 1) {
      setCurrentPhase(currentPhase - 1);
    }
  };

  const StatusButton = ({ status, label, icon: Icon }: { status: PhaseStatus; label: string; icon: any }) => (
    <Button
      variant={currentPhaseData.data.status === status ? 'default' : 'outline'}
      onClick={() => setPhaseStatus(status)}
      className="flex-1 gap-2"
    >
      <Icon className="w-4 h-4" />
      {label}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-gray-900 border-gray-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white">
            {template.template_type === 'ai_generated' ? '🤖' : '📤'} {template.name}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Phase {currentPhase} of 3 • {Math.round(progress)}% Complete
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
          {currentPhase === 1 && template.custom_game_url && (
            <Button
              onClick={() => window.open(template.custom_game_url, '_blank')}
              className="w-full bg-neon-green text-black hover:bg-neon-green/80 gap-2"
            >
              <PlayCircle className="w-5 h-5" />
              Open Game in New Tab
            </Button>
          )}

          {/* Status Selection */}
          <div>
            <h4 className="font-semibold text-white mb-3">Phase Status</h4>
            <div className="grid grid-cols-3 gap-2">
              <StatusButton status="passed" label="Passed" icon={CheckCircle} />
              <StatusButton status="failed" label="Failed" icon={XCircle} />
              <StatusButton status="needs_review" label="Needs Review" icon={AlertCircle} />
            </div>
          </div>

          {/* Notes */}
          <div>
            <h4 className="font-semibold text-white mb-2">Notes (Optional)</h4>
            <Textarea
              value={currentPhaseData.data.notes}
              onChange={(e) => setPhaseNotes(e.target.value)}
              placeholder="Add any observations, issues found, or recommendations..."
              className="bg-gray-800 border-gray-700 text-white min-h-24"
            />
          </div>

          {/* Phase Summary */}
          <div className="flex gap-2 justify-center">
            {[phase1, phase2, phase3].map((phase, idx) => (
              <Badge
                key={idx}
                variant={currentPhase === idx + 1 ? 'default' : 'outline'}
                className={`${
                  phase.status === 'passed' ? 'bg-green-500' :
                  phase.status === 'failed' ? 'bg-red-500' :
                  phase.status === 'needs_review' ? 'bg-yellow-500' :
                  'bg-gray-600'
                } text-white`}
              >
                Phase {idx + 1}
              </Badge>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-3 pt-4 border-t border-gray-700">
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
              onClick={handleSaveAndFinish}
              disabled={!canProceed || saving}
              className="gap-2 bg-neon-green text-black hover:bg-neon-green/80"
            >
              {saving ? 'Saving...' : 'Save & Finish'}
              <CheckCircle className="w-4 h-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
