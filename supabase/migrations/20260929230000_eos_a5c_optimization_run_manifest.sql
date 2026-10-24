-- EOS-A5C Optimization Execution & Reproducibility Closeout
-- Additive: immutable Run Input Manifest + run_input_fingerprint.
-- Does NOT create a job queue, execution host, graph store, or structural solver.
-- Does NOT add a Decision selected-alternative column.

ALTER TABLE engineering_optimization_studies
  ADD COLUMN IF NOT EXISTS context_fingerprint TEXT;

COMMENT ON COLUMN engineering_optimization_studies.context_fingerprint IS
  'EOS-A5C SHA-256 of material study context (systems, decision, requirements, material assumptions, interfaces, baseline id). Derived at READY. Staleness compares live projections to this value; historical runs are not rewritten.';

ALTER TABLE engineering_optimization_runs
  ADD COLUMN IF NOT EXISTS run_input_fingerprint TEXT;

COMMENT ON COLUMN engineering_optimization_runs.run_input_fingerprint IS
  'EOS-A5C SHA-256 of the frozen Run Input Manifest. Distinct from baseline_fingerprint (configuration items only).';

COMMENT ON COLUMN engineering_optimization_runs.baseline_fingerprint IS
  'EOS-A5 SHA-256 of pinned configuration items. Unchanged by A5C. Answers: what frozen configuration was evaluated?';

-- ─── Immutable Run Input Manifest (one per run) ──────────────────────────────

CREATE TABLE IF NOT EXISTS engineering_optimization_run_manifests (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id                UUID REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  study_id                  UUID NOT NULL REFERENCES engineering_optimization_studies(id) ON DELETE RESTRICT,
  run_id                    UUID NOT NULL REFERENCES engineering_optimization_runs(id) ON DELETE RESTRICT,
  manifest_schema_version   INTEGER NOT NULL DEFAULT 1 CHECK (manifest_schema_version >= 1),
  manifest                  JSONB NOT NULL,
  run_input_fingerprint     TEXT NOT NULL,
  frozen_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (run_id),
  CONSTRAINT engineering_optimization_run_manifests_object
    CHECK (jsonb_typeof(manifest) = 'object'),
  CONSTRAINT engineering_optimization_run_manifests_version_field
    CHECK ((manifest ->> 'manifest_schema_version') IS NOT NULL)
);

CREATE INDEX idx_eng_opt_run_manifests_run ON engineering_optimization_run_manifests(run_id);
CREATE INDEX idx_eng_opt_run_manifests_ws ON engineering_optimization_run_manifests(tenant_id, workspace_id);
CREATE INDEX idx_eng_opt_runs_input_fp ON engineering_optimization_runs(run_input_fingerprint);

COMMENT ON TABLE engineering_optimization_run_manifests IS
  'EOS-A5C canonical immutable Optimization Run Input Manifest (schema v1). Execution-time evidence of the complete problem definition. Not a second canonical copy of Requirements/Assumptions/Interfaces.';

CREATE TRIGGER engineering_optimization_run_manifests_scope
  BEFORE INSERT OR UPDATE ON engineering_optimization_run_manifests
  FOR EACH ROW EXECUTE FUNCTION engineering_optimization_copy_run_scope();

-- ─── Manifest immutability (queued/running/terminal evidence) ────────────────

CREATE OR REPLACE FUNCTION engineering_optimization_run_manifest_immutable()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' AND auth.role() = 'service_role' THEN
    RETURN OLD;
  END IF;
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'optimization run input manifest is immutable historical evidence';
  END IF;
  RAISE EXCEPTION 'optimization run input manifest is immutable; create a new run';
END;
$$ LANGUAGE plpgsql SECURITY INVOKER
SET search_path = public, pg_temp;

CREATE TRIGGER engineering_optimization_run_manifests_immutable
  BEFORE UPDATE OR DELETE ON engineering_optimization_run_manifests
  FOR EACH ROW EXECUTE FUNCTION engineering_optimization_run_manifest_immutable();

-- ─── Strengthen run immutability: freeze fingerprints and execution identity ─

CREATE OR REPLACE FUNCTION engineering_optimization_run_immutable()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.role() = 'service_role' AND TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  IF TG_OP = 'DELETE' THEN
    IF OLD.status IN ('queued', 'running', 'succeeded', 'failed', 'cancelled') THEN
      RAISE EXCEPTION 'optimization run evidence cannot be deleted after queue';
    END IF;
    RETURN OLD;
  END IF;

  IF NEW.baseline_fingerprint IS DISTINCT FROM OLD.baseline_fingerprint
     OR NEW.run_input_fingerprint IS DISTINCT FROM OLD.run_input_fingerprint
     OR NEW.configuration_baseline_id IS DISTINCT FROM OLD.configuration_baseline_id
     OR NEW.alternative_id IS DISTINCT FROM OLD.alternative_id
     OR NEW.scenario_id IS DISTINCT FROM OLD.scenario_id
     OR NEW.analysis_engine IS DISTINCT FROM OLD.analysis_engine
     OR NEW.adapter_id IS DISTINCT FROM OLD.adapter_id
     OR NEW.adapter_version IS DISTINCT FROM OLD.adapter_version
     OR NEW.algorithm_id IS DISTINCT FROM OLD.algorithm_id
     OR NEW.algorithm_version IS DISTINCT FROM OLD.algorithm_version
     OR NEW.random_seed IS DISTINCT FROM OLD.random_seed THEN
    RAISE EXCEPTION 'optimization run input identity is immutable after queue; create a new run';
  END IF;

  IF OLD.execution_ref IS NOT NULL AND NEW.execution_ref IS DISTINCT FROM OLD.execution_ref THEN
    RAISE EXCEPTION 'optimization run execution_ref is immutable once set';
  END IF;

  IF OLD.status = 'succeeded' AND NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'succeeded optimization run evidence is immutable; create a new run';
  END IF;

  IF OLD.status IN ('failed', 'cancelled') AND NEW.status NOT IN (OLD.status) THEN
    -- Retries keep the same run row and may move failed -> running via JobService
    -- only when CURRENT status is failed and the handler re-enters execution.
    IF NOT (OLD.status = 'failed' AND NEW.status IN ('running', 'failed', 'succeeded')) THEN
      RAISE EXCEPTION 'terminal optimization run status cannot be rewritten except failed-run retry';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER
SET search_path = public, pg_temp;

-- ─── RLS (inherit run workspace ownership) ───────────────────────────────────

ALTER TABLE engineering_optimization_run_manifests ENABLE ROW LEVEL SECURITY;

CREATE POLICY eng_optimization_run_manifests_select ON engineering_optimization_run_manifests
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_optimization_run_manifests_insert ON engineering_optimization_run_manifests
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_optimization_run_manifests_update ON engineering_optimization_run_manifests
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_optimization_run_manifests_delete ON engineering_optimization_run_manifests
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_optimization_run_manifests TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION engineering_optimization_run_manifest_immutable() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION engineering_optimization_run_immutable() TO anon, authenticated, service_role;
