# CREATOR FLOW — Complete Journey (Updated)

**Legend:**
- **Black text** = Original flow (unchanged)
- **<span style="color: #3B82F6">Blue text</span>** = New additions and changes

---

# Access & Dashboard

# 1. Authentication

Creator signs in with email and password.

Role: "creator" assigned in database.

Redirected to Creator Dashboard.

# 2. Creator Dashboard

View all created templates.

See template statistics:

- Times customized by brands
- Player completion count
- Average scores
- Test status for each template

Filter: Published vs. Draft templates.

Access "Test Validators" dashboard from header.

Edit Profile: Set default design preferences for all future games.

**<span style="color: #3B82F6">NEW: Tabbed Interface</span>**

**<span style="color: #3B82F6">- Tab 1: "My Games" - All game templates and validators</span>**
**<span style="color: #3B82F6">- Tab 2: "Design Elements" - Upload and manage individual design assets</span>**

**<span style="color: #3B82F6">Design Elements Tab Features:</span>**
**<span style="color: #3B82F6">- Upload Portal for design assets (mascots, backgrounds, UI components, animations, audio, effects)</span>**
**<span style="color: #3B82F6">- Element Library showing all uploaded elements with status badges</span>**
**<span style="color: #3B82F6">- Usage tracking and statistics per element</span>**
**<span style="color: #3B82F6">- Filter by status: All, Published, Pending Review, Approved, Rejected</span>**
**<span style="color: #3B82F6">- Review status indicators and rejection reasons</span>**

# 3. Profile Settings (Default Customization)

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

# 4. Choose Template Type

Click "New Template" on Creator Dashboard. Select type:

- AI-Generated Template — build from scratch using AI
- Custom Upload — upload pre-built HTML game

# 5. AI-Generated Template Path

Select C-BEN competency from master list (e.g., Analytical Thinking, AI & Big Data Skills, Creative Thinking, Leadership & Social Influence, Crisis Management, Budget Allocation, etc.). Choose 1 sub-competency to test.

**<span style="color: #3B82F6">CHANGED: Now supports selecting 1-4 sub-competencies (multi-scene games)</span>**

Provide template details:

- Template name
- Description
- Base prompt (scenario setup)
- Game mechanics instructions
- Edge cases to test
- Duration (typically 3–5 minutes)

**<span style="color: #3B82F6">NEW: PlayOps Framework Structure Guide</span>**

**<span style="color: #3B82F6">When sub-competencies are selected, a visual guide displays:</span>**

**<span style="color: #3B82F6">- Scene 0: Intro Screen (required elements: logo, START button, no auto-start)</span>**
**<span style="color: #3B82F6">- Scene 1-4: Gameplay scenes (one per sub-competency selected)</span>**
**<span style="color: #3B82F6">- Results Screen: Required fields (proficiency level, score, feedback, time, metrics, REPLAY/CONTINUE buttons)</span>**
**<span style="color: #3B82F6">- State Management: JavaScript scene tracking with currentScene variable</span>**
**<span style="color: #3B82F6">- Brand Customization Zones documentation</span>**

**<span style="color: #3B82F6">NEW: Brand Customization Zones (What Brands Can Edit)</span>**

**<span style="color: #3B82F6">EDITABLE by brands:</span>**
**<span style="color: #3B82F6">- Brand Logo (Scene 0, top-left or center)</span>**
**<span style="color: #3B82F6">- Mascot/Avatar (character image throughout game)</span>**
**<span style="color: #3B82F6">- Particle Effects (sparkles, confetti, glitter, stars, bubbles, fire)</span>**
**<span style="color: #3B82F6">- Primary Color (buttons, headers, progress bars)</span>**
**<span style="color: #3B82F6">- Secondary Color (secondary buttons, backgrounds)</span>**
**<span style="color: #3B82F6">- Accent Color (highlights, success states, borders)</span>**
**<span style="color: #3B82F6">- Background Color (main game background)</span>**
**<span style="color: #3B82F6">- Font Family (all text, web-safe fonts)</span>**

**<span style="color: #3B82F6">LOCKED (cannot be edited by brands):</span>**
**<span style="color: #3B82F6">- Scene Structure (Scene 0 → Scene 1-4 → Results)</span>**
**<span style="color: #3B82F6">- Action Cues (from sub-competency)</span>**
**<span style="color: #3B82F6">- Game Mechanics (drag-drop, click, type, etc.)</span>**
**<span style="color: #3B82F6">- Scoring Logic (formulas locked to sub-competency)</span>**
**<span style="color: #3B82F6">- Timer Logic (duration set by designer)</span>**
**<span style="color: #3B82F6">- Edge Case Timing (when disruption occurs)</span>**

**<span style="color: #3B82F6">URL Parameters for Customization:</span>**
**<span style="color: #3B82F6">- ?logo=URL - Brand logo image</span>**
**<span style="color: #3B82F6">- ?avatar=URL - Mascot/character image</span>**
**<span style="color: #3B82F6">- ?particles=TYPE - Particle effect (sparkles, confetti, etc.)</span>**
**<span style="color: #3B82F6">- ?primary=HEX - Primary color</span>**
**<span style="color: #3B82F6">- ?secondary=HEX - Secondary color</span>**
**<span style="color: #3B82F6">- ?accent=HEX - Accent color</span>**
**<span style="color: #3B82F6">- ?background=HEX - Background color</span>**
**<span style="color: #3B82F6">- ?font=NAME - Font family</span>**

# Action Scenes / Rounds (optional):

Use for validators with multiple short scenes (2–4). Each scene is one screen of play (1–30–60 s).

**<span style="color: #3B82F6">CHANGED: Now automatically maps to sub-competencies when multiple are selected</span>**

Example:

- Scene 1 = Baseline decision
- Scene 2 = New variable introduced
- Scene 3 = Edge-case twist
- Scene 4 = Recover & submit final plan

Leave blank if game plays in one continuous round.

# Edge-Case Timing:

Choose when the rule-flip or disruption occurs: Beginning, Early, Mid, or Late.

# Edge-Case Moment:

Describe how the disruption appears (e.g., "Timer cuts in half," "Key data field vanishes mid-game").

# UI Aesthetic:

Describe the visual style (e.g., "Greyscale minimalist," "Neon cyberpunk with Deloitte branding").

# Customize Colors & Font (optional):

Leave unchecked → uses profile default design.

Check to override for this specific game:

- Highlight color
- Text color
- Font family

Avatar and particle effect also customizable per game.

# Decision point:

- Click "Create & Test" → opens test wizard immediately.
- Click "Save as Draft" → test later from dashboard.

# 6. Custom Upload Path

Upload HTML file (game built externally).

**<span style="color: #3B82F6">CHANGED: Form field order restructured</span>**

**<span style="color: #3B82F6">New Flow Order:</span>**
**<span style="color: #3B82F6">1. Template Name & Description</span>**
**<span style="color: #3B82F6">2. Template Type Selection (AI/Custom)</span>**
**<span style="color: #3B82F6">3. Competency & Sub-Competency Selection</span>**
**<span style="color: #3B82F6">4. PlayOps Framework Structure Guide Display</span>**
**<span style="color: #3B82F6">5. Scenario Customization Fields (industry, role, key elements, edge case details, visual theme, interaction method)</span>**
**<span style="color: #3B82F6">6. Designer-Controlled Elements (scenario, player actions, action scenes, edge-case timing/moment, UI aesthetic)</span>**
**<span style="color: #3B82F6">7. Design Customization (optional color/font overrides)</span>**
**<span style="color: #3B82F6">8. File Uploads Section (moved to end):</span>**
**<span style="color: #3B82F6">   - Cover Image Upload</span>**
**<span style="color: #3B82F6">   - Custom Game HTML Upload</span>**

Specify C-BEN competencies tested.

Add metadata (name, description, preview image).

Upload to cloud storage.

Same customization fields apply (action scenes, edge-case timing/moment, UI aesthetic, optional overrides).

# Decision point:

- Click "Create & Test" → open test wizard immediately.
- Click "Save as Draft" → test later from dashboard.

---

# Design Element Upload (NEW)

**<span style="color: #3B82F6">NEW FEATURE: Individual Design Asset Management</span>**

**<span style="color: #3B82F6">Upload Portal allows creators to upload individual design elements:</span>**

**<span style="color: #3B82F6">Element Types:</span>**
**<span style="color: #3B82F6">1. Mascot/Character (static, animated, 3d, rigged)</span>**
**<span style="color: #3B82F6">2. Background (static, parallax, particle)</span>**
**<span style="color: #3B82F6">3. UI Component (button, input, progress_bar, card)</span>**
**<span style="color: #3B82F6">4. Feedback Effect (success, failure, transition)</span>**
**<span style="color: #3B82F6">5. Audio (music, sfx, voiceover)</span>**
**<span style="color: #3B82F6">6. Decorative (icon, border, frame)</span>**
**<span style="color: #3B82F6">7. Animation (lottie, sprite_sheet, css, gif) - NEW TYPE</span>**

**<span style="color: #3B82F6">For Each Element Type:</span>**
**<span style="color: #3B82F6">- Specific Format Requirements (e.g., PNG transparent for mascots, MP3 for audio)</span>**
**<span style="color: #3B82F6">- Maximum File Size Limits (varies by type: 300KB-2MB)</span>**
**<span style="color: #3B82F6">- Telegram Mini-Game Optimization Guidelines</span>**
**<span style="color: #3B82F6">- Mobile performance requirements (60fps, low-end device testing)</span>**

**<span style="color: #3B82F6">Upload Process:</span>**
**<span style="color: #3B82F6">1. Select Element Type and Subtype</span>**
**<span style="color: #3B82F6">2. View specific requirements for selected type</span>**
**<span style="color: #3B82F6">3. Enter Element Name and Description</span>**
**<span style="color: #3B82F6">4. Upload File (drag-and-drop or browse)</span>**
**<span style="color: #3B82F6">5. Select Allowed Placement Zones (intro_screen_mascot, gameplay_background, ui_buttons, etc.)</span>**
**<span style="color: #3B82F6">6. Submit for Review</span>**

**<span style="color: #3B82F6">Review Process:</span>**
**<span style="color: #3B82F6">- All elements go through manual review before approval</span>**
**<span style="color: #3B82F6">- Status: Pending Review → Approved/Rejected</span>**
**<span style="color: #3B82F6">- Approved elements appear in marketplace for brands</span>**
**<span style="color: #3B82F6">- Usage tracking for future royalty payouts (beta)</span>**

**<span style="color: #3B82F6">Element Library:</span>**
**<span style="color: #3B82F6">- View all uploaded elements with preview images</span>**
**<span style="color: #3B82F6">- Status badges (Published, Approved, Pending, Rejected)</span>**
**<span style="color: #3B82F6">- Usage statistics per element</span>**
**<span style="color: #3B82F6">- Filter and sort by status</span>**
**<span style="color: #3B82F6">- Delete unpublished elements</span>**
**<span style="color: #3B82F6">- View rejection reasons (if rejected)</span>**

---

# Validator Testing (3 Phases – Required)

# 6. Phase 1 – UX/UI Flow Test

Checks:

- Game loads without errors
- UI renders correctly

# 7. Phase 2 – Action Cue Validation

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

# 8. Phase 3 – Scoring Formula Test

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

# 9. Complete Testing

Click "Save & Finish" once all phases complete. System calculates overall status:

- ✅ Passed – all phases cleared
- ❌ Failed – one or more failed
- Needs Review – manual review required

---

# Review & Fix

# 10. Test Results Dashboard

View overall status per template. Access detailed phase breakdowns. Review notes and test history.

If Passed → "Approve for Publish" unlocks. If Failed → fix issues, click "Re-test." If Needs Review → address and re-test.

---

# Approval & Publishing

# 11. Approve for Publishing

Requirement: status = Passed. Click "Approve for Publish." Validator becomes marketplace-eligible.

# 12. Publish to Marketplace

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

**<span style="color: #3B82F6">NEW RULES:</span>**
**<span style="color: #3B82F6">- Design elements must pass review before appearing in marketplace</span>**
**<span style="color: #3B82F6">- Custom HTML games must implement all required URL parameters for brand customization</span>**
**<span style="color: #3B82F6">- All games must follow PlayOps Framework scene structure (Scene 0 → Gameplay → Results)</span>**
**<span style="color: #3B82F6">- Mascot zones must be reserved in game layout (recommended: bottom-right corner)</span>**
**<span style="color: #3B82F6">- Particle effects must be integrated via URL parameter system</span>**

---

# Template Creation Form (Complete Field List)

1. **Template Type Selection**
   - AI-Generated Template OR Custom Upload

2. **Core Template Info**
   - Template Name
   - C-BEN Competency (from master list)
   - Sub-Competency **<span style="color: #3B82F6">(1-4 selections supported)</span>**
   - Scenario Context/Description
   - Duration (typically 3-5 minutes)

**<span style="color: #3B82F6">NEW: Industry & Context Fields</span>**
**<span style="color: #3B82F6">- Industry/Context (Marketing, Operations, Sales, Finance, HR, Communications, Customer Service, Technology, Healthcare, Education, Retail, Manufacturing, Legal, Supply Chain, Nonprofit, Government)</span>**
**<span style="color: #3B82F6">- Your Role/Scenario (max 150 chars)</span>**
**<span style="color: #3B82F6">- Key Element (max 100 chars) - what player works with</span>**
**<span style="color: #3B82F6">- Edge Case Specific Details (max 80 chars)</span>**
**<span style="color: #3B82F6">- Visual Theme (Modern/Clean, Executive Dashboard, Casual/Friendly, High-Stakes/Urgent, Minimal/Focus Mode)</span>**
**<span style="color: #3B82F6">- Interaction Method (contextual dropdown based on sub-competency)</span>**

3. **Game Structure**
   - Action Scenes/Rounds (optional)
   - Number of scenes (2-4)
   - Description of each scene
   - Leave blank for continuous single-round play
   
   **<span style="color: #3B82F6">CHANGED: Automatically maps to sub-competencies when multiple selected</span>**

4. **Edge-Case Configuration**
   - Edge-Case Timing: When disruption occurs
     - Beginning / Early / Mid / Late
   - Edge-Case Moment: How disruption appears
     - Text description (e.g., "Timer cuts in half")

5. **Visual Design**
   - UI Aesthetic: Visual style description
     - Example: "Greyscale minimalist" or "Neon cyberpunk"

6. **Customize Colors & Font (Optional Checkbox)**
   - If unchecked → Uses profile defaults
   - If checked → Override for this game:
     - Highlight color
     - Text color
     - Font family
     - Game Avatar (mascot image)
     - Particle Effect (sparkles/confetti/stars/none)

**<span style="color: #3B82F6">NEW: File Uploads Section (Moved to End of Form)</span>**

7. **<span style="color: #3B82F6">File Uploads</span>**
   **<span style="color: #3B82F6">- Cover Image Upload (optional, generated if not provided)</span>**
   **<span style="color: #3B82F6">- Custom Game HTML Upload (for custom upload type only)</span>**

8. **Custom Upload Specific**
   - Upload HTML file
   - Preview image
   - Cloud storage upload
   
   **<span style="color: #3B82F6">CHANGED: This section now appears after all form fields are completed</span>**

9. **Save Options**
   - "Create & Test" → Opens test wizard immediately
   - "Save as Draft" → Test later from dashboard

---

# Summary of Major Changes

**<span style="color: #3B82F6">1. Design Element Upload System</span>**
**<span style="color: #3B82F6">   - New tab on Creator Dashboard for managing individual design assets</span>**
**<span style="color: #3B82F6">   - 7 element types supported (including new Animation type)</span>**
**<span style="color: #3B82F6">   - Telegram Mini-Game optimization requirements</span>**
**<span style="color: #3B82F6">   - Review and approval workflow</span>**

**<span style="color: #3B82F6">2. PlayOps Framework Structure Guide</span>**
**<span style="color: #3B82F6">   - Visual guide showing required scene structure</span>**
**<span style="color: #3B82F6">   - Brand Customization Zones documentation</span>**
**<span style="color: #3B82F6">   - Clear EDITABLE vs LOCKED elements</span>**
**<span style="color: #3B82F6">   - URL parameter implementation guide</span>**
**<span style="color: #3B82F6">   - Code examples for custom HTML games</span>**

**<span style="color: #3B82F6">3. Enhanced Form Structure</span>**
**<span style="color: #3B82F6">   - Multi-sub-competency support (1-4 selections)</span>**
**<span style="color: #3B82F6">   - New contextual fields (industry, role, key elements)</span>**
**<span style="color: #3B82F6">   - Reordered flow: configuration first, file uploads at end</span>**
**<span style="color: #3B82F6">   - Auto-generated player actions based on interaction method</span>**

**<span style="color: #3B82F6">4. Brand Customization Enhancements</span>**
**<span style="color: #3B82F6">   - Mascot/Avatar upload support</span>**
**<span style="color: #3B82F6">   - Particle effects selection system</span>**
**<span style="color: #3B82F6">   - Extended URL parameter system</span>**
**<span style="color: #3B82F6">   - Visual zone placement guidelines</span>**
