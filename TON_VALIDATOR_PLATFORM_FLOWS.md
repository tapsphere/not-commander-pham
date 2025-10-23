# Platform Flows or User Flows Doc
# TON VALIDATOR PLATFORM — USER FLOWS & TECHNICAL ARCHITECTURE (v3.1)

Last Updated: October 2025

Status: Production-Ready — Lovable, Telegram, and C-BEN Compliant

## 🧭 PLAYER FLOW

### 1. Entry & Authentication

#### 1.1 Landing Page
- Animated 3D globe with ARIA AI system voice introduction
- "Live Validators" section shows active playable games
- Click "Initialize" to start onboarding

#### 1.2 Wallet Connection
- Connect TON Wallet (primary authentication)
- Alternative: email/password login for non-wallet users
- Profile auto-created on first login

#### 1.3 Game Hub (Lobby)
- Displays all available validators across Brand Stores
- Each card shows: Brand logo, validator name, department, and LIVE badge
- Filters by department (Marketing, Operations, Finance, etc.)
- Search bar for validator lookup

### 2. Playing Validators

#### 2.1 Validator Selection
- Click any LIVE validator card → `/play/[CODE]`

**Intro screen includes:**
- Brand colors & logo
- Scenario context
- Single sub-competency being validated
- Time limit (3–6 minutes)
- START GAME button (sticky, visible, non-auto-start)

#### 2.2 Gameplay

**Brand Loading Screen:**
- Brand logo appears (≤ 300×300 px) for ≈ 2.5 seconds
- Pulse animation effect (scale 1 → 1.05 → 1)
- Backdrop blur with brand colors
- Fade out transition before intro screen

**Telegram Integration:**
- Auto-runs Telegram hooks:

```javascript
if (window.Telegram && window.Telegram.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();
}
```

**Game Structure:**
- Mobile-first, no-scroll gameplay (Scene 1+)
- Interaction types: drag-and-drop, tap, match, swipe — never free text
- One edge-case disruption (Early / Mid / Late)
- Visible timer and live feedback in Training mode
- **Training Mode:** randomized inputs, unlimited retries, feedback visible, no XP saved
- **Testing Mode:** fixed seed, one attempt, no mid-game feedback, XP + proof recorded

**Avatar/Mascot System:**
- Intro: center (200–250 px)
- Gameplay: top-right corner (80–120 px)
- Results: center again (150–200 px)
- Animation types: Static PNG, Animated GIF, Lottie JSON, or Sprite sheet

**Particle Effects:**
- Confetti / stars / sparkles / bubbles / fireworks / none
- Triggers on correct answers, level completion, mastery achievement

#### 2.3 Results & Scoring (C-BEN → PlayOps Hybrid v3.1)

**Deterministic 3-level model:**

| Level | Label       | Criteria                                                                      | XP  | Color              |
|-------|-------------|-------------------------------------------------------------------------------|-----|--------------------|
| 1     | Needs Work  | accuracy < 0.85 OR time_s > Tlimit                                           | 100 | #ef4444            |
| 2     | Proficient  | accuracy ≥ 0.90 AND time_s ≤ Tlimit                                          | 250 | #facc15            |
| 3     | Mastery     | accuracy ≥ 0.95 AND time_s ≤ Ttight AND edge_score ≥ 0.80 AND sessions ≥ 3 | 500 | var(--neon-green) |

**Formula Variables:**
- `Tlimit = duration_s`
- `Ttight = duration_s × 0.85`

**Telemetry Outputs:**
```javascript
window.__RESULT__ = {
  accuracy,
  time_s,
  edge_score,
  level,
  passed
};

window.__PROOF__ = {
  proof_id,
  template_id,
  competency,
  sub_competency,
  level,
  metrics: {
    accuracy,
    time_s,
    edge_score,
    sessions
  },
  timestamp: new Date().toISOString()
};
```

**Results Screen shows:**
- Level badge
- Accuracy %
- Time (s)
- Edge status
- XP earned
- Avatar/mascot celebration animation

**Important Notes:**
- Training runs do **not** emit proof receipts
- Testing runs emit **immutable proof receipts** recorded on-chain

### 3. Profile & Progression

#### 3.1 Player Profile

**Dashboard Metrics:**
- Total XP
- Total PLYO
- Mastery count
- Proficient count
- Needs Work count

**Badges:**
- Level 3 = Green / Neon → Mastery (500 XP)
- Level 2 = Yellow → Proficient (250 XP)
- Level 1 = Red → Needs Work (100 XP)

**History:**
- Every attempt stored with accuracy %, time s, level 1–3, and (for Testing) proof ID

#### 3.2 Skill Training Loop
- Re-play any validator anytime
- Each attempt adds to history; shows trendlines over time
- XP only awarded for Testing-mode completions

---

## 🎨 CREATOR FLOW

### 1. Access & Dashboard
- Creator logs in (email/password)
- Role: "creator" in database
- Redirect → Creator Dashboard
- Dashboard shows all templates + stats (plays, average score, test status)
- Filters: Published / Draft
- Header access → Test Validators dashboard
- **Profile Settings:** default design palette (colors, fonts, mascot, particles)

### 2. Brand Customization (Extended v3.1)

Supported fields:

| Variable                          | Function                                  |
|-----------------------------------|-------------------------------------------|
| primary_color / secondary_color   | Core brand palette                        |
| accent_color                      | Highlight for selections & warnings       |
| highlight_color                   | Borders, focus states                     |
| background_color                  | Main canvas background                    |
| font_family                       | Typography (Google Fonts or system stack) |
| logo_url                          | Brand logo (≤ 300×300 px)                 |
| avatar_url                        | Mascot/character image                    |
| particle_effect                   | confetti / stars / sparkles / none        |

### 3. Template Creation

#### 3.1 Choose Template Type
- Click **New Template**
- Select:
  - **AI-Generated Template** – use Lovable AI prompt
  - **Custom Upload** – upload external HTML5 game

#### 3.2 AI-Generated Template Path
- Choose C-BEN competency → one sub-competency
- Provide:
  - Name, description, scenario prompt
  - Intended Action Cue (Select / Match / Identify / Allocate / Order / Flag / Route)
  - Edge-case timing & moment
  - UI aesthetic
  - Duration (3–6 min)
- Optional: multiple short scenes (2–4 rounds)
- Click **Create & Test** or **Save as Draft**

**(System enforces: no text inputs, one sub-competency, black-and-white scoring, Telegram compliance, proof output.)**

#### 3.3 Custom Upload Path
- Upload pre-built HTML game
- Specify competency tested
- Add metadata (preview image, logo, brand colors)

### 4. Embedded Configuration Objects

When AI generates the HTML game, it auto-embeds configuration objects:

```javascript
window.__CONFIG__ = { 
  duration: 180, 
  competency: "Analytical Thinking",
  thresholds: {a1:0.85, a2:0.90, a3:0.95}, 
  xp: {1:100, 2:250, 3:500} 
};
window.__GOLD_KEY__ = { 
  sequence: ["A","B","C"], 
  edge_case: "B" 
};
window.__EDGE__ = { 
  triggered: true, 
  recovered: true, 
  score: 0.82 
};
window.__RESULT__ = { 
  accuracy: 0.92, 
  time_s: 168, 
  edge_score: 0.83, 
  level: 2 
};
window.__PROOF__ = { 
  proof_id, 
  competency, 
  sub_competency,
  metrics: {accuracy, time_s, edge_score}, 
  timestamp: new Date().toISOString() 
};
```

These ensure consistent scoring, telemetry, and proof receipts across all validators.

### 5. Preview Mode
- Generate HTML without saving to database
- Test gameplay, edge cases, scoring logic
- Iterate before publishing

### 6. Validator Testing (AI Auto-Validation)

**Before publishing, the system auto-tests:**
- ✅ START button visible and clickable
- ✅ Scene 1+ fit viewport (no scrollbars)
- ✅ All buttons respond to click/tap
- ✅ No text inputs or contentEditable
- ✅ `window.__RESULT__` and (Testing) `window.__PROOF__` emit successfully
- ✅ Telegram Mini-App hooks load without error
- ✅ Timer + XP display accurate

**Status:** Passed / Failed / Needs Review

- **Passed** → "Approve for Publish" unlocks
- **Failed** → Creator fixes & re-tests

### 7. Self-Validation Checklist

Before publishing, creators verify:

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

### 8. Publish & Deploy
- Once validated, template goes live in marketplace
- Brands can clone and customize further
- Creator earns royalty % when brands use their template

---

## 🏢 BRAND FLOW

### 1. Access & Dashboard
- Brand logs in (email/password)
- **Tabs:** Draft / Published / Live
- Each validator shows: name, logo, creation date, code, schedule, status

### 2. Creating Branded Validators

**Steps:**
1. Browse marketplace → filter by competency, department, duration
2. Preview → select template → click **Customize**
3. Upload logo, set primary / secondary colors, adjust scenario
4. Each branded validator validates **one sub-competency per run**
5. Choose edge-case moment (Early / Mid / Late)
6. Click **Generate & Save Game** → Lovable AI builds HTML validator in 30–90 s
7. Test draft, verify visuals & scoring
8. **Publish** → schedule start/end dates
9. On launch, appears under "Live Validators" with unique code `/play/[CODE]`

---

## 🔗 TECHNICAL ARCHITECTURE — TON BLOCKCHAIN INTEGRATION

### Overview
**Thirdweb SDK for TON** powers on-chain credentialing, token rewards, and verification.

### ON-CHAIN COMPONENTS

#### 1. Player Identity & Wallet
- TON wallet = decentralized player ID
- **Smart Contract:** `PlayerRegistry.registerPlayer(wallet, profileHash)`

#### 2. Validator Completion Certificates (NFTs)
- **Mint when:** Level ≥ 2 (Proficient) in Testing mode
- **Metadata:**
  - `validatorId`, `validatorName`, `playerWallet`, `brandName`
  - `completionDate`, `level`, `accuracy`, `time_s`, `edge_score`
  - `subCompetency`, `proofId`
- Stored on **IPFS**
- **Smart Contract:** `mintCertificate(playerWallet, validatorId, scoreData, metadataURI)`

#### 3. Competency Badges (ERC-1155 / Jetton)
- Level 3 = Mastery Badge
- Level 2 = Proficient
- Level 1 = Participation
- Gamified, tradable recognition layer

#### 4. PLYO Token (ERC-20 / Jetton)
- Earn 10–50 PLYO per completion
- Spend / stake / tip
- **Contract:** `rewardPlayer(wallet, validatorId, score)`

#### 5. XP Points (Soul-Bound Token)
- Award 100 / 250 / 500 XP for Levels 1–3
- Non-transferable

#### 6. Brand Validator Registry
- Transparency of live validators
- **Smart Contract:** `registerValidator(validatorData, metadataURI)`

#### 7. Skill Verification Proofs
- Merkle root of proof receipts
- **Contract:** `submitProof(playerWallet, competencyId, proofData)`

### OFF-CHAIN COMPONENTS (Lovable Cloud)

**Game Logic & State:**
- HTML / JS validators

**User Metadata:**
- email, settings, preferences

**Brand Customization:**
- prompts, logos, colors, avatars, particle effects

**Analytics & Telemetry:**
- click tracking, accuracy, time, edge events

**Template Library:**
- AI prompts, previews, validator definitions

### Architecture Pattern
```
Off-Chain → Verification → On-Chain
```
(Immutable credentialing of real action.)

---

## ⚙ TECHNICAL NOTES

- Each validator = 1 C-BEN sub-competency
- **Telemetry events:** `session.start`, `decision.select`, `edge.trigger`, `session.end`
- `session.end` payload includes: `accuracy`, `time_s`, `edge_score`, `level`, `passed`, and (for Testing) `proof`
- **Telegram Mini-App compliance:** `WebApp.ready()`, `expand()`, `BackButton.show()` integrated

---

## 📱 MOBILE-FIRST TECHNICAL REQUIREMENTS

- **Minimum touch targets:** ≥ 44 px
- **Minimum font size:** 16 px (prevents zoom on iOS)
- **Viewport meta tag:** `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">`
- **Event listeners:** All buttons have listeners added after DOMContentLoaded
- **Scrollable areas:** `overflow-y: auto; max-height: 600px; -webkit-overflow-scrolling: touch`
- **Touch optimization:** `touch-action: manipulation; -webkit-tap-highlight-color: transparent`
- **Active states:** scale-98 + opacity-80 on press
- **Responsive design:** ≥ 375 px width minimum

---

## 🧩 SCORING & PROOF FLOW (Summary)

1. Player finishes validator → `window.__RESULT__` created
2. If Testing mode AND Level ≥ 2 → `window.__PROOF__` generated
3. Proof stored off-chain → hash → TON NFT certificate
4. XP and PLYO rewards issued; badges updated

---

## 🧠 PLATFORM MISSION

**Democratize competency validation through gamified, verifiable micro-proofs** — empowering Gen Z to prove skills, creators to build validators, and brands to hire with confidence.

---

✅ **This v3.1 doc is fully synchronized with:**
- BASE LAYER 1 (v3.1)
- AI Generation Prompt (v3.1)
- C-BEN PlayOps Framework
- Telegram Mini-App Guidelines
