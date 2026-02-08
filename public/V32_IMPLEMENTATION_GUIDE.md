# BASE LAYER 1 v3.2 Implementation Guide

## Biometric Science Standard — 60Hz Telemetry Integration

**Last Updated:** February 2026  
**Supersedes:** V31_IMPLEMENTATION_GUIDE.md

---

## Overview

This document explains how the platform **enforces** the BASE LAYER 1 v3.2 Biometric Science Standard. The v3.2 update introduces:

- **Triple-Gate Scoring** (Accuracy + Time + Jitter)
- **First Attempt Rule** (Level 3 only on first try)
- **6-Scene Rule** for competency roll-up
- **60Hz Biometric Telemetry** via `window.__TELEMETRY__`
- **Master DNA Column Mapping** (K: Action Cue, L: Mechanic, M: 60Hz Interaction, N: Scoring)

---

## What Changed from v3.1

| Area | v3.1 (Old) | v3.2 (Current) |
|------|------------|----------------|
| **Scoring** | 90%/60% accuracy thresholds | Triple-Gate (Accuracy + Time + Jitter) |
| **Mastery Definition** | Score ≥ 90% | All 3 gates passed + First Attempt |
| **Competency Roll-Up** | Weighted average | 6-Scene Rule (6/6 L3 = Mastery) |
| **Telemetry** | Basic action tracking | 60Hz (x,y,t) coordinate capture |
| **Jitter Analysis** | None | Standard deviation of deltas |
| **Time Limit** | Fixed Tlimit/Ttight | Dynamic (30/45/60s from DNA Sheet) |
| **XP Values** | 100/60/20 | 500/250/100 |
| **Data Source** | Static config | Dynamic from Columns K-N |

---

## 1. Triple-Gate Scoring Engine

### DELETED: Old Accuracy Rules

The following v3.1 rules are **no longer valid**:
- ❌ "Score >= 90 = Mastery"
- ❌ "Score 60-89 = Proficient"  
- ❌ "Score < 60 = Needs Work"
- ❌ XP average across scenes

### NEW: Triple-Gate Logic

Every scene must pass **three independent gates**:

```typescript
// ============================================
// TRIPLE-GATE SCORING — LEVEL 1, 2, 3
// ============================================

interface ScoringInput {
  accuracy: boolean;           // Gate 1: Correct action performed
  time_s: number;              // Actual completion time in seconds
  jitter_score: number;        // Stability score (0.0 - 1.0)
  firstAttempt: boolean;       // Is this the first attempt?
}

interface RuntimeConfig {
  time_limit_s: number;        // Dynamic limit (30, 45, or 60s from DNA)
  jitter_threshold: number;    // Minimum stability for mastery (default 0.70)
}

interface ScoringResult {
  level: 1 | 2 | 3;
  passed: boolean;
  xp: 100 | 250 | 500;
  label: 'Needs Work' | 'Proficient' | 'Mastery';
  reasoning: string;
}

function evaluateTripleGate(input: ScoringInput, config: RuntimeConfig): ScoringResult {
  const { accuracy, time_s, jitter_score, firstAttempt } = input;
  const { time_limit_s, jitter_threshold } = config;
  
  // ========== GATE 1: Accuracy Check ==========
  const gate1 = accuracy === true;
  
  // ========== GATE 2: Time Check ==========
  const gate2 = time_s <= time_limit_s;
  
  // ========== GATE 3: Jitter/Stability Check ==========
  const gate3 = jitter_score >= jitter_threshold;
  
  // ========== LEVEL ASSIGNMENT ==========
  
  if (!gate1 || !gate2) {
    // Level 1: Failed basic gates
    return {
      level: 1,
      passed: false,
      xp: 100,
      label: 'Needs Work',
      reasoning: !gate1 
        ? 'Incorrect action selected'
        : `Time ${time_s}s exceeded limit ${time_limit_s}s`
    };
  }
  
  if (gate1 && gate2 && gate3 && firstAttempt) {
    // Level 3: Mastery achieved (all gates + first attempt)
    return {
      level: 3,
      passed: true,
      xp: 500,
      label: 'Mastery',
      reasoning: `Elite performance: First attempt with ${(jitter_score * 100).toFixed(0)}% stability`
    };
  }
  
  // Level 2: Proficient (passed Gate 1+2, but not all mastery conditions)
  return {
    level: 2,
    passed: true,
    xp: 250,
    label: 'Proficient',
    reasoning: !firstAttempt 
      ? 'Retry used - capped at Level 2'
      : `Stability ${(jitter_score * 100).toFixed(0)}% below ${(jitter_threshold * 100).toFixed(0)}% threshold`
  };
}
```

### Gate Details

| Gate | Name | Pass Condition |
|------|------|----------------|
| **1** | Accuracy | Player selected/performed the correct action |
| **2** | Time | Completed within Dynamic Scene Limit (30/45/60s) |
| **3** | Jitter | `jitter_score >= jitter_threshold` (default 0.70) |

### First Attempt Rule

**Level 3 (Mastery) is ONLY available on the First Attempt:**
- Retry usage caps result at Level 2
- Hint usage caps result at Level 2
- System tracks `first_attempt: boolean` per scene

---

## 2. 6-Scene Rule for Competency Roll-Up

### DELETED: Weighted Average

The following v3.1 approach is **no longer valid**:
- ❌ Averaging scores across scenes
- ❌ Single high score granting Mastery

### NEW: 6-Scene Rule

Competency-level proficiency requires **all 6 sub-competency scenes** to be completed:

```typescript
type SceneResult = { 
  scene: number; 
  level: 1 | 2 | 3; 
  firstAttempt: boolean 
};

function calculateCompetencyRollup(results: SceneResult[]): 'mastery' | 'proficient' | 'needs_work' {
  if (results.length !== 6) {
    throw new Error('Competency requires exactly 6 scenes');
  }
  
  // Count Level 3 achievements on first attempt
  const level3FirstAttempt = results.filter(r => r.level === 3 && r.firstAttempt).length;
  const level2Plus = results.filter(r => r.level >= 2).length;
  const hasLevel1 = results.some(r => r.level === 1);
  
  // Mastery (Cyber Yellow): 6/6 scenes at Level 3 on first attempt
  if (level3FirstAttempt === 6) {
    return 'mastery';
  }
  
  // Proficient (Green): 4+ scenes at Level 2 or higher, no Level 1
  if (level2Plus >= 4 && !hasLevel1) {
    return 'proficient';
  }
  
  // Needs Work (Red): Any Level 1 or fewer than 4 at Level 2+
  return 'needs_work';
}
```

### Roll-Up Summary

| Competency Result | Badge Color | Requirement |
|-------------------|-------------|-------------|
| **Mastery** | Cyber Yellow | 6/6 scenes at Level 3 (first attempt only) |
| **Proficient** | Green | 4-5/6 scenes at Level 2+ |
| **Needs Work** | Red | Any scene at Level 1 |

---

## 3. Master DNA Column Mapping (K-N)

### Data Source

The Scene Assembler pulls data from the Master DNA spreadsheet Tab 3:

| Column | Field | Purpose | Usage |
|--------|-------|---------|-------|
| **K** | Action Cue | Observable behavior (Verb + Object + Condition) | Scene prompt/instruction |
| **L** | Game Mechanic | Interactive structure from 10 Approved Mechanics | Component selection |
| **M** | 60Hz Interaction | Touch-event for biometric telemetry capture | Input handler type |
| **N** | Scoring Formula | Triple-Gate parameters + time limit | Threshold configuration |

### Implementation

```typescript
interface SubCompetencyDNA {
  action_cue: string;           // Column K
  game_mechanic: string;        // Column L
  mobile_interaction: string;   // Column M (60Hz Interaction)
  scoring_formula: string;      // Column N
}

function buildScene(dna: SubCompetencyDNA, sceneNumber: number) {
  return {
    prompt: dna.action_cue,
    mechanic: getMechanicComponent(dna.game_mechanic),
    inputHandler: getInputHandler(dna.mobile_interaction),
    scoring: parseScoringFormula(dna.scoring_formula),
    telemetryConfig: {
      samplingRate: 60, // Hz - MANDATORY
      trackJitter: dna.mobile_interaction !== 'Quick Tap'
    }
  };
}
```

### Mechanic → Component Mapping

| Game Mechanic | React Component | 60Hz Interaction | Jitter Measurement |
|---------------|-----------------|------------------|-------------------|
| Decision Tree | `<DecisionTree />` | Quick Tap | Decision Latency |
| Data Panel | `<DataPanel />` | Multi-Tap | Scan Speed |
| Noise Filter | `<ScrubSlider />` | Continuous Scrub | Velocity Consistency |
| Alignment Puzzle | `<DragConnect />` | Drag-to-Connect | Targeting Precision |
| Sequence Validator | `<SwipeCard />` | Drag & Drop | Path Deviation |
| Constraint Puzzle | `<ScrubSlider />` | Slider Adjust | Fine Motor Control |
| Pattern Grid | `<PatternGrid />` | Drag-to-Select | X/Y Stability |
| Headline Picker | `<QuickTapButtons />` | Quick Tap | Output Selection |
| Diagnostic Panel | `<TradeoffMatrix />` | Multi-Touch | Rhythmic Jitter |
| Trade-Off Eval | `<TradeoffMatrix />` | Toggle/Slide | Hesitation Jitter |

---

## 4. 60Hz Biometric Telemetry

### The 60Hz Telemetry Loop

Captures `[x, y, timestamp]` during pointer/drag interactions at approximately 60 samples per second:

```typescript
// ============================================
// BIOMETRIC TELEMETRY CAPTURE — 60Hz LOOP
// ============================================

interface TelemetryPoint {
  x: number;
  y: number;
  t: number;  // Unix timestamp in milliseconds
  pressure?: number;
}

class BiometricCapture {
  private points: TelemetryPoint[] = [];
  private isCapturing = false;
  private lastCaptureTime = 0;
  private readonly SAMPLE_INTERVAL_MS = 16.67; // ~60Hz
  
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
    
    // Capture normalized coordinates
    this.points.push({
      x: (e.clientX - containerRect.left) / containerRect.width,
      y: (e.clientY - containerRect.top) / containerRect.height,
      t: Date.now(),
      pressure: e.pressure || 0.5
    });
  }
}
```

### Jitter/Stability Analysis

```typescript
// ============================================
// JITTER ANALYSIS — VARIANCE & STANDARD DEVIATION
// ============================================

interface JitterAnalysis {
  xVariance: number;
  yVariance: number;
  xStdDev: number;
  yStdDev: number;
  combinedStdDev: number;
  stabilityScore: number;  // 0-100
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
  const combinedStdDev = Math.sqrt(stdDevX * stdDevX + stdDevY * stdDevY);
  
  // Stability score: exponential decay (100 * e^(-0.15 * stdDev))
  const stabilityScore = Math.max(0, Math.min(100, Math.round(100 * Math.exp(-0.15 * combinedStdDev))));
  
  return { xVariance: varianceX, yVariance: varianceY, xStdDev: stdDevX, yStdDev: stdDevY, combinedStdDev, stabilityScore };
}

// Convert 0-100 score to 0-1 for gate comparison
function normalizeStabilityScore(score: number): number {
  return score / 100;
}
```

### Hook: useGameTelemetry

```typescript
import { useRef, useCallback, useEffect } from 'react';

export function useGameTelemetry(sceneNumber: number) {
  const samples = useRef<TelemetryPoint[]>([]);
  const sceneStart = useRef<number>(0);
  const lastFrame = useRef<number>(0);
  
  useEffect(() => {
    sceneStart.current = performance.now();
    samples.current = [];
  }, [sceneNumber]);
  
  const captureFrame = useCallback((event: PointerEvent | Touch) => {
    const now = performance.now();
    if (now - lastFrame.current >= 16.67) { // ~60 FPS
      samples.current.push({
        t: now - sceneStart.current,
        x: event.clientX / window.innerWidth,
        y: event.clientY / window.innerHeight,
        pressure: (event as PointerEvent).pressure || 0.5
      });
      lastFrame.current = now;
    }
  }, []);
  
  const finalize = useCallback(() => {
    const analysis = analyzeJitter(samples.current);
    
    window.__TELEMETRY__ = {
      scene: sceneNumber,
      samples: samples.current,
      jitter_score: analysis.stabilityScore / 100,
      jitter_variance: analysis.xVariance + analysis.yVariance,
      jitter_stddev: analysis.combinedStdDev,
      velocity_avg: calculateVelocity(samples.current),
      path_deviation: calculatePathDeviation(samples.current),
      hesitation_count: countHesitations(samples.current),
      sampling_rate_hz: 60
    };
    
    return window.__TELEMETRY__;
  }, [sceneNumber]);
  
  return { captureFrame, finalize };
}
```

---

## 5. Complete Biometric Scoring Pipeline

Full integration showing all three systems working together:

```typescript
// ============================================
// COMPLETE BIOMETRIC SCORING PIPELINE
// ============================================

class GameSession {
  private biometricCapture = new BiometricCapture();
  private startTime: number = 0;
  private actionCorrect: boolean = false;
  private isFirstAttempt: boolean = true;
  
  private readonly config = {
    time_limit_s: 30,  // From DNA Sheet Column N
    jitter_threshold: 0.70
  };
  
  startSession(): void {
    this.startTime = Date.now();
    this.biometricCapture.startCapture();
  }
  
  recordAction(isCorrect: boolean): void {
    this.actionCorrect = isCorrect;
  }
  
  captureMovement(e: PointerEvent, rect: DOMRect): void {
    this.biometricCapture.capturePoint(e, rect);
  }
  
  finishSession(): ScoringResult {
    const time_s = (Date.now() - this.startTime) / 1000;
    const points = this.biometricCapture.stopCapture();
    const jitterAnalysis = analyzeJitter(points);
    const jitter_score = jitterAnalysis.stabilityScore / 100;
    
    const result = evaluateTripleGate(
      { 
        accuracy: this.actionCorrect, 
        time_s, 
        jitter_score, 
        firstAttempt: this.isFirstAttempt 
      },
      this.config
    );
    
    console.log('Session Complete:', {
      accuracy: this.actionCorrect,
      time: `${time_s.toFixed(1)}s`,
      jitter: {
        samples: points.length,
        stdDev: jitterAnalysis.combinedStdDev.toFixed(2),
        stability: `${jitterAnalysis.stabilityScore}%`
      },
      result
    });
    
    return result;
  }
}
```

---

## 6. Updated GamePlayer Integration

### Scene Flow

```typescript
function GamePlayer({ generatedHtml, competencyId }: Props) {
  const [currentScene, setCurrentScene] = useState(0);
  const [sceneResults, setSceneResults] = useState<SceneResult[]>([]);
  const [attemptCounts, setAttemptCounts] = useState<Map<number, number>>(new Map());
  const { captureFrame, finalize } = useGameTelemetry(currentScene);
  
  const handleSceneComplete = (result: SceneResult) => {
    // Finalize telemetry for Gate 3
    const telemetry = finalize();
    
    // Track attempts
    const attempts = (attemptCounts.get(currentScene) || 0) + 1;
    const isFirstAttempt = attempts === 1;
    
    // Evaluate Triple-Gate with First Attempt Rule
    const finalResult = {
      ...result,
      gate3_jitter: telemetry.jitter_score >= 0.70,
      firstAttempt: isFirstAttempt,
      level: evaluateFinalLevel(result.gate1, result.gate2, telemetry.jitter_score >= 0.70, isFirstAttempt)
    };
    
    setSceneResults(prev => [...prev, finalResult]);
    
    if (currentScene < 6) {
      setCurrentScene(prev => prev + 1);
    } else {
      // All 6 scenes complete - calculate roll-up
      const rollup = calculateCompetencyRollup([...sceneResults, finalResult]);
      emitProof(rollup);
    }
  };
}
```

---

## 7. V3.2 Compliance Checker Updates

### New Checks Added

```typescript
interface V32ValidationResult {
  // Existing checks
  hasConfig: boolean;
  hasGoldKey: boolean;
  hasEdge: boolean;
  hasResult: boolean;
  hasProof: boolean;
  
  // NEW v3.2 Biometric checks
  hasTelemetry: boolean;           // window.__TELEMETRY__ defined
  telemetryAt60Hz: boolean;        // sampling_rate_hz === 60
  hasJitterAnalysis: boolean;      // jitter_stddev computed
  hasTripleGate: boolean;          // gate_1, gate_2, gate_3 in result
  hasFirstAttemptRule: boolean;    // first_attempt tracked
  has6Scenes: boolean;             // Exactly 6 sub-competency scenes
  hasRollupLogic: boolean;         // 6-Scene Rule implemented
  actionCueFromColumnK: boolean;   // Action cue matches spreadsheet
  mechanicFromColumnL: boolean;    // Mechanic matches spreadsheet
  interactionFromColumnM: boolean; // 60Hz interaction matches spreadsheet
}
```

---

## 8. Quick Reference Table

| Metric | Gate | Level 1 | Level 2 | Level 3 |
|--------|------|---------|---------|---------|
| Accuracy | Gate 1 | ✗ Fail | ✓ Pass | ✓ Pass |
| Time | Gate 2 | > limit | ≤ limit | ≤ limit |
| Jitter Score | Gate 3 | — | < 70% | ≥ 70% |
| First Attempt | — | — | Any | Required |
| XP Awarded | — | 100 | 250 | 500 |

---

## 9. Migration from v3.1

### Breaking Changes

1. **Scoring thresholds removed** - Replace all 90%/60% checks with Triple-Gate
2. **Time formulas changed** - Replace Tlimit/Ttight with dynamic limits from DNA Sheet
3. **XP values updated** - 500/250/100 (was 100/60/20)
4. **New window object required** - Add `window.__TELEMETRY__` with 60Hz samples
5. **First Attempt Rule** - Track and enforce first_attempt boolean
6. **Roll-up logic changed** - Implement 6-Scene Rule

### Migration Steps

```typescript
// Step 1: Remove old scoring
// BEFORE (v3.1)
const level = score >= 90 ? 'mastery' : score >= 60 ? 'proficient' : 'needs_work';

// AFTER (v3.2)
const level = evaluateTripleGate({ accuracy, time_s, jitter_score, firstAttempt }, config);

// Step 2: Add telemetry with jitter analysis
window.__TELEMETRY__ = {
  scene: currentScene,
  samples: telemetrySamples,
  jitter_score: analysisResult.stabilityScore / 100,
  jitter_stddev: analysisResult.combinedStdDev,
  sampling_rate_hz: 60
};

// Step 3: Update result emission
window.__RESULT__ = {
  scene: currentScene,
  level: result.level,
  gate_1_accuracy: true,
  gate_2_time: true,
  gate_3_jitter: true,
  jitter_score: 0.85,
  jitter_stddev: 2.3,
  first_attempt: true
};
```

---

## 10. Summary

The v3.2 implementation transforms PlayOps from percentage-based scoring to a rigorous Biometric Science Standard aligned with C-BEN competency frameworks:

1. **Triple-Gate** replaces 90%/60% accuracy
2. **First Attempt Rule** requires mastery on first try
3. **6-Scene Rule** replaces weighted averages
4. **60Hz Telemetry** enables biometric jitter measurement
5. **Jitter Formula** uses standard deviation of deltas
6. **Column K-N Mapping** ensures data integrity
7. **Dynamic Time Gates** (30/45/60s) from DNA Sheet

**Documentation → Implementation → Enforcement ✓**
