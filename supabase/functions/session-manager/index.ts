import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StartSessionRequest {
  action: 'start'
  runtime_id: string
}

interface EventRequest {
  action: 'event'
  session_id: string
  event_type: string
  payload: any
}

interface FinishSessionRequest {
  action: 'finish'
  session_id: string
  accuracy: number
  time_s: number
  edge_score: number
  metrics?: any
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

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const body = await req.json()
    const { action } = body

    // START SESSION
    if (action === 'start') {
      const { runtime_id } = body as StartSessionRequest

      // Get runtime config
      const { data: runtime, error: runtimeError } = await supabaseClient
        .from('validators_runtime')
        .select('*')
        .eq('id', runtime_id)
        .single()

      if (runtimeError || !runtime) {
        return new Response(
          JSON.stringify({ error: 'Runtime not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        )
      }

      // Create session
      const { data: session, error: sessionError } = await supabaseClient
        .from('sessions')
        .insert({
          user_id: user.id,
          runtime_id: runtime_id,
          mode: runtime.mode,
        })
        .select()
        .single()

      if (sessionError) {
        console.error('Session creation error:', sessionError)
        return new Response(
          JSON.stringify({ error: 'Failed to create session' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      return new Response(
        JSON.stringify({ session, runtime }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // LOG EVENT (Training mode)
    if (action === 'event') {
      const { session_id, event_type, payload } = body as EventRequest

      // Verify session belongs to user
      const { data: session, error: sessionError } = await supabaseClient
        .from('sessions')
        .select('*')
        .eq('id', session_id)
        .eq('user_id', user.id)
        .single()

      if (sessionError || !session) {
        return new Response(
          JSON.stringify({ error: 'Session not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        )
      }

      // Log event
      const { error: eventError } = await supabaseClient
        .from('learning_events')
        .insert({
          session_id,
          event_type,
          payload,
        })

      if (eventError) {
        console.error('Event logging error:', eventError)
        return new Response(
          JSON.stringify({ error: 'Failed to log event' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // FINISH SESSION
    if (action === 'finish') {
      const { session_id, accuracy, time_s, edge_score, metrics } = body as FinishSessionRequest

      // Get session with runtime config
      const { data: session, error: sessionError } = await supabaseClient
        .from('sessions')
        .select('*, validators_runtime(*)')
        .eq('id', session_id)
        .eq('user_id', user.id)
        .single()

      if (sessionError || !session) {
        return new Response(
          JSON.stringify({ error: 'Session not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        )
      }

      const runtime = session.validators_runtime

      // Calculate level and pass status using hybrid logic
      let level = 1
      let passed = false
      const sessionsRequired = runtime.sessions_required || 3

      // Count user's previous completed sessions for this runtime
      const { count: sessionCount } = await supabaseClient
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('runtime_id', runtime.id)
        .not('finished_at', 'is', null)

      const totalSessions = (sessionCount || 0) + 1 // including current session

      // Level 1: Needs Work (default)
      if (accuracy < 0.85 || time_s > runtime.time_limit_s) {
        level = 1
        passed = false
      }
      // Level 2: Proficient
      else if (accuracy >= 0.90 && time_s <= runtime.time_limit_s) {
        level = 2
        passed = true
      }
      // Level 3: Mastery (requires multiple sessions, high accuracy, speed, and edge handling)
      if (
        accuracy >= 0.95 &&
        time_s <= (runtime.time_limit_s * 0.83) && // Tight time (75s for 90s limit)
        edge_score >= runtime.edge_threshold &&
        totalSessions >= sessionsRequired
      ) {
        level = 3
        passed = true
      }

      // Update session
      const { error: updateError } = await supabaseClient
        .from('sessions')
        .update({
          finished_at: new Date().toISOString(),
          accuracy,
          time_s,
          edge_score,
          passed,
          level,
          metrics: metrics || {},
        })
        .eq('id', session_id)

      if (updateError) {
        console.error('Session update error:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update session' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      // If testing mode and passed, create proof receipt
      let proof = null
      let xp = 0

      if (runtime.mode === 'testing' && passed) {
        // Calculate XP based on level
        if (level === 1) xp = 100
        else if (level === 2) xp = 250
        else if (level === 3) xp = 500

        // Get template info
        const { data: template } = await supabaseClient
          .from('game_templates')
          .select('*, master_competencies(name), sub_competencies(statement)')
          .eq('id', runtime.template_id)
          .single()

        // Generate proof receipt
        const receiptId = `PRF-${crypto.randomUUID().substring(0, 8).toUpperCase()}`
        const receipt = {
          receipt_id: receiptId,
          user_id: user.id,
          template_id: runtime.template_id,
          sub_competency: template?.sub_competencies?.[0]?.statement || 'Unknown',
          level,
          metrics: {
            accuracy,
            time_s,
            edge_score,
            sessions: totalSessions,
          },
          timestamp: new Date().toISOString(),
        }

        // Insert proof
        const { data: proofData, error: proofError } = await supabaseClient
          .from('proof_ledger')
          .insert({
            session_id,
            proof_receipt_json: receipt,
            xp_awarded: xp,
          })
          .select()
          .single()

        if (proofError) {
          console.error('Proof creation error:', proofError)
        } else {
          proof = proofData
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          level,
          passed,
          xp,
          proof,
          mode: runtime.mode,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
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
