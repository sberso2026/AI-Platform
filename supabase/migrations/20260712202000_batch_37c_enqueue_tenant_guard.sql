-- Batch 37c: enqueue must reject cross-tenant Core document references.
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
  v_core_tenant UUID;
BEGIN
  IF p_tenant_id IS NULL OR p_workspace_id IS NULL OR p_engineering_document_id IS NULL THEN
    RAISE EXCEPTION 'tenant_id, workspace_id, and engineering_document_id are required';
  END IF;
  IF p_idempotency_key IS NULL OR length(trim(p_idempotency_key)) = 0 THEN
    RAISE EXCEPTION 'p_idempotency_key is required';
  END IF;

  SELECT tenant_id INTO v_core_tenant
  FROM engineering_documents
  WHERE id = p_engineering_document_id;

  IF v_core_tenant IS NULL THEN
    RAISE EXCEPTION 'engineering_documents row % is required before enqueue', p_engineering_document_id;
  END IF;
  IF v_core_tenant IS DISTINCT FROM p_tenant_id THEN
    RAISE EXCEPTION 'engineering_documents tenant mismatch for %', p_engineering_document_id;
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
) IS 'Atomically creates ingestion+run+job+outbox; rejects cross-tenant Core document ids.';
