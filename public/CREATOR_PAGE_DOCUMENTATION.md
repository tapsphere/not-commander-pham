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

## 4. TEMPLATE CREATION FLOW

### 4.1 Two Creation Methods (Tabs in TemplateDialog)

**Tab 1: Generate New Game (AI)**
- AI creates validator from creator's inputs
- Calls `generate-game` edge function

**Tab 2: Test Custom Game**
- Upload pre-built HTML file
- Must pass validation before publishing

### 4.2 Form Fields — AI Generation

#### Section 1: Basic Info
| Field | Type | Required | Max Length |
|-------|------|----------|------------|
| Template Name | text | ✅ | — |
| Description | textarea | ❌ | — |

#### Section 2: Competency Framework

| Field | Source | Options |
|-------|--------|---------|
| **Competency** | `master_competencies` table | Dropdown of active competencies |
| **Sub-Competencies** | `sub_competencies` table | Checkboxes, 1-6 max (each = 1 scene) |

When sub-competencies are selected, the following is displayed from the database:
- Validator Type
- Action Cue
- Game Mechanic
- Game Loop

**These are LOCKED per C-BEN standards.**

#### Section 3: Customize Your Scenario

| Field | Type | Options/Limit | Source |
|-------|------|---------------|--------|
| **Industry/Context** | dropdown | 16 options | Hardcoded in component |
| **Role/Scenario** | text | 150 chars max | Creator input |
| **Key Element** | text | 100 chars max | Creator input |
| **Edge Case Details** | text | 80 chars max | Creator input |
| **Visual Theme** | dropdown | 5 options | Hardcoded |
| **Interaction Method** | dropdown | Dynamic based on game_mechanic | Logic in component |

**Industry Options (hardcoded):**
- Marketing, Operations, Sales, Finance, Human Resources, Communications
- Customer Service, Technology/IT, Healthcare, Education, Retail
- Manufacturing, Legal, Supply Chain, Nonprofit, Government

**Visual Theme Options (hardcoded):**
- Modern/Clean
- Executive Dashboard
- Casual/Friendly
- High-Stakes/Urgent
- Minimal/Focus Mode

**Interaction Method Options:**
Dynamically generated based on selected sub-competency's `game_mechanic` field. Examples:
- Resource Allocation → Drag-and-drop, sliders, +/- buttons
- Ranking/Prioritization → Drag to reorder, arrows, buckets
- Data Analysis → Click tags, draw lines, filters
- Error Detection → Click to flag, dropdown, bins

#### Section 4: Scene Descriptions

| Field | Purpose |
|-------|---------|
| Scenario | Context for the scenario |
| Player Actions | What player does (auto-populated from action_cue) |
| Scene 1-6 | Description per scene (matches sub-competency count) |

#### Section 5: Edge Case Configuration

| Field | Options |
|-------|---------|
| Edge Case Timing | Early, Mid, Late |
| Edge Case Description | Text field (auto-populated based on game_mechanic) |

#### Section 6: UI Aesthetic

| Field | Purpose |
|-------|---------|
| UI Aesthetic | Free text for visual style description |

#### Section 7: Design Customization (Optional)

Checkbox: "Customize colors & font for this game"

If checked, opens `DesignPaletteEditor` with:
| Field | Default |
|-------|---------|
| Primary Color | #C8DBDB |
| Secondary Color | #6C8FA4 |
| Accent Color | #2D5556 |
| Background Color | #F5EDD3 |
| Highlight Color | #F0C7A0 |
| Text Color | #2D5556 |
| Font Family | Inter, sans-serif |
| Avatar URL | — |
| Particle Effect | sparkles |

#### Section 8: File Uploads

| Field | Purpose | Storage |
|-------|---------|---------|
| Cover Image | Card preview image | `validator-previews` bucket |
| Custom Game HTML | For custom uploads | `custom-games` bucket |

---

## 5. WHAT GETS SAVED TO DATABASE

When form is submitted, this data is saved to `game_templates`:

```javascript
{
  name: formData.name,
  description: formData.description,
  base_prompt: generatedPrompt, // Built from all form fields
  template_type: 'ai_generated' | 'custom_upload',
  competency_id: selectedCompetency,
  selected_sub_competencies: selectedSubCompetencies, // UUID array
  design_settings: useCustomDesign ? designSettings : null,
  cover_photo_url: uploadedCoverUrl,
  custom_game_url: uploadedGameUrl, // For custom uploads
  game_config: {
    industry: formData.industry,
    visualTheme: formData.visualTheme,
    interactionMethod: formData.interactionMethod,
    edgeCaseTiming: formData.edgeCaseTiming,
    // ... other config
  },
  creator_id: user.id,
  is_published: false
}
```

---

## 6. TEMPLATE CARD ACTIONS

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

## 7. PUBLISHING FLOW

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

## 8. DESIGN ELEMENTS TAB

### 8.1 Element Types Supported
- Mascot/Avatar (PNG, SVG, GIF)
- Background (JPG, PNG, SVG)
- UI Component (SVG, PNG)
- Particle Effect (JSON, PNG sprite)
- Sound Effect (MP3, WAV, OGG)
- Font File (TTF, WOFF, WOFF2)
- Animation (lottie, sprite_sheet, css, gif)

### 8.2 Data Table: `design_elements`

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

### 8.3 Storage Bucket
- **Bucket:** `design-elements` (public)

---

## 9. AUTOMATIC BEHAVIORS

### 9.1 Auto-Population
When sub-competencies are selected:
- Scene descriptions auto-populate based on validator_type
- Interaction methods filter based on game_mechanic
- Edge case defaults based on game_mechanic
- Key element suggestions based on game_mechanic

### 9.2 Auto-Generated Covers
If template has no preview image:
- `generateDefaultCover()` creates one using creator's avatar/name
- Uploads to `validator-previews` bucket
- Updates template record

### 9.3 Creator Role Assignment
On dashboard load, ensures user has `'creator'` role in `user_roles` table.

---

## 10. RELATED COMPONENTS

| Component | File | Purpose |
|-----------|------|---------|
| TemplateDialog | `src/components/platform/TemplateDialog.tsx` | Main creation form |
| CompetenciesDialog | `src/components/platform/CompetenciesDialog.tsx` | Manage template competencies |
| ValidatorTestWizard | `src/components/platform/ValidatorTestWizard.tsx` | V3.1 8-check testing |
| PostTestActions | `src/components/platform/PostTestActions.tsx` | Post-test publish/download options |
| DesignPaletteEditor | `src/components/platform/DesignPaletteEditor.tsx` | Color/font customization |
| PlayOpsStructureGuide | `src/components/platform/PlayOpsStructureGuide.tsx` | Scene structure guide |
| DesignElementUpload | `src/components/platform/DesignElementUpload.tsx` | Element upload form |
| DesignElementLibrary | `src/components/platform/DesignElementLibrary.tsx` | Element library view |

---

## 11. EDGE FUNCTIONS CALLED

| Function | When Called | Purpose |
|----------|-------------|---------|
| `generate-game` | Preview button / AI generation | Generates game HTML from prompt |
| `publish-template` | Publish button | Creates runtime modes, sets published |

---

## 12. STORAGE BUCKETS USED

| Bucket | Purpose |
|--------|---------|
| `validator-previews` | Template cover images |
| `custom-games` | Uploaded HTML game files |
| `design-elements` | Creator design assets |
| `profiles` | User avatars |

---

## 13. LOCKED VS EDITABLE

### What Creator CHOOSES (Editable):
- Template name & description
- Industry/context
- Role/scenario text
- Key elements
- Edge case specifics
- Visual theme
- Interaction method
- Scene descriptions
- UI aesthetic
- Design colors & fonts (optional override)
- Cover image

### What is LOCKED (From Database/C-BEN):
- Competency & sub-competency selection (from master list)
- Action Cue (from sub_competencies)
- Game Mechanic (from sub_competencies)
- Game Loop (from sub_competencies)
- Validator Type (from sub_competencies)
- Scoring Formulas L1/L2/L3 (from sub_competencies)
- Backend Data Captured (from sub_competencies)
- XP Values (100/250/500 per level)
- Scene structure (Scene 0 → Instructions → Gameplay → Results)

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

## 15. FILE SIZE

- **TemplateDialog.tsx:** 2,373 lines
- **CreatorDashboard.tsx:** 731 lines

Both files are candidates for refactoring into smaller components.
