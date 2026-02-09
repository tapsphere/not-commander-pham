import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

/**
 * DISTILL-DOCUMENT v6.0
 * 
 * Implements Phase 1 of the PlayOps v5.5 Master Standard:
 *   Rule 1: Technical Core Extraction (Noise Filter)
 *   Rule 2: Semantic Clustering (Lesson Discovery) 
 *   Rule 3: C-BEN Expert Mapping (The "Why")
 * 
 * Input: Extracted PDF text + available competencies
 * Output: 4-8 Macro-Lessons with C-BEN competency mappings and reasoning
 */

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { extractedText, competencies, filename } = await req.json();

    if (!extractedText || extractedText.length < 50) {
      return new Response(
        JSON.stringify({ error: 'Extracted text too short for distillation' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build competency list for the AI to map against
    const competencyList = (competencies || [])
      .map((c: { name: string; cbe_category: string }) => `- ${c.name} (${c.cbe_category})`)
      .join('\n');

    const systemPrompt = `You are a PlayOps v5.5 Instructional Engineering AI. Your job is to distill brand training documents into objective, measurable C-BEN Validators.

Execute these rules strictly:

**RULE 1 — Technical Core Extraction (Noise Filter):**
Perform a Semantic Audit on the document. DISCARD: adjectives, brand history, mission statements, passive "awareness" goals, marketing language. KEEP: numerical values, tolerances, safety thresholds, "Always/Never" rules, step sequences, checklists, procedures, technical specifications.

**RULE 2 — Semantic Clustering (Lesson Discovery):**
Group the Technical Core into 4-8 high-impact Macro-Lessons. Use document headers (H1/H2) and bold text as primary DNA anchors for clusters. Each lesson should represent a distinct teachable unit.

**RULE 3 — C-BEN Expert Mapping (The "Why"):**
For each Macro-Lesson, suggest which C-BEN Competency fits best based on cognitive effort:
- Analytical Thinking → Audit, Quality Control, Error Detection, Visual Assessment
- Systematic Logic → Strict Sequences, Safety Protocols, Checklists
- Growth Design → Digital Tools, App Usage, Workflow Optimization
- Problem Solving → Root Cause Analysis, Troubleshooting, Debugging
- Emotional Intelligence → Interpersonal Dynamics, Client Relations, Conflict Resolution
- Decision Making → Risk Assessment, Strategic Planning, Priority Setting
- Creative Thinking → Innovation, Design Thinking, Ideation
- Digital Fluency → Software Skills, Automation, Technical Proficiency

Available competencies in the system:
${competencyList}

**RULE 4 — Standardized Output:**
For each lesson provide: Lesson Name, Condensed Standards (key takeaways as bullet points), and the Rationale explaining WHY this competency was chosen.

**Action Cue Formula:** All action cues must follow [Verb] + [Object] + [Constraint]. No passive language.

You MUST respond with a valid JSON object using this exact structure:
{
  "documentSummary": "One-sentence summary of the source document",
  "technicalCoreExtracted": "Brief summary of what was kept vs discarded",
  "macroLessons": [
    {
      "lessonName": "Clear lesson title",
      "condensedStandards": ["Key takeaway 1", "Key takeaway 2", ...],
      "suggestedCompetency": "Exact competency name from available list",
      "rationale": "Why this competency fits (cognitive effort reasoning)",
      "actionCues": ["[Verb] + [Object] + [Constraint] format action 1", ...]
    }
  ]
}`;

    console.log(`Distilling document: ${filename}, text length: ${extractedText.length}`);

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
          { 
            role: 'user', 
            content: `Distill this training document into 4-8 Macro-Lessons following the PlayOps v5.5 rules.\n\nDocument: "${filename}"\n\n---\n\n${extractedText.substring(0, 30000)}` 
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "distill_lessons",
              description: "Return the distilled macro-lessons from the training document",
              parameters: {
                type: "object",
                properties: {
                  documentSummary: { type: "string", description: "One-sentence summary of the source document" },
                  technicalCoreExtracted: { type: "string", description: "Brief summary of what was kept vs discarded" },
                  macroLessons: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        lessonName: { type: "string" },
                        condensedStandards: { type: "array", items: { type: "string" } },
                        suggestedCompetency: { type: "string" },
                        rationale: { type: "string" },
                        actionCues: { type: "array", items: { type: "string" } }
                      },
                      required: ["lessonName", "condensedStandards", "suggestedCompetency", "rationale", "actionCues"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["documentSummary", "technicalCoreExtracted", "macroLessons"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "distill_lessons" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI distillation failed:', response.status, errorText);
      throw new Error(`AI distillation failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract from tool call response
    let result;
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      result = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback: try parsing content directly
      const content = data.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse AI distillation response');
      }
    }

    console.log(`Distillation complete: ${result.macroLessons?.length || 0} macro-lessons identified`);

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Distillation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown distillation error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
