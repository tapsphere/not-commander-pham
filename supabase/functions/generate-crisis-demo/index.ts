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
  
  console.log('Fetching demo template from Supabase storage...');
  
  // Fetch from Supabase storage instead of project URL
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const storageUrl = `${supabaseUrl}/storage/v1/object/public/custom-games/demo-crisis-template.html`;
  
  console.log('Fetching from:', storageUrl);
  const response = await fetch(storageUrl);
  
  if (!response.ok) {
    console.error('Failed to fetch demo from storage:', response.status, response.statusText);
    throw new Error(`Failed to fetch demo template from storage: ${response.status}. Please ensure the template is uploaded.`);
  }
  
  const demoHTML = await response.text();
  console.log('Demo HTML fetched from storage, length:', demoHTML.length);
  
  // Replace CSS color variables
  let customHTML = demoHTML
    .replace(/--primary:\s*#0078D4/g, `--primary: ${primaryColor}`)
    .replace(/--secondary:\s*#50E6FF/g, `--secondary: ${secondaryColor}`);
  
  // Inject mobile-optimized card styles
  const mobileStyles = `
    <style>
      /* Mobile-optimized card styles */
      .card-pile {
        grid-template-columns: repeat(auto-fit, minmax(min(160px, 100%), 1fr)) !important;
        gap: 8px !important;
      }
      
      .task-card {
        padding: 10px !important;
      }
      
      .card-emoji {
        font-size: 24px !important;
        margin-bottom: 6px !important;
      }
      
      .card-text {
        font-size: 11px !important;
        line-height: 1.3 !important;
      }
      
      .resource-cards,
      .action-cards {
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)) !important;
        gap: 8px !important;
      }
      
      .resource-card,
      .action-card {
        padding: 10px !important;
        gap: 6px !important;
      }
      
      .resource-card .card-emoji,
      .action-card .card-emoji {
        font-size: 20px !important;
      }
      
      .resource-card .card-text,
      .action-card .card-text {
        font-size: 11px !important;
      }
      
      .priority-slot {
        min-width: 120px !important;
        min-height: 120px !important;
        padding: 8px !important;
      }
      
      @media (max-width: 768px) {
        .drop-zone,
        .resource-drop-zone,
        .feedback-drop-zone {
          padding: 16px !important;
          min-height: 120px !important;
        }
        
        .folder-icon,
        .resource-icon,
        .feedback-icon {
          font-size: 40px !important;
        }
      }
    </style>
  `;
  
  customHTML = customHTML.replace('</head>', `${mobileStyles}</head>`);
  
  // Replace title with custom brand and course names
  customHTML = customHTML
    .replace(/<title>.*?<\/title>/, `<title>${branding.brandName} - ${branding.courseName}</title>`)
    .replace(/Microsoft Teams: The Onboarding/g, `${branding.brandName}: ${branding.courseName}`);
  
  // ALWAYS replace the loading screen logo with custom logo
  if (branding.logoUrl) {
    // Replace the loading screen logo
    customHTML = customHTML.replace(
      /<img src="\.\.\/microsoft-logo\.png"[^>]*>/,
      `<img src="${branding.logoUrl}" alt="${branding.brandName}" style="width: 120px; height: auto; margin-bottom: 20px; animation: logoFloat 2s ease-in-out infinite;" />`
    );
  }
  
  // Add mascot space ABOVE direction page instructions
  if (branding.mascotUrl) {
    // Check if it's a Lottie animation (JSON) or a regular image
    const isLottie = branding.mascotUrl.includes('.json') || branding.mascotUrl.startsWith('data:application/json');
    
    // Inject mascot container styles
    const mascotStyles = `
      <style>
        .mascot-container {
          width: 100%;
          max-width: 300px;
          height: 200px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .mascot-container img,
        .mascot-container lottie-player {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        
        @media (max-width: 768px) {
          .mascot-container {
            max-width: 200px;
            height: 150px;
          }
        }
      </style>
    `;
    
    customHTML = customHTML.replace('</head>', `${mascotStyles}</head>`);
    
    // Create mascot HTML
    let mascotHTML = '';
    if (isLottie) {
      mascotHTML = `<div class="mascot-container"><lottie-player src="${branding.mascotUrl}" background="transparent" speed="1" loop autoplay style="width: 100%; height: 100%;"></lottie-player></div>`;
    } else {
      mascotHTML = `<div class="mascot-container"><img src="${branding.mascotUrl}" alt="${branding.brandName} Mascot" /></div>`;
    }
    
    // Inject mascot ABOVE the intro content (directions/instructions)
    // Look for common intro patterns and inject before them
    customHTML = customHTML.replace(
      /(<div[^>]*class="[^"]*intro[^"]*"[^>]*>[\s\S]*?)(<h[12][^>]*>|<p[^>]*class="[^"]*(?:instructions|directions|intro-text)[^"]*")/i,
      `$1${mascotHTML}$2`
    );
  }
  
  console.log('Branded HTML generated successfully');
  return customHTML;
}
