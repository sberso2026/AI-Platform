-- EOS-A11C: Engineering Tool Orchestration & round-trip handoff.
-- Additive after 20260930170000_eos_a11b_engineering_artifact_automation.sql.
-- Stores governed handoff metadata and returned-artifact lineage. Not a DMS, Event Bus, or desktop agent.

ALTER TABLE engineering_generated_artifacts
  ADD COLUMN IF NOT EXISTS lineage_kind TEXT NOT NULL DEFAULT 'GENERATED_DRAFT',
  ADD COLUMN IF NOT EXISTS origin_artifact_id UUID REFERENCES engineering_generated_artifacts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS origin_generation_run_id UUID,
  ADD COLUMN IF NOT EXISTS origin_sha256 TEXT,
  ADD COLUMN IF NOT EXISTS returned_by TEXT,
  ADD COLUMN IF NOT EXISTS returned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS malware_scan_status TEXT NOT NULL DEFAULT 'NOT_APPLICABLE';

ALTER TABLE engineering_generated_artifacts DROP CONSTRAINT IF EXISTS engineering_generated_artifacts_lineage_kind_check;
ALTER TABLE engineering_generated_artifacts
  ADD CONSTRAINT engineering_generated_artifacts_lineage_kind_check
  CHECK (lineage_kind IN ('GENERATED_DRAFT', 'RETURNED_FROM_ENGINEER'));

CREATE TABLE IF NOT EXISTS engineering_tool_handoffs (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id         UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id           TEXT NOT NULL,
  work_plan_id         UUID REFERENCES engineering_work_plans(id) ON DELETE SET NULL,
  artifact_id          UUID REFERENCES engineering_generated_artifacts(id) ON DELETE SET NULL,
  source_ref           TEXT,
  tool_code            TEXT NOT NULL,
  capability           TEXT NOT NULL,
  handoff_mode         TEXT NOT NULL CHECK (handoff_mode IN (
    'BROWSER_DOWNLOAD', 'MANAGED_REPOSITORY_OPEN', 'DESKTOP_BRIDGE', 'EXECUTION_HOST'
  )),
  status               TEXT NOT NULL CHECK (status IN (
    'PREPARED', 'HANDED_OFF', 'EXTERNAL_WORK_IN_PROGRESS', 'RETURN_PENDING',
    'RETURNED_TO_MANAGED_REPOSITORY', 'PUBLISHED', 'SUPERSEDED', 'FAILED'
  )),
  requested_by         TEXT,
  requested_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at           TIMESTAMPTZ NOT NULL,
  token_hash           TEXT NOT NULL DEFAULT '',
  consumed_at          TIMESTAMPTZ,
  input_fingerprint    TEXT,
  failure              TEXT,
  explanation          TEXT NOT NULL DEFAULT '',
  protocol_url         TEXT
);

CREATE INDEX IF NOT EXISTS idx_eng_tool_handoffs_ws
  ON engineering_tool_handoffs (tenant_id, workspace_id, work_plan_id, requested_at DESC);

DROP TRIGGER IF EXISTS engineering_tool_handoffs_workspace_tenant ON engineering_tool_handoffs;
CREATE TRIGGER engineering_tool_handoffs_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_tool_handoffs
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

COMMENT ON TABLE engineering_tool_handoffs IS
  'EOS-A11C governed tool handoff. Opaque token hash only. Not desktop surveillance or arbitrary executable launch.';

ALTER TABLE engineering_tool_handoffs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eng_tool_handoffs_select ON engineering_tool_handoffs;
DROP POLICY IF EXISTS eng_tool_handoffs_insert ON engineering_tool_handoffs;
DROP POLICY IF EXISTS eng_tool_handoffs_update ON engineering_tool_handoffs;
DROP POLICY IF EXISTS eng_tool_handoffs_delete ON engineering_tool_handoffs;

CREATE POLICY eng_tool_handoffs_select ON engineering_tool_handoffs
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_tool_handoffs_insert ON engineering_tool_handoffs
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_tool_handoffs_update ON engineering_tool_handoffs
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_tool_handoffs_delete ON engineering_tool_handoffs
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_tool_handoffs TO anon, authenticated, service_role;
