# Validator Testing Guide

## Overview

The Validator Testing Dashboard allows you to stress test all your game validators before publishing them. This ensures quality, C-BEN compliance, and proper functionality for both AI-generated and custom-uploaded games.

## Accessing the Testing Dashboard

1. Navigate to your **Creator Dashboard** (`/platform/creator`)
2. Click the **"Test Validators"** button in the header
3. Or select **"Test Validators"** from the navigation menu

---

## Understanding the Testing Phases

Every validator goes through **3 critical testing phases**:

### Phase 1: UX/UI Flow Test
**What it checks:**
- Game loads without errors
- UI elements render correctly
- Navigation and interactions work smoothly
- Visual elements match design specifications
- Responsive design works across devices

**How to test:**
1. Launch the game validator
2. Navigate through all screens and interactions
3. Test on different screen sizes
4. Verify all buttons, inputs, and UI elements respond correctly
5. Check for console errors or visual glitches

**Pass criteria:**
- ✅ No console errors
- ✅ All UI elements visible and functional
- ✅ Smooth user experience
- ✅ Responsive on mobile/tablet/desktop

---

### Phase 2: Action Cue Validation
**What it checks:**
- The game accurately captures the sub-competency being tested
- Player actions align with the action cue statement
- Game mechanics properly demonstrate the skill
- Backend data capture matches expected behaviors

**How to test (AI-Generated Games):**
1. Review the sub-competency statement and action cue
2. Play through the game naturally
3. Verify that your actions directly relate to the skill being measured
4. Check if the game mechanic makes sense for the competency

**How to test (Custom Upload Games):**
1. Review the selected sub-competencies
2. Play the game and identify which actions trigger competency measurement
3. Verify API calls are sending correct data to backend
4. Check `backend_data_captured` matches your actual game events

**Pass criteria:**
- ✅ Game actions clearly demonstrate the sub-competency
- ✅ Action cue is intuitive and measurable
- ✅ Backend captures relevant behavioral data
- ✅ No ambiguity in what skill is being tested

---

### Phase 3: Scoring Formula Test
**What it checks:**
- Scoring logic accurately reflects player performance
- XP/levels are calculated correctly
- Pass/fail thresholds are appropriate
- Proficiency levels match actual skill demonstration

**How to test:**
1. **Run multiple test attempts with varying performance:**
   - Play poorly (test minimum thresholds)
   - Play average (test mid-range scoring)
   - Play excellently (test maximum scoring)

2. **Verify scoring formulas:**
   - **Level 1 (Novice):** Basic task completion
   - **Level 2 (Intermediate):** Quality and efficiency
   - **Level 3 (Expert):** Advanced techniques + mastery

3. **Check backend data:**
   - Review `scoring_metrics` in database
   - Verify `passed` boolean is accurate
   - Confirm `proficiency_level` matches performance

**Pass criteria:**
- ✅ Poor performance = appropriate low score/fail
- ✅ Average performance = mid-range score
- ✅ Excellent performance = high score/pass
- ✅ Proficiency levels reflect actual skill demonstration
- ✅ Scoring is consistent across multiple attempts

---

## Template Type Differences

### 🤖 AI-Generated Games
- **Automated checks:** System validates action cue alignment automatically
- **Formula verification:** Scoring logic is pre-validated against C-BEN framework
- **Focus areas:** UX flow and gameplay experience

### 📤 Custom Upload Games
- **Critical manual checks required:**
  - Backend API integration working correctly
  - Data format matches expected schema
  - Custom scoring logic is sound
  - Event tracking captures all required metrics
- **Additional verification:** Check `custom_game_url` loads properly
- **Backend compliance:** Verify `backend_data_captured` structure

---

## Step-by-Step Testing Workflow

### Step 1: Start a Test
1. Find your validator in the dashboard
2. Click **"Start Test"** (or "Re-test" if previously tested)
3. Test wizard will guide you through each phase

### Step 2: Complete Each Phase
- Work through Phase 1 → Phase 2 → Phase 3 sequentially
- Add notes for each phase (issues found, observations)
- Mark each phase as **Passed**, **Failed**, or **Needs Review**

### Step 3: Review Results
- Overall status calculated from all three phases
- View detailed test history and notes
- Check `test_version` for tracking purposes

### Step 4: Approve for Publishing
- Only validators with **"Passed"** overall status can be approved
- Click **"Approve for Publish"** after successful testing
- Once approved, the validator becomes available in the marketplace

---

## Filtering & Organization

**Filter by Template Type:**
- `All Types` - Show everything
- `🤖 AI Generated` - Only AI-created validators
- `📤 Custom Upload` - Only uploaded games

**Filter by Test Status:**
- `Not Tested` - Never been tested
- `In Progress` - Testing started but not complete
- `Passed` - All phases successful
- `Failed` - One or more phases failed

---

## Best Practices

### Before Testing
- ✅ Ensure you understand the sub-competency being tested
- ✅ Review the action cue and expected behaviors
- ✅ Have multiple testers run through the validator
- ✅ Test on different devices and browsers

### During Testing
- ✅ Take detailed notes of any issues
- ✅ Record edge cases and unexpected behaviors
- ✅ Test boundary conditions (minimum/maximum inputs)
- ✅ Verify all backend data is captured correctly

### After Testing
- ✅ Document any fixes needed
- ✅ Re-test after making changes
- ✅ Get peer review before approving
- ✅ Keep test history for compliance tracking

---

## Troubleshooting Common Issues

### Game won't load (Phase 1 failure)
- Check console for JavaScript errors
- Verify `custom_game_url` is accessible (custom uploads)
- Test network connectivity
- Clear browser cache and retry

### Action cue misalignment (Phase 2 failure)
- Review sub-competency statement carefully
- Verify game mechanic matches intended skill
- Check if backend data captured is relevant
- Consider redesigning game mechanic

### Scoring inconsistencies (Phase 3 failure)
- Review scoring formula logic
- Test with extreme values (0%, 100%)
- Verify proficiency level thresholds
- Check database `scoring_metrics` for accuracy

---

## Publishing Requirements

**A validator can ONLY be published if:**
1. ✅ Overall status = **"Passed"**
2. ✅ All three phases = **"Passed"**
3. ✅ Approved for publish = **true**
4. ✅ No critical issues documented

**After approval:**
- Validator becomes visible in the marketplace
- Brands can customize and deploy it
- Test results remain in history for auditing

---

## Need Help?

- Check the test history to see previous attempts
- Review phase notes for specific failure reasons
- Re-run tests after making improvements
- Consult C-BEN framework documentation for competency alignment

---

## Quick Reference: Status Badges

| Badge | Meaning |
|-------|---------|
| 🔵 Not Tested | No test has been started yet |
| 🔵 In Progress | Testing started but incomplete |
| 🟢 Passed | All phases successful |
| 🔴 Failed | One or more phases failed |
| 🟡 Needs Review | Manual review required |

---

**Happy Testing! 🎮**

Remember: Quality validators = Better skills assessment = Stronger talent pipelines
