# CREATOR FLOW — Complete Journey (Updated)

**FORMATTING KEY:**
- Regular text = Original flow (unchanged)
- **BOLD TEXT = New additions and changes**

---

# Access & Dashboard

## 1. Authentication

Creator signs in with email and password.

Role: "creator" assigned in database.

Redirected to Creator Dashboard.

## 2. Creator Dashboard

View all created templates.

See template statistics:

- Times customized by brands
- Player completion count
- Average scores
- Test status for each template

Filter: Published vs. Draft templates.

Access "Test Validators" dashboard from header.

Edit Profile: Set default design preferences for all future games.

**NEW: Tabbed Interface**

**- Tab 1: "My Games" - All game templates and validators**
**- Tab 2: "Design Elements" - Upload and manage individual design assets**

**Design Elements Tab Features:**
**- Upload Portal for design assets (mascots, backgrounds, UI components, animations, audio, effects)**
**- Element Library showing all uploaded elements with status badges**
**- Usage tracking and statistics per element**
**- Filter by status: All, Published, Pending Review, Approved, Rejected**
**- Review status indicators and rejection reasons**

## 3. Profile Settings (Default Customization)

Design Palette (inherited by all games):

- Primary color
- Secondary color
- Accent color
- Background color
- Text color
- Highlight color

Font Family: Default typography (e.g., Inter, Roboto)

Game Avatar: Default mascot or character image

Mascot Animation Type: Static, bounce, pulse, or float

Particle Effect: Sparkles, confetti, stars, or none

Note: These become the default for every new game created but can be overridden per game.

---

# Template Creation

## 4. Choose Template Type

Click "New Template" on Creator Dashboard. Select type:

- AI-Generated Template — build from scratch using AI
- Custom Upload — upload pre-built HTML game

## 5. AI-Generated Template Path

Select C-BEN competency from master list (e.g., Analytical Thinking, AI & Big Data Skills, Creative Thinking, Leadership & Social Influence, Crisis Management, Budget Allocation, etc.). Choose 1 sub-competency to test.

**CHANGED: Now supports selecting 1-4 sub-competencies (multi-scene games)**

Provide template details:

- Template name
- Description
- Base prompt (scenario setup)
- Game mechanics instructions
- Edge cases to test
- Duration (typically 3–5 minutes)

**NEW: PlayOps Framework Structure Guide**

**When sub-competencies are selected, a visual guide displays:**

**- Scene 0: Intro Screen (required elements: logo, START button, no auto-start)**
**- Scene 1-4: Gameplay scenes (one per sub-competency selected)**
**- Results Screen: Required fields (proficiency level, score, feedback, time, metrics, REPLAY/CONTINUE buttons)**
**- State Management: JavaScript scene tracking with currentScene variable**
**- Brand Customization Zones documentation**

**NEW: Brand Customization Zones (What Brands Can Edit)**

**EDITABLE by brands:**
**- Brand Logo (Scene 0, top-left or center)**
**- Mascot/Avatar (character image throughout game)**
**- Particle Effects (sparkles, confetti, glitter, stars, bubbles, fire)**
**- Primary Color (buttons, headers, progress bars)**
**- Secondary Color (secondary buttons, backgrounds)**
**- Accent Color (highlights, success states, borders)**
**- Background Color (main game background)**
**- Font Family (all text, web-safe fonts)**

**LOCKED (cannot be edited by brands):**
**- Scene Structure (Scene 0 → Scene 1-4 → Results)**
**- Action Cues (from sub-competency)**
**- Game Mechanics (drag-drop, click, type, etc.)**
**- Scoring Logic (formulas locked to sub-competency)**
**- Timer Logic (duration set by designer)**
**- Edge Case Timing (when disruption occurs)**

**URL Parameters for Customization:**
**- ?logo=URL - Brand logo image**
**- ?avatar=URL - Mascot/character image**
**- ?particles=TYPE - Particle effect (sparkles, confetti, etc.)**
**- ?primary=HEX - Primary color**
**- ?secondary=HEX - Secondary color**
**- ?accent=HEX - Accent color**
**- ?background=HEX - Background color**
**- ?font=NAME - Font family**

**Example Implementation Code:**
```javascript
// Get URL parameters
const params = new URLSearchParams(window.location.search);
const brandLogo = params.get('logo') || 'default-logo.png';
const mascotAvatar = params.get('avatar') || 'default-mascot.png';
const particleEffect = params.get('particles') || 'sparkles';
const primaryColor = params.get('primary') || '#0078D4';

// Apply to elements
document.getElementById('brand-logo').src = brandLogo;
document.getElementById('mascot-avatar').src = mascotAvatar;
document.documentElement.style.setProperty('--primary-color', primaryColor);

// Initialize particle effect
initParticleEffect(particleEffect);
```

### Action Scenes / Rounds (optional):

Use for validators with multiple short scenes (2–4). Each scene is one screen of play (1–30–60 s).

**CHANGED: Now automatically maps to sub-competencies when multiple are selected**

Example:

- Scene 1 = Baseline decision
- Scene 2 = New variable introduced
- Scene 3 = Edge-case twist
- Scene 4 = Recover & submit final plan

Leave blank if game plays in one continuous round.

### Edge-Case Timing:

Choose when the rule-flip or disruption occurs: Beginning, Early, Mid, or Late.

### Edge-Case Moment:

Describe how the disruption appears (e.g., "Timer cuts in half," "Key data field vanishes mid-game").

### UI Aesthetic:

Describe the visual style (e.g., "Greyscale minimalist," "Neon cyberpunk with Deloitte branding").

### Customize Colors & Font (optional):

Leave unchecked → uses profile default design.

Check to override for this specific game:

- Highlight color
- Text color
- Font family

Avatar and particle effect also customizable per game.

### Decision point:

- Click "Create & Test" → opens test wizard immediately.
- Click "Save as Draft" → test later from dashboard.

## 6. Custom Upload Path

Upload HTML file (game built externally).

**CHANGED: Form field order restructured**

**New Flow Order:**
**1. Template Name & Description**
**2. Template Type Selection (AI/Custom)**
**3. Competency & Sub-Competency Selection**
**4. PlayOps Framework Structure Guide Display**
**5. Scenario Customization Fields (industry, role, key elements, edge case details, visual theme, interaction method)**
**6. Designer-Controlled Elements (scenario, player actions, action scenes, edge-case timing/moment, UI aesthetic)**
**7. Design Customization (optional color/font overrides)**
**8. File Uploads Section (moved to end):**
**   - Cover Image Upload**
**   - Custom Game HTML Upload**

Specify C-BEN competencies tested.

Add metadata (name, description, preview image).

Upload to cloud storage.

Same customization fields apply (action scenes, edge-case timing/moment, UI aesthetic, optional overrides).

### Decision point:

- Click "Create & Test" → open test wizard immediately.
- Click "Save as Draft" → test later from dashboard.

---

# **Design Element Upload (NEW FEATURE)**

**NEW FEATURE: Individual Design Asset Management**

**Upload Portal allows creators to upload individual design elements:**

**Element Types:**
**1. Mascot/Character (static, animated, 3d, rigged)**
**2. Background (static, parallax, particle)**
**3. UI Component (button, input, progress_bar, card)**
**4. Feedback Effect (success, failure, transition)**
**5. Audio (music, sfx, voiceover)**
**6. Decorative (icon, border, frame)**
**7. Animation (lottie, sprite_sheet, css, gif) - NEW TYPE**

**For Each Element Type:**
**- Specific Format Requirements (e.g., PNG transparent for mascots, MP3 for audio)**
**- Maximum File Size Limits (varies by type: 300KB-2MB)**
**- Telegram Mini-Game Optimization Guidelines**
**- Mobile performance requirements (60fps, low-end device testing)**

**Upload Process:**
**1. Select Element Type and Subtype**
**2. View specific requirements for selected type**
**3. Enter Element Name and Description**
**4. Upload File (drag-and-drop or browse)**
**5. Select Allowed Placement Zones (intro_screen_mascot, gameplay_background, ui_buttons, etc.)**
**6. Submit for Review**

**Review Process:**
**- All elements go through manual review before approval**
**- Status: Pending Review → Approved/Rejected**
**- Approved elements appear in marketplace for brands**
**- Usage tracking for future royalty payouts (beta)**

**Element Library:**
**- View all uploaded elements with preview images**
**- Status badges (Published, Approved, Pending, Rejected)**
**- Usage statistics per element**
**- Filter and sort by status**
**- Delete unpublished elements**
**- View rejection reasons (if rejected)**

---

# Validator Testing (3 Phases – Required)

## 6. Phase 1 – UX/UI Flow Test

Checks:

- Game loads without errors
- UI renders correctly

## 7. Phase 2 – Action Cue Validation

Checks:

- Game captures sub-competency accurately
- Player actions align with action cue statement
- Mechanics demonstrate skill properly
- Backend data capture matches behavior

How to test:

- Review sub-competency statement + action cue
- Play naturally
- Verify alignment
- Confirm mechanic logic
- Check API data (custom uploads)

Mark status: Passed / Failed / Needs Review.

Add notes for alignment issues.

## 8. Phase 3 – Scoring Formula Test

Checks:

- Scoring reflects true performance
- XP/levels calculate correctly
- Pass/fail thresholds fit expectations
- Proficiency tiers match demonstrated skill

How to test:

- Play poorly → average → excellent → verify:
  - Level 1 (Needs Work): basic completion
  - Level 2 (Intermediate): quality + efficiency
  - Level 3 (Expert): advanced mastery

Review backend metrics.

Mark status: Passed / Failed / Needs Review. Add notes for inconsistencies.

## 9. Complete Testing

Click "Save & Finish" once all phases complete. System calculates overall status:

- ✅ Passed – all phases cleared
- ❌ Failed – one or more failed
- ⚠️ Needs Review – manual review required

---

# Review & Fix

## 10. Test Results Dashboard

View overall status per template. Access detailed phase breakdowns. Review notes and test history.

If Passed → "Approve for Publish" unlocks. If Failed → fix issues, click "Re-test." If Needs Review → address and re-test.

---

# Approval & Publishing

## 11. Approve for Publishing

Requirement: status = Passed. Click "Approve for Publish." Validator becomes marketplace-eligible.

## 12. Publish to Marketplace

Toggle "Publish" switch on approved validator. Validator appears in Brand Hub marketplace. Brands can browse, customize, deploy. Can unpublish anytime.

**Note: Automatic Mode Generation (System Action)**

When a validator is published, the system automatically compiles two runtime versions:

- **Training Mode (Practice)**
  
  Randomized data each session, unlimited retries, no proof receipts or XP. Designed for players to practice skills with immediate feedback.

- **Testing Mode (Proof)**
  
  Fixed seed data, time enforced, single attempt, proof receipt generated. XP and proof logs stored on-chain.

Creators don't have to configure or test these separately — the system handles both using the same template and scoring logic.

---

# Key Rules

- Templates must pass all 3 testing phases before publishing.
- Drafts can be saved and tested later.
- Failed tests block publishing until fixed.
- Re-testing is always available.
- Usage & performance tracking coming soon.

**NEW RULES:**
**- Design elements must pass review before appearing in marketplace**
**- Custom HTML games must implement all required URL parameters for brand customization**
**- All games must follow PlayOps Framework scene structure (Scene 0 → Gameplay → Results)**
**- Mascot zones must be reserved in game layout (recommended: bottom-right corner)**
**- Particle effects must be integrated via URL parameter system**

---

# Template Creation Form (Complete Field List)

## 1. Template Type Selection

- AI-Generated Template OR Custom Upload

## 2. Core Template Info

- Template Name
- C-BEN Competency (from master list)
- Sub-Competency **[1-4 selections supported]**
- Scenario Context/Description
- Duration (typically 3-5 minutes)

**NEW: Industry & Context Fields**
**- Industry/Context (Marketing, Operations, Sales, Finance, HR, Communications, Customer Service, Technology, Healthcare, Education, Retail, Manufacturing, Legal, Supply Chain, Nonprofit, Government)**
**- Your Role/Scenario (max 150 chars)**
**- Key Element (max 100 chars) - what player works with**
**- Edge Case Specific Details (max 80 chars)**
**- Visual Theme (Modern/Clean, Executive Dashboard, Casual/Friendly, High-Stakes/Urgent, Minimal/Focus Mode)**
**- Interaction Method (contextual dropdown based on sub-competency)**

## 3. Game Structure

- Action Scenes/Rounds (optional)
- Number of scenes (2-4)
- Description of each scene
- Leave blank for continuous single-round play

**CHANGED: Automatically maps to sub-competencies when multiple selected**

## 4. Edge-Case Configuration

- Edge-Case Timing: When disruption occurs
  - Beginning / Early / Mid / Late
- Edge-Case Moment: How disruption appears
  - Text description (e.g., "Timer cuts in half")

## 5. Visual Design

- UI Aesthetic: Visual style description
  - Example: "Greyscale minimalist" or "Neon cyberpunk"

## 6. Customize Colors & Font (Optional Checkbox)

- If unchecked → Uses profile defaults
- If checked → Override for this game:
  - Highlight color
  - Text color
  - Font family
  - Game Avatar (mascot image)
  - Particle Effect (sparkles/confetti/stars/none)

## **7. File Uploads Section (Moved to End of Form)**

**- Cover Image Upload (optional, generated if not provided)**
**- Custom Game HTML Upload (for custom upload type only)**

## 8. Custom Upload Specific

- Upload HTML file
- Preview image
- Cloud storage upload

**CHANGED: This section now appears after all form fields are completed**

## 9. Save Options

- "Create & Test" → Opens test wizard immediately
- "Save as Draft" → Test later from dashboard

---

# SUMMARY OF MAJOR CHANGES

## **1. Design Element Upload System**
**- New tab on Creator Dashboard for managing individual design assets**
**- 7 element types supported (including new Animation type)**
**- Telegram Mini-Game optimization requirements**
**- Review and approval workflow**

## **2. PlayOps Framework Structure Guide**
**- Visual guide showing required scene structure**
**- Brand Customization Zones documentation**
**- Clear EDITABLE vs LOCKED elements**
**- URL parameter implementation guide**
**- Code examples for custom HTML games**

## **3. Enhanced Form Structure**
**- Multi-sub-competency support (1-4 selections)**
**- New contextual fields (industry, role, key elements)**
**- Reordered flow: configuration first, file uploads at end**
**- Auto-generated player actions based on interaction method**

## **4. Brand Customization Enhancements**
**- Mascot/Avatar upload support**
**- Particle effects selection system**
**- Extended URL parameter system**
**- Visual zone placement guidelines**