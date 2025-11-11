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
    let { templatePrompt, primaryColor, secondaryColor, accentColor, backgroundColor, highlightColor, textColor, fontFamily, logoUrl, avatarUrl, particleEffect, mascotAnimationType, customizationId, previewMode, subCompetencies } = await req.json();
    
    console.log('Generating game with params:', { templatePrompt, primaryColor, secondaryColor, accentColor, backgroundColor, highlightColor, textColor, fontFamily, logoUrl, avatarUrl, particleEffect, mascotAnimationType, customizationId, previewMode, subCompetencies });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // If colors aren't provided, fetch them from the database
    if (!primaryColor && customizationId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      console.log('Fetching brand customization data from database...');
      const { data: customization, error: fetchError } = await supabase
        .from('brand_customizations')
        .select('customization_prompt, primary_color, secondary_color, accent_color, background_color, highlight_color, text_color, font_family, logo_url, avatar_url, particle_effect, mascot_animation_type, template_id')
        .eq('id', customizationId)
        .single();
      
      if (fetchError) {
        console.error('Failed to fetch customization:', fetchError);
        throw new Error('Failed to fetch brand customization data');
      }
      
      if (customization) {
        console.log('Using colors from database:', customization);
        primaryColor = customization.primary_color;
        secondaryColor = customization.secondary_color;
        accentColor = customization.accent_color;
        backgroundColor = customization.background_color;
        highlightColor = customization.highlight_color;
        textColor = customization.text_color;
        fontFamily = customization.font_family;
        logoUrl = customization.logo_url;
        avatarUrl = customization.avatar_url;
        particleEffect = customization.particle_effect;
        mascotAnimationType = customization.mascot_animation_type;
        templatePrompt = customization.customization_prompt;
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // LEAN AI GENERATION SYSTEM PROMPT
    // ═══════════════════════════════════════════════════════════════
    
    // PlayOps Framework Integration (from CBEN_PlayOps_Framework_Finale-2.xlsx)
    let playOpsInstructions = '';
    if (subCompetencies && subCompetencies.length > 0) {
      playOpsInstructions = `
# PLAYOPS FRAMEWORK INTEGRATION (Page 3 - Game Design Data)
${subCompetencies.map((sc: any, index: number) => `
Sub-Competency ${index + 1}: ${sc.statement}

CRITICAL IMPLEMENTATION REQUIREMENTS:
- **Action Cue (What player does)**: ${sc.action_cue || 'Select the correct option within time limit'}
- **Game Mechanic**: ${sc.game_mechanic || 'Interactive selection/matching task'}
- **Player Action**: ${sc.player_action || 'Select, Match, Identify'}
- **Validator Type**: ${sc.validator_type || 'Scenario-Based Simulation'}
- **Game Loop**: Input → Action → Feedback → Submit
- **Backend Data Captured**: ${JSON.stringify(sc.backend_data_captured || ['accuracy', 'time_s', 'decisions'])}

SCORING FORMULA (PlayOps Page 3):
${sc.scoring_formula_level_1 || 'L1: acc<0.85 OR t>90s = 100 XP (Needs Work)'}
${sc.scoring_formula_level_2 || 'L2: acc≥0.90 AND t≤90s = 250 XP (Proficient)'}
${sc.scoring_formula_level_3 || 'L3: acc≥0.95 AND t≤75s AND edge≥0.80 AND sessions≥3 = 500 XP (Mastery)'}
`).join('\n')}

XP AWARDS (DO NOT MODIFY):
- Level 1 (Needs Work): 100 XP
- Level 2 (Proficient): 250 XP
- Level 3 (Mastery): 500 XP
`;
    }

    const systemPrompt = `You are an expert game developer. Generate a complete, mobile-first HTML5 validator mini-game that runs inside Telegram. One validator = one sub-competency. Output pure HTML only (with <!DOCTYPE html>), no markdown.

# DESIGN REQUIREMENTS

- Duration: 3–6 minutes (180–360 seconds)
- Structure: Scene 0 (Intro, scrollable) → Scene 1+ (Gameplay, no-scroll) → Results
- Goal: Surface one measurable Action Cue; no free-text input anywhere
- Target viewports: 390×844, 768×1024, 1440×900 without clipping
- First paint ≤ 3s, total assets ≤ 2MB

# ACTION CUE (BLACK-AND-WHITE)

Use one verb from this safelist ONLY:
**Select, Identify, Match, Classify, Order, Allocate, Flag, Route**

Provide a gold-key for each decision node (IDs of correct options + plausible distractors).

# EMBEDDED CONFIGURATION

Embed these in your HTML <script> section:

\`\`\`javascript
window.__GOLD_KEY__ = {
  s1_n1: ["opt_b"],
  s2_n1: ["opt_a", "opt_c"]
};

window.__CONFIG__ = {
  mode: "training", // or "testing"
  duration_s: ${subCompetencies?.[0]?.duration || 180},
  competency: "${subCompetencies?.[0]?.competency || 'Unknown'}",
  sub_competency: "${subCompetencies?.[0]?.statement || 'Unknown'}",
  thresholds: {
    A2: 0.90,
    A3: 0.95,
    Tlimit: ${subCompetencies?.[0]?.duration || 180},
    Ttight: ${(subCompetencies?.[0]?.duration || 180) * 0.85},
    EdgeL3: 0.80,
    SessionsL3: 3
  },
  xp: {
    // PlayOps Framework (CBEN_PlayOps_Framework_Finale-2.xlsx Page 4)
    L1: 100,  // Needs Work
    L2: 250,  // Proficient
    L3: 500   // Mastery
  }
};
\`\`\`

# SCORING (3 LEVELS, DETERMINISTIC)

- **Level 1 (Needs Work)**: accuracy < 0.85 OR time_s > Tlimit
- **Level 2 (Proficient)**: accuracy ≥ 0.90 AND time_s ≤ Tlimit
- **Level 3 (Mastery)**: accuracy ≥ 0.95 AND time_s ≤ Ttight AND edge_score ≥ 0.80 AND sessions ≥ 3

At game end, set:

\`\`\`javascript
window.__RESULT__ = {
  accuracy: 0.92,
  time_s: 168,
  edge_score: 0.85,
  level: 2,
  passed: true
};
\`\`\`

# TRAIN VS TEST (AUTO)

- **Training**: randomized content, unlimited attempts, no proof/XP
- **Testing**: deterministic (no random), one attempt, emits Proof Receipt:

\`\`\`javascript
window.__PROOF__ = {
  proof_id: "auto-" + Math.random().toString(36).slice(2),
  template_id: "auto",
  competency: window.__CONFIG__.competency,
  sub_competency: window.__CONFIG__.sub_competency,
  level: window.__RESULT__.level,
  metrics: {
    accuracy: window.__RESULT__.accuracy,
    time_s: window.__RESULT__.time_s,
    edge_score: window.__RESULT__.edge_score,
    sessions: 1
  },
  timestamp: new Date().toISOString()
};
\`\`\`

# TELEGRAM MINI-APP HOOKS (REQUIRED)

\`\`\`javascript
// Telegram WebApp initialization
if (window.Telegram && window.Telegram.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();
}
\`\`\`

# SCENE 0 (LOADING SCREEN)

Show brand/creator logo with loading animation, auto-transitions to instructions after 2.5 seconds.
Only show logo/mascot if provided - no placeholders.

\`\`\`html
<div id="loadingScreen" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: ${backgroundColor || '#1A1A1A'}; z-index: 10000; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 20px; transition: opacity 0.8s ease-out;">
  ${logoUrl || avatarUrl ? `
  <img 
    id="brand-logo" 
    src="${logoUrl || avatarUrl}" 
    alt="Loading..." 
    crossorigin="anonymous"
    style="max-width: 250px; max-height: 250px; width: auto; height: auto; object-fit: contain; animation: pulse 1.5s ease-in-out infinite; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));" 
    onerror="console.error('Logo failed to load'); this.style.display='none';"
  />
  ` : ''}
  <div style="color: rgba(255,255,255,0.6); font-size: 14px; font-weight: 500; letter-spacing: 1px;">LOADING...</div>
</div>

<style>
@keyframes pulse {
  0%, 100% { transform: scale(0.95); opacity: 0.9; }
  50% { transform: scale(1.05); opacity: 1; }
}
</style>

<script>
// Auto-hide loading screen after 2.5 seconds
setTimeout(function() {
  const loadingScreen = document.getElementById('loadingScreen');
  const instructionsScreen = document.getElementById('instructionsScreen');
  if (loadingScreen && instructionsScreen) {
    loadingScreen.style.opacity = '0';
    setTimeout(function() {
      loadingScreen.style.display = 'none';
      instructionsScreen.style.display = 'block';
    }, 800);
  }
}, 2500);
</script>
\`\`\`

# INSTRUCTIONS SCREEN (WITH MASCOT)

Scrollable screen explaining the game with mascot/avatar. If no mascot, show negative space placeholder.

\`\`\`html
<div id="instructionsScreen" style="display: none; overflow-y: auto; height: 100vh; padding: 20px; padding-bottom: 100px; background: ${backgroundColor || '#F5EDD3'}; font-family: ${fontFamily || 'Inter, sans-serif'}; color: ${textColor || '#2D5556'};">
  ${avatarUrl ? `
  <div class="mascot-container" style="margin: 20px auto; text-align: center;">
    <img 
      src="${avatarUrl}" 
      alt="Mascot" 
      style="width: 200px; height: 200px; object-fit: contain; background: transparent; animation: float 3s ease-in-out infinite;" 
      onerror="console.error('Mascot failed to load'); this.style.display='none';"
    />
  </div>
  ` : ''}
  
  <h1 style="color: ${primaryColor}; text-align: center; font-size: 28px; margin: 20px 0;">Welcome to the Challenge</h1>
  
  <div style="max-width: 500px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <h2 style="color: ${primaryColor}; font-size: 20px; margin-bottom: 15px;">📋 Instructions</h2>
    <ul style="list-style: none; padding: 0; margin: 0;">
      <li style="padding: 12px 0; border-bottom: 1px solid #eee;">👤 <strong>Who:</strong> Your role in this scenario</li>
      <li style="padding: 12px 0; border-bottom: 1px solid #eee;">🎯 <strong>What:</strong> The challenge you face</li>
      <li style="padding: 12px 0; border-bottom: 1px solid #eee;">⚙️ <strong>How:</strong> The actions you'll take</li>
      <li style="padding: 12px 0; border-bottom: 1px solid #eee;">✨ <strong>Success:</strong> What determines mastery</li>
      <li style="padding: 12px 0;">⏱️ <strong>Time:</strong> ${subCompetencies?.[0]?.duration || 180} seconds</li>
    </ul>
  </div>
  
  <button id="startBtn" style="position: fixed; bottom: 20px; left: 20px; right: 20px; max-width: 500px; margin: 0 auto; height: 60px; background: ${primaryColor}; color: #FFFFFF; border: none; border-radius: 8px; font-size: 18px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.2); transition: transform 0.2s;">
    START GAME
  </button>
</div>

<style>
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

#startBtn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.3);
}

#startBtn:active {
  transform: translateY(0);
}
</style>
\`\`\`

# SCENE 1+ (GAMEPLAY, NO-SCROLL)

Enforce: \`html, body { height: 100vh; overflow: hidden }\` and container flex layout.

**Requirements:**
- Max 3 choices per screen, each ≤ 25 words
- Use drag-drop / tap-to-select / match / allocate (no form elements, no contentEditable)
- Edge-case once at chosen timing; record:

\`\`\`javascript
window.__EDGE__ = {
  triggered: true,
  recovered: true,
  score: 0.9
};
\`\`\`

${avatarUrl ? `
**Avatar in gameplay:**
\`\`\`html
<div class="gameplay-screen" style="position: relative; height: 100vh; overflow: hidden;">
  <div class="game-avatar" style="position: absolute; top: 10px; right: 10px; width: 80px; height: 80px; background: transparent; z-index: 10;">
    <img src="${avatarUrl}" alt="Mascot" style="width: 100%; height: 100%; object-fit: contain; background: transparent; mix-blend-mode: normal;" />
  </div>
  <!-- Gameplay content here -->
</div>
\`\`\`
` : ''}

# RESULTS SCREEN

Show badge (Needs Work / Proficient / Mastery), accuracy %, time, edge status, XP.

**Buttons:**
- PLAY AGAIN (training mode) - reloads game
- CLOSE (testing mode) - closes window

${avatarUrl ? `
**Avatar in results:**
\`\`\`html
<div id="resultsScreen" style="display: none; text-align: center; padding: 20px;">
  <div class="game-avatar" style="margin: 20px auto; width: 180px; height: 180px; background: transparent;">
    <img src="${avatarUrl}" alt="Mascot" style="width: 100%; height: 100%; object-fit: contain; background: transparent; mix-blend-mode: normal;" />
  </div>
  
  <div id="proficiency-badge" style="font-size: 32px; font-weight: bold; margin: 20px 0;"></div>
  <div id="accuracy-display" style="font-size: 48px; font-weight: bold; margin: 10px 0;"></div>
  <div id="time-display" style="font-size: 18px; margin: 10px 0;"></div>
  <div id="edge-display" style="font-size: 18px; margin: 10px 0;"></div>
  
  <button id="playAgainBtn" style="width: 100%; max-width: 300px; height: 60px; background: ${primaryColor}; color: ${textColor || '#ffffff'}; border: none; border-radius: 8px; font-size: 18px; margin-top: 20px; cursor: pointer;">
    PLAY AGAIN
  </button>
</div>
\`\`\`
` : ''}

# TELEMETRY (MUST EMIT)

Log these events:
- session.start
- decision.select
- edge.trigger
- session.end (include accuracy, time_s, edge_score, level, passed)

\`\`\`javascript
function logEvent(eventType, data) {
  console.log(\`[TELEMETRY] \${eventType}\`, data);
  // Optional: Send to analytics endpoint
}

logEvent('session.start', { timestamp: new Date().toISOString() });
\`\`\`

# BRAND CUSTOMIZATION

Use these brand colors throughout the entire game:

- **Primary**: ${primaryColor} (buttons, main actions, highlights, headers)
- **Secondary**: ${secondaryColor} (supporting elements, borders, hover states)
- **Accent**: ${accentColor || textColor} (warnings, emphasis, selected states)
- **Background**: ${backgroundColor || '#F5EDD3'} (base background, cards)
- **Highlight**: ${highlightColor || primaryColor} (success states, correct answers)
- **Text**: ${textColor || '#2D5556'} (all text, labels, descriptions)
- **Font**: ${fontFamily || 'Inter, sans-serif'} (all text elements)

Load font: \`<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">\`

**CRITICAL TEXT CONTRAST RULES:**
1. Body and paragraph text MUST use var(--text-color)
2. Button text color must contrast with button background:
   - For colored button backgrounds (primary/secondary): Use #FFFFFF (white) text
   - For light button backgrounds: Use #000000 (black) text
3. Ensure minimum 4.5:1 contrast ratio for all text
4. Headers can use var(--primary-color) but must contrast with background
5. NEVER use white text on white/light backgrounds or black text on black/dark backgrounds

**CRITICAL:** NEVER use hard-coded colors. Use the provided brand colors for ALL UI elements.

# MOBILE-FIRST REQUIREMENTS

**Viewport meta tag (MUST BE FIRST):**
\`\`\`html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
\`\`\`

**CSS Architecture:**
- Design for 375px-414px width first
- Use relative units: vh, vw, %, em, rem (avoid fixed px)
- Body/HTML: margin: 0; padding: 0; height: 100vh; width: 100vw;
- Touch targets: minimum 44px × 44px
- Font sizes: minimum 16px for body text

**Text containment:**
\`\`\`css
* {
  box-sizing: border-box;
  word-wrap: break-word;
  overflow-wrap: break-word;
}
\`\`\`

# BUTTON EVENT LISTENERS (CRITICAL)

Every button must have an event listener wrapped in DOMContentLoaded:

\`\`\`javascript
document.addEventListener('DOMContentLoaded', function() {
  const startBtn = document.getElementById('startBtn');
  const instructionsScreen = document.getElementById('instructionsScreen');
  const gameScreen = document.getElementById('gameScreen');
  
  if (startBtn && instructionsScreen && gameScreen) {
    startBtn.addEventListener('click', function() {
      console.log('START clicked - transitioning to game');
      instructionsScreen.style.display = 'none';
      gameScreen.style.display = 'flex';
      document.body.style.overflow = 'hidden'; // Lock scroll for gameplay
      startTimer();
    });
  }
});
\`\`\`

# SELF-LINT CHECKLIST

Before returning HTML, verify:
- ✅ Action verb ∈ safelist (Select, Identify, Match, Classify, Order, Allocate, Flag, Route)
- ✅ No free-text or contentEditable present
- ✅ \`__GOLD_KEY__\` exists for every decision node
- ✅ \`__CONFIG__\` embedded with correct values
- ✅ Loading screen → Instructions screen (scrollable) → Gameplay (no-scroll) → Results
- ✅ Telegram hooks present
- ✅ \`__RESULT__\` and Results screen exist
- ✅ All buttons have DOMContentLoaded event listeners
- ✅ All buttons have console.log() statements
- ✅ Viewport meta tag present
- ✅ Brand colors used throughout (no hard-coded colors)

${playOpsInstructions}

# OUTPUT FORMAT

Return ONLY the HTML code, nothing else. No markdown, no explanations, just pure HTML.
The HTML must start with <!DOCTYPE html> and include the viewport meta tag as the first tag in <head>.`;

    const userPrompt = `Create a game based on this template:
${templatePrompt}

Brand Customization:
- Primary Color: ${primaryColor}
- Secondary Color: ${secondaryColor}
- Accent Color: ${accentColor || primaryColor}
- Background Color: ${backgroundColor || '#1A1A1A'}
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
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.0, // Zero temperature = 100% deterministic
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
          generatedHtml: generatedHtml
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
