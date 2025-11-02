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
    const { brandName, courseName, courseDescription, learningObjectives, primaryColor, secondaryColor, logoUrl, mascotUrl } = await req.json();
    
    console.log('Generating branded game for:', brandName, courseName);

    // Generate the HTML game using the demo template with custom branding
    const html = await generateBrandedGameHTML({ 
      brandName, 
      courseName, 
      primaryColor, 
      secondaryColor, 
      logoUrl, 
      mascotUrl 
    });

    return new Response(
      JSON.stringify({ html }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error generating game:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function generateBrandedGameHTML(branding: {
  brandName: string;
  courseName: string;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  mascotUrl?: string;
}): Promise<string> {
  const primaryColor = branding.primaryColor || '#0078D4';
  const secondaryColor = branding.secondaryColor || '#50E6FF';
  
  console.log('Fetching demo template...');
  
  // Fetch the actual game HTML from the public URL
  const demoUrl = 'https://188e4cad-de5e-49fb-8008-62d777ec2103.lovableproject.com/demo/demo-crisis-communication.html';
  const response = await fetch(demoUrl);
  
  if (!response.ok) {
    console.error('Failed to fetch demo:', response.status, response.statusText);
    throw new Error(`Failed to fetch demo template: ${response.status}`);
  }
  
  const demoHTML = await response.text();
  console.log('Demo HTML fetched, length:', demoHTML.length);
  
  // Verify we got the actual game HTML and not a redirect page
  if (!demoHTML.includes('Microsoft Teams: The Onboarding') || demoHTML.length < 5000) {
    console.error('Fetched HTML appears to be incorrect. Length:', demoHTML.length);
    throw new Error('Failed to fetch correct demo template');
  }
  
  // Replace CSS color variables
  let customHTML = demoHTML
    .replace(/--primary:\s*#0078D4/g, `--primary: ${primaryColor}`)
    .replace(/--secondary:\s*#50E6FF/g, `--secondary: ${secondaryColor}`);
  
  // Replace title with custom brand and course names
  customHTML = customHTML
    .replace(/<title>.*?<\/title>/, `<title>${branding.brandName} - ${branding.courseName}</title>`)
    .replace(/Microsoft Teams: The Onboarding/g, `${branding.brandName}: ${branding.courseName}`);
  
  // Replace the Microsoft logo in loading screen with custom logo if provided
  if (branding.logoUrl) {
    // Replace the loading screen logo
    customHTML = customHTML.replace(
      /<img src="\.\.\/microsoft-logo\.png"[^>]*>/,
      `<img src="${branding.logoUrl}" alt="${branding.brandName}" style="width: 120px; height: auto; margin-bottom: 20px; animation: logoFloat 2s ease-in-out infinite;" />`
    );
    
    // Also add a persistent logo in the top left
    const logoHTML = `
    <style>
      .custom-brand-logo {
        position: fixed;
        top: 20px;
        left: 20px;
        max-height: 60px;
        max-width: 180px;
        object-fit: contain;
        z-index: 10000;
        background: rgba(10, 10, 10, 0.8);
        padding: 10px;
        border-radius: 12px;
        border: 2px solid ${primaryColor};
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      }
    </style>
    <img src="${branding.logoUrl}" alt="${branding.brandName}" class="custom-brand-logo" />`;
    customHTML = customHTML.replace('<body>', `<body>${logoHTML}`);
  }
  
  // Add custom mascot if provided - replace the lottie animation in the intro screen
  if (branding.mascotUrl) {
    // Check if it's a Lottie animation (JSON) or a regular image
    const isLottie = branding.mascotUrl.includes('.json') || branding.mascotUrl.startsWith('data:application/json');
    
    if (isLottie) {
      // Update the lottie-player src
      customHTML = customHTML.replace(
        /<lottie-player[^>]*src="[^"]*"([^>]*)>/,
        `<lottie-player class="intro-animation" src="${branding.mascotUrl}" background="transparent" speed="1" loop autoplay$1>`
      );
    } else {
      // Replace with an img tag
      customHTML = customHTML.replace(
        /<lottie-player[\s\S]*?<\/lottie-player>/,
        `<img src="${branding.mascotUrl}" alt="Game Mascot" class="intro-animation" style="object-fit: contain;" />`
      );
    }
  }
  
  console.log('Branded HTML generated successfully');
  return customHTML;
}
