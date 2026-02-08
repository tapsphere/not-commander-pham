# VALIDATOR TESTING v3.2

## Automated Quality & C-BEN Alignment Framework

**Last Updated:** February 2026 — C-BEN Dual Framework Synced  
**Supersedes:** VALIDATOR_TESTING_v3.1.md

---

## 1. Purpose

To ensure every validator mini-game is playable, measurable, and C-BEN compliant before publication.

This framework validates both **technical integrity** (Triple-Gate scoring, 60Hz telemetry) and **competency proof accuracy** (6-Scene Rule, Master DNA alignment).

A validator may be published **only when all checks pass**.

---

## 2. Scope

Applies to all validators—AI-generated or custom-uploaded—before they can be marked `Publish = True`.

Each validator must:
- Follow BASE LAYER 1 v3.2 scene and scoring architecture
- Include all embedded global objects (`__CONFIG__`, `__GOLD_KEY__`, `__EDGE__`, `__TELEMETRY__`, `__RESULT__`, `__PROOF__`)
- Implement Triple-Gate scoring (Accuracy + Time + Jitter)
- Support 60Hz biometric telemetry capture
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
- 30-second timer visible during gameplay

### ✅ Check 3 — Telegram Mini-App Compliance

- Contains `window.Telegram.WebApp.ready()` and `expand()`
- Script import: `telegram-web-app.js`
- Haptic feedback on interactions
- Game runs seamlessly in Telegram WebApp frame
- No network calls outside approved endpoints

### ✅ Check 4 — Embedded Configuration Objects

Verifies presence and validity of required globals:

| Object | Purpose | v3.2 New Fields |
|--------|---------|-----------------|
| `__CONFIG__` | Scene config, competency, brand | `action_cue`, `game_mechanic`, `mobile_interaction` |
| `__GOLD_KEY__` | Correct answers, thresholds | `jitter_threshold` |
| `__EDGE__` | Edge-case trigger + recovery | (unchanged) |
| `__TELEMETRY__` | **NEW** 60Hz coordinate capture | `samples[]`, `jitter_score`, `sampling_rate_hz` |
| `__RESULT__` | Per-scene result | `gate_1_accuracy`, `gate_2_time`, `gate_3_jitter` |
| `__PROOF__` | Immutable proof receipt | `scene_results[]`, `competency_rollup`, `telemetry_hash` |

### ✅ Check 5 — Action Cue & Master DNA Alignment

**Critical v3.2 Check:** Verifies data integrity against Master DNA spreadsheet.

| Validation | Source | Requirement |
|------------|--------|-------------|
| Action Cue | Column K | Exact text match: Verb + Object + Condition |
| Game Mechanic | Column L | Maps to approved component |
| Mobile Interaction | Column M | Enables correct telemetry capture |
| Scoring Formula | Column N | Triple-Gate parameters valid |

**Error Conditions:**
- ❌ Action Cue missing → "Data Integrity Error: Column K empty"
- ❌ Mechanic mismatch → "Component does not match Column L"
- ❌ Interaction unsupported → "Mobile Interaction not in approved list"

### ✅ Check 6 — Triple-Gate Scoring Verification

**DELETED:** Old v3.1 accuracy threshold checks (85%, 90%, 95%)

**NEW v3.2:** Runs 3 auto-plays (poor / average / excellent) and verifies:

| Gate | Test | Pass Condition |
|------|------|----------------|
| **Gate 1** | Accuracy | Correct action performed |
| **Gate 2** | Time | Completed within 30s Safety Gate |
| **Gate 3** | Jitter | `jitter_score >= 0.7` (stability threshold) |

**Level Assignment:**

| Scenario | Expected Level |
|----------|----------------|
| All gates pass, first attempt | Level 3 (Mastery) |
| Gate 1+2 pass, Gate 3 marginal | Level 2 (Proficient) |
| Any gate fails | Level 1 (Needs Work) |

### ✅ Check 7 — 6-Scene Roll-Up Logic

**NEW v3.2:** Verifies competency roll-up implements the 6-Scene Rule:

| Competency Result | Required Scenes |
|-------------------|-----------------|
| **Mastery** (Cyber Yellow) | 6/6 at Level 3 (first attempt) |
| **Proficient** (Green) | 4-5/6 at Level 2+ |
| **Needs Work** (Red) | Any at Level 1 |

**Validation:**
- ✓ Exactly 6 sub-competency scenes
- ✓ Each scene produces independent Level 1/2/3
- ✓ Roll-up computed only after all 6 complete
- ✓ No averaging or blending of scores

### ✅ Check 8 — 60Hz Telemetry Verification

**NEW v3.2:** Validates biometric telemetry capture is functional.

**Requirements:**
- `window.__TELEMETRY__` object defined
- `sampling_rate_hz` equals 60
- `samples` array populated with (t, x, y, pressure) tuples
- `jitter_score` computed and between 0-1
- Telemetry captures during interaction (not just on complete)

**Jitter Measurement by Mechanic:**

| Mobile Interaction | Jitter Type Measured |
|-------------------|---------------------|
| Continuous Scrub | Velocity Consistency |
| Drag-to-Connect | Targeting Precision |
| Drag & Drop | Path Deviation |
| Slider Adjust | Fine Motor Control |
| Drag-to-Select | X/Y Stability |
| Quick Tap | Decision Latency (no jitter) |

### ✅ Check 9 — Accessibility & Mobile Readiness

- `aria-label` present for all interactive items
- Keyboard navigation (Enter/Space) works
- Screen-reader headings h1→h3 hierarchy valid
- Contrast ratio ≥ 4.5:1
- Touch pointer tracking at 60Hz
- Works at 375px minimum width

### ✅ Check 10 — Proof Emission & Telemetry Hash

**Updated v3.2:** Validates complete proof receipt structure.

**Required Payload to `/api/validator-proof`:**

```json
{
  "timestamp": 1707408000000,
  "competency_id": "analytical_thinking",
  "scene_results": [
    { "scene": 1, "level": 3, "gate_1": true, "gate_2": true, "gate_3": true },
    { "scene": 2, "level": 2, "gate_1": true, "gate_2": true, "gate_3": false },
    // ... scenes 3-6
  ],
  "competency_rollup": "proficient",
  "total_xp": 480,
  "first_attempt_count": 4,
  "telemetry_hash": "sha256:abc123..."
}
```

**Validation:**
- ✓ All 6 scene results included
- ✓ `competency_rollup` matches 6-Scene Rule
- ✓ `telemetry_hash` is valid SHA-256 of `__TELEMETRY__` data
- ✓ Identical data in `window.__PROOF__`

---

## 4. Result Classification

| Outcome | Condition | Action |
|---------|-----------|--------|
| 🟢 **Passed** | All 10 checks = true | "Approve for Publish" unlocks |
| 🟡 **Needs Review** | Minor UI/accessibility warnings | Flag for manual QA |
| 🔴 **Failed** | Any critical check fails | Must fix and re-test |

### Critical Checks (Fail = Block Publish)

- Check 4: Missing `__TELEMETRY__` object
- Check 5: Action Cue doesn't match Column K
- Check 6: Triple-Gate logic not implemented
- Check 7: 6-Scene Rule not enforced
- Check 8: 60Hz telemetry not functional
- Check 10: Proof receipt missing scene_results

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
    v32Checks.hasTripleGate &&
    v32Checks.has6Scenes &&
    v32Checks.actionCueMatchesColumnK
  );
}, [overallStatus, v32Checks]);

return (
  <div>
    {canPublish ? (
      <Button onClick={handlePublish}>Approve & Publish</Button>
    ) : (
      <div className="publish-locked">
        <Lock className="h-4 w-4" />
        <span>Complete all v3.2 checks to unlock</span>
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
- ✔ Gate 2 (Time) enforces 30s Safety Gate
- ✔ Gate 3 (Jitter) uses 60Hz telemetry
- ✔ Level 1/2/3 assigned per scene

### 6-Scene Rule
- ✔ All 6 scenes complete before roll-up
- ✔ 6/6 Level 3 = Mastery (Cyber Yellow)
- ✔ 4-5/6 Level 2+ = Proficient (Green)
- ✔ Any Level 1 = Needs Work (Red)

### Biometric Telemetry
- ✔ `window.__TELEMETRY__` defined
- ✔ 60Hz sampling rate verified
- ✔ Jitter score computed (0-1)
- ✔ Telemetry hash in proof receipt

### Mode Integrity
- ✔ Training + Testing modes generated
- ✔ Testing Mode produces Proof Receipt
- ✔ Proof includes all scene_results

---

## 7. Alignment with C-BEN Framework

Each automatic check maps to C-BEN's Quality Framework hallmarks:

| C-BEN Quality Principle | PlayOps v3.2 Testing Mapping |
|------------------------|------------------------------|
| Authentic Assessment | Action Cue & Master DNA Alignment (Check 5) |
| Observable Performance | 60Hz Telemetry Verification (Check 8) |
| Clear Criteria | Triple-Gate Scoring (Check 6) |
| Reliable Measurement | 6-Scene Roll-Up Logic (Check 7) |
| Transparency of Evidence | Proof Emission & Telemetry Hash (Check 10) |
| Equity & Accessibility | Accessibility Checks (Check 9) |
| Continuous Improvement | QA logs feeding training data |
| Consistent Demonstration | 6/6 Mastery requires all first-attempt passes |

---

## 8. Developer Reference (v3.2 Snippets)

### Telegram Initialization
```javascript
if (window.Telegram && window.Telegram.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();
}
```

### Mandatory Globals (v3.2)
```javascript
window.__CONFIG__ = {
  competency_id: "...",
  action_cue: "Select the optimal resource allocation within 30 seconds",
  game_mechanic: "Decision Tree",
  mobile_interaction: "Quick Tap",
  time_limit: 30
};

window.__GOLD_KEY__ = {
  correct_action: "option_a",
  jitter_threshold: 0.3
};

window.__EDGE__ = { /* optional */ };

window.__TELEMETRY__ = {
  scene: 1,
  samples: [], // Populated during gameplay
  jitter_score: 0,
  sampling_rate_hz: 60
};

window.__RESULT__ = {
  scene: 1,
  level: 3,
  gate_1_accuracy: true,
  gate_2_time: true,
  gate_3_jitter: true,
  jitter_score: 0.85
};

window.__PROOF__ = {
  scene_results: [/* array of 6 */],
  competency_rollup: "mastery",
  telemetry_hash: "sha256:..."
};
```

### 60Hz Telemetry Capture
```javascript
let samples = [];
let lastFrame = 0;

function captureFrame(event) {
  const now = performance.now();
  if (now - lastFrame >= 16.67) { // 60 FPS
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

### Triple-Gate Evaluation
```javascript
function evaluateTripleGate(gates, firstAttempt) {
  if (gates.accuracy && gates.time && gates.jitter && firstAttempt) {
    return 3; // Mastery
  }
  if (gates.accuracy && gates.time) {
    return 2; // Proficient
  }
  return 1; // Needs Work
}
```

### 6-Scene Roll-Up
```javascript
function calculateRollup(sceneResults) {
  const level3Count = sceneResults.filter(r => r.level === 3).length;
  const level2PlusCount = sceneResults.filter(r => r.level >= 2).length;
  
  if (level3Count === 6) return 'mastery';
  if (level2PlusCount >= 4) return 'proficient';
  return 'needs_work';
}
```

---

## 9. Outputs & Storage

- Pass/fail summary stored in `validator_test_results` table
- Full QA log (JSON) archived for audit
- Telemetry hash verified against proof receipt
- v3.2 check results stored in `v3_2_check_results` column

---

## 10. Governance & Versioning

- **Maintained by:** Platform Architecture Team
- **Framework Version:** C-BEN → PlayOps Dual Framework (Feb 2026)
- **Next Review:** August 2026
- **Related Docs:** BASE LAYER 1 (v3.2) · Implementation Guide (v3.2)

---

## Version History

### v3.2 (Current — C-BEN Aligned)
- **BREAKING:** Replaced 8 checks with 10 checks
- **NEW:** Check 5 validates against Master DNA Columns K-N
- **NEW:** Check 6 uses Triple-Gate (replaces accuracy thresholds)
- **NEW:** Check 7 validates 6-Scene Roll-Up Rule
- **NEW:** Check 8 verifies 60Hz telemetry functional
- **UPDATED:** Check 10 requires telemetry_hash in proof

### v3.1
- 8 automated checks
- 90%/60% accuracy thresholds
- Basic proof emission

### v3.0
- Initial automated testing pipeline
- Manual three-phase QA replaced
