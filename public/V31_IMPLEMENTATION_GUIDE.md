# BASE LAYER 1 v3.1 Implementation Guide

## Overview

This document explains how the platform now **enforces** the BASE LAYER 1 v3.1 specification ("BAKED & LOCKED"). Previously, the spec existed only in documentation and AI generation prompts. Now, the platform actively validates and uses v3.1 game data.

---

## What Changed

### Before (Documentation Only)
- ✅ BASE_LAYER_1 v3.1 spec documented
- ✅ AI generates games with v3.1 structure
- ❌ Platform doesn't validate compliance
- ❌ GamePlayer hardcodes games
- ❌ Results don't use v3.1 scoring

### After (Fully Enforced)
- ✅ BASE_LAYER_1 v3.1 spec documented
- ✅ AI generates games with v3.1 structure
- ✅ **Platform validates v3.1 compliance**
- ✅ **GamePlayer loads generated HTML in iframe**
- ✅ **Results use v3.1 proficiency levels & XP**

---

## Architecture Components

### 1. Validation Utility (`src/utils/v3Validator.ts`)

**Purpose:** Validates generated game HTML against v3.1 spec

**Key Functions:**
```typescript
// Validate full v3.1 compliance
validateV31Compliance(html: string): V3ValidationResult

// Extract window objects from running game
extractWindowObjects(iframeWindow: Window)

// Calculate v3.1 proficiency level
calculateV31Level(score: number): 'Mastery' | 'Proficient' | 'Needs Work'

// Calculate XP based on v3.1 formula
calculateV31XP(level, score): number
```

**What It Checks:**
- ✅ Required window objects: `__CONFIG__`, `__GOLD_KEY__`, `__EDGE__`, `__RESULT__`, `__PROOF__`
- ✅ Scene structure: Intro (Scene 0), Actions (Scene 1+), Final Results
- ✅ v3.1 scoring: Mastery/Proficient/Needs Work levels with XP values
- ✅ Mobile optimization: viewport meta, touch support
- ✅ Accessibility: ARIA labels, keyboard nav, focus indicators

### 2. Iframe Communication Hook (`src/hooks/useGameIframe.ts`)

**Purpose:** Manages iframe lifecycle and reads game results

**Features:**
- Loads generated game HTML in sandboxed iframe
- Polls for `window.__RESULT__` and `window.__PROOF__` objects
- Listens for `postMessage` events from game
- Extracts v3.1 telemetry data when game completes

**Usage:**
```typescript
const { iframeRef, isReady, result, proof, handleIframeLoad } = useGameIframe({
  onComplete: (result, proof) => {
    // result contains: score, level, xp, time_spent
    // proof contains: actions, timestamps, competency_scores
  }
});
```

### 3. Updated GamePlayer (`src/components/platform/GamePlayer.tsx`)

**Before:**
- Hardcoded `BudgetAllocationGame` component
- Generic score display
- No XP calculation

**After:**
- Loads `generatedGameHtml` in iframe (if available)
- Reads `window.__RESULT__` for v3.1 scoring
- Displays proficiency badges: **Mastery**, **Proficient**, **Needs Work**
- Shows XP earned based on v3.1 formula
- Falls back to demo game if no HTML provided

### 4. V3 Compliance Checker (`src/components/platform/V3ComplianceChecker.tsx`)

**Purpose:** Visual UI component to validate games before publish

**Features:**
- Runs full v3.1 compliance check on generated HTML
- Shows compliance score (0-100%)
- Lists critical errors (missing window objects)
- Shows warnings (scene structure, accessibility)
- Detailed breakdown by category

**Usage:**
```typescript
<V3ComplianceChecker 
  html={generatedGameHtml} 
  onTest={() => playGame()} 
/>
```

---

## v3.1 Scoring System (Enforced)

The platform now enforces these exact scoring levels:

| Level | Score Range | XP Base | Color | Description |
|-------|-------------|---------|-------|-------------|
| **Mastery** | 90-100% | 100 XP | Green | Expert understanding, exceeds expectations |
| **Proficient** | 60-89% | 60 XP | Yellow | Competent performance, meets standards |
| **Needs Work** | <60% | 20 XP | Red | Requires improvement, below threshold |

**Formula:**
```typescript
// Level determination
if (score >= 90) level = 'Mastery'
else if (score >= 60) level = 'Proficient'
else level = 'Needs Work'

// XP calculation
xp = baseXP[level]
```

**Example:**
- Score: 87% → Level: Proficient → XP: 60
- Score: 95% → Level: Mastery → XP: 100
- Score: 45% → Level: Needs Work → XP: 20

---

## Required Window Objects

All v3.1 games **must** expose these objects:

### 1. `window.__CONFIG__`
```typescript
{
  brandName: string;
  primaryColor: string;
  secondaryColor: string;
  logo: string;
  timeLimit: number;
}
```

### 2. `window.__GOLD_KEY__`
```typescript
{
  subCompetency: string;
  correctAnswers: any[];
  scoringRubric: {
    mastery: { threshold: 0.9, xp: 100 };
    proficient: { threshold: 0.6, xp: 60 };
    needsWork: { threshold: 0, xp: 20 };
  };
}
```

### 3. `window.__EDGE__`
```typescript
{
  scenario: string;  // Edge-case description
  triggerCondition: string;  // When to trigger
}
```

### 4. `window.__RESULT__` (Emitted on completion)
```typescript
{
  score: number;  // 0-100
  level: 'Mastery' | 'Proficient' | 'Needs Work';
  xp: number;  // Based on level
  time_spent: number;  // Seconds
  competency_name?: string;
}
```

### 5. `window.__PROOF__` (Telemetry)
```typescript
{
  actions: Array<{
    timestamp: number;
    action: string;
    data: any;
  }>;
  timestamps: number[];
  competency_scores: Record<string, number>;
  raw_answers?: any[];
}
```

---

## Integration Points

### For Game Generators (AI)

The `generate-game` edge function already includes v3.1 prompt. Generated games should:
1. Define all 5 window objects
2. Use v3.1 scene structure (Scene 0 → Scene 1+ → Final Results)
3. Emit `window.__RESULT__` when game completes
4. Store telemetry in `window.__PROOF__`

### For Validators/Testers

Use the `V3ComplianceChecker` component:

```typescript
import { V3ComplianceChecker } from '@/components/platform/V3ComplianceChecker';

<V3ComplianceChecker 
  html={generatedGameHtml}
  onTest={() => startTestRun()}
/>
```

This will show a compliance report before publishing.

### For Players

The `GamePlayer` automatically:
1. Loads generated HTML in iframe
2. Polls for `window.__RESULT__`
3. Displays v3.1 scoring when game completes
4. Shows Mastery/Proficient/Needs Work badge
5. Calculates and displays XP earned

---

## Testing Checklist

Before publishing a v3.1 validator:

- [ ] Run `validateV31Compliance()` on HTML
- [ ] Compliance score ≥ 80%
- [ ] All 5 window objects present
- [ ] Scene structure validated
- [ ] Test in GamePlayer iframe
- [ ] Verify `window.__RESULT__` emits correctly
- [ ] Check XP calculation matches level
- [ ] Validate mobile responsive
- [ ] Test accessibility (keyboard nav, ARIA)

---

## Future Enhancements

### Phase 1 (Current)
- ✅ v3.1 validation utility
- ✅ Iframe communication
- ✅ Updated GamePlayer with v3.1 scoring
- ✅ Compliance checker UI

### Phase 2 (Next)
- [ ] Automated testing in CI/CD
- [ ] Real-time validation during generation
- [ ] Historical compliance tracking
- [ ] Analytics dashboard for v3.1 metrics

### Phase 3 (Future)
- [ ] Visual scene structure debugger
- [ ] Interactive compliance fixer
- [ ] Batch validation for template libraries
- [ ] AI-powered compliance suggestions

---

## Troubleshooting

### "Missing window.__RESULT__" Error
**Problem:** GamePlayer can't read result from iframe  
**Solution:** Ensure game emits `window.__RESULT__` before completion

### Compliance Score < 60%
**Problem:** Multiple missing v3.1 requirements  
**Solution:** Review BASE_LAYER_1 spec, regenerate game with updated prompt

### Iframe Not Loading
**Problem:** Sandbox restrictions or script errors  
**Solution:** Check browser console, verify HTML is valid

### Wrong XP Calculation
**Problem:** XP doesn't match expected value  
**Solution:** Verify level assignment first (Mastery ≥90, Proficient ≥80)

---

## Summary

The platform now **enforces** BASE LAYER 1 v3.1 instead of just documenting it. Generated games are validated, played in iframes, and scored using the v3.1 proficiency system. This ensures consistent, high-quality validators that meet C-BEN standards.

**Key Takeaway:** Documentation → Implementation → Enforcement ✓
