import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { brandName, courseName, courseDescription, learningObjectives } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // AI prompt to generate custom scenarios matching the demo structure
    const systemPrompt = `You are an expert game designer creating a Crisis Communication validator game.

CRITICAL: You must maintain the EXACT structure of the demo game with 4 scenes:
1. Scene 1: Initiative - Task Sequencing (select 3 pre-day tasks from 6)
2. Scene 2: Team Connection - Channel Matching (match 3 scenarios to 3 channels)
3. Scene 3: Coaching & Mentorship - Support Stack (build 3-layer resource stack)
4. Scene 4: Feedback & Reflection - Priority Timeline (sequence 3 actions)

Based on the user's training content, generate realistic scenarios that:
- Feel natural and specific to their industry/context
- Map to the 4 competencies (Initiative, Team Connection, Coaching, Feedback)
- Use their actual company/course context
- Don't feel "staged" - use realistic work scenarios

Return a JSON object with this structure:
{
  "brandName": "Company Name",
  "courseName": "Course Title",
  "scene1": {
    "title": "Scene title",
    "context": "Brief context about what player is doing",
    "correctTasks": ["Task 1", "Task 2", "Task 3"],
    "incorrectTasks": ["Wrong 1", "Wrong 2", "Wrong 3"]
  },
  "scene2": {
    "scenarios": [
      { "title": "Scenario 1", "description": "Context", "correctChannel": "teams-call" },
      { "title": "Scenario 2", "description": "Context", "correctChannel": "quick-chat" },
      { "title": "Scenario 3", "description": "Context", "correctChannel": "email" }
    ]
  },
  "scene3": {
    "context": "Who needs support and why",
    "correctResources": ["Resource 1", "Resource 2", "Resource 3"],
    "incorrectResources": ["Wrong 1", "Wrong 2", "Wrong 3"]
  },
  "scene4": {
    "context": "Feedback scenario context",
    "correctSequence": ["Action 1", "Action 2", "Action 3"]
  }
}`;

    const userPrompt = `Generate a custom Crisis Communication game for:
Company: ${brandName}
Course: ${courseName}
Description: ${courseDescription}
Learning Objectives: ${learningObjectives.join(', ')}

Create scenarios that feel authentic to their workplace context.`;

    // Call Lovable AI to generate scenarios
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
        tools: [{
          type: "function",
          function: {
            name: "generate_scenarios",
            description: "Generate custom game scenarios",
            parameters: {
              type: "object",
              properties: {
                brandName: { type: "string" },
                courseName: { type: "string" },
                scene1: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    context: { type: "string" },
                    correctTasks: { type: "array", items: { type: "string" } },
                    incorrectTasks: { type: "array", items: { type: "string" } }
                  }
                },
                scene2: {
                  type: "object",
                  properties: {
                    scenarios: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          title: { type: "string" },
                          description: { type: "string" },
                          correctChannel: { type: "string", enum: ["teams-call", "quick-chat", "email"] }
                        }
                      }
                    }
                  }
                },
                scene3: {
                  type: "object",
                  properties: {
                    context: { type: "string" },
                    correctResources: { type: "array", items: { type: "string" } },
                    incorrectResources: { type: "array", items: { type: "string" } }
                  }
                },
                scene4: {
                  type: "object",
                  properties: {
                    context: { type: "string" },
                    correctSequence: { type: "array", items: { type: "string" } }
                  }
                }
              },
              required: ["brandName", "courseName", "scene1", "scene2", "scene3", "scene4"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_scenarios" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API Error:', errorText);
      throw new Error(`AI API returned ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices[0].message.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const scenarios = JSON.parse(toolCall.function.arguments);

    // Generate the HTML game using the demo template
    const html = generateGameHTML(scenarios);

    return new Response(
      JSON.stringify({ html }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function generateGameHTML(scenarios: any): string {
  // Read the demo template and inject custom scenarios
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${scenarios.brandName} - ${scenarios.courseName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #333;
    }
    .game-container {
      width: 90%;
      max-width: 1000px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    .scene { padding: 40px; min-height: 600px; }
    .scene-hidden { display: none; }
    h1 { font-size: 2.5em; margin-bottom: 20px; color: #667eea; }
    h2 { font-size: 1.8em; margin-bottom: 15px; color: #764ba2; }
    .context { font-size: 1.1em; color: #666; margin-bottom: 30px; line-height: 1.6; }
    .task-grid, .resource-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 30px 0; }
    .task-card, .resource-card, .action-card {
      padding: 20px;
      background: #f8f9fa;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      cursor: move;
      transition: all 0.3s ease;
      text-align: center;
    }
    .task-card:hover, .resource-card:hover, .action-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      border-color: #667eea;
    }
    .drop-zone {
      min-height: 120px;
      border: 3px dashed #667eea;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
      background: #f0f4ff;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .scenario-card {
      padding: 25px;
      background: #f8f9fa;
      border-radius: 12px;
      margin: 15px 0;
      border: 2px solid #e0e0e0;
      position: relative;
    }
    .channel-icons {
      display: flex;
      gap: 15px;
      margin-top: 20px;
    }
    .channel-icon {
      padding: 15px 25px;
      background: white;
      border: 2px solid #667eea;
      border-radius: 8px;
      cursor: move;
      transition: all 0.3s;
      text-align: center;
      font-size: 0.9em;
    }
    .channel-icon:hover {
      background: #667eea;
      color: white;
      transform: scale(1.05);
    }
    .btn {
      padding: 15px 40px;
      font-size: 1.1em;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 600;
    }
    .btn-primary {
      background: #667eea;
      color: white;
    }
    .btn-primary:hover {
      background: #5568d3;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }
    .stack-builder {
      display: flex;
      flex-direction: column-reverse;
      gap: 10px;
      min-height: 300px;
      padding: 20px;
      background: #f0f4ff;
      border-radius: 12px;
      border: 3px dashed #667eea;
    }
    .stack-layer {
      padding: 20px;
      background: white;
      border: 2px solid #667eea;
      border-radius: 8px;
      text-align: center;
      font-weight: 600;
    }
    .priority-timeline {
      display: flex;
      gap: 20px;
      margin: 30px 0;
    }
    .priority-slot {
      flex: 1;
      min-height: 150px;
      border: 3px dashed #667eea;
      border-radius: 12px;
      padding: 20px;
      background: #f0f4ff;
      text-align: center;
    }
    .confetti {
      position: fixed;
      width: 10px;
      height: 10px;
      background: #667eea;
      position: fixed;
      animation: confetti-fall 3s linear forwards;
    }
    @keyframes confetti-fall {
      to {
        transform: translateY(100vh) rotate(360deg);
        opacity: 0;
      }
    }
    .result-section {
      text-align: center;
      padding: 40px;
    }
    .xp-badge {
      display: inline-block;
      padding: 20px 40px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border-radius: 50px;
      font-size: 2em;
      font-weight: bold;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="game-container">
    <!-- Intro Scene -->
    <div id="scene-intro" class="scene">
      <h1>${scenarios.brandName}</h1>
      <h2>${scenarios.courseName}</h2>
      <p class="context">Welcome to your personalized competency validator. This interactive experience will assess your skills across 4 key areas through realistic workplace scenarios.</p>
      <button class="btn btn-primary" onclick="startGame()">Begin Assessment</button>
    </div>

    <!-- Scene 1: Task Sequencing -->
    <div id="scene1" class="scene scene-hidden">
      <h2>Initiative: ${scenarios.scene1.title}</h2>
      <p class="context">${scenarios.scene1.context}</p>
      <div class="task-grid" id="taskCards">
        ${[...scenarios.scene1.correctTasks, ...scenarios.scene1.incorrectTasks]
          .sort(() => Math.random() - 0.5)
          .map((task, i) => `<div class="task-card" draggable="true" data-task="${task}" data-id="task${i}">${task}</div>`)
          .join('')}
      </div>
      <div class="drop-zone" id="taskInbox">
        <p style="color: #667eea; font-weight: 600;">📥 Complete Before Day 1 (Drop 3 tasks here)</p>
      </div>
      <button class="btn btn-primary" id="submitScene1" style="display:none;" onclick="submitScene1()">Submit Selection</button>
    </div>

    <!-- Scene 2: Channel Matching -->
    <div id="scene2" class="scene scene-hidden">
      <h2>Team Connection: Communication Strategy</h2>
      ${scenarios.scene2.scenarios.map((s: any, i: number) => `
        <div class="scenario-card" data-correct="${s.correctChannel}">
          <h3>${s.title}</h3>
          <p>${s.description}</p>
          <div class="drop-zone" data-scenario="scenario${i + 1}">
            <p style="color: #667eea;">Drop the best communication channel here</p>
          </div>
        </div>
      `).join('')}
      <div class="channel-icons">
        <div class="channel-icon" draggable="true" data-channel="teams-call">Teams<br>Call</div>
        <div class="channel-icon" draggable="true" data-channel="quick-chat">Quick<br>Chat</div>
        <div class="channel-icon" draggable="true" data-channel="email">Email</div>
      </div>
      <button class="btn btn-primary" id="submitScene2" style="display:none;" onclick="submitScene2()">Submit Matches</button>
    </div>

    <!-- Scene 3: Support Stack -->
    <div id="scene3" class="scene scene-hidden">
      <h2>Coaching & Mentorship: Build Support Stack</h2>
      <p class="context">${scenarios.scene3.context}</p>
      <div class="resource-grid" id="resourceCards">
        ${[...scenarios.scene3.correctResources, ...scenarios.scene3.incorrectResources]
          .sort(() => Math.random() - 0.5)
          .map((r, i) => `<div class="resource-card" draggable="true" data-resource="${r}" data-id="res${i}">${r}</div>`)
          .join('')}
      </div>
      <div class="stack-builder" id="stackBuilder">
        <p style="color: #667eea; font-weight: 600; text-align: center;">Build 3-Layer Support Stack (Foundation → Top)</p>
      </div>
      <p style="text-align: center; margin-top: 10px; color: #666;">Layers: <span id="stackCount">0</span>/3</p>
      <button class="btn btn-primary" id="submitScene3" style="display:none; margin: 20px auto; display: block;" onclick="submitScene3()">Submit Stack</button>
    </div>

    <!-- Scene 4: Priority Timeline -->
    <div id="scene4" class="scene scene-hidden">
      <h2>Feedback & Reflection: Priority Sequencing</h2>
      <p class="context">${scenarios.scene4.context}</p>
      <div class="task-grid" id="actionCards">
        ${scenarios.scene4.correctSequence.map((a: string, i: number) => `<div class="action-card" draggable="true" data-action="${a}" data-id="act${i}">${a}</div>`).join('')}
      </div>
      <div class="priority-timeline">
        <div class="priority-slot" data-priority="1"><strong>1st Priority</strong><br><small>What to do first</small></div>
        <div class="priority-slot" data-priority="2"><strong>2nd Priority</strong><br><small>What to do second</small></div>
        <div class="priority-slot" data-priority="3"><strong>3rd Priority</strong><br><small>What to do third</small></div>
      </div>
      <button class="btn btn-primary" id="submitScene4" style="display:none;" onclick="submitScene4()">Submit Sequence</button>
    </div>

    <!-- Results Scene -->
    <div id="scene-results" class="scene scene-hidden">
      <div class="result-section">
        <h1>Assessment Complete!</h1>
        <div class="xp-badge" id="totalXP">0 XP</div>
        <h2 id="proficiencyLevel">Proficiency Level</h2>
        <p class="context" id="resultDetails"></p>
        <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
      </div>
    </div>
  </div>

  <script>
    window.__CONFIG__ = {
      brandName: "${scenarios.brandName}",
      courseName: "${scenarios.courseName}",
      goldKey: {
        scene1: ${JSON.stringify(scenarios.scene1.correctTasks)},
        scene2: ${JSON.stringify(scenarios.scene2.scenarios.map((s: any) => s.correctChannel))},
        scene3: ${JSON.stringify(scenarios.scene3.correctResources)},
        scene4: ${JSON.stringify(scenarios.scene4.correctSequence)}
      },
      xp: { L1: 100, L2: 250, L3: 500 }
    };

    let currentScene = 'intro';
    let results = { scene1: 0, scene2: 0, scene3: 0, scene4: 0 };
    let scene1Selected = [];
    let scene2Matches = {};
    let scene3Stack = [];
    let scene4Sequence = {};

    function startGame() {
      showScene('scene1');
    }

    function showScene(sceneId) {
      document.querySelectorAll('.scene').forEach(s => s.classList.add('scene-hidden'));
      document.getElementById(sceneId).classList.remove('scene-hidden');
      currentScene = sceneId;
      setupDragDrop(sceneId);
    }

    function setupDragDrop(sceneId) {
      if (sceneId === 'scene1') {
        const cards = document.querySelectorAll('#taskCards .task-card');
        const inbox = document.getElementById('taskInbox');
        
        cards.forEach(card => {
          card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('task', e.target.dataset.task);
          });
        });

        inbox.addEventListener('dragover', (e) => e.preventDefault());
        inbox.addEventListener('drop', (e) => {
          e.preventDefault();
          const task = e.dataTransfer.getData('task');
          if (!scene1Selected.includes(task) && scene1Selected.length < 3) {
            scene1Selected.push(task);
            const div = document.createElement('div');
            div.className = 'stack-layer';
            div.textContent = task;
            inbox.appendChild(div);
            if (scene1Selected.length === 3) {
              document.getElementById('submitScene1').style.display = 'block';
            }
          }
        });
      } else if (sceneId === 'scene2') {
        const icons = document.querySelectorAll('.channel-icon');
        const dropZones = document.querySelectorAll('.scenario-card .drop-zone');

        icons.forEach(icon => {
          icon.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('channel', e.target.dataset.channel);
          });
        });

        dropZones.forEach(zone => {
          zone.addEventListener('dragover', (e) => e.preventDefault());
          zone.addEventListener('drop', (e) => {
            e.preventDefault();
            const channel = e.dataTransfer.getData('channel');
            const scenario = zone.dataset.scenario;
            zone.innerHTML = '<div class="stack-layer">' + channel.replace('-', ' ') + '</div>';
            scene2Matches[scenario] = channel;
            if (Object.keys(scene2Matches).length === 3) {
              document.getElementById('submitScene2').style.display = 'block';
            }
          });
        });
      } else if (sceneId === 'scene3') {
        const cards = document.querySelectorAll('#resourceCards .resource-card');
        const builder = document.getElementById('stackBuilder');
        
        cards.forEach(card => {
          card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('resource', e.target.dataset.resource);
          });
        });

        builder.addEventListener('dragover', (e) => e.preventDefault());
        builder.addEventListener('drop', (e) => {
          e.preventDefault();
          const resource = e.dataTransfer.getData('resource');
          if (!scene3Stack.includes(resource) && scene3Stack.length < 3) {
            scene3Stack.push(resource);
            const div = document.createElement('div');
            div.className = 'stack-layer';
            div.textContent = resource;
            builder.appendChild(div);
            document.getElementById('stackCount').textContent = scene3Stack.length;
            if (scene3Stack.length === 3) {
              document.getElementById('submitScene3').style.display = 'block';
            }
          }
        });
      } else if (sceneId === 'scene4') {
        const cards = document.querySelectorAll('#actionCards .action-card');
        const slots = document.querySelectorAll('.priority-slot');

        cards.forEach(card => {
          card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('action', e.target.dataset.action);
          });
        });

        slots.forEach(slot => {
          slot.addEventListener('dragover', (e) => e.preventDefault());
          slot.addEventListener('drop', (e) => {
            e.preventDefault();
            const action = e.dataTransfer.getData('action');
            const priority = slot.dataset.priority;
            const existing = slot.querySelector('.stack-layer');
            if (existing) existing.remove();
            const div = document.createElement('div');
            div.className = 'stack-layer';
            div.textContent = action;
            slot.appendChild(div);
            scene4Sequence[priority] = action;
            if (Object.keys(scene4Sequence).length === 3) {
              document.getElementById('submitScene4').style.display = 'block';
            }
          });
        });
      }
    }

    function submitScene1() {
      const correct = window.__CONFIG__.goldKey.scene1;
      const matches = scene1Selected.filter(t => correct.includes(t)).length;
      results.scene1 = (matches / 3) * 100;
      showConfetti();
      setTimeout(() => showScene('scene2'), 1000);
    }

    function submitScene2() {
      const goldKey = window.__CONFIG__.goldKey.scene2;
      let correct = 0;
      Object.values(scene2Matches).forEach((channel, i) => {
        if (channel === goldKey[i]) correct++;
      });
      results.scene2 = (correct / 3) * 100;
      showConfetti();
      setTimeout(() => showScene('scene3'), 1000);
    }

    function submitScene3() {
      const correct = window.__CONFIG__.goldKey.scene3;
      const matches = scene3Stack.filter(r => correct.includes(r)).length;
      results.scene3 = (matches / 3) * 100;
      showConfetti();
      setTimeout(() => showScene('scene4'), 1000);
    }

    function submitScene4() {
      const correct = window.__CONFIG__.goldKey.scene4;
      let matches = 0;
      for (let i = 1; i <= 3; i++) {
        if (scene4Sequence[i] === correct[i - 1]) matches++;
      }
      results.scene4 = (matches / 3) * 100;
      showConfetti();
      setTimeout(showResults, 1000);
    }

    function showResults() {
      const avg = (results.scene1 + results.scene2 + results.scene3 + results.scene4) / 4;
      let level = 'Needs Work';
      let xp = window.__CONFIG__.xp.L1;
      
      if (avg >= 95) {
        level = 'Mastery';
        xp = window.__CONFIG__.xp.L3;
      } else if (avg >= 85) {
        level = 'Proficient';
        xp = window.__CONFIG__.xp.L2;
      }

      document.getElementById('totalXP').textContent = xp + ' XP';
      document.getElementById('proficiencyLevel').textContent = level;
      document.getElementById('resultDetails').textContent = 
        \`You scored an average of \${Math.round(avg)}% across all competencies. Great work!\`;
      
      showScene('scene-results');
    }

    function showConfetti() {
      for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.background = ['#667eea', '#764ba2', '#f093fb', '#4facfe'][Math.floor(Math.random() * 4)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 3000);
      }
    }
  </script>
</body>
</html>`;
}
