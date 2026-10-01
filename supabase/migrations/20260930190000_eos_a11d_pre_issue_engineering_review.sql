-- EOS-A11D: Automated Engineering Review & Pre-Issue Intelligence composition.
-- Additive after 20260930180000_eos_a11c_engineering_tool_orchestration.sql.
-- Links Work Plans to existing Engineering Review Package/Run. Does not store artifact bytes.

CREATE TABLE IF NOT EXISTS engineering_pre_issue_reviews (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id               UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id                 TEXT NOT NULL,
  work_plan_id               UUID REFERENCES engineering_work_plans(id) ON DELETE SET NULL,
  review_package_id          TEXT NOT NULL,
  review_run_id              TEXT NOT NULL,
  policy_code                TEXT NOT NULL DEFAULT 'EOS-PRE-ISSUE-REVIEW',
  policy_version             TEXT NOT NULL DEFAULT '1.0.0',
  snapshot                   JSONB NOT NULL DEFAULT '{}'::jsonb,
  target_artifact_id         TEXT,
  target_artifact_hash       TEXT,
  target_lineage_kind        TEXT NOT NULL DEFAULT 'GENERATED_DRAFT'
    CHECK (target_lineage_kind IN ('GENERATED_DRAFT', 'RETURNED_FROM_ENGINEER')),
  reviewing_generated_draft  BOOLEAN NOT NULL DEFAULT TRUE,
  result_state               TEXT NOT NULL CHECK (result_state IN (
    'NO_BLOCKING_CONDITIONS_IDENTIFIED',
    'ATTENTION_REQUIRED',
    'CONTEXT_STALE',
    'REVIEW_INCOMPLETE',
    'REVIEW_FAILED'
  )),
  staleness                  TEXT NOT NULL DEFAULT 'CURRENT' CHECK (staleness IN (
    'CURRENT', 'POTENTIALLY_STALE', 'STALE', 'RERUN_REQUIRED'
  )),
  semantic_ai_review         TEXT NOT NULL DEFAULT 'unavailable' CHECK (semantic_ai_review IN ('available', 'unavailable')),
  conditions                 JSONB NOT NULL DEFAULT '[]'::jsonb,
  passed_checks              JSONB NOT NULL DEFAULT '[]'::jsonb,
  not_evaluated              JSONB NOT NULL DEFAULT '[]'::jsonb,
  performance                JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by                 TEXT
);

CREATE INDEX IF NOT EXISTS idx_eng_pre_issue_reviews_ws
  ON engineering_pre_issue_reviews (tenant_id, workspace_id, work_plan_id, created_at DESC);

DROP TRIGGER IF EXISTS engineering_pre_issue_reviews_workspace_tenant ON engineering_pre_issue_reviews;
CREATE TRIGGER engineering_pre_issue_reviews_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_pre_issue_reviews
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

COMMENT ON TABLE engineering_pre_issue_reviews IS
  'EOS-A11D pre-issue review composition. References existing Review Package/Run and artifact hashes. A11D_BINARY_DUPLICATION = NO. Not a second review engine.';

ALTER TABLE engineering_pre_issue_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eng_pre_issue_reviews_select ON engineering_pre_issue_reviews;
DROP POLICY IF EXISTS eng_pre_issue_reviews_insert ON engineering_pre_issue_reviews;
DROP POLICY IF EXISTS eng_pre_issue_reviews_update ON engineering_pre_issue_reviews;
DROP POLICY IF EXISTS eng_pre_issue_reviews_delete ON engineering_pre_issue_reviews;

CREATE POLICY eng_pre_issue_reviews_select ON engineering_pre_issue_reviews
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_pre_issue_reviews_insert ON engineering_pre_issue_reviews
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_pre_issue_reviews_update ON engineering_pre_issue_reviews
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_pre_issue_reviews_delete ON engineering_pre_issue_reviews
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_pre_issue_reviews TO anon, authenticated, service_role;
