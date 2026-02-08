# Biometric Science Export — Global Standard

> Clean implementation blocks for the 60Hz Telemetry Loop, Jitter Formula, and Triple-Gate Scoring.
> Copy these directly into your new project.

---

## 1. The 60Hz Telemetry Loop

Captures `[x, y, timestamp]` during pointer/drag interactions at approximately 60 samples per second (using `requestAnimationFrame` or `pointermove` event throttling).

### Implementation Block

```typescript
// ============================================
// BIOMETRIC TELEMETRY CAPTURE — 60Hz LOOP
// ============================================

interface TelemetryPoint {
  x: number;
  y: number;
  t: number;  // Unix timestamp in milliseconds
}

class BiometricCapture {
  private points: TelemetryPoint[] = [];
  private isCapturing = false;
  private lastCaptureTime = 0;
  private readonly SAMPLE_INTERVAL_MS = 16.67; // ~60Hz (1000ms / 60fps)
  
  /**
   * Start capturing biometric data from pointer events
   */
  startCapture(): void {
    this.isCapturing = true;
    this.points = [];
    this.lastCaptureTime = 0;
  }
  
  /**
   * Stop capturing and return collected points
   */
  stopCapture(): TelemetryPoint[] {
    this.isCapturing = false;
    return [...this.points];
  }
  
  /**
   * Call this from your pointermove handler
   * Throttles to ~60Hz to prevent over-sampling
   */
  capturePoint(e: PointerEvent, containerRect: DOMRect): void {
    if (!this.isCapturing) return;
    
    const now = performance.now();
    
    // Throttle to 60Hz
    if (now - this.lastCaptureTime < this.SAMPLE_INTERVAL_MS) {
      return;
    }
    
    this.lastCaptureTime = now;
    
    // Capture normalized coordinates relative to container
    const x = e.clientX - containerRect.left;
    const y = e.clientY - containerRect.top;
    const t = Date.now();
    
    this.points.push({ x, y, t });
  }
  
  /**
   * Alternative: Use requestAnimationFrame for consistent 60fps
   * Call this once and pass the latest pointer position
   */
  private rafId: number | null = null;
  private latestPointerPos: { x: number; y: number } | null = null;
  
  startRAFCapture(containerRect: DOMRect): void {
    this.isCapturing = true;
    this.points = [];
    
    const captureFrame = () => {
      if (!this.isCapturing) return;
      
      if (this.latestPointerPos) {
        this.points.push({
          x: this.latestPointerPos.x,
          y: this.latestPointerPos.y,
          t: Date.now()
        });
      }
      
      this.rafId = requestAnimationFrame(captureFrame);
    };
    
    this.rafId = requestAnimationFrame(captureFrame);
  }
  
  updatePointerPosition(e: PointerEvent, containerRect: DOMRect): void {
    this.latestPointerPos = {
      x: e.clientX - containerRect.left,
      y: e.clientY - containerRect.top
    };
  }
  
  stopRAFCapture(): TelemetryPoint[] {
    this.isCapturing = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    return [...this.points];
  }
  
  /**
   * Get raw points array (for external analysis)
   */
  getPoints(): TelemetryPoint[] {
    return [...this.points];
  }
  
  /**
   * Get point count
   */
  getPointCount(): number {
    return this.points.length;
  }
}

// ============================================
// USAGE IN REACT COMPONENT
// ============================================

// In your React component:
const biometricCapture = useRef(new BiometricCapture());
const containerRef = useRef<HTMLDivElement>(null);

const handlePointerDown = (e: React.PointerEvent) => {
  e.currentTarget.setPointerCapture(e.pointerId);
  biometricCapture.current.startCapture();
};

const handlePointerMove = (e: React.PointerEvent) => {
  const rect = containerRef.current?.getBoundingClientRect();
  if (rect) {
    biometricCapture.current.capturePoint(e.nativeEvent, rect);
  }
};

const handlePointerUp = () => {
  const points = biometricCapture.current.stopCapture();
  console.log(`Captured ${points.length} telemetry points`);
  // Analyze jitter, calculate stability score, etc.
};
```

---

## 2. Jitter/Stability Formula

Calculates **Standard Deviation** of movement deltas to determine hand stability. Lower variance = steadier hand = higher stability score.

### Implementation Block

```typescript
// ============================================
// JITTER ANALYSIS — VARIANCE & STANDARD DEVIATION
// ============================================

interface TelemetryPoint {
  x: number;
  y: number;
  t: number;
}

interface JitterAnalysis {
  xVariance: number;      // Variance of X-axis deltas
  yVariance: number;      // Variance of Y-axis deltas
  xStdDev: number;        // Standard deviation of X-axis
  yStdDev: number;        // Standard deviation of Y-axis
  combinedStdDev: number; // Combined jitter (Euclidean)
  stabilityScore: number; // 0-100 (100 = perfectly stable)
  velocityMean: number;   // Average movement speed (px/ms)
  sampleCount: number;    // Number of delta samples
}

/**
 * Calculate jitter variance and stability from telemetry points
 * 
 * The math:
 * 1. Calculate deltas (Δx, Δy) between consecutive points
 * 2. Compute mean of deltas
 * 3. Calculate variance: Σ(Δ - mean)² / n
 * 4. Standard deviation = √variance
 * 5. Stability score = inverse mapping (lower jitter = higher score)
 */
function analyzeJitter(points: TelemetryPoint[]): JitterAnalysis {
  if (points.length < 3) {
    return {
      xVariance: 0,
      yVariance: 0,
      xStdDev: 0,
      yStdDev: 0,
      combinedStdDev: 0,
      stabilityScore: 100,
      velocityMean: 0,
      sampleCount: 0
    };
  }
  
  // Calculate deltas between consecutive points
  const deltaX: number[] = [];
  const deltaY: number[] = [];
  const velocities: number[] = [];
  
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    const dt = points[i].t - points[i - 1].t;
    
    deltaX.push(dx);
    deltaY.push(dy);
    
    // Velocity: distance per millisecond
    if (dt > 0) {
      const distance = Math.sqrt(dx * dx + dy * dy);
      velocities.push(distance / dt);
    }
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
  
  // Stability score: inverse mapping
  // Thresholds (calibrated for typical human movement):
  // - stdDev < 2px = very stable (score 90-100)
  // - stdDev 2-5px = stable (score 70-89)
  // - stdDev 5-10px = moderate (score 50-69)
  // - stdDev > 10px = unstable (score < 50)
  const stabilityScore = calculateStabilityScore(combinedStdDev);
  
  // Mean velocity
  const velocityMean = velocities.length > 0 
    ? velocities.reduce((a, b) => a + b, 0) / velocities.length 
    : 0;
  
  return {
    xVariance: varianceX,
    yVariance: varianceY,
    xStdDev: stdDevX,
    yStdDev: stdDevY,
    combinedStdDev,
    stabilityScore,
    velocityMean,
    sampleCount: deltaX.length
  };
}

/**
 * Map jitter (stdDev) to a 0-100 stability score
 * Uses exponential decay for natural feel
 */
function calculateStabilityScore(stdDev: number): number {
  // Exponential decay: score = 100 * e^(-k * stdDev)
  // k = 0.15 provides good discrimination in 0-15px range
  const k = 0.15;
  const rawScore = 100 * Math.exp(-k * stdDev);
  
  // Clamp to 0-100
  return Math.max(0, Math.min(100, Math.round(rawScore)));
}

/**
 * Classify stability into categories
 */
function classifyStability(stabilityScore: number): 'Elite' | 'Stable' | 'Moderate' | 'Unstable' {
  if (stabilityScore >= 90) return 'Elite';
  if (stabilityScore >= 70) return 'Stable';
  if (stabilityScore >= 50) return 'Moderate';
  return 'Unstable';
}

// ============================================
// QUICK VARIANCE FUNCTION (Standalone)
// ============================================

/**
 * Quick jitter variance calculation for X-axis only
 * Use when you just need the number
 */
function calculateJitterVariance(points: TelemetryPoint[]): number {
  if (points.length < 3) return 0;
  
  const deltas: number[] = [];
  for (let i = 1; i < points.length; i++) {
    deltas.push(Math.abs(points[i].x - points[i - 1].x));
  }
  
  const mean = deltas.reduce((a, b) => a + b, 0) / deltas.length;
  const variance = deltas.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / deltas.length;
  
  return Math.sqrt(variance); // Return standard deviation
}
```

---

## 3. Triple-Gate Scoring Logic

The **3-Level Mastery System** checks **Accuracy**, **Time**, and **Edge Score (Jitter/Stability)** to determine proficiency level.

### Implementation Block

```typescript
// ============================================
// TRIPLE-GATE SCORING — LEVEL 1, 2, 3
// ============================================

interface ScoringInput {
  accuracy: number;           // 0.0 - 1.0 (e.g., 0.92 = 92%)
  time_s: number;             // Actual completion time in seconds
  edge_score: number;         // Stability/jitter score (0.0 - 1.0)
  totalSessions?: number;     // Number of completed sessions (for mastery gate)
}

interface RuntimeConfig {
  time_limit_s: number;       // Maximum allowed time (e.g., 90 seconds)
  accuracy_threshold: number; // Minimum accuracy to pass (e.g., 0.85)
  edge_threshold: number;     // Minimum edge score for mastery (e.g., 0.80)
  sessions_required: number;  // Sessions required for L3 mastery (e.g., 3)
}

interface ScoringResult {
  level: 1 | 2 | 3;           // Proficiency level
  passed: boolean;            // Did user pass?
  xp: number;                 // Experience points awarded
  label: 'Needs Work' | 'Proficient' | 'Mastery';
  reasoning: string;          // Human-readable explanation
}

/**
 * Triple-Gate Scoring Algorithm
 * 
 * Gate 1 (Accuracy): Must meet accuracy_threshold
 * Gate 2 (Time): Must complete within time_limit_s
 * Gate 3 (Edge/Stability): Must meet edge_threshold + session count for mastery
 * 
 * LEVELS:
 * - Level 1 (Needs Work): Failed accuracy OR time gate
 * - Level 2 (Proficient): Passed accuracy AND time, but not mastery
 * - Level 3 (Mastery): 95%+ accuracy, 83% of time limit, edge threshold, multiple sessions
 */
function calculateTripleGateScore(
  input: ScoringInput,
  config: RuntimeConfig
): ScoringResult {
  const { accuracy, time_s, edge_score, totalSessions = 1 } = input;
  const { time_limit_s, accuracy_threshold, edge_threshold, sessions_required } = config;
  
  let level: 1 | 2 | 3 = 1;
  let passed = false;
  let xp = 0;
  let label: 'Needs Work' | 'Proficient' | 'Mastery' = 'Needs Work';
  let reasoning = '';
  
  // ========== GATE 1: Accuracy Check ==========
  const passedAccuracy = accuracy >= accuracy_threshold;
  
  // ========== GATE 2: Time Check ==========
  const passedTime = time_s <= time_limit_s;
  
  // ========== GATE 3: Mastery Check ==========
  const MASTERY_ACCURACY = 0.95;          // 95% accuracy
  const MASTERY_TIME_FACTOR = 0.83;       // 83% of time limit (e.g., 75s for 90s limit)
  const masteryTime = time_limit_s * MASTERY_TIME_FACTOR;
  
  const passedMastery = (
    accuracy >= MASTERY_ACCURACY &&
    time_s <= masteryTime &&
    edge_score >= edge_threshold &&
    totalSessions >= sessions_required
  );
  
  // ========== LEVEL ASSIGNMENT ==========
  
  if (!passedAccuracy || !passedTime) {
    // Level 1: Failed basic gates
    level = 1;
    passed = false;
    xp = 100;
    label = 'Needs Work';
    reasoning = !passedAccuracy 
      ? `Accuracy ${(accuracy * 100).toFixed(1)}% below threshold ${(accuracy_threshold * 100).toFixed(0)}%`
      : `Time ${time_s}s exceeded limit ${time_limit_s}s`;
  } 
  else if (passedMastery) {
    // Level 3: Mastery achieved
    level = 3;
    passed = true;
    xp = 500;
    label = 'Mastery';
    reasoning = `Elite performance: ${(accuracy * 100).toFixed(1)}% accuracy in ${time_s}s with ${(edge_score * 100).toFixed(0)}% stability`;
  }
  else if (accuracy >= 0.90 && passedTime) {
    // Level 2: Proficient
    level = 2;
    passed = true;
    xp = 250;
    label = 'Proficient';
    reasoning = `Solid performance: ${(accuracy * 100).toFixed(1)}% accuracy in ${time_s}s`;
  }
  else {
    // Edge case: passed basic but not L2/L3 thresholds
    level = 1;
    passed = false;
    xp = 100;
    label = 'Needs Work';
    reasoning = `Accuracy ${(accuracy * 100).toFixed(1)}% needs improvement to reach Proficient (90%+)`;
  }
  
  return { level, passed, xp, label, reasoning };
}

// ============================================
// USAGE EXAMPLE
// ============================================

const result = calculateTripleGateScore(
  {
    accuracy: 0.96,      // 96% correct
    time_s: 72,          // 72 seconds
    edge_score: 0.85,    // 85% stability
    totalSessions: 4     // 4th attempt
  },
  {
    time_limit_s: 90,
    accuracy_threshold: 0.85,
    edge_threshold: 0.80,
    sessions_required: 3
  }
);

console.log(result);
// {
//   level: 3,
//   passed: true,
//   xp: 500,
//   label: 'Mastery',
//   reasoning: 'Elite performance: 96.0% accuracy in 72s with 85% stability'
// }

// ============================================
// SIMPLIFIED VERSION (Single Function)
// ============================================

function getLevel(
  accuracy: number, 
  time_s: number, 
  edge_score: number,
  timeLimit: number = 90,
  edgeThreshold: number = 0.80,
  sessions: number = 1
): { level: 1 | 2 | 3; passed: boolean } {
  
  // Level 1: Failed basic
  if (accuracy < 0.85 || time_s > timeLimit) {
    return { level: 1, passed: false };
  }
  
  // Level 3: Mastery
  if (
    accuracy >= 0.95 &&
    time_s <= (timeLimit * 0.83) &&
    edge_score >= edgeThreshold &&
    sessions >= 3
  ) {
    return { level: 3, passed: true };
  }
  
  // Level 2: Proficient
  if (accuracy >= 0.90) {
    return { level: 2, passed: true };
  }
  
  // Default to Level 1
  return { level: 1, passed: false };
}
```

---

## 4. Combined Integration Example

Full integration showing all three systems working together:

```typescript
// ============================================
// COMPLETE BIOMETRIC SCORING PIPELINE
// ============================================

import { BiometricCapture, analyzeJitter, calculateTripleGateScore } from './biometric-science';

class GameSession {
  private biometricCapture = new BiometricCapture();
  private startTime: number = 0;
  private correctAnswers = 0;
  private totalAnswers = 0;
  private sessionCount = 1;
  
  private readonly config = {
    time_limit_s: 90,
    accuracy_threshold: 0.85,
    edge_threshold: 0.80,
    sessions_required: 3
  };
  
  startSession(): void {
    this.startTime = Date.now();
    this.biometricCapture.startCapture();
  }
  
  recordAnswer(isCorrect: boolean): void {
    this.totalAnswers++;
    if (isCorrect) this.correctAnswers++;
  }
  
  captureMovement(e: PointerEvent, rect: DOMRect): void {
    this.biometricCapture.capturePoint(e, rect);
  }
  
  finishSession(): ScoringResult {
    // Calculate time
    const time_s = (Date.now() - this.startTime) / 1000;
    
    // Calculate accuracy
    const accuracy = this.totalAnswers > 0 
      ? this.correctAnswers / this.totalAnswers 
      : 0;
    
    // Get biometric data and analyze jitter
    const points = this.biometricCapture.stopCapture();
    const jitterAnalysis = analyzeJitter(points);
    
    // Convert stability score to 0-1 range for edge_score
    const edge_score = jitterAnalysis.stabilityScore / 100;
    
    // Run triple-gate scoring
    const result = calculateTripleGateScore(
      { accuracy, time_s, edge_score, totalSessions: this.sessionCount },
      this.config
    );
    
    // Log forensic data
    console.log('Session Complete:', {
      accuracy: `${(accuracy * 100).toFixed(1)}%`,
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

## Quick Reference Table

| Metric | Gate | Level 1 | Level 2 | Level 3 |
|--------|------|---------|---------|---------|
| Accuracy | Gate 1 | < 85% | 90%+ | 95%+ |
| Time | Gate 2 | > limit | ≤ limit | ≤ 83% of limit |
| Edge Score | Gate 3 | — | — | ≥ threshold |
| Sessions | Gate 3 | — | — | ≥ required |
| XP Awarded | — | 100 | 250 | 500 |

---

*Export generated from PlayOps Biometric Science Engine v3.1*
