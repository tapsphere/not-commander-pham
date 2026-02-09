import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ZipReader, BlobReader, TextWriter, BlobWriter } from "https://deno.land/x/zipjs@v2.7.34/index.js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const MAX_SIZE = 15 * 1024 * 1024; // 15 MB per individual file

function toBase64(uint8: Uint8Array): string {
  const chunkSize = 8192;
  let binary = '';
  for (let i = 0; i < uint8.length; i += chunkSize) {
    const chunk = uint8.subarray(i, Math.min(i + chunkSize, uint8.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

async function extractTextWithAI(fileBytes: Uint8Array, mimeType: string): Promise<string> {
  const base64 = toBase64(fileBytes);
  const dataUrl = `data:${mimeType};base64,${base64}`;

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
            { type: 'text', text: 'Extract all text content from this document:' },
            { type: 'image_url', image_url: { url: dataUrl } }
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
  return data.choices[0].message.content;
}

const SUPPORTED_MIME = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const SUPPORTED_EXT = ['.pdf', '.docx', '.txt', '.md'];

function isTextFile(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.endsWith('.txt') || lower.endsWith('.md') || lower.endsWith('.csv');
}

function isSupportedDoc(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.endsWith('.pdf') || lower.endsWith('.docx');
}

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

    console.log('Parsing document:', file.name, 'Type:', file.type, 'Size:', file.size);

    const isZip = file.type === 'application/zip' || file.type === 'application/x-zip-compressed' || file.name.toLowerCase().endsWith('.zip');

    if (isZip) {
      // --- ZIP handling ---
      console.log('Processing ZIP file...');
      const zipBlob = new Blob([await file.arrayBuffer()]);
      const reader = new ZipReader(new BlobReader(zipBlob));
      const entries = await reader.getEntries();

      const textParts: string[] = [];
      let processedCount = 0;

      for (const entry of entries) {
        if (entry.directory) continue;
        const name = entry.filename;

        // Skip hidden/system files
        if (name.startsWith('__MACOSX') || name.startsWith('.')) continue;

        if (isTextFile(name)) {
          // Read text files directly
          const text = await entry.getData!(new TextWriter());
          if (text && text.trim().length > 10) {
            textParts.push(`\n--- ${name} ---\n${text.trim()}`);
            processedCount++;
            console.log('Extracted text file:', name, text.length, 'chars');
          }
        } else if (isSupportedDoc(name)) {
          // Extract binary doc and send to AI
          const blob = await entry.getData!(new BlobWriter());
          const buf = await blob.arrayBuffer();
          const bytes = new Uint8Array(buf);

          if (bytes.length > MAX_SIZE) {
            console.warn('Skipping large file in ZIP:', name, bytes.length);
            textParts.push(`\n--- ${name} ---\n[Skipped: file exceeds 15 MB limit]`);
            continue;
          }

          const mime = name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          console.log('Extracting text from:', name, bytes.length, 'bytes');
          const extracted = await extractTextWithAI(bytes, mime);
          if (extracted && extracted.trim().length > 10) {
            textParts.push(`\n--- ${name} ---\n${extracted.trim()}`);
            processedCount++;
          }
        } else {
          console.log('Skipping unsupported file in ZIP:', name);
        }
      }

      await reader.close();

      if (processedCount === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'No readable documents found in ZIP. Include PDF, DOCX, TXT, or MD files.',
            content: '',
            filename: file.name,
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let finalText = textParts.join('\n\n');
      if (finalText.length > 50000) {
        finalText = finalText.substring(0, 50000) + '\n\n[Content truncated due to length]';
      }

      console.log('ZIP extraction complete.', processedCount, 'files,', finalText.length, 'chars');

      return new Response(
        JSON.stringify({
          success: true,
          text: finalText,
          filename: file.name,
          length: finalText.length,
          filesProcessed: processedCount,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // --- Single file handling ---
    if (file.size > MAX_SIZE) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum supported size is 15 MB. Please compress or split the file and try again.`,
          content: '',
          filename: file.name 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    console.log('Sending document to Lovable AI for extraction...');
    const extractedText = await extractTextWithAI(uint8Array, file.type);

    console.log('AI extraction successful. Text length:', extractedText.length);

    let finalText = extractedText;
    if (finalText.length > 50000) {
      finalText = finalText.substring(0, 50000) + '\n\n[Content truncated due to length]';
    }

    if (!finalText || finalText.length < 50) {
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
