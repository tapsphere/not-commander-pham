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
  
  // Read the demo HTML file
  const demoPath = new URL('../../../public/demo/demo-crisis-communication.html', import.meta.url);
  const demoHTML = await Deno.readTextFile(demoPath);
  
  // Replace CSS color variables
  let customHTML = demoHTML
    .replace(/--primary:\s*#0078D4/g, `--primary: ${primaryColor}`)
    .replace(/--secondary:\s*#50E6FF/g, `--secondary: ${secondaryColor}`);
  
  // Replace title with custom brand and course names
  customHTML = customHTML
    .replace(/<title>.*?<\/title>/, `<title>${branding.brandName} - ${branding.courseName}</title>`)
    .replace(/Microsoft Teams: The Onboarding/g, `${branding.brandName}: ${branding.courseName}`);
  
  // Add custom logo if provided
  if (branding.logoUrl) {
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
  
  // Add custom mascot if provided - only in the scene-intro (game directions scene)
  if (branding.mascotUrl) {
    // Find the scene-intro section and replace only the Lottie player within it
    customHTML = customHTML.replace(
      /(<div[^>]*id="scene-intro"[^>]*>[\s\S]*?)(<lottie-player[\s\S]*?<\/lottie-player>)/,
      `$1<img src="${branding.mascotUrl}" alt="Game Mascot" style="width: 300px; height: 300px; object-fit: contain; margin: 0 auto 20px;" />`
    );
  }
  
  return customHTML;
}
