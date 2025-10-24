import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertCircle, PlayCircle } from 'lucide-react';
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

interface CheckResult {
  checkNumber: number;
  name: string;
  status: 'passed' | 'failed' | 'needs_review';
  notes: string;
  details: any;
}

export function ValidatorTestWizard({ 
  open, 
  onOpenChange, 
  template, 
  subCompetency,
  onComplete 
}: ValidatorTestWizardProps) {
  const [testing, setTesting] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [results, setResults] = useState<CheckResult[]>([]);
  const [overallStatus, setOverallStatus] = useState<'passed' | 'failed' | 'needs_review' | 'not_started'>('not_started');

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setTestComplete(false);
      setResults([]);
      setOverallStatus('not_started');
      setTesting(false);
    }
  }, [open]);

  const handleRunAutomatedTests = async () => {
    if (!subCompetency) {
      toast.error('Sub-competency data required for testing');
      return;
    }

    try {
      setTesting(true);
      toast.info('🤖 Running automated v3.1 stress tests...', {
        description: 'Testing all 8 validation checks'
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
      setResults(data.results);
      setOverallStatus(data.overallStatus);
      setTestComplete(true);

      // Show appropriate feedback
      if (data.overallStatus === 'passed') {
        toast.success('✅ All 8 automated checks passed!', {
          description: 'Validator approved for publishing'
        });
      } else if (data.overallStatus === 'failed') {
        toast.error('❌ One or more checks failed', {
          description: 'Review issues and fix before publishing'
        });
      } else {
        toast.warning('⚠️ Manual review required', {
          description: 'Some checks need attention'
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'needs_review': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default: return <div className="w-5 h-5 rounded-full border-2 border-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-500/10 border-green-500';
      case 'failed': return 'bg-red-500/10 border-red-500';
      case 'needs_review': return 'bg-yellow-500/10 border-yellow-500';
      default: return 'bg-gray-800 border-gray-700';
    }
  };

  const progress = testComplete ? 100 : testing ? 50 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-gray-900 border-gray-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white flex items-center gap-2">
            {template.template_type === 'ai_generated' ? '🤖' : '📤'} {template.name}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Validator Testing v3.1 - 8 Automated Checks
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <Progress value={progress} className="h-2" />

        {/* Template Info */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Type:</span>
            <span className="text-white">
              {template.template_type === 'ai_generated' ? '🤖 AI Generated' : '📤 Custom Upload'}
            </span>
          </div>
          {subCompetency && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-400">Sub-Competency:</span>
                <span className="text-white text-right">{subCompetency.statement}</span>
              </div>
              {subCompetency.action_cue && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Action Cue:</span>
                  <span className="text-white text-right">{subCompetency.action_cue}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Test Status */}
        {!testComplete && !testing && (
          <div className="bg-gray-800 border-2 border-neon-green rounded-lg p-6 text-center space-y-4">
            <h3 className="text-xl font-bold text-white">Ready to Run Automated Tests</h3>
            <p className="text-gray-400">
              This will run 8 comprehensive checks including scene structure, UX/UI integrity, 
              Telegram compliance, configuration validation, and more.
            </p>
            <Button
              onClick={handleRunAutomatedTests}
              disabled={testing}
              className="gap-2 bg-neon-green text-black hover:bg-neon-green/80 text-lg py-6 px-8"
            >
              <PlayCircle className="w-6 h-6" />
              Run All 8 Automated Checks
            </Button>
          </div>
        )}

        {testing && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
            <div className="animate-spin h-12 w-12 border-4 border-neon-green border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-white font-semibold">Running automated tests...</p>
            <p className="text-gray-400 text-sm">This may take a few moments</p>
          </div>
        )}

        {/* Test Results */}
        {testComplete && (
          <div className="space-y-4">
            {/* Overall Status */}
            <div className={`border-2 rounded-lg p-4 ${getStatusColor(overallStatus)}`}>
              <div className="flex items-center gap-3">
                {getStatusIcon(overallStatus)}
                <div>
                  <h3 className="font-bold text-lg text-white">
                    Overall Status: {overallStatus.replace('_', ' ').toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-300">
                    {overallStatus === 'passed' 
                      ? '✅ All checks passed! Ready for publishing.' 
                      : overallStatus === 'failed'
                      ? '❌ Critical issues found. Review and fix before publishing.'
                      : '⚠️ Manual review required for some checks.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Individual Check Results */}
            <div className="space-y-3">
              <h4 className="font-semibold text-white">Individual Check Results:</h4>
              {results.map((check) => (
                <div
                  key={check.checkNumber}
                  className={`border rounded-lg p-4 ${getStatusColor(check.status)}`}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(check.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          Check {check.checkNumber}/8
                        </Badge>
                        <h5 className="font-semibold text-white">{check.name}</h5>
                      </div>
                      <p className="text-sm text-gray-300">{check.notes}</p>
                      {check.details && Object.keys(check.details).length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                            View details
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-950 p-2 rounded overflow-auto">
                            {JSON.stringify(check.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-600"
          >
            {testComplete ? 'Close' : 'Cancel'}
          </Button>
          {testComplete && overallStatus !== 'passed' && (
            <Button
              onClick={handleRunAutomatedTests}
              className="gap-2 bg-neon-green text-black hover:bg-neon-green/80"
            >
              <PlayCircle className="w-5 h-5" />
              Re-run Tests
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}