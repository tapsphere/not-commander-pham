import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

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

    const MAX_SIZE = 15 * 1024 * 1024; // 15 MB limit for base64 in memory
    console.log('Parsing document:', file.name, 'Type:', file.type, 'Size:', file.size);

    if (file.size > MAX_SIZE) {
      console.warn('File too large for in-memory processing:', file.size);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum supported size is 15 MB. Please compress or split the PDF and try again.`,
          content: '',
          filename: file.name 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert file to base64 for AI processing
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to base64 in chunks to avoid stack overflow on large files
    const chunkSize = 8192;
    let binary = '';
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    const base64 = btoa(binary);
    const dataUrl = `data:${file.type};base64,${base64}`;

    console.log('Sending document to Lovable AI for extraction...');

    // Use Lovable AI to extract text from PDF/DOCX
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a document text extractor. Extract all text content from the provided document in a clean, structured format. Preserve headings, paragraphs, and lists. Return only the extracted text, no commentary.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all text content from this document:'
              },
              {
                type: 'image_url',
                image_url: {
                  url: dataUrl
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI extraction failed:', response.status, errorText);
      throw new Error(`AI extraction failed: ${response.status}`);
    }

    const data = await response.json();
    const extractedText = data.choices[0].message.content;

    console.log('AI extraction successful. Text length:', extractedText.length);

    // Limit to 50,000 characters
    let finalText = extractedText;
    if (finalText.length > 50000) {
      console.log('Truncating text from', finalText.length, 'to 50000 characters');
      finalText = finalText.substring(0, 50000) + '\n\n[Content truncated due to length]';
    }

    if (!finalText || finalText.length < 50) {
      console.warn('Extracted text too short:', finalText.length, 'characters');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Could not extract meaningful text from document. Please ensure the PDF is not scanned or image-based.',
          content: '',
          filename: file.name 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        text: finalText,
        filename: file.name,
        length: finalText.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error parsing document:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

