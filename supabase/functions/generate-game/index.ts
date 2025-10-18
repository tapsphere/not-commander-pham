import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { templatePrompt, primaryColor, secondaryColor, logoUrl, customizationId, previewMode, subCompetencies } = await req.json();
    
    console.log('Generating game with params:', { templatePrompt, primaryColor, secondaryColor, logoUrl, customizationId, previewMode, subCompetencies });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Create the prompt for game generation with PlayOps Framework integration
    let playOpsInstructions = '';
    if (subCompetencies && subCompetencies.length > 0) {
      playOpsInstructions = `

PLAYOPS FRAMEWORK INTEGRATION (CRITICAL):
This game must implement the following validated competency mechanics:

${subCompetencies.map((sc: any, index: number) => `
═══════════════════════════════════════════════════════════
SUB-COMPETENCY ${index + 1}: ${sc.statement}
═══════════════════════════════════════════════════════════

🎮 GAME MECHANIC: ${sc.game_mechanic || 'Not specified'}
   How the player interacts with this competency in the game

🎯 ACTION CUE: ${sc.action_cue || 'Not specified'}
   What prompts/triggers the player to demonstrate this skill

🎬 PLAYER ACTION: ${sc.player_action || 'Not specified'}
   Specific actions the player must perform

🔄 GAME LOOP: ${sc.game_loop || 'Not specified'}
   How this mechanic repeats/cycles during gameplay

✅ VALIDATOR TYPE: ${sc.validator_type || 'Not specified'}
   How the game validates and measures this competency

📊 SCORING FORMULAS:
   Level 1 (Basic): ${sc.scoring_formula_level_1 || 'Not specified'}
   Level 2 (Intermediate): ${sc.scoring_formula_level_2 || 'Not specified'}
   Level 3 (Advanced): ${sc.scoring_formula_level_3 || 'Not specified'}

💾 BACKEND DATA TO CAPTURE: ${JSON.stringify(sc.backend_data_captured || [])}
   These metrics MUST be tracked and sent at game end

⚙️ SCORING LOGIC: ${JSON.stringify(sc.scoring_logic || {})}
   How raw metrics translate to proficiency levels

`).join('\n')}

IMPLEMENTATION REQUIREMENTS:
1. Each sub-competency's game mechanic must be clearly implemented in the game
2. Action cues must be visible and intuitive to the player
3. Player actions must map directly to the specified interactions
4. The game loop must create repeated opportunities to demonstrate each skill
5. Validation must occur in real-time based on the validator type
6. All backend data points must be captured during gameplay
7. Scoring formulas determine the final proficiency level (Level 1, 2, or 3)

At game completion, call this function with ALL required metrics:
\`\`\`javascript
async function submitScore(metrics) {
  const response = await fetch('${Deno.env.get('SUPABASE_URL')}/functions/v1/submit-score', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + (localStorage.getItem('supabase.auth.token') || '')
    },
    body: JSON.stringify({
      templateId: '${customizationId}',
      customizationId: '${customizationId}',
      competencyId: '${subCompetencies[0]?.competency_id || ''}',
      subCompetencyId: '${subCompetencies[0]?.id || ''}',
      scoringMetrics: metrics,
      gameplayData: { /* optional extra data */ }
    })
  });
  const result = await response.json();
  console.log('Score submitted:', result);
  return result;
}
\`\`\`
`;
    }

    let logoInstructions = '';
    if (logoUrl) {
      logoInstructions = `

BRAND LOGO INTEGRATION (REQUIRED):
The brand's logo MUST be displayed in the game UI.
Logo URL: ${logoUrl}

Include this HTML in the game:
\`\`\`html
<div style="position: fixed; top: 10px; right: 10px; z-index: 9999; background: white; padding: 8px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
  <img src="${logoUrl}" alt="Brand Logo" style="height: 40px; width: auto; display: block;" />
</div>
\`\`\`
`;
    }

    const systemPrompt = `You are an expert game developer. Generate a complete, playable HTML5 game based on the template description and brand customization.

═══════════════════════════════════════════════════════════
DESIGN OVERVIEW
═══════════════════════════════════════════════════════════

Design a fast-paced 3-minute validator mini-game (maximum 6 minutes for advanced versions) that tests a specific sub-competency through interactive gameplay.

⸻

⚙️ QUICK REFERENCE

* Validator: a short interactive mini-game that tests one sub-competency
* Sub-Competency: the specific behavior the validator surfaces through gameplay
* Edge Case: a single rule-flip or disruption that appears once — creator selects timing (Early / Mid / Late) — used to test mastery under changing conditions
* Game Phase Framework: validators follow three phases — Brief → Action → Result — for consistent pacing and proof capture.

All scoring, timing, and proof logic are pre-baked into the system. Focus only on player experience, flow, and the edge-case moment.

⸻

🎯 TARGET COMPETENCY

${subCompetencies && subCompetencies.length > 0 ? subCompetencies.map((sc: any) => sc.master_competencies?.name || 'Not specified').join(', ') : '[Competency name and category]'}

SUB-COMPETENCIES BEING TESTED

${playOpsInstructions}

⸻

🎮 CRITICAL GAME ARCHITECTURE (MANDATORY STRUCTURE)

═══════════════════════════════════════════════════════════════
SCENE 0: INTRO SCREEN (Before gameplay starts)
═══════════════════════════════════════════════════════════════

This screen contains ALL game directions and instructions:
  1️⃣ WHO they are (role / scenario context)
  2️⃣ WHAT they need to achieve (specific & measurable goal)
  3️⃣ HOW they interact (drag, tap, rank, type, etc.)
  4️⃣ WHEN the edge-case occurs (Early / Mid / Late)
  5️⃣ WHAT success looks like (Needs Work / Proficient / Mastery levels)
  6️⃣ TIME limit (90–180 seconds total)

MANDATORY START BUTTON REQUIREMENTS:
  ✓ Position: Fixed at bottom OR sticky at bottom with position sticky and bottom 0
  ✓ Size: Minimum 60px height, full-width on mobile, 80% width minimum on desktop
  ✓ Label: "START GAME" or "PLAY" in ALL CAPS
  ✓ Style: Bright brand primary color, high contrast text, bold font
  ✓ Visibility: ALWAYS visible even when scrolling instructions
  ✓ Container: Place OUTSIDE any scrollable divs
  ✓ Z-index: High z-index (100 or higher)
  ✓ The game CANNOT start without clicking this button

LAYOUT STRUCTURE FOR INTRO:
- Wrapper container: full viewport height with flex column layout
- Top section: scrollable area containing all instructions
- Bottom section: fixed/sticky button that stays visible
- Instructions can scroll, button never scrolls away

═══════════════════════════════════════════════════════════════
SCENE 1: FIRST ACTION (Actual gameplay begins)
═══════════════════════════════════════════════════════════════

When START is clicked, transition to Scene 1 which is the FIRST GAMEPLAY ACTION:
  ✓ CLEAN interface - NO repeated instructions from Scene 0
  ✓ Only show: timer, score/KPIs, interactive elements (buttons, sliders, drag items)
  ✓ Brief context reminder (1 sentence max): "You are allocating budget..." 
  ✓ Ample space for player actions - not cramped
  ✓ No scrolling needed - everything fits on screen
  ✓ Scene 1 is where actual gameplay mechanic starts

═══════════════════════════════════════════════════════════════
SCENE 2+: SUBSEQUENT ACTIONS
═══════════════════════════════════════════════════════════════

Each scene after Scene 1 continues gameplay:
  ✓ Maintain clean interface
  ✓ Show progression (Scene 2 of 4, etc.)
  ✓ Keep interactive elements visible without scrolling
  ✓ Edge-case changes happen in designated scene (Early/Mid/Late)

═══════════════════════════════════════════════════════════════

CRITICAL: The game architecture MUST be:
Scene 0 (Intro + ALL directions + START button) → 
  Click START → 
    Scene 1 (First action, clean interface) → 
      Scene 2 (Second action) → 
        Scene 3 (etc.)

DO NOT auto-start. DO NOT put instructions on Scene 1. DO NOT make Scene 1 scrollable.

⸻

📋 DESIGN REQUIREMENTS

The template provides:
- Scenario / Theme (required): Context and player's role
- Player Actions (required): What the player actually does during the game
- Edge-Case Timing (required): When the rule-flip or disruption appears (Early / Mid / Late)
- Edge-Case Description (required): What changes during the edge-case moment and how the player must adapt
- UI Aesthetic (optional): Desired interface style

⸻

🎯 SCORING & RESULT SCREENS

(Handled automatically by the system — designers do not modify scoring.)
All validators use the same proof logic based on:
• Accuracy %
• Completion time
• Edge-case success

The system displays color-coded feedback (red / yellow / green) and assigns a badge: Needs Work / Proficient / Mastery.

⸻

📱 TELEGRAM MINI APP REQUIREMENTS

* Mobile-first responsive design (works on all phone screens)
* Fast loading and smooth performance
* Touch-friendly interactions (buttons, swipes, taps)
* Built with standard web technologies (HTML, CSS, JavaScript)
* Action phase may include 2–4 micro-scenes ("Next" / "Continue" transitions)

SCROLLING (CRITICAL - MUST IMPLEMENT):
Every scrollable content area MUST have these EXACT CSS properties:

overflow-y: auto;
max-height: 60vh;
-webkit-overflow-scrolling: touch;

Apply to ALL:
- Game content containers
- Team rosters, project lists, resource panels
- Message feeds, instruction panels
- ANY list or vertically stacked content

Example:
<div style="overflow-y: auto; max-height: 60vh; -webkit-overflow-scrolling: touch;">
  <!-- all your scrollable content here -->
</div>

TEST: Can a user on a small phone screen reach ALL interactive elements by scrolling?

⸻

🎯 SYSTEM HANDLES AUTOMATICALLY

* 3 proficiency levels: Needs Work / Proficient / Mastery
* Accuracy % tracking
* Completion-time tracking
* Edge-case success flag
* Automatic scoring and color-coded feedback
* Proof ledger integration and XP rewards

⸻

${logoInstructions}

⸻

CRITICAL TECHNICAL REQUIREMENTS:
1. Return ONLY valid HTML - a complete, self-contained HTML file
2. Include ALL JavaScript and CSS inline within the HTML
3. The game must be fully functional and playable
4. Use the brand colors provided: primary=${primaryColor}, secondary=${secondaryColor}
5. Make it responsive and mobile-friendly
6. Use modern, clean design
7. IMPLEMENT EVERY ELEMENT from the PlayOps Framework for each sub-competency

OUTPUT FORMAT:
Return ONLY the HTML code, nothing else. No markdown, no explanations, just pure HTML.`;

    const userPrompt = `Create a game based on this template:
${templatePrompt}

Brand Customization:
- Primary Color: ${primaryColor}
- Secondary Color: ${secondaryColor}
${logoUrl ? `- Brand Logo: ${logoUrl}` : ''}

Generate a complete, playable HTML5 game that matches this description and uses these brand colors.`;

    console.log('Calling Lovable AI...');

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

    let response;
    try {
      response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash', // Changed to faster model
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 1.0,
        }),
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('AI generation timed out after 2 minutes. Please try again with a simpler prompt.');
      }
      throw error;
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }
      if (response.status === 402) {
        throw new Error('AI credits depleted. Please add credits to continue.');
      }
      
      throw new Error(`AI generation failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('AI response received, processing...');
    
    let generatedHtml = data.choices[0].message.content;

    // Clean up the response - remove markdown code blocks if present
    generatedHtml = generatedHtml.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();

    console.log('Generated HTML length:', generatedHtml.length);

    // If preview mode, return HTML without saving
    if (previewMode) {
      console.log('Preview mode - returning HTML without saving');
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Game preview generated',
          html: generatedHtml
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Save the generated HTML to the database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Saving to database...');

    const { error: updateError } = await supabase
      .from('brand_customizations')
      .update({ generated_game_html: generatedHtml })
      .eq('id', customizationId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    console.log('Game generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Game generated successfully',
        htmlLength: generatedHtml.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-game function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
