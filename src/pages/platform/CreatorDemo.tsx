import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlayCircle, CheckCircle, FileText, Sparkles, TestTube } from 'lucide-react';

export default function CreatorDemo() {
  const [currentStep, setCurrentStep] = useState<'setup' | 'generate' | 'test' | 'complete'>('setup');
  const [progress, setProgress] = useState(0);

  // Sample template data
  const sampleTemplate = {
    name: 'Crisis Communication Manager',
    competency: 'Ethical Communication & Courage',
    subCompetency: 'Navigate ethical dilemma and select principled response',
    actionCue: 'Select truthful and respectful response in conflict scenario',
    gameMechanic: 'Speak-Out Decision Tree (Case Validator)',
    scene1: 'Review incoming stakeholder messages about data breach',
    scene2: 'Draft initial public statement with time pressure',
    scene3: 'EDGE CASE: Engineering reports breach may be larger - must decide to publish now, delay, or issue holding statement',
    edgeCaseDescription: 'Sudden scope change requiring rapid strategic pivot while maintaining transparency',
  };

  const handleStepProgress = (step: 'setup' | 'generate' | 'test' | 'complete') => {
    setCurrentStep(step);
    switch (step) {
      case 'setup':
        setProgress(25);
        break;
      case 'generate':
        setProgress(50);
        break;
      case 'test':
        setProgress(75);
        break;
      case 'complete':
        setProgress(100);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
              🎬 Demo Mode
            </Badge>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Creator Flow Demo
          </h1>
          <p className="text-gray-400 mt-2">
            Interactive walkthrough of the validator creation process - Sample data pre-loaded for demonstration
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6 bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Overall Progress</span>
                <span className="text-white font-semibold">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
              <div className="flex justify-between mt-4">
                <div className={`flex flex-col items-center ${currentStep === 'setup' ? 'text-purple-400' : progress >= 25 ? 'text-green-400' : 'text-gray-500'}`}>
                  <FileText className="w-6 h-6 mb-1" />
                  <span className="text-xs">Setup</span>
                </div>
                <div className={`flex flex-col items-center ${currentStep === 'generate' ? 'text-purple-400' : progress >= 50 ? 'text-green-400' : 'text-gray-500'}`}>
                  <Sparkles className="w-6 h-6 mb-1" />
                  <span className="text-xs">Generate</span>
                </div>
                <div className={`flex flex-col items-center ${currentStep === 'test' ? 'text-purple-400' : progress >= 75 ? 'text-green-400' : 'text-gray-500'}`}>
                  <TestTube className="w-6 h-6 mb-1" />
                  <span className="text-xs">Test</span>
                </div>
                <div className={`flex flex-col items-center ${currentStep === 'complete' ? 'text-green-400' : 'text-gray-500'}`}>
                  <CheckCircle className="w-6 h-6 mb-1" />
                  <span className="text-xs">Complete</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={currentStep} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
            <TabsTrigger value="setup" onClick={() => handleStepProgress('setup')}>
              1. Setup
            </TabsTrigger>
            <TabsTrigger value="generate" onClick={() => handleStepProgress('generate')}>
              2. Generate
            </TabsTrigger>
            <TabsTrigger value="test" onClick={() => handleStepProgress('test')}>
              3. Test
            </TabsTrigger>
            <TabsTrigger value="complete" onClick={() => handleStepProgress('complete')}>
              4. Complete
            </TabsTrigger>
          </TabsList>

          {/* Step 1: Setup Template */}
          <TabsContent value="setup" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  Step 1: Template Setup
                </CardTitle>
                <CardDescription>Define your validator template with competency mapping and game mechanics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label>Template Name</Label>
                    <Input value={sampleTemplate.name} readOnly className="bg-gray-900/50" />
                  </div>

                  <div>
                    <Label>Competency</Label>
                    <Input value={sampleTemplate.competency} readOnly className="bg-gray-900/50" />
                  </div>

                  <div>
                    <Label>Sub-Competency Being Tested</Label>
                    <Input value={sampleTemplate.subCompetency} readOnly className="bg-gray-900/50" />
                  </div>

                  <div>
                    <Label>Action Cue (What Player Does)</Label>
                    <Input value={sampleTemplate.actionCue} readOnly className="bg-gray-900/50" />
                  </div>

                  <div>
                    <Label>Game Mechanic</Label>
                    <Input value={sampleTemplate.gameMechanic} readOnly className="bg-gray-900/50" />
                  </div>
                </div>

                {/* Scene Structure */}
                <div className="border-t border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold mb-4 text-purple-400">Game Scenes</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Scene 1: Baseline</Label>
                      <Textarea value={sampleTemplate.scene1} readOnly className="bg-gray-900/50" rows={2} />
                    </div>
                    <div>
                      <Label>Scene 2: Adaptation</Label>
                      <Textarea value={sampleTemplate.scene2} readOnly className="bg-gray-900/50" rows={2} />
                    </div>
                    <div>
                      <Label>Scene 3: Edge Case ⚡</Label>
                      <Textarea value={sampleTemplate.scene3} readOnly className="bg-gray-900/50 border-yellow-500/30" rows={3} />
                    </div>
                    <div>
                      <Label>Edge Case Description</Label>
                      <Textarea value={sampleTemplate.edgeCaseDescription} readOnly className="bg-gray-900/50" rows={2} />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => handleStepProgress('generate')} 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Next: Generate Prompt →
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 2: Generate Game */}
          <TabsContent value="generate" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Step 2: AI Prompt Generation
                </CardTitle>
                <CardDescription>Review the generated PlayOps-compliant prompt for your validator</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                      ✅ Prompt Generated
                    </Badge>
                    <span className="text-sm text-gray-400">Ready for preview</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-300">
                      <span className="text-purple-400 font-semibold">🎯 Competency:</span> {sampleTemplate.competency}
                    </p>
                    <p className="text-gray-300">
                      <span className="text-purple-400 font-semibold">🎮 Game Type:</span> Scenario-Based Simulation
                    </p>
                    <p className="text-gray-300">
                      <span className="text-purple-400 font-semibold">⚡ Edge Case:</span> Mid-game (Scene 3)
                    </p>
                    <p className="text-gray-300">
                      <span className="text-purple-400 font-semibold">⏱️ Time Limit:</span> 2 hours (auto-divided across 3 scenes)
                    </p>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-blue-300 text-sm flex items-start gap-2">
                    <span>ℹ️</span>
                    <span>In production mode, this would call Lovable AI to generate the full game HTML. For this demo, we're showing the workflow without actual AI generation.</span>
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => handleStepProgress('setup')} 
                    variant="outline"
                    className="flex-1"
                  >
                    ← Back
                  </Button>
                  <Button 
                    onClick={() => handleStepProgress('test')} 
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    Next: Run Tests →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 3: Testing */}
          <TabsContent value="test" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="w-5 h-5 text-purple-400" />
                  Step 3: Automated Testing
                </CardTitle>
                <CardDescription>v3.1 Validator Testing - 8 Comprehensive Checks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Test Results */}
                <div className="space-y-3">
                  {[
                    { name: 'Scene Structure & Flow', status: 'passed' },
                    { name: 'Edge Case Implementation', status: 'passed' },
                    { name: 'Scoring Formula Accuracy', status: 'passed' },
                    { name: 'UX/UI Integrity', status: 'passed' },
                    { name: 'Telegram Mini-App Compliance', status: 'passed' },
                    { name: 'Timer & Time Allocation', status: 'passed' },
                    { name: 'Backend Data Capture', status: 'passed' },
                    { name: 'Configuration Validation', status: 'passed' },
                  ].map((test, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-gray-200">{test.name}</span>
                      </div>
                      <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                        Passed
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-green-400 font-semibold mb-1">✅ All Tests Passed!</p>
                  <p className="text-sm text-gray-300">
                    Your validator meets all PlayOps Framework v3.1 requirements and is ready for submission.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => handleStepProgress('generate')} 
                    variant="outline"
                    className="flex-1"
                  >
                    ← Back
                  </Button>
                  <Button 
                    onClick={() => handleStepProgress('complete')} 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Complete & Submit →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 4: Complete */}
          <TabsContent value="complete" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Step 4: Submission Complete
                </CardTitle>
                <CardDescription>Your validator is ready for review and publishing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-green-500/10 to-purple-500/10 border border-green-500/30 rounded-lg p-6 text-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-green-400 mb-2">Validator Created Successfully!</h3>
                  <p className="text-gray-300 mb-6">
                    Your "{sampleTemplate.name}" validator has been submitted for review.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-400">8/8</div>
                      <div className="text-sm text-gray-400">Tests Passed</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-400">100%</div>
                      <div className="text-sm text-gray-400">Compliance Score</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-purple-400">What's Next?</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p className="flex items-start gap-2">
                      <span className="text-purple-400">1.</span>
                      <span>Manual review by PlayOps team (1-2 business days)</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-purple-400">2.</span>
                      <span>Upon approval, your validator will be published to the marketplace</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-purple-400">3.</span>
                      <span>Brands can discover and license your validator</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-purple-400">4.</span>
                      <span>You'll earn revenue from each brand customization</span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => handleStepProgress('setup')} 
                    variant="outline"
                    className="flex-1"
                  >
                    Start New Template
                  </Button>
                  <Button 
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    View in Portfolio
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
