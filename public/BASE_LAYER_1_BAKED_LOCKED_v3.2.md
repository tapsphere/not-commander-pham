# BASE LAYER 1 = BAKED & LOCKED (v3.2)

## Biometric Science Standard — 60Hz Telemetry Aligned

**Last Updated:** February 2026  
**Supersedes:** v3.1

This document defines the non-negotiable structure for all validator mini-games. These requirements are LOCKED and must be followed exactly to ensure compliance with C-BEN competency standards, Triple-Gate scoring, 60Hz biometric telemetry, and mobile optimization.

---

## 1. SCENE STRUCTURE (NON-NEGOTIABLE)

### Atomic Measurement Rule

Each sub-competency is the **atomic unit of measurement**. One sub-competency = one validator scene. Validators are not averaged, blended, or subjectively interpreted—they are black-and-white records of action.

### 6-Scene Validator Structure

Each competency consists of **exactly 6 sub-competency scenes** mapped from the Master DNA spreadsheet:

| Scene | Content Source | Duration | Time Gate |
|-------|----------------|----------|-----------|
| Scene 0 | Intro Screen | N/A | N/A |
| Scene 1 | Sub-Competency Row 1 | Dynamic | 30/45/60s |
| Scene 2 | Sub-Competency Row 2 | Dynamic | 30/45/60s |
| Scene 3 | Sub-Competency Row 3 | Dynamic | 30/45/60s |
| Scene 4 | Sub-Competency Row 4 | Dynamic | 30/45/60s |
| Scene 5 | Sub-Competency Row 5 | Dynamic | 30/45/60s |
| Scene 6 | Sub-Competency Row 6 | Dynamic | 30/45/60s |
| Final | Results Screen | N/A | N/A |

### Scene 0: Intro Screen

**Purpose:** Set context and prepare player

**Required elements:**
- Competency name (large, prominent heading)
- Sub-competency being measured (smaller subheading)
- Brief description (2-3 sentences max)
- Game instructions (bullet points preferred)
- "Start Game" button (minimum 48px tall, full-width on mobile)
- Brand logo in top-left corner
- Avatar/mascot visible if configured

**UI Requirements:**
- Must be scrollable if content exceeds viewport
- Start button must remain visible (sticky footer recommended)
- No auto-start or countdown timers
- Must call `Telegram.WebApp.HapticFeedback` on button press

### Scene 1-6: Sub-Competency Validator Scenes

**Purpose:** Each scene tests one atomic sub-competency with real-time 60Hz telemetry

**Required elements:**
- Clear prompt derived from **Column K: Action Cue** (Verb + Object + Condition)
- Interactive mechanic from **Column L: Game Mechanic**
- Mobile interaction from **Column M: 60Hz Interaction**
- Scoring logic from **Column N: Scoring Formula**
- Dynamic timer (30s/45s/60s from DNA Sheet)
- Progress indicator showing scene X of 6

**Data Mapping (Master DNA Columns K-N):**

| Column | Field | Description |
|--------|-------|-------------|
| K | Action Cue | The specific observable behavior: Verb + Object + Condition |
| L | Game Mechanic | The interactive structure (10 Approved Mechanics) |
| M | 60Hz Interaction | The touch-event used to gather biometric telemetry |
| N | Scoring Formula | Triple-Gate logic (Accuracy + Time + Jitter) |

### Final: Results Screen

**Purpose:** Performance feedback and XP award

**Required elements:**
- Performance level badge (visual + text)
- XP earned (large number, color-coded)
- Time taken (formatted as MM:SS)
- 6-Scene summary (showing Level 1/2/3 for each)
- Competency roll-up status (Mastery/Proficient/Needs Work)
- "Play Again" button
- "Return to Dashboard" button

---

## 2. TRIPLE-GATE SCORING SYSTEM (v3.2 BIOMETRIC)

**DELETED:** All v3.1 "90%/60% accuracy" rules are superseded by the Biometric Triple-Gate system.

### The Three Gates

Every scene must pass **all three gates** for Level 3 (Mastery):

| Gate | Name | Requirement | Measurement |
|------|------|-------------|-------------|
| **Gate 1** | Accuracy | Correct action selected/performed | Binary pass/fail |
| **Gate 2** | Time | Complete within Dynamic Scene Limit (30/45/60s) | Pulled from DNA Sheet |
| **Gate 3** | Stability | 60Hz telemetry shows steady motor control | Jitter standard deviation |

### First Attempt Rule (CRITICAL)

**Level 3 (Mastery) is ONLY available on the First Attempt.**

- Any retry caps the result at Level 2 maximum
- Any hint usage caps the result at Level 2 maximum
- System tracks `first_attempt: boolean` per scene

### Performance Levels

| Level | Label | Triple-Gate Requirement | XP (per scene) |
|-------|-------|-------------------------|----------------|
| **3** | Mastery | Gate 1 ✓ + Gate 2 ✓ + Gate 3 ✓ (First Attempt) | 500 |
| **2** | Proficient | Gate 1 ✓ + Gate 2 ✓ + Gate 3 marginal OR Retry/Hint used | 250 |
| **1** | Needs Work | Failed Gate 1 OR Gate 2 OR Gate 3 critical failure | 100 |

### Competency Roll-Up Logic (6-Scene Rule)

Competency-level proficiency is determined **only after all 6 sub-competency validators are completed**:

| Result | Badge Color | Requirement |
|--------|-------------|-------------|
| **Mastery** | Cyber Yellow | 6/6 scenes cleared at Level 3 (First Attempt) |
| **Proficient** | Green | 4-5/6 scenes cleared at Level 2+ |
| **Needs Work** | Red | Any scene at Level 1 OR <4 scenes at Level 2+ |

### Dynamic Time Gates

Time limits are pulled from the DNA Sheet and vary by mechanic complexity:

- **30 seconds:** Quick decisions (Quick Tap, Toggle)
- **45 seconds:** Moderate complexity (Slider, Multi-Tap)
- **60 seconds:** Complex interactions (Continuous Scrub, Drag-to-Connect)

---

## 3. BIOMETRIC TELEMETRY (v3.2 MANDATORY — 60Hz)

### The 60Hz Telemetry Loop

All validators **must** capture touch/pointer coordinates at 60 frames per second using the `[x, y, timestamp]` format:

```typescript
// ============================================
// BIOMETRIC TELEMETRY CAPTURE — 60Hz LOOP
// ============================================

interface TelemetryPoint {
  x: number;     // X coordinate (normalized 0-1)
  y: number;     // Y coordinate (normalized 0-1)
  t: number;     // Unix timestamp in milliseconds
  pressure?: number; // Touch pressure (0-1) if available
}

class BiometricCapture {
  private points: TelemetryPoint[] = [];
  private isCapturing = false;
  private lastCaptureTime = 0;
  private readonly SAMPLE_INTERVAL_MS = 16.67; // ~60Hz (1000ms / 60fps)
  
  startCapture(): void {
    this.isCapturing = true;
    this.points = [];
    this.lastCaptureTime = 0;
  }
  
  stopCapture(): TelemetryPoint[] {
    this.isCapturing = false;
    return [...this.points];
  }
  
  capturePoint(e: PointerEvent, containerRect: DOMRect): void {
    if (!this.isCapturing) return;
    
    const now = performance.now();
    
    // Throttle to 60Hz
    if (now - this.lastCaptureTime < this.SAMPLE_INTERVAL_MS) {
      return;
    }
    
    this.lastCaptureTime = now;
    
    // Capture normalized coordinates relative to container
    const x = (e.clientX - containerRect.left) / containerRect.width;
    const y = (e.clientY - containerRect.top) / containerRect.height;
    const t = Date.now();
    
    this.points.push({ x, y, t, pressure: e.pressure || 0.5 });
  }
}
```

### window.__TELEMETRY__ (Required Object)

```javascript
window.__TELEMETRY__ = {
  scene: number,
  samples: [
    { 
      t: number,      // timestamp (ms since scene start)
      x: number,      // x coordinate (0-1 normalized)
      y: number,      // y coordinate (0-1 normalized)
      pressure: number // touch pressure (0-1) if available
    }
  ],
  jitter_score: number,      // computed stability (0-1, higher = more stable)
  jitter_variance: number,   // raw variance value
  jitter_stddev: number,     // standard deviation of deltas
  velocity_avg: number,      // average movement velocity
  path_deviation: number,    // deviation from optimal path
  hesitation_count: number,  // number of pauses > 200ms
  sampling_rate_hz: 60       // Must be 60
}
```

### Jitter/Stability Formula

Calculates **Standard Deviation** of movement deltas to determine hand stability:

```typescript
// ============================================
// JITTER ANALYSIS — VARIANCE & STANDARD DEVIATION
// ============================================

interface JitterAnalysis {
  xVariance: number;      // Variance of X-axis deltas
  yVariance: number;      // Variance of Y-axis deltas
  xStdDev: number;        // Standard deviation of X-axis
  yStdDev: number;        // Standard deviation of Y-axis
  combinedStdDev: number; // Combined jitter (Euclidean)
  stabilityScore: number; // 0-100 (100 = perfectly stable)
}

function analyzeJitter(points: TelemetryPoint[]): JitterAnalysis {
  if (points.length < 3) {
    return { xVariance: 0, yVariance: 0, xStdDev: 0, yStdDev: 0, combinedStdDev: 0, stabilityScore: 100 };
  }
  
  // Calculate deltas between consecutive points
  const deltaX: number[] = [];
  const deltaY: number[] = [];
  
  for (let i = 1; i < points.length; i++) {
    deltaX.push(points[i].x - points[i - 1].x);
    deltaY.push(points[i].y - points[i - 1].y);
  }
  
  // Calculate mean of deltas
  const meanX = deltaX.reduce((a, b) => a + b, 0) / deltaX.length;
  const meanY = deltaY.reduce((a, b) => a + b, 0) / deltaY.length;
  
  // Calculate variance: Σ(Δ - mean)² / n
  const varianceX = deltaX.reduce((sum, d) => sum + Math.pow(d - meanX, 2), 0) / deltaX.length;
  const varianceY = deltaY.reduce((sum, d) => sum + Math.pow(d - meanY, 2), 0) / deltaY.length;
  
  // Standard deviation = √variance
  const stdDevX = Math.sqrt(varianceX);
  const stdDevY = Math.sqrt(varianceY);
  
  // Combined standard deviation (Euclidean)
  const combinedStdDev = Math.sqrt(stdDevX * stdDevX + stdDevY * stdDevY);
  
  // Stability score: exponential decay (k = 0.15)
  const stabilityScore = Math.max(0, Math.min(100, Math.round(100 * Math.exp(-0.15 * combinedStdDev))));
  
  return { xVariance: varianceX, yVariance: varianceY, xStdDev: stdDevX, yStdDev: stdDevY, combinedStdDev, stabilityScore };
}
```

### Stability Classification

| Stability Score | Classification | Gate 3 Result |
|-----------------|----------------|---------------|
| 90-100 | Elite | ✓ Pass |
| 70-89 | Stable | ✓ Pass |
| 50-69 | Moderate | ⚠ Marginal (Level 2 cap) |
| 0-49 | Unstable | ✗ Fail |

### Jitter Stress Test

The validator testing system performs a **Jitter Stress Test**:
- Simulates shaky input (high variance pointer movements)
- Verifies the engine blocks Mastery
- Confirms score is capped at Level 2 even with perfect accuracy

### Jitter Measurement by Mechanic

| C-BEN Family | PlayOps Mechanic | Mobile Interaction | Jitter Measurement |
|--------------|------------------|-------------------|-------------------|
| Scenario Simulation | Decision Tree | Quick Tap | Decision Latency |
| Case Analysis | Data Panel | Multi-Tap | Scan Speed |
| Data Analysis | Noise Filter | Continuous Scrub | Velocity Consistency |
| Collaboration | Alignment Puzzle | Drag-to-Connect | Targeting Precision |
| Performance Demo | Sequence Validator | Drag & Drop | Path Deviation |
| Project Artifact | Constraint Puzzle | Slider Adjust | Fine Motor Control |
| Portfolio/Timeline | Pattern Grid | Drag-to-Select | X/Y Stability |
| Communication | Headline Picker | Quick Tap | Output Selection |
| Technical Research | Diagnostic Panel | Multi-Touch | Rhythmic Jitter |
| Strategic Viability | Trade-Off Eval | Toggle/Slide | Hesitation Jitter |

### Motion Interaction Priority

For competencies requiring motor-control validation:
- **PREFER:** Drag, Scrub, Slide, Hold (enables high-frequency tracking)
- **AVOID:** Quick Tap (only measures decision latency, not jitter)

---

## 4. WINDOW OBJECTS (v3.2 BIOMETRIC UPDATED)

### window.__CONFIG__

```javascript
window.__CONFIG__ = {
  competency_id: string,
  subcompetency_id: string,
  scene_number: number,          // 1-6
  mode: "training" | "testing",
  avatar_url: string | null,
  particle_effect: "confetti" | "sparkles" | "none",
  brand_name: string,
  time_limit: 30 | 45 | 60,      // Dynamic from DNA Sheet
  action_cue: string,            // From Column K
  game_mechanic: string,         // From Column L
  mobile_interaction: string,    // From Column M
  scoring_formula: string        // From Column N
}
```

### window.__GOLD_KEY__

```javascript
window.__GOLD_KEY__ = {
  correct_action: any,           // Expected correct value/selection
  optimal_path: Array<{action: string, value: any}>,
  optimal_time: number,          // Target time in ms
  jitter_threshold: 0.70,        // Minimum stability score (0-1)
  acceptable_variations: Array<Array<string>>
}
```

### window.__EDGE__

```javascript
window.__EDGE__ = {
  enabled: boolean,
  scenario: string,
  expected_behavior: string,
  trigger_condition: string,
  scoring_impact: number         // 0-0.2 (max 20% impact)
}
```

### window.__TELEMETRY__ (MANDATORY in v3.2)

```javascript
window.__TELEMETRY__ = {
  scene: number,
  samples: Array<{t: number, x: number, y: number, pressure: number}>,
  jitter_score: number,          // 0-1 (higher = more stable)
  jitter_variance: number,       // Raw variance
  jitter_stddev: number,         // Standard deviation
  velocity_avg: number,
  path_deviation: number,
  hesitation_count: number,
  sampling_rate_hz: 60           // Must be 60
}
```

### window.__RESULT__

```javascript
window.__RESULT__ = {
  scene: number,
  level: 1 | 2 | 3,
  level_label: "needs_work" | "proficient" | "mastery",
  xp: 100 | 250 | 500,
  time_ms: number,
  gate_1_accuracy: boolean,
  gate_2_time: boolean,
  gate_3_jitter: boolean,
  jitter_score: number,
  jitter_stddev: number,
  competency_id: string,
  subcompetency_id: string,
  timestamp: number,
  mode: "training" | "testing",
  first_attempt: boolean
}
```

### window.__PROOF__

```javascript
window.__PROOF__ = {
  timestamp: number,
  scene_results: Array<{
    scene: number,
    level: 1 | 2 | 3,
    gate_1: boolean,
    gate_2: boolean,
    gate_3: boolean,
    time_ms: number,
    jitter_score: number,
    jitter_stddev: number,
    first_attempt: boolean
  }>,
  competency_rollup: "mastery" | "proficient" | "needs_work",
  total_xp: number,
  first_attempt_count: number,   // How many L3 on first try
  telemetry_samples: Array<{t, x, y, pressure}>, // Raw 60Hz log
  telemetry_hash: string         // SHA-256 hash of telemetry data
}
```

---

## 5. MOBILE & RESPONSIVE REQUIREMENTS

### Touch Targets
- Minimum size: 48px × 48px
- Spacing: 8px minimum between interactive elements
- Buttons: Full-width on screens <640px

### Viewport
- Design for 375px width minimum
- Use 100vh for full-screen scenes
- No horizontal scrolling allowed

### Gestures
- Support touch, mouse, and keyboard input
- Haptic feedback on all interactions (mobile)
- Smooth transitions between scenes
- **60Hz pointer tracking enabled**

---

## 6. ACCESSIBILITY (WCAG 2.1 Level AA)

### Keyboard Navigation
- Tab order must be logical
- All interactive elements must have tabIndex
- Enter/Space to activate buttons
- ESC to close modals
- Arrow keys for sliders and selectable lists

### Focus Indicators
- Visible outline on focus (minimum 2px)
- Color contrast ratio ≥3:1 against background

### Screen Readers
- ARIA labels on all interactive elements
- Semantic HTML throughout
- Status announcements for dynamic changes

### Visual
- Color contrast ratio ≥4.5:1 for normal text
- Do not rely on color alone to convey information

---

## 7. TELEGRAM INTEGRATION

### Required SDK Calls

```javascript
if (window.Telegram && window.Telegram.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();
  
  // Haptic feedback on interactions
  tg.HapticFeedback.impactOccurred('medium');
}
```

### Script Import

```html
<script src="https://telegram.org/js/telegram-web-app.js"></script>
```

---

## 8. SELF-VALIDATION CHECKLIST (v3.2 BIOMETRIC)

### Scene Structure
- ✓ Scene 0 (Intro) present with all required elements
- ✓ Scenes 1-6 each test one sub-competency
- ✓ Each scene pulls Action Cue from Column K
- ✓ Results screen shows 6-scene summary and roll-up

### Triple-Gate Scoring
- ✓ Gate 1 (Accuracy) evaluated per scene
- ✓ Gate 2 (Time) enforces Dynamic Limit from DNA Sheet
- ✓ Gate 3 (Jitter) uses 60Hz telemetry data
- ✓ First Attempt Rule enforced (Level 3 blocked on retry)
- ✓ 6-Scene Rule applied for competency roll-up

### Biometric Telemetry (60Hz)
- ✓ `window.__TELEMETRY__` captures 60Hz coordinates
- ✓ Samples include (t, x, y, pressure) at 16.67ms intervals
- ✓ Jitter variance computed from delta standard deviation
- ✓ Stability score (0-1) derived from jitter analysis
- ✓ Telemetry hash included in proof receipt

### Window Objects
- ✓ `__CONFIG__` includes action_cue, game_mechanic, mobile_interaction
- ✓ `__GOLD_KEY__` includes jitter_threshold
- ✓ `__TELEMETRY__` populated with 60Hz samples
- ✓ `__RESULT__` includes gate_1, gate_2, gate_3 booleans
- ✓ `__PROOF__` includes scene_results array, rollup, and telemetry_hash

### Mobile & Touch
- ✓ All touch targets ≥48px
- ✓ 60Hz pointer tracking functional
- ✓ No horizontal scrolling

### Accessibility
- ✓ Keyboard navigation works
- ✓ ARIA labels present
- ✓ WCAG 2.1 AA contrast ratios

### Telegram
- ✓ `Telegram.WebApp.ready()` called
- ✓ `Telegram.WebApp.expand()` called
- ✓ Haptic feedback on interactions

---

## 9. VERSION HISTORY

### v3.2 (Current — Biometric Science Standard)
- **BREAKING:** Replaced 90%/60% accuracy with Triple-Gate system
- **NEW:** Added mandatory 60Hz telemetry capture (`window.__TELEMETRY__`)
- **NEW:** Implemented jitter variance calculation (standard deviation formula)
- **NEW:** Added First Attempt Rule (Level 3 blocked on retry)
- **NEW:** Dynamic Time Gates (30/45/60s from DNA Sheet)
- **NEW:** Jitter Stress Test for validation
- **NEW:** Mapped to Master DNA Columns K-N with 60Hz Interaction (Col M)
- **UPDATED:** XP values to 500/250/100 per scene
- **UPDATED:** Enforced 6-Scene Rule for competency roll-up

### v3.1
- Updated scoring thresholds to 90%/60%
- Added `__PROOF__` object requirement
- Added time formulas (Tlimit, Ttight)

### v3.0
- Introduced locked scoring system
- Added Telegram integration requirements
- Defined mandatory scene structure

---

## 10. COMPLIANCE STATEMENT

All PlayOps validators derive from C-BEN-recognized assessment methods. Each validator maps 1:1 to an authentic assessment family and captures evidence through interactive simulation with 60Hz biometric telemetry.

**THE CORE LOCKED ARCHITECTURE CANNOT BE OVERRIDDEN. PERIOD.**

This v3.2 specification defines the production-ready foundation aligned with the Biometric Science Standard. All games must pass the Triple-Gate, emit required window objects, and capture 60Hz telemetry with jitter analysis.
