import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PublishRequest {
  template_id: string
}

interface GameConfig {
  scenario?: {
    duration_s?: number
  }
  scoring?: {
    accuracy_thresholds?: {
      L2?: number
      L3?: number
    }
    edge_threshold?: number
    time_limits?: {
      limit?: number
      tight?: number
    }
    sessions_required?: number
  }
  assets?: {
    theme?: any
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      console.error('Auth error:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const { template_id } = await req.json() as PublishRequest

    console.log('Publishing template:', template_id)

    // Get template
    const { data: template, error: templateError } = await supabaseClient
      .from('game_templates')
      .select('*')
      .eq('id', template_id)
      .eq('creator_id', user.id)
      .single()

    if (templateError || !template) {
      console.error('Template error:', templateError)
      return new Response(
        JSON.stringify({ error: 'Template not found or unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Parse game config
    const config = template.game_config as GameConfig || {}
    const duration = config.scenario?.duration_s || 90
    const scoring = config.scoring || {}

    // Determine time limits based on duration
    let timeLimit = duration
    let timeTight = duration
    
    if (duration <= 60) {
      timeLimit = 60
      timeTight = 45
    } else if (duration <= 90) {
      timeLimit = 90
      timeTight = 75
    } else {
      timeLimit = 120
      timeTight = 100
    }

    // Override with custom values if provided
    if (scoring.time_limits?.limit) timeLimit = scoring.time_limits.limit
    if (scoring.time_limits?.tight) timeTight = scoring.time_limits.tight

    const accuracyL2 = scoring.accuracy_thresholds?.L2 || 0.90
    const accuracyL3 = scoring.accuracy_thresholds?.L3 || 0.95
    const edgeThreshold = scoring.edge_threshold || 0.80
    const sessionsRequired = scoring.sessions_required || 3

    // Generate stable seed for testing mode
    const encoder = new TextEncoder()
    const data = encoder.encode(`${template_id}v1`)
    const hashBuffer = await crypto.subtle.digest('SHA-1', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const seed = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16)

    const uiTheme = config.assets?.theme || {}

    // Create training mode runtime
    const trainingRuntime = {
      template_id: template_id,
      mode: 'training',
      seed: null,
      randomize: true,
      feedback_mode: 'learning',
      proof_log: false,
      attempts: 'unlimited',
      time_limit_s: timeLimit,
      accuracy_threshold: accuracyL2,
      edge_threshold: edgeThreshold,
      sessions_required: sessionsRequired,
      ui_theme: uiTheme,
    }

    // Create testing mode runtime
    const testingRuntime = {
      template_id: template_id,
      mode: 'testing',
      seed: seed,
      randomize: false,
      feedback_mode: 'scoring',
      proof_log: true,
      attempts: '1',
      time_limit_s: timeLimit,
      accuracy_threshold: accuracyL2,
      edge_threshold: edgeThreshold,
      sessions_required: sessionsRequired,
      ui_theme: uiTheme,
    }

    console.log('Creating training runtime:', trainingRuntime)
    console.log('Creating testing runtime:', testingRuntime)

    // Insert both runtimes (using upsert to handle re-publishing)
    const { data: runtimes, error: runtimeError } = await supabaseClient
      .from('validators_runtime')
      .upsert([trainingRuntime, testingRuntime], {
        onConflict: 'template_id,mode'
      })
      .select()

    if (runtimeError) {
      console.error('Runtime creation error:', runtimeError)
      return new Response(
        JSON.stringify({ error: 'Failed to create runtime validators', details: runtimeError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Update template to published
    const { error: updateError } = await supabaseClient
      .from('game_templates')
      .update({ is_published: true })
      .eq('id', template_id)

    if (updateError) {
      console.error('Template update error:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update template status' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('Successfully published template with runtimes:', runtimes)

    return new Response(
      JSON.stringify({ 
        success: true, 
        runtimes,
        training_id: runtimes?.find(r => r.mode === 'training')?.id,
        testing_id: runtimes?.find(r => r.mode === 'testing')?.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
