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
     const { templatePrompt, primaryColor, secondaryColor, accentColor, backgroundColor, highlightColor, textColor, fontFamily, logoUrl, avatarUrl, particleEffect, mascotAnimationType, customizationId, previewMode, subCompetencies } = await req.json();
    
    console.log('Generating game with params:', { templatePrompt, primaryColor, secondaryColor, accentColor, backgroundColor, highlightColor, textColor, fontFamily, logoUrl, avatarUrl, particleEffect, mascotAnimationType, customizationId, previewMode, subCompetencies });

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

BRAND LOGO INTEGRATION (CRITICAL - LOADING SCREEN ONLY):
The brand's logo MUST ONLY appear on the initial loading screen, then disappear completely.
Logo URL: ${logoUrl}

🚫 CRITICAL NO-LOGO RULES (STRICTLY ENFORCE):
1. Logo appears ONLY on the loading screen overlay
2. Logo MUST BE REMOVED completely after loading screen fades out
3. DO NOT place logo in header, corner, or any game UI element
4. DO NOT use logo as watermark or persistent branding
5. After loading screen disappears, NO LOGO should be visible anywhere in the game
6. NO exceptions - logo is ONLY for the 2.5 second loading screen

IMPLEMENTATION REQUIREMENTS:
1. Create a full-screen loading overlay with the brand logo centered
2. Logo should pulse/animate smoothly (scale 0.95 to 1.05)
3. Loading screen should display for 2-3 seconds
4. Fade out the loading screen completely (including the logo)
5. Game UI has NO logo after loading screen ends

Required HTML/CSS/JS structure:
\`\`\`html
<div id="loading-screen" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: ${backgroundColor || '#1A1A1A'}; z-index: 10000; display: flex; align-items: center; justify-content: center; transition: opacity 0.8s ease-out;">
  <img 
    id="brand-logo" 
    src="${logoUrl}" 
    alt="Brand Logo" 
    style="max-width: 200px; max-height: 200px; animation: pulse 1.5s ease-in-out infinite;" 
  />
</div>

<style>
@keyframes pulse {
  0%, 100% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
}
</style>

<script>
// Auto-hide loading screen after 2.5 seconds
setTimeout(() => {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 800);
  }
}, 2500);
</script>
\`\`\`
`;
    }

    let avatarInstructions = '';
    if (avatarUrl) {
      const isAnimated = mascotAnimationType && mascotAnimationType !== 'static';
      const animType = mascotAnimationType || 'static';
      
      avatarInstructions = `

AVATAR/MASCOT INTEGRATION (GAME CHARACTER) - ${animType.toUpperCase()} TYPE:
Avatar URL: ${avatarUrl}
Animation Type: ${animType}

${isAnimated ? `
🎬 ANIMATED MASCOT DETECTED!
This is ${animType === 'gif' ? 'an animated GIF' : animType === 'lottie' ? 'a Lottie animation' : 'a sprite sheet'}.

CRITICAL - PRESERVE ANIMATION:
${animType === 'gif' ? `
- Use <img> tag directly for GIF animations
- DO NOT apply CSS transforms that break the GIF loop
- GIF will animate automatically
- Only apply position/size changes, not filters or distortions
` : animType === 'lottie' ? `
- Load Lottie player library: <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
- Use <lottie-player> component
- Set autoplay and loop attributes
- Example: <lottie-player src="${avatarUrl}" background="transparent" speed="1" style="width: 200px; height: 200px;" loop autoplay></lottie-player>
` : `
- Implement sprite sheet animation using CSS animation steps
- Calculate frame count and timing
`}
` : ''}

The avatar/mascot is the STAR of the game and should be prominently featured:

1. PLACEMENT & SIZE:
   - Center the avatar prominently on the main game screen (not just a corner icon)
   - Make it large enough to be the visual focal point (150-250px depending on screen)
   - Position it where players naturally look (center or upper-center of gameplay area)

2. ANIMATIONS & REACTIONS${isAnimated ? ' (LAYER ON TOP OF BASE ANIMATION)' : ''}:
   ${isAnimated ? `- The mascot already has built-in animation from the ${animType}
   - ADD extra effects on top: scale, rotation, glow, bounce
   - DO NOT replace the base animation` : ''}
   - Add idle animation when waiting (gentle breathing, floating, subtle movement)
   - Celebration animation on correct answers (scale up, rotate, add glow)
   - Disappointed/thinking animation on wrong answers (shake, scale down)
   - Excited animation at game start
   - Victory dance/celebration at game end

3. INTEGRATION:
   - Make the avatar react to player actions in real-time
   - Position score counters or progress bars NEAR the avatar (not replacing it)
   - Use the avatar as the emotional guide through the game
   - On results screen, show avatar celebrating or encouraging based on score

4. ${animType === 'gif' ? 'HTML IMPLEMENTATION' : animType === 'lottie' ? 'LOTTIE IMPLEMENTATION' : 'CSS IMPLEMENTATION'}:
   \`\`\`${animType === 'lottie' ? 'html' : 'css'}
   ${animType === 'gif' ? `.game-avatar {
     position: relative;
     margin: 20px auto;
   }
   
   .game-avatar img {
     width: 200px;
     height: 200px;
     object-fit: contain;
   }
   
   .avatar-celebrate {
     animation: celebrate-scale 0.6s ease-out;
   }
   
   @keyframes celebrate-scale {
     0%, 100% { transform: scale(1); }
     50% { transform: scale(1.15); filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8)); }
   }` : animType === 'lottie' ? `<div class="game-avatar">
  <lottie-player 
    id="mascot" 
    src="${avatarUrl}" 
    background="transparent" 
    speed="1" 
    style="width: 200px; height: 200px;" 
    loop 
    autoplay>
  </lottie-player>
</div>

<script>
// Trigger celebration by changing speed or adding effects
function celebrateMascot() {
  const mascot = document.getElementById('mascot');
  mascot.style.transform = 'scale(1.2)';
  mascot.style.filter = 'drop-shadow(0 0 20px gold)';
  setTimeout(() => {
    mascot.style.transform = 'scale(1)';
    mascot.style.filter = 'none';
  }, 600);
}
</script>` : `.game-avatar {
     position: relative;
     width: 200px;
     height: 200px;
     margin: 20px auto;
     animation: idle-float 3s ease-in-out infinite;
   }
   
   @keyframes idle-float {
     0%, 100% { transform: translateY(0px); }
     50% { transform: translateY(-10px); }
   }
   
   .avatar-celebrate {
     animation: celebrate-bounce 0.6s ease-out;
   }
   
   @keyframes celebrate-bounce {
     0%, 100% { transform: scale(1) rotate(0deg); }
     25% { transform: scale(1.2) rotate(-10deg); }
     75% { transform: scale(1.2) rotate(10deg); }
   }`}
   \`\`\`
`;
    }

    let particleInstructions = '';
    if (particleEffect) {
      const particleStyles: Record<string, { emoji: string; color: string; desc: string }> = {
        sparkles: { emoji: '✨', color: '#FFD700', desc: 'twinkling sparkles' },
        coins: { emoji: '🪙', color: '#FFD700', desc: 'golden coins' },
        stars: { emoji: '⭐', color: '#FFFF00', desc: 'bright stars' },
        hearts: { emoji: '❤️', color: '#FF69B4', desc: 'floating hearts' },
        confetti: { emoji: '🎉', color: 'rainbow', desc: 'colorful confetti pieces' },
        lightning: { emoji: '⚡', color: '#00FFFF', desc: 'electric lightning bolts' }
      };
      
      const style = particleStyles[particleEffect as string] || particleStyles.sparkles;
      
      particleInstructions = `

PARTICLE EFFECT SYSTEM - "${particleEffect.toUpperCase()}" (CRITICAL):
Use ${style.desc} for ALL positive feedback and interactions.

1. WHEN TO TRIGGER PARTICLES:
   - Every button/option tap or click
   - Correct answer selected
   - Task completed successfully
   - Score increases
   - Level completion
   - Game finish celebration
   - Avatar reactions (when avatar celebrates)

2. PARTICLE IMPLEMENTATION:
   Create a particle burst function that spawns 8-15 particles from the interaction point.
   
   \`\`\`javascript
   function createParticleBurst(x, y) {
     const particleCount = 12;
     const container = document.getElementById('particle-container') || document.body;
     
     for (let i = 0; i < particleCount; i++) {
       const particle = document.createElement('div');
       particle.className = 'particle';
       particle.textContent = '${style.emoji}';
       particle.style.cssText = \`
         position: fixed;
         left: \${x}px;
         top: \${y}px;
         font-size: \${20 + Math.random() * 20}px;
         pointer-events: none;
         z-index: 9999;
         animation: particle-float \${0.8 + Math.random() * 0.4}s ease-out forwards;
         --end-x: \${(Math.random() - 0.5) * 200}px;
         --end-y: \${-50 - Math.random() * 100}px;
       \`;
       container.appendChild(particle);
       setTimeout(() => particle.remove(), 1200);
     }
   }
   
   // Add to all interactive elements
   document.querySelectorAll('button, .option, .interactive').forEach(el => {
     el.addEventListener('click', (e) => {
       createParticleBurst(e.clientX, e.clientY);
     });
   });
   \`\`\`

3. CSS FOR PARTICLES:
   \`\`\`css
   @keyframes particle-float {
     0% {
       transform: translate(0, 0) scale(0);
       opacity: 1;
     }
     100% {
       transform: translate(var(--end-x), var(--end-y)) scale(1);
       opacity: 0;
     }
   }
   \`\`\`

4. SPECIAL MOMENTS:
   - Game completion: Create 50+ particles across entire screen
   - Perfect score: Continuous particle stream for 3 seconds
   - Level up: Particles burst from center outward
   - Around avatar: Particles orbit when avatar celebrates
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
  4️⃣ WHAT success looks like (Level 1 – Needs Work / Level 2 – Proficient / Level 3 – Mastery)
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
  ✓ Test on mobile viewport (390px x 844px) - everything must be visible
  ✓ Buttons and interactive elements MUST be reachable without scrolling
  
  📏 STRICT CONTENT LIMITS (ENFORCE THESE):
  ✓ Maximum 3 options/choices per screen (NEVER 4 or more)
  ✓ Option text: Maximum 25 words per option (keep it concise!)
  ✓ Context text at top: Maximum 15 words
  ✓ Use icons + short labels instead of long descriptions
  ✓ Button height: 60-80px max with padding: 12px
  ✓ Gap between elements: 12px max (not 20px+)
  ✓ Total vertical space budget: 700px for content area
  
  LAYOUT MATH (Mobile 390x844):
  - Header (timer/progress): 60px
  - Context text: 60px
  - 3 Options @ 70px each: 210px
  - Gaps (4 x 12px): 48px
  - Footer button: 80px
  - TOTAL: 458px (fits comfortably in 844px viewport)
  
  🎮 CREATIVE GAMEPLAY MECHANICS (MANDATORY - NO FORMS):
  
  ❌ NEVER USE: Text inputs, dropdowns, radio buttons, checkboxes, or form elements
  ✅ ALWAYS USE: Interactive, playful mechanics that feel like games
  
  INTERACTION PRIORITY (Use in this order):
  1. DRAG & DROP - Drag cards to zones, sort items, allocate resources
     Example: Drag budget cards into department slots, drag words to build sentences
     
     🔧 CRITICAL DRAG & DROP IMPLEMENTATION - YOU MUST INCLUDE THIS WORKING CODE:
     
     DRAGGABLE ITEMS must have these attributes:
     - draggable="true"
     - ondragstart="handleDragStart(event, 'unique-id')"
     - style="cursor: grab; user-select: none;"
     
     DROP ZONES must have these attributes:
     - ondrop="handleDrop(event)"
     - ondragover="handleDragOver(event)"
     - ondragleave="handleDragLeave(event)"
     - style="min-height: 100px; border: 3px dashed #666;"
     
     REQUIRED JAVASCRIPT (include in script tag):
     let draggedItem = null;
     
     function handleDragStart(event, itemId) {
       draggedItem = event.target;
       event.dataTransfer.effectAllowed = 'move';
       event.dataTransfer.setData('text/html', event.target.innerHTML);
       event.target.style.opacity = '0.5';
     }
     
     function handleDragOver(event) {
       event.preventDefault();
       event.dataTransfer.dropEffect = 'move';
       event.target.style.borderColor = '#00FF00';
       event.target.style.background = 'rgba(0, 255, 0, 0.1)';
     }
     
     function handleDragLeave(event) {
       event.target.style.borderColor = '#666';
       event.target.style.background = 'transparent';
     }
     
     function handleDrop(event) {
       event.preventDefault();
       if (draggedItem) {
         event.target.appendChild(draggedItem);
         draggedItem.style.opacity = '1';
         event.target.style.borderColor = '#666';
         event.target.style.background = 'transparent';
         // Add visual feedback
         event.target.style.animation = 'pulse 0.3s';
         draggedItem = null;
       }
     }
     
     TEST YOUR DRAG & DROP: Make sure items actually move when dragged!
  
  2. TAP/CLICK CARDS - Flip cards, select options by tapping interactive elements
     Example: Tap message cards to reveal content, click tone indicators, tap to match pairs
  
  3. SWIPE GESTURES - Swipe left/right to categorize, accept/reject
     Example: Swipe communications left (urgent) or right (routine)
  
  4. TIMELINE BUILDERS - Click to add events, drag to reorder story beats
     Example: Build a crisis response timeline by clicking actions in sequence
  
  5. MATCHING GAMES - Connect related items, pair concepts
     Example: Draw lines between problems and solutions
  
  6. SLIDERS/DIALS - Adjust values visually with immediate feedback
     Example: Allocate percentage budgets with visual pie charts updating live
  
  🎨 CREATIVE GAME DESIGN PRINCIPLES:
  - Use VISUAL METAPHORS: Budget = poker chips, Time = clock countdown, Priority = star ratings
  - Add IMMEDIATE FEEDBACK: Items glow when correct, shake when wrong, particles on success
  - Create PLAYFUL SCENARIOS: Don't say "Rate this 1-5", say "Award stars based on urgency"
  - Use GAME LANGUAGE: "Round", "Challenge", "Mission", not "Question" or "Task"
  - Make it FEEL LIKE A GAME: Animations, sounds (describe them), visual rewards
  
  🎯 BRAND CONTENT INTEGRATION:
  When brand uploads content (documents, scenarios, data):
  - Transform data into INTERACTIVE CARDS players can manipulate
  - Turn scenarios into DECISION MOMENTS with visual choices
  - Convert lists into SORTING or MATCHING challenges
  - Make text content into STORY BEATS players build or reorder
  
  Example: If brand uploads "10 customer emails" → Create drag-and-drop inbox where players 
  physically drag emails into priority folders, not a form asking "Which is urgent?"

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
  ✓ Maximum 3 choices per scene (NEVER exceed this)
  ✓ Each choice text: 25 words maximum
  ✓ Use fixed positioning for headers/timers to save space
  ✓ Minimize padding: 12px gaps, not 20px+

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

═══════════════════════════════════════════════════════════════
❌ WRONG vs ✅ RIGHT - SCROLL PREVENTION
═══════════════════════════════════════════════════════════════

❌ WRONG (Causes Scroll):
Scene with 4 options, each with 40+ word descriptions:
- Header: 60px
- Context: "You need to decide..." (100px with long text)
- Option 1: "Integrate the new feature, believing the delay is worth..." (90px)
- Option 2: "Stick to the original plan and launch without..." (90px)  
- Option 3: "Release with the known bug, providing a known..." (90px)
- Option 4: "Conduct a rapid user survey to gauge priority..." (90px)
- Footer: 80px
TOTAL: 600px+ → SCROLLS on mobile! ❌

✅ RIGHT (Fits Perfectly):
Scene with 3 options, each under 25 words:
- Header: 50px (Timer: 2:45 | Phase 2)
- Context: "Critical decision needed" (40px - brief!)
- Option A: "Launch now - fast but risky" (70px)
- Option B: "Delay 1 week - safer approach" (70px)
- Option C: "Test with users first" (70px)
- Footer: 70px (CONTINUE button)
TOTAL: 370px → FITS EASILY! ✅

KEY DIFFERENCES:
- 3 options vs 4 options
- 10-15 words per option vs 40+ words
- Compact spacing (12px gaps) vs loose spacing (20px+ gaps)
- Brief context vs verbose explanation

⸻

📋 DESIGN REQUIREMENTS

The template provides:
- Scenario / Theme (required): Context and player's role
- Player Actions (required): What the player actually does during the game
- Edge-Case Timing (required): When the rule-flip or disruption appears (Early / Mid / Late)
- Edge-Case Description (required): What changes during the edge-case moment and how the player must adapt
- UI Aesthetic (optional): Desired interface style

⸻

🎯 SCORING & RESULT SCREENS (CRITICAL - MUST IMPLEMENT)

The game MUST include a detailed results screen that appears after gameplay completes.

MANDATORY RESULTS SCREEN ELEMENTS:

1. PROFICIENCY BADGE (Large, prominent, color-coded using brand colors):
   - Level 3 – Mastery (use Highlight color: ${highlightColor || primaryColor}) if accuracy ≥95% AND edge case handled
   - Level 2 – Proficient (use Secondary color: ${secondaryColor}) if accuracy 80-94%
   - Level 1 – Needs Work (use Accent color: ${accentColor || textColor}) if accuracy < 80%

2. SCORE DISPLAY:
   - Large percentage score (48px font, bold)
   - Color matches proficiency level

3. METRICS BREAKDOWN:
   - Accuracy percentage
   - Time taken vs total time (e.g., "120s / 180s")
   - Edge Case status (Handled / Not Handled)
   - Number of optimal decisions made
   - Any other relevant gameplay metrics

4. PERFORMANCE FEEDBACK:
   - Specific text about what player did well
   - Constructive suggestions for improvement
   - Context-specific to their actual choices

5. ACTION BUTTONS:
   - PLAY AGAIN button (reloads game)
   - Close button

IMPLEMENTATION REQUIREMENTS:

Create a hidden div with id="resultsScreen" that gets shown when game completes.
Include a showResults(metrics) JavaScript function that:
  - Calculates proficiency level from metrics
  - Applies correct color coding
  - Populates ALL metric displays with actual values
  - Hides game screen and shows results screen

Track these metrics during gameplay:
  - Total actions taken
  - Optimal vs suboptimal choices
  - Time from start to completion
  - Whether edge case was successfully handled
  - Any validator-specific metrics

Calculate final accuracy score based on:
  - Percentage of optimal choices made
  - Speed bonuses/penalties if applicable
  - Edge case success/failure

CRITICAL: Results must show ACTUAL calculated values, not just "Challenge Complete!"

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

* 3 proficiency levels: Level 1 – Needs Work / Level 2 – Proficient / Level 3 – Mastery
* Accuracy % tracking
* Completion-time tracking
* Edge-case success flag
* Automatic scoring and color-coded feedback
* Proof ledger integration and XP rewards

⸻

${logoInstructions}

⸻

${avatarInstructions}

⸻

${particleInstructions}

⸻

CRITICAL TECHNICAL REQUIREMENTS:
1. Return ONLY valid HTML - a complete, self-contained HTML file
2. Include ALL JavaScript and CSS inline within the HTML
3. The game must be fully functional and playable
4. Use ONLY these brand colors throughout the entire game (loading screen, game screens, results):
   - Primary: ${primaryColor} (buttons, main actions, highlights, headers)
   - Secondary: ${secondaryColor} (supporting elements, borders, hover states)
   - Accent: ${accentColor || textColor} (warnings, emphasis, selected states)
   - Background: ${backgroundColor || '#F5EDD3'} (base background, cards)
   - Highlight: ${highlightColor || primaryColor} (success states, correct answers)
   - Text: ${textColor || '#2D5556'} (all text, labels, descriptions)
5. Use ONLY this font throughout the entire game:
   - Font Family: ${fontFamily || 'Inter, sans-serif'} (all text elements)
   - Load font: <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
6. Apply clean, minimalist design with these colors and font everywhere
7. NEVER use hard-coded colors like #00FF00, #1A1A1A, white, black etc.
8. Use the provided colors for ALL UI elements from start to finish
9. IMPLEMENT EVERY ELEMENT from the PlayOps Framework for each sub-competency

⚠️ MANDATORY MOBILE-FIRST REQUIREMENTS (NON-NEGOTIABLE):
═══════════════════════════════════════════════════════════════

📱 VIEWPORT META TAG (MUST BE FIRST IN <head>):
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

This MUST be the first tag in the <head> section of the HTML. Without this, the game will not display correctly on mobile devices.

🎨 MOBILE-FIRST CSS ARCHITECTURE:
- Design for 375px-414px width first (iPhone/Android standard sizes)
- Use relative units: vh, vw, %, em, rem (NEVER fixed px for layouts)
- Body/HTML: margin: 0; padding: 0; overflow: hidden; height: 100vh; width: 100vw;
- All containers: box-sizing: border-box;
- Touch targets: minimum 44px x 44px for buttons (iOS Human Interface Guidelines)
- Font sizes: minimum 16px for body text (prevents iOS zoom on input focus)

🔒 TEXT CONTAINMENT & OVERFLOW PREVENTION (CRITICAL):
═══════════════════════════════════════════════════════════════════════════
MANDATORY CSS - Include these rules in your <style> tag to prevent text overflow:

* {
  box-sizing: border-box;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* Prevent text from escaping containers */
h1, h2, h3, h4, h5, h6, p, div, span, button, label {
  max-width: 100%;
  overflow: hidden;
}

/* Results/Score page text sizing */
.results-screen, .score-screen, #resultsScreen, #scoreScreen {
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Responsive text sizing for results */
.results-screen h1, .score-screen h1 {
  font-size: clamp(24px, 6vw, 48px);
  margin: 10px 0;
  text-align: center;
  white-space: normal;
}

.results-screen h2, .score-screen h2 {
  font-size: clamp(20px, 5vw, 36px);
  margin: 8px 0;
  text-align: center;
}

.results-screen p, .score-screen p {
  font-size: clamp(14px, 3.5vw, 18px);
  margin: 6px 0;
  text-align: center;
  max-width: 90%;
}

/* Badge/Status text */
.badge, .status, .proficiency {
  font-size: clamp(18px, 4vw, 32px);
  padding: 8px 16px;
  white-space: normal;
  max-width: 90%;
  text-align: center;
}

/* Score/Percentage displays */
.score-display, .percentage {
  font-size: clamp(32px, 8vw, 64px);
  font-weight: bold;
  white-space: nowrap;
}

/* Button text wrapping - CRITICAL for long labels */
button {
  white-space: normal !important;
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
  text-overflow: clip !important;
  overflow: visible !important;
  min-height: 44px;
  padding: 12px 20px;
  line-height: 1.3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

/* Ensure option buttons wrap text */
.option, .choice-btn, .answer-btn, [class*="option"], [class*="choice"] {
  white-space: normal !important;
  word-wrap: break-word !important;
  height: auto !important;
  min-height: 44px;
  padding: 12px 16px;
}

🖱️ TOUCH-OPTIMIZED INTERACTIONS:
- All buttons must work with touch events
- Use cursor: pointer on all interactive elements
- Add active states: button:active { transform: scale(0.95); }
- Drag-and-drop: implement both mouse and touch event handlers
- No hover-only interactions (touch devices don't have hover)

✅ BUTTON IMPLEMENTATION - CRITICAL REQUIREMENTS (ALL BUTTONS MUST WORK):
═══════════════════════════════════════════════════════════════════════════

🚨 MANDATORY: ALL buttons in the game MUST follow these implementation rules:

1️⃣ WRAP ALL EVENT LISTENERS IN DOMContentLoaded:
ALL JavaScript that adds event listeners to buttons MUST be wrapped in:
document.addEventListener('DOMContentLoaded', function() { ... });

2️⃣ CONSOLE LOG ALL BUTTON CLICKS:
Every button click handler MUST include console.log() for debugging:
console.log('Button [name] clicked - [action description]');

3️⃣ VERIFY ELEMENTS EXIST BEFORE ADDING LISTENERS:
Always check if elements exist before adding event listeners:
if (button && targetElement) { ... } else { console.error('Elements not found:', { ... }); }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 EXAMPLE 1: START BUTTON (Game Introduction → Phase 1)

HTML:
<button id="startBtn" class="game-button">START GAME</button>

CSS:
.game-button {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 400px;
  height: 60px;
  font-size: 20px;
  background: ${primaryColor};
  color: #000;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  z-index: 100;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  -webkit-tap-highlight-color: transparent;
}

.game-button:active {
  transform: translateX(-50%) scale(0.98);
}

JAVASCRIPT:
<script>
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded - initializing START button');
  
  const startBtn = document.getElementById('startBtn');
  const introScreen = document.getElementById('introScreen');
  const phase1Screen = document.getElementById('phase1Screen');
  
  if (startBtn && introScreen && phase1Screen) {
    startBtn.addEventListener('click', function() {
      console.log('START clicked - transitioning from intro to phase 1');
      introScreen.style.display = 'none';
      phase1Screen.style.display = 'flex';
      startTimer(); // Start game timer
    });
  } else {
    console.error('START button elements not found:', {
      startBtn: !!startBtn,
      introScreen: !!introScreen,
      phase1Screen: !!phase1Screen
    });
  }
});
</script>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 EXAMPLE 2: NEXT PHASE BUTTONS (Phase 1 → Phase 2 → Phase 3 → Phase 4)

HTML:
<button id="phase1NextBtn" class="game-button">OPTIMIZE & NEXT PHASE</button>
<button id="phase2NextBtn" class="game-button">CONTINUE TO PHASE 3</button>
<button id="phase3NextBtn" class="game-button">FINALIZE & SUBMIT</button>

JAVASCRIPT:
<script>
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded - initializing NEXT PHASE buttons');
  
  // Phase 1 → Phase 2
  const phase1NextBtn = document.getElementById('phase1NextBtn');
  const phase1Screen = document.getElementById('phase1Screen');
  const phase2Screen = document.getElementById('phase2Screen');
  
  if (phase1NextBtn && phase1Screen && phase2Screen) {
    phase1NextBtn.addEventListener('click', function() {
      console.log('NEXT clicked - Phase 1 → Phase 2');
      phase1Screen.style.display = 'none';
      phase2Screen.style.display = 'flex';
    });
  }
  
  // Phase 2 → Phase 3
  const phase2NextBtn = document.getElementById('phase2NextBtn');
  const phase3Screen = document.getElementById('phase3Screen');
  
  if (phase2NextBtn && phase2Screen && phase3Screen) {
    phase2NextBtn.addEventListener('click', function() {
      console.log('NEXT clicked - Phase 2 → Phase 3');
      phase2Screen.style.display = 'none';
      phase3Screen.style.display = 'flex';
    });
  }
  
  // Phase 3 → Phase 4 (Results)
  const phase3NextBtn = document.getElementById('phase3NextBtn');
  const phase4Screen = document.getElementById('phase4Screen');
  
  if (phase3NextBtn && phase3Screen && phase4Screen) {
    phase3NextBtn.addEventListener('click', function() {
      console.log('SUBMIT clicked - Phase 3 → Phase 4 (Results)');
      phase3Screen.style.display = 'none';
      phase4Screen.style.display = 'flex';
      calculateFinalScore(); // Calculate results
    });
  }
});
</script>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ CRITICAL REMINDERS:
• EVERY button must have a unique ID
• EVERY button must have an event listener wrapped in DOMContentLoaded
• EVERY button click must console.log() what it's doing
• EVERY screen/phase must have a unique ID
• Test button clicks by checking console logs
• Use display: 'none' and display: 'flex' to show/hide screens

🚨 COMMON MOBILE ISSUES TO AVOID:
❌ Missing viewport meta tag → causes desktop rendering on mobile
❌ Fixed pixel widths → causes horizontal scroll
❌ JavaScript executing before DOM ready → buttons don't work
❌ Hover-only interactions → don't work on touch devices
❌ Small touch targets (<44px) → hard to tap accurately
❌ Desktop-first layouts → poor mobile experience
❌ Missing DOMContentLoaded wrapper → buttons not clickable
❌ No console.log() statements → impossible to debug

✅ MOBILE TESTING CHECKLIST:
Before returning the HTML, mentally verify:
□ Viewport meta tag is present in <head>
□ All widths use % or vw, not fixed px
□ ALL buttons (START, NEXT, SUBMIT, etc.) have DOMContentLoaded wrapper
□ ALL button clicks have console.log() statements
□ All interactive elements have cursor: pointer
□ Touch targets are minimum 44px
□ No horizontal scrolling possible
□ Game fits in 375px x 667px viewport (iPhone SE)
□ All phase screens have unique IDs
□ All phase transitions work (display: none / flex)

OUTPUT FORMAT:
Return ONLY the HTML code, nothing else. No markdown, no explanations, just pure HTML.
The HTML must start with <!DOCTYPE html> and include the viewport meta tag.`;

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
