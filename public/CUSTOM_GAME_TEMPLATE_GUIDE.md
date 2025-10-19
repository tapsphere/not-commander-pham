# Custom Game Template Guide

## PlayOps Framework for Custom Games

When creating custom HTML games for the TON Validator Platform, you **MUST** follow the PlayOps Framework architecture to ensure consistency with AI-generated games and proper validator functionality.

---

## Required Game Architecture

### Scene 0: Intro Screen (MANDATORY)
This is the first screen players see. It must contain ALL game instructions before gameplay begins.

**Required Elements:**
1. **WHO** - Player's role/scenario context
2. **WHAT** - Specific measurable goal
3. **HOW** - Interaction methods (drag, tap, click, type, etc.)
4. **WHEN** - Edge-case timing (Early/Mid/Late)
5. **WHAT SUCCESS LOOKS LIKE** - Proficiency levels (Needs Work / Proficient / Mastery)
6. **TIME LIMIT** - Total game duration (90-180 seconds recommended)

**START Button Requirements:**
```html
<!-- Example START button structure -->
<div style="position: fixed; bottom: 0; left: 0; right: 0; z-index: 100; padding: 20px; background: rgba(0,0,0,0.9);">
  <button id="startButton" style="
    width: 100%;
    min-height: 60px;
    font-size: 18px;
    font-weight: bold;
    background: var(--primary-color, #00FF00);
    color: #000;
    border: none;
    border-radius: 12px;
    cursor: pointer;
  ">
    START GAME
  </button>
</div>
```

✓ Must be visible even when instructions scroll  
✓ Minimum 60px height  
✓ High contrast with background  
✓ Game CANNOT start without clicking this button  
✓ NO auto-start allowed

---

### Scene 1: First Action (MANDATORY)
When START is clicked, transition to actual gameplay.

**Requirements:**
- Clean interface with NO repeated instructions
- Show: timer, score/KPIs, interactive elements only
- Brief context reminder (1 sentence max)
- Everything fits on screen without scrolling
- Ample space for player actions

**Example Structure:**
```html
<div id="scene1" style="display: none; padding: 20px; height: 100vh; overflow: hidden;">
  <!-- Timer at top -->
  <div style="position: fixed; top: 10px; right: 10px; background: rgba(0,0,0,0.8); padding: 10px; border-radius: 8px;">
    <span id="timer">3:00</span>
  </div>
  
  <!-- Brief context -->
  <p style="margin-bottom: 20px; font-size: 14px;">You are allocating budget across departments...</p>
  
  <!-- Interactive gameplay elements -->
  <div id="gameplayArea">
    <!-- Your game mechanics here -->
  </div>
</div>
```

---

### Scene 2+: Subsequent Actions
Continue gameplay with multiple scenes if needed.

- Maintain clean interface
- Show progression indicators
- Edge-case changes happen in designated scene
- Keep interactions visible without scrolling

---

## Brand Customization Integration

Your game should accept URL parameters for brand customization:

```javascript
// Parse URL parameters
const urlParams = new URLSearchParams(window.location.search);
const primaryColor = urlParams.get('primaryColor') || '#00FF00';
const secondaryColor = urlParams.get('secondaryColor') || '#9945FF';
const logoUrl = urlParams.get('logoUrl');

// Apply brand colors
document.documentElement.style.setProperty('--primary-color', primaryColor);
document.documentElement.style.setProperty('--secondary-color', secondaryColor);

// Display logo if provided
if (logoUrl) {
  const logoContainer = document.createElement('div');
  logoContainer.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 9999; background: white; padding: 8px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);';
  logoContainer.innerHTML = `<img src="${decodeURIComponent(logoUrl)}" alt="Brand Logo" style="height: 40px; width: auto; display: block;" />`;
  document.body.appendChild(logoContainer);
}
```

---

## Mobile-First Requirements

All custom games MUST be mobile-optimized:

```css
/* Ensure scrollable areas work on mobile */
.scrollable-content {
  overflow-y: auto;
  max-height: 60vh;
  -webkit-overflow-scrolling: touch;
}

/* Touch-friendly buttons */
button {
  min-height: 48px;
  min-width: 48px;
  touch-action: manipulation;
}

/* Responsive layout */
@media (max-width: 768px) {
  /* Mobile-specific styles */
}
```

---

## Scoring Integration (REQUIRED)

At game completion, your game MUST submit results:

```javascript
async function submitScore(metrics) {
  try {
    const response = await fetch('YOUR_SUPABASE_URL/functions/v1/submit-score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (localStorage.getItem('supabase.auth.token') || '')
      },
      body: JSON.stringify({
        templateId: 'TEMPLATE_ID',
        customizationId: 'CUSTOMIZATION_ID',
        competencyId: 'COMPETENCY_ID',
        subCompetencyId: 'SUB_COMPETENCY_ID',
        scoringMetrics: {
          accuracy: 85, // Percentage
          completionTime: 145, // Seconds
          edgeCaseSuccess: true, // Boolean
          // Additional metrics specific to your game
        },
        gameplayData: {
          // Optional: Additional gameplay data
        }
      })
    });
    
    const result = await response.json();
    console.log('Score submitted:', result);
    return result;
  } catch (error) {
    console.error('Failed to submit score:', error);
  }
}

// Call at game end
submitScore(capturedMetrics);
```

---

## Complete Example Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Custom Validator Game</title>
  <style>
    :root {
      --primary-color: #00FF00;
      --secondary-color: #9945FF;
    }
    
    body {
      margin: 0;
      padding: 0;
      font-family: system-ui, -apple-system, sans-serif;
      background: #000;
      color: #fff;
      overflow: hidden;
    }
    
    .scene {
      display: none;
      height: 100vh;
      overflow: auto;
    }
    
    .scene.active {
      display: block;
    }
    
    .instructions {
      padding: 20px;
      padding-bottom: 100px;
      max-height: calc(100vh - 100px);
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
    
    .start-button-container {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 20px;
      background: rgba(0, 0, 0, 0.95);
      z-index: 100;
    }
    
    .start-button {
      width: 100%;
      min-height: 60px;
      font-size: 18px;
      font-weight: bold;
      background: var(--primary-color);
      color: #000;
      border: none;
      border-radius: 12px;
      cursor: pointer;
    }
    
    .timer {
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      padding: 10px 15px;
      border-radius: 8px;
      font-size: 18px;
      font-weight: bold;
      z-index: 99;
    }
  </style>
</head>
<body>
  <!-- Scene 0: Intro -->
  <div id="scene0" class="scene active">
    <div class="instructions">
      <h1>Welcome to [Game Name]!</h1>
      
      <h2>1. WHO you are:</h2>
      <p>[Role description]</p>
      
      <h2>2. WHAT you need to achieve:</h2>
      <p>[Goal description]</p>
      
      <h2>3. HOW you interact:</h2>
      <p>[Interaction methods]</p>
      
      <h2>4. EDGE CASE:</h2>
      <p>[Edge case timing and description]</p>
      
      <h2>5. SUCCESS CRITERIA:</h2>
      <ul>
        <li><strong>Needs Work:</strong> [Criteria]</li>
        <li><strong>Proficient:</strong> [Criteria]</li>
        <li><strong>Mastery:</strong> [Criteria]</li>
      </ul>
      
      <h2>6. TIME LIMIT:</h2>
      <p>You have 3 minutes to complete this challenge.</p>
    </div>
    
    <div class="start-button-container">
      <button class="start-button" onclick="startGame()">START GAME</button>
    </div>
  </div>
  
  <!-- Scene 1: First Action -->
  <div id="scene1" class="scene">
    <div class="timer" id="timer">3:00</div>
    <div style="padding: 20px;">
      <p style="font-size: 14px; margin-bottom: 20px;">[Brief context reminder]</p>
      
      <div id="gameplayArea">
        <!-- Your game mechanics here -->
      </div>
    </div>
  </div>
  
  <!-- Additional scenes as needed -->
  
  <script>
    // Brand customization
    const urlParams = new URLSearchParams(window.location.search);
    const primaryColor = urlParams.get('primaryColor') || '#00FF00';
    const secondaryColor = urlParams.get('secondaryColor') || '#9945FF';
    const logoUrl = urlParams.get('logoUrl');
    
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--secondary-color', secondaryColor);
    
    if (logoUrl) {
      const logoDiv = document.createElement('div');
      logoDiv.style.cssText = 'position: fixed; top: 10px; left: 10px; z-index: 9999; background: white; padding: 8px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);';
      logoDiv.innerHTML = `<img src="${decodeURIComponent(logoUrl)}" alt="Brand Logo" style="height: 40px; width: auto; display: block;" />`;
      document.body.appendChild(logoDiv);
    }
    
    // Game state
    let gameStartTime;
    let timerInterval;
    
    function startGame() {
      document.getElementById('scene0').classList.remove('active');
      document.getElementById('scene1').classList.add('active');
      
      gameStartTime = Date.now();
      startTimer();
      
      // Initialize your game logic here
    }
    
    function startTimer() {
      let timeLeft = 180; // 3 minutes in seconds
      
      timerInterval = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        document.getElementById('timer').textContent = 
          `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          endGame();
        }
      }, 1000);
    }
    
    function endGame() {
      const completionTime = Math.floor((Date.now() - gameStartTime) / 1000);
      
      // Calculate your game-specific metrics
      const metrics = {
        accuracy: 0, // Calculate based on player performance
        completionTime: completionTime,
        edgeCaseSuccess: false, // Determine based on edge case handling
      };
      
      submitScore(metrics);
    }
    
    async function submitScore(metrics) {
      // Submit to backend
      console.log('Submitting score:', metrics);
      // Implement actual submission using the scoring integration code above
    }
  </script>
</body>
</html>
```

---

## Common Mistakes to Avoid

❌ **Don't:**
- Auto-start the game without a START button
- Put instructions in Scene 1 (gameplay area)
- Make Scene 1 require scrolling
- Skip the Scene 0 intro screen
- Forget to implement scoring integration
- Ignore mobile optimization

✅ **Do:**
- Follow Scene 0 → Scene 1 → Scene 2+ architecture strictly
- Keep gameplay areas clean and focused
- Test on mobile devices
- Implement brand customization
- Submit scores at game completion
- Make buttons touch-friendly (min 48px)

---

## Testing Your Custom Game

1. Upload your HTML file via the Creator Dashboard
2. Run through the Validator Test Wizard
3. Test on multiple screen sizes
4. Verify brand customization works
5. Confirm scoring submission works
6. Check mobile scrolling behavior

---

For questions or support, refer to the [TON Validator Platform Documentation](https://docs.example.com)
