-- EOS-A14A: private generated-artifact object storage and migration ledger.
-- Does not drop content_base64. Does not reuse the Project Intelligence document bucket.
-- PUBLIC_BUCKET_REQUIRED = NO. Server-mediated access only.

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('engineering-artifacts', 'engineering-artifacts', false, 26214400)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = EXCLUDED.file_size_limit;

-- Server-mediated only: clients cannot access engineering-artifacts even if another permissive policy exists.
DROP POLICY IF EXISTS engineering_artifacts_restrict_clients ON storage.objects;
CREATE POLICY engineering_artifacts_restrict_clients ON storage.objects
  AS RESTRICTIVE
  FOR ALL TO anon, authenticated
  USING (bucket_id <> 'engineering-artifacts')
  WITH CHECK (bucket_id <> 'engineering-artifacts');

CREATE TABLE IF NOT EXISTS engineering_artifact_storage_migrations (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id              UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id           UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  artifact_id            UUID NOT NULL,
  from_kind              TEXT NOT NULL,
  to_kind                TEXT NOT NULL,
  object_key             TEXT,
  content_sha256         TEXT,
  content_size_bytes     INTEGER,
  status                 TEXT NOT NULL CHECK (status IN ('IN_PROGRESS', 'VERIFIED', 'FAILED', 'ROLLED_BACK')),
  reason                 TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eng_artifact_storage_mig_ws
  ON engineering_artifact_storage_migrations (tenant_id, workspace_id, artifact_id, created_at DESC);

COMMENT ON TABLE engineering_artifact_storage_migrations IS
  'EOS-A14A migration manifest. Identifies legacy source, object key, hash, size, and failure without storing file bytes.';

DROP TRIGGER IF EXISTS engineering_artifact_storage_mig_workspace_tenant ON engineering_artifact_storage_migrations;
CREATE TRIGGER engineering_artifact_storage_mig_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_artifact_storage_migrations
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

ALTER TABLE engineering_artifact_storage_migrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eng_artifact_storage_mig_select ON engineering_artifact_storage_migrations;
DROP POLICY IF EXISTS eng_artifact_storage_mig_insert ON engineering_artifact_storage_migrations;
DROP POLICY IF EXISTS eng_artifact_storage_mig_update ON engineering_artifact_storage_migrations;
DROP POLICY IF EXISTS eng_artifact_storage_mig_delete ON engineering_artifact_storage_migrations;

CREATE POLICY eng_artifact_storage_mig_select ON engineering_artifact_storage_migrations
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_artifact_storage_mig_insert ON engineering_artifact_storage_migrations
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_artifact_storage_mig_update ON engineering_artifact_storage_migrations
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_artifact_storage_mig_delete ON engineering_artifact_storage_migrations
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_artifact_storage_migrations TO anon, authenticated, service_role;

-- content_base64 column retained. No public bucket.
