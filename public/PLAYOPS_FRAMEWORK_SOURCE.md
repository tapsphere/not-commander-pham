# PlayOps Framework - Source of Truth

**Source File:** `CBEN_PlayOps_Framework_Finale-2.xlsx`

This spreadsheet is the **authoritative source** for all validator game design, scoring, and XP values. All code must reflect the data defined in this spreadsheet.

---

## Tab 3: Game Design Specifications

For each Sub-Competency, defines:

| Column | Purpose | Example |
|--------|---------|---------|
| **Action Cue** | What the player actually does (observable behavior) | "Select the correct resource allocation plan within 90s" |
| **Game Mechanic** | The interactive logic type | "Run Resource Allocation Puzzle (performance task)" |
| **Game Loop** | Evidence cycle | "Input → Action → Feedback → Submit" |
| **Scoring Formula** | Level 1-3 thresholds with time/accuracy | "L1 acc<0.85 or t>90 / L2 acc≥0.90 t≤90 / L3 acc≥0.95 t≤75 edge≥0.80 sess≥3" |
| **Validator Type** | Assessment family | "Scenario-Based Simulation" |

### Example (Analytical Thinking - Multi-Constraint Problems)

```
Action Cue: Select the correct resource allocation plan within 90s
Game Mechanic: Resource Allocation Puzzle (Scenario-Based Simulation)
Game Loop: Input → Action → Feedback → Submit
Scoring:
  L1: acc<0.85 OR t>90
  L2: acc≥0.90 AND t≤90
  L3: acc≥0.95 AND t≤75 AND edge≥0.80 AND sess≥3
Validator Type: Scenario-Based Simulation
```

---

## Tab 4: XP Awards & Level Definitions

### Proficiency Levels (DO NOT MODIFY)

| Level | Name | XP Award | Quantitative Benchmark | Proof Receipt |
|-------|------|----------|------------------------|---------------|
| **L1** | Needs Work | **100 XP** | acc<0.85 OR t>Tlimit | Proof Receipt – Failed Record |
| **L2** | Proficient | **250 XP** | acc≥0.90 AND t≤Tlimit | Proof Receipt – Validated Action |
| **L3** | Mastery | **500 XP** | acc≥0.95 AND t≤Ttight AND edge≥0.80 AND sess≥3 | Proof Receipt – Mastery Verified |

### Scoring Logic

```javascript
// From PlayOps spreadsheet - authoritative formulas
if (accuracy < 0.85 || time_s > Tlimit) {
  level = 1; // Needs Work
  xp = 100;
} else if (accuracy >= 0.90 && time_s <= Tlimit) {
  if (accuracy >= 0.95 && time_s <= Ttight && edge_score >= 0.80 && sessions >= 3) {
    level = 3; // Mastery
    xp = 500;
  } else {
    level = 2; // Proficient
    xp = 250;
  }
}
```

---

## Code Implementation

### 1. Database Schema

The `sub_competencies` table already has these fields:

```sql
CREATE TABLE sub_competencies (
  id UUID PRIMARY KEY,
  statement TEXT NOT NULL,
  action_cue TEXT,                    -- Maps to Tab 3: Action Cue
  game_mechanic TEXT,                 -- Maps to Tab 3: Game Mechanic
  game_loop TEXT,                     -- Maps to Tab 3: Game Loop Summary
  validator_type TEXT,                -- Maps to Tab 3: Validator Type
  backend_data_captured JSONB,        -- What telemetry to collect
  scoring_logic JSONB,                -- Parsed scoring formula
  scoring_formula_level_1 TEXT,       -- L1 formula string
  scoring_formula_level_2 TEXT,       -- L2 formula string
  scoring_formula_level_3 TEXT,       -- L3 formula string
  player_action TEXT,                 -- Select, Match, Identify, etc.
  ...
);
```

### 2. AI Generation (`generate-game`)

When generating games, the system prompt includes:

```javascript
window.__CONFIG__ = {
  xp: {
    L1: 100,  // From spreadsheet Tab 4
    L2: 250,
    L3: 500
  }
};

// Action Cue from Tab 3
"Select the correct resource allocation plan within 90s"

// Scoring from Tab 3
L1: acc<0.85 or t>90
L2: acc≥0.90 t≤90
L3: acc≥0.95 t≤75 edge≥0.80 sess≥3
```

### 3. Validation (`v3Validator.ts`)

```typescript
export function calculateV31XP(
  level: 'Mastery' | 'Proficient' | 'Needs Work',
  score: number
): number {
  const baseXP = {
    Mastery: 500,        // Tab 4: L3
    Proficient: 250,     // Tab 4: L2
    'Needs Work': 100,   // Tab 4: L1
  };
  return Math.floor(baseXP[level] * (score / 100));
}
```

---

## Action Cue Verbs (Safelist)

From Tab 3, all Action Cues use these verbs:

- **Select** (most common)
- **Choose**
- **Identify**
- **Match**
- **Classify**
- **Order**
- **Allocate**
- **Flag**
- **Route**

### Examples:
- "Select the correct resource allocation plan within 90s"
- "Choose the best trade-off option for the stated objective within 90s"
- "Identify the outlier or pattern match within 60s"
- "Match two unrelated concepts to create a viable idea within 120s"

---

## Updating the Framework

**To modify XP values, scoring formulas, or game mechanics:**

1. Update the spreadsheet (`CBEN_PlayOps_Framework_Finale-2.xlsx`)
2. Re-sync the following files:
   - `supabase/functions/generate-game/index.ts` (system prompt)
   - `src/utils/v3Validator.ts` (XP calculation)
   - Update `sub_competencies` table if needed
3. Test validator generation with new values
4. Run v3 compliance checks

**DO NOT hardcode values that diverge from the spreadsheet.**

---

## Game Loop Standard

All validators follow this cycle (Tab 3):

```
Input → Action → Feedback → Submit
```

**Breakdown:**
1. **Input**: Present scenario/data to player
2. **Action**: Player makes decision (select, match, allocate)
3. **Feedback**: Show correctness (training mode only)
4. **Submit**: Record result, calculate score

---

## Validator Type Families (Tab 3)

Maps to C-BEN assessment methods:

- **Scenario-Based Simulation** (most common)
- **Case Analysis**
- **Data Analysis**
- **Communication Product**
- **Project / Artifact**
- **Performance Demonstration**
- **Portfolio / Reflection**

Each sub-competency specifies which family it belongs to.

---

## Time Limits (Tab 3)

Standard time limits per validator:
- **60s**: Quick pattern recognition, classification
- **90s**: Most decision-making validators
- **120s**: Complex scenarios, multi-step tasks

**Ttight formula:** `Tlimit * 0.85` (for Mastery level)

Example:
- Tlimit = 90s → Ttight = 75s
- Tlimit = 120s → Ttight = 100s

---

## Summary

The spreadsheet defines:
- **What players do** (Action Cue)
- **How they do it** (Game Mechanic)
- **What we measure** (Backend Data)
- **How we score** (Formula L1/L2/L3)
- **What they earn** (XP: 100/250/500)

All code must reflect this source of truth. Any deviations must first be documented in the spreadsheet.
