# VALIDATOR TESTING v3.2

## Biometric Science Standard — Automated Quality Framework

**Last Updated:** February 2026 — Biometric 60Hz Standard  
**Supersedes:** VALIDATOR_TESTING_v3.1.md

---

## 1. Purpose

To ensure every validator mini-game is playable, measurable, and C-BEN compliant before publication with **60Hz biometric telemetry validation**.

This framework validates both **technical integrity** (Triple-Gate scoring, 60Hz telemetry, jitter analysis) and **competency proof accuracy** (6-Scene Rule, Master DNA alignment).

A validator may be published **only when all checks pass**.

---

## 2. Scope

Applies to all validators—AI-generated or custom-uploaded—before they can be marked `Publish = True`.

Each validator must:
- Follow BASE LAYER 1 v3.2 Biometric Standard
- Include all embedded global objects (`__CONFIG__`, `__GOLD_KEY__`, `__EDGE__`, `__TELEMETRY__`, `__RESULT__`, `__PROOF__`)
- Implement Triple-Gate scoring (Accuracy + Time + Jitter)
- Support 60Hz biometric telemetry capture
- Enforce First Attempt Rule for Level 3
- Pass 100% of automated checks described below

---

## 3. Automated Testing Pipeline

The system performs **10 sequential checks** every time the creator clicks "Test Validator."

### ✅ Check 1 — Scene Structure Validation

**Validates the 6-Scene structure:**

| Scene | Requirement |
|-------|-------------|
| Scene 0 | Intro screen with competency name, instructions, START button |
| Scene 1-6 | Each tests one sub-competency from Master DNA |
| Final | Results screen with 6-scene breakdown and roll-up |

**Validation Points:**
- No auto-start on load (Scene 0)
- START button present, sticky, full-width, functional
- Each scene has unique `subcompetency_id`
- Total of exactly 6 gameplay scenes

### ✅ Check 2 — UX/UI Integrity

- No vertical scrolling during gameplay (`overflow:hidden`, `height:100vh`)
- No text overlap or clipped content at 390 × 844 viewport
- All buttons clickable and visually respond (active, hover, touched)
- Touch targets ≥ 48px
- START button remains visible on all devices
- Dynamic timer visible during gameplay (30/45/60s from DNA)

### ✅ Check 3 — Telegram Mini-App Compliance

- Contains `window.Telegram.WebApp.ready()` and `expand()`
- Script import: `telegram-web-app.js`
- Haptic feedback on interactions
- Game runs seamlessly in Telegram WebApp frame
- No network calls outside approved endpoints

### ✅ Check 4 — Embedded Configuration Objects (60Hz Telemetry)

Verifies presence and validity of required globals:

| Object | Purpose | v3.2 Required Fields |
|--------|---------|---------------------|
| `__CONFIG__` | Scene config, competency, brand | `action_cue`, `game_mechanic`, `mobile_interaction`, `time_limit` |
| `__GOLD_KEY__` | Correct answers, thresholds | `jitter_threshold` (default 0.70) |
| `__EDGE__` | Edge-case trigger + recovery | (unchanged) |
| `__TELEMETRY__` | **60Hz coordinate capture** | `samples[]`, `jitter_score`, `jitter_stddev`, `sampling_rate_hz: 60` |
| `__RESULT__` | Per-scene result | `gate_1_accuracy`, `gate_2_time`, `gate_3_jitter`, `first_attempt` |
| `__PROOF__` | Immutable proof receipt | `scene_results[]`, `competency_rollup`, `telemetry_hash` |

**Critical v3.2 Check:**
- ✓ `__TELEMETRY__` object is **active** (not just defined)
- ✓ `sampling_rate_hz` equals **60**
- ✓ `jitter_stddev` is computed from standard deviation formula
- ✓ Samples captured at 16.67ms intervals (~60 FPS)

### ✅ Check 5 — Action Cue & Master DNA Alignment

**Critical v3.2 Check:** Verifies data integrity against Master DNA spreadsheet.

| Validation | Source | Requirement |
|------------|--------|-------------|
| Action Cue | Column K | Exact text match: Verb + Object + Condition |
| Game Mechanic | Column L | Maps to approved component |
| 60Hz Interaction | Column M | Enables correct telemetry capture |
| Scoring Formula | Column N | Triple-Gate parameters + dynamic time limit valid |

**Error Conditions:**
- ❌ Action Cue missing → "Data Integrity Error: Column K empty"
- ❌ Mechanic mismatch → "Component does not match Column L"
- ❌ Interaction unsupported → "60Hz Interaction not in approved list"
- ❌ Scoring formula invalid → "Column N Triple-Gate parameters missing"

### ✅ Check 6 — Triple-Gate Scoring Verification

**DELETED:** Old v3.1 accuracy threshold checks (85%, 90%, 95%)

**NEW v3.2:** Runs 3 auto-plays and verifies Triple-Gate logic:

| Gate | Test | Pass Condition |
|------|------|----------------|
| **Gate 1** | Accuracy | Correct action performed |
| **Gate 2** | Time | Completed within Dynamic Scene Limit (30/45/60s) |
| **Gate 3** | Jitter | `jitter_score >= 0.70` (stability threshold) |

**Level Assignment with First Attempt Rule:**

| Scenario | Expected Level |
|----------|----------------|
| All gates pass + first attempt | Level 3 (Mastery) |
| All gates pass + retry used | Level 2 (Proficient) - Capped |
| Gate 1+2 pass, Gate 3 marginal | Level 2 (Proficient) |
| Any gate fails | Level 1 (Needs Work) |

**Jitter Stress Test (NEW):**
- Simulates shaky input (high variance pointer movements)
- Verifies the engine **blocks Mastery**
- Confirms score is capped at Level 2 even with perfect accuracy
- Tests standard deviation calculation accuracy

### ✅ Check 7 — 6-Scene Roll-Up Logic

**NEW v3.2:** Verifies competency roll-up implements the 6-Scene Rule:

| Competency Result | Required Scenes |
|-------------------|-----------------|
| **Mastery** (Cyber Yellow) | 6/6 at Level 3 (first attempt only) |
| **Proficient** (Green) | 4-5/6 at Level 2+ |
| **Needs Work** (Red) | Any at Level 1 |

**Validation:**
- ✓ Exactly 6 sub-competency scenes
- ✓ Each scene produces independent Level 1/2/3
- ✓ Roll-up computed only after all 6 complete
- ✓ No averaging or blending of scores
- ✓ First Attempt Rule enforced for Level 3

### ✅ Check 8 — 60Hz Telemetry Verification (Biometric)

**NEW v3.2:** Validates biometric telemetry capture is functional.

**Requirements:**
- `window.__TELEMETRY__` object defined and populated
- `sampling_rate_hz` equals **60**
- `samples` array populated with `(t, x, y, pressure)` tuples
- Samples captured at **16.67ms intervals** (1000ms / 60fps)
- `jitter_score` computed from standard deviation formula
- `jitter_stddev` calculated using: `√(Σ(Δ - mean)² / n)`
- Telemetry captures **during interaction** (not just on complete)

**Jitter Measurement by Mechanic:**

| 60Hz Interaction | Jitter Type Measured | Stability Threshold |
|------------------|---------------------|---------------------|
| Continuous Scrub | Velocity Consistency | 0.70 |
| Drag-to-Connect | Targeting Precision | 0.70 |
| Drag & Drop | Path Deviation | 0.65 |
| Slider Adjust | Fine Motor Control | 0.75 |
| Drag-to-Select | X/Y Stability | 0.70 |
| Quick Tap | Decision Latency (no jitter) | N/A |

**Evidence Requirement:**
- ✓ Proof Receipt contains raw 60Hz coordinate log
- ✓ `telemetry_hash` is valid SHA-256 of `__TELEMETRY__` samples

### ✅ Check 9 — Accessibility & Mobile Readiness

- `aria-label` present for all interactive items
- Keyboard navigation (Enter/Space) works
- Screen-reader headings h1→h3 hierarchy valid
- Contrast ratio ≥ 4.5:1
- **60Hz pointer tracking at touch events**
- Works at 375px minimum width
- Touch targets ≥ 48px

### ✅ Check 10 — Proof Emission & Telemetry Hash

**Updated v3.2:** Validates complete proof receipt structure with biometric data.

**Required Payload to `/api/validator-proof`:**

```json
{
  "timestamp": 1707408000000,
  "competency_id": "analytical_thinking",
  "scene_results": [
    { 
      "scene": 1, 
      "level": 3, 
      "gate_1": true, 
      "gate_2": true, 
      "gate_3": true,
      "jitter_score": 0.85,
      "jitter_stddev": 1.23,
      "first_attempt": true
    },
    { 
      "scene": 2, 
      "level": 2, 
      "gate_1": true, 
      "gate_2": true, 
      "gate_3": false,
      "jitter_score": 0.62,
      "jitter_stddev": 4.87,
      "first_attempt": true
    }
    // ... scenes 3-6
  ],
  "competency_rollup": "proficient",
  "total_xp": 2100,
  "first_attempt_count": 5,
  "telemetry_samples": [...],
  "telemetry_hash": "sha256:abc123..."
}
```

**Validation:**
- ✓ All 6 scene results included
- ✓ Each scene has `jitter_score` and `jitter_stddev`
- ✓ `first_attempt` boolean tracked per scene
- ✓ `competency_rollup` matches 6-Scene Rule
- ✓ `telemetry_hash` is valid SHA-256 of raw samples
- ✓ Identical data in `window.__PROOF__`

---

## 4. Result Classification

| Outcome | Condition | Action |
|---------|-----------|--------|
| 🟢 **Passed** | All 10 checks = true | "Approve for Publish" unlocks |
| 🟡 **Needs Review** | Minor UI/accessibility warnings | Flag for manual QA |
| 🔴 **Failed** | Any critical check fails | Must fix and re-test |

### Critical Checks (Fail = Block Publish)

- **Check 4:** Missing `__TELEMETRY__` object OR not at 60Hz
- **Check 5:** Action Cue doesn't match Column K exactly
- **Check 6:** Triple-Gate logic not implemented OR First Attempt Rule missing
- **Check 7:** 6-Scene Rule not enforced
- **Check 8:** 60Hz telemetry not functional OR jitter formula incorrect
- **Check 10:** Proof receipt missing scene_results or telemetry_hash

---

## 5. Hard Lock Logic

The "Approve & Publish" button is protected by a **Hard Lock**:

```typescript
// In ValidatorTestWizard.tsx
const canPublish = useMemo(() => {
  return (
    overallStatus === 'passed' &&
    v32Checks.hasTelemetry &&
    v32Checks.telemetryAt60Hz &&
    v32Checks.hasJitterFormula &&
    v32Checks.hasTripleGate &&
    v32Checks.hasFirstAttemptRule &&
    v32Checks.has6Scenes &&
    v32Checks.actionCueMatchesColumnK &&
    v32Checks.interactionMatchesColumnM
  );
}, [overallStatus, v32Checks]);

return (
  <div>
    {canPublish ? (
      <Button onClick={handlePublish}>Approve & Publish</Button>
    ) : (
      <div className="publish-locked">
        <Lock className="h-4 w-4" />
        <span>Complete all v3.2 Biometric checks to unlock</span>
      </div>
    )}
  </div>
);
```

---

## 6. Validator Design QA Checklist

A validator may be published **only when all checks pass**:

### Structural Alignment
- ✔ C-BEN fields preserved
- ✔ One sub-competency = one validator scene
- ✔ Exactly 6 gameplay scenes per competency
- ✔ Assessment family linked

### Action Cue Integrity
- ✔ Action Cue matches Column K exactly
- ✔ Approved verb only (from C-BEN verb list)
- ✔ No free text inputs
- ✔ Binary outcome per action

### Triple-Gate Scoring
- ✔ Gate 1 (Accuracy) evaluates correct action
- ✔ Gate 2 (Time) enforces Dynamic Limit (30/45/60s)
- ✔ Gate 3 (Jitter) uses 60Hz telemetry standard deviation
- ✔ First Attempt Rule enforced (Level 3 blocked on retry)
- ✔ Level 1/2/3 assigned per scene

### 6-Scene Rule
- ✔ All 6 scenes complete before roll-up
- ✔ 6/6 Level 3 (first attempt) = Mastery (Cyber Yellow)
- ✔ 4-5/6 Level 2+ = Proficient (Green)
- ✔ Any Level 1 = Needs Work (Red)

### Biometric Telemetry (60Hz)
- ✔ `window.__TELEMETRY__` defined and active
- ✔ 60Hz sampling rate verified (16.67ms intervals)
- ✔ `jitter_stddev` computed via: `√(Σ(Δ - mean)² / n)`
- ✔ `jitter_score` derived from stability formula
- ✔ Jitter Stress Test passed (shaky input blocks Mastery)
- ✔ Telemetry hash in proof receipt

### Mode Integrity
- ✔ Training + Testing modes generated
- ✔ Testing Mode produces Proof Receipt
- ✔ Proof includes all scene_results with jitter data

---

## 7. Alignment with C-BEN Framework

Each automatic check maps to C-BEN's Quality Framework hallmarks:

| C-BEN Quality Principle | PlayOps v3.2 Testing Mapping |
|------------------------|------------------------------|
| Authentic Assessment | Action Cue & Master DNA Alignment (Check 5) |
| Observable Performance | 60Hz Telemetry Verification (Check 8) |
| Clear Criteria | Triple-Gate Scoring + First Attempt (Check 6) |
| Reliable Measurement | 6-Scene Roll-Up Logic (Check 7) |
| Transparency of Evidence | Proof Emission & Telemetry Hash (Check 10) |
| Equity & Accessibility | Accessibility Checks (Check 9) |
| Continuous Improvement | QA logs feeding training data |
| Consistent Demonstration | 6/6 Mastery requires all first-attempt passes |
| Motor Control Evidence | Jitter Formula & Stability Score (Check 8) |

---

## 8. Developer Reference (v3.2 Biometric Snippets)

### Telegram Initialization
```javascript
if (window.Telegram && window.Telegram.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();
}
```

### Mandatory Globals (v3.2 Biometric)
```javascript
window.__CONFIG__ = {
  competency_id: "...",
  action_cue: "Select the optimal resource allocation within 30 seconds",
  game_mechanic: "Decision Tree",
  mobile_interaction: "Quick Tap",
  time_limit: 30  // Dynamic from DNA Sheet Column N
};

window.__GOLD_KEY__ = {
  correct_action: "option_a",
  jitter_threshold: 0.70  // Minimum stability for Gate 3
};

window.__EDGE__ = { /* optional */ };

window.__TELEMETRY__ = {
  scene: 1,
  samples: [], // Populated at 60Hz during gameplay
  jitter_score: 0,
  jitter_variance: 0,
  jitter_stddev: 0,
  sampling_rate_hz: 60
};

window.__RESULT__ = {
  scene: 1,
  level: 3,
  gate_1_accuracy: true,
  gate_2_time: true,
  gate_3_jitter: true,
  jitter_score: 0.85,
  jitter_stddev: 1.23,
  first_attempt: true
};

window.__PROOF__ = {
  scene_results: [/* array of 6 with jitter data */],
  competency_rollup: "mastery",
  telemetry_samples: [...],
  telemetry_hash: "sha256:..."
};
```

### 60Hz Telemetry Capture
```javascript
let samples = [];
let lastFrame = 0;
const SAMPLE_INTERVAL_MS = 16.67; // 60 FPS

function captureFrame(event) {
  const now = performance.now();
  if (now - lastFrame >= SAMPLE_INTERVAL_MS) {
    samples.push({
      t: now - sceneStartTime,
      x: event.clientX / window.innerWidth,
      y: event.clientY / window.innerHeight,
      pressure: event.pressure || 0.5
    });
    lastFrame = now;
  }
}

interactionArea.addEventListener('pointermove', captureFrame);
```

### Jitter Analysis (Standard Deviation Formula)
```javascript
function analyzeJitter(points) {
  if (points.length < 3) return { stdDev: 0, stabilityScore: 100 };
  
  // Calculate deltas
  const deltaX = [], deltaY = [];
  for (let i = 1; i < points.length; i++) {
    deltaX.push(points[i].x - points[i - 1].x);
    deltaY.push(points[i].y - points[i - 1].y);
  }
  
  // Mean of deltas
  const meanX = deltaX.reduce((a, b) => a + b, 0) / deltaX.length;
  const meanY = deltaY.reduce((a, b) => a + b, 0) / deltaY.length;
  
  // Variance: Σ(Δ - mean)² / n
  const varX = deltaX.reduce((sum, d) => sum + Math.pow(d - meanX, 2), 0) / deltaX.length;
  const varY = deltaY.reduce((sum, d) => sum + Math.pow(d - meanY, 2), 0) / deltaY.length;
  
  // Standard deviation = √variance
  const stdDevX = Math.sqrt(varX);
  const stdDevY = Math.sqrt(varY);
  const combinedStdDev = Math.sqrt(stdDevX * stdDevX + stdDevY * stdDevY);
  
  // Stability score: exponential decay
  const stabilityScore = Math.round(100 * Math.exp(-0.15 * combinedStdDev));
  
  return { stdDev: combinedStdDev, stabilityScore, jitterScore: stabilityScore / 100 };
}
```

### Triple-Gate Evaluation with First Attempt
```javascript
function evaluateTripleGate(gates, firstAttempt) {
  if (gates.accuracy && gates.time && gates.jitter && firstAttempt) {
    return 3; // Mastery (only on first attempt)
  }
  if (gates.accuracy && gates.time) {
    return 2; // Proficient (Gate 3 marginal OR retry)
  }
  return 1; // Needs Work
}
```

### 6-Scene Roll-Up
```javascript
function calculateRollup(sceneResults) {
  const level3FirstAttempt = sceneResults.filter(r => r.level === 3 && r.firstAttempt).length;
  const level2Plus = sceneResults.filter(r => r.level >= 2).length;
  
  if (level3FirstAttempt === 6) return 'mastery';   // Cyber Yellow
  if (level2Plus >= 4) return 'proficient';          // Green
  return 'needs_work';                               // Red
}
```

---

## 9. Outputs & Storage

- Pass/fail summary stored in `validator_test_results` table
- Full QA log (JSON) archived for audit
- Telemetry hash verified against proof receipt
- v3.2 check results stored in `v3_2_check_results` column
- Raw telemetry samples stored for forensic analysis

---

## 10. Governance & Versioning

- **Maintained by:** Platform Architecture Team
- **Framework Version:** C-BEN → PlayOps Biometric Science Standard (Feb 2026)
- **Next Review:** August 2026
- **Related Docs:** BASE LAYER 1 (v3.2) · Implementation Guide (v3.2)

---

## Version History

### v3.2 (Current — Biometric Science Standard)
- **BREAKING:** Replaced 8 checks with 10 checks
- **NEW:** Check 4 validates 60Hz telemetry active at 16.67ms intervals
- **NEW:** Check 5 validates Column M (60Hz Interaction)
- **NEW:** Check 6 includes First Attempt Rule + Jitter Stress Test
- **NEW:** Check 7 validates 6-Scene Roll-Up with first attempt tracking
- **NEW:** Check 8 verifies jitter formula: `√(Σ(Δ - mean)² / n)`
- **UPDATED:** Check 10 requires jitter_stddev and telemetry_samples in proof
- **UPDATED:** XP values to 500/250/100 per scene
- **UPDATED:** Dynamic Time Gates (30/45/60s from DNA Sheet)

### v3.1
- 8 automated checks
- 90%/60% accuracy thresholds
- Basic proof emission

### v3.0
- Initial automated testing pipeline
- Manual three-phase QA replaced
