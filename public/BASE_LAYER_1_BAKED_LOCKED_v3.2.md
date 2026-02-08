# BASE LAYER 1 = BAKED & LOCKED (v3.2)

## C-BEN → PlayOps Dual Framework Aligned

**Last Updated:** February 2026  
**Supersedes:** v3.1

This document defines the non-negotiable structure for all validator mini-games. These requirements are LOCKED and must be followed exactly to ensure compliance with C-BEN competency standards, Triple-Gate scoring, biometric telemetry, and mobile optimization.

---

## 1. SCENE STRUCTURE (NON-NEGOTIABLE)

### Atomic Measurement Rule

Each sub-competency is the **atomic unit of measurement**. One sub-competency = one validator scene. Validators are not averaged, blended, or subjectively interpreted—they are black-and-white records of action.

### 6-Scene Validator Structure

Each competency consists of **exactly 6 sub-competency scenes** mapped from the Master DNA spreadsheet:

| Scene | Content Source | Duration |
|-------|----------------|----------|
| Scene 0 | Intro Screen | N/A |
| Scene 1 | Sub-Competency Row 1 | 30s max |
| Scene 2 | Sub-Competency Row 2 | 30s max |
| Scene 3 | Sub-Competency Row 3 | 30s max |
| Scene 4 | Sub-Competency Row 4 | 30s max |
| Scene 5 | Sub-Competency Row 5 | 30s max |
| Scene 6 | Sub-Competency Row 6 | 30s max |
| Final | Results Screen | N/A |

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

**Purpose:** Each scene tests one atomic sub-competency with real-time telemetry

**Required elements:**
- Clear prompt derived from **Column K: Action Cue** (Verb + Object + Condition)
- Interactive mechanic from **Column L: Game Mechanic**
- Mobile interaction from **Column M: Mobile Interaction**
- Scoring logic from **Column N: Scoring Formula**
- 30-second timer (Safety Gate)
- Progress indicator showing scene X of 6

**Data Mapping (Master DNA Columns K-N):**

| Column | Field | Description |
|--------|-------|-------------|
| K | Action Cue | The specific observable behavior: Verb + Object + Condition |
| L | Game Mechanic | The interactive structure (10 Approved Mechanics) |
| M | Mobile Interaction | The touch-event used to gather 60Hz telemetry |
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

## 2. TRIPLE-GATE SCORING SYSTEM (v3.2 LOCKED)

**DELETED:** All v3.1 "90%/60% accuracy" rules are superseded by the Triple-Gate system.

### The Three Gates

Every scene must pass **all three gates** for Level 3 (Mastery):

| Gate | Name | Requirement |
|------|------|-------------|
| **Gate 1** | Accuracy | Correct action selected/performed |
| **Gate 2** | Time | Complete within 30s Safety Gate |
| **Gate 3** | Jitter/Stability | 60Hz telemetry shows steady motor control |

### Performance Levels

| Level | Label | Triple-Gate Requirement | XP (per scene) |
|-------|-------|-------------------------|----------------|
| **3** | Mastery | Gate 1 ✓ + Gate 2 ✓ + Gate 3 ✓ (First Attempt) | 100 |
| **2** | Proficient | Gate 1 ✓ + Gate 2 ✓ + Gate 3 marginal OR required Retry/Hint | 60 |
| **1** | Needs Work | Failed Gate 1 OR Gate 2 OR Gate 3 critical failure | 20 |

### Competency Roll-Up Logic (6-Scene Rule)

Competency-level proficiency is determined **only after all 6 sub-competency validators are completed**:

| Result | Badge Color | Requirement |
|--------|-------------|-------------|
| **Mastery** | Cyber Yellow | 6/6 scenes cleared at Level 3 (First Attempt) |
| **Proficient** | Green | 4-5/6 scenes cleared at Level 2+ |
| **Needs Work** | Red | Any scene at Level 1 OR <4 scenes at Level 2+ |

### Time Gates

- **Safety Gate (T_safety):** 30 seconds per scene (non-negotiable)
- **Optimal Time:** Derived from mechanic complexity (typically 15-20s)

---

## 3. BIOMETRIC TELEMETRY (v3.2 MANDATORY)

### window.__TELEMETRY__ (NEW - 60Hz Coordinate Capture)

All validators **must** capture touch/pointer coordinates at 60 frames per second:

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
  jitter_score: number,    // computed stability (0-1, higher = more stable)
  velocity_avg: number,    // average movement velocity
  path_deviation: number,  // deviation from optimal path
  hesitation_count: number // number of pauses > 200ms
}
```

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

### Telemetry Implementation

```javascript
let telemetryBuffer = [];
let lastFrame = 0;

function captureFrame(event) {
  const now = performance.now();
  if (now - lastFrame >= 16.67) { // ~60 FPS
    telemetryBuffer.push({
      t: now - sceneStartTime,
      x: event.clientX / window.innerWidth,
      y: event.clientY / window.innerHeight,
      pressure: event.pressure || 0.5
    });
    lastFrame = now;
  }
}

// Attach to interaction area
interactionArea.addEventListener('pointermove', captureFrame);
interactionArea.addEventListener('touchmove', (e) => {
  captureFrame(e.touches[0]);
});
```

---

## 4. WINDOW OBJECTS (v3.2 UPDATED)

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
  time_limit: 30,                // Safety Gate (locked)
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
  jitter_threshold: 0.3,         // Max acceptable jitter (0-1)
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

### window.__TELEMETRY__ (NEW in v3.2)

```javascript
window.__TELEMETRY__ = {
  scene: number,
  samples: Array<{t: number, x: number, y: number, pressure: number}>,
  jitter_score: number,
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
  xp: 20 | 60 | 100,
  time_ms: number,
  gate_1_accuracy: boolean,
  gate_2_time: boolean,
  gate_3_jitter: boolean,
  jitter_score: number,
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
    jitter_score: number
  }>,
  competency_rollup: "mastery" | "proficient" | "needs_work",
  total_xp: number,
  first_attempt_count: number,   // How many L3 on first try
  telemetry_hash: string         // Hash of telemetry data
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
- 60Hz pointer tracking enabled

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

## 8. SELF-VALIDATION CHECKLIST (v3.2)

### Scene Structure
- ✓ Scene 0 (Intro) present with all required elements
- ✓ Scenes 1-6 each test one sub-competency
- ✓ Each scene pulls Action Cue from Column K
- ✓ Results screen shows 6-scene summary and roll-up

### Triple-Gate Scoring
- ✓ Gate 1 (Accuracy) evaluated per scene
- ✓ Gate 2 (Time) enforces 30s Safety Gate
- ✓ Gate 3 (Jitter) uses 60Hz telemetry data
- ✓ 6-Scene Rule applied for competency roll-up

### Biometric Telemetry
- ✓ `window.__TELEMETRY__` captures 60Hz coordinates
- ✓ Jitter score computed from path deviation
- ✓ Telemetry hash included in proof receipt

### Window Objects
- ✓ `__CONFIG__` includes action_cue, game_mechanic, mobile_interaction
- ✓ `__GOLD_KEY__` includes jitter_threshold
- ✓ `__TELEMETRY__` populated with 60Hz samples
- ✓ `__RESULT__` includes gate_1, gate_2, gate_3 booleans
- ✓ `__PROOF__` includes scene_results array and rollup

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

### v3.2 (Current - C-BEN Aligned)
- **BREAKING:** Replaced 90%/60% accuracy with Triple-Gate system
- **NEW:** Added `window.__TELEMETRY__` for 60Hz biometric capture
- **NEW:** Implemented 6-Scene Rule for competency roll-up
- **NEW:** Added Gate 3 (Jitter/Stability) requirement
- **NEW:** Mapped to Master DNA Columns K-N
- **NEW:** Added jitter measurement by mechanic type
- Enforced 30s Safety Gate per scene

### v3.1
- Updated scoring thresholds to 90%/60%
- Added `__PROOF__` object requirement
- Increased XP values to 100/60/20
- Added time formulas (Tlimit, Ttight)

### v3.0
- Introduced locked scoring system
- Added Telegram integration requirements
- Defined mandatory scene structure

### v2.0
- Added accessibility requirements
- Introduced mobile-first design principles

### v1.0
- Initial framework definition

---

## 10. COMPLIANCE STATEMENT

All PlayOps validators derive from C-BEN-recognized assessment methods. Each validator maps 1:1 to an authentic assessment family and captures evidence through interactive simulation rather than passive testing.

**THE CORE LOCKED ARCHITECTURE CANNOT BE OVERRIDDEN. PERIOD.**

This v3.2 specification defines the production-ready foundation aligned with the C-BEN → PlayOps Dual Framework. All games must pass the Triple-Gate, emit required window objects, and capture 60Hz telemetry.
