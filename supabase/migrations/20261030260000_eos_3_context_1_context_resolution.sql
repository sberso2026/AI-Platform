-- EOS-3-CONTEXT-1 Context Resolution Engine
-- Minimal persistence for session overrides / recency pointers only.
-- Derived Context Snapshots are NOT persisted as engineering truth.
-- Rollback: DROP TABLE eos3_context_overrides; DROP TABLE eos3_context_recency;

CREATE TABLE IF NOT EXISTS eos3_context_overrides (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id                UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id                     TEXT NOT NULL,
  project_id                  TEXT,
  work_package_stable_id      TEXT,
  set_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at                  TIMESTAMPTZ,
  mutates_canonical_state     BOOLEAN NOT NULL DEFAULT FALSE,
  provenance                  JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_eos3_context_overrides_ws_user
  ON eos3_context_overrides (workspace_id, user_id);

DROP TRIGGER IF EXISTS eos3_context_overrides_updated_at ON eos3_context_overrides;
CREATE TRIGGER eos3_context_overrides_updated_at
  BEFORE UPDATE ON eos3_context_overrides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE eos3_context_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_context_overrides_select ON eos3_context_overrides;
CREATE POLICY eos3_context_overrides_select ON eos3_context_overrides
  FOR SELECT USING (engineering_core_workspace_member(workspace_id));

DROP POLICY IF EXISTS eos3_context_overrides_write ON eos3_context_overrides;
CREATE POLICY eos3_context_overrides_write ON eos3_context_overrides
  FOR ALL USING (engineering_core_workspace_member(workspace_id))
  WITH CHECK (engineering_core_workspace_member(workspace_id));

CREATE TABLE IF NOT EXISTS eos3_context_recency (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id                UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id                     TEXT NOT NULL,
  project_id                  TEXT NOT NULL,
  work_package_stable_id      TEXT,
  last_seen_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, user_id)
);

ALTER TABLE eos3_context_recency ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_context_recency_select ON eos3_context_recency;
CREATE POLICY eos3_context_recency_select ON eos3_context_recency
  FOR SELECT USING (engineering_core_workspace_member(workspace_id));

DROP POLICY IF EXISTS eos3_context_recency_write ON eos3_context_recency;
CREATE POLICY eos3_context_recency_write ON eos3_context_recency
  FOR ALL USING (engineering_core_workspace_member(workspace_id))
  WITH CHECK (engineering_core_workspace_member(workspace_id));
