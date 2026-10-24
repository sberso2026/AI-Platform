-- EOS-A10B: Engineering Work Context & Information Flow.
-- Additive after 20260930130000_eos_a10a_engineering_information_intelligence.sql.
-- Tracks material engineering work events from allowlisted managed repositories.
-- Does not capture keystrokes, personal files, browser history, or employee productivity.

CREATE TABLE IF NOT EXISTS engineering_managed_repositories (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id               UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id                 TEXT,
  scope                      TEXT NOT NULL CHECK (scope IN ('TENANT', 'WORKSPACE', 'PROJECT')),
  repository_type            TEXT NOT NULL CHECK (repository_type IN (
    'SHAREPOINT_LIBRARY', 'NETWORK_FOLDER', 'CORPORATE_SYNCED_FOLDER',
    'ENGINEERING_EDMS', 'ENGINEERING_APPLICATION', 'PROJECT_MAILBOX',
    'PROJECT_TEAMS_CHANNEL', 'OTHER_APPROVED_ENTERPRISE_SOURCE'
  )),
  external_repository_id     TEXT,
  display_name               TEXT NOT NULL,
  approved_root              TEXT,
  connection_id              TEXT,
  enabled                    BOOLEAN NOT NULL DEFAULT FALSE,
  capture_policy             TEXT NOT NULL DEFAULT 'DENY' CHECK (capture_policy IN ('DENY', 'MANAGED')),
  created_by                 TEXT,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (scope <> 'PROJECT' OR project_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_eng_managed_repositories_ws
  ON engineering_managed_repositories (tenant_id, workspace_id, project_id, enabled);

DROP TRIGGER IF EXISTS engineering_managed_repositories_updated_at ON engineering_managed_repositories;
CREATE TRIGGER engineering_managed_repositories_updated_at
  BEFORE UPDATE ON engineering_managed_repositories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS engineering_managed_repositories_workspace_tenant ON engineering_managed_repositories;
CREATE TRIGGER engineering_managed_repositories_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_managed_repositories
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

COMMENT ON TABLE engineering_managed_repositories IS
  'EOS-A10B allowlisted managed engineering repository. Trust is repository identity, not drive letter. Connector secrets are not stored here. DEFAULT capture policy DENY.';

CREATE TABLE IF NOT EXISTS engineering_work_events (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id               UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id                 TEXT NOT NULL,
  event_type                 TEXT NOT NULL,
  source_system              TEXT NOT NULL,
  source_object_type         TEXT NOT NULL,
  source_object_id           TEXT NOT NULL,
  source_event_id            TEXT NOT NULL,
  information_ref_id         TEXT,
  discipline_id              TEXT,
  system_id                  TEXT,
  asset_id                   TEXT,
  deliverable_id             TEXT,
  lifecycle_stage            TEXT,
  actor_id                   TEXT,
  occurred_at                TIMESTAMPTZ NOT NULL,
  recorded_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  managed_repository_id      UUID REFERENCES engineering_managed_repositories(id) ON DELETE SET NULL,
  materiality                TEXT NOT NULL CHECK (materiality IN ('MATERIAL', 'ROUTINE', 'INFORMATIONAL')),
  confirmation_state         TEXT NOT NULL DEFAULT 'NOT_REQUIRED' CHECK (confirmation_state IN ('NOT_REQUIRED', 'CANDIDATE', 'CONFIRMED', 'REJECTED')),
  capture_reason             TEXT NOT NULL,
  provenance                 JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_to_event_bus     BOOLEAN NOT NULL DEFAULT FALSE,
  retention_class            TEXT NOT NULL DEFAULT 'engineering_metadata',
  UNIQUE (tenant_id, workspace_id, source_system, source_event_id)
);

CREATE INDEX IF NOT EXISTS idx_eng_work_events_ws
  ON engineering_work_events (tenant_id, workspace_id, project_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_eng_work_events_type
  ON engineering_work_events (tenant_id, workspace_id, event_type, materiality);

DROP TRIGGER IF EXISTS engineering_work_events_workspace_tenant ON engineering_work_events;
CREATE TRIGGER engineering_work_events_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_work_events
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

COMMENT ON TABLE engineering_work_events IS
  'EOS-A10B material engineering workflow event. Not an audit log copy and not employee activity telemetry. Source object content is not duplicated. Retention follows platform engineering-metadata conventions.';

ALTER TABLE engineering_managed_repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_work_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eng_managed_repositories_select ON engineering_managed_repositories;
DROP POLICY IF EXISTS eng_managed_repositories_insert ON engineering_managed_repositories;
DROP POLICY IF EXISTS eng_managed_repositories_update ON engineering_managed_repositories;
DROP POLICY IF EXISTS eng_managed_repositories_delete ON engineering_managed_repositories;

CREATE POLICY eng_managed_repositories_select ON engineering_managed_repositories
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_managed_repositories_insert ON engineering_managed_repositories
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_managed_repositories_update ON engineering_managed_repositories
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_managed_repositories_delete ON engineering_managed_repositories
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eng_work_events_select ON engineering_work_events;
DROP POLICY IF EXISTS eng_work_events_insert ON engineering_work_events;
DROP POLICY IF EXISTS eng_work_events_update ON engineering_work_events;
DROP POLICY IF EXISTS eng_work_events_delete ON engineering_work_events;

CREATE POLICY eng_work_events_select ON engineering_work_events
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_work_events_insert ON engineering_work_events
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_work_events_update ON engineering_work_events
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_work_events_delete ON engineering_work_events
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_managed_repositories TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_work_events TO anon, authenticated, service_role;
