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
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For PDF/DOCX files, extract text using basic parsing
    // This is a simplified version - in production you'd use a proper parser
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to text (this is very basic - real PDF parsing would need pdf-parse or similar)
    const decoder = new TextDecoder('utf-8', { fatal: false });
    let content = decoder.decode(uint8Array);
    
    // Clean up the content - remove control characters and normalize whitespace
    content = content
      .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ') // Remove control characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    // Extract readable text (very basic heuristic)
    const words = content.split(/\s+/).filter(word => {
      // Keep words that are mostly alphanumeric
      const alphanumeric = word.match(/[a-zA-Z0-9]/g);
      return alphanumeric && alphanumeric.length > word.length * 0.5;
    });
    
    const extractedText = words.join(' ').substring(0, 10000); // Limit to 10k chars

    return new Response(
      JSON.stringify({ 
        success: true, 
        content: extractedText,
        filename: file.name 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error parsing document:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

