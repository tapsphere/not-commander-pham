import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Code, PlayCircle, Trophy } from 'lucide-react';

interface PlayOpsStructureGuideProps {
  subCompetencies: Array<{ id: string; statement: string; action_cue?: string }>;
  selectedSubIds: string[];
}

export const PlayOpsStructureGuide = ({ subCompetencies, selectedSubIds }: PlayOpsStructureGuideProps) => {
  const selectedSubs = subCompetencies.filter(sub => selectedSubIds.includes(sub.id));
  
  return (
    <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30 p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold text-blue-300 mb-2">🏗️ PlayOps Framework Structure</h3>
          <p className="text-sm text-gray-300">
            Every validator follows this exact scene flow. Custom HTML games must implement all scenes.
          </p>
        </div>

        {/* Scene Flow Diagram */}
        <div className="space-y-4">
          {/* Scene 0 - Loading/Intro */}
          <div className="relative">
            <div className="flex items-start gap-4 bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <PlayCircle className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white">Scene 0: Intro Screen</h4>
                  <Badge variant="outline" className="text-xs">REQUIRED</Badge>
                </div>
                <div className="text-sm space-y-1 text-gray-300">
                  <p><strong className="text-green-400">Required Elements:</strong></p>
                  <ul className="list-disc list-inside text-xs space-y-1 ml-2">
                    <li>Brand logo display (from <code className="bg-gray-900 px-1 rounded">?logo=URL</code> param)</li>
                    <li>Game title and brief instructions</li>
                    <li><strong>START button</strong> - NO auto-start allowed</li>
                    <li>Loading states for assets (if needed)</li>
                  </ul>
                  <p className="text-xs text-gray-400 mt-2">
                    <Code className="h-3 w-3 inline mr-1" />
                    <strong>Custom HTML:</strong> Listen for START button click, then navigate to Scene 1
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-2 left-8 flex items-center justify-center">
              <ChevronRight className="h-6 w-6 text-blue-400 rotate-90" />
            </div>
          </div>

          {/* Scene 1-4 - Gameplay Scenes */}
          {selectedSubs.length > 0 ? (
            selectedSubs.map((sub, index) => (
              <div key={sub.id} className="relative">
                <div className="flex items-start gap-4 bg-gray-800/50 border border-purple-500/50 rounded-lg p-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{index + 1}</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white">Scene {index + 1}: Gameplay</h4>
                      <Badge className="text-xs bg-purple-600">Sub-Competency {index + 1}</Badge>
                    </div>
                    <div className="text-sm space-y-1 text-gray-300">
                      <p className="text-xs text-purple-300 italic mb-2">
                        Tests: {sub.statement}
                      </p>
                      <p><strong className="text-purple-400">Required Elements:</strong></p>
                      <ul className="list-disc list-inside text-xs space-y-1 ml-2">
                        <li>Implement action cue: <span className="text-yellow-300">{sub.action_cue || 'defined in sub-competency'}</span></li>
                        <li>Timer display (if time-limited)</li>
                        <li>Interactive elements (buttons, inputs, drag-drop, etc.)</li>
                        <li>Progress indicator (optional)</li>
                        <li>Edge case trigger (mid-game disruption)</li>
                      </ul>
                      <p className="text-xs text-gray-400 mt-2">
                        <Code className="h-3 w-3 inline mr-1" />
                        <strong>Custom HTML:</strong> Capture all player interactions in a data object. When scene completes, navigate to {index < selectedSubs.length - 1 ? `Scene ${index + 2}` : 'Results Screen'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-2 left-8 flex items-center justify-center">
                  <ChevronRight className="h-6 w-6 text-blue-400 rotate-90" />
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center bg-gray-800/30 border border-dashed border-gray-600 rounded-lg p-8">
              <p className="text-gray-400 text-sm">Select sub-competencies above to see gameplay scenes</p>
            </div>
          )}

          {/* Results/Scoring Screen */}
          <div className="flex items-start gap-4 bg-gray-800/50 border border-yellow-500/50 rounded-lg p-4">
            <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-white">Results Screen</h4>
                <Badge variant="outline" className="text-xs">REQUIRED</Badge>
              </div>
              <div className="text-sm space-y-1 text-gray-300">
                <p><strong className="text-yellow-400">Required Display Fields:</strong></p>
                <ul className="list-disc list-inside text-xs space-y-1 ml-2">
                  <li><strong>Proficiency Level:</strong> "Needs Work" | "Proficient" | "Mastery"</li>
                  <li><strong>Score:</strong> Percentage or points (0-100)</li>
                  <li><strong>Feedback Message:</strong> Specific to level achieved</li>
                  <li><strong>Time Taken:</strong> Total gameplay duration</li>
                  <li><strong>Key Metrics:</strong> Accuracy, completion rate, etc.</li>
                  <li>REPLAY button and CONTINUE button</li>
                </ul>
                <p className="text-xs text-gray-400 mt-2">
                  <Code className="h-3 w-3 inline mr-1" />
                  <strong>Custom HTML:</strong> Calculate score using formulas from sub-competency. Submit data to backend via <code className="bg-gray-900 px-1 rounded">postMessage()</code>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* State Management & Navigation */}
        <div className="border-t border-gray-700 pt-4 space-y-3">
          <h4 className="font-semibold text-sm text-blue-300">🔄 State Management & Navigation</h4>
          <div className="bg-gray-900/50 rounded-lg p-4 space-y-2 text-xs text-gray-300">
            <p><strong>How the game tracks scenes:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Use JavaScript variable: <code className="bg-gray-800 px-1 rounded">let currentScene = 0;</code></li>
              <li>Each button click increments: <code className="bg-gray-800 px-1 rounded">currentScene++</code></li>
              <li>Render/show only the current scene's HTML elements</li>
              <li>Hide all other scenes with <code className="bg-gray-800 px-1 rounded">display: none</code></li>
            </ul>
            
            <p className="mt-3"><strong>URL Parameters (Brand Customization):</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><code className="bg-gray-800 px-1 rounded">?logo=URL</code> - Brand logo image</li>
              <li><code className="bg-gray-800 px-1 rounded">?primary=HEX</code> - Primary color</li>
              <li><code className="bg-gray-800 px-1 rounded">?secondary=HEX</code> - Secondary color</li>
              <li><code className="bg-gray-800 px-1 rounded">?accent=HEX</code> - Accent color</li>
            </ul>
            
            <p className="mt-3"><strong>Data Capture (Backend Integration):</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Create object: <code className="bg-gray-800 px-1 rounded">const gameplayData = {"{...}"}</code></li>
              <li>Track: timestamps, user choices, scores, time_taken, accuracy</li>
              <li>On results screen, send via: <code className="bg-gray-800 px-1 rounded">window.parent.postMessage(gameplayData, '*')</code></li>
            </ul>
          </div>
        </div>

        {/* Code Template Link */}
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
          <p className="text-sm text-green-300 font-semibold mb-2">📦 Download HTML Template</p>
          <p className="text-xs text-gray-300 mb-3">
            Get a starter HTML template with all scenes pre-structured and commented
          </p>
          <a 
            href="/CUSTOM_GAME_TEMPLATE_GUIDE.md" 
            target="_blank"
            className="text-green-400 hover:text-green-300 underline text-xs font-medium"
          >
            View Complete Custom Game Template Guide →
          </a>
        </div>
      </div>
    </Card>
  );
};