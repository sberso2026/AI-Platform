-- Fix pi_document_claim_jobs: one worker lease row cannot be upserted once per claimed job
-- in a single statement (PostgreSQL: ON CONFLICT DO UPDATE cannot affect row a second time).

CREATE OR REPLACE FUNCTION pi_document_claim_jobs(
  p_worker_id TEXT,
  p_limit INT,
  p_lease_seconds INT DEFAULT 120
)
RETURNS SETOF project_intelligence_document_jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_lease_seconds INT := GREATEST(COALESCE(p_lease_seconds, 120), 15);
  v_limit INT := GREATEST(LEAST(COALESCE(p_limit, 1), 100), 1);
BEGIN
  IF p_worker_id IS NULL OR length(trim(p_worker_id)) = 0 THEN
    RAISE EXCEPTION 'p_worker_id is required';
  END IF;

  RETURN QUERY
  WITH candidates AS (
    SELECT j.id
    FROM project_intelligence_document_jobs j
    WHERE j.deleted_at IS NULL
      AND j.status IN ('queued', 'retry_pending')
      AND j.available_at <= NOW()
      AND j.attempt_count < j.max_attempts
      AND (j.lease_expires_at IS NULL OR j.lease_expires_at < NOW())
    ORDER BY j.priority ASC, j.available_at ASC, j.created_at ASC
    FOR UPDATE OF j SKIP LOCKED
    LIMIT v_limit
  ),
  claimed AS (
    UPDATE project_intelligence_document_jobs j
    SET status = 'claimed',
        locked_by = p_worker_id,
        locked_at = NOW(),
        lease_expires_at = NOW() + make_interval(secs => v_lease_seconds),
        attempt_count = j.attempt_count + 1,
        updated_at = NOW()
    FROM candidates c
    WHERE j.id = c.id
    RETURNING j.*
  ),
  attempt_ins AS (
    INSERT INTO project_intelligence_document_job_attempts (
      job_id, tenant_id, workspace_id, attempt_number, worker_id, status, started_at
    )
    SELECT
      c.id, c.tenant_id, c.workspace_id, c.attempt_count, p_worker_id, 'started', NOW()
    FROM claimed c
  ),
  lease_upsert AS (
    INSERT INTO project_intelligence_document_worker_leases (
      tenant_id, workspace_id, worker_id, job_id, leased_at, expires_at, heartbeat_at, metadata
    )
    SELECT
      c.tenant_id,
      c.workspace_id,
      p_worker_id,
      c.id,
      NOW(),
      c.lease_expires_at,
      NOW(),
      jsonb_build_object('job_type', c.job_type, 'batch_claimed', (SELECT count(*) FROM claimed))
    FROM claimed c
    ORDER BY c.lease_expires_at DESC NULLS LAST, c.locked_at DESC NULLS LAST
    LIMIT 1
    ON CONFLICT (worker_id) DO UPDATE
      SET tenant_id = EXCLUDED.tenant_id,
          workspace_id = EXCLUDED.workspace_id,
          job_id = EXCLUDED.job_id,
          leased_at = EXCLUDED.leased_at,
          expires_at = EXCLUDED.expires_at,
          heartbeat_at = EXCLUDED.heartbeat_at,
          metadata = EXCLUDED.metadata,
          updated_at = NOW()
  )
  SELECT * FROM claimed;
END;
$$;

COMMENT ON FUNCTION pi_document_claim_jobs(TEXT, INT, INT) IS
  'Claim queued/retry_pending PI document jobs with FOR UPDATE SKIP LOCKED; sets lease once per worker and attempt rows.';
