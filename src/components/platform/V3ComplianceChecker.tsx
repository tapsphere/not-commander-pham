import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  PlayCircle, 
  FileCode,
  Smartphone,
  Accessibility,
  Target
} from 'lucide-react';
import { validateV31Compliance, V3ValidationResult } from '@/utils/v3Validator';

interface V3ComplianceCheckerProps {
  html: string;
  onTest?: () => void;
}

export function V3ComplianceChecker({ html, onTest }: V3ComplianceCheckerProps) {
  const [result, setResult] = useState<V3ValidationResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const runCheck = () => {
    setIsChecking(true);
    setTimeout(() => {
      const validation = validateV31Compliance(html);
      setResult(validation);
      setIsChecking(false);
    }, 500);
  };

  if (!result && !isChecking) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-neon-green" />
            v3.1 Compliance Check
          </CardTitle>
          <CardDescription>
            Validate against BASE LAYER 1 BAKED & LOCKED specification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runCheck} className="w-full">
            <PlayCircle className="w-4 h-4 mr-2" />
            Run Compliance Check
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isChecking) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green mx-auto mb-4"></div>
            <p className="text-gray-400">Analyzing game compliance...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-neon-green" />
              v3.1 Compliance Report
            </CardTitle>
            <CardDescription>
              BASE LAYER 1 validation results
            </CardDescription>
          </div>
          <div className="text-right">
            <p className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
              {result.score}%
            </p>
            <p className="text-sm text-gray-400">Compliance Score</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Status */}
        <div>
          <Progress value={result.score} className="mb-2" />
          {result.isValid ? (
            <Badge className="bg-green-500">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Fully Compliant
            </Badge>
          ) : (
            <Badge className="bg-red-500">
              <XCircle className="w-3 h-3 mr-1" />
              Non-Compliant ({result.errors.length} errors)
            </Badge>
          )}
        </div>

        {/* Errors */}
        {result.errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-red-500 font-semibold flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Critical Issues ({result.errors.length})
            </h4>
            <ul className="space-y-1">
              {result.errors.map((error, i) => (
                <li key={i} className="text-sm text-red-400 pl-6">
                  • {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {result.warnings.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-yellow-500 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Warnings ({result.warnings.length})
            </h4>
            <ul className="space-y-1">
              {result.warnings.map((warning, i) => (
                <li key={i} className="text-sm text-yellow-400 pl-6">
                  • {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          {/* Window Objects */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold flex items-center gap-2">
              <FileCode className="w-4 h-4" />
              Required Objects
            </h4>
            <div className="space-y-1 text-sm">
              <StatusItem 
                label="window.__CONFIG__" 
                status={result.details.hasConfig} 
              />
              <StatusItem 
                label="window.__GOLD_KEY__" 
                status={result.details.hasGoldKey} 
              />
              <StatusItem 
                label="window.__EDGE__" 
                status={result.details.hasEdge} 
              />
              <StatusItem 
                label="window.__RESULT__" 
                status={result.details.hasResult} 
              />
              <StatusItem 
                label="window.__PROOF__" 
                status={result.details.hasProof} 
              />
            </div>
          </div>

          {/* Scene Structure */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold flex items-center gap-2">
              <PlayCircle className="w-4 h-4" />
              Scene Structure
            </h4>
            <div className="space-y-1 text-sm">
              <StatusItem 
                label="Scene 0 (Intro)" 
                status={result.details.sceneStructure.hasIntro} 
              />
              <StatusItem 
                label="Scene 1+ (Actions)" 
                status={result.details.sceneStructure.hasActions} 
              />
              <StatusItem 
                label="Final Results" 
                status={result.details.sceneStructure.hasFinalResults} 
              />
            </div>
          </div>

          {/* Mobile Optimization */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Mobile
            </h4>
            <div className="space-y-1 text-sm">
              <StatusItem 
                label="Viewport Meta" 
                status={result.details.mobile.hasViewportMeta} 
              />
              <StatusItem 
                label="Touch Optimization" 
                status={result.details.mobile.hasTouchOptimization} 
              />
            </div>
          </div>

          {/* Accessibility */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold flex items-center gap-2">
              <Accessibility className="w-4 h-4" />
              Accessibility
            </h4>
            <div className="space-y-1 text-sm">
              <StatusItem 
                label="ARIA Labels" 
                status={result.details.accessibility.hasAriaLabels} 
              />
              <StatusItem 
                label="Keyboard Nav" 
                status={result.details.accessibility.hasKeyboardNav} 
              />
              <StatusItem 
                label="Focus Indicators" 
                status={result.details.accessibility.hasFocusIndicators} 
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button onClick={runCheck} variant="outline" className="flex-1">
            Re-check
          </Button>
          {onTest && (
            <Button onClick={onTest} className="flex-1">
              <PlayCircle className="w-4 h-4 mr-2" />
              Test Game
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusItem({ label, status }: { label: string; status: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-400">{label}</span>
      {status ? (
        <CheckCircle2 className="w-4 h-4 text-green-500" />
      ) : (
        <XCircle className="w-4 h-4 text-red-500" />
      )}
    </div>
  );
}
