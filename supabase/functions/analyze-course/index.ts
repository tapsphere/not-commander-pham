import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const SYSTEM_PROMPT = `You are a PlayOps Validator Architect trained on the C-BEN Competency Framework.

Your task is to analyze course/training content and map it to the following 4 COMPETENCIES ONLY from the "Cognitive & Analytical" domain:

=== COMPETENCY 1: ANALYTICAL THINKING ===

Sub-Competency 1.1: Apply logical reasoning to multi-constraint business problems
- Action Cue: Allocate resources within time and budget limits to reach optimal outcome
- Game Mechanic: Resource Allocation Puzzle (performance task)
- Game Loop: Input → Allocate resources → Rule Flip (edge case) → Adjust → Submit → Feedback
- Scoring: Accuracy ≥90%, Time ≤90s, Edge=Rule Flip Recovered ≤10s; Levels <80 / 80-94 / ≥95+Edge
- Validator Type: Scenario-Based Simulation

Sub-Competency 1.2: Identify and evaluate trade-offs in operational scenarios
- Action Cue: Choose between multiple conflicting options under pressure
- Game Mechanic: Ranking / Prioritization Game (analytical reasoning)
- Game Loop: Read scenario → Rank KPIs → Constraint Change → Re-rank → Submit → Feedback
- Scoring: Accuracy ≥90%, Time ≤5s to adjust, Edge=Re-rank after change ≤5s; Levels <80 / 80-94 / ≥95+Edge
- Validator Type: Case Analysis

Sub-Competency 1.3: Distinguish valid solutions under incomplete or contradictory inputs
- Action Cue: Infer best solution when key data is missing or conflicting
- Game Mechanic: Error-Detection / Diagnosis Task (diagnostic assessment)
- Game Loop: Scan data → Flag issues → Select solution → Confirm → Feedback
- Scoring: Accuracy ≥85% AND solution_valid=1, Time ≤90s, Edge=Conflict Resolved ≤8s; Levels <80 / 80-94 / ≥95+Edge
- Validator Type: Data Analysis

Sub-Competency 1.4: Adapt reasoning under time pressure and stakeholder conflicts
- Action Cue: Complete task while variables (rules) shift mid-round
- Game Mechanic: Timed Decision-Tree Simulation (scenario simulation)
- Game Loop: Scenario intro → Select decision → Rule Flip mid-timer → Adjust → Submit → Feedback
- Scoring: Accuracy ≥85%, Time ≤10s recovery, Edge=Stakeholder Shift Handled ≤10s; Levels <80 / 80-94 / ≥95+Edge
- Validator Type: Scenario-Based Simulation

Sub-Competency 1.5: Interpret data patterns to support decision-making
- Action Cue: Identify and label trends from data visualization
- Game Mechanic: Pattern Recognition / Data Analysis Challenge (applied analysis)
- Game Loop: View chart → Highlight pattern → Select insight → Submit → Feedback
- Scoring: Accuracy ≥90%, Time ≤60s, Edge=Hidden Data Found=1; Levels <80 / 80-94 / ≥95+Edge
- Validator Type: Data Analysis

Sub-Competency 1.6: Communicate conclusions aligned with defined KPIs
- Action Cue: Write or select the summary that best aligns results to KPIs
- Game Mechanic: Report-Builder / KPI Matching Mini-Game (reflective response)
- Game Loop: Read prompt → Select KPI → Compose summary → Submit → Feedback
- Scoring: Accuracy ≥85%, Time ≤45s, Edge=Summary ≤50 words; Levels <80 / 80-94 / ≥95+Edge
- Validator Type: Communication Product

=== COMPETENCY 2: CREATIVE THINKING ===

Sub-Competency 2.1: Generate multiple innovative ideas under defined constraints
- Action Cue: Produce three or more novel solutions within stated limits
- Game Mechanic: Divergent Idea Builder (brainstorm simulation)
- Game Loop: Prompt → Ideate 3+ solutions → Time limit → Select best → Feedback
- Scoring: # viable ideas ≥3, Time ≤180s, Edge=Constraint Flip Handled=1; Levels <80 / 80-94 / ≥95+Edge
- Validator Type: Scenario-Based Simulation

Sub-Competency 2.2: Reframe problems from new perspectives
- Action Cue: Redefine the given challenge using "how-might-we" phrasing
- Game Mechanic: Concept Remix Puzzle (association task)
- Game Loop: Input → Drag/Match elements → Preview → Confirm → Feedback
- Scoring: % valid combinations ≥85, Time ≤120s, Edge=New element added ≤10s; Levels <80 / 80-94 / ≥95+Edge
- Validator Type: Case Analysis

Sub-Competency 2.3: Combine unrelated concepts to form new solutions
- Action Cue: Link two unrelated inputs to create a workable concept
- Game Mechanic: Prototype Refinement Loop (iterative design task)
- Game Loop: Draft → Receive auto-feedback → Revise → Resubmit → Feedback
- Scoring: revision_score ≥90, Time ≤150s, Edge=Auto-feedback applied ≤1 round; Levels <80 / 80-94 / ≥95+Edge
- Validator Type: Project / Product Artifact

Sub-Competency 2.4: Evaluate creative options against feasibility and impact
- Action Cue: Rank generated ideas by practicality and potential outcome
- Game Mechanic: Constraint Challenge Game (convergent thinking)
- Game Loop: Review brief → Adjust idea to fit budget/time → Submit → Feedback
- Scoring: idea_meets_constraints ≥90%, Time ≤120s, Edge=Budget/Time change adjusted ≤8s; Levels <80 / 80-94 / ≥95+Edge
- Validator Type: Case Analysis

Sub-Competency 2.5: Iterate and improve upon initial prototypes
- Action Cue: Adjust design after simulated feedback rounds
- Game Mechanic: Pattern Transfer Exercise (application scenario)
- Game Loop: Study example → Apply method to new context → Submit → Feedback
- Scoring: transfer_success ≥85%, Time ≤90s, Edge=Cross-context applied first try=1; Levels <80 / 80-94 / ≥95+Edge
- Validator Type: Project / Product Artifact

Sub-Competency 2.6: Communicate creative rationale and process clearly
- Action Cue: Explain the reasoning behind a chosen creative path
- Game Mechanic: Storyboard / Pitch Builder (reflective presentation)
- Game Loop: Outline → Arrange slides / frames → Submit → Feedback
- Scoring: storyboard_clarity ≥90, Time ≤180s, Edge=Missing slide recovered ≤10s; Levels <80 / 80-94 / ≥95+Edge
- Validator Type: Communication Product

=== COMPETENCY 3: CRITICAL REASONING ===

Sub-Competency 3.1: Identify assumptions underlying an argument
- Action Cue: Highlight hidden assumptions in argument text
- Game Mechanic: Logic Scenario Simulator (argument evaluation)
- Game Loop: Read claim → Identify fallacy / support → Select valid response → Feedback
- Scoring: valid_argument ≥90%, Time ≤90s, Edge=Contradictory evidence resolved ≤10s; Levels <80 / 80-94 / ≥95+Edge
- Validator Type: Case Analysis

Sub-Competency 3.2: Distinguish fact, inference, and opinion
- Action Cue: Sort statements into categories under timer
- Game Mechanic: Bias Detector Game (diagnostic analysis)
- Game Loop: Review text → Flag bias → Confirm reason → Submit → Feedback
- Scoring: bias_flags correct ≥85%, Time ≤60s, Edge=Hidden bias found ≤8s; Levels <80 / 80-94 / ≥95+Edge
- Validator Type: Scenario-Based Simulation

Sub-Competency 3.3: Evaluate evidence quality and relevance
- Action Cue: Rank sources and justify ranking choices
- Game Mechanic: Evidence Weighing Mini-Case (performance task)
- Game Loop: Gather evidence → Rank credibility → Choose conclusion → Feedback
- Scoring: evidence_weighting ≥90%, Time ≤90s, Edge=New evidence adjust ≤10s; Levels <80 / 80-94 / ≥95+Edge
- Validator Type: Case Analysis

Sub-Competency 3.4: Detect logical fallacies in reasoning
- Action Cue: Identify flawed logic within multi-step argument
- Game Mechanic: Causal Mapping Puzzle (concept mapping)
- Game Loop: Connect nodes → Validate logic path → Submit → Feedback
- Scoring: logic_path valid ≥90%, Time ≤120s, Edge=Extra node added ≤8s; Levels <80 / 80-94 / ≥95+Edge
- Validator Type: Scenario-Based Simulation

Sub-Competency 3.5: Draw valid conclusions from incomplete data
- Action Cue: Select best conclusion when data is missing
- Game Mechanic: Adaptive Logic Loop (rule-flip scenario)
- Game Loop: Initial decision → New data appears → Revise → Resubmit → Feedback
- Scoring: revised_decision ≥85%, Time ≤10s after new data, Edge=Re-evaluation ≤1 try; Levels <80 / 80-94 / ≥95+Edge
- Validator Type: Data Analysis

Sub-Competency 3.6: Communicate logical reasoning clearly and persuasively
- Action Cue: Craft concise summary aligning facts to argument
- Game Mechanic: Debate Response Builder (communication assessment)
- Game Loop: Read prompt → Select stance → Write / record summary → Feedback
- Scoring: judgment_clarity ≥90%, Time ≤90s, Edge=Cross-question response ≤5s; Levels <80 / 80-94 / ≥95+Edge
- Validator Type: Communication Product

=== COMPETENCY 4: PROBLEM SOLVING ===

Sub-Competency 4.1: Define problems clearly and identify root causes
- Action Cue: Map inputs to root causes using limited clues
- Game Mechanic: Systems Mapping Puzzle (root-cause analysis)
- Game Loop: View system map → Select key node → Submit → Feedback
- Scoring: root_cause_identified=1, Time ≤90s, Edge=Hidden factor found ≤10s; Levels <80 / 80-94 / ≥95+Edge
- Validator Type: Case Analysis

Sub-Competency 4.2: Generate and compare alternative solutions
- Action Cue: Produce 3 possible solutions and select best fit
- Game Mechanic: Solution Generator (simulation task)
- Game Loop: Problem brief → List 3+ solutions → Select best fit → Feedback
- Scoring: # solutions ≥3 AND best_fit=1, Time ≤180s, Edge=Constraint change adapted ≤8s; Levels <80 / 80-94 / ≥95+Edge
- Validator Type: Scenario-Based Simulation

Sub-Competency 4.3: Apply appropriate methods to reach a solution
- Action Cue: Choose and apply correct tool for problem type
- Game Mechanic: Criteria Scoring Mini-Game (performance rating)
- Game Loop: Review options → Score vs criteria → Submit → Feedback
- Scoring: criteria_match ≥90%, Time ≤90s, Edge=Weight re-adjust ≤5s; Levels <80 / 80-94 / ≥95+Edge
- Validator Type: Performance Demonstration

Sub-Competency 4.4: Implement solutions effectively
- Action Cue: Execute solution sequence under time pressure
- Game Mechanic: Execution Simulation (task management game)
- Game Loop: Plan → Execute → Track KPIs → Adjust → Feedback
- Scoring: execution_success ≥85%, Time ≤120s, Edge=Realtime adjust ≤10s; Levels <80 / 80-94 / ≥95+Edge
- Validator Type: Project / Artifact

Sub-Competency 4.5: Monitor and evaluate outcomes
- Action Cue: Track results and adjust plan in real time
- Game Mechanic: Adaptive Fix-Flow Simulation (rule-flip task)
- Game Loop: Apply solution → Unexpected failure → Adjust → Resubmit → Feedback
- Scoring: fix_applied ≥90%, Time ≤8s after failure, Edge=Second attempt success=1; Levels <80 / 80-94 / ≥95+Edge
- Validator Type: Portfolio / Reflection

Sub-Competency 4.6: Communicate solutions and results clearly
- Action Cue: Write or speak a 150-word summary matching metrics
- Game Mechanic: Retrospective Builder (reflective task)
- Game Loop: Review steps → Select lesson → Submit → Feedback
- Scoring: reflection_quality ≥85%, Time ≤90s, Edge=Lesson logged=1; Levels <80 / 80-94 / ≥95+Edge
- Validator Type: Communication Product

=== YOUR TASK ===

Analyze the provided course content and:
1. Identify which of these 24 sub-competencies are most relevant
2. Map course outcomes to the appropriate sub-competencies
3. Assign the matching validator types and game mechanics
4. Return structured JSON only

OUTPUT FORMAT (JSON only, no markdown):
{
  "course_analysis": {
    "summary": "Brief summary of course focus",
    "key_outcomes": ["outcome 1", "outcome 2", ...]
  },
  "competency_mappings": [
    {
      "domain": "Cognitive & Analytical",
      "competency": "Analytical Thinking|Creative Thinking|Critical Reasoning|Problem Solving",
      "sub_competency": "Full sub-competency statement from above",
      "alignment_summary": "How course aligns with this",
      "validator_type": "Type from above",
      "action_cue": "Action cue from above",
      "game_mechanic": "Game mechanic from above",
      "evidence_metric": "metric description",
      "scoring_formula": "formula from above"
    }
  ],
  "recommended_validators": [
    {
      "validator_name": "Game Mechanic Name from above",
      "competencies_tested": ["sub-competency 1", "sub-competency 2"],
      "priority": "high|medium|low",
      "reason": "Why this validator is recommended"
    }
  ],
  "summary": {
    "total_competencies": 10,
    "domains_covered": ["Cognitive & Analytical"],
    "implementation_note": "Brief note on implementing these validators"
  }
}`;

const EXTRACTION_PROMPT = `You are a course content extractor. Extract structured information from course materials.

Extract the following information and return ONLY JSON (no markdown):
{
  "courseName": "Full course name",
  "courseDescription": "2-3 sentence description",
  "learningObjectives": ["objective 1", "objective 2", "..."],
  "targetAudience": "Who this course is for",
  "keyTopics": ["topic 1", "topic 2", "..."],
  "assessmentMethods": ["validator 1", "validator 2"],
  "estimatedDuration": "3-6",
  "prerequisites": "What learners need before taking this"
}

IMPORTANT FOR ASSESSMENT METHODS:
Map any assessment, evaluation, or testing methods to these PlayOps validators based on the Cognitive & Analytical domain:

ANALYTICAL THINKING VALIDATORS:
- "Resource Allocation Puzzle" - for multi-constraint business problems
- "Ranking / Prioritization Game" - for trade-off evaluation
- "Error-Detection / Diagnosis Task" - for incomplete/contradictory data
- "Timed Decision-Tree Simulation" - for time pressure scenarios
- "Pattern Recognition / Data Analysis Challenge" - for data interpretation
- "Report-Builder / KPI Matching Mini-Game" - for communicating conclusions

CREATIVE THINKING VALIDATORS:
- "Divergent Idea Builder" - for generating innovative ideas
- "Concept Remix Puzzle" - for reframing problems
- "Prototype Refinement Loop" - for combining concepts
- "Constraint Challenge Game" - for evaluating creative options
- "Pattern Transfer Exercise" - for iterating prototypes
- "Storyboard / Pitch Builder" - for communicating creative process

CRITICAL REASONING VALIDATORS:
- "Logic Scenario Simulator" - for identifying assumptions
- "Bias Detector Game" - for distinguishing fact/inference/opinion
- "Evidence Weighing Mini-Case" - for evaluating evidence
- "Causal Mapping Puzzle" - for detecting logical fallacies
- "Adaptive Logic Loop" - for drawing conclusions from incomplete data
- "Debate Response Builder" - for communicating logical reasoning

PROBLEM SOLVING VALIDATORS:
- "Systems Mapping Puzzle" - for defining problems and root causes
- "Solution Generator" - for generating alternative solutions
- "Criteria Scoring Mini-Game" - for applying appropriate methods
- "Execution Simulation" - for implementing solutions
- "Adaptive Fix-Flow Simulation" - for monitoring and evaluating outcomes
- "Retrospective Builder" - for communicating solutions

DURATION CONSTRAINTS:
- Estimate 3-6 minutes based on content depth
- Return just the number (e.g., "4" for 4 minutes)
- Consider: 3 min = simple/introductory, 6 min = complex/comprehensive`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { courseText, courseName, courseDescription, extractMode } = await req.json();

    if (!courseText) {
      return new Response(
        JSON.stringify({ error: 'Course content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle extraction mode - just extract structured info, don't analyze
    if (extractMode) {
      console.log('Extracting course information...');
      
      const extractPrompt = `Extract structured information from this course content:

COURSE CONTENT:
${courseText}

Return ONLY the JSON structure as specified.`;

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: EXTRACTION_PROMPT },
            { role: 'user', content: extractPrompt }
          ],
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`Extraction failed: ${response.status}`);
      }

      const data = await response.json();
      const extractedText = data.choices[0].message.content;
      
      let extractedInfo;
      try {
        const jsonMatch = extractedText.match(/```json\n?([\s\S]*?)\n?```/) || 
                          extractedText.match(/```\n?([\s\S]*?)\n?```/);
        const jsonText = jsonMatch ? jsonMatch[1] : extractedText;
        extractedInfo = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        extractedInfo = {
          courseName: courseName || "Untitled Course",
          courseDescription: "",
          learningObjectives: [""],
          targetAudience: "",
          keyTopics: [""],
          assessmentMethods: ["Mood Mapper"],
          estimatedDuration: "4",
          prerequisites: ""
        };
      }

      return new Response(
        JSON.stringify({ success: true, extractedInfo }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Regular analysis mode
    console.log('Analyzing course:', courseName);

    const userPrompt = `Analyze this course and generate a PlayOps × C-BEN competency alignment.

COURSE NAME: ${courseName || 'Untitled Course'}
COURSE DESCRIPTION: ${courseDescription || 'N/A'}

COURSE CONTENT:
${courseText}

Provide a comprehensive mapping in the exact JSON format specified.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Credits exhausted. Please add funds to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI analysis failed: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    console.log('Raw AI response:', analysisText);

    // Parse JSON from response (handle markdown code blocks if present)
    let analysisResult;
    try {
      const jsonMatch = analysisText.match(/```json\n?([\s\S]*?)\n?```/) || 
                        analysisText.match(/```\n?([\s\S]*?)\n?```/);
      const jsonText = jsonMatch ? jsonMatch[1] : analysisText;
      analysisResult = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      analysisResult = {
        course_analysis: { summary: analysisText.substring(0, 500) },
        competency_mappings: [],
        recommended_validators: [],
        summary: { total_competencies: 0, domains_covered: [], implementation_note: 'Analysis incomplete' }
      };
    }

    return new Response(
      JSON.stringify({ success: true, analysis: analysisResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-course function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
