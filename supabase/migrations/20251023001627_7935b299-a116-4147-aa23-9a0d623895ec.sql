-- Create validators_runtime table for compiled game modes
CREATE TABLE public.validators_runtime (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.game_templates(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('training', 'testing')),
  seed TEXT,
  randomize BOOLEAN NOT NULL DEFAULT false,
  feedback_mode TEXT NOT NULL CHECK (feedback_mode IN ('learning', 'scoring')),
  proof_log BOOLEAN NOT NULL DEFAULT false,
  attempts TEXT NOT NULL DEFAULT '1',
  time_limit_s INTEGER,
  accuracy_threshold DECIMAL(3,2) DEFAULT 0.90,
  edge_threshold DECIMAL(3,2) DEFAULT 0.80,
  sessions_required INTEGER DEFAULT 3,
  ui_theme JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(template_id, mode)
);

-- Create sessions table for game play records
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  runtime_id UUID NOT NULL REFERENCES public.validators_runtime(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('training', 'testing')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE,
  accuracy DECIMAL(5,4),
  time_s INTEGER,
  edge_score DECIMAL(5,4),
  passed BOOLEAN,
  level INTEGER CHECK (level IN (1, 2, 3)),
  metrics JSONB DEFAULT '{}'::jsonb
);

-- Create learning_events table for training mode feedback
CREATE TABLE public.learning_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  ts TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create proof_ledger table for testing mode receipts
CREATE TABLE public.proof_ledger (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  proof_receipt_json JSONB NOT NULL,
  xp_awarded INTEGER NOT NULL,
  chain_tx_id TEXT,
  ts TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.validators_runtime ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proof_ledger ENABLE ROW LEVEL SECURITY;

-- RLS Policies for validators_runtime
CREATE POLICY "Anyone can view published runtime validators"
ON public.validators_runtime FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.game_templates
    WHERE game_templates.id = validators_runtime.template_id
    AND game_templates.is_published = true
  )
);

CREATE POLICY "Creators can view own runtime validators"
ON public.validators_runtime FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.game_templates
    WHERE game_templates.id = validators_runtime.template_id
    AND game_templates.creator_id = auth.uid()
  )
);

-- RLS Policies for sessions
CREATE POLICY "Users can create own sessions"
ON public.sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions"
ON public.sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
ON public.sessions FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for learning_events
CREATE POLICY "Users can create learning events for own sessions"
ON public.learning_events FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sessions
    WHERE sessions.id = learning_events.session_id
    AND sessions.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view own learning events"
ON public.learning_events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.sessions
    WHERE sessions.id = learning_events.session_id
    AND sessions.user_id = auth.uid()
  )
);

-- RLS Policies for proof_ledger
CREATE POLICY "Users can view own proofs"
ON public.proof_ledger FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.sessions
    WHERE sessions.id = proof_ledger.session_id
    AND sessions.user_id = auth.uid()
  )
);

CREATE POLICY "System can create proofs"
ON public.proof_ledger FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sessions
    WHERE sessions.id = proof_ledger.session_id
  )
);

-- Create indexes for performance
CREATE INDEX idx_validators_runtime_template ON public.validators_runtime(template_id);
CREATE INDEX idx_sessions_user ON public.sessions(user_id);
CREATE INDEX idx_sessions_runtime ON public.sessions(runtime_id);
CREATE INDEX idx_learning_events_session ON public.learning_events(session_id);
CREATE INDEX idx_proof_ledger_session ON public.proof_ledger(session_id);