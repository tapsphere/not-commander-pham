# BASE LAYER 1 = BAKED & LOCKED (v3.1)

## GLOBAL GAME ARCHITECTURE (Production-Ready Blueprint)

This document defines the non-negotiable structure for all validator mini-games. These requirements are LOCKED and must be followed exactly to ensure compliance with scoring, accessibility, mobile optimization, and brand customization standards.

## SCENE STRUCTURE (NON-NEGOTIABLE)

### Scene 0: Intro Screen

Purpose: Set context and prepare player

#### Required elements:

- Competency name (large, prominent heading)
- Sub-competency being measured (smaller subheading)
- Brief description (2-3 sentences max)
- Game instructions (bullet points preferred)
- "Start Game" button (minimum 48px tall, full-width on mobile)
- Brand logo in top-left corner
- Avatar/mascot visible if configured

#### UI Requirements:

- Must be scrollable if content exceeds viewport
- Start button must remain visible (sticky footer recommended)
- No auto-start or countdown timers
- Must call Telegram.WebApp.HapticFeedback on button press

### Scene 1: First Action

Purpose: Core gameplay begins

#### Required elements:

- Clear prompt or challenge statement
- Interactive elements sized for touch (≥48px)
- Visual feedback for each interaction
- Progress indicator if multi-step
- Timer display (for player reference only)

#### Interaction Requirements:

- Must support keyboard navigation
- Must provide haptic feedback on mobile
- Must track timestamp of each action
- Must validate actions against GOLD_KEY

### Scene 2+: Subsequent Actions

Purpose: Multi-step challenges or decision trees

#### Required elements:

- Consistent UI with Scene 1
- Clear transition animations between steps
- Accumulated score/progress visible
- Back button if non-linear navigation allowed

### Final: Results Screen

Purpose: Performance feedback and XP award

#### Required elements:

- Performance level badge (visual + text)
- XP earned (large number, color-coded)
- Time taken (formatted as MM:SS)
- Key metrics (accuracy, efficiency, etc.)
- Detailed feedback (2-3 sentences)
- "Play Again" button
- "Return to Dashboard" button (if applicable)

#### Visual Requirements:

- Badge must be prominent and match performance level
- Color coding consistent with scoring system
- Scrollable content for detailed breakdown
- Clear visual hierarchy

## SCORING SYSTEM (LOCKED v3.1)

### Performance Levels

#### 1. Mastery (90%+ optimal)
- **XP**: 100
- **Color**: hsl(142, 71%, 45%) - Green
- **Criteria**: ≥90% accuracy AND time ≤ Ttight
- **Badge**: Gold star icon

#### 2. Proficient (60-89% optimal)
- **XP**: 60
- **Color**: hsl(48, 96%, 53%) - Yellow
- **Criteria**: 60-89% accuracy OR time between Ttight and Tlimit
- **Badge**: Silver star icon

#### 3. Needs Work (<60% optimal)
- **XP**: 20
- **Color**: hsl(0, 84%, 60%) - Red
- **Criteria**: <60% accuracy OR time > Tlimit
- **Badge**: Bronze icon

### Time Formulas

- **Tlimit** = optimal_time × 2.0 (absolute maximum)
- **Ttight** = optimal_time × 1.2 (mastery threshold)

#### Example

If optimal_time = 60 seconds:
- Ttight = 72 seconds (need to finish within this for mastery)
- Tlimit = 120 seconds (exceed this = needs work)

### Scoring Calculation

```
score = (accuracy_weight × accuracy) + (efficiency_weight × efficiency)
```

Where:
- accuracy = correct_actions / total_actions
- efficiency = 1 - (actual_time - optimal_time) / optimal_time
- accuracy_weight = 0.7
- efficiency_weight = 0.3

## TELEMETRY (AUTOMATIC EMISSION)

### window.__RESULT__ (Emit on results screen load)

```javascript
window.__RESULT__ = {
  level: "needs_work" | "proficient" | "mastery",
  xp: 20 | 60 | 100,
  time_ms: number,
  score: number,
  competency_id: string,
  subcompetency_id: string,
  timestamp: number,
  mode: "training" | "testing",
  player_id: string // if available
}
```

### window.__PROOF__ (Emit before results screen)

```javascript
window.__PROOF__ = {
  timestamp: number,
  actions: [
    { action: string, time_ms: number, correct: boolean, scene: number }
  ],
  accuracy: number,
  efficiency: number,
  total_time_ms: number,
  gold_key_match: boolean,
  edge_case_handled: boolean
}
```

## MOBILE & RESPONSIVE REQUIREMENTS

### Touch Targets

- Minimum size: 48px × 48px
- Spacing: 8px minimum between interactive elements
- Buttons: Full-width on screens <640px

### Scrolling

- All scenes must support vertical scroll if content exceeds viewport
- Use `overflow-y: auto` on scene containers
- Sticky header/footer for navigation buttons

### Viewport

- Design for 375px width minimum
- Use 100vh for full-screen scenes
- No horizontal scrolling allowed

### Gestures

- Support touch, mouse, and keyboard input
- Haptic feedback on all interactions (mobile)
- Smooth transitions between scenes

## MODAL & DIALOG REQUIREMENTS

### Implementation

- Use Radix Dialog or semantic HTML `<dialog>` element
- Must include close button (X icon in top-right)
- Must close on ESC key press
- Must trap focus when open
- Must return focus to trigger element on close

### Overlay

- Semi-transparent background (rgba(0,0,0,0.5) or similar)
- Blur effect on background content (backdrop-filter recommended)
- Click overlay to close (optional but recommended)

### Content

- Max-width: 500px on desktop
- Full-width with padding on mobile
- Scrollable if content exceeds max-height
- Close button always visible (sticky if needed)

## ACCESSIBILITY (WCAG 2.1 Level AA)

### Keyboard Navigation

- Tab order must be logical
- All interactive elements must have tabIndex
- Enter/Space to activate buttons
- ESC to close modals
- Arrow keys for sliders and selectable lists

### Focus Indicators

- Visible outline on focus (minimum 2px)
- Use outline-offset for better visibility
- Color contrast ratio ≥3:1 against background

### Screen Readers

- ARIA labels on all interactive elements
- Semantic HTML throughout
- Status announcements for dynamic changes
- Descriptive alt text for images

### Visual

- Color contrast ratio ≥4.5:1 for normal text
- Color contrast ratio ≥3:1 for large text (≥18pt)
- Do not rely on color alone to convey information
- Provide text alternatives for icons

## BRAND CUSTOMIZATION (CONFIGURABLE)

### Customizable via Brand Dashboard

- Primary color (HSL)
- Secondary color (HSL)
- Accent color (HSL)
- Font family (heading)
- Font family (body)
- Logo URL
- Avatar URL
- Particle effect type
- Brand name

### Application Method

Use CSS variables injected at runtime:

```css
:root {
  --brand-primary: 220 70% 50%;
  --brand-secondary: 280 60% 50%;
  --brand-accent: 160 60% 45%;
  --brand-font-heading: 'Inter', sans-serif;
  --brand-font-body: 'Inter', sans-serif;
  --brand-logo-url: url('https://...');
}
```

### Usage in Components

```css
/* Correct */
background-color: hsl(var(--brand-primary));
font-family: var(--brand-font-heading);

/* Incorrect */
background-color: #3b82f6; /* hardcoded color */
```

### Non-Customizable (Locked)

- Scene structure (Intro → Gameplay → Results)
- Scoring thresholds (90%/60%)
- XP values (100/60/20)
- Time formulas (Tlimit, Ttight)
- Telemetry object structures
- Accessibility requirements
- Mobile touch target sizes
- Telegram integration method

## EMBEDDED CONFIGURATION (window.__CONFIG__)

All validator games must define this object:

```javascript
window.__CONFIG__ = {
  competency_id: "analytical_thinking",
  subcompetency_id: "data_interpretation",
  mode: "training", // or "testing"
  avatar_url: "https://..." || null,
  particle_effect: "confetti", // or "sparkles" or "none"
  brand_name: "Acme Corp",
  optimal_time: 90, // seconds
  difficulty: "medium" // or "easy" or "hard"
}
```

## GOLD KEY DEFINITION (window.__GOLD_KEY__)

Defines the optimal solution path:

```javascript
window.__GOLD_KEY__ = {
  optimal_path: [
    { action: "select_option", value: "A", scene: 1 },
    { action: "drag_item", from: "source", to: "target", scene: 2 },
    { action: "confirm_choice", scene: 2 }
  ],
  optimal_time: 90,
  optimal_score: 100,
  acceptable_variations: [
    ["select_option:B", "adjust_choice:A"]
  ]
}
```

## EDGE CASE CONFIGURATION (window.__EDGE__)

Optional advanced scenario:

```javascript
window.__EDGE__ = {
  enabled: true,
  scenario: "Incomplete data set with missing values",
  expected_behavior: "Player should acknowledge uncertainty and request more information",
  trigger_condition: "after_scene_2",
  scoring_impact: 0.15 // 15% of total score
}
```

## RESULT EMISSION (window.__RESULT__)

Automatically emitted on results screen:

```javascript
window.__RESULT__ = {
  level: "mastery",
  xp: 100,
  time_ms: 87340,
  score: 94.5,
  competency_id: "analytical_thinking",
  subcompetency_id: "data_interpretation",
  timestamp: Date.now(),
  mode: "testing",
  player_id: "telegram_user_id" // if available
}
```

## PROOF EMISSION (window.__PROOF__)

Emitted before transitioning to results:

```javascript
window.__PROOF__ = {
  timestamp: Date.now(),
  actions: [
    { action: "select_option", time_ms: 5200, correct: true, scene: 1 },
    { action: "drag_item", time_ms: 12400, correct: true, scene: 2 },
    { action: "confirm_choice", time_ms: 3100, correct: true, scene: 2 }
  ],
  accuracy: 1.0,
  efficiency: 0.89,
  total_time_ms: 87340,
  gold_key_match: true,
  edge_case_handled: true
}
```

## AVATAR/MASCOT IMPLEMENTATION

### Positioning

```css
position: fixed;
bottom: 20px;
right: 20px;
width: 80px;
height: 80px;
z-index: 100;
border-radius: 50%;
box-shadow: 0 4px 12px rgba(0,0,0,0.15);
```

### Animations

#### Bounce (idle):
```css
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

#### Celebrate (on success):
```css
@keyframes celebrate {
  0% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.2) rotate(-10deg); }
  75% { transform: scale(1.2) rotate(10deg); }
  100% { transform: scale(1) rotate(0deg); }
}
```

#### Wave (on hover):
```css
@keyframes wave {
  0% { transform: rotate(0deg); }
  10% { transform: rotate(14deg); }
  20% { transform: rotate(-8deg); }
  30% { transform: rotate(14deg); }
  40% { transform: rotate(-4deg); }
  50% { transform: rotate(10deg); }
  60% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
}
```

### Trigger Events

- **Idle**: Always (subtle bounce)
- **Celebrate**: On correct action or mastery result
- **Wave**: On hover (desktop only)
- **Pulse**: On hint or guidance message

## PARTICLE EFFECTS

### Available Effects

#### Confetti:
- Library: canvas-confetti
- Trigger: Results screen load (if mastery)
- Configuration: `{ particleCount: 100, spread: 70, origin: { y: 0.6 } }`

#### Sparkles:
- Custom CSS animation
- Trigger: Correct action completion
- Duration: 1 second
- Position: Around avatar or action element

#### None:
- No particle effects
- Use for minimal/professional brands

### Implementation Example

```javascript
if (window.__CONFIG__.particle_effect === 'confetti' && level === 'mastery') {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
}
```

## BRAND LOADING SCREEN

### Requirements

- Display brand logo centered
- Show "Loading game..." text
- Animated spinner or progress indicator
- Fade out when game loads (300ms transition)
- Use brand primary color for spinner

### Implementation

```html
<div id="loading-screen" style="position: fixed; inset: 0; background: hsl(var(--brand-primary)); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 9999;">
  <img src="brand-logo.png" alt="Brand Logo" style="width: 200px; margin-bottom: 2rem;" />
  <p style="color: white; font-size: 1.125rem; margin-bottom: 1rem;">Loading game...</p>
  <div class="spinner"></div>
</div>
```

```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
```

```javascript
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loading-screen').style.opacity = '0';
    setTimeout(() => {
      document.getElementById('loading-screen').style.display = 'none';
    }, 300);
  }, 1000);
});
```

## SELF-VALIDATION CHECKLIST

Before publishing, verify:

### Scene Structure
- ✓ Scene 0 present with all required elements
- ✓ Scene 1 begins gameplay cleanly
- ✓ Scene 2+ handles multi-step or edge cases
- ✓ Results screen present with all required metrics
- ✓ Transitions between scenes are smooth

### Scoring & Telemetry
- ✓ `__CONFIG__` object defined correctly
- ✓ `__GOLD_KEY__` object defines optimal path
- ✓ `__EDGE__` object configured if edge case used
- ✓ `__RESULT__` emitted on results screen
- ✓ `__PROOF__` emitted before results
- ✓ Scoring follows v3.1 thresholds (90%/60%)

### Mobile & Touch
- ✓ All touch targets ≥48px
- ✓ Scenes are scrollable if content overflows
- ✓ No horizontal scrolling
- ✓ Haptic feedback on all button presses
- ✓ Tested at 375px width

### Modals & Dialogs
- ✓ Close button (X) in top-right
- ✓ ESC key closes modal
- ✓ Focus trapped when modal open
- ✓ Overlay dismisses modal (optional)

### Buttons & Forms
- ✓ All buttons have type attribute
- ✓ Disabled state visually distinct
- ✓ Loading state for async actions
- ✓ Error messages displayed clearly

### Accessibility
- ✓ Keyboard navigation works (Tab, Enter, ESC)
- ✓ Focus indicators visible
- ✓ ARIA labels on icon-only buttons
- ✓ Semantic HTML used throughout
- ✓ Color contrast ratios meet WCAG 2.1 AA

### Brand Customization
- ✓ CSS variables used for all colors
- ✓ Brand logo displayed in intro
- ✓ Avatar positioned correctly if provided
- ✓ Particle effect triggers on success
- ✓ Loading screen uses brand colors

## VERSION HISTORY

### v3.1 (Current)
- Updated scoring thresholds to 90%/60% (from 95%/70%)
- Added `__PROOF__` object requirement
- Enhanced edge case handling
- Added brand loading screen specifications
- Clarified avatar animation triggers
- Increased XP values to 100/60/20 (from 15/10/5)
- Added time formulas (Tlimit, Ttight)

### v3.0
- Introduced locked scoring system
- Added Telegram integration requirements
- Defined mandatory scene structure
- Established brand customization framework

### v2.0
- Added accessibility requirements
- Introduced mobile-first design principles
- Created self-validation checklist

### v1.0
- Initial framework definition
- Basic scene structure
- Simple scoring system

## CONCLUSION

**THE CORE LOCKED ARCHITECTURE CANNOT BE OVERRIDDEN. PERIOD.**

This v3.1 specification defines the production-ready foundation for all validator games. All games must emit the required window objects, follow the scoring system, and meet accessibility standards.

Any deviations from this specification will result in validation failure and must be corrected before publishing.
