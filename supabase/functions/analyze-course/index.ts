import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const SYSTEM_PROMPT = `You are a PlayOps Validator Architect trained on the C-BEN Competency Framework.

Your task is to analyze course/training content and map it to C-BEN competencies and PlayOps validators.

C-BEN COMPETENCY DOMAINS:
1. Emotional Intelligence & Self-Management
2. Communication & Interpersonal Fluency
3. Adaptive Mindset & Resilience
4. Ethical & Purpose-Driven Leadership
5. Leadership & Collaboration
6. Analytical & Critical Thinking
7. Creative & Innovative Thinking
8. Problem Solving & Decision Making

PLAYOPS VALIDATORS:
- Mood Mapper: emotion identification (% correct emotion ID)
- Respond Loop: emotional regulation (calm_choice ≥ 85%)
- Empathy Scenario: empathy & compassion (empathy_match ≥ 90%)
- Tone Match Game: active listening (correct_tone ≥ 90%)
- Resilience Path: resilience & optimism (recovery ≤ 10s)
- Breath Timer: stress management (steady_streak = 1)
- Speak-Out Tree: ethical communication (ethical_choice = 1)
- Integrity Dilemma: integrity & accountability (consistency_score ≥ 90%)
- Kindness Simulation: compassionate leadership (team_wellbeing ≥ 90%)
- Consensus Builder: inclusive decision-making (inclusion_flag = 1)
- Data Pattern Detective: pattern recognition & analytical thinking
- Budget Allocation: resource management & decision making
- Crisis Communication: communication under pressure
- Narrative Builder: creative thinking & storytelling

ANALYSIS REQUIREMENTS:
1. Extract measurable behavioral/cognitive learning outcomes from the course
2. Map outcomes to minimum C-BEN sub-competencies needed
3. Assign appropriate PlayOps validators with evidence metrics
4. Return structured JSON only

OUTPUT FORMAT (JSON only, no markdown):
{
  "course_analysis": {
    "summary": "Brief summary of course focus",
    "key_outcomes": ["outcome 1", "outcome 2", ...]
  },
  "competency_mappings": [
    {
      "domain": "Domain Name",
      "competency": "Competency Name",
      "sub_competency": "Sub-Competency Name",
      "alignment_summary": "How course aligns with this",
      "validator_type": "Validator Name",
      "evidence_metric": "metric description",
      "scoring_formula": "formula or condition"
    }
  ],
  "recommended_validators": [
    {
      "validator_name": "Validator Name",
      "competencies_tested": ["sub-competency 1", "sub-competency 2"],
      "priority": "high|medium|low",
      "reason": "Why this validator is recommended"
    }
  ],
  "summary": {
    "total_competencies": 10,
    "domains_covered": ["domain 1", "domain 2"],
    "implementation_note": "Brief note on implementing these validators"
  }
}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { courseText, courseName, courseDescription } = await req.json();

    if (!courseText) {
      return new Response(
        JSON.stringify({ error: 'Course content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
