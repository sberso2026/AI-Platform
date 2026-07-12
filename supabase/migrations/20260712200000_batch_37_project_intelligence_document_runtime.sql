-- RTB AI Platform Batch 37 — Project Intelligence Document Runtime (Phase 6C-2 Final)
-- Durable processing: pgvector embeddings, job queue, outbox, leases, dead letters, step ledger.
-- Engineering Core engineering_documents remains metadata SoT.
-- Meeting Intelligence is out of scope.

CREATE EXTENSION IF NOT EXISTS vector;

-- ─── pgvector column + HNSW (staging scale) ──────────────────────────────────
-- Dimension 1536 (OpenAI text-embedding-3-small / compatible providers).
-- Distance: cosine (vector_cosine_ops). Index: HNSW for expected staging corpus size.
-- jsonb `embedding` retained for transition/audit during dual-write.

ALTER TABLE project_intelligence_document_embeddings
  ADD COLUMN IF NOT EXISTS embedding_vector vector(1536);

COMMENT ON COLUMN project_intelligence_document_embeddings.embedding_vector IS
  'pgvector embedding; dimension 1536; cosine distance; HNSW-indexed for staging scale. '
  'jsonb embedding column retained for transition/audit.';

COMMENT ON COLUMN project_intelligence_document_embeddings.embedding IS
  'Float array as jsonb for transition/audit; prefer embedding_vector for retrieval.';

CREATE INDEX IF NOT EXISTS idx_pi_doc_embeddings_vector_hnsw
  ON project_intelligence_document_embeddings
  USING hnsw (embedding_vector vector_cosine_ops)
  WHERE deleted_at IS NULL AND embedding_vector IS NOT NULL;

-- ─── Lexical search on chunks ────────────────────────────────────────────────

ALTER TABLE project_intelligence_document_chunks
  ADD COLUMN IF NOT EXISTS content_tsv tsvector
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(content, ''))) STORED;

CREATE INDEX IF NOT EXISTS idx_pi_doc_chunks_content_tsv
  ON project_intelligence_document_chunks USING gin (content_tsv)
  WHERE deleted_at IS NULL;

COMMENT ON COLUMN project_intelligence_document_chunks.content_tsv IS
  'Generated english tsvector for hybrid lexical retrieval over chunk content.';

-- ─── Job queue ───────────────────────────────────────────────────────────────

CREATE TABLE project_intelligence_document_jobs (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  engineering_document_id   UUID NOT NULL REFERENCES engineering_documents(id) ON DELETE CASCADE,
  engineering_project_id    UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  processing_run_id         UUID REFERENCES project_intelligence_document_processing_runs(id) ON DELETE SET NULL,
  ingestion_id              UUID REFERENCES project_intelligence_document_ingestions(id) ON DELETE SET NULL,
  job_type                  TEXT NOT NULL,
  status                    TEXT NOT NULL CHECK (status IN (
    'queued', 'claimed', 'running', 'retry_pending', 'completed',
    'failed', 'dead_letter', 'cancelled', 'superseded'
  )),
  priority                  INTEGER NOT NULL DEFAULT 100,
  attempt_count             INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  max_attempts              INTEGER NOT NULL DEFAULT 5 CHECK (max_attempts >= 1),
  available_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  locked_at                 TIMESTAMPTZ,
  locked_by                 TEXT,
  lease_expires_at          TIMESTAMPTZ,
  idempotency_key           TEXT NOT NULL,
  correlation_id            UUID,
  payload                   JSONB NOT NULL DEFAULT '{}',
  last_error_code           TEXT,
  last_error_message        TEXT,
  completed_at              TIMESTAMPTZ,
  created_by                UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at                TIMESTAMPTZ,
  UNIQUE (tenant_id, idempotency_key)
);

CREATE INDEX idx_pi_doc_jobs_claim
  ON project_intelligence_document_jobs(status, available_at, priority, created_at)
  WHERE deleted_at IS NULL AND status IN ('queued', 'retry_pending');
CREATE INDEX idx_pi_doc_jobs_lease
  ON project_intelligence_document_jobs(lease_expires_at)
  WHERE deleted_at IS NULL AND status IN ('claimed', 'running');
CREATE INDEX idx_pi_doc_jobs_document
  ON project_intelligence_document_jobs(engineering_document_id)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_pi_doc_jobs_tenant_status
  ON project_intelligence_document_jobs(tenant_id, status)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_pi_doc_jobs_processing_run
  ON project_intelligence_document_jobs(processing_run_id)
  WHERE processing_run_id IS NOT NULL;

CREATE TRIGGER project_intelligence_document_jobs_updated_at
  BEFORE UPDATE ON project_intelligence_document_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER project_intelligence_document_jobs_identity_immutable
  BEFORE UPDATE ON project_intelligence_document_jobs
  FOR EACH ROW EXECUTE FUNCTION prevent_pi_document_identity_mutation();

COMMENT ON TABLE project_intelligence_document_jobs IS
  'Durable PI document processing job queue; claimed via pi_document_claim_jobs (SKIP LOCKED).';

-- ─── Job attempts ────────────────────────────────────────────────────────────

CREATE TABLE project_intelligence_document_job_attempts (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id                    UUID NOT NULL REFERENCES project_intelligence_document_jobs(id) ON DELETE CASCADE,
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  attempt_number            INTEGER NOT NULL CHECK (attempt_number >= 1),
  worker_id                 TEXT NOT NULL,
  status                    TEXT NOT NULL CHECK (status IN (
    'started', 'succeeded', 'failed', 'released', 'superseded'
  )),
  started_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at               TIMESTAMPTZ,
  error_code                TEXT,
  error_message             TEXT,
  metrics                   JSONB NOT NULL DEFAULT '{}',
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (job_id, attempt_number)
);

CREATE INDEX idx_pi_doc_job_attempts_job
  ON project_intelligence_document_job_attempts(job_id, attempt_number DESC);
CREATE INDEX idx_pi_doc_job_attempts_tenant
  ON project_intelligence_document_job_attempts(tenant_id, started_at DESC);

CREATE TRIGGER project_intelligence_document_job_attempts_updated_at
  BEFORE UPDATE ON project_intelligence_document_job_attempts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER project_intelligence_document_job_attempts_identity_immutable
  BEFORE UPDATE ON project_intelligence_document_job_attempts
  FOR EACH ROW EXECUTE FUNCTION prevent_pi_document_answer_trace_identity_mutation();

COMMENT ON TABLE project_intelligence_document_job_attempts IS
  'Per-attempt history for PI document jobs (worker claim/run outcomes).';

-- ─── Transactional outbox (PI-scoped) ────────────────────────────────────────

CREATE TABLE project_intelligence_document_outbox (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  aggregate_type            TEXT NOT NULL,
  aggregate_id              UUID NOT NULL,
  event_type                TEXT NOT NULL,
  payload                   JSONB NOT NULL DEFAULT '{}',
  correlation_id            UUID,
  idempotency_key           TEXT NOT NULL,
  status                    TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'processed', 'failed', 'dead_letter'
  )),
  retry_count               INTEGER NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
  last_error                TEXT,
  available_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at              TIMESTAMPTZ,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, idempotency_key)
);

CREATE INDEX idx_pi_doc_outbox_pending
  ON project_intelligence_document_outbox(status, available_at)
  WHERE status IN ('pending', 'failed');
CREATE INDEX idx_pi_doc_outbox_tenant
  ON project_intelligence_document_outbox(tenant_id, created_at DESC);
CREATE INDEX idx_pi_doc_outbox_aggregate
  ON project_intelligence_document_outbox(aggregate_type, aggregate_id);

CREATE TRIGGER project_intelligence_document_outbox_updated_at
  BEFORE UPDATE ON project_intelligence_document_outbox
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER project_intelligence_document_outbox_identity_immutable
  BEFORE UPDATE ON project_intelligence_document_outbox
  FOR EACH ROW EXECUTE FUNCTION prevent_pi_document_answer_trace_identity_mutation();

COMMENT ON TABLE project_intelligence_document_outbox IS
  'PI-scoped transactional outbox (mirrors commercial_outbox_events pattern). '
  'Mutations via service role / SECURITY DEFINER RPCs only.';

-- ─── Worker leases ───────────────────────────────────────────────────────────

CREATE TABLE project_intelligence_document_worker_leases (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  worker_id                 TEXT NOT NULL,
  job_id                    UUID REFERENCES project_intelligence_document_jobs(id) ON DELETE SET NULL,
  leased_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at                TIMESTAMPTZ NOT NULL,
  heartbeat_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata                  JSONB NOT NULL DEFAULT '{}',
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (worker_id)
);

CREATE INDEX idx_pi_doc_worker_leases_expires
  ON project_intelligence_document_worker_leases(expires_at);
CREATE INDEX idx_pi_doc_worker_leases_job
  ON project_intelligence_document_worker_leases(job_id)
  WHERE job_id IS NOT NULL;

CREATE TRIGGER project_intelligence_document_worker_leases_updated_at
  BEFORE UPDATE ON project_intelligence_document_worker_leases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE project_intelligence_document_worker_leases IS
  'Active worker lease registry; one row per worker_id. Heartbeat via pi_document_renew_lease.';

-- ─── Dead letters ────────────────────────────────────────────────────────────

CREATE TABLE project_intelligence_document_dead_letters (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id                    UUID REFERENCES project_intelligence_document_jobs(id) ON DELETE SET NULL,
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  engineering_document_id   UUID NOT NULL REFERENCES engineering_documents(id) ON DELETE CASCADE,
  job_type                  TEXT NOT NULL,
  error_code                TEXT,
  error_message             TEXT,
  payload                   JSONB NOT NULL DEFAULT '{}',
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at               TIMESTAMPTZ,
  review_state              TEXT NOT NULL DEFAULT 'pending' CHECK (review_state IN (
    'pending', 'reviewed', 'ignored', 'requeued'
  ))
);

CREATE INDEX idx_pi_doc_dead_letters_tenant
  ON project_intelligence_document_dead_letters(tenant_id, created_at DESC);
CREATE INDEX idx_pi_doc_dead_letters_document
  ON project_intelligence_document_dead_letters(engineering_document_id);
CREATE INDEX idx_pi_doc_dead_letters_review
  ON project_intelligence_document_dead_letters(tenant_id, review_state)
  WHERE review_state = 'pending';

CREATE TRIGGER project_intelligence_document_dead_letters_updated_at
  BEFORE UPDATE ON project_intelligence_document_dead_letters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER project_intelligence_document_dead_letters_identity_immutable
  BEFORE UPDATE ON project_intelligence_document_dead_letters
  FOR EACH ROW EXECUTE FUNCTION prevent_pi_document_identity_mutation();

COMMENT ON TABLE project_intelligence_document_dead_letters IS
  'Poison / exhausted PI document jobs awaiting operator review.';

-- ─── Processing steps (in-place latest per run+step) ─────────────────────────

CREATE TABLE project_intelligence_document_processing_steps (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  engineering_document_id   UUID NOT NULL REFERENCES engineering_documents(id) ON DELETE CASCADE,
  processing_run_id         UUID NOT NULL REFERENCES project_intelligence_document_processing_runs(id) ON DELETE CASCADE,
  ingestion_id              UUID REFERENCES project_intelligence_document_ingestions(id) ON DELETE SET NULL,
  step_name                 TEXT NOT NULL CHECK (step_name IN (
    'fetch', 'validate', 'parse', 'normalize', 'chunk',
    'embed', 'index', 'extract', 'validate_output', 'activate'
  )),
  status                    TEXT NOT NULL DEFAULT 'queued' CHECK (status IN (
    'queued', 'running', 'completed', 'failed', 'skipped'
  )),
  attempt                   INTEGER NOT NULL DEFAULT 1 CHECK (attempt >= 1),
  provider                  TEXT,
  version                   TEXT,
  started_at                TIMESTAMPTZ,
  ended_at                  TIMESTAMPTZ,
  input_checksum            TEXT,
  output_checksum           TEXT,
  evidence_count            INTEGER NOT NULL DEFAULT 0 CHECK (evidence_count >= 0),
  warning_count             INTEGER NOT NULL DEFAULT 0 CHECK (warning_count >= 0),
  error_code                TEXT,
  metrics                   JSONB NOT NULL DEFAULT '{}',
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (processing_run_id, step_name)
);

CREATE INDEX idx_pi_doc_steps_run
  ON project_intelligence_document_processing_steps(processing_run_id, step_name);
CREATE INDEX idx_pi_doc_steps_document
  ON project_intelligence_document_processing_steps(engineering_document_id);
CREATE INDEX idx_pi_doc_steps_status
  ON project_intelligence_document_processing_steps(tenant_id, status);

CREATE TRIGGER project_intelligence_document_processing_steps_updated_at
  BEFORE UPDATE ON project_intelligence_document_processing_steps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER project_intelligence_document_processing_steps_identity_immutable
  BEFORE UPDATE ON project_intelligence_document_processing_steps
  FOR EACH ROW EXECUTE FUNCTION prevent_pi_document_identity_mutation();

COMMENT ON TABLE project_intelligence_document_processing_steps IS
  'Per-step ledger for a processing run; UNIQUE(processing_run_id, step_name) updated in place; '
  'attempt column increments on retry.';

-- ─── RPC: claim jobs ─────────────────────────────────────────────────────────

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
      jsonb_build_object('job_type', c.job_type)
    FROM claimed c
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
  'Claim queued/retry_pending PI document jobs with FOR UPDATE SKIP LOCKED; sets lease and attempt.';

-- ─── RPC: enqueue processing (transactional) ─────────────────────────────────

CREATE OR REPLACE FUNCTION pi_document_enqueue_processing(
  p_tenant_id UUID,
  p_workspace_id UUID,
  p_engineering_document_id UUID,
  p_engineering_project_id UUID,
  p_source_revision TEXT,
  p_processing_version TEXT,
  p_correlation_id UUID,
  p_idempotency_key TEXT,
  p_payload JSONB DEFAULT '{}'::jsonb,
  p_created_by UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_existing project_intelligence_document_jobs%ROWTYPE;
  v_reuse_job BOOLEAN := false;
  v_ingestion_id UUID;
  v_processing_run_id UUID;
  v_job_id UUID;
  v_outbox_id UUID;
  v_processing_version TEXT := COALESCE(NULLIF(trim(p_processing_version), ''), '1');
  v_source_revision TEXT := COALESCE(NULLIF(trim(p_source_revision), ''), '1');
  v_payload JSONB := COALESCE(p_payload, '{}'::jsonb);
  v_outbox_key TEXT;
  v_run_key TEXT;
BEGIN
  IF p_tenant_id IS NULL OR p_workspace_id IS NULL OR p_engineering_document_id IS NULL THEN
    RAISE EXCEPTION 'tenant_id, workspace_id, and engineering_document_id are required';
  END IF;
  IF p_idempotency_key IS NULL OR length(trim(p_idempotency_key)) = 0 THEN
    RAISE EXCEPTION 'p_idempotency_key is required';
  END IF;

  SELECT * INTO v_existing
  FROM project_intelligence_document_jobs
  WHERE tenant_id = p_tenant_id
    AND idempotency_key = p_idempotency_key
    AND deleted_at IS NULL
  FOR UPDATE;

  IF FOUND AND v_existing.status NOT IN ('failed', 'dead_letter', 'cancelled', 'superseded') THEN
    RETURN jsonb_build_object(
      'ingestion_id', v_existing.ingestion_id,
      'processing_run_id', v_existing.processing_run_id,
      'job_id', v_existing.id,
      'outbox_id', (
        SELECT o.id
        FROM project_intelligence_document_outbox o
        WHERE o.tenant_id = p_tenant_id
          AND o.idempotency_key = p_idempotency_key || ':outbox'
        LIMIT 1
      ),
      'reused', true
    );
  END IF;

  v_reuse_job := FOUND AND v_existing.status IN ('failed', 'dead_letter', 'cancelled', 'superseded');

  -- Reuse open ingestion for same document + revision + version when present
  SELECT i.id INTO v_ingestion_id
  FROM project_intelligence_document_ingestions i
  WHERE i.tenant_id = p_tenant_id
    AND i.workspace_id = p_workspace_id
    AND i.engineering_document_id = p_engineering_document_id
    AND i.source_revision = v_source_revision
    AND i.processing_version = v_processing_version
    AND i.deleted_at IS NULL
    AND i.status NOT IN ('ready', 'ready_with_warnings', 'failed', 'cancelled', 'superseded', 'archived')
  ORDER BY i.created_at DESC
  LIMIT 1
  FOR UPDATE;

  IF v_ingestion_id IS NULL THEN
    INSERT INTO project_intelligence_document_ingestions (
      tenant_id, workspace_id, engineering_project_id, engineering_document_id,
      source_revision, processing_version, status, idempotency_key, metadata, created_by
    ) VALUES (
      p_tenant_id, p_workspace_id, p_engineering_project_id, p_engineering_document_id,
      v_source_revision, v_processing_version, 'queued',
      p_idempotency_key || ':ingestion',
      jsonb_build_object('correlation_id', p_correlation_id),
      p_created_by
    )
    ON CONFLICT (tenant_id, idempotency_key) DO UPDATE
      SET status = 'queued',
          engineering_project_id = COALESCE(EXCLUDED.engineering_project_id, project_intelligence_document_ingestions.engineering_project_id),
          metadata = EXCLUDED.metadata,
          deleted_at = NULL,
          updated_at = NOW()
    RETURNING id INTO v_ingestion_id;
  ELSE
    UPDATE project_intelligence_document_ingestions
    SET status = 'queued',
        updated_at = NOW()
    WHERE id = v_ingestion_id;
  END IF;

  -- Each enqueue gets a distinct run row (job idempotency_key is the durable dedupe key)
  v_run_key := p_idempotency_key || ':run:' || gen_random_uuid()::text;

  INSERT INTO project_intelligence_document_processing_runs (
    tenant_id, workspace_id, engineering_project_id, engineering_document_id,
    ingestion_id, source_revision, processing_version, status,
    correlation_id, idempotency_key, metadata, created_by, started_at
  ) VALUES (
    p_tenant_id, p_workspace_id, p_engineering_project_id, p_engineering_document_id,
    v_ingestion_id, v_source_revision, v_processing_version, 'queued',
    p_correlation_id::text, v_run_key,
    v_payload, p_created_by, NOW()
  )
  RETURNING id INTO v_processing_run_id;

  IF v_reuse_job THEN
    UPDATE project_intelligence_document_jobs
    SET processing_run_id = v_processing_run_id,
        ingestion_id = v_ingestion_id,
        engineering_project_id = COALESCE(p_engineering_project_id, engineering_project_id),
        job_type = 'process_document',
        status = 'queued',
        priority = 100,
        attempt_count = 0,
        available_at = NOW(),
        locked_at = NULL,
        locked_by = NULL,
        lease_expires_at = NULL,
        correlation_id = p_correlation_id,
        payload = v_payload,
        last_error_code = NULL,
        last_error_message = NULL,
        completed_at = NULL,
        updated_at = NOW()
    WHERE id = v_existing.id
    RETURNING id INTO v_job_id;
  ELSE
    INSERT INTO project_intelligence_document_jobs (
      tenant_id, workspace_id, engineering_document_id, engineering_project_id,
      processing_run_id, ingestion_id, job_type, status, priority,
      idempotency_key, correlation_id, payload, created_by
    ) VALUES (
      p_tenant_id, p_workspace_id, p_engineering_document_id, p_engineering_project_id,
      v_processing_run_id, v_ingestion_id, 'process_document', 'queued', 100,
      p_idempotency_key, p_correlation_id, v_payload, p_created_by
    )
    RETURNING id INTO v_job_id;
  END IF;

  v_outbox_key := p_idempotency_key || ':outbox';

  INSERT INTO project_intelligence_document_outbox (
    tenant_id, workspace_id, aggregate_type, aggregate_id, event_type,
    payload, correlation_id, idempotency_key, status, available_at
  ) VALUES (
    p_tenant_id,
    p_workspace_id,
    'project_intelligence_document',
    p_engineering_document_id,
    'project_intelligence.document.processing_requested',
    jsonb_build_object(
      'ingestion_id', v_ingestion_id,
      'processing_run_id', v_processing_run_id,
      'job_id', v_job_id,
      'engineering_document_id', p_engineering_document_id,
      'engineering_project_id', p_engineering_project_id,
      'source_revision', v_source_revision,
      'processing_version', v_processing_version,
      'payload', v_payload
    ),
    p_correlation_id,
    v_outbox_key,
    'pending',
    NOW()
  )
  ON CONFLICT (tenant_id, idempotency_key) DO UPDATE
    SET status = 'pending',
        available_at = NOW(),
        processed_at = NULL,
        last_error = NULL,
        retry_count = 0,
        payload = EXCLUDED.payload,
        correlation_id = EXCLUDED.correlation_id,
        aggregate_id = EXCLUDED.aggregate_id,
        updated_at = NOW()
  RETURNING id INTO v_outbox_id;

  RETURN jsonb_build_object(
    'ingestion_id', v_ingestion_id,
    'processing_run_id', v_processing_run_id,
    'job_id', v_job_id,
    'outbox_id', v_outbox_id,
    'reused', false
  );
END;
$$;

COMMENT ON FUNCTION pi_document_enqueue_processing(
  UUID, UUID, UUID, UUID, TEXT, TEXT, UUID, TEXT, JSONB, UUID
) IS
  'Transactionally enqueue PI document processing: ingestion + run + job + outbox event.';

-- ─── RPC: renew lease ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION pi_document_renew_lease(
  p_job_id UUID,
  p_worker_id TEXT,
  p_lease_seconds INT DEFAULT 120
)
RETURNS project_intelligence_document_jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_lease_seconds INT := GREATEST(COALESCE(p_lease_seconds, 120), 15);
  v_job project_intelligence_document_jobs%ROWTYPE;
BEGIN
  IF p_job_id IS NULL OR p_worker_id IS NULL OR length(trim(p_worker_id)) = 0 THEN
    RAISE EXCEPTION 'p_job_id and p_worker_id are required';
  END IF;

  UPDATE project_intelligence_document_jobs
  SET lease_expires_at = NOW() + make_interval(secs => v_lease_seconds),
      locked_at = COALESCE(locked_at, NOW()),
      locked_by = p_worker_id,
      status = CASE WHEN status = 'claimed' THEN 'running' ELSE status END,
      updated_at = NOW()
  WHERE id = p_job_id
    AND deleted_at IS NULL
    AND locked_by = p_worker_id
    AND status IN ('claimed', 'running')
  RETURNING * INTO v_job;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'lease renew failed: job % not held by worker %', p_job_id, p_worker_id;
  END IF;

  INSERT INTO project_intelligence_document_worker_leases (
    tenant_id, workspace_id, worker_id, job_id, leased_at, expires_at, heartbeat_at
  ) VALUES (
    v_job.tenant_id, v_job.workspace_id, p_worker_id, v_job.id,
    COALESCE(v_job.locked_at, NOW()), v_job.lease_expires_at, NOW()
  )
  ON CONFLICT (worker_id) DO UPDATE
    SET tenant_id = EXCLUDED.tenant_id,
        workspace_id = EXCLUDED.workspace_id,
        job_id = EXCLUDED.job_id,
        expires_at = EXCLUDED.expires_at,
        heartbeat_at = NOW(),
        updated_at = NOW();

  RETURN v_job;
END;
$$;

COMMENT ON FUNCTION pi_document_renew_lease(UUID, TEXT, INT) IS
  'Extend lease on a claimed/running PI document job held by p_worker_id.';

-- ─── RPC: release expired leases ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION pi_document_release_expired_leases()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  WITH expired AS (
    UPDATE project_intelligence_document_jobs
    SET status = 'retry_pending',
        locked_by = NULL,
        locked_at = NULL,
        lease_expires_at = NULL,
        available_at = NOW(),
        updated_at = NOW()
    WHERE deleted_at IS NULL
      AND status IN ('claimed', 'running')
      AND lease_expires_at IS NOT NULL
      AND lease_expires_at < NOW()
    RETURNING id
  ),
  clear_leases AS (
    UPDATE project_intelligence_document_worker_leases wl
    SET job_id = NULL,
        updated_at = NOW()
    FROM expired e
    WHERE wl.job_id = e.id
  )
  SELECT count(*)::INTEGER INTO v_count FROM expired;

  RETURN COALESCE(v_count, 0);
END;
$$;

COMMENT ON FUNCTION pi_document_release_expired_leases() IS
  'Move claimed/running jobs with expired leases to retry_pending for re-claim.';

GRANT EXECUTE ON FUNCTION pi_document_claim_jobs(TEXT, INT, INT) TO service_role;
GRANT EXECUTE ON FUNCTION pi_document_enqueue_processing(UUID, UUID, UUID, UUID, TEXT, TEXT, UUID, TEXT, JSONB, UUID)
  TO service_role, authenticated;
GRANT EXECUTE ON FUNCTION pi_document_renew_lease(UUID, TEXT, INT) TO service_role;
GRANT EXECUTE ON FUNCTION pi_document_release_expired_leases() TO service_role;

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE project_intelligence_document_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_intelligence_document_job_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_intelligence_document_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_intelligence_document_worker_leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_intelligence_document_dead_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_intelligence_document_processing_steps ENABLE ROW LEVEL SECURITY;

-- Queue / outbox / leases / dead letters: members SELECT only (mutations via service role / DEFINER RPCs)
CREATE POLICY project_intelligence_document_jobs_select
  ON project_intelligence_document_jobs FOR SELECT
  USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND workspace_id IN (SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid())
  );

CREATE POLICY project_intelligence_document_outbox_select
  ON project_intelligence_document_outbox FOR SELECT
  USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND workspace_id IN (SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid())
  );

CREATE POLICY project_intelligence_document_worker_leases_select
  ON project_intelligence_document_worker_leases FOR SELECT
  USING (
    tenant_id IS NULL
    OR (
      tenant_id = ANY(get_user_tenant_ids())
      AND (
        workspace_id IS NULL
        OR workspace_id IN (SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid())
      )
    )
  );

CREATE POLICY project_intelligence_document_dead_letters_select
  ON project_intelligence_document_dead_letters FOR SELECT
  USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND workspace_id IN (SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid())
  );

-- Job attempts + processing steps: batch_36 pattern (member select + engineering admin manage)
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'project_intelligence_document_job_attempts',
    'project_intelligence_document_processing_steps'
  ]
  LOOP
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR SELECT USING (
         tenant_id = ANY(get_user_tenant_ids())
         AND workspace_id IN (SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid())
       )',
      tbl || '_select', tbl
    );
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR ALL USING (
         has_permission(''engineering'', ''admin'', tenant_id)
         AND workspace_id IN (SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid())
       ) WITH CHECK (
         has_permission(''engineering'', ''admin'', tenant_id)
         AND workspace_id IN (SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid())
       )',
      tbl || '_manage', tbl
    );
  END LOOP;
END $$;
