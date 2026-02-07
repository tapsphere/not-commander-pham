# Creator Page — Complete Technical Documentation

**Route:** `/platform/creator`  
**Component:** `src/pages/platform/CreatorDashboard.tsx`  
**Main Dialog:** `src/components/platform/TemplateDialog.tsx`

---

## 1. PAGE OVERVIEW

The Creator Dashboard is the primary workspace for creators to:
- Create and manage game templates (validators)
- Upload and manage design elements
- Test validators before publishing
- Publish approved templates to the marketplace

---

## 2. PAGE STRUCTURE

### 2.1 Header Actions

| Button | Route/Action | Purpose |
|--------|--------------|---------|
| **Demo Flow** | `/platform/creator-demo` | Opens demo walkthrough |
| **Edit Profile** | `/platform/creator/profile-edit` | Edit creator profile & default design settings |
| **Test Validators** | `/platform/validator-test` | Access validator testing dashboard |

### 2.2 Two Main Tabs

**Tab 1: My Games**
- Lists all templates created by the logged-in creator
- Shows template cards with preview, status, and actions
- "New Template" button opens TemplateDialog

**Tab 2: Design Elements**
- `DesignElementUpload` — Upload new design assets
- `DesignElementLibrary` — Browse uploaded elements with status tracking

---

## 3. DATA SOURCES

### 3.1 Templates Data

**Table:** `game_templates`

| Field | Type | Purpose |
|-------|------|---------|
| `id` | UUID | Primary key |
| `name` | text | Template name |
| `description` | text | Brief description |
| `base_prompt` | text | AI generation prompt (built from form) |
| `is_published` | boolean | Published to marketplace |
| `template_type` | text | `'ai_generated'` or `'custom_upload'` |
| `custom_game_url` | text | URL for uploaded custom games |
| `selected_sub_competencies` | UUID[] | Array of selected sub-competency IDs |
| `design_settings` | JSONB | Per-game design overrides (optional) |
| `cover_photo_url` | text | Cover image URL |
| `preview_image` | text | Preview image for card display |
| `game_config` | JSONB | Game configuration object |
| `creator_id` | UUID | User who created the template |
| `created_at` / `updated_at` | timestamp | Timestamps |

### 3.2 Test Results Data

**Table:** `validator_test_results`

| Field | Purpose |
|-------|---------|
| `template_id` | Links to template being tested |
| `overall_status` | `'not_started'`, `'in_progress'`, `'passed'`, `'failed'` |
| `approved_for_publish` | Boolean — gates publishing |
| `v3_1_check_results` | JSONB array of 8 automated check results |

### 3.3 Competency Data

**Table:** `master_competencies`

| Field | Purpose |
|-------|---------|
| `id` | UUID |
| `name` | Competency name (e.g., "Analytical Thinking") |
| `cbe_category` | C-BEN category |
| `departments` | Array of relevant departments |
| `is_active` | Whether available for selection |

**Table:** `sub_competencies`

| Field | Purpose |
|-------|---------|
| `id` | UUID |
| `competency_id` | Links to parent competency |
| `statement` | Sub-competency description |
| `action_cue` | What player does (C-BEN) |
| `game_mechanic` | Interactive logic type |
| `game_loop` | Evidence cycle description |
| `validator_type` | Assessment family |
| `player_action` | Verb for player action |
| `scoring_formula_level_1` | L1 scoring formula |
| `scoring_formula_level_2` | L2 scoring formula |
| `scoring_formula_level_3` | L3 scoring formula |
| `backend_data_captured` | JSONB array of telemetry fields |
| `display_order` | Sort order |

### 3.4 User Profile Data

**Table:** `profiles`

| Field | Purpose |
|-------|---------|
| `full_name` | Creator display name |
| `avatar_url` | Creator avatar |
| `design_palette` | Default design settings (JSONB) |
| `game_avatar_url` | Default game avatar |
| `default_particle_effect` | Default particle effect |
| `mascot_animation_type` | Default mascot animation |
| `primary_color` / `secondary_color` | Default brand colors |

---

## 4. REFACTORED WORKFLOW: THE BRAND CANVAS

The Template Creation process is now a Full-Screen Studio Workspace with a persistent 'Live Mirror' Mobile Preview.

### 4.0 Studio Architecture
- **Full-Screen Mode:** The studio takes over the entire viewport (no modal dialog).
- **Split-Pane Layout:** Left pane = 4-Tab Stepper editor, Right pane = Fixed Live Mirror preview.
- **Theme Support:** Dark/Light mode toggle with high-contrast Glassmorphism styling.
- **Responsive Design:** Handles different screen sizes without nested scrollbars.

### 4.1 Step 1: Identity
Basic template information with industry-specific smart placeholders:
- Industry Context selection (affects placeholder text)
- Template Name (required) with ghost preview
- Description (optional)
- Cover Image upload

### 4.2 Step 2: Framework & Logic (THE PULL)
- **Trigger:** Creator selects 1 Competency and clicks up to 6 Sub-Competencies in order (1-6).
- **Automation:** System fetches the following from the `sub_competencies` table:
    - **Action Cue** (e.g., Identify SQL Injection) → LOCKED.
    - **Mobile Interaction** (e.g., Drag & Drop) → LOCKED.
    - **Binary Scoring Rule** → Default 60s (Editable to 45s/30s).
    - **Telemetry Group** → Locked hidden mapping for biometric capture.

### 4.3 Step 3: Scene Builder (DYNAMIC CARDS)
- **Logic Cards:** Each of the 6 scenes displays a 'Scene Logic Card'.
- **Scene Syncing:** Clicking a Scene Card instantly updates the Live Mirror to show that scene.
- **Dynamic Choices:** Default choice slots (2 or 4) are set by the Mechanic but allow creator override (2-10 slots).
- **Outcome Result Mapping:** Each choice slot must be marked as "Correct (Success)" or "Incorrect (Failure)".
- **AI Remix Bar:** A prompt at the bottom allows the brand to remix the autofilled template text into brand-specific scenarios.

### 4.4 Step 4: Brand Skin
Visual customization that updates the Live Mirror in real-time:
- Primary Color → affects buttons, progress bars
- Secondary Color → affects accents
- Font Family selection
- Logo/Avatar upload
- Particle effects selection

---

## 5. LIVE MIRROR PREVIEW

A fixed-position side-panel on the right showing a real-time mobile preview:

| Feature | Behavior |
|---------|----------|
| **Live Ghost State** | Shows placeholders in 'ghost' style before creator types |
| **Real-time Text** | Scene question/choices update as creator types |
| **Color Sync** | Primary color changes button colors instantly |
| **Choice Slots** | Shows correct/incorrect badges on choices |
| **Scene Navigation** | Clicking scene dots updates the preview |
| **Locked Telemetry Buttons** | 'Undo' and 'Back' buttons hard-coded in UI for jitter tracking |

---

## 6. DATA SOURCES

### 6.1 Templates Data

**Table:** `game_templates`

| Field | Type | Purpose |
|-------|------|---------|
| `id` | UUID | Primary key |
| `name` | text | Template name |
| `description` | text | Brief description |
| `base_prompt` | text | AI generation prompt (built from form) |
| `is_published` | boolean | Published to marketplace |
| `template_type` | text | `'ai_generated'` or `'custom_upload'` |
| `custom_game_url` | text | URL for uploaded custom games |
| `selected_sub_competencies` | UUID[] | Array of selected sub-competency IDs |
| `design_settings` | JSONB | Per-game design overrides (optional) |
| `cover_photo_url` | text | Cover image URL |
| `preview_image` | text | Preview image for card display |
| `game_config` | JSONB | Game configuration object |
| `creator_id` | UUID | User who created the template |
| `created_at` / `updated_at` | timestamp | Timestamps |

### 6.2 Test Results Data

**Table:** `validator_test_results`

| Field | Purpose |
|-------|---------|
| `template_id` | Links to template being tested |
| `overall_status` | `'not_started'`, `'in_progress'`, `'passed'`, `'failed'` |
| `approved_for_publish` | Boolean — gates publishing |
| `v3_1_check_results` | JSONB array of 8 automated check results |

### 6.3 Competency Data

**Table:** `master_competencies`

| Field | Purpose |
|-------|---------|
| `id` | UUID |
| `name` | Competency name (e.g., "Analytical Thinking") |
| `cbe_category` | C-BEN category |
| `departments` | Array of relevant departments |
| `is_active` | Whether available for selection |

**Table:** `sub_competencies`

| Field | Purpose |
|-------|---------|
| `id` | UUID |
| `competency_id` | Links to parent competency |
| `statement` | Sub-competency description |
| `action_cue` | What player does (C-BEN) |
| `game_mechanic` | Interactive logic type |
| `game_loop` | Evidence cycle description |
| `validator_type` | Assessment family |
| `player_action` | Verb for player action |
| `scoring_formula_level_1` | L1 scoring formula |
| `scoring_formula_level_2` | L2 scoring formula |
| `scoring_formula_level_3` | L3 scoring formula |
| `backend_data_captured` | JSONB array of telemetry fields |
| `display_order` | Sort order |

### 6.4 User Profile Data

**Table:** `profiles`

| Field | Purpose |
|-------|---------|
| `full_name` | Creator display name |
| `avatar_url` | Creator avatar |
| `design_palette` | Default design settings (JSONB) |
| `game_avatar_url` | Default game avatar |
| `default_particle_effect` | Default particle effect |
| `mascot_animation_type` | Default mascot animation |
| `primary_color` / `secondary_color` | Default brand colors |

---

## 7. SCENE BUILDER DETAILS

### 7.1 Scene Card Structure

Each scene card contains:
| Element | Editable | Source |
|---------|----------|--------|
| Scene Number | No | Auto-assigned (1-6) |
| Question Text | Yes | Creator input / AI remix |
| Choices (2-10) | Yes | Creator configures count |
| Correct/Incorrect Badge | Yes | Creator assigns per choice |
| Time Limit | Yes | 30s / 45s / 60s |

### 7.2 Smart Autofill Logic

When a sub-competency is selected:
1. Fetch `action_cue` and `game_mechanic` from database
2. Auto-populate scene with template text based on mechanic type
3. Pre-assign 4 choices with correct/incorrect mapping
4. Set default time limit to 60s

### 7.3 AI Remix Feature

- Input field at bottom of Scene Builder
- Creator types prompt (e.g., "Make this about high-fashion boots")
- AI rewrites Question/Choices text
- Correct/Incorrect slot assignments remain LOCKED

---

## 8. TEMPLATE CARD ACTIONS

Each template card displays:
- Preview image (generated if not uploaded)
- Name and creator info
- Published/Draft status badge
- Last edited timestamp

**Action Buttons:**

| Button | Action | Condition |
|--------|--------|-----------|
| **Edit** | Opens TemplateDialog with template data | Always available |
| **Layers** | Opens CompetenciesDialog | Always available |
| **Publish/Unpublish** | Toggles `is_published` | Publish requires: tests passed + approved |
| **Delete** | Removes template | Always available (with confirm) |
| **Card Click** | Generates/opens game preview | Always available |

---

## 9. PUBLISHING FLOW

### Requirements to Publish:
1. Template must have test results in `validator_test_results`
2. `overall_status` must be `'passed'`
3. `approved_for_publish` must be `true`

### What Happens on Publish:
1. Calls `publish-template` edge function
2. Creates two `validators_runtime` records:
   - **Training Mode** (practice, no scoring)
   - **Testing Mode** (scored, proof emission)
3. Sets `is_published = true` on template

---

## 10. DESIGN ELEMENTS TAB

### 10.1 Element Types Supported
- Mascot/Avatar (PNG, SVG, GIF)
- Background (JPG, PNG, SVG)
- UI Component (SVG, PNG)
- Particle Effect (JSON, PNG sprite)
- Sound Effect (MP3, WAV, OGG)
- Font File (TTF, WOFF, WOFF2)
- Animation (lottie, sprite_sheet, css, gif)

### 10.2 Data Table: `design_elements`

| Field | Purpose |
|-------|---------|
| `creator_id` | Owner |
| `element_type` | Category |
| `element_subtype` | Specific type (e.g., 'lottie') |
| `name` | Display name |
| `file_url` | Storage URL |
| `review_status` | pending_review, approved, rejected |
| `is_published` | Visible in library |
| `usage_count` | Times used by brands |
| `allowed_zones` | Where element can be placed |

### 10.3 Storage Bucket
- **Bucket:** `design-elements` (public)

---

## 11. AUTOMATIC BEHAVIORS

### 11.1 Auto-Population
When sub-competencies are selected:
- Scene descriptions auto-populate based on validator_type
- Interaction methods filter based on game_mechanic
- Edge case defaults based on game_mechanic
- Key element suggestions based on game_mechanic

### 11.2 Auto-Generated Covers
If template has no preview image:
- `generateDefaultCover()` creates one using creator's avatar/name
- Uploads to `validator-previews` bucket
- Updates template record

### 11.3 Creator Role Assignment
On dashboard load, ensures user has `'creator'` role in `user_roles` table.

---

## 12. RELATED COMPONENTS

| Component | File | Purpose |
|-----------|------|---------|
| TemplateDialog | `src/components/platform/TemplateDialog.tsx` | Main creation stepper |
| TemplateStudio | `src/components/platform/TemplateStudio.tsx` | Full-screen studio workspace |
| TemplateStepIdentity | `src/components/platform/template-steps/TemplateStepIdentity.tsx` | Step 1: Basic info |
| TemplateStepFramework | `src/components/platform/template-steps/TemplateStepFramework.tsx` | Step 2: Competency selection |
| TemplateStepSceneBuilder | `src/components/platform/template-steps/TemplateStepSceneBuilder.tsx` | Step 3: Scene cards |
| TemplateStepBrandSkin | `src/components/platform/template-steps/TemplateStepBrandSkin.tsx` | Step 4: Visual customization |
| StudioLiveMirror | `src/components/platform/studio/StudioLiveMirror.tsx` | Real-time preview panel |
| StudioStepperNav | `src/components/platform/studio/StudioStepperNav.tsx` | 4-step navigation |
| StudioIdentityStep | `src/components/platform/studio/StudioIdentityStep.tsx` | Enhanced identity step |
| StudioThemeContext | `src/components/platform/studio/StudioThemeContext.tsx` | Dark/light mode toggle |
| SceneCard | `src/components/platform/SceneCard.tsx` | Individual scene editor |
| CompetenciesDialog | `src/components/platform/CompetenciesDialog.tsx` | Manage template competencies |
| ValidatorTestWizard | `src/components/platform/ValidatorTestWizard.tsx` | V3.1 8-check testing |
| PostTestActions | `src/components/platform/PostTestActions.tsx` | Post-test publish/download options |
| DesignPaletteEditor | `src/components/platform/DesignPaletteEditor.tsx` | Color/font customization |

---

## 13. LOCKED VS EDITABLE (REVISED)

### LOCKED (Pulled from Data Sheet):
- **Action Cue:** Auto-populated read-only badge.
- **Game Mechanic & Interaction Method:** Forced by the competency data; cannot be changed by creator.
- **Success Mapping:** The "Target" logic slot is hard-coded to the Success outcome.
- **Telemetry Buttons:** 'Undo' and 'Back' buttons are hard-coded in the UI for jitter tracking.
- **Scoring Formulas:** L1/L2/L3 formulas from `sub_competencies` table.
- **Backend Data Captured:** Telemetry fields from database.
- **XP Values:** 100/250/500 per level (system default).
- **Scene Structure:** Scene 0 → Instructions → Gameplay → Results.

### EDITABLE (Brand Creativity):
- **Template Name & Description**
- **Narrative Content:** All Question and Choice text.
- **Outcome Feedback:** Custom success/failure messages per brand standards.
- **Time Limits:** Choice of 30, 45, or 60 seconds per scene.
- **Choice Count:** 2-10 choices per scene.
- **Visual Skin:** Logos, colors, fonts, and particle effects.
- **Industry/Context:** Dropdown selection.
- **Cover Image:** Custom upload or auto-generated.

---

## 14. VALIDATION REQUIREMENTS

Before publishing, templates must pass 8 automated checks:

1. **Scene Structure** — Required scenes present
2. **UX/UI Integrity** — Responsive, touch targets, contrast
3. **Telegram Compliance** — Bundle size, no external CDN
4. **Config Objects** — brandConfig object exists
5. **Action Cue Alignment** — Mechanics match competency
6. **Scoring Verification** — Formula math is sound
7. **Accessibility** — Keyboard nav, ARIA labels
8. **Proof Emission** — Telemetry fires correctly

---

## 15. EDGE FUNCTIONS CALLED

| Function | When Called | Purpose |
|----------|-------------|---------|
| `generate-game` | Preview button / AI generation | Generates game HTML from prompt |
| `publish-template` | Publish button | Creates runtime modes, sets published |

---

## 16. STORAGE BUCKETS USED

| Bucket | Purpose |
|--------|---------|
| `validator-previews` | Template cover images |
| `custom-games` | Uploaded HTML game files |
| `design-elements` | Creator design assets |
| `profiles` | User avatars |

---

## 17. FILE SIZES (POST-REFACTOR)

| File | Lines | Purpose |
|------|-------|---------|
| TemplateDialog.tsx | ~300 | Main stepper wrapper |
| TemplateStepIdentity.tsx | ~80 | Step 1 component |
| TemplateStepFramework.tsx | ~200 | Step 2 component |
| TemplateStepSceneBuilder.tsx | ~250 | Step 3 component |
| TemplateStepBrandSkin.tsx | ~150 | Step 4 component |
| LiveMobilePreview.tsx | ~200 | Preview panel |
| SceneCard.tsx | ~150 | Scene editor card |
| CreatorDashboard.tsx | ~400 | Dashboard page |

Components are now modular and maintainable.
