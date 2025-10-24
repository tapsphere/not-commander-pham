import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TestingGuide = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1>VALIDATOR TESTING v3.1</h1>
          <h2>Automated Quality & C-BEN Alignment Framework</h2>
          <p className="text-muted-foreground">Last Updated: October 2025 – Lovable Implementation Synced</p>

          <h2>1. Purpose</h2>
          <p>
            To ensure every validator mini-game is playable, measurable, and C-BEN compliant before publication.
          </p>
          <p>
            This replaces the manual three-phase QA flow; testing is now <strong>automated inside Lovable</strong> and 
            validates both technical integrity and competency proof accuracy.
          </p>

          <h2>2. Scope</h2>
          <p>Applies to all validators—AI-generated or custom-uploaded—before they can be marked Publish = True.</p>
          <p>Each validator must:</p>
          <ul>
            <li>Follow Base Layer 1 scene and scoring architecture</li>
            <li>Include all embedded global objects (<code>__CONFIG__</code>, <code>__GOLD_KEY__</code>, <code>__EDGE__</code>, <code>__RESULT__</code>, <code>__PROOF__</code>)</li>
            <li>Pass 100% of automated checks described below</li>
          </ul>

          <h2>3. Automated Testing Pipeline</h2>
          <p>The system performs <strong>8 sequential checks</strong> every time the creator clicks "Test Validator."</p>

          <h3>✅ Check 1 – Scene Structure Validation</h3>
          <p>Validates the 4-scene structure:</p>
          <ul>
            <li><strong>Intro</strong> - No auto-start on load</li>
            <li><strong>Gameplay</strong> - START button present, sticky, full-width, functional</li>
            <li><strong>Edge-Case</strong> - No instructions repeat after Scene 0</li>
            <li><strong>Results</strong> - Edge cases occur only in designated scenes</li>
          </ul>

          <h3>✅ Check 2 – UX/UI Integrity</h3>
          <ul>
            <li>No vertical scrolling during gameplay (<code>overflow:hidden</code>, <code>height:100vh</code>)</li>
            <li>No text overlap or clipped content at 390 × 844 viewport</li>
            <li>All buttons clickable and visually respond (active, hover, touched)</li>
            <li>Touch targets ≥ 44px</li>
            <li>START button remains visible on all devices</li>
          </ul>

          <h3>✅ Check 3 – Telegram Mini-App Compliance</h3>
          <ul>
            <li>Contains <code>window.Telegram.WebApp.ready()</code> and <code>expand()</code></li>
            <li>Game runs seamlessly in Telegram WebApp frame</li>
            <li>No network calls outside approved endpoints</li>
          </ul>

          <h3>✅ Check 4 – Embedded Configuration Objects</h3>
          <p>Verifies presence and validity of required globals:</p>
          <table>
            <thead>
              <tr>
                <th>Object</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>__CONFIG__</code></td>
                <td>duration, thresholds, competency, XP</td>
              </tr>
              <tr>
                <td><code>__GOLD_KEY__</code></td>
                <td>correct answers / logic map</td>
              </tr>
              <tr>
                <td><code>__EDGE__</code></td>
                <td>edge-case trigger + recovery log</td>
              </tr>
              <tr>
                <td><code>__RESULT__</code></td>
                <td>computed accuracy, time, edge success</td>
              </tr>
              <tr>
                <td><code>__PROOF__</code></td>
                <td>immutable proof receipt (test mode only)</td>
              </tr>
            </tbody>
          </table>

          <h3>✅ Check 5 – Action Cue & Mechanic Alignment</h3>
          <ul>
            <li>Extracts verb + object from sub-competency</li>
            <li>Confirms mechanic (drag-drop, select, swipe, etc.) surfaces that behavior</li>
            <li>Ensures no free-text inputs</li>
            <li>Validates event triggers match action cue pattern (observable, measurable)</li>
          </ul>

          <h3>✅ Check 6 – Scoring Formula Verification</h3>
          <ul>
            <li>Runs 3 auto-plays (poor / average / excellent)</li>
            <li>Confirms accuracy thresholds (A1 = 0.85, A2 = 0.90, A3 = 0.95)</li>
            <li>Confirms time limits (T1 = 90s, T2 = 90s, T3 = 75s)</li>
            <li>Confirms edge-case bonus E3 ≥ 0.8</li>
            <li>Verifies outputs map to Level 1–3</li>
          </ul>

          <h3>✅ Check 7 – Accessibility & Mobile Readiness</h3>
          <ul>
            <li><code>aria-label</code> present for all interactive items</li>
            <li>Keyboard navigation (Enter/Space) works</li>
            <li>Screen-reader headings h1→h3 hierarchy valid</li>
            <li>Contrast ratio ≥ 4.5:1</li>
          </ul>

          <h3>✅ Check 8 – Proof Emission & Telemetry</h3>
          <ul>
            <li>Confirms JSON payload posted to <code>/api/validator-proof</code></li>
            <li>Must include: score, time, edgeCase, accuracy, level, timestamp</li>
            <li>Confirms identical data appears in <code>__RESULT__</code></li>
            <li>Verifies immutable proof receipt generation (hash + timestamp)</li>
          </ul>

          <h2>4. Result Classification</h2>
          <table>
            <thead>
              <tr>
                <th>Outcome</th>
                <th>Condition</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>🟢 Passed</td>
                <td>All 8 checks = true</td>
                <td>"Approve for Publish" unlocks</td>
              </tr>
              <tr>
                <td>🟡 Needs Review</td>
                <td>Minor UI / accessibility warnings</td>
                <td>Flag for manual QA</td>
              </tr>
              <tr>
                <td>🔴 Failed</td>
                <td>Any critical check fails</td>
                <td>Must fix and re-test</td>
              </tr>
            </tbody>
          </table>

          <h2>5. Alignment with C-BEN Framework</h2>
          <p>Each automatic check maps to C-BEN's Quality Framework hallmarks:</p>
          <table>
            <thead>
              <tr>
                <th>C-BEN Quality Principle</th>
                <th>PlayOps Validator Testing Mapping</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Authentic Assessment</td>
                <td>Action Cue & Mechanic Alignment (Check 5)</td>
              </tr>
              <tr>
                <td>Observable Performance</td>
                <td>Proof Emission & Telemetry (Check 8)</td>
              </tr>
              <tr>
                <td>Clear Criteria</td>
                <td>Scoring Formula Verification (Check 6)</td>
              </tr>
              <tr>
                <td>Reliable Measurement</td>
                <td>Embedded Configuration Objects (Check 4)</td>
              </tr>
              <tr>
                <td>Transparency of Evidence</td>
                <td>Immutable Proof Receipts + Results Screen</td>
              </tr>
              <tr>
                <td>Equity & Accessibility</td>
                <td>Accessibility Checks (Check 7)</td>
              </tr>
              <tr>
                <td>Continuous Improvement</td>
                <td>QA logs feeding training data for AI generator</td>
              </tr>
            </tbody>
          </table>

          <h2>6. Developer Reference</h2>
          <h3>Telegram Initialization</h3>
          <pre><code>{`if (window.Telegram && window.Telegram.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();
}`}</code></pre>

          <h3>Mandatory Globals</h3>
          <pre><code>{`window.__CONFIG__ = {...};
window.__GOLD_KEY__ = {...};
window.__EDGE__ = {...};
window.__RESULT__ = {...};
window.__PROOF__ = {...};`}</code></pre>

          <h3>Proof Emission</h3>
          <pre><code>{`fetch('/api/validator-proof', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify(window.__RESULT__)
});`}</code></pre>

          <h2>7. Governance & Versioning</h2>
          <ul>
            <li><strong>Maintained by:</strong> Platform Architecture Team</li>
            <li><strong>Next Review:</strong> January 2026</li>
            <li><strong>Related Docs:</strong> Base Layer 1 (v3.1) · AI Generation Prompt (v3.1) · Platform Flows (v3.1)</li>
          </ul>
          
          <p className="mt-8"><strong>Happy Testing! 🎮</strong></p>
          <p>Remember: Quality validators = Better skills assessment = Stronger talent pipelines</p>
        </div>
      </div>
    </div>
  );
};

export default TestingGuide;
