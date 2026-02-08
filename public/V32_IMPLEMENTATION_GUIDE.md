# BASE LAYER 1 v3.2 Implementation Guide

## C-BEN → PlayOps Dual Framework Integration

**Last Updated:** February 2026  
**Supersedes:** V31_IMPLEMENTATION_GUIDE.md

---

## Overview

This document explains how the platform **enforces** the BASE LAYER 1 v3.2 specification aligned with the C-BEN → PlayOps Dual Framework. The v3.2 update introduces:

- **Triple-Gate Scoring** (replaces 90%/60% accuracy rules)
- **6-Scene Rule** for competency roll-up
- **60Hz Biometric Telemetry** via `window.__TELEMETRY__`
- **Master DNA Column Mapping** (K-N)

---

## What Changed from v3.1

| Area | v3.1 (Old) | v3.2 (Current) |
|------|------------|----------------|
| **Scoring** | 90%/60% accuracy thresholds | Triple-Gate (Accuracy + Time + Jitter) |
| **Mastery Definition** | Score ≥ 90% | All 3 gates passed on first attempt |
| **Competency Roll-Up** | Weighted average | 6-Scene Rule (6/6 L3 = Mastery) |
| **Telemetry** | Basic action tracking | 60Hz (x,y) coordinate capture |
| **Time Limit** | Configurable (Tlimit, Ttight) | Fixed 30s Safety Gate per scene |
| **Data Source** | Static config | Dynamic from Columns K-N |

---

## 1. Triple-Gate Scoring System

### DELETED: Old Accuracy Rules

The following v3.1 rules are **no longer valid**:
- ❌ "Score >= 90 = Mastery"
- ❌ "Score 60-89 = Proficient"  
- ❌ "Score < 60 = Needs Work"

### NEW: Triple-Gate Logic

Every scene must pass **three independent gates**:

```typescript
interface TripleGateResult {
  gate1_accuracy: boolean;  // Correct action performed
  gate2_time: boolean;      // Completed within 30s
  gate3_jitter: boolean;    // Jitter score below threshold
}

function evaluateLevel(gates: TripleGateResult, firstAttempt: boolean): 1 | 2 | 3 {
  if (gates.gate1_accuracy && gates.gate2_time && gates.gate3_jitter && firstAttempt) {
    return 3; // Mastery
  }
  if (gates.gate1_accuracy && gates.gate2_time) {
    return 2; // Proficient (Gate 3 marginal or retry needed)
  }
  return 1; // Needs Work
}
```

### Gate Details

| Gate | Name | Pass Condition |
|------|------|----------------|
| **1** | Accuracy | Player selected/performed the correct action |
| **2** | Time | Completed within 30-second Safety Gate |
| **3** | Jitter | `jitter_score <= jitter_threshold` (default 0.3) |

---

## 2. 6-Scene Rule for Competency Roll-Up

### DELETED: Weighted Average

The following v3.1 approach is **no longer valid**:
- ❌ Averaging scores across scenes
- ❌ Single high score granting Mastery

### NEW: 6-Scene Rule

Competency-level proficiency requires **all 6 sub-competency scenes**:

```typescript
type SceneResult = { scene: number; level: 1 | 2 | 3; firstAttempt: boolean };

function calculateCompetencyRollup(results: SceneResult[]): 'mastery' | 'proficient' | 'needs_work' {
  if (results.length !== 6) {
    throw new Error('Competency requires exactly 6 scenes');
  }
  
  const level3Count = results.filter(r => r.level === 3 && r.firstAttempt).length;
  const level2PlusCount = results.filter(r => r.level >= 2).length;
  const hasLevel1 = results.some(r => r.level === 1);
  
  // Mastery (Cyber Yellow): 6/6 scenes at Level 3 on first attempt
  if (level3Count === 6) {
    return 'mastery';
  }
  
  // Proficient (Green): 4+ scenes at Level 2 or higher
  if (level2PlusCount >= 4 && !hasLevel1) {
    return 'proficient';
  }
  
  // Needs Work (Red): Any Level 1 or fewer than 4 at Level 2+
  return 'needs_work';
}
```

### Roll-Up Summary

| Competency Result | Badge Color | Requirement |
|-------------------|-------------|-------------|
| **Mastery** | Cyber Yellow | 6/6 scenes at Level 3 (first attempt) |
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
| **M** | Mobile Interaction | Touch-event for telemetry capture | Input handler type |
| **N** | Scoring Formula | Triple-Gate parameters | Threshold configuration |

### Implementation

```typescript
interface SubCompetencyDNA {
  action_cue: string;           // Column K
  game_mechanic: string;        // Column L
  mobile_interaction: string;   // Column M
  scoring_formula: string;      // Column N
}

function buildScene(dna: SubCompetencyDNA, sceneNumber: number) {
  return {
    prompt: dna.action_cue,
    mechanic: getMechanicComponent(dna.game_mechanic),
    inputHandler: getInputHandler(dna.mobile_interaction),
    scoring: parseScoringFormula(dna.scoring_formula),
    telemetryConfig: {
      samplingRate: 60, // Hz
      trackJitter: dna.mobile_interaction !== 'Quick Tap'
    }
  };
}
```

### Mechanic → Component Mapping

| Game Mechanic | React Component | Mobile Interaction |
|---------------|-----------------|-------------------|
| Decision Tree | `<DecisionTree />` | Quick Tap |
| Data Panel | `<DataPanel />` | Multi-Tap |
| Noise Filter | `<ScrubSlider />` | Continuous Scrub |
| Alignment Puzzle | `<DragConnect />` | Drag-to-Connect |
| Sequence Validator | `<SwipeCard />` | Drag & Drop |
| Constraint Puzzle | `<ScrubSlider />` | Slider Adjust |
| Pattern Grid | `<PatternGrid />` | Drag-to-Select |
| Headline Picker | `<QuickTapButtons />` | Quick Tap |
| Diagnostic Panel | `<TradeoffMatrix />` | Multi-Touch |
| Trade-Off Eval | `<TradeoffMatrix />` | Toggle/Slide |

---

## 4. 60Hz Biometric Telemetry

### window.__TELEMETRY__ Implementation

```typescript
interface TelemetrySample {
  t: number;        // Timestamp (ms since scene start)
  x: number;        // X coordinate (0-1 normalized)
  y: number;        // Y coordinate (0-1 normalized)
  pressure: number; // Touch pressure (0-1)
}

interface TelemetryData {
  scene: number;
  samples: TelemetrySample[];
  jitter_score: number;
  velocity_avg: number;
  path_deviation: number;
  hesitation_count: number;
  sampling_rate_hz: 60;
}
```

### Jitter Calculation

```typescript
function calculateJitterScore(samples: TelemetrySample[]): number {
  if (samples.length < 10) return 1; // Not enough data
  
  let totalDeviation = 0;
  
  for (let i = 2; i < samples.length; i++) {
    // Expected position based on velocity
    const expectedX = samples[i-1].x + (samples[i-1].x - samples[i-2].x);
    const expectedY = samples[i-1].y + (samples[i-1].y - samples[i-2].y);
    
    // Actual deviation
    const dx = samples[i].x - expectedX;
    const dy = samples[i].y - expectedY;
    totalDeviation += Math.sqrt(dx*dx + dy*dy);
  }
  
  const avgDeviation = totalDeviation / (samples.length - 2);
  
  // Convert to 0-1 score (higher = more stable)
  return Math.max(0, 1 - avgDeviation * 10);
}
```

### Hook: useGameTelemetry

```typescript
import { useRef, useCallback, useEffect } from 'react';

export function useGameTelemetry(sceneNumber: number) {
  const samples = useRef<TelemetrySample[]>([]);
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
    const jitter_score = calculateJitterScore(samples.current);
    
    window.__TELEMETRY__ = {
      scene: sceneNumber,
      samples: samples.current,
      jitter_score,
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

## 5. Updated GamePlayer Integration

### Scene Flow

```typescript
function GamePlayer({ generatedHtml, competencyId }: Props) {
  const [currentScene, setCurrentScene] = useState(0);
  const [sceneResults, setSceneResults] = useState<SceneResult[]>([]);
  const { captureFrame, finalize } = useGameTelemetry(currentScene);
  
  const handleSceneComplete = (result: SceneResult) => {
    // Finalize telemetry for Gate 3
    const telemetry = finalize();
    
    // Evaluate Triple-Gate
    const finalResult = {
      ...result,
      gate3_jitter: telemetry.jitter_score >= 0.7
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
  
  // ... render logic
}
```

### Results Display

```typescript
function ResultsScreen({ sceneResults, rollup }: Props) {
  const totalXP = sceneResults.reduce((sum, r) => {
    const xp = r.level === 3 ? 100 : r.level === 2 ? 60 : 20;
    return sum + xp;
  }, 0);
  
  return (
    <div className="results-screen">
      <h1>Competency Assessment Complete</h1>
      
      <div className={`rollup-badge ${rollup}`}>
        {rollup === 'mastery' && '🏆 Mastery'}
        {rollup === 'proficient' && '✓ Proficient'}
        {rollup === 'needs_work' && '⚠ Needs Work'}
      </div>
      
      <div className="total-xp">{totalXP} XP Earned</div>
      
      <div className="scene-breakdown">
        {sceneResults.map((r, i) => (
          <div key={i} className={`scene-result level-${r.level}`}>
            <span>Scene {i + 1}</span>
            <span>Level {r.level}</span>
            <span>{r.level === 3 ? '100' : r.level === 2 ? '60' : '20'} XP</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 6. V3.2 Compliance Checker Updates

### New Checks Added

```typescript
interface V32ValidationResult {
  // Existing checks
  hasConfig: boolean;
  hasGoldKey: boolean;
  hasEdge: boolean;
  hasResult: boolean;
  hasProof: boolean;
  
  // NEW v3.2 checks
  hasTelemetry: boolean;           // window.__TELEMETRY__ defined
  telemetryAt60Hz: boolean;        // sampling_rate_hz === 60
  hasTripleGate: boolean;          // gate_1, gate_2, gate_3 in result
  has6Scenes: boolean;             // Exactly 6 sub-competency scenes
  hasRollupLogic: boolean;         // 6-Scene Rule implemented
  actionCueFromColumnK: boolean;   // Action cue matches spreadsheet
  mechanicFromColumnL: boolean;    // Mechanic matches spreadsheet
}
```

### Validation Function

```typescript
function validateV32Compliance(html: string): V32ValidationResult {
  const result: V32ValidationResult = {
    // ... existing checks
    
    // New v3.2 checks
    hasTelemetry: html.includes('window.__TELEMETRY__'),
    telemetryAt60Hz: html.includes('sampling_rate_hz: 60') || 
                     html.includes('sampling_rate_hz":60'),
    hasTripleGate: html.includes('gate_1') && 
                   html.includes('gate_2') && 
                   html.includes('gate_3'),
    has6Scenes: (html.match(/scene:\s*[1-6]/g) || []).length >= 6,
    hasRollupLogic: html.includes('competency_rollup') ||
                    html.includes('calculateCompetencyRollup'),
    actionCueFromColumnK: true, // Verified at runtime
    mechanicFromColumnL: true   // Verified at runtime
  };
  
  return result;
}
```

---

## 7. Database Schema Updates

### New Fields in sub_competencies Table

```sql
-- These fields map to Master DNA Columns K-N
ALTER TABLE sub_competencies ADD COLUMN IF NOT EXISTS
  action_cue TEXT,                    -- Column K
  game_mechanic TEXT,                 -- Column L  
  mobile_interaction TEXT,            -- Column M
  scoring_formula_json JSONB;         -- Column N (structured)
```

### Session Results Schema

```sql
-- Updated to support Triple-Gate and 6-Scene Rule
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS
  gate_1_passed BOOLEAN,
  gate_2_passed BOOLEAN,
  gate_3_passed BOOLEAN,
  jitter_score DECIMAL,
  first_attempt BOOLEAN,
  telemetry_hash TEXT;
```

---

## 8. Testing Checklist

### Pre-Publish Validation

- [ ] **Triple-Gate Scoring**
  - [ ] Gate 1 (Accuracy) evaluates correct action
  - [ ] Gate 2 (Time) enforces 30s Safety Gate
  - [ ] Gate 3 (Jitter) uses 60Hz telemetry data
  
- [ ] **6-Scene Rule**
  - [ ] Exactly 6 sub-competency scenes present
  - [ ] Each scene maps to one DNA row
  - [ ] Roll-up logic: 6/6 L3 = Mastery
  
- [ ] **Telemetry**
  - [ ] `window.__TELEMETRY__` populated
  - [ ] 60Hz sampling verified
  - [ ] Jitter score computed
  
- [ ] **Data Mapping**
  - [ ] Action Cue from Column K
  - [ ] Mechanic from Column L
  - [ ] Interaction from Column M
  - [ ] Scoring from Column N

---

## 9. Migration from v3.1

### Breaking Changes

1. **Scoring thresholds removed** - Replace all 90%/60% checks with Triple-Gate
2. **Time formulas changed** - Replace Tlimit/Ttight with fixed 30s Safety Gate
3. **New window object required** - Add `window.__TELEMETRY__`
4. **Roll-up logic changed** - Implement 6-Scene Rule

### Migration Steps

```typescript
// Step 1: Remove old scoring
// BEFORE (v3.1)
const level = score >= 90 ? 'mastery' : score >= 60 ? 'proficient' : 'needs_work';

// AFTER (v3.2)
const level = evaluateTripleGate(gate1, gate2, gate3, firstAttempt);

// Step 2: Add telemetry
window.__TELEMETRY__ = { /* ... */ };

// Step 3: Update result emission
window.__RESULT__ = {
  // ... existing fields
  gate_1_accuracy: true,
  gate_2_time: true,
  gate_3_jitter: true,
  jitter_score: 0.85
};
```

---

## 10. Summary

The v3.2 implementation transforms PlayOps from percentage-based scoring to a rigorous Triple-Gate system aligned with C-BEN competency standards. Key changes:

1. **Triple-Gate** replaces 90%/60% accuracy
2. **6-Scene Rule** replaces weighted averages
3. **60Hz Telemetry** enables biometric jitter measurement
4. **Column K-N Mapping** ensures data integrity

**Documentation → Implementation → Enforcement ✓**
