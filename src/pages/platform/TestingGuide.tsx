import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TestingGuide = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="prose prose-invert max-w-none">
          <h1>Validator Testing Guide</h1>

          <h2>Overview</h2>
          <p>
            The Validator Testing Dashboard allows you to stress test all your game validators before publishing them. 
            This ensures quality, C-BEN compliance, and proper functionality for both AI-generated and custom-uploaded games.
          </p>

          <h2>Accessing the Testing Dashboard</h2>
          <ol>
            <li>Navigate to your <strong>Creator Dashboard</strong> (<code>/platform/creator</code>)</li>
            <li>Click the <strong>"Test Validators"</strong> button in the header</li>
            <li>Or select <strong>"Test Validators"</strong> from the navigation menu</li>
          </ol>

          <hr />

          <h2>Understanding the Testing Phases</h2>
          <p>Every validator goes through <strong>3 critical testing phases</strong>:</p>

          <h3>Phase 1: UX/UI Flow Test</h3>
          <p><strong>What it checks:</strong></p>
          <ul>
            <li>Game loads without errors</li>
            <li>UI elements render correctly</li>
            <li>Navigation and interactions work smoothly</li>
            <li>Visual elements match design specifications</li>
            <li>Responsive design works across devices</li>
          </ul>

          <p><strong>How to test:</strong></p>
          <ol>
            <li>Launch the game validator</li>
            <li>Navigate through all screens and interactions</li>
            <li>Test on different screen sizes</li>
            <li>Verify all buttons, inputs, and UI elements respond correctly</li>
            <li>Check for console errors or visual glitches</li>
          </ol>

          <p><strong>Pass criteria:</strong></p>
          <ul>
            <li>✅ No console errors</li>
            <li>✅ All UI elements visible and functional</li>
            <li>✅ Smooth user experience</li>
            <li>✅ Responsive on mobile/tablet/desktop</li>
          </ul>

          <hr />

          <h3>Phase 2: Action Cue Validation</h3>
          <p><strong>What it checks:</strong></p>
          <ul>
            <li>The game accurately captures the sub-competency being tested</li>
            <li>Player actions align with the action cue statement</li>
            <li>Game mechanics properly demonstrate the skill</li>
            <li>Backend data capture matches expected behaviors</li>
          </ul>

          <p><strong>How to test (AI-Generated Games):</strong></p>
          <ol>
            <li>Review the sub-competency statement and action cue</li>
            <li>Play through the game naturally</li>
            <li>Verify that your actions directly relate to the skill being measured</li>
            <li>Check if the game mechanic makes sense for the competency</li>
          </ol>

          <p><strong>How to test (Custom Upload Games):</strong></p>
          <ol>
            <li>Review the selected sub-competencies</li>
            <li>Play the game and identify which actions trigger competency measurement</li>
            <li>Verify API calls are sending correct data to backend</li>
            <li>Check <code>backend_data_captured</code> matches your actual game events</li>
          </ol>

          <p><strong>Pass criteria:</strong></p>
          <ul>
            <li>✅ Game actions clearly demonstrate the sub-competency</li>
            <li>✅ Action cue is intuitive and measurable</li>
            <li>✅ Backend captures relevant behavioral data</li>
            <li>✅ No ambiguity in what skill is being tested</li>
          </ul>

          <hr />

          <h3>Phase 3: Scoring Formula Test</h3>
          <p><strong>What it checks:</strong></p>
          <ul>
            <li>Scoring logic accurately reflects player performance</li>
            <li>XP/levels are calculated correctly</li>
            <li>Pass/fail thresholds are appropriate</li>
            <li>Proficiency levels match actual skill demonstration</li>
          </ul>

          <p><strong>How to test:</strong></p>
          <ol>
            <li>
              <strong>Run multiple test attempts with varying performance:</strong>
              <ul>
                <li>Play poorly (test minimum thresholds)</li>
                <li>Play average (test mid-range scoring)</li>
                <li>Play excellently (test maximum scoring)</li>
              </ul>
            </li>
            <li>
              <strong>Verify scoring formulas:</strong>
              <ul>
                <li><strong>Level 1 (Novice):</strong> Basic task completion</li>
                <li><strong>Level 2 (Intermediate):</strong> Quality and efficiency</li>
                <li><strong>Level 3 (Expert):</strong> Advanced techniques + mastery</li>
              </ul>
            </li>
            <li>
              <strong>Check backend data:</strong>
              <ul>
                <li>Review <code>scoring_metrics</code> in database</li>
                <li>Verify <code>passed</code> boolean is accurate</li>
                <li>Confirm <code>proficiency_level</code> matches performance</li>
              </ul>
            </li>
          </ol>

          <p><strong>Pass criteria:</strong></p>
          <ul>
            <li>✅ Poor performance = appropriate low score/fail</li>
            <li>✅ Average performance = mid-range score</li>
            <li>✅ Excellent performance = high score/pass</li>
            <li>✅ Proficiency levels reflect actual skill demonstration</li>
            <li>✅ Scoring is consistent across multiple attempts</li>
          </ul>

          <hr />

          <h2>Template Type Differences</h2>

          <h3>🤖 AI-Generated Games</h3>
          <ul>
            <li><strong>Automated checks:</strong> System validates action cue alignment automatically</li>
            <li><strong>Formula verification:</strong> Scoring logic is pre-validated against C-BEN framework</li>
            <li><strong>Focus areas:</strong> UX flow and gameplay experience</li>
          </ul>

          <h3>📤 Custom Upload Games</h3>
          <ul>
            <li>
              <strong>Critical manual checks required:</strong>
              <ul>
                <li>Backend API integration working correctly</li>
                <li>Data format matches expected schema</li>
                <li>Custom scoring logic is sound</li>
                <li>Event tracking captures all required metrics</li>
              </ul>
            </li>
            <li><strong>Additional verification:</strong> Check <code>custom_game_url</code> loads properly</li>
            <li><strong>Backend compliance:</strong> Verify <code>backend_data_captured</code> structure</li>
          </ul>

          <hr />

          <h2>Step-by-Step Testing Workflow</h2>

          <h3>Step 1: Start a Test</h3>
          <ol>
            <li>Find your validator in the dashboard</li>
            <li>Click <strong>"Start Test"</strong> (or "Re-test" if previously tested)</li>
            <li>Test wizard will guide you through each phase</li>
          </ol>

          <h3>Step 2: Complete Each Phase</h3>
          <ul>
            <li>Work through Phase 1 → Phase 2 → Phase 3 sequentially</li>
            <li>Add notes for each phase (issues found, observations)</li>
            <li>Mark each phase as <strong>Passed</strong>, <strong>Failed</strong>, or <strong>Needs Review</strong></li>
          </ul>

          <h3>Step 3: Review Results</h3>
          <ul>
            <li>Overall status calculated from all three phases</li>
            <li>View detailed test history and notes</li>
            <li>Check <code>test_version</code> for tracking purposes</li>
          </ul>

          <h3>Step 4: Approve for Publishing</h3>
          <ul>
            <li>Only validators with <strong>"Passed"</strong> overall status can be approved</li>
            <li>Click <strong>"Approve for Publish"</strong> after successful testing</li>
            <li>Once approved, the validator becomes available in the marketplace</li>
          </ul>

          <hr />

          <h2>Best Practices</h2>

          <h3>Before Testing</h3>
          <ul>
            <li>✅ Ensure you understand the sub-competency being tested</li>
            <li>✅ Review the action cue and expected behaviors</li>
            <li>✅ Have multiple testers run through the validator</li>
            <li>✅ Test on different devices and browsers</li>
          </ul>

          <h3>During Testing</h3>
          <ul>
            <li>✅ Take detailed notes of any issues</li>
            <li>✅ Record edge cases and unexpected behaviors</li>
            <li>✅ Test boundary conditions (minimum/maximum inputs)</li>
            <li>✅ Verify all backend data is captured correctly</li>
          </ul>

          <h3>After Testing</h3>
          <ul>
            <li>✅ Document any fixes needed</li>
            <li>✅ Re-test after making changes</li>
            <li>✅ Get peer review before approving</li>
            <li>✅ Keep test history for compliance tracking</li>
          </ul>

          <hr />

          <h2>Publishing Requirements</h2>
          <p><strong>A validator can ONLY be published if:</strong></p>
          <ol>
            <li>✅ Overall status = <strong>"Passed"</strong></li>
            <li>✅ All three phases = <strong>"Passed"</strong></li>
            <li>✅ Approved for publish = <strong>true</strong></li>
            <li>✅ No critical issues documented</li>
          </ol>

          <p><strong>After approval:</strong></p>
          <ul>
            <li>Validator becomes visible in the marketplace</li>
            <li>Brands can customize and deploy it</li>
            <li>Test results remain in history for auditing</li>
          </ul>

          <hr />

          <p><strong>Happy Testing! 🎮</strong></p>
          <p>Remember: Quality validators = Better skills assessment = Stronger talent pipelines</p>
        </div>
      </div>
    </div>
  );
};

export default TestingGuide;
