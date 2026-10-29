-- EOS 2.16R workspace enrollment. Additive. Existing installations are not enrolled.
-- Absence of a row means EOS 2 is denied for that workspace.

CREATE TABLE IF NOT EXISTS eos2_workspace_enrollment (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  enrolled        BOOLEAN NOT NULL DEFAULT FALSE,
  enrolled_at     TIMESTAMPTZ,
  disabled_at     TIMESTAMPTZ,
  authority_role  TEXT NOT NULL,
  actor_id        UUID,
  reason          TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, workspace_id)
);

CREATE INDEX IF NOT EXISTS idx_eos2_workspace_enrollment_ws
  ON eos2_workspace_enrollment (tenant_id, workspace_id);

DROP TRIGGER IF EXISTS eos2_workspace_enrollment_updated_at ON eos2_workspace_enrollment;
CREATE TRIGGER eos2_workspace_enrollment_updated_at
  BEFORE UPDATE ON eos2_workspace_enrollment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE eos2_workspace_enrollment ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos2_workspace_enrollment_select ON eos2_workspace_enrollment;
CREATE POLICY eos2_workspace_enrollment_select ON eos2_workspace_enrollment
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos2_workspace_enrollment_insert ON eos2_workspace_enrollment;
CREATE POLICY eos2_workspace_enrollment_insert ON eos2_workspace_enrollment
  FOR INSERT WITH CHECK (has_permission('tenant', 'admin', tenant_id));

DROP POLICY IF EXISTS eos2_workspace_enrollment_update ON eos2_workspace_enrollment;
CREATE POLICY eos2_workspace_enrollment_update ON eos2_workspace_enrollment
  FOR UPDATE USING (has_permission('tenant', 'admin', tenant_id))
  WITH CHECK (has_permission('tenant', 'admin', tenant_id));

COMMENT ON TABLE eos2_workspace_enrollment IS
  'Explicit EOS 2 cohort enrollment. engineering-os entitlement does not create a row and does not grant access.';
