# Documentation Usage Guide
**How PlayOps Platform Documents Are Currently Used**

---

## Overview

This guide explains how each documentation file in the PlayOps platform is currently being used, where it's referenced in the codebase, and its importance for system functionality.

---

## 📊 ACTIVELY USED IN CODE

### 1. **CBEN_PlayOps_Framework_Finale.xlsx**
**CRITICAL - Core Data Source**

**Location:** `framework-files/CBEN_PlayOps_Framework_Finale.xlsx` (Supabase Storage bucket)

**Used By:**
- **`supabase/functions/analyze-course/index.ts`** (Lines 199-208)
  - Fetches Excel file from storage at runtime
  - Reads Page 3 (Sub-Competencies) to extract available competencies
  - Parses columns: Statement, Action Cue, Game Mechanic, Validator Type, Scoring Formula
  - Used when brands upload course documents for competency mapping

- **`supabase/functions/generate-game/index.ts`** (Lines 63-140)
  - References Page 3 (Game Design Data) for:
    - Action Cue (what player does)
    - Game Mechanic (how it works)
    - Game Loop (interaction pattern)
    - Scoring Formula for each proficiency level
    - Validator Type (mini-game category)
  - References Page 4 (XP Awards) for:
    - L1 (Needs Work): 100 XP
    - L2 (Proficient): 250 XP  
    - L3 (Mastery): 500 XP
  - Embeds this data into AI generation prompts

- **`src/utils/v3Validator.ts`** (Lines 282-291)
  - Uses Tab 4 XP values:
    - Mastery: 15 XP
    - Proficient: 10 XP
    - Needs Work: 5 XP
  - Comment explicitly states: "DO NOT MODIFY without updating source"

**Impact if Missing:**
- ❌ Course analysis will fail
- ❌ Game generation will not have correct mechanics/scoring
- ❌ XP calculations will be incorrect

**Update Process:**
- Must be uploaded to `framework-files` storage bucket
- File name must match exactly: `CBEN_PlayOps_Framework_Finale.xlsx`
- Changes to Excel structure require updating edge function parsers

---

### 2. **CUSTOM_GAME_TEMPLATE_GUIDE.md**
**IMPORTANT - User-Facing Guide**

**Location:** `public/CUSTOM_GAME_TEMPLATE_GUIDE.md`

**Linked In:**
- **`src/components/platform/CustomGameUpload.tsx`** (Lines 135-140)
  - Shows clickable link: "📖 View Complete Custom Game Template Guide"
  - Displayed when creators upload custom HTML games
  - Opens in new tab via `href="/CUSTOM_GAME_TEMPLATE_GUIDE.md"`

- **`src/components/platform/PlayOpsStructureGuide.tsx`** (Lines 262-268)
  - Shows link: "View Complete Custom Game Template Guide →"
  - Displayed in structure guide dialog
  - Helps creators understand requirements

**Impact if Missing:**
- ⚠️ Creators won't see template guide link (404 error)
- ⚠️ Custom game uploads may not follow required structure

**Update Process:**
- File must remain in `/public` folder
- Can be edited directly - changes appear immediately
- Should include Scene 0/1 structure, required window objects, mobile requirements

---

## 📖 REFERENCE DOCUMENTATION (Not Loaded by Code)

### 3. **BASE_LAYER_1_BAKED_LOCKED_v3.0.md**
**Purpose:** Architecture specification for all validator games

**Referenced By:** Conceptually guides game generation prompts in `generate-game` edge function

**Content:**
- Scene structure (Intro → Gameplay → Results)
- Scoring system (3-level proficiency)
- Mobile requirements (touch optimization, scrollable areas)
- Modal/accessibility requirements
- Brand customization rules (what's locked vs. editable)

**Usage:** Developers reference this when building game templates or modifying generation logic

---

### 4. **V31_IMPLEMENTATION_GUIDE.md**
**Purpose:** Developer guide for implementing v3.1 scoring/validation

**Referenced By:** Implementation follows patterns described here

**Content:**
- How `v3Validator.ts` works
- How `useGameIframe.ts` polls for results
- How `GamePlayer.tsx` displays scores
- Required window objects (`__CONFIG__`, `__GOLD_KEY__`, `__EDGE__`, `__RESULT__`, `__PROOF__`)
- XP calculation formulas

**Usage:** Developers reference when working on game validation or scoring features

---

### 5. **VALIDATOR_TESTING_v3.1.md**
**Purpose:** Explains automated testing pipeline for validators

**Referenced By:** Describes behavior of `V3ComplianceChecker` component

**Content:**
- 8-step automated validation checks:
  1. Scene Structure
  2. UX/UI Integrity
  3. Telegram Mini-App Compliance
  4. Embedded Configuration Objects
  5. Action Cue & Mechanic Alignment
  6. Scoring Formula Verification
  7. Accessibility & Mobile Readiness
  8. Proof Emission & Telemetry
- Pass/Needs Review/Failed classification
- Alignment with C-BEN framework

**Usage:** Creators reference to understand testing requirements; developers reference when updating `V3ComplianceChecker`

---

### 6. **PLAYOPS_FRAMEWORK_SOURCE.md**
**Purpose:** Explains how to interpret the Excel framework file

**Content:**
- Tab 3: Game Design Specifications (Action Cue, Game Mechanic, Game Loop, Scoring Formula, Validator Type)
- Tab 4: XP Awards & Level Definitions
- Database schema mapping (`sub_competencies` table)
- `calculateV31XP` function explanation
- Safelisted Action Cue verbs
- Update process for framework changes

**Usage:** Developers reference when modifying Excel parsing logic or scoring systems

---

### 7. **DEMO_CBE_COMPETENCY_DOCUMENTATION.md**
**Purpose:** Example competency definitions for demo purposes

**Usage:** Reference material for understanding competency structure

---

### 8. **CREATOR_FLOW_COMPARISON.md / CREATOR_FLOW_UPDATED.md**
**Purpose:** Documents old vs. new creator workflows

**Usage:** Historical reference; replaced by dynamically generated PDF via `generateCreatorFlowPDF.ts`

---

### 9. **ANSWER_VALIDATION_GUIDE.md**
**Purpose:** Guidelines for validating player answers in mini-games

**Usage:** AI/developer reference for implementing answer checking logic

---

### 10. **AI_GENERATION_PROMPT.md**
**Purpose:** Template prompts for AI game generation

**Usage:** May be used as reference when updating `generate-game` edge function prompts

---

## 🔄 DYNAMICALLY GENERATED DOCUMENTS

### **Creator Flow PDF** (Generated via `src/utils/generateCreatorFlowPDF.ts`)
**Trigger:** Was accessible via "Updated Flow PDF" button on Creator Dashboard (now removed)

**Purpose:** 
- Explains unified template creation flow (9 steps)
- Documents Scene 0 (Loading) → Instructions → Gameplay → Results flow
- Details Post-Test Actions (Publish Now vs. Download to Customize)

**Generation:** Uses jsPDF library to create multi-page PDF with blue highlighting for updates

**Current Status:** Generation function exists but button removed from UI

---

## 📋 HANDOFF CHECKLIST

### Critical Files (System Won't Work Without)
- ✅ `CBEN_PlayOps_Framework_Finale.xlsx` in `framework-files` storage bucket
- ✅ `CUSTOM_GAME_TEMPLATE_GUIDE.md` in `/public` folder

### Important Reference Docs (Developers Need)
- ✅ `BASE_LAYER_1_BAKED_LOCKED_v3.0.md`
- ✅ `V31_IMPLEMENTATION_GUIDE.md`
- ✅ `VALIDATOR_TESTING_v3.1.md`
- ✅ `PLAYOPS_FRAMEWORK_SOURCE.md`

### Optional Reference Docs
- `ANSWER_VALIDATION_GUIDE.md`
- `AI_GENERATION_PROMPT.md`
- `DEMO_CBE_COMPETENCY_DOCUMENTATION.md`
- `CREATOR_FLOW_*.md` (historical)

---

## 🔍 How to Find Document References in Code

### Search Patterns:
```bash
# Find Excel file usage
grep -r "CBEN_PlayOps_Framework" supabase/functions/

# Find custom game guide references  
grep -r "CUSTOM_GAME_TEMPLATE_GUIDE" src/

# Find XP calculation references
grep -r "calculateV31XP" src/

# Find window object references
grep -r "__CONFIG__|__GOLD_KEY__|__EDGE__|__RESULT__|__PROOF__" src/
```

### Key Files to Check When Updating Docs:
- `supabase/functions/generate-game/index.ts` - Uses PlayOps Framework data
- `supabase/functions/analyze-course/index.ts` - Parses Excel file
- `src/utils/v3Validator.ts` - XP and scoring calculations
- `src/components/platform/CustomGameUpload.tsx` - Links to template guide
- `src/components/platform/V3ComplianceChecker.tsx` - Validation logic

---

## 🚨 Common Issues

### Issue: "Excel file not found" error in course analysis
**Solution:** 
1. Check `framework-files` storage bucket exists
2. Verify file is named exactly `CBEN_PlayOps_Framework_Finale.xlsx`
3. Confirm file is in root of bucket (not subfolder)

### Issue: Custom game template guide shows 404
**Solution:**
1. Verify `CUSTOM_GAME_TEMPLATE_GUIDE.md` exists in `/public` folder
2. Check file name spelling matches exactly
3. Ensure public folder is being deployed

### Issue: XP values don't match expectations
**Solution:**
1. Check Excel file Tab 4 values
2. Verify `v3Validator.ts` matches Excel
3. Confirm `generate-game` function uses correct XP values

---

## 📝 Document Update Workflow

### Updating CBEN_PlayOps_Framework_Finale.xlsx:
1. Update Excel file with new competencies/scoring
2. Upload to `framework-files` storage bucket (overwrites existing)
3. Test course analysis function with new data
4. Test game generation with affected competencies
5. Update `PLAYOPS_FRAMEWORK_SOURCE.md` to document changes

### Updating Architecture Docs:
1. Edit markdown file in `/public` folder
2. Update any code that references changed behavior
3. Update implementation guides if APIs changed
4. Test affected components

### Updating Custom Game Template Guide:
1. Edit `CUSTOM_GAME_TEMPLATE_GUIDE.md` in `/public`
2. Test link from CustomGameUpload component
3. Verify examples still work with current architecture

---

## 📞 Questions to Ask During Handoff

1. **Excel Framework:**
   - Where is the master Excel file stored outside of the app?
   - Who has permission to update competency definitions?
   - What's the process for adding new sub-competencies?

2. **Documentation Maintenance:**
   - Who is responsible for keeping architecture docs updated?
   - Are there other documentation sources not in this repo?
   - Should old comparison docs be archived or deleted?

3. **Testing Documentation:**
   - Are there additional testing procedures not documented?
   - Should `VALIDATOR_TESTING_v3.1.md` be linked in the UI?

4. **Creator Resources:**
   - Should the Creator Flow PDF be accessible again?
   - Are there video tutorials or external resources to link?

---

**Last Updated:** 2025-11-12  
**Version:** 1.0  
**Contact:** [Add handoff contact info]
