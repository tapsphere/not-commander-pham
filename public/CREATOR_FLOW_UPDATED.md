# CREATOR FLOW — Complete Journey (V3.1)

---

## 1. ACCESS & DASHBOARD

### 1.1 Authentication

Creators log in via email/password or OAuth.

Role: "creator" assigned in database.

Redirected to Creator Dashboard.

### 1.2 Creator Dashboard

The landing page after login shows:

**Tabbed Interface:**
- **My Games tab** — Templates + statistics
- **Design Elements tab** — Upload portal + Element Library

**My Games Tab Features:**
- All created templates (published + draft)
- Template statistics (plays, avg score, completions)
- Times customized by brands
- Player completion count
- Test status for each template
- Filter by Published vs. Draft templates

**Design Elements Tab Features:**
- Upload Portal for design assets (mascots, backgrounds, UI components, animations, audio, effects)
- Element Library showing all uploaded elements with status badges
- Usage tracking and statistics per element
- Filter by status: All, Published, Pending Review, Approved, Rejected
- Review status indicators and rejection reasons

**Header Actions:**
- Access "Test Validators" dashboard
- Edit Profile to set default design preferences

---

## 2. TEMPLATE CREATION (UNIFIED FLOW)

**Path:** Dashboard → "Create New Template"

**Important:** AI-Generated and Custom Upload templates now use the **SAME UNIFIED FORM**. No separate type selection at the start.

### 2.1 Template Form (All Creators Fill This)

#### Step 1: PlayOps Framework Structure Guide

Before creation, creators see a guide outlining:

**REQUIRED Scene Structure:**
- **Scene 0: Loading Screen (2.5s)** with brand/creator logo
- **Instructions Screen** with mascot (if uploaded) - Scene 0 only
- **Scene 1-4: Gameplay** (one per sub-competency, 1-4 scenes supported)
- **Results Screen**

**What Brands Can EDIT:**
- Brand Logo (Scene 0 loading screen)
- Mascot/Avatar (Scene 0 instructions only, if uploaded by creator)
- Particle effects (URL parameter)
- Colors (primary, secondary, accent, background, text)
- Font family

**What is LOCKED:**
- Scene structure (Scene 0 → Instructions → Gameplay → Results)
- Core game mechanics
- Scoring logic
- Mascot placement (Scene 0 instructions only)

#### Step 2: Template Name & Description

- Template Name (required)
- Description (optional)

#### Step 3: Competency Framework

- Primary Competency (required)
- Sub-Competencies: Select 1-4 (each maps to one gameplay scene)
- PlayOps structure guide displays once subs are selected

#### Step 4: Customize Your Scenario

- **Industry/Context:** Marketing, Operations, Sales, Finance, HR, Communications, Customer Service, Technology, Healthcare, Education, Retail, Manufacturing, Legal, Supply Chain, Nonprofit, Government
- **Your Role/Scenario:** max 150 characters
- **Key Element:** What player works with, max 100 characters
- **Edge Case Details:** max 80 characters
- **Visual Theme:** Modern/Clean, Executive Dashboard, Casual/Friendly, High-Stakes/Urgent, Minimal/Focus Mode
- **Interaction Method:** Contextual to sub-competency

#### Step 5: Scene Descriptions

- Scenario context
- Player actions
- Scene progression (1-4 scenes based on sub-competencies)

#### Step 6: Edge Case Configuration

- Edge-case timing (Beginning, Early, Mid, Late)
- Edge-case moment description

#### Step 7: UI Aesthetic

- Visual style description (e.g., "Greyscale minimalist," "Neon cyberpunk")

#### Step 8: Design Customization (Optional)

- Check "Customize colors & font for this game" to override defaults
- Per-game color palette, font, avatar, particles

#### Step 9: File Uploads

- **Cover Image** (optional - generated if not provided)
- **Custom Game HTML** (optional - for customization after download)

**After form submission:**
- Template saved (all creators fill the same form)
- Validation Test Wizard opens automatically
- Creator runs required tests

### 2.2 Post-Test Options (NEW FLOW)

After passing all validation tests, creators have 2 choices:

**Option 1: Publish Now**
- Template goes live in marketplace immediately
- Brands can discover and customize

**Option 2: Download to Customize**
- Download generated game HTML/code
- Download spec PDF with framework requirements (optional)
- Make custom modifications offline
- Re-upload customized version
- **MUST re-run validation tests on re-upload**
- Once tests pass again → can publish

**Important Note:**
Custom HTML uploads still possible via file upload field in form. These follow the same test → publish/download flow.

---

## 3. DESIGN ELEMENT UPLOAD (NEW FEATURE)

**Path:** Creator Dashboard → Design Elements tab → "Upload New Element"

### 3.1 Element Types Supported

1. **Mascot/Avatar** (PNG, SVG, GIF)
2. **Background** (JPG, PNG, SVG)
3. **UI Component** (SVG, PNG)
4. **Particle Effect** (JSON, PNG sprite sheet)
5. **Sound Effect** (MP3, WAV, OGG)
6. **Font File** (TTF, WOFF, WOFF2)
7. **Animation** (NEW)
   - Sub-types: lottie, sprite_sheet, css, gif

### 3.2 Upload Process

**Step 1:** Select element type

**Step 2:** Upload file(s)

**Step 3:** Add metadata:
- Element name
- Description
- Tags (searchable)
- License type (free, premium, custom)

**Step 4:** Preview & optimization check
- File size validation
- Format compatibility check
- Telegram Mini-Game optimization tips

**Step 5:** Submit for review

### 3.3 Format & Size Requirements

- **Mascots/Avatars:** Max 500KB, recommended 256×256 to 512×512px
- **Backgrounds:** Max 1MB, recommended 1920×1080px or smaller
- **UI Components:** Max 200KB, vector formats preferred
- **Particle Effects:** Max 300KB for JSON, 400KB for sprite sheets
- **Sound Effects:** Max 500KB, MP3 recommended
- **Fonts:** Max 200KB per weight
- **Animations:** Max 500KB

### 3.4 Telegram Mini-Game Optimization

- Total asset bundle should stay under 5MB
- Use WebP for raster images when possible
- Compress audio to lower bitrates (64-128kbps)
- Prefer vector graphics for scalable elements

### 3.5 Review & Approval

- Elements enter "Pending Review" status
- Platform reviews for:
  - Technical compliance
  - Quality standards
  - Appropriate content
- Once approved → visible in Element Library
- Creators and brands can browse/use in templates

---

## 4. VALIDATOR TESTING (V3.1 — 8 AUTOMATED CHECKS)

**Path:** Creator Dashboard → Select Template → "Run Validator Test"

### Overview

V3.1 introduces **8 automated programmatic checks** that validate templates against the PlayOps Framework. Each check returns:
- **PASSED** — No issues detected
- **NEEDS REVIEW** — Minor issues or warnings
- **FAILED** — Critical issues that must be fixed

### 4.1 The 8 Automated Checks

#### Check 1: Scene Structure Validation

Verifies:
- Presence of all 3 required scenes (Intro, Gameplay, Results)
- Correct scene identifiers in HTML/JS
- Proper scene transition logic

#### Check 2: UX/UI Integrity

Verifies:
- Responsive design across viewport sizes
- Touch targets meet minimum size (44×44px)
- Text readability (contrast ratios)
- Loading states and error handling

#### Check 3: Telegram Mini-App Compliance

Verifies:
- Total bundle size under 5MB
- No external CDN dependencies (all assets bundled)
- WebApp API integration if applicable
- Proper viewport meta tags

#### Check 4: Embedded Configuration Objects

Verifies:
- brandConfig object exists in JavaScript
- Contains required fields: logoUrl, primaryColor, secondaryColor
- Object is properly accessible and modifiable

#### Check 5: Action Cue & Mechanic Alignment

Verifies:
- Game actions map correctly to competency being tested
- Action cues are clear and contextually appropriate
- Mechanics align with learning objectives

#### Check 6: Scoring Formula Verification

Verifies:
- Scoring logic is mathematically sound
- Score calculation includes all sub-competencies
- Min/max score boundaries are enforced
- Proof object emits correctly on completion

#### Check 7: Accessibility & Mobile Readiness

Verifies:
- Keyboard navigation support
- ARIA labels for interactive elements
- Mobile gesture support (tap, swipe)
- Performance on mid-range mobile devices

#### Check 8: Proof Emission & Telemetry

Verifies:
- Proof object structure matches specification
- Timestamp and session ID included
- Sub-competency scores properly formatted
- Telemetry events fire at key moments (start, complete, error)

### 4.2 Result Classification

**PASSED:**
- All 8 checks return green status
- Template is ready for publishing

**NEEDS REVIEW:**
- 1-2 checks return warnings
- Creator can choose to fix or proceed with explanation

**FAILED:**
- 3+ checks fail OR any critical check fails
- Template cannot be published until issues are resolved

**Note:** The old 3-phase manual testing (UX/UI Flow, Action Cue Validation, Scoring Formula Test) has been replaced by these 8 automated checks.

---

## 5. REVIEW & FIX

### Test Results Dashboard

- View overall status per template
- Access detailed check results (Check 1-8)
- Review notes and test history

**If Passed:**
- "Approve for Publish" unlocks

**If Failed:**
- Fix issues and click "Re-test"

**If Needs Review:**
- Address warnings and re-test

---

## 6. APPROVAL & PUBLISHING

### 6.1 Final Review

- Creator reviews all test results
- Confirms template metadata is accurate

### 6.2 Publish to Marketplace

- Click "Publish Template"
- System generates two game modes:
  - **Training Mode** (practice, no scoring)
  - **Testing Mode** (scored, proof emission)
- Template becomes discoverable in marketplace
- Brands can now customize and deploy

---

## 7. KEY RULES

### Publishing Requirements

- Must pass all 8 automated validator checks
- Must include cover image
- Must define scoring formula
- Must follow PlayOps Framework structure

### Design Elements

- Must pass technical review before appearing in library
- Must meet size/format requirements
- Can be used across multiple templates

### Custom HTML Games

- Must support URL parameters: ?avatar=URL&particles=TYPE
- Must embed brandConfig object for color/logo customization
- Must follow 3-scene structure (Intro → Gameplay → Results)

### Brand Customization

- Templates define what brands can customize
- Locked elements (mechanics, scoring) cannot be changed by brands
- Editable elements include: logo, mascot/avatar, particles, colors

---

## TEMPLATE CREATION FORM — Complete Field Reference

### 1. Template Name & Description
- Template Name (required)
- Description (optional)

### 2. Competency Framework
- Primary Competency (dropdown from master list)
- Sub-Competencies (select 1-4)

### 3. Scenario Customization
- Industry/Context (dropdown)
- Your Role/Scenario (text, max 150 chars)
- Key Element (text, max 100 chars)
- Edge Case Specific Details (text, max 80 chars)
- Visual Theme (dropdown)
- Interaction Method (contextual dropdown)

### 4. Scene Descriptions
- Scene context descriptions
- Player action descriptions
- Scene progression notes

### 5. Edge Case Configuration
- Edge-case timing (dropdown: Beginning/Early/Mid/Late)
- Edge-case moment description (text)

### 6. UI Aesthetic
- Visual style description (text)

### 7. Design Customization (Optional)
- Checkbox: "Customize colors & font for this game"
- If checked:
  - Highlight color (color picker)
  - Text color (color picker)
  - Font family (dropdown)
  - Game Avatar (image upload)
  - Particle Effect (dropdown)

### 8. File Uploads
- Cover Image (optional image upload)
- Custom Game HTML (optional file upload)

### 9. Save Options
- "Create & Test" button → Opens test wizard immediately
- "Save as Draft" button → Test later from dashboard

---

## SUMMARY OF V3.1 CHANGES

### 1. Unified Template Form
- Single form for both AI-Generated and Custom Upload templates
- Streamlined creator experience
- Consistent validation workflow

### 2. Scene 0 Enhancements
- Loading Screen (2.5s) with brand/creator logo
- Separate Instructions Screen with mascot
- Mascot placement restricted to Scene 0 instructions only

### 3. 8 Automated Validation Checks
- Replaces old 3-phase manual testing
- Programmatic validation against PlayOps Framework
- Clear pass/fail criteria for each check

### 4. Post-Test Download/Customize Flow
- Download game code after passing tests
- Download spec PDF with requirements
- Re-upload customized version
- Must re-test before publishing

### 5. Design Element Upload System
- New tab on Creator Dashboard
- 7 element types supported (including Animation)
- Telegram Mini-Game optimization requirements
- Review and approval workflow

### 6. Enhanced Brand Customization
- URL parameter system for all customizable elements
- Embedded brandConfig object requirement
- Clear documentation of editable vs. locked zones
- Mascot/Avatar support with placement guidelines
