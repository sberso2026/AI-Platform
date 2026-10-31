-- EOS-3-CONTEXT-2 Risk-Prioritized My Work
-- Minimal: priority overrides only. Snapshots are derived, not engineering truth.
-- Rollback: DROP TABLE eos3_my_work_priority_overrides;

CREATE TABLE IF NOT EXISTS eos3_my_work_priority_overrides (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id            UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id                 TEXT NOT NULL,
  attention_id            TEXT NOT NULL,
  object_stable_id        TEXT NOT NULL,
  original_band           TEXT NOT NULL,
  adjusted_band           TEXT NOT NULL,
  reason                  TEXT NOT NULL DEFAULT '',
  actor_id                TEXT NOT NULL,
  non_destructive         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, attention_id)
);

CREATE INDEX IF NOT EXISTS idx_eos3_mw_priority_ws_user
  ON eos3_my_work_priority_overrides (workspace_id, user_id);

DROP TRIGGER IF EXISTS eos3_mw_priority_overrides_updated_at ON eos3_my_work_priority_overrides;
CREATE TRIGGER eos3_mw_priority_overrides_updated_at
  BEFORE UPDATE ON eos3_my_work_priority_overrides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE eos3_my_work_priority_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_mw_priority_select ON eos3_my_work_priority_overrides;
CREATE POLICY eos3_mw_priority_select ON eos3_my_work_priority_overrides
  FOR SELECT USING (engineering_core_workspace_member(workspace_id));

DROP POLICY IF EXISTS eos3_mw_priority_write ON eos3_my_work_priority_overrides;
CREATE POLICY eos3_mw_priority_write ON eos3_my_work_priority_overrides
  FOR ALL USING (engineering_core_workspace_member(workspace_id))
  WITH CHECK (engineering_core_workspace_member(workspace_id));
