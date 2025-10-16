import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ValidatorTest() {
  const [loading, setLoading] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any>(null);

  const generateValidator = async () => {
    setLoading(true);
    setGeneratedHtml(null);
    setMetrics(null);

    try {
      console.log('Calling generate-game function...');
      
      const { data, error } = await supabase.functions.invoke('generate-game', {
        body: {
          templatePrompt: `VALIDATOR: Analytical Thinking - Multi-Step Problem Solving

CBE FRAMEWORK:
Sub-Competency: Breaks down complex problems into manageable parts to identify solutions
Action Cue: You need to solve this puzzle by breaking it into smaller steps
Game Mechanic: Multi-step puzzle game
Performance Indicator: Solves multi-step problems logically

SCORING FORMULA:
Score = (constraints_met / total_constraints) × 100

REQUIRED METRICS TO CAPTURE:
- constraints_met: number of constraints satisfied
- total_constraints: total number of constraints in puzzle
- solve_time_ms: time taken to complete

CREATIVE SCENARIO:
You're a product manager during a critical product launch. Your dashboard shows 5 interconnected systems that need to be optimized. Each system has dependencies and constraints. Solve the crisis by addressing issues in the correct order.

UI AESTHETIC:
Neon cyberpunk dashboard with glowing data panels, dark background with electric blue (#00F0FF) and hot pink (#FF006E) accents. Clean, modern interface with subtle animations.

EDGE CASE:
If player tries to solve steps out of order, show warning: 'Dependencies not met! Check prerequisite systems first.'

GAME STRUCTURE:
1. Show 5 interconnected system cards with dependency arrows
2. Each card shows: System name, Status (red/yellow/green), Constraints
3. Player must click systems in correct dependency order
4. Visual feedback when dependencies are met
5. Timer counts solve_time_ms
6. Success screen shows score and metrics

BRANDING:
- Primary: #00F0FF (electric blue)
- Secondary: #FF006E (hot pink)
- Background: #0A0A0F (deep space black)`,
          primaryColor: "#00F0FF",
          secondaryColor: "#FF006E",
          previewMode: true,
          subCompetencies: [
            {
              id: "test-analytical-1",
              competency_id: "analytical-thinking",
              statement: "Breaks down complex problems into manageable parts to identify solutions",
              player_action: "You need to solve this puzzle by breaking it into smaller steps",
              backend_data_captured: ["constraints_met", "total_constraints", "solve_time_ms"],
              scoring_logic: {
                formula: "Score = (constraints_met / total_constraints) × 100",
                performance_indicator: "Solves multi-step problems logically"
              }
            }
          ]
        }
      });

      if (error) {
        console.error('Function error:', error);
        toast.error(`Generation failed: ${error.message}`);
        return;
      }

      console.log('Function response:', data);

      if (data?.success && data?.html) {
        setGeneratedHtml(data.html);
        toast.success("Validator generated successfully!");
      } else {
        toast.error("No HTML received from generator");
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Validator Test: Analytical Thinking</h1>
          <p className="text-gray-400">
            Testing Phase 1: Structured Creativity approach with CBE framework + Creative input
          </p>
        </div>

        {/* Test Scenario Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-[#00F0FF]">Test Configuration</h2>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-gray-300 mb-2">CBE Framework (from Excel)</h3>
              <ul className="space-y-1 text-gray-400">
                <li>• Sub-Competency: Breaks down complex problems</li>
                <li>• Action Cue: Solve by breaking into steps</li>
                <li>• Game Mechanic: Multi-step puzzle</li>
                <li>• Scoring: (constraints_met / total) × 100</li>
                <li>• Metrics: constraints_met, total_constraints, solve_time_ms</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-300 mb-2">Creative Input (Creator adds)</h3>
              <ul className="space-y-1 text-gray-400">
                <li>• Scenario: Product launch crisis</li>
                <li>• UI: Cyberpunk dashboard (blue/pink)</li>
                <li>• Edge Case: Dependency order warnings</li>
                <li>• Branding: Electric blue + hot pink</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={generateValidator}
          disabled={loading}
          size="lg"
          className="w-full bg-[#00F0FF] hover:bg-[#00F0FF]/80 text-black font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating Validator...
            </>
          ) : (
            "Generate Validator from Excel Data"
          )}
        </Button>

        {/* Generated Game Preview */}
        {generatedHtml && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#FF006E]">Generated Validator Game</h2>
              <Button
                variant="outline"
                onClick={() => {
                  const blob = new Blob([generatedHtml], { type: 'text/html' });
                  const url = URL.createObjectURL(blob);
                  window.open(url, '_blank');
                }}
              >
                Open in New Tab
              </Button>
            </div>

            <div className="border-2 border-[#00F0FF] rounded-lg overflow-hidden">
              <iframe
                srcDoc={generatedHtml}
                className="w-full h-[800px] bg-white"
                title="Generated Validator Game"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>

            {/* Validation Checklist */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#FF006E] mb-4">Validation Checklist</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-[#00F0FF] mt-1">✓</span>
                  <span className="text-gray-300">Does the game show 5 interconnected system cards?</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00F0FF] mt-1">✓</span>
                  <span className="text-gray-300">Are dependencies visualized with arrows?</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00F0FF] mt-1">✓</span>
                  <span className="text-gray-300">Does clicking out-of-order show warning?</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00F0FF] mt-1">✓</span>
                  <span className="text-gray-300">Is timer tracking solve_time_ms?</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00F0FF] mt-1">✓</span>
                  <span className="text-gray-300">Does end screen show: constraints_met, total_constraints, score?</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00F0FF] mt-1">✓</span>
                  <span className="text-gray-300">Is UI cyberpunk styled with blue/pink colors?</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
