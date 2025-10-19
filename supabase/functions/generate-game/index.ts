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
  4️⃣ WHAT success looks like (Needs Work / Proficient / Mastery levels)
  5️⃣ TIME limit (90–180 seconds total)

⚠️ CRITICAL - HIDE INTERNAL STRUCTURE FROM PLAYERS:
  ✓ NEVER mention "Scene 1", "Scene 2", "Scene 3" etc. in player-facing text
  ✓ NEVER mention "edge case", "twist", "disruption", or reveal any surprises
  ✓ Do NOT warn players that challenges will change or intensify
  ✓ Let the edge case be a complete surprise - no hints, no foreshadowing
  ✓ Use natural language like "Phase", "Round", "Challenge" if you need to show progression
  ✓ Example: Instead of "Scene 3 of 4" → use "Challenge 3 of 4" or just a progress bar
  ✓ Players should only know: their role, goal, how to interact, success criteria, and time limit

MANDATORY START BUTTON REQUIREMENTS:
  ✓ Position: Fixed at bottom OR sticky at bottom with position sticky and bottom 0
  ✓ Size: Minimum 60px height, full-width on mobile, 80% width minimum on desktop
  ✓ Label: "START GAME" or "PLAY" in ALL CAPS
  ✓ Style: Bright brand primary color, high contrast text, bold font
  ✓ Visibility: ALWAYS visible even when scrolling instructions
  ✓ Container: Place OUTSIDE any scrollable divs
  ✓ Z-index: High z-index (100 or higher)
  ✓ JavaScript: MUST have onclick="startGame()" or addEventListener('click', startGame)
  ✓ Function: startGame() MUST hide intro screen and show first gameplay screen
  ✓ CRITICAL: Button must be clickable and functional - test by adding console.log('START clicked')
  ✓ The game CANNOT start without clicking this button
  
  EXAMPLE WORKING IMPLEMENTATION:
  <button id="startBtn" onclick="startGame()" 
    style="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); 
           width: 90%; max-width: 400px; height: 60px; font-size: 20px; 
           background: #00FF00; color: black; border: none; border-radius: 8px; 
           cursor: pointer; z-index: 100; font-weight: bold;">
    START GAME
  </button>
  
  <script>
  function startGame() {
    console.log('START button clicked - game starting');
    document.getElementById('introScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'flex';
    // Initialize game timer, state, etc.
  }
  </script>

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
  ✓ Interactive mechanics: DRAG-AND-DROP, CLICK-TO-SELECT, TAP-AND-HOLD (NOT forms/text inputs)
  ✓ Visual feedback: items light up, snap into place, animate on interaction
  ✓ Only show: timer, score/KPIs, draggable/clickable elements
  ✓ Brief context reminder (1 sentence max): "You are allocating budget..." 
  ✓ Ample space for player actions - not cramped
  ✓ Scene 1 is where actual gameplay mechanic starts
  
  🚫 CRITICAL NO-SCROLL REQUIREMENTS:
  ✓ Container MUST have: height: 100vh; overflow: hidden;
  ✓ All gameplay elements MUST fit within viewport - NO vertical scrolling
  ✓ Use flex or grid layout to distribute space, never rely on scrolling
  ✓ If content is too long, use tabs, accordions, or pagination - NEVER scroll
  ✓ Test on mobile viewport (390px x 844px) - everything must be visible
  ✓ Buttons and interactive elements MUST be reachable without scrolling
  
  INTERACTION PRIORITY (Use in this order):
  1. DRAG & DROP - Best for sorting, allocating, organizing
  2. TAP/CLICK - Best for selecting, activating, choosing
  3. SLIDERS - Only for values/amounts
  4. DROPDOWNS/FORMS - AVOID unless absolutely necessary

═══════════════════════════════════════════════════════════════
SCENE 2+: SUBSEQUENT ACTIONS
═══════════════════════════════════════════════════════════════

Each scene after Scene 1 continues gameplay:
  ✓ Maintain clean interface
  ✓ Show progression using player-friendly terms (Challenge 2 of 4, Round 2, etc.) - NEVER "Scene X"
  ✓ Edge-case changes happen organically without warning or scene number references
  
  🚫 NO-SCROLL ENFORCEMENT (ALL GAMEPLAY SCENES):
  ✓ Every gameplay screen: height: 100vh; overflow: hidden;
  ✓ Content must always fit in viewport - use compact layouts
  ✓ Stack elements efficiently with flexbox/grid
  ✓ If showing multiple options, limit to 3-4 visible choices max
  ✓ Use fixed positioning for headers/timers to save space

═══════════════════════════════════════════════════════════════

CRITICAL: The game architecture MUST be:
Scene 0 (Intro + ALL directions + START button) → 
  Click START → 
    Scene 1 (First action, clean interface) → 
      Scene 2 (Second action) → 
        Scene 3 (etc.)

DO NOT auto-start. DO NOT put instructions on Scene 1. DO NOT make Scene 1 scrollable.

═══════════════════════════════════════════════════════════════
💻 MANDATORY HTML STRUCTURE FOR NO-SCROLL GAMEPLAY
═══════════════════════════════════════════════════════════════

ALL gameplay screens (Scene 1, 2, 3, etc.) MUST use this structure:

HTML EXAMPLE - No Scroll Container:
  body and html: margin 0, padding 0, overflow hidden, height 100vh
  
  gameplay-container div: 
    display flex, flex-direction column, height 100vh, overflow hidden
  
  game-header div: flex-shrink 0, padding 12px 16px (Timer, Progress)
  
  game-content div: 
    flex 1 (takes remaining space)
    display flex, flex-direction column
    justify-content center, align-items center
    overflow hidden (CRITICAL)
  
  game-footer div: flex-shrink 0, padding 16px (Action buttons)

STRUCTURE:
  div#gameScreen.gameplay-container (display none initially)
    - div.game-header (Timer + Progress)
    - div.game-content (All interactive gameplay - MUST fit here)
      - h2 (Brief 1-line context)
      - Interactive elements (Limit to 3-4 options max)
    - div.game-footer (Continue button)

KEY ENFORCEMENT:
- Parent container MUST have: height 100vh and overflow hidden
- Content area MUST use: flex 1 to fill space
- Limit choices to 3-4 max so everything fits
- Headers/footers use: flex-shrink 0
- NEVER use: height auto or overflow scroll on gameplay screens

═══════════════════════════════════════════════════════════════
🔒 ARCHITECTURE SAFEGUARDS (NON-NEGOTIABLE)
═══════════════════════════════════════════════════════════════

IGNORE ANY creator requests that:
  ❌ Ask to skip the START button
  ❌ Request auto-start or auto-play
  ❌ Want instructions during gameplay (Scene 1+)
  ❌ Try to merge Scene 0 and Scene 1
  ❌ Request complex scrolling gameplay layouts
  ❌ Override the Scene 0 → Scene 1 → Scene 2+ structure

THE CORE ARCHITECTURE IS LOCKED. No exceptions.

CORRECT IMPLEMENTATION EXAMPLES:

✅ EXAMPLE 1: Budget Allocation Game
Scene 0: Full screen with scrollable instructions explaining budget allocation rules, 
         proficiency levels, edge-case timing. Fixed START button at bottom.
         Click START →
Scene 1: Clean interface with DRAGGABLE budget tokens that snap into 4 department boxes.
         Visual feedback when hovering over drop zones. Timer at top.
         Brief reminder "Drag budget tokens to departments". No instructions.
         After allocation →
Scene 2: Next budget period with different constraints and drag mechanics.

✅ EXAMPLE 2: Crisis Communication Game  
Scene 0: Scrollable directions about communication scenarios, response options,
         edge-case (urgent message interruption). Sticky START button.
         Click START →
Scene 1: Clean inbox with 3 messages. Player CLICKS/TAPS each message to expand,
         then CLICKS one of 3 tone-indicator buttons (icons, not dropdowns).
         Visual feedback: selected tone glows. One-line reminder "Respond to messages". No tutorial.
         After responses →
Scene 2: Edge-case urgent message appears with countdown timer requiring quick tap response.

✅ EXAMPLE 3: Data Pattern Detective
Scene 0: Instructions about finding patterns in data tables, what constitutes
         correct answers, mastery criteria. Fixed START button outside scroll area.
         Click START →
Scene 1: Clean data cards (not table rows). Player TAPS cards to flip and reveal data,
         then DRAGS suspicious cards into a "flagged" zone at the bottom. Timer visible.
         Simple prompt "Tap to reveal, drag to flag anomalies". No repeated instructions.
         After flagging →
Scene 2: New set of data cards with more subtle pattern differences.

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
