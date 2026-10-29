-- EOS-A10A: Engineering Information Intelligence foundation.
-- Additive after 20260930120000_eos_a9d_deliverable_governance.sql.
-- References canonical sources. Does not copy documents, analysis results, or models.
-- Authority is purpose-specific governed policy, not engineering approval.

CREATE TABLE IF NOT EXISTS engineering_information_refs (
  id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id                 UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id                   TEXT NOT NULL,
  source_object_type           TEXT NOT NULL CHECK (source_object_type IN (
    'document', 'model', 'dataset', 'analysis_result', 'requirement', 'assumption',
    'decision', 'interface', 'configuration_baseline', 'review_package',
    'deliverable_expectation', 'external_reference'
  )),
  source_object_id             TEXT NOT NULL,
  information_type             TEXT NOT NULL,
  source_kind                  TEXT NOT NULL,
  discipline                   TEXT,
  responsible_discipline       TEXT,
  system_id                    TEXT,
  asset_id                     TEXT,
  lifecycle_stage              TEXT,
  purpose                      TEXT NOT NULL,
  configuration_baseline_id    TEXT,
  eligibility                  TEXT NOT NULL CHECK (eligibility IN (
    'WORKING', 'ELIGIBLE_AUTHORITATIVE', 'ACCEPTED_REFERENCE', 'UNVERIFIED', 'NOT_APPLICABLE'
  )),
  source_facts                 JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by                   TEXT,
  created_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, workspace_id, project_id, source_object_type, source_object_id, information_type, purpose)
);

CREATE INDEX IF NOT EXISTS idx_eng_information_refs_ws
  ON engineering_information_refs (tenant_id, workspace_id, project_id, information_type, purpose);

DROP TRIGGER IF EXISTS engineering_information_refs_updated_at ON engineering_information_refs;
CREATE TRIGGER engineering_information_refs_updated_at
  BEFORE UPDATE ON engineering_information_refs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS engineering_information_refs_workspace_tenant ON engineering_information_refs;
CREATE TRIGGER engineering_information_refs_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_information_refs
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

COMMENT ON TABLE engineering_information_refs IS
  'EOS-A10A governed reference to a canonical engineering source. Does not copy source content. AUTHORITATIVE_FOR_PURPOSE is not engineering approval.';

CREATE TABLE IF NOT EXISTS engineering_information_authority_policies (
  id                             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id                   UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id                     TEXT,
  policy_id                      TEXT NOT NULL,
  policy_version                 TEXT NOT NULL,
  information_type               TEXT NOT NULL,
  purpose                        TEXT NOT NULL,
  discipline                     TEXT,
  system_id                      TEXT,
  lifecycle_stage                TEXT,
  eligible_source_kinds          JSONB NOT NULL DEFAULT '[]'::jsonb,
  eligible_source_object_types   JSONB NOT NULL DEFAULT '[]'::jsonb,
  require_authoritative_source   BOOLEAN NOT NULL DEFAULT TRUE,
  created_by                     TEXT,
  created_at                     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_eng_information_authority_policies
  ON engineering_information_authority_policies (
    tenant_id, workspace_id, COALESCE(project_id, ''), policy_id, policy_version
  );

CREATE INDEX IF NOT EXISTS idx_eng_information_authority_policies_ws
  ON engineering_information_authority_policies (tenant_id, workspace_id, information_type, purpose);

DROP TRIGGER IF EXISTS engineering_information_authority_policies_workspace_tenant ON engineering_information_authority_policies;
CREATE TRIGGER engineering_information_authority_policies_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_information_authority_policies
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

COMMENT ON TABLE engineering_information_authority_policies IS
  'EOS-A10A versioned purpose-specific source eligibility. No universal precedence. No executable DSL.';

CREATE TABLE IF NOT EXISTS engineering_information_authority_resolutions (
  id                 TEXT PRIMARY KEY,
  tenant_id          UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id       UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id         TEXT NOT NULL,
  policy_id          TEXT,
  policy_version     TEXT,
  information_type   TEXT NOT NULL,
  purpose            TEXT NOT NULL,
  outcome            TEXT NOT NULL,
  selected_ref_id    TEXT,
  payload            JSONB NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eng_information_authority_resolutions_ws
  ON engineering_information_authority_resolutions (tenant_id, workspace_id, project_id, policy_version);

DROP TRIGGER IF EXISTS engineering_information_authority_resolutions_workspace_tenant ON engineering_information_authority_resolutions;
CREATE TRIGGER engineering_information_authority_resolutions_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_information_authority_resolutions
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

COMMENT ON TABLE engineering_information_authority_resolutions IS
  'EOS-A10A historical authority-resolution provenance. Policy version is retained. Not an audit log copy.';

ALTER TABLE engineering_information_refs ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_information_authority_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_information_authority_resolutions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eng_information_refs_select ON engineering_information_refs;
DROP POLICY IF EXISTS eng_information_refs_insert ON engineering_information_refs;
DROP POLICY IF EXISTS eng_information_refs_update ON engineering_information_refs;
DROP POLICY IF EXISTS eng_information_refs_delete ON engineering_information_refs;

CREATE POLICY eng_information_refs_select ON engineering_information_refs
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_information_refs_insert ON engineering_information_refs
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_information_refs_update ON engineering_information_refs
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_information_refs_delete ON engineering_information_refs
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eng_information_authority_policies_select ON engineering_information_authority_policies;
DROP POLICY IF EXISTS eng_information_authority_policies_insert ON engineering_information_authority_policies;
DROP POLICY IF EXISTS eng_information_authority_policies_update ON engineering_information_authority_policies;
DROP POLICY IF EXISTS eng_information_authority_policies_delete ON engineering_information_authority_policies;

CREATE POLICY eng_information_authority_policies_select ON engineering_information_authority_policies
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_information_authority_policies_insert ON engineering_information_authority_policies
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_information_authority_policies_update ON engineering_information_authority_policies
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_information_authority_policies_delete ON engineering_information_authority_policies
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eng_information_authority_resolutions_select ON engineering_information_authority_resolutions;
DROP POLICY IF EXISTS eng_information_authority_resolutions_insert ON engineering_information_authority_resolutions;

CREATE POLICY eng_information_authority_resolutions_select ON engineering_information_authority_resolutions
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_information_authority_resolutions_insert ON engineering_information_authority_resolutions
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_information_refs TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_information_authority_policies TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_information_authority_resolutions TO anon, authenticated, service_role;
