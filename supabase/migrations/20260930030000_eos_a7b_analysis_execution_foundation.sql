-- EOS-A7B — Multidisciplinary Analysis & Execution Foundation
-- Discipline-neutral Engineering Analysis Request. Distinct from Optimization Run.
-- Reuses Kernel background_jobs (engineering.analysis.execute). No second queue.
-- Reuses External Tool Governance. No vendor names in this schema.
-- Does not create discipline-specific findings tables or a graph store.

CREATE TABLE IF NOT EXISTS engineering_analysis_requests (
  id                                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                            UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id                         UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id                           UUID NOT NULL REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  discipline                           TEXT NOT NULL,
  capability                           TEXT NOT NULL,
  system_id                            UUID,
  asset_id                             UUID,
  interface_id                         UUID,
  configuration_baseline_id            UUID REFERENCES engineering_configuration_baselines(id) ON DELETE RESTRICT,
  requirement_ids                      JSONB NOT NULL DEFAULT '[]',
  assumption_ids                       JSONB NOT NULL DEFAULT '[]',
  applicable_standard_codes            JSONB NOT NULL DEFAULT '[]',
  supporting_document_ids              JSONB NOT NULL DEFAULT '[]',
  requested_external_tool_profile_id   UUID REFERENCES engineering_external_tool_profiles(id) ON DELETE SET NULL,
  requested_outputs                    JSONB NOT NULL DEFAULT '[]',
  execution_priority                   INTEGER,
  requested_by                         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  requested_at                         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_kind                           TEXT NOT NULL DEFAULT 'HUMAN' CHECK (actor_kind IN ('HUMAN', 'AI_AGENT', 'SYSTEM')),
  status                               TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'validating', 'blocked', 'ready', 'queued', 'executing', 'succeeded', 'failed', 'cancelled'
  )),
  synthetic_certification              BOOLEAN NOT NULL DEFAULT FALSE,
  original_analysis_request_id         UUID REFERENCES engineering_analysis_requests(id) ON DELETE SET NULL,
  created_at                           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata                             JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_eng_analysis_req_ws
  ON engineering_analysis_requests (tenant_id, workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_eng_analysis_req_project
  ON engineering_analysis_requests (project_id, discipline, capability);

CREATE TRIGGER engineering_analysis_requests_updated_at
  BEFORE UPDATE ON engineering_analysis_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE engineering_analysis_requests IS
  'EOS-A7B discipline-neutral Engineering Analysis Request. Not an Optimization Run. Synthetic certification rows are TEST/DEV only.';

CREATE TABLE IF NOT EXISTS engineering_analysis_execution_plans (
  id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id                  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id                    UUID NOT NULL REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  analysis_request_id           UUID NOT NULL REFERENCES engineering_analysis_requests(id) ON DELETE CASCADE,
  discipline                    TEXT NOT NULL,
  capability                    TEXT NOT NULL,
  configuration_baseline_id     UUID,
  requirement_ids               JSONB NOT NULL DEFAULT '[]',
  assumption_ids                JSONB NOT NULL DEFAULT '[]',
  standard_codes                JSONB NOT NULL DEFAULT '[]',
  interface_ids                 JSONB NOT NULL DEFAULT '[]',
  upstream_analysis_ids         JSONB NOT NULL DEFAULT '[]',
  external_tool_profile_id      UUID REFERENCES engineering_external_tool_profiles(id) ON DELETE SET NULL,
  adapter_id                    TEXT,
  adapter_version               TEXT,
  execution_host_id             TEXT,
  tool_version                  TEXT,
  requested_result_channels     JSONB NOT NULL DEFAULT '[]',
  unit_context                  TEXT,
  execution_policy              JSONB NOT NULL DEFAULT '{}',
  manifest                      JSONB NOT NULL,
  analysis_input_fingerprint    TEXT NOT NULL,
  frozen                        BOOLEAN NOT NULL DEFAULT FALSE,
  frozen_at                     TIMESTAMPTZ,
  status                        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'frozen', 'queued', 'executing', 'completed', 'failed', 'cancelled'
  )),
  created_by                    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eng_analysis_plan_request
  ON engineering_analysis_execution_plans (analysis_request_id);
CREATE INDEX IF NOT EXISTS idx_eng_analysis_plan_fp
  ON engineering_analysis_execution_plans (analysis_input_fingerprint);

CREATE TRIGGER engineering_analysis_execution_plans_updated_at
  BEFORE UPDATE ON engineering_analysis_execution_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE engineering_analysis_execution_plans IS
  'Frozen analysis execution plan. Execution-critical fields are immutable after freeze.';

CREATE OR REPLACE FUNCTION engineering_analysis_plan_immutable()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.frozen = TRUE THEN
    IF NEW.analysis_input_fingerprint IS DISTINCT FROM OLD.analysis_input_fingerprint
      OR NEW.manifest IS DISTINCT FROM OLD.manifest
      OR NEW.discipline IS DISTINCT FROM OLD.discipline
      OR NEW.capability IS DISTINCT FROM OLD.capability
      OR NEW.external_tool_profile_id IS DISTINCT FROM OLD.external_tool_profile_id
      OR NEW.adapter_id IS DISTINCT FROM OLD.adapter_id
      OR NEW.tool_version IS DISTINCT FROM OLD.tool_version
      OR NEW.adapter_version IS DISTINCT FROM OLD.adapter_version
    THEN
      RAISE EXCEPTION 'execution_plan_immutable';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS engineering_analysis_plan_immutable ON engineering_analysis_execution_plans;
CREATE TRIGGER engineering_analysis_plan_immutable
  BEFORE UPDATE ON engineering_analysis_execution_plans
  FOR EACH ROW EXECUTE FUNCTION engineering_analysis_plan_immutable();

CREATE TABLE IF NOT EXISTS engineering_analysis_results (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id            UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id              UUID NOT NULL REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  analysis_request_id     UUID NOT NULL REFERENCES engineering_analysis_requests(id) ON DELETE CASCADE,
  execution_plan_id       UUID REFERENCES engineering_analysis_execution_plans(id) ON DELETE SET NULL,
  job_id                  UUID,
  execution_ref           TEXT,
  discipline              TEXT NOT NULL,
  capability              TEXT NOT NULL,
  execution_succeeded     BOOLEAN NOT NULL DEFAULT FALSE,
  result_valid            BOOLEAN NOT NULL DEFAULT FALSE,
  status                  TEXT NOT NULL DEFAULT 'FAILED' CHECK (status IN ('SUCCEEDED', 'FAILED', 'INCOMPLETE', 'BLOCKED')),
  metrics                 JSONB NOT NULL DEFAULT '[]',
  warnings                JSONB NOT NULL DEFAULT '[]',
  limitations             JSONB NOT NULL DEFAULT '[]',
  result_artifacts        JSONB NOT NULL DEFAULT '[]',
  provenance              JSONB NOT NULL DEFAULT '{}',
  review_state            TEXT NOT NULL DEFAULT 'not_reviewed' CHECK (review_state IN ('not_reviewed', 'in_review', 'accepted', 'rejected')),
  acceptance_state        TEXT NOT NULL DEFAULT 'UNREVIEWED' CHECK (acceptance_state IN (
    'UNREVIEWED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'SUPERSEDED'
  )),
  accepted_by             UUID REFERENCES profiles(id) ON DELETE SET NULL,
  accepted_at             TIMESTAMPTZ,
  acceptance_rationale    TEXT,
  stale                   BOOLEAN NOT NULL DEFAULT FALSE,
  stale_reasons           JSONB NOT NULL DEFAULT '[]',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eng_analysis_result_request
  ON engineering_analysis_results (analysis_request_id);
CREATE INDEX IF NOT EXISTS idx_eng_analysis_result_ws
  ON engineering_analysis_results (tenant_id, workspace_id);

CREATE TRIGGER engineering_analysis_results_updated_at
  BEFORE UPDATE ON engineering_analysis_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE engineering_analysis_results IS
  'Normalized analysis result envelope. execution_succeeded is distinct from result_valid and from human acceptance.';

ALTER TABLE engineering_analysis_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_analysis_execution_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_analysis_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY eng_analysis_req_select ON engineering_analysis_requests
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_analysis_req_insert ON engineering_analysis_requests
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_analysis_req_update ON engineering_analysis_requests
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_analysis_req_delete ON engineering_analysis_requests
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_analysis_plan_select ON engineering_analysis_execution_plans
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_analysis_plan_insert ON engineering_analysis_execution_plans
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_analysis_plan_update ON engineering_analysis_execution_plans
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_analysis_plan_delete ON engineering_analysis_execution_plans
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_analysis_result_select ON engineering_analysis_results
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_analysis_result_insert ON engineering_analysis_results
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_analysis_result_update ON engineering_analysis_results
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_analysis_result_delete ON engineering_analysis_results
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );
