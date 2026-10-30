-- EOS-3-WORKFLOW-1 Engineering Pattern Engine
-- Additive. Pattern registry + Work Package pattern assignments.
-- Does not grant engineering authority. Rollback: DROP assignment then registry tables.

CREATE TABLE IF NOT EXISTS eos3_engineering_patterns (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id                  TEXT NOT NULL,
  name                        TEXT NOT NULL,
  engineer_facing_work_type   TEXT NOT NULL,
  description                 TEXT NOT NULL DEFAULT '',
  version                     TEXT NOT NULL,
  status                      TEXT NOT NULL DEFAULT 'ACTIVE'
                              CHECK (status IN ('DRAFT','ACTIVE','RETIRED','SUPERSEDED')),
  superseded_by_pattern_id    TEXT,
  definition                  JSONB NOT NULL DEFAULT '{}'::jsonb,
  provenance                  JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (pattern_id, version)
);

CREATE INDEX IF NOT EXISTS idx_eos3_patterns_status
  ON eos3_engineering_patterns (status);

DROP TRIGGER IF EXISTS eos3_engineering_patterns_updated_at ON eos3_engineering_patterns;
CREATE TRIGGER eos3_engineering_patterns_updated_at
  BEFORE UPDATE ON eos3_engineering_patterns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE eos3_engineering_patterns ENABLE ROW LEVEL SECURITY;

-- System-managed pattern catalog is readable to engineering workspace members.
DROP POLICY IF EXISTS eos3_patterns_select ON eos3_engineering_patterns;
CREATE POLICY eos3_patterns_select ON eos3_engineering_patterns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspaces w
      WHERE engineering_core_workspace_member(w.id)
    )
  );

CREATE TABLE IF NOT EXISTS eos3_work_package_pattern_assignments (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id                UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id                  TEXT NOT NULL,
  work_package_stable_id      TEXT NOT NULL,
  pattern_id                  TEXT NOT NULL,
  pattern_version             TEXT NOT NULL,
  entry_stage_id              TEXT NOT NULL,
  current_stage_id            TEXT NOT NULL,
  entry_reason                TEXT NOT NULL DEFAULT '',
  inherited_baseline_refs     JSONB NOT NULL DEFAULT '[]'::jsonb,
  available_information       JSONB NOT NULL DEFAULT '[]'::jsonb,
  missing_prerequisites       JSONB NOT NULL DEFAULT '[]'::jsonb,
  suggestion_confidence       TEXT,
  suggestion_basis            JSONB NOT NULL DEFAULT '[]'::jsonb,
  override_history            JSONB NOT NULL DEFAULT '[]'::jsonb,
  exceptions                  JSONB NOT NULL DEFAULT '[]'::jsonb,
  provenance                  JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, workspace_id, project_id, work_package_stable_id)
);

CREATE INDEX IF NOT EXISTS idx_eos3_wp_pattern_ws_project
  ON eos3_work_package_pattern_assignments (tenant_id, workspace_id, project_id);

DROP TRIGGER IF EXISTS eos3_wp_pattern_assignments_updated_at ON eos3_work_package_pattern_assignments;
CREATE TRIGGER eos3_wp_pattern_assignments_updated_at
  BEFORE UPDATE ON eos3_work_package_pattern_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE eos3_work_package_pattern_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_wp_pattern_select ON eos3_work_package_pattern_assignments;
CREATE POLICY eos3_wp_pattern_select ON eos3_work_package_pattern_assignments
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_wp_pattern_insert ON eos3_work_package_pattern_assignments;
CREATE POLICY eos3_wp_pattern_insert ON eos3_work_package_pattern_assignments
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_wp_pattern_update ON eos3_work_package_pattern_assignments;
CREATE POLICY eos3_wp_pattern_update ON eos3_work_package_pattern_assignments
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_wp_pattern_delete ON eos3_work_package_pattern_assignments;
CREATE POLICY eos3_wp_pattern_delete ON eos3_work_package_pattern_assignments
  FOR DELETE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );
