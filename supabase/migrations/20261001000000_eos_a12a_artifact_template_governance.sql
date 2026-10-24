-- EOS-A12A: Enterprise artifact template governance (metadata only).
-- Additive after 20260930200000_eos_a11e_change_impact_option_construction.sql.
-- Registers company/project presentation-template policy. Does not store template
-- binaries, content_base64, a DMS, Storage bucket, or a second artifact engine.
-- Packaged EOS default templates remain code-governed catalog assets.

CREATE TABLE IF NOT EXISTS engineering_artifact_template_policies (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id                    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id                      TEXT,
  artifact_type                   TEXT NOT NULL,
  template_code                   TEXT NOT NULL,
  template_version                TEXT NOT NULL,
  name                            TEXT NOT NULL,
  source_class                    TEXT NOT NULL CHECK (source_class IN (
    'COMPANY_OFFICIAL', 'PROJECT_CLIENT_APPROVED'
  )),
  status                          TEXT NOT NULL CHECK (status IN (
    'DRAFT', 'VALIDATING', 'ACTIVE', 'RETIRED'
  )),
  disciplines                     JSONB NOT NULL DEFAULT '[]'::jsonb,
  work_types                      JSONB NOT NULL DEFAULT '[]'::jsonb,
  lifecycle_stages                JSONB NOT NULL DEFAULT '[]'::jsonb,
  packaged_asset_key              TEXT NOT NULL,
  presentation_kind               TEXT NOT NULL CHECK (presentation_kind IN ('SHELL', 'COMBINED')),
  branding                        JSONB NOT NULL DEFAULT '{}'::jsonb,
  fallback_policy                 TEXT NOT NULL CHECK (fallback_policy IN (
    'OFFICIAL_TEMPLATE_REQUIRED', 'ALLOW_EOS_DEFAULT_IF_OFFICIAL_UNAVAILABLE'
  )),
  active                          BOOLEAN NOT NULL DEFAULT TRUE,
  created_by                      TEXT,
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_artifact_template_fallback_policies (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id                    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  fallback_policy                 TEXT NOT NULL CHECK (fallback_policy IN (
    'OFFICIAL_TEMPLATE_REQUIRED', 'ALLOW_EOS_DEFAULT_IF_OFFICIAL_UNAVAILABLE'
  )),
  created_by                      TEXT,
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, workspace_id)
);

CREATE INDEX IF NOT EXISTS idx_eng_artifact_template_policies_ws
  ON engineering_artifact_template_policies (tenant_id, workspace_id, artifact_type, status);

CREATE INDEX IF NOT EXISTS idx_eng_artifact_template_policies_project
  ON engineering_artifact_template_policies (tenant_id, workspace_id, project_id, artifact_type);

DROP TRIGGER IF EXISTS engineering_artifact_template_policies_updated_at ON engineering_artifact_template_policies;
CREATE TRIGGER engineering_artifact_template_policies_updated_at
  BEFORE UPDATE ON engineering_artifact_template_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS engineering_artifact_template_fallback_updated_at ON engineering_artifact_template_fallback_policies;
CREATE TRIGGER engineering_artifact_template_fallback_updated_at
  BEFORE UPDATE ON engineering_artifact_template_fallback_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS engineering_artifact_template_policies_workspace_tenant ON engineering_artifact_template_policies;
CREATE TRIGGER engineering_artifact_template_policies_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_artifact_template_policies
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

DROP TRIGGER IF EXISTS engineering_artifact_template_fallback_workspace_tenant ON engineering_artifact_template_fallback_policies;
CREATE TRIGGER engineering_artifact_template_fallback_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_artifact_template_fallback_policies
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

COMMENT ON TABLE engineering_artifact_template_policies IS
  'EOS-A12A company/project presentation-template policy metadata. Packaged asset key only — no template bytes, no content_base64, not calculation-certification authority.';
COMMENT ON TABLE engineering_artifact_template_fallback_policies IS
  'EOS-A12A tenant/workspace fallback policy. Default is OFFICIAL_TEMPLATE_REQUIRED (fail closed when a configured official template cannot be loaded).';

ALTER TABLE engineering_artifact_template_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_artifact_template_fallback_policies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eng_artifact_template_policies_select ON engineering_artifact_template_policies;
DROP POLICY IF EXISTS eng_artifact_template_policies_insert ON engineering_artifact_template_policies;
DROP POLICY IF EXISTS eng_artifact_template_policies_update ON engineering_artifact_template_policies;
DROP POLICY IF EXISTS eng_artifact_template_policies_delete ON engineering_artifact_template_policies;
DROP POLICY IF EXISTS eng_artifact_template_fallback_select ON engineering_artifact_template_fallback_policies;
DROP POLICY IF EXISTS eng_artifact_template_fallback_insert ON engineering_artifact_template_fallback_policies;
DROP POLICY IF EXISTS eng_artifact_template_fallback_update ON engineering_artifact_template_fallback_policies;
DROP POLICY IF EXISTS eng_artifact_template_fallback_delete ON engineering_artifact_template_fallback_policies;

CREATE POLICY eng_artifact_template_policies_select ON engineering_artifact_template_policies
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_artifact_template_policies_insert ON engineering_artifact_template_policies
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
    AND has_permission('engineering', 'admin', tenant_id)
  );

CREATE POLICY eng_artifact_template_policies_update ON engineering_artifact_template_policies
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
    AND has_permission('engineering', 'admin', tenant_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
    AND has_permission('engineering', 'admin', tenant_id)
  );

CREATE POLICY eng_artifact_template_policies_delete ON engineering_artifact_template_policies
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_artifact_template_fallback_select ON engineering_artifact_template_fallback_policies
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_artifact_template_fallback_insert ON engineering_artifact_template_fallback_policies
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
    AND has_permission('engineering', 'admin', tenant_id)
  );

CREATE POLICY eng_artifact_template_fallback_update ON engineering_artifact_template_fallback_policies
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
    AND has_permission('engineering', 'admin', tenant_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
    AND has_permission('engineering', 'admin', tenant_id)
  );

CREATE POLICY eng_artifact_template_fallback_delete ON engineering_artifact_template_fallback_policies
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_artifact_template_policies TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_artifact_template_fallback_policies TO anon, authenticated, service_role;
