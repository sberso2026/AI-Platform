-- Batch 39: Meeting Intelligence processing, realtime ordering, minutes/proposal extensions
-- Phase 6C-3C. Does not alter Document Intelligence baseline migrations.

ALTER TABLE project_intelligence_transcript_segments
  ADD COLUMN IF NOT EXISTS logical_sequence INTEGER,
  ADD COLUMN IF NOT EXISTS provider_sequence INTEGER,
  ADD COLUMN IF NOT EXISTS provider_timestamp TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS server_received_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS normalized_text TEXT,
  ADD COLUMN IF NOT EXISTS normalization_version TEXT,
  ADD COLUMN IF NOT EXISTS normalization_warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS content_checksum TEXT;

UPDATE project_intelligence_transcript_segments
SET
  logical_sequence = COALESCE(logical_sequence, sequence_number),
  server_received_at = COALESCE(server_received_at, created_at)
WHERE logical_sequence IS NULL OR server_received_at IS NULL;

ALTER TABLE project_intelligence_transcript_segments
  ALTER COLUMN logical_sequence SET NOT NULL,
  ALTER COLUMN server_received_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pi_transcript_segments_logical
  ON project_intelligence_transcript_segments(meeting_session_id, logical_sequence, revision_number);

ALTER TABLE project_intelligence_meeting_processing_runs
  ADD COLUMN IF NOT EXISTS processing_version TEXT,
  ADD COLUMN IF NOT EXISTS transcript_revision_checksum TEXT,
  ADD COLUMN IF NOT EXISTS meeting_state_version INTEGER,
  ADD COLUMN IF NOT EXISTS model TEXT,
  ADD COLUMN IF NOT EXISTS prompt_version TEXT,
  ADD COLUMN IF NOT EXISTS evidence_version TEXT,
  ADD COLUMN IF NOT EXISTS generated_by TEXT,
  ADD COLUMN IF NOT EXISTS error_code TEXT,
  ADD COLUMN IF NOT EXISTS error_message TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uidx_pi_meeting_active_processing_run
  ON project_intelligence_meeting_processing_runs(meeting_session_id)
  WHERE status IN ('queued', 'claimed', 'running', 'retry_pending');

ALTER TABLE project_intelligence_meeting_jobs
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
  ADD COLUMN IF NOT EXISTS processing_run_id UUID REFERENCES project_intelligence_meeting_processing_runs(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uidx_pi_meeting_jobs_idempotency
  ON project_intelligence_meeting_jobs(idempotency_key)
  WHERE idempotency_key IS NOT NULL;

ALTER TABLE project_intelligence_meeting_proposals
  ADD COLUMN IF NOT EXISTS engineering_project_id UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS owner_candidate TEXT,
  ADD COLUMN IF NOT EXISTS due_date_candidate DATE,
  ADD COLUMN IF NOT EXISTS priority TEXT,
  ADD COLUMN IF NOT EXISTS severity TEXT,
  ADD COLUMN IF NOT EXISTS transcript_segment_ids UUID[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS start_time_ms INTEGER,
  ADD COLUMN IF NOT EXISTS end_time_ms INTEGER,
  ADD COLUMN IF NOT EXISTS speaker_ids TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS document_citations JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS processing_run_id UUID REFERENCES project_intelligence_meeting_processing_runs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS core_record_id UUID,
  ADD COLUMN IF NOT EXISTS core_record_type TEXT,
  ADD COLUMN IF NOT EXISTS meeting_state_version INTEGER;

UPDATE project_intelligence_meeting_proposals
SET review_state = 'proposed'
WHERE review_state = 'pending';

ALTER TABLE project_intelligence_meeting_minutes
  ADD COLUMN IF NOT EXISTS processing_run_id UUID REFERENCES project_intelligence_meeting_processing_runs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS issued_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS issued_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE project_intelligence_meeting_minutes_versions
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS content_format TEXT NOT NULL DEFAULT 'markdown+json',
  ADD COLUMN IF NOT EXISTS source_transcript_revision TEXT,
  ADD COLUMN IF NOT EXISTS processing_run_id UUID REFERENCES project_intelligence_meeting_processing_runs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS model TEXT,
  ADD COLUMN IF NOT EXISTS prompt_version TEXT,
  ADD COLUMN IF NOT EXISTS content_hash TEXT,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS issued_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS superseded_by UUID REFERENCES project_intelligence_meeting_minutes_versions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS meeting_state_version INTEGER;

ALTER TABLE project_intelligence_meeting_evidence
  ADD COLUMN IF NOT EXISTS processing_run_id UUID REFERENCES project_intelligence_meeting_processing_runs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS evidence_version TEXT,
  ADD COLUMN IF NOT EXISTS retrieval_trace_id TEXT;

-- Claim jobs with SKIP LOCKED (service role / SECURITY DEFINER)
CREATE OR REPLACE FUNCTION pi_meeting_claim_jobs(
  p_worker_id TEXT,
  p_limit INTEGER DEFAULT 5,
  p_lease_seconds INTEGER DEFAULT 180
)
RETURNS SETOF project_intelligence_meeting_jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH candidate AS (
    SELECT j.id
    FROM project_intelligence_meeting_jobs j
    WHERE j.status IN ('queued', 'retry_pending')
      AND j.available_at <= now()
      AND (j.lease_expires_at IS NULL OR j.lease_expires_at < now())
    ORDER BY j.available_at ASC, j.created_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 5), 20))
  ),
  updated AS (
    UPDATE project_intelligence_meeting_jobs j
    SET
      status = 'claimed',
      locked_by = p_worker_id,
      locked_at = now(),
      lease_expires_at = now() + make_interval(secs => GREATEST(30, LEAST(COALESCE(p_lease_seconds, 180), 900))),
      attempt_count = j.attempt_count + 1,
      updated_at = now()
    FROM candidate c
    WHERE j.id = c.id
    RETURNING j.*
  )
  SELECT * FROM updated;
END;
$$;

CREATE OR REPLACE FUNCTION pi_meeting_release_expired_leases()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n INTEGER;
BEGIN
  UPDATE project_intelligence_meeting_jobs
  SET
    status = CASE WHEN attempt_count >= max_attempts THEN 'dead_letter' ELSE 'retry_pending' END,
    available_at = now() + interval '15 seconds',
    locked_by = NULL,
    locked_at = NULL,
    lease_expires_at = NULL,
    updated_at = now()
  WHERE status IN ('claimed', 'running')
    AND lease_expires_at IS NOT NULL
    AND lease_expires_at < now();
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;

REVOKE ALL ON FUNCTION pi_meeting_claim_jobs(TEXT, INTEGER, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION pi_meeting_release_expired_leases() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION pi_meeting_claim_jobs(TEXT, INTEGER, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION pi_meeting_release_expired_leases() TO service_role;
