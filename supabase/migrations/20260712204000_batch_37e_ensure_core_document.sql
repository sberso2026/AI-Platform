-- Batch 37e: authoritative Core document ensure for PI document processing.
CREATE OR REPLACE FUNCTION pi_document_ensure_core_document(
  p_id UUID,
  p_tenant_id UUID,
  p_workspace_id UUID,
  p_document_number TEXT,
  p_title TEXT,
  p_revision TEXT,
  p_mime_type TEXT DEFAULT 'text/plain',
  p_uploaded_by UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_row engineering_documents%ROWTYPE;
BEGIN
  IF p_id IS NULL OR p_tenant_id IS NULL OR p_workspace_id IS NULL THEN
    RAISE EXCEPTION 'id, tenant_id, and workspace_id are required';
  END IF;

  INSERT INTO engineering_documents (
    id, tenant_id, workspace_id, document_number, title, revision, status,
    document_type, mime_type, source, uploaded_by, uploaded_at
  ) VALUES (
    p_id, p_tenant_id, p_workspace_id, p_document_number, p_title, COALESCE(NULLIF(trim(p_revision), ''), 'A'),
    'issued', 'specification', COALESCE(p_mime_type, 'text/plain'), 'project_intelligence_cert_fixture',
    p_uploaded_by, NOW()
  )
  ON CONFLICT (id) DO UPDATE
    SET tenant_id = EXCLUDED.tenant_id,
        workspace_id = EXCLUDED.workspace_id,
        document_number = EXCLUDED.document_number,
        title = EXCLUDED.title,
        revision = EXCLUDED.revision,
        mime_type = EXCLUDED.mime_type,
        source = EXCLUDED.source,
        uploaded_by = COALESCE(EXCLUDED.uploaded_by, engineering_documents.uploaded_by),
        updated_at = NOW()
  RETURNING * INTO v_row;

  IF v_row.tenant_id IS DISTINCT FROM p_tenant_id OR v_row.workspace_id IS DISTINCT FROM p_workspace_id THEN
    RAISE EXCEPTION 'failed to bind engineering_documents % to tenant/workspace', p_id;
  END IF;

  RETURN jsonb_build_object(
    'id', v_row.id,
    'tenant_id', v_row.tenant_id,
    'workspace_id', v_row.workspace_id,
    'document_number', v_row.document_number,
    'title', v_row.title,
    'revision', v_row.revision
  );
EXCEPTION
  WHEN unique_violation THEN
    -- document_number collision within tenant: retry with id-suffixed number
    INSERT INTO engineering_documents (
      id, tenant_id, workspace_id, document_number, title, revision, status,
      document_type, mime_type, source, uploaded_by, uploaded_at
    ) VALUES (
      p_id, p_tenant_id, p_workspace_id,
      left(p_document_number, 40) || '-' || replace(p_id::text, '-', ''),
      p_title, COALESCE(NULLIF(trim(p_revision), ''), 'A'),
      'issued', 'specification', COALESCE(p_mime_type, 'text/plain'), 'project_intelligence_cert_fixture',
      p_uploaded_by, NOW()
    )
    ON CONFLICT (id) DO UPDATE
      SET tenant_id = EXCLUDED.tenant_id,
          workspace_id = EXCLUDED.workspace_id,
          document_number = EXCLUDED.document_number,
          title = EXCLUDED.title,
          revision = EXCLUDED.revision,
          mime_type = EXCLUDED.mime_type,
          source = EXCLUDED.source,
          updated_at = NOW()
    RETURNING * INTO v_row;

    RETURN jsonb_build_object(
      'id', v_row.id,
      'tenant_id', v_row.tenant_id,
      'workspace_id', v_row.workspace_id,
      'document_number', v_row.document_number,
      'title', v_row.title,
      'revision', v_row.revision
    );
END;
$$;

GRANT EXECUTE ON FUNCTION pi_document_ensure_core_document(UUID, UUID, UUID, TEXT, TEXT, TEXT, TEXT, UUID)
  TO service_role;

COMMENT ON FUNCTION pi_document_ensure_core_document(UUID, UUID, UUID, TEXT, TEXT, TEXT, TEXT, UUID) IS
  'Upserts Engineering Core document ownership for PI processing; forces tenant/workspace bind on id.';
