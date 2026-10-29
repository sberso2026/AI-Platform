-- EOS 3.7 AI Orchestration and Engineering Reasoning.
-- Additive. Staging/development only.
-- AI_REASONING != ENGINEERING_AUTHORITY; no Production exposure.

CREATE TABLE IF NOT EXISTS eos3_ai_orchestration_plans (
  task_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id         UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id           TEXT NOT NULL,
  user_id              TEXT,
  user_request         TEXT NOT NULL,
  task_class           TEXT NOT NULL,
  status               TEXT NOT NULL,
  authority_required   TEXT NOT NULL,
  policy_result        JSONB NOT NULL DEFAULT '{}'::jsonb,
  planned_steps        JSONB NOT NULL DEFAULT '[]'::jsonb,
  human_checkpoints    JSONB NOT NULL DEFAULT '[]'::jsonb,
  execution_limits     JSONB NOT NULL DEFAULT '{}'::jsonb,
  usage                JSONB NOT NULL DEFAULT '{}'::jsonb,
  model_identity       JSONB NOT NULL DEFAULT '{}'::jsonb,
  reasoning_evidence   JSONB NOT NULL DEFAULT '{}'::jsonb,
  provenance           JSONB NOT NULL DEFAULT '{}'::jsonb,
  chain_of_thought_stored BOOLEAN NOT NULL DEFAULT FALSE CHECK (chain_of_thought_stored = FALSE),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (task_class <> 'APPROVE')
);

CREATE INDEX IF NOT EXISTS idx_eos3_ai_orch_ws
  ON eos3_ai_orchestration_plans (tenant_id, workspace_id, created_at DESC);

DROP TRIGGER IF EXISTS eos3_ai_orch_updated_at ON eos3_ai_orchestration_plans;
CREATE TRIGGER eos3_ai_orch_updated_at
  BEFORE UPDATE ON eos3_ai_orchestration_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE eos3_ai_orchestration_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_ai_orch_select ON eos3_ai_orchestration_plans;
CREATE POLICY eos3_ai_orch_select ON eos3_ai_orchestration_plans
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_ai_orch_write ON eos3_ai_orchestration_plans;
CREATE POLICY eos3_ai_orch_write ON eos3_ai_orchestration_plans
  FOR ALL USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE TABLE IF NOT EXISTS eos3_ai_draft_artifacts (
  draft_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id   UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id     TEXT NOT NULL,
  task_id        UUID REFERENCES eos3_ai_orchestration_plans(task_id) ON DELETE SET NULL,
  artifact_type  TEXT NOT NULL,
  content        JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_assisted    BOOLEAN NOT NULL DEFAULT TRUE CHECK (ai_assisted = TRUE),
  approved       BOOLEAN NOT NULL DEFAULT FALSE CHECK (approved = FALSE),
  provenance     JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE eos3_ai_draft_artifacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_ai_draft_select ON eos3_ai_draft_artifacts;
CREATE POLICY eos3_ai_draft_select ON eos3_ai_draft_artifacts
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_ai_draft_write ON eos3_ai_draft_artifacts;
CREATE POLICY eos3_ai_draft_write ON eos3_ai_draft_artifacts
  FOR ALL USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

COMMENT ON TABLE eos3_ai_orchestration_plans IS
  'EOS 3.7 AI orchestration plans. AI cannot APPROVE. Chain-of-thought never stored.';
COMMENT ON TABLE eos3_ai_draft_artifacts IS
  'EOS 3.7 AI draft artifacts. ai_assisted=true; approved always false at insert.';
