-- EOS 3.4 Decision Intelligence + Optimization Intelligence foundation tables.
-- Additive. Staging/development only. Does not edit prior EOS 3 migrations or EOS 2 tables.
-- ANALYSIS != RECOMMENDATION != HUMAN_DECISION; OPTIMIZATION_RUN != DECISION; no D1 inheritance.

CREATE TABLE IF NOT EXISTS eos3_decision_cases (
  case_id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id            UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id              TEXT NOT NULL,
  subject                 TEXT NOT NULL,
  decision_question       TEXT NOT NULL,
  decision_owner_id       TEXT NOT NULL,
  decision_authority_role TEXT NOT NULL,
  lifecycle               TEXT NOT NULL DEFAULT 'DRAFT'
                          CHECK (lifecycle IN ('DRAFT','ANALYSIS','READY_FOR_HUMAN_DECISION','DECIDED','SUPERSEDED')),
  uncertainty             TEXT NOT NULL DEFAULT 'unknown',
  linked_decision_object_id UUID,
  revision                INTEGER NOT NULL DEFAULT 1,
  superseded_by_case_id   UUID,
  stale                   BOOLEAN NOT NULL DEFAULT FALSE,
  payload                 JSONB NOT NULL DEFAULT '{}'::jsonb,
  provenance              JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eos3_decision_cases_ws
  ON eos3_decision_cases (tenant_id, workspace_id, project_id);

DROP TRIGGER IF EXISTS eos3_decision_cases_updated_at ON eos3_decision_cases;
CREATE TRIGGER eos3_decision_cases_updated_at
  BEFORE UPDATE ON eos3_decision_cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE eos3_decision_cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_decision_cases_select ON eos3_decision_cases;
CREATE POLICY eos3_decision_cases_select ON eos3_decision_cases
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_decision_cases_write ON eos3_decision_cases;
CREATE POLICY eos3_decision_cases_write ON eos3_decision_cases
  FOR ALL USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE TABLE IF NOT EXISTS eos3_decision_audit (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  case_id      UUID REFERENCES eos3_decision_cases(case_id) ON DELETE SET NULL,
  action       TEXT NOT NULL,
  actor_id     TEXT,
  detail       JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE eos3_decision_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_decision_audit_select ON eos3_decision_audit;
CREATE POLICY eos3_decision_audit_select ON eos3_decision_audit
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_decision_audit_insert ON eos3_decision_audit;
CREATE POLICY eos3_decision_audit_insert ON eos3_decision_audit
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE TABLE IF NOT EXISTS eos3_optimization_runs (
  run_id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id                UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id                  TEXT NOT NULL,
  problem_payload             JSONB NOT NULL DEFAULT '{}'::jsonb,
  status                      TEXT NOT NULL CHECK (status IN ('COMPLETE','NO_FEASIBLE_SOLUTION')),
  feasible_count              INTEGER NOT NULL DEFAULT 0,
  human_selection_candidate_id TEXT,
  linked_decision_case_id     UUID REFERENCES eos3_decision_cases(case_id) ON DELETE SET NULL,
  qualification_state         TEXT NOT NULL DEFAULT 'NOT_QUALIFIED',
  inherits_d1_qualification   BOOLEAN NOT NULL DEFAULT FALSE CHECK (inherits_d1_qualification = FALSE),
  reproducible_seed           TEXT NOT NULL,
  provenance                  JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eos3_optimization_runs_ws
  ON eos3_optimization_runs (tenant_id, workspace_id, project_id);

ALTER TABLE eos3_optimization_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_optimization_runs_select ON eos3_optimization_runs;
CREATE POLICY eos3_optimization_runs_select ON eos3_optimization_runs
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_optimization_runs_write ON eos3_optimization_runs;
CREATE POLICY eos3_optimization_runs_write ON eos3_optimization_runs
  FOR ALL USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE TABLE IF NOT EXISTS eos3_optimization_audit (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  run_id       UUID REFERENCES eos3_optimization_runs(run_id) ON DELETE SET NULL,
  action       TEXT NOT NULL,
  actor_id     TEXT,
  detail       JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE eos3_optimization_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_optimization_audit_select ON eos3_optimization_audit;
CREATE POLICY eos3_optimization_audit_select ON eos3_optimization_audit
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_optimization_audit_insert ON eos3_optimization_audit;
CREATE POLICY eos3_optimization_audit_insert ON eos3_optimization_audit
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

COMMENT ON TABLE eos3_decision_cases IS
  'EOS 3.4 Decision Intelligence cases. Human authority required for DECIDED.';
COMMENT ON TABLE eos3_optimization_runs IS
  'EOS 3.4 Optimization runs. NOT a Decision. Does not inherit D1 qualification.';
