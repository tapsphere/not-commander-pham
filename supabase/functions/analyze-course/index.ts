import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const buildSystemPrompt = (subCompetencies: any[]) => {
  const competencyList = subCompetencies.map(sub => {
    const comp = Array.isArray(sub.master_competencies) ? sub.master_competencies[0] : sub.master_competencies;
    return `
=== ${comp?.name?.toUpperCase() || 'COMPETENCY'} ===
Domain: ${comp?.cbe_category || 'Unknown'}

Sub-Competency: ${sub.statement}
- Action Cue: ${sub.action_cue || 'N/A'}
- Game Mechanic: ${sub.game_mechanic || 'N/A'}
- Game Loop: ${sub.game_loop || 'N/A'}
- Validator Type: ${sub.validator_type || 'N/A'}
- Scoring: ${sub.scoring_formula_level_1 || 'N/A'}`;
  }).join('\n\n');

  return `You are a PlayOps Validator Architect trained on the C-BEN Competency Framework.

Your task is to analyze course/training content and map it to the available sub-competencies from our database.

AVAILABLE SUB-COMPETENCIES:
${competencyList}

=== YOUR TASK ===

Analyze the provided course content and:
1. Identify ALL relevant sub-competencies from the list above that match the course
2. Map course outcomes to the appropriate sub-competencies
3. Use the EXACT sub_competency statement, action_cue, game_mechanic, and validator_type from the list
4. Return structured JSON only

OUTPUT FORMAT (JSON only, no markdown):
{
  "course_analysis": {
    "summary": "Brief summary of course focus",
    "key_outcomes": ["outcome 1", "outcome 2", ...]
  },
  "competency_mappings": [
    {
      "domain": "Domain from list above",
      "competency": "Competency name from list above",
      "sub_competency": "EXACT sub_competency statement from list above",
      "alignment_summary": "How course aligns with this",
      "validator_type": "Type from list above",
      "action_cue": "Action cue from list above",
      "game_mechanic": "Game mechanic from list above",
      "evidence_metric": "metric description",
      "scoring_formula": "formula from list above"
    }
  ],
  "recommended_validators": [
    {
      "validator_name": "Game Mechanic Name from list above",
      "competencies_tested": ["sub-competency 1", "sub-competency 2"],
      "priority": "high|medium|low",
      "reason": "Why this validator is recommended"
    }
  ],
  "summary": {
    "total_competencies": 0,
    "domains_covered": ["list of domains"],
    "implementation_note": "Brief note on implementing these validators"
  }
}`;
}

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

    if (!subCompetencies || subCompetencies.length === 0) {
      console.error('No sub-competencies found in database');
      return new Response(
        JSON.stringify({ error: 'No competency data available' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build system prompt with actual database sub-competencies
    const systemPrompt = buildSystemPrompt(subCompetencies);

    const userPrompt = `Analyze this course and map it to the most relevant sub-competencies from the C-BEN Framework.

COURSE NAME: ${courseName || 'Untitled Course'}
COURSE DESCRIPTION: ${courseDescription || 'N/A'}

COURSE CONTENT:
${courseText}

Your task:
1. Identify the TOP 4 MOST RELEVANT sub-competencies that best match this course content
2. For each match, use the EXACT sub_competency statement, action_cue, game_mechanic, and validator_type from the list
3. Focus on quality over quantity - select only the strongest alignments
4. Return the exact JSON format specified

CRITICAL CONSTRAINTS: 
- Use ONLY sub-competencies from the C-BEN Framework list provided in the system prompt
- Maximum 4 sub-competency mappings - no more, no less
- Each mapping must have strong alignment with the course content
- If fewer than 4 strong matches exist, still provide exactly 4 with lower priority ones`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
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

    // CRITICAL: Validate and correct AI response against actual database values
    // The AI sometimes makes up values instead of using exact ones from the database
    if (analysisResult.competency_mappings && analysisResult.competency_mappings.length > 0) {
      // First, deduplicate by master competency - keep only first match per competency
      const seenCompetencies = new Set<string>();
      const deduplicatedMappings = analysisResult.competency_mappings.filter((mapping: any) => {
        if (seenCompetencies.has(mapping.competency)) {
          return false; // Skip duplicate competency
        }
        seenCompetencies.add(mapping.competency);
        return true;
      });

      // Limit to exactly 4 mappings
      const limitedMappings = deduplicatedMappings.slice(0, 4);

      // Then validate and correct against database
      analysisResult.competency_mappings = limitedMappings.map((mapping: any) => {
        // Find the matching sub-competency in the database by EXACT statement match only
        // This prevents fuzzy matching from selecting wrong sub-competencies with similar names
        const matchingSubComp = subCompetencies?.find(
          sc => sc.statement.toLowerCase().trim() === mapping.sub_competency.toLowerCase().trim()
        );

        if (matchingSubComp) {
          const comp = Array.isArray(matchingSubComp.master_competencies) 
            ? matchingSubComp.master_competencies[0] 
            : matchingSubComp.master_competencies;

          // Replace ALL game design fields with exact database values
          return {
            ...mapping,
            domain: comp?.cbe_category || mapping.domain,
            competency: comp?.name || mapping.competency,
            sub_competency: matchingSubComp.statement, // Use exact statement
            action_cue: matchingSubComp.action_cue || mapping.action_cue,
            game_mechanic: matchingSubComp.game_mechanic || mapping.game_mechanic,
            validator_type: matchingSubComp.validator_type || mapping.validator_type,
            game_loop: matchingSubComp.game_loop || mapping.game_loop,
            scoring_formula: matchingSubComp.scoring_formula_level_1 || mapping.scoring_formula,
          };
        }

        // If no match found, keep AI's values (shouldn't happen with good prompting)
        console.warn('No database match found for sub-competency:', mapping.sub_competency);
        return mapping;
      });
    }

    // Fetch actual game templates with their sub-competencies
    const { data: templates, error: templatesError } = await supabaseClient
      .from('game_templates')
      .select('name, description, preview_image, selected_sub_competencies, template_type')
      .eq('is_published', true);

    if (!templatesError && templates && templates.length > 0) {
      // Build a map of sub-competency IDs to templates
      const subCompToTemplates = new Map<string, any[]>();
      
      templates.forEach(template => {
        if (template.selected_sub_competencies && template.selected_sub_competencies.length > 0) {
          template.selected_sub_competencies.forEach((subCompId: string) => {
            if (!subCompToTemplates.has(subCompId)) {
              subCompToTemplates.set(subCompId, []);
            }
            subCompToTemplates.get(subCompId)!.push(template);
          });
        }
      });

      // Match templates to analyzed competencies
      const enhancedValidators: any[] = [];
      const addedTemplates = new Set<string>(); // Avoid duplicates

      for (const mapping of analysisResult.competency_mappings || []) {
        // Find the sub-competency ID from the statement
        const matchingSubComp = subCompetencies?.find(
          sc => sc.statement === mapping.sub_competency
        );

        if (matchingSubComp) {
          const matchingTemplates = subCompToTemplates.get(matchingSubComp.id) || [];
          
          matchingTemplates.forEach(template => {
            if (!addedTemplates.has(template.name)) {
              enhancedValidators.push({
                validator_name: template.name,
                competencies_tested: [mapping.sub_competency],
                priority: 'high',
                reason: `This validator assesses ${mapping.sub_competency}, which is a key component of the course.`,
                template_description: template.description,
                template_preview: template.preview_image,
                template_type: template.template_type
              });
              addedTemplates.add(template.name);
            }
          });
        }
      }
      
      // If we found matching templates, use them; otherwise keep AI recommendations
      if (enhancedValidators.length > 0) {
        analysisResult.recommended_validators = enhancedValidators;
      }
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
