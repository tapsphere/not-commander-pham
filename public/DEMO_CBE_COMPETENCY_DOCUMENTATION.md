# Crisis Communication Demo - CBE Competency Documentation

## Overview
This demo showcases how interactive validator games align with **Competency-Based Education (CBE)** principles by measuring observable behaviors rather than theoretical knowledge. Each scene assesses a specific sub-competency through action-based evidence collection.

---

## Scene 1: Initiative - Task Sequencing Challenge

### Sub-Competency
**Proactive Planning & Prioritization**: Ability to identify and sequence critical pre-launch tasks that must be completed before project initiation.

### Action Cue (Observable Behavior)
"Select and sequence the 3 correct pre-day tasks within 90 seconds"

Players must:
- Analyze 6 scattered task cards
- Identify the 3 critical pre-day tasks
- Drag them into the "Complete Before Day 1" inbox

### Game Mechanic
**Checklist Challenge (Scenario-Based Simulation)**
- **Input**: 6 task cards presented on virtual desk
- **Action**: Drag-and-drop selection of correct tasks
- **Feedback**: Visual confirmation when tasks are placed
- **Submit**: Player submits their selection for validation

### Measurement & Scoring

#### What We Capture:
```javascript
{
  correctSelections: 3,  // Number of correct tasks selected
  incorrectSelections: 0, // Number of wrong tasks selected
  timeSpent: 45,         // Seconds taken
  completionStatus: true // All required tasks selected
}
```

#### Scoring Logic (from PlayOps Framework):
- **L1 (Needs Work - 100 XP)**: accuracy < 85% OR time > 90s
- **L2 (Proficient - 250 XP)**: accuracy ≥ 90% AND time ≤ 90s
- **L3 (Mastery - 500 XP)**: accuracy ≥ 95% AND time ≤ 75s AND consistent performance

### Core Principle
**Foundation First**: Successful projects require identifying and completing foundational tasks before execution begins. This measures the ability to distinguish critical path items from nice-to-haves.

### CBE Alignment
✅ **Clear Learning Outcome**: Can the learner identify critical pre-launch tasks?  
✅ **Observable Evidence**: Actual task selection behavior, not self-reported knowledge  
✅ **Mastery-Based**: Must demonstrate 100% accuracy on critical tasks  
✅ **Context-Applied**: Tasks presented in realistic PM scenario  

### Better Proof Than Traditional Assessment

| Traditional Method | This Validator |
|-------------------|----------------|
| "List 3 pre-day tasks" (text answer) | Shows actual prioritization behavior |
| Can memorize/guess correct answer | Must apply judgment under constraints |
| No time pressure measurement | Captures speed + accuracy (performance reality) |
| Subjective grading needed | Objective, automated validation |
| Can't verify application ability | Direct evidence of skill application |

**Proof Receipt Generated**: ✅ Validated action with timestamp, accuracy, and speed metrics

---

## Scene 2: Team Connection - Communication Channel Matching

### Sub-Competency
**Situational Communication Strategy**: Ability to select the appropriate communication channel based on urgency, complexity, and team dynamics.

### Action Cue (Observable Behavior)
"Match the correct communication channel to each scenario within 90 seconds"

Players must:
- Read 3 distinct team scenarios
- Analyze urgency, complexity, and relationship factors
- Drag the appropriate channel icon (Teams Call/Quick Chat/Email) onto each scenario card

### Game Mechanic
**Role-Based Scenario Matching (Case Analysis)**
- **Input**: 3 scenario cards with different contexts
- **Action**: Drag communication icons to match scenarios
- **Feedback**: Visual placement confirmation
- **Submit**: Validate all 3 matches

### Measurement & Scoring

#### What We Capture:
```javascript
{
  scenario1Match: "teams-call",    // Correct: teams-call
  scenario2Match: "quick-chat",    // Correct: quick-chat  
  scenario3Match: "email",         // Correct: email
  accuracy: 100,                   // % of correct matches
  timeSpent: 52,                   // Seconds taken
  matchingPattern: ["s1", "s2", "s3"] // Order of decisions
}
```

#### Scoring Logic:
- **L1 (Needs Work - 100 XP)**: < 67% accuracy (0-1 correct) OR time > 90s
- **L2 (Proficient - 250 XP)**: 100% accuracy (3/3 correct) AND time ≤ 90s
- **L3 (Mastery - 500 XP)**: 100% accuracy AND time ≤ 75s AND edge-case handling

### Core Principle
**Context-Aware Communication**: The channel matters as much as the message. Effective team leaders match communication mode to situation requirements.

### CBE Alignment
✅ **Clear Learning Outcome**: Can learner select appropriate channels for different contexts?  
✅ **Observable Evidence**: Actual matching decisions, not hypothetical responses  
✅ **Mastery-Based**: Requires 100% accuracy (all 3 scenarios correct)  
✅ **Context-Applied**: Real PM scenarios (urgency, complexity, sensitivity)  

### Better Proof Than Traditional Assessment

| Traditional Method | This Validator |
|-------------------|----------------|
| "When would you use email vs. call?" (essay) | Shows actual decision-making in context |
| Abstract knowledge test | Forces choice between competing options |
| No scenario complexity | Multiple variables to consider simultaneously |
| Can explain without doing | Must demonstrate selection ability |
| Rater bias in grading | Objective right/wrong validation |

**Proof Receipt Generated**: ✅ 3 context-specific decisions with rationale validation

---

## Scene 3: Coaching & Mentorship - Support Stack Builder

### Sub-Competency
**Resource Architecture Design**: Ability to construct a multi-layered support system by selecting and combining appropriate resources for team member development.

### Action Cue (Observable Behavior)
"Build the best support stack by selecting and layering 3 resources within 120 seconds"

Players must:
- Evaluate 6 available support resources
- Select the 3 most appropriate for Alex's situation
- Drag them into the support stack (order matters - foundation to top)

### Game Mechanic
**Decision-Tree Challenge (Performance Demonstration)**
- **Input**: 6 resource cards (Documentation, Mentor, Training, Peer Review, etc.)
- **Action**: Drag 3 resources to build layered stack
- **Feedback**: Stack builds visually as resources are added
- **Submit**: Validate final support architecture

### Measurement & Scoring

#### What We Capture:
```javascript
{
  selectedResources: ["documentation", "mentor", "training"],
  resourceOrder: [1, 2, 3],        // Sequence matters
  stackCompleteness: 3,             // All 3 layers filled
  timeSpent: 78,                    // Seconds taken
  architectureQuality: "optimal"    // Based on gold key
}
```

#### Scoring Logic:
- **L1 (Needs Work - 100 XP)**: < 67% correct resources OR wrong order
- **L2 (Proficient - 250 XP)**: All 3 correct resources in reasonable order AND time ≤ 120s
- **L3 (Mastery - 500 XP)**: Optimal stack + optimal order AND time ≤ 100s

### Core Principle
**Layered Support Systems**: Effective coaching requires architecting multiple support types in the right sequence. Foundation resources enable higher-level growth.

### CBE Alignment
✅ **Clear Learning Outcome**: Can learner design a multi-layered support system?  
✅ **Observable Evidence**: Actual resource selection + sequencing behavior  
✅ **Mastery-Based**: Must select correct resources AND order them properly  
✅ **Context-Applied**: Realistic mentorship scenario with constraints  

### Better Proof Than Traditional Assessment

| Traditional Method | This Validator |
|-------------------|----------------|
| "What resources would you provide?" (list) | Shows resource prioritization + sequencing |
| No architecture consideration | Requires understanding of layered support |
| Order doesn't matter | Order is critical (foundation first) |
| Can list everything | Forces trade-off decisions (only 3 allowed) |
| No evidence of judgment | Direct evidence of architectural thinking |

**Proof Receipt Generated**: ✅ Support architecture design with resource selection + sequencing proof

---

## Scene 4: Feedback & Reflection - Priority Timeline

### Sub-Competency
**Sequential Response Planning**: Ability to sequence feedback actions in priority order based on urgency, impact, and dependencies.

### Action Cue (Observable Behavior)
"Sequence the 3 feedback actions in priority order (1st, 2nd, 3rd) within 90 seconds"

Players must:
- Evaluate 3 feedback action cards
- Determine optimal execution sequence
- Drag actions into timeline slots (1st → 2nd → 3rd)

### Game Mechanic
**Scenario Response Sequencing (Case Analysis)**
- **Input**: 3 action cards needing prioritization
- **Action**: Drag actions into 1st/2nd/3rd priority slots
- **Feedback**: Timeline fills as actions are placed
- **Submit**: Validate priority sequence

### Measurement & Scoring

#### What We Capture:
```javascript
{
  priorityOrder: ["action1", "action3", "action2"], // Player's sequence
  correctSequence: ["action1", "action3", "action2"], // Gold key
  sequenceAccuracy: 100,                             // % correct
  timeSpent: 58,                                     // Seconds taken
  prioritizationLogic: "dependencies-first"          // Pattern analysis
}
```

#### Scoring Logic:
- **L1 (Needs Work - 100 XP)**: Wrong sequence OR time > 90s
- **L2 (Proficient - 250 XP)**: Correct sequence AND time ≤ 90s
- **L3 (Mastery - 500 XP)**: Correct sequence AND time ≤ 75s AND edge-case scenarios

### Core Principle
**Dependencies Drive Sequence**: Effective feedback requires understanding what must happen first to enable subsequent actions. Order matters for impact.

### CBE Alignment
✅ **Clear Learning Outcome**: Can learner prioritize actions based on dependencies?  
✅ **Observable Evidence**: Actual sequencing decisions, not theoretical understanding  
✅ **Mastery-Based**: Must demonstrate correct prioritization logic  
✅ **Context-Applied**: Real feedback scenario with competing priorities  

### Better Proof Than Traditional Assessment

| Traditional Method | This Validator |
|-------------------|----------------|
| "How would you prioritize feedback?" (essay) | Shows actual prioritization behavior |
| Can discuss theory without practice | Must make concrete sequencing decisions |
| No time constraint | Captures decision-making under pressure |
| Order may be implied, not explicit | Order is the primary assessment metric |
| Can hedge with "it depends" | Forces definitive priority choices |

**Proof Receipt Generated**: ✅ Priority sequence with dependency validation proof

---

## Cross-Scene CBE Principles

### 1. Observable Actions Over Stated Knowledge
Every scene requires **doing**, not **explaining**. Players demonstrate competency through action.

### 2. Context-Embedded Assessment
No abstract questions. Every validator presents realistic PM scenarios requiring applied judgment.

### 3. Performance Under Constraints
Time limits and choice restrictions mirror real work conditions. Mastery includes efficiency.

### 4. Objective, Automated Evidence
All proof is captured automatically via telemetry. No subjective grading or self-reporting.

### 5. Mastery-Based Progression
Clear L1/L2/L3 thresholds. Learners know exactly what "mastery" requires (not just "passing").

---

## Why This Is Better Proof Than Traditional Assessments

### Traditional Assessment Problems

❌ **Knowledge ≠ Application**  
Students can explain concepts but fail to apply them under realistic conditions.

❌ **Self-Reporting Bias**  
Surveys and reflections are subjective and can be gamed.

❌ **No Performance Context**  
Tests don't measure speed, decision quality under pressure, or trade-off judgment.

❌ **Rater Subjectivity**  
Essay grading varies by instructor. Rubrics help but don't eliminate bias.

❌ **No Behavioral Evidence**  
Can't verify if someone can actually DO the thing they describe.

### This Validator Approach

✅ **Behavioral Evidence**  
Every action is captured. We see WHAT they did, HOW FAST, and in WHAT ORDER.

✅ **Objective Validation**  
Right/wrong is determined by gold keys, not human judgment.

✅ **Performance Metrics**  
Speed + accuracy capture real competency. Mastery requires both.

✅ **Context Realism**  
Scenarios mirror actual PM challenges. Proof transfers to real work.

✅ **Automated Proof Receipts**  
`window.__RESULT__` and `window.__PROOF__` objects generate tamper-proof evidence:

```javascript
{
  competency: "Team Connection",
  level: "Mastery",
  xp: 500,
  evidence: {
    accuracy: 100,
    timeSpent: 52,
    decisions: ["teams-call", "quick-chat", "email"],
    timestamp: "2025-01-15T10:23:45Z"
  },
  proofHash: "sha256:a3d9e8f..."
}
```

---

## PlayOps Framework Alignment

All scenes follow the **PlayOps Framework** (Tab 3 & Tab 4):

| Element | Framework Source |
|---------|-----------------|
| **Action Cues** | Tab 3: Observable behaviors with time limits |
| **Game Mechanics** | Tab 3: Scenario-based simulations, case analysis |
| **Scoring Logic** | Tab 4: L1 (100 XP) / L2 (250 XP) / L3 (500 XP) |
| **Validator Types** | Tab 3: Scenario-Based, Case Analysis, Performance Demo |
| **Game Loop** | Tab 3: Input → Action → Feedback → Submit |
| **Proof Receipts** | Tab 4: Failed Record / Validated Action / Mastery Verified |

---

## Summary: CBE + Better Proof

This demo proves that **competency-based assessment** can be:
1. **Objective** - No rater bias, automated validation
2. **Observable** - Direct behavioral evidence, not self-reporting
3. **Applied** - Context-embedded scenarios, not abstract tests
4. **Efficient** - Instant scoring, immediate feedback
5. **Verifiable** - Cryptographic proof receipts for credentials

**The future of workforce assessment is not asking people what they know—it's observing what they DO.**

---

## Presentation Talking Points

### For CBE Advocates:
"Traditional assessments measure knowledge. We measure **demonstrated competency** through observable actions in realistic scenarios."

### For Employers:
"Don't trust résumés. Trust **proof receipts** that show exactly what skills someone has demonstrated under realistic conditions."

### For Learners:
"Your XP isn't just a score—it's **verifiable evidence** of skills you can actually apply in the workplace."

### For Educators:
"Stop grading essays about prioritization. Start **observing prioritization behavior** and capturing it as evidence."

---

**This is the future of competency-based education: action-driven, evidence-verified, employer-trusted.**
