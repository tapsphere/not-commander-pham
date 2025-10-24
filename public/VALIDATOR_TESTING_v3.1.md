# VALIDATOR TESTING v3.1
## Automated Quality & C-BEN Alignment Framework

Last Updated: October 2025 – Lovable Implementation Synced

## 1. Purpose

To ensure every validator mini-game is playable, measurable, and C-BEN compliant before publication.

This replaces the manual three-phase QA flow; testing is now automated inside Lovable and validates both technical integrity and competency proof accuracy.

## 2. Scope

Applies to all validators—AI-generated or custom-uploaded—before they can be marked Publish = True.

Each validator must:
- Follow Base Layer 1 scene and scoring architecture
- Include all embedded global objects (`__CONFIG__`, `__GOLD_KEY__`, `__EDGE__`, `__RESULT__`, `__PROOF__`)
- Pass 100% of automated checks described below

## 3. Automated Testing Pipeline

The system performs 8 sequential checks every time the creator clicks "Test Validator."

### ✅ Check 1 – Scene Structure Validation

**Validates the 4-scene structure:**
- **Intro** - No auto-start on load
- **Gameplay** - START button present, sticky, full-width, functional
- **Edge-Case** - No instructions repeat after Scene 0
- **Results** - Edge cases occur only in designated scenes

### ✅ Check 2 – UX/UI Integrity

- No vertical scrolling during gameplay (`overflow:hidden`, `height:100vh`)
- No text overlap or clipped content at 390 × 844 viewport
- All buttons clickable and visually respond (active, hover, touched)
- Touch targets ≥ 44px
- START button remains visible on all devices

### ✅ Check 3 – Telegram Mini-App Compliance

- Contains `window.Telegram.WebApp.ready()` and `expand()`
- Game runs seamlessly in Telegram WebApp frame
- No network calls outside approved endpoints

### ✅ Check 4 – Embedded Configuration Objects

Verifies presence and validity of required globals:

| Object | Purpose |
|--------|---------|
| `__CONFIG__` | duration, thresholds, competency, XP |
| `__GOLD_KEY__` | correct answers / logic map |
| `__EDGE__` | edge-case trigger + recovery log |
| `__RESULT__` | computed accuracy, time, edge success |
| `__PROOF__` | immutable proof receipt (test mode only) |

### ✅ Check 5 – Action Cue & Mechanic Alignment

- Extracts verb + object from sub-competency
- Confirms mechanic (drag-drop, select, swipe, etc.) surfaces that behavior
- Ensures no free-text inputs
- Validates event triggers match action cue pattern (observable, measurable)

### ✅ Check 6 – Scoring Formula Verification

- Runs 3 auto-plays (poor / average / excellent)
- Confirms accuracy thresholds (A1 = 0.85, A2 = 0.90, A3 = 0.95)
- Confirms time limits (T1 = 90s, T2 = 90s, T3 = 75s)
- Confirms edge-case bonus E3 ≥ 0.8
- Verifies outputs map to Level 1–3

### ✅ Check 7 – Accessibility & Mobile Readiness

- `aria-label` present for all interactive items
- Keyboard navigation (Enter/Space) works
- Screen-reader headings h1→h3 hierarchy valid
- Contrast ratio ≥ 4.5:1

### ✅ Check 8 – Proof Emission & Telemetry

- Confirms JSON payload posted to `/api/validator-proof`
- Must include: score, time, edgeCase, accuracy, level, timestamp
- Confirms identical data appears in `__RESULT__`
- Verifies immutable proof receipt generation (hash + timestamp)

## 4. Result Classification

| Outcome | Condition | Action |
|---------|-----------|--------|
| 🟢 Passed | All 8 checks = true | "Approve for Publish" unlocks |
| 🟡 Needs Review | Minor UI / accessibility warnings | Flag for manual QA |
| 🔴 Failed | Any critical check fails | Must fix and re-test |

## 5. Edge Case Testing Mode

When Testing Mode is enabled, edge cases are automatically triggered during automated testing to verify proper handling and recovery.

## 6. Outputs & Storage

- Pass/fail summary stored in `validator_tests` table
- Full QA log (JSON) archived for audit
- Proof receipts minted to TON chain when Testing Mode = true

## 7. Alignment with C-BEN Framework

Each automatic check maps to C-BEN's Quality Framework hallmarks:

| C-BEN Quality Principle | PlayOps Validator Testing Mapping |
|------------------------|-----------------------------------|
| Authentic Assessment | Action Cue & Mechanic Alignment (Check 5) |
| Observable Performance | Proof Emission & Telemetry (Check 8) |
| Clear Criteria | Scoring Formula Verification (Check 6) |
| Reliable Measurement | Embedded Configuration Objects (Check 4) |
| Transparency of Evidence | Immutable Proof Receipts + Results Screen |
| Equity & Accessibility | Accessibility Checks (Check 7) |
| Continuous Improvement | QA logs feeding training data for AI generator |

## 8. Developer Reference (Integration Snippets)

### Telegram Initialization
```javascript
if (window.Telegram && window.Telegram.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();
}
```

### Mandatory Globals
```javascript
window.__CONFIG__ = {...};
window.__GOLD_KEY__ = {...};
window.__EDGE__ = {...};
window.__RESULT__ = {...};
window.__PROOF__ = {...};
```

### Proof Emission
```javascript
fetch('/api/validator-proof', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify(window.__RESULT__)
});
```

## 9. Governance & Versioning

- **Maintained by:** Platform Architecture Team
- **Next Review:** January 2026
- **Related Docs:** Base Layer 1 (v3.1) · AI Generation Prompt (v3.1) · Platform Flows (v3.1)
