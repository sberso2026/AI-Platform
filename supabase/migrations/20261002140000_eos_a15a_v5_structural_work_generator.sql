-- EOS-A15A-V5: Governed structural calculation overlay persistence.
-- Additive after 20261002120000_eos_a15a_v3_mto_workbench.sql.
-- Overlay on Work Generator / Tool Orchestration. Not a Structural Intelligence domain.

CREATE TABLE IF NOT EXISTS engineering_structural_calculations (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id             UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id               TEXT NOT NULL,
  work_plan_id             UUID REFERENCES engineering_work_plans(id) ON DELETE SET NULL,
  work_kind                TEXT NOT NULL,
  revision                 TEXT NOT NULL,
  status                   TEXT NOT NULL,
  review_status            TEXT NOT NULL,
  input_fingerprint        TEXT NOT NULL,
  engine_id                TEXT NOT NULL,
  engine_version           TEXT NOT NULL,
  manifest                 JSONB NOT NULL DEFAULT '{}'::jsonb,
  result                   JSONB,
  design_basis             JSONB NOT NULL DEFAULT '{}'::jsonb,
  missing_codes            TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  supersedes_id            UUID REFERENCES engineering_structural_calculations(id) ON DELETE SET NULL,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by               TEXT,
  executed_at              TIMESTAMPTZ,
  reviewed_at              TIMESTAMPTZ,
  reviewed_by              TEXT,
  thread                   JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_eng_struct_calc_project
  ON engineering_structural_calculations (tenant_id, workspace_id, project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_eng_struct_calc_plan
  ON engineering_structural_calculations (work_plan_id);

DROP TRIGGER IF EXISTS engineering_struct_calc_workspace_tenant ON engineering_structural_calculations;
CREATE TRIGGER engineering_struct_calc_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_structural_calculations
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

CREATE OR REPLACE FUNCTION engineering_struct_calc_prevent_verified_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.review_status = 'VERIFIED_BY_ENGINEER'
     AND (
       NEW.input_fingerprint IS DISTINCT FROM OLD.input_fingerprint
       OR NEW.result IS DISTINCT FROM OLD.result
       OR NEW.manifest IS DISTINCT FROM OLD.manifest
       OR NEW.design_basis IS DISTINCT FROM OLD.design_basis
       OR NEW.project_id IS DISTINCT FROM OLD.project_id
       OR NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
       OR NEW.workspace_id IS DISTINCT FROM OLD.workspace_id
     ) THEN
    RAISE EXCEPTION 'verified_calculation_immutable';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS engineering_struct_calc_immutable ON engineering_structural_calculations;
CREATE TRIGGER engineering_struct_calc_immutable
  BEFORE UPDATE ON engineering_structural_calculations
  FOR EACH ROW EXECUTE FUNCTION engineering_struct_calc_prevent_verified_mutation();

COMMENT ON TABLE engineering_structural_calculations IS
  'EOS-A15A-V5 governed structural calculation overlay. Verification is engineer review of a deterministic result, not DESIGN_APPROVED.';

ALTER TABLE engineering_structural_calculations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eng_struct_calc_select ON engineering_structural_calculations;
DROP POLICY IF EXISTS eng_struct_calc_insert ON engineering_structural_calculations;
DROP POLICY IF EXISTS eng_struct_calc_update ON engineering_structural_calculations;
DROP POLICY IF EXISTS eng_struct_calc_delete ON engineering_structural_calculations;

CREATE POLICY eng_struct_calc_select ON engineering_structural_calculations
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_struct_calc_insert ON engineering_structural_calculations
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_struct_calc_update ON engineering_structural_calculations
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_struct_calc_delete ON engineering_structural_calculations
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );
