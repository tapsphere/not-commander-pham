# BASE LAYER 1 = BAKED & LOCKED (v2.0)

# 🔒 GLOBAL LOCKED GAME ARCHITECTURE

**Last Updated**: October 2025  
**Status**: Production-Ready Implementation

---

## SCENE STRUCTURE (NON-NEGOTIABLE)

### Scene 0 - Intro Screen

**Purpose**: Provide ALL game context before gameplay begins

**Required Elements**:
- Game title with clear visual hierarchy (h1)
- Mission statement (1-2 sentences explaining the scenario)
- Clear objectives listed (bullet points, max 4-5 items)
- Time limit displayed prominently
- Platform tags (e.g., "⏱ 3 minutes", "📱 Mobile-optimized", "🎮 Interactive")
- NO gameplay mechanics or interactive elements
- Scrollable content area for instructions

**MANDATORY START BUTTON Requirements**:
```css
/* Core Properties */
position: sticky;
bottom: 1rem; /* 16px */
z-index: 30; /* Below modals (z-50) but above content */
width: 100%;
min-height: 56px; /* 14 in Tailwind h-14 */

/* Visual Design */
background: var(--neon-green); /* High contrast primary color */
color: white;
font-size: 1.125rem; /* text-lg */
font-weight: bold;
text-transform: uppercase;

/* Touch Optimization */
touch-action: manipulation;
-webkit-tap-highlight-color: transparent;

/* Active State */
active:scale-98; /* Visual feedback on press */
active:bg-opacity-80; /* Darken on press */
```

**Text**: "START GAME", "PLAY", or "BEGIN VALIDATOR" (ALL CAPS)

**Critical Rules**:
- ❌ Game CANNOT auto-start
- ❌ NO countdown on intro screen
- ✅ Button must be OUTSIDE scrollable divs
- ✅ Always visible, even when content scrolls
- ✅ Must have clear visual feedback on click/tap

---

### Scene 1 - First Action

**Purpose**: Begin actual gameplay with clean interface

**Requirements**:
- CLEAN interface, NO repeated instructions from Scene 0
- Only display: timer, game state, interactive elements
- Brief context (1 sentence max) if needed
- Ample space, NO scrolling needed for primary interactions
- Remove "Back" button or navigation that breaks game flow
- Actual gameplay/interaction starts here

**Layout**:
```tsx
<MobileViewport>
  <div className="bg-black text-white p-4 md:p-6 pb-20">
    {/* Timer/Header */}
    {/* Brief Context (optional) */}
    {/* Interactive Game Elements */}
    {/* Sticky Submit Button (if needed) */}
  </div>
</MobileViewport>
```

---

### Scene 2+ - Subsequent Actions

**Purpose**: Continue gameplay or handle edge cases

**Requirements**:
- Maintain clean interface
- Show progression indicators (Round 2/3, progress bars, etc.)
- Interactive elements visible without scrolling
- Edge-case interruptions happen in designated scenes
- Preserve game state between scene transitions

**Example**: Edge-case crisis screen that pauses main gameplay
```tsx
if (gameState === 'edge-case') {
  return (
    <MobileViewport>
      <div className="border-2 border-red-500 rounded-lg p-8 animate-pulse bg-red-950/20">
        {/* Crisis Message */}
        {/* Updated Timer */}
        {/* Continue Button */}
      </div>
    </MobileViewport>
  );
}
```

---

### Scene Final - Results Screen

**Purpose**: Display comprehensive feedback and proficiency level

**Requirements**:
- Large, clear score display (percentage or points)
- Proficiency level with color coding
- Sub-competencies breakdown (Pass/Fail for each)
- Average competency score (if applicable)
- Action buttons: "Back to Dashboard", "Try Again"
- Scrollable content for detailed feedback
- NO auto-redirect (user controls navigation)

---

## SCORING SYSTEM (LOCKED)

### 3 Proficiency Levels

**Calculation**: Based on sub-competency passes

```typescript
const passes = Object.values(subResults).filter(Boolean).length;
const finalScore = Math.round((passes / totalSubs) * 100);
```

**Levels**:

1. **Level 1 - Needs Work**
   - Accuracy: <80%
   - XP Reward: 5 XP
   - Color: Red (#ef4444, text-red-400)
   - Message: Constructive feedback on what to improve

2. **Level 2 - Proficient**
   - Accuracy: 80-94%
   - XP Reward: 10 XP
   - Color: Yellow (#facc15, text-yellow-400)
   - Message: Acknowledgment of solid performance

3. **Level 3 - Mastery**
   - Accuracy: ≥95% AND edge-case success
   - XP Reward: 15 XP
   - Color: Green (var(--neon-green), text-neon-green)
   - Message: Recognition of exceptional performance

### Automatic Tracking

All games must capture:
```typescript
scoring_metrics: {
  score: finalScore,              // 0-100
  passes: passes,                  // Number of sub-competencies passed
  totalSubs: totalSubs,           // Total sub-competencies tested
  subResults: subResults,         // Object with true/false for each
  timeRemaining: timeLeft         // Seconds remaining (if applicable)
}
```

---

## MOBILE REQUIREMENTS (LOCKED)

### Scrollable Areas

**All scrollable containers MUST have**:

```css
/* Functional Properties */
overflow-y: auto;
max-height: 600px; /* Adjustable based on content, but max 600px recommended */
-webkit-overflow-scrolling: touch; /* iOS momentum scrolling */

/* Layout Properties */
min-height: 200px; /* Ensure containers have minimum size */
padding: 1rem; /* 16px internal spacing */
```

**Updated from v1**: Changed from `max-height: 60vh` to `max-height: 600px` for more consistent behavior across devices.

### Container Structure

```tsx
<MobileViewport> {/* Outer scrollable wrapper */}
  <div className="p-4 md:p-6 pb-20"> {/* Extra bottom padding for sticky buttons */}
    <div className="max-h-[600px] overflow-y-auto"> {/* Scrollable content */}
      {/* Game content */}
    </div>
  </div>
</MobileViewport>
```

### Touch Optimization

All interactive elements must have:
```css
touch-action: manipulation; /* Prevents double-tap zoom */
-webkit-tap-highlight-color: transparent; /* Remove blue highlight on iOS */
cursor: pointer; /* Desktop affordance */
```

**Active States** for buttons:
```css
active:scale-98; /* Subtle shrink on press */
active:bg-opacity-80; /* Darken background */
transition: transform 0.1s ease; /* Smooth animation */
```

### Design Standards

- **Mobile-first responsive**: Design for 375px width minimum
- **Fast loading**: Optimize assets, minimize JavaScript
- **Touch-friendly**: Min 44px touch targets (Apple HIG)
- **Works on all phones**: Test on iPhone SE, iPhone 14, Android mid-range

---

## MODAL/POP-UP REQUIREMENTS (NEW in v2)

### Use Proper Dialog Components

**❌ WRONG - Custom Overlay**:
```tsx
{showModal && (
  <div className="fixed inset-0 bg-black/80">
    <div className="bg-gray-900 p-6">
      {/* Content */}
    </div>
  </div>
)}
```

**✅ CORRECT - Radix UI Dialog**:
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

<Dialog open={showModal} onOpenChange={setShowModal}>
  <DialogContent className="max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Feedback</DialogTitle>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

### Why Use Dialog Components?

**Automatic Handling**:
- ✅ ESC key closes modal
- ✅ Click outside overlay closes modal (if desired)
- ✅ Focus trapping (keyboard navigation stays in modal)
- ✅ Proper z-index layering (z-50 by default)
- ✅ Screen reader announcements
- ✅ Body scroll locking while open
- ✅ Smooth animations in/out

**Accessibility**:
- ✅ `role="dialog"` and `aria-modal="true"` automatically applied
- ✅ Focus returns to trigger element when closed
- ✅ Proper heading hierarchy with DialogTitle

### Modal Content Requirements

```tsx
<DialogContent className="bg-gray-900 border-2 border-neon-green text-white max-w-md max-h-[90vh] overflow-y-auto">
  {/* Allow modal content to scroll if needed */}
  {/* Never put scrollable content AND non-scrollable buttons in same modal */}
</DialogContent>
```

**Z-Index Hierarchy**:
- Modals/Dialogs: `z-50`
- Sticky buttons: `z-30` (below modals)
- Regular content: `z-0` to `z-10`

---

## ARCHITECTURE SAFEGUARDS (LOCKED)

### AI Generation Rules

The AI will **IGNORE** creator requests that:

- ❌ Skip START button on Scene 0
- ❌ Auto-start or auto-play gameplay
- ❌ Put full instructions during gameplay (Scene 1+)
- ❌ Merge Scene 0 and Scene 1 into single view
- ❌ Create complex scrolling during primary gameplay
- ❌ Override Scene 0 → Scene 1 → Scene 2+ structure
- ❌ Use custom modal overlays instead of Dialog components
- ❌ Create buttons that don't respond to clicks/taps
- ❌ Make interactive elements inaccessible via keyboard

### Protected Patterns

**Scene Transitions**:
```typescript
// ✅ CORRECT: Clear state-based scenes
const [gameState, setGameState] = useState<'intro' | 'playing' | 'edge-case' | 'results'>('intro');

// Each state renders completely different UI
if (gameState === 'intro') return <IntroScreen />;
if (gameState === 'playing') return <GameplayScreen />;
if (gameState === 'results') return <ResultsScreen />;
```

**Button Event Handlers**:
```typescript
// ✅ CORRECT: Direct state updates
<Button onClick={() => setGameState('playing')}>
  Start Game
</Button>

// ✅ CORRECT: Function calls with immediate effect
<Button onClick={() => {
  setGameState('results');
  calculateScore();
}}>
  Submit
</Button>
```

---

## WHAT VARIES PER SUB-COMPETENCY

### From Database (24 Sub-Competencies)

Each sub-competency has unique:

1. **Action Cue**: Behavior to surface
   - Example: "Allocate resources within time and budget limits"

2. **Game Mechanic**: Interaction type
   - Examples: "Drag & Drop Ranking", "Resource Allocation Puzzle", "Timeline Sequencing"

3. **Game Loop**: Evidence cycle
   - Example: "Input → Allocate → Rule Flip → Adjust → Submit → Feedback"

4. **Validator Type**: Assessment family
   - Examples: "Scenario-Based Simulation", "Priority Trade-Off", "Data Analysis"

5. **Scoring Logic**: JSON with specific thresholds
   ```json
   {
     "accuracy_threshold": 90,
     "time_limit_seconds": 90,
     "edge_case_recovery_seconds": 10
   }
   ```

6. **Backend Data**: Metrics to capture
   - Example: `['constraints_met_percent', 'completion_time_seconds', 'edge_case_recovered']`

---

## BRAND CUSTOMIZATION (VARIABLE)

### From Brand Dashboard Input

**Customizable Elements**:

1. **Colors**
   - Primary color (buttons, highlights)
   - Secondary color (accents, borders)
   - Applied via CSS variables in `index.css`

2. **Logo**
   - URL to brand logo image
   - Displayed in game header or intro screen
   - Recommended size: 200x60px PNG with transparency

3. **Theme/Scenario**
   - Custom context for the game scenario
   - Example: "Healthcare Crisis" vs "Tech Startup Launch"
   - Changes flavor text but not core mechanics

4. **Cover Photo**
   - Hero image for game preview cards
   - Recommended size: 800x450px (16:9 aspect ratio)

**Non-Customizable (Locked)**:
- ❌ Scene structure
- ❌ Scoring system thresholds
- ❌ Timer behavior
- ❌ Mobile layout patterns
- ❌ Accessibility standards

---

## ACCESSIBILITY REQUIREMENTS (NEW in v2)

### Keyboard Navigation

**All interactive elements must support**:

```tsx
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleAction();
    }
  }}
>
  Interactive Element
</div>
```

**Tab Order**:
- Logical flow: top to bottom, left to right
- Skip links for screen readers
- Focus visible indicators (outline or ring)

### ARIA Labels

**Required for all interactive elements**:

```tsx
<Button
  onClick={handleSubmit}
  aria-label="Submit your ranking and see results"
>
  Submit Ranking
</Button>

<div
  role="region"
  aria-label="Available metrics area"
>
  {/* Drag and drop zone */}
</div>
```

### Screen Reader Support

- Proper heading hierarchy (h1 → h2 → h3)
- Descriptive button text (not just icons)
- Status announcements for dynamic changes
- Alternative text for all images

---

## VALIDATION CHECKLIST

Before deploying any validator game, verify:

### Scene Structure
- [ ] Scene 0 has START button (sticky, full-width, outside scroll area)
- [ ] Game does NOT auto-start on load
- [ ] Scene 1 is clean (no repeated instructions)
- [ ] Edge cases use separate scene (Scene 2+)
- [ ] Results screen shows all required metrics

### Scoring
- [ ] 3 proficiency levels implemented correctly
- [ ] Score calculation uses pass/total formula
- [ ] Edge-case success properly tracked
- [ ] Results saved to database with full metrics

### Mobile
- [ ] Scrollable areas have overflow-y: auto
- [ ] Max heights set appropriately (≤600px)
- [ ] Touch targets minimum 44px
- [ ] Active states on all buttons
- [ ] Works on iPhone SE (375px width)

### Modals
- [ ] Uses Dialog component (not custom overlay)
- [ ] ESC key closes modal
- [ ] Focus trapped while open
- [ ] Scrollable content if needed (max-h-[90vh])

### Buttons
- [ ] All buttons respond to clicks/taps
- [ ] Sticky buttons have z-30 (below modals)
- [ ] Active states provide visual feedback
- [ ] Keyboard support (Enter/Space)

### Accessibility
- [ ] All interactive elements have aria-labels
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Screen reader tested
- [ ] Color contrast ratio ≥4.5:1

---

## TECHNICAL IMPLEMENTATION NOTES

### Component Structure

```
src/pages/ValidatorDemo.tsx (or custom game name)
├── Scene 0: Intro (gameState === 'intro')
├── Scene 1: Playing (gameState === 'playing')
├── Scene 2: Edge Case (gameState === 'edge-case')
└── Scene Final: Results (gameState === 'results')

src/components/MobileViewport.tsx (wrapper)
src/components/ui/dialog.tsx (modals)
src/components/ui/button.tsx (interactions)
```

### State Management

```typescript
// Required state variables
const [gameState, setGameState] = useState<'intro' | 'playing' | 'edge-case' | 'results'>('intro');
const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
const [score, setScore] = useState(0);
const [currentRound, setCurrentRound] = useState<1 | 2 | 3>(1);

// Optional but recommended
const [feedbackHistory, setFeedbackHistory] = useState<Feedback[]>([]);
const [showFeedback, setShowFeedback] = useState(false);
```

### Timer Implementation

```typescript
useEffect(() => {
  if (gameState !== 'playing' && gameState !== 'edge-case') return;
  
  const interval = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        setGameState('results');
        calculateScore();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(interval);
}, [gameState]);
```

---

## VERSION HISTORY

### v2.0 (October 2025)
- ✅ Added Dialog component requirements for modals
- ✅ Updated scrollable area max-height to 600px
- ✅ Added comprehensive accessibility requirements
- ✅ Added keyboard navigation standards
- ✅ Enhanced button interaction patterns
- ✅ Added z-index hierarchy documentation
- ✅ Added validation checklist

### v1.0 (Initial Release)
- Core scene structure defined
- Scoring system established
- Mobile requirements set
- Basic architecture safeguards

---

## CONCLUSION

**THE CORE LOCKED ARCHITECTURE CANNOT BE OVERRIDDEN. PERIOD.**

This document defines the non-negotiable foundation for all validator games. Variations are allowed in game mechanics, content, and branding, but the structural patterns, scoring system, and mobile requirements are immutable.

Any updates to this document must be reviewed and approved by the platform architecture team.

**Questions or Issues?** Contact the platform team or refer to:
- `VALIDATOR_TESTING_GUIDE.md` - Testing protocols
- `ANSWER_VALIDATION_GUIDE.md` - Answer validation logic
- `CUSTOM_GAME_TEMPLATE_GUIDE.md` - Game creation guidelines
