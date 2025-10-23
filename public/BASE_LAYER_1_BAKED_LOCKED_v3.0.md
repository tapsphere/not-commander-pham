# BASE LAYER 1 = BAKED & LOCKED
# GLOBAL LOCKED GAME ARCHITECTURE

Last Updated: October 2025

Status: Production-Ready (Lovable / Telegram / C-BEN Compliant)

## 🎯 SCENE STRUCTURE (NON-NEGOTIABLE)

### Scene 0 — Intro Screen

**Purpose:** Provide all context before gameplay begins.

#### Required Elements

- Game title (# with clear hierarchy)
- Mission statement (1–2 sentences)
- Objectives (bullet list ≤ 5 items)
- Time limit displayed prominently
- Platform tags (e.g., ⏱ 3 min · 📱 Mobile-Optimized · 🎮 Interactive)
- Scrollable content area for instructions only
- No interactive gameplay elements

#### Mandatory START Button

- Sticky bottom position (`position: sticky; bottom: 1rem; z-index: 30`)
- Full-width (100%) on mobile / 80–90% desktop
- Min-height 56 px (h-14)
- Visual: `background: var(--neon-green)` / white text / uppercase / bold
- Touch-safe (`touch-action: manipulation`)
- Click feedback: scale-98 + opacity transition
- Labels allowed: START GAME, PLAY, BEGIN VALIDATOR

#### Rules

- Game cannot auto-start.
- START button must sit outside scrollable divs.
- Always visible even when scrolling.
- Must emit `console.log('START clicked')` during test.

### Scene 1 — First Action

Begins actual gameplay.

#### Requirements

- Clean interface (no repeated instructions).
- Show only timer + interactive elements.
- Brief context (≤ 1 sentence).
- No scrolling in viewport.
- No Back buttons or breaks in flow.
- Gameplay mechanic starts here (drag, tap, match, etc.).

### Scene 2+ — Subsequent Actions

- Maintain clean interface.
- Progress indicators (round numbers / bars).
- Edge-case interruptions occur here.
- Preserve state between scenes.

### Scene Final — Results Screen

- Large score display (%)
- Level badge (Needs Work / Proficient / Mastery)
- Breakdown of accuracy, time, edge status
- XP reward display
- Buttons: Try Again, Back to Dashboard
- Scrollable for feedback
- No auto-redirect

## 📊 SCORING SYSTEM (LOCKED v3.1)

| Level | Label       | Criteria                                                                      | XP  | Color              |
|-------|-------------|-------------------------------------------------------------------------------|-----|--------------------|
| 1     | Needs Work  | accuracy < 0.85 OR time > Tlimit                                             | 100 | #ef4444            |
| 2     | Proficient  | accuracy ≥ 0.90 AND time ≤ Tlimit                                            | 250 | #facc15            |
| 3     | Mastery     | accuracy ≥ 0.95 AND time ≤ Ttight AND edge_score ≥ 0.80 AND sessions ≥ 3   | 500 | var(--neon-green) |

### Formulas

- `Tlimit = duration_s`
- `Ttight = Tlimit × 0.85`

### Automatic Telemetry (Required)

Each game must emit:

```javascript
window.__RESULT__ = { accuracy, time_s, edge_score, level, passed };
window.__PROOF__ = {
  proof_id, template_id, competency, sub_competency,
  level, metrics:{accuracy,time_s,edge_score,sessions},
  timestamp: new Date().toISOString()
};
```

## 📱 MOBILE REQUIREMENTS (LOCKED)

- Scrollable areas: `overflow-y:auto; max-height:600px; padding:1rem;`
- `-webkit-overflow-scrolling:touch` (iOS momentum)
- Touch targets ≥ 44 px; no double-tap zoom
- Active state: scale-98 + opacity-80 on press
- Responsive ≥ 375 px width (minimum)

## 🪟 MODAL / DIALOG REQUIREMENTS (v3.1)

All pop-ups must use Radix Dialog or semantic HTML dialog:

```html
<dialog role="dialog" aria-modal="true">
  <h2>Feedback</h2>
  <p>Your score: 92%</p>
</dialog>
```

- ESC closes modal; focus trapped inside; aria labels required.
- Z-index hierarchy:
  - Modals: `z-index: 50`
  - Sticky buttons: `z-index: 30`
  - Regular content: `z-index: 10`

## ♿ ACCESSIBILITY REQUIREMENTS (v3.1)

### Keyboard Navigation

- All interactive elements must have `tabIndex` (0 for in-flow, -1 for skip)
- `onKeyDown` handlers for Enter/Space on custom elements
- Logical tab order (top → bottom, left → right)
- Visible focus indicators (outline or ring style)

### Screen Reader Support

- ARIA labels on all buttons (`aria-label="Start game"`)
- `role` attributes where semantic HTML isn't used
- `aria-live` regions for dynamic score/timer updates
- `aria-describedby` for error messages or hints

## 🎨 BRAND CUSTOMIZATION (VARIABLE)

Elements that **can** be customized via Brand Dashboard:

| Element               | Customization Options                                      |
|-----------------------|------------------------------------------------------------|
| Colors                | primary, secondary, accent, highlight, background          |
| Logo                  | ≤ 300×300 px (PNG/SVG)                                     |
| Font Family           | Google Fonts or system stack                               |
| Theme / Scenario      | e.g., "Corporate Office" → "Space Station"                 |
| Cover Photo           | Hero image for game card                                   |
| Avatar / Mascot       | Character image (static, GIF, Lottie, sprite)              |
| Particle Effect       | Confetti, stars, sparkles, none                            |

### Non-Customizable (Locked)

- Scene structure (Intro → Action → Results)
- Scoring logic and thresholds
- Timer mechanics
- Mobile viewport constraints
- Accessibility standards

## ✅ VALIDATION CHECKLIST

Before deploying any validator game:

### Scene Structure
- [ ] Intro screen has scrollable instructions + sticky START button
- [ ] Gameplay scenes (1+) have no scroll, clean UI
- [ ] Results screen shows score, badge, metrics, buttons

### Scoring
- [ ] Emits `window.__RESULT__` with accuracy, time_s, edge_score, level
- [ ] Emits `window.__PROOF__` with full metadata
- [ ] XP values match tier (100/250/500)

### Mobile
- [ ] All touch targets ≥ 44 px
- [ ] No horizontal scroll
- [ ] Scrollable areas use `-webkit-overflow-scrolling: touch`
- [ ] Viewport meta tag prevents zoom

### Modals
- [ ] Uses Dialog component or semantic `<dialog>`
- [ ] ESC key closes modal
- [ ] Focus trapped inside when open

### Buttons
- [ ] START button is sticky and always visible
- [ ] All buttons log actions to console during test
- [ ] Event listeners added after DOMContentLoaded

### Accessibility
- [ ] All interactive elements have `tabIndex`
- [ ] Keyboard navigation works (Enter/Space)
- [ ] ARIA labels present
- [ ] Focus indicators visible

## 🔧 TECHNICAL IMPLEMENTATION NOTES

### Component Structure (React Example)

```
ValidatorDemo.tsx         → main game container
MobileViewport.tsx        → responsive wrapper
AriaButton.tsx            → accessible button primitive
```

### Required State Variables

```javascript
const [scene, setScene] = useState('intro');        // intro | gameplay | results
const [timer, setTimer] = useState(180);            // countdown in seconds
const [score, setScore] = useState(0);              // running score
const [accuracy, setAccuracy] = useState(0);        // 0–1 range
const [edgeTriggered, setEdgeTriggered] = useState(false);
```

### Recommended State Variables

```javascript
const [currentRound, setCurrentRound] = useState(0);
const [userChoices, setUserChoices] = useState([]);
const [feedback, setFeedback] = useState('');
const [level, setLevel] = useState(0);              // 1, 2, or 3
```

### Timer Implementation

```javascript
useEffect(() => {
  if (scene !== 'gameplay') return;
  
  const interval = setInterval(() => {
    setTimer(prev => {
      if (prev <= 1) {
        clearInterval(interval);
        endGame();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
  
  return () => clearInterval(interval);
}, [scene]);
```

## 📋 EMBEDDED CONFIGURATION OBJECTS (v3.1)

Every validator must define these global objects:

### 1. `window.__CONFIG__`

```javascript
window.__CONFIG__ = {
  duration: 180,                          // time limit in seconds
  competency: "Analytical Thinking",      // main competency
  sub: "Trade-Off Analysis",              // sub-competency
  mode: "test",                           // "test" or "training"
  thresholds: {
    a1: 0.85,                             // Level 1 accuracy
    a2: 0.90,                             // Level 2 accuracy
    a3: 0.95                              // Level 3 accuracy
  },
  xp: {
    1: 100,
    2: 250,
    3: 500
  }
};
```

### 2. `window.__GOLD_KEY__`

```javascript
window.__GOLD_KEY__ = {
  sequence: ["A", "C", "B"],              // correct answer path
  edge_case: "C"                          // which step triggers edge
};
```

### 3. `window.__EDGE__`

```javascript
window.__EDGE__ = {
  triggered: true,                        // was edge case shown?
  recovered: true,                        // did player adapt?
  time: 127,                              // seconds when triggered
  score: 0.82                             // performance on edge (0-1)
};
```

### 4. `window.__RESULT__`

```javascript
window.__RESULT__ = {
  accuracy: 0.92,                         // overall accuracy (0-1)
  time_s: 168,                            // completion time in seconds
  edge_score: 0.83,                       // edge case performance (0-1)
  level: 2,                               // 1, 2, or 3
  passed: true                            // boolean
};
```

### 5. `window.__PROOF__`

```javascript
window.__PROOF__ = {
  proof_id: "uuid-here",
  template_id: "template-uuid",
  competency: "Analytical Thinking",
  sub_competency: "Trade-Off Analysis",
  level: 2,
  metrics: {
    accuracy: 0.92,
    time_s: 168,
    edge_score: 0.83,
    sessions: 3
  },
  timestamp: new Date().toISOString()
};
```

## 🎭 AVATAR/MASCOT SYSTEM (v3.1)

### Positioning

| Scene        | Size        | Position               |
|--------------|-------------|------------------------|
| Intro        | 200–250 px  | Center of screen       |
| Gameplay     | 80–120 px   | Top-right corner       |
| Results      | 150–200 px  | Center (celebration)   |

### Animation Types

- **Static PNG**: Simple image file
- **Animated GIF**: 2–4 second loop
- **Lottie JSON**: Vector animation (recommended for high quality)
- **Sprite Sheet**: 4-frame idle animation

### Implementation Example

```javascript
const avatar = brandProfile.avatar_url;

if (avatar.endsWith('.json')) {
  // Load Lottie
  lottie.loadAnimation({
    container: document.getElementById('avatar'),
    path: avatar,
    loop: true
  });
} else {
  // Load static or GIF
  document.getElementById('avatar').src = avatar;
}
```

## ✨ PARTICLE EFFECTS SYSTEM (v3.1)

### Available Effects

- `confetti` — colorful paper burst
- `stars` — golden stars
- `sparkles` — small glitter particles
- `bubbles` — floating circles
- `fireworks` — celebration burst
- `none` — no particles

### When to Trigger

- On correct answer (instant feedback)
- On level completion
- On mastery achievement (results screen)
- On edge case recovery

### Implementation

```javascript
if (brandProfile.particle_effect === 'confetti') {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
}
```

## 🎬 BRAND LOADING SCREEN (v3.1)

### Requirements

- Show brand logo (≤ 300×300 px)
- Duration: ≈ 2.5 seconds
- Animation: pulse effect (scale 1 → 1.05 → 1)
- Background: `backdrop-blur-sm` with brand colors
- Fade out transition before intro screen

### Example Implementation

```html
<div id="loading-screen" class="loading-screen">
  <img src="{{ brand_logo_url }}" alt="Brand Logo" class="logo-pulse">
</div>

<style>
.loading-screen {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    var(--primary-color) 0%, 
    var(--background-color) 100%);
  backdrop-filter: blur(10px);
  z-index: 100;
  animation: fadeOut 0.5s ease 2.5s forwards;
}

.logo-pulse {
  width: 250px;
  height: 250px;
  animation: pulse 2s ease infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.9; }
}

@keyframes fadeOut {
  to { opacity: 0; pointer-events: none; }
}
</style>

<script>
setTimeout(() => {
  document.getElementById('loading-screen').style.display = 'none';
  document.getElementById('intro-screen').style.display = 'block';
}, 3000);
</script>
```

## 🧪 SELF-VALIDATION CHECKLIST (v3.1)

Before submitting any validator:

- [ ] Action verbs in all buttons ("Choose", "Drag", "Sort")
- [ ] No free-text validation anywhere
- [ ] All buttons have DOMContentLoaded event listeners
- [ ] `console.log` for every major action (START, submit, edge trigger)
- [ ] Sticky button at intro (`position: sticky; bottom: 1rem; z-index: 30`)
- [ ] No scrolling during gameplay scenes (Scene 1+)
- [ ] Timer visible at top during gameplay
- [ ] Touch targets ≥ 44 px
- [ ] Telegram hooks initialized before game
- [ ] `window.__RESULT__` and `window.__PROOF__` emitted on results screen
- [ ] Brand logo shows for 2.5s before intro
- [ ] Avatar/mascot positioned correctly (intro/gameplay/results)
- [ ] Particle effects trigger on correct answers (if enabled)

## 🔄 VERSION HISTORY

### v3.1 (October 2025)
- ✅ Added embedded config objects (`__CONFIG__`, `__GOLD_KEY__`, `__EDGE__`)
- ✅ Avatar/mascot positioning and animation types
- ✅ Particle effects system
- ✅ Brand loading screen specification
- ✅ Extended brand customization (accent_color, highlight_color, font_family)
- ✅ Self-validation checklist with action verb requirement

### v3.0 (September 2025)
- ✅ Telegram Mini-App integration mandatory
- ✅ Training vs Testing mode distinction
- ✅ Mastery level requires ≥ 3 sessions
- ✅ Updated scoring color for Level 3 (var(--neon-green))

### v2.0 (August 2025)
- ✅ Dialog component requirement for modals
- ✅ Accessibility requirements (keyboard + ARIA)
- ✅ Mobile touch optimization standards

### v1.0 (July 2025)
- Initial locked architecture

---

✅ **This v3.1 doc is fully synchronized with:**
- AI Generation Prompt (v3.1)
- Platform Flows (v3.1)
- C-BEN PlayOps Framework
- Telegram Mini-App Guidelines
