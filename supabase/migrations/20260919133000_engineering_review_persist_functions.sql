-- ERA-3 — invoker-scoped persist helpers for Review AI
-- Additive. Does not alter Core engineering_documents / engineering_projects RLS.
-- SECURITY INVOKER: RLS still applies. Not a privileged bypass.

CREATE OR REPLACE FUNCTION engineering_review_persist_finding_bundle(
  p_finding jsonb,
  p_evidence jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  finding_id uuid;
  ev jsonb;
BEGIN
  IF jsonb_typeof(p_finding) <> 'object' THEN
    RAISE EXCEPTION 'finding payload must be a JSON object';
  END IF;
  IF jsonb_typeof(p_evidence) <> 'array' THEN
    RAISE EXCEPTION 'evidence payload must be a JSON array';
  END IF;

  INSERT INTO engineering_review_findings (
    id, review_package_id, review_run_id, tenant_id, workspace_id, project_id,
    discipline, category, title, description, severity, confidence_band, confidence_score,
    requirement_references, reasoning_summary, reasoning_basis, recommended_action,
    status, verification_state, human_disposition_id, provenance, created_at, updated_at
  ) VALUES (
    COALESCE(
      CASE
        WHEN (p_finding->>'id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          THEN (p_finding->>'id')::uuid
      END,
      gen_random_uuid()
    ),
    (p_finding->>'review_package_id')::uuid,
    (p_finding->>'review_run_id')::uuid,
    (p_finding->>'tenant_id')::uuid,
    (p_finding->>'workspace_id')::uuid,
    (p_finding->>'project_id')::uuid,
    NULLIF(p_finding->>'discipline', ''),
    p_finding->>'category',
    p_finding->>'title',
    p_finding->>'description',
    p_finding->>'severity',
    p_finding->>'confidence_band',
    (p_finding->>'confidence_score')::numeric,
    COALESCE(p_finding->'requirement_references', '[]'::jsonb),
    p_finding->>'reasoning_summary',
    p_finding->>'reasoning_basis',
    p_finding->>'recommended_action',
    COALESCE(p_finding->>'status', 'candidate'),
    p_finding->>'verification_state',
    NULLIF(p_finding->>'human_disposition_id', ''),
    COALESCE(p_finding->'provenance', '{}'::jsonb),
    COALESCE((p_finding->>'created_at')::timestamptz, NOW()),
    COALESCE((p_finding->>'updated_at')::timestamptz, NOW())
  )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    severity = EXCLUDED.severity,
    confidence_band = EXCLUDED.confidence_band,
    confidence_score = EXCLUDED.confidence_score,
    requirement_references = EXCLUDED.requirement_references,
    reasoning_summary = EXCLUDED.reasoning_summary,
    reasoning_basis = EXCLUDED.reasoning_basis,
    recommended_action = EXCLUDED.recommended_action,
    status = EXCLUDED.status,
    verification_state = EXCLUDED.verification_state,
    human_disposition_id = EXCLUDED.human_disposition_id,
    updated_at = EXCLUDED.updated_at
  RETURNING id INTO finding_id;

  FOR ev IN SELECT value FROM jsonb_array_elements(p_evidence)
  LOOP
    INSERT INTO engineering_review_evidence (
      id, finding_id, tenant_id, workspace_id, project_id, document_id,
      revision, page, section, chunk_id, span, retrieval_id,
      source_type, verification_state, content_hash, created_at, updated_at
    ) VALUES (
      COALESCE(
        CASE
          WHEN (ev->>'id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
            THEN (ev->>'id')::uuid
        END,
        gen_random_uuid()
      ),
      finding_id,
      (ev->>'tenant_id')::uuid,
      (ev->>'workspace_id')::uuid,
      (ev->>'project_id')::uuid,
      (ev->>'document_id')::uuid,
      NULLIF(ev->>'revision', ''),
      NULLIF(ev->>'page', '')::integer,
      NULLIF(ev->>'section', ''),
      NULLIF(ev->>'chunk_id', ''),
      NULLIF(ev->>'span', ''),
      NULLIF(ev->>'retrieval_id', ''),
      ev->>'source_type',
      ev->>'verification_state',
      NULLIF(ev->>'content_hash', ''),
      COALESCE((ev->>'created_at')::timestamptz, NOW()),
      COALESCE((ev->>'updated_at')::timestamptz, NOW())
    )
    ON CONFLICT (id) DO UPDATE SET
      verification_state = EXCLUDED.verification_state,
      span = EXCLUDED.span,
      updated_at = EXCLUDED.updated_at;
  END LOOP;

  RETURN jsonb_build_object('id', finding_id);
END;
$$;

CREATE OR REPLACE FUNCTION engineering_review_record_disposition(
  p_finding jsonb,
  p_disposition jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  finding_id uuid;
BEGIN
  IF COALESCE(p_disposition->>'actor_kind', '') <> 'human' THEN
    RAISE EXCEPTION 'engineering review dispositions require actor_kind=human';
  END IF;
  IF COALESCE(btrim(p_disposition->>'actor_id'), '') = '' THEN
    RAISE EXCEPTION 'engineering review dispositions require actor_id';
  END IF;

  finding_id := (p_finding->>'id')::uuid;

  UPDATE engineering_review_findings SET
    title = p_finding->>'title',
    description = p_finding->>'description',
    severity = p_finding->>'severity',
    status = p_finding->>'status',
    verification_state = p_finding->>'verification_state',
    human_disposition_id = NULLIF(p_finding->>'human_disposition_id', ''),
    recommended_action = p_finding->>'recommended_action',
    updated_at = COALESCE((p_finding->>'updated_at')::timestamptz, NOW())
  WHERE id = finding_id
    AND tenant_id = (p_finding->>'tenant_id')::uuid
    AND workspace_id = (p_finding->>'workspace_id')::uuid
    AND project_id = (p_finding->>'project_id')::uuid;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'engineering review finding not visible for disposition';
  END IF;

  INSERT INTO engineering_review_dispositions (
    id, finding_id, tenant_id, workspace_id, project_id,
    action, previous_status, new_status, actor_id, actor_kind,
    reason, assigned_to, occurred_at, created_at
  ) VALUES (
    COALESCE(
      CASE
        WHEN (p_disposition->>'id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          THEN (p_disposition->>'id')::uuid
      END,
      gen_random_uuid()
    ),
    finding_id,
    (p_disposition->>'tenant_id')::uuid,
    (p_disposition->>'workspace_id')::uuid,
    (p_disposition->>'project_id')::uuid,
    p_disposition->>'action',
    p_disposition->>'previous_status',
    p_disposition->>'new_status',
    p_disposition->>'actor_id',
    'human',
    NULLIF(p_disposition->>'reason', ''),
    NULLIF(p_disposition->>'assigned_to', ''),
    COALESCE((p_disposition->>'occurred_at')::timestamptz, NOW()),
    NOW()
  );

  RETURN jsonb_build_object('id', finding_id);
END;
$$;

REVOKE ALL ON FUNCTION engineering_review_persist_finding_bundle(jsonb, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION engineering_review_record_disposition(jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION engineering_review_persist_finding_bundle(jsonb, jsonb) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION engineering_review_record_disposition(jsonb, jsonb) TO authenticated, service_role;

COMMENT ON FUNCTION engineering_review_persist_finding_bundle(jsonb, jsonb) IS
  'ERA-3 invoker-scoped transaction: persist a finding and its evidence together. RLS still applies.';
COMMENT ON FUNCTION engineering_review_record_disposition(jsonb, jsonb) IS
  'ERA-3 invoker-scoped transaction: update finding status and append disposition history together.';
