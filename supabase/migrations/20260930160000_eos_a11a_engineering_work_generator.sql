-- EOS-A11A: Engineering Work Generator.
-- Additive after 20260930150000_eos_a10c_information_requirements_handover.sql.
-- Stores project-specific generated EngineeringWorkPlan context/references.
-- Templates remain a code-governed catalog. Does not store Office artifacts or executable scripts.

CREATE TABLE IF NOT EXISTS engineering_work_plans (
  id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id                 UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id                   TEXT NOT NULL,
  work_type                    TEXT NOT NULL,
  template_code                TEXT NOT NULL,
  template_version             TEXT NOT NULL,
  discipline                   TEXT,
  system_id                    TEXT,
  asset_id                     TEXT,
  lifecycle_stage              TEXT NOT NULL,
  related_object_type          TEXT,
  related_object_id            TEXT,
  related_deliverable_id       TEXT,
  related_interface_id         TEXT,
  related_change_id            TEXT,
  status                       TEXT NOT NULL CHECK (status IN (
    'DRAFT', 'READY', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'CANCELLED', 'SUPERSEDED'
  )),
  readiness                    TEXT NOT NULL,
  start_allowed                BOOLEAN NOT NULL DEFAULT FALSE,
  conditions_acknowledged      BOOLEAN NOT NULL DEFAULT FALSE,
  staleness                    TEXT NOT NULL CHECK (staleness IN (
    'CURRENT', 'POTENTIALLY_STALE', 'STALE', 'REGENERATE_REQUIRED'
  )),
  input_fingerprint            TEXT NOT NULL,
  context                      JSONB NOT NULL DEFAULT '{}'::jsonb,
  explanations                 JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  generated_by                 TEXT,
  supersedes_plan_id           UUID REFERENCES engineering_work_plans(id) ON DELETE SET NULL,
  started_at                   TIMESTAMPTZ,
  completed_at                 TIMESTAMPTZ,
  created_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metrics                      JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_eng_work_plans_ws
  ON engineering_work_plans (tenant_id, workspace_id, project_id, work_type, status);

DROP TRIGGER IF EXISTS engineering_work_plans_updated_at ON engineering_work_plans;
CREATE TRIGGER engineering_work_plans_updated_at
  BEFORE UPDATE ON engineering_work_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS engineering_work_plans_workspace_tenant ON engineering_work_plans;
CREATE TRIGGER engineering_work_plans_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_work_plans
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

COMMENT ON TABLE engineering_work_plans IS
  'EOS-A11A generated EngineeringWorkPlan. References canonical objects; does not copy records, generate Office artifacts, or score employee productivity.';

ALTER TABLE engineering_work_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eng_work_plans_select ON engineering_work_plans;
DROP POLICY IF EXISTS eng_work_plans_insert ON engineering_work_plans;
DROP POLICY IF EXISTS eng_work_plans_update ON engineering_work_plans;
DROP POLICY IF EXISTS eng_work_plans_delete ON engineering_work_plans;

CREATE POLICY eng_work_plans_select ON engineering_work_plans
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_work_plans_insert ON engineering_work_plans
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_work_plans_update ON engineering_work_plans
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_work_plans_delete ON engineering_work_plans
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );
