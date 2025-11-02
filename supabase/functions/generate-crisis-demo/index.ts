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
  
  // Fetch the demo HTML file from the deployed public URL
  const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/functions/v1', '') || '';
  const demoUrl = `${baseUrl}/demo/demo-crisis-communication.html`;
  console.log('Fetching demo from:', demoUrl);
  
  const response = await fetch(demoUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch demo template: ${response.status} ${response.statusText}`);
  }
  const demoHTML = await response.text();
  
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
    // Check if it's a Lottie animation (JSON data URL) or an image
    const isLottie = branding.mascotUrl.startsWith('data:application/json');
    
    if (isLottie) {
      // For Lottie animations, update the existing lottie-player src
      customHTML = customHTML.replace(
        /(<div[^>]*id="scene-intro"[^>]*>[\s\S]*?<lottie-player[^>]*src=")([^"]*?)("[\s\S]*?<\/lottie-player>)/,
        `$1${branding.mascotUrl}$3`
      );
    } else {
      // For images, replace the Lottie player with an img tag
      customHTML = customHTML.replace(
        /(<div[^>]*id="scene-intro"[^>]*>[\s\S]*?)(<lottie-player[\s\S]*?<\/lottie-player>)/,
        `$1<img src="${branding.mascotUrl}" alt="Game Mascot" style="width: 300px; height: 300px; object-fit: contain; margin: 0 auto 20px;" />`
      );
    }
  }
  
  return customHTML;
}
