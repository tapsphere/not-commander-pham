import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const SYSTEM_PROMPT = `You are a PlayOps Validator Architect trained on the C-BEN Competency Framework.

Your task is to analyze course/training content and map it to the following 4 COMPETENCIES ONLY (each with 1 sub-competency for testing):

=== COMPETENCY 1: EMOTIONAL INTELLIGENCE & SELF-MANAGEMENT ===
Domain: Professionalism / Self-Development

Sub-Competency: Emotional Regulation
- Action Cue: Choose calm response under timer pressure
- Game Mechanic: RESPOND Loop (Simulation Validator)
- Game Loop: Stimulus → Timer → Choose → Feedback → Retry
- Scoring: Accuracy ≥85%, Time ≤5s, Edge=Stress Cue Ignored=1; Levels <80 / 80-94 / ≥95+Edge
- Validator Type: Scenario-Based Simulation

=== COMPETENCY 2: COMMUNICATION & INTERPERSONAL FLUENCY ===
Domain: Communication & Collaboration

Sub-Competency: Empathy & Compassion
- Action Cue: Identify message tone → choose correct empathetic response from three labeled options (Supportive / Neutral / Dismissive)
- Game Mechanic: Tone Match Dialogue (Simulation Validator)
- Game Loop: Input → Select Tone → Choose Reply → Feedback
- Scoring: Accuracy ≥90%, Time ≤6s per item, Edge=Tone Flip ≤8s recovery; Levels <80 / 80-94 / ≥95+Edge
- Validator Type: Communication Product

=== COMPETENCY 3: ADAPTIVE MINDSET & RESILIENCE ===
Domain: Adaptability & Well-Being

Sub-Competency: Resilience & Optimism
- Action Cue: Recover from unexpected setback and complete task
- Game Mechanic: Resilience Path Challenge (Simulation Validator)
- Game Loop: Start → Obstacle → Adjust → Submit → Feedback
- Scoring: Accuracy ≥85%, Time ≤120s, Edge=Recovery ≤10s; Levels <80 / 80-94 / ≥95+Edge
- Validator Type: Scenario-Based Simulation

=== COMPETENCY 4: ETHICAL & PURPOSE-DRIVEN LEADERSHIP ===
Domain: Ethics & Leadership

Sub-Competency: Ethical Communication & Courage
- Action Cue: Select truthful and respectful response in conflict scenario
- Game Mechanic: Speak-Out Decision Tree (Case Validator)
- Game Loop: Dilemma → Choose → Review → Feedback
- Scoring: Accuracy ≥90%, Time ≤90s, Edge=No Escalation=1; Levels <80 / 80-94 / ≥95+Edge
- Validator Type: Case Analysis

=== YOUR TASK ===

Analyze the provided course content (especially "power words" lessons) and:
1. Identify which of these 4 sub-competencies are most relevant
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
      "domain": "Domain from database",
      "competency": "Competency name from database",
      "sub_competency": "EXACT sub_competency statement from database",
      "alignment_summary": "How course aligns with this",
      "validator_type": "Type from database",
      "action_cue": "Action cue from database",
      "game_mechanic": "Game mechanic from database",
      "evidence_metric": "metric description",
      "scoring_formula": "formula from database"
    }
  ],
  "recommended_validators": [
    {
      "validator_name": "Game Mechanic Name from database",
      "competencies_tested": ["sub-competency 1", "sub-competency 2"],
      "priority": "high|medium|low",
      "reason": "Why this validator is recommended"
    }
  ],
  "summary": {
    "total_competencies": 10,
    "domains_covered": ["list of domains"],
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
  "prerequisites": "What learners need before taking this",
  "industry": "The industry or business context this course applies to (e.g., Healthcare, Technology, Finance, Education, etc.)"
}

IMPORTANT FOR INDUSTRY:
- First check if this is educational/training content itself - if so, use "education"
- Otherwise look for the TARGET INDUSTRY where this training will be applied
- Common industries: healthcare, technology, finance, education, manufacturing, retail, hospitality, government, nonprofit, etc.
- Look for explicit mentions of sectors, organizations, or workplace contexts
- If the course is about general professional skills without specific industry context, use "education"
- Return lowercase values that match the dropdown options (e.g., "education", "healthcare", "tech", "marketing")
- ALWAYS provide an industry - make your best inference

IMPORTANT FOR ASSESSMENT METHODS:
Map any assessment, evaluation, or testing methods to these 4 PlayOps validators ONLY:

1. "RESPOND Loop" - for emotional regulation, managing stress, choosing calm responses
2. "Tone Match Dialogue" - for empathy, compassion, identifying tone, empathetic responses
3. "Resilience Path Challenge" - for resilience, optimism, recovering from setbacks
4. "Speak-Out Decision Tree" - for ethical communication, courage, conflict scenarios

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
      
      console.log('Extracted text from AI:', extractedText);
      
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
          prerequisites: "",
          industry: ""
        };
      }

      console.log('Final extractedInfo:', JSON.stringify(extractedInfo, null, 2));

      return new Response(
        JSON.stringify({ success: true, extractedInfo }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Regular analysis mode - fetch available sub-competencies from database
    console.log('Analyzing course:', courseName);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Fetch all available sub-competencies with their game design data
    const { data: subCompetencies, error: subCompError } = await supabaseClient
      .from('sub_competencies')
      .select(`
        id,
        statement,
        action_cue,
        game_mechanic,
        game_loop,
        validator_type,
        scoring_formula_level_1,
        scoring_formula_level_2,
        scoring_formula_level_3,
        master_competencies!inner(
          name,
          cbe_category,
          departments
        )
      `);

    if (subCompError) {
      console.error('Failed to fetch sub-competencies:', subCompError);
      return new Response(
        JSON.stringify({ error: 'Failed to load competency framework data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build enhanced prompt with actual database sub-competencies
    const competencyList = subCompetencies?.map(sub => {
      const comp = Array.isArray(sub.master_competencies) ? sub.master_competencies[0] : sub.master_competencies;
      return `
Sub-Competency: ${sub.statement}
Competency: ${comp?.name || 'Unknown'}
Domain: ${comp?.cbe_category || 'Unknown'}
Action Cue: ${sub.action_cue || 'N/A'}
Game Mechanic: ${sub.game_mechanic || 'N/A'}
Validator Type: ${sub.validator_type || 'N/A'}
Scoring: ${sub.scoring_formula_level_1 || 'N/A'}`;
    }).join('\n\n') || 'No competencies available';

    const userPrompt = `Analyze this course and map it to the available PlayOps sub-competencies from our database.

AVAILABLE SUB-COMPETENCIES:
${competencyList}

COURSE NAME: ${courseName || 'Untitled Course'}
COURSE DESCRIPTION: ${courseDescription || 'N/A'}

COURSE CONTENT:
${courseText}

Your task:
1. Identify which sub-competencies from the list above best match this course content
2. For each match, use the EXACT sub_competency statement from the list
3. Include the corresponding action_cue, game_mechanic, validator_type, and scoring
4. Provide a comprehensive mapping in the exact JSON format specified

CRITICAL: Only use sub-competencies that exist in the AVAILABLE SUB-COMPETENCIES list above.`;

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

    // Fetch actual game templates and replace validator type names with template names
    const validatorTypes = analysisResult.recommended_validators?.map((v: any) => v.validator_name) || [];
    const { data: templates, error: templatesError } = await supabaseClient
      .from('game_templates')
      .select('name, description, preview_image, selected_sub_competencies')
      .eq('is_published', true);

    if (!templatesError && templates && templates.length > 0) {
      // Create a mapping from validator types to actual templates
      const validatorToTemplates: Record<string, typeof templates> = {};
      
      templates.forEach(template => {
        // Match templates to competencies from the analysis
        const matchingCompetencies = analysisResult.competency_mappings?.filter(
          (mapping: any) => {
            // Check if template's sub_competencies match any of the mapped competencies
            const mappingSubCompIds = subCompetencies?.filter(
              sc => sc.statement === mapping.sub_competency
            ).map(sc => sc.id) || [];
            
            return template.selected_sub_competencies?.some(
              (id: string) => mappingSubCompIds.includes(id)
            );
          }
        ) || [];

        if (matchingCompetencies.length > 0) {
          const validatorType = matchingCompetencies[0].validator_type;
          if (!validatorToTemplates[validatorType]) {
            validatorToTemplates[validatorType] = [];
          }
          validatorToTemplates[validatorType].push(template);
        }
      });

      // Replace recommended validators with actual template data
      const enhancedValidators = [];
      for (const validator of analysisResult.recommended_validators || []) {
        const matchingTemplates = validatorToTemplates[validator.validator_name] || [];
        
        if (matchingTemplates.length > 0) {
          // Add each matching template as a separate recommendation
          matchingTemplates.forEach(template => {
            enhancedValidators.push({
              ...validator,
              validator_name: template.name, // Use actual template name
              template_description: template.description,
              template_preview: template.preview_image
            });
          });
        } else {
          // Keep original if no template match found
          enhancedValidators.push(validator);
        }
      }
      
      analysisResult.recommended_validators = enhancedValidators;
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
