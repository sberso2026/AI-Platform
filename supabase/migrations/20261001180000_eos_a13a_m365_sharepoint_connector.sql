-- EOS-A13A: Microsoft 365 / SharePoint connector foundation.
-- Additive after 20261001120000_eos_a12b_engineering_attention.sql.
-- External system owns source binaries. EOS stores connection references,
-- managed-repository scope, sync cursors, and metadata-first source identity.
-- Connector secrets, OAuth tokens, and file binaries are not stored here.

CREATE TABLE IF NOT EXISTS engineering_m365_connections (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id              UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id           UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  display_name           TEXT NOT NULL,
  microsoft_tenant_id    TEXT NOT NULL,
  application_id         TEXT NOT NULL,
  credential_secret_id   TEXT NOT NULL,
  auth_mode              TEXT NOT NULL DEFAULT 'CLIENT_SECRET'
    CHECK (auth_mode IN ('CLIENT_SECRET', 'CERTIFICATE', 'MANAGED_IDENTITY')),
  status                 TEXT NOT NULL DEFAULT 'NOT_CONFIGURED',
  enabled                BOOLEAN NOT NULL DEFAULT FALSE,
  created_by             TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eng_m365_connections_ws
  ON engineering_m365_connections (tenant_id, workspace_id);

COMMENT ON TABLE engineering_m365_connections IS
  'EOS-A13A Microsoft 365 connection. Stores tenant/application identifiers and a Secrets service reference only. Client secrets, certificates, refresh tokens, and access tokens must not be stored here.';

CREATE TABLE IF NOT EXISTS engineering_sharepoint_scopes (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id           UUID NOT NULL REFERENCES engineering_managed_repositories(id) ON DELETE CASCADE,
  tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id            UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  connection_id           UUID NOT NULL REFERENCES engineering_m365_connections(id) ON DELETE RESTRICT,
  external_site_id        TEXT NOT NULL,
  external_drive_id       TEXT NOT NULL,
  approved_root_item_id   TEXT,
  content_access_policy   TEXT NOT NULL DEFAULT 'METADATA_ONLY'
    CHECK (content_access_policy IN ('METADATA_ONLY', 'ON_DEMAND_CONTENT', 'INDEX_APPROVED_TYPES')),
  publication_enabled     BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (repository_id)
);

CREATE INDEX IF NOT EXISTS idx_eng_sharepoint_scopes_ws
  ON engineering_sharepoint_scopes (tenant_id, workspace_id, connection_id);

COMMENT ON TABLE engineering_sharepoint_scopes IS
  'EOS-A13A approved SharePoint site/library/root bound to a ManagedEngineeringRepository. Unregistered sites are not ingested.';

CREATE TABLE IF NOT EXISTS engineering_connector_sync_state (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id            UUID NOT NULL UNIQUE REFERENCES engineering_managed_repositories(id) ON DELETE CASCADE,
  tenant_id                UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id             UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  status                   TEXT NOT NULL DEFAULT 'NOT_CONFIGURED',
  delta_token              TEXT,
  last_successful_sync_at  TIMESTAMPTZ,
  last_attempted_sync_at   TIMESTAMPTZ,
  last_error               TEXT,
  items_scanned            INTEGER NOT NULL DEFAULT 0,
  items_changed            INTEGER NOT NULL DEFAULT 0,
  throttle_count           INTEGER NOT NULL DEFAULT 0,
  retry_count              INTEGER NOT NULL DEFAULT 0,
  next_retry_at            TIMESTAMPTZ,
  resync_required          BOOLEAN NOT NULL DEFAULT FALSE,
  duration_ms              INTEGER NOT NULL DEFAULT 0
);

COMMENT ON TABLE engineering_connector_sync_state IS
  'EOS-A13A SharePoint sync cursor and health. delta_token is an operational Graph checkpoint, not an OAuth access token.';

CREATE TABLE IF NOT EXISTS engineering_external_source_refs (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id         UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id           TEXT NOT NULL,
  repository_id        UUID NOT NULL REFERENCES engineering_managed_repositories(id) ON DELETE RESTRICT,
  connection_id        UUID NOT NULL REFERENCES engineering_m365_connections(id) ON DELETE RESTRICT,
  source_system        TEXT NOT NULL DEFAULT 'sharepoint',
  microsoft_tenant_id  TEXT,
  site_id              TEXT NOT NULL,
  drive_id             TEXT NOT NULL,
  item_id              TEXT NOT NULL,
  list_item_id         TEXT,
  parent_item_id       TEXT,
  display_name         TEXT NOT NULL,
  web_url              TEXT,
  path_within_root     TEXT NOT NULL DEFAULT '',
  mime_type            TEXT,
  size_bytes           BIGINT,
  etag                 TEXT,
  ctag                 TEXT,
  version_label        TEXT,
  last_modified_at     TIMESTAMPTZ,
  last_modified_by     TEXT,
  availability         TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK (availability IN ('ACTIVE', 'MOVED_OUTSIDE_SCOPE', 'DELETED', 'UNAVAILABLE', 'DISABLED')),
  fingerprint          TEXT NOT NULL,
  information_ref_id   TEXT,
  occurred_at          TIMESTAMPTZ NOT NULL,
  recorded_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, workspace_id, drive_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_eng_external_sources_ws
  ON engineering_external_source_refs (tenant_id, workspace_id, project_id, availability);

COMMENT ON TABLE engineering_external_source_refs IS
  'EOS-A13A reference-first SharePoint source identity. Filename is not canonical identity. Binaries are not duplicated here.';

CREATE TABLE IF NOT EXISTS engineering_connector_audit_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  action        TEXT NOT NULL,
  actor_id      TEXT,
  target_type   TEXT NOT NULL,
  target_id     TEXT NOT NULL,
  metadata      JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eng_connector_audit_ws
  ON engineering_connector_audit_events (tenant_id, workspace_id, created_at DESC);

COMMENT ON TABLE engineering_connector_audit_events IS
  'EOS-A13A governed connector configuration audit. Does not record employee productivity or every Graph page retrieval.';

ALTER TABLE engineering_artifact_template_policies
  ADD COLUMN IF NOT EXISTS binary_source_kind TEXT NOT NULL DEFAULT 'PACKAGED'
    CHECK (binary_source_kind IN ('PACKAGED', 'SHAREPOINT_MANAGED'));
ALTER TABLE engineering_artifact_template_policies
  ADD COLUMN IF NOT EXISTS external_source_ref_id TEXT;

DROP TRIGGER IF EXISTS engineering_m365_connections_updated_at ON engineering_m365_connections;
CREATE TRIGGER engineering_m365_connections_updated_at
  BEFORE UPDATE ON engineering_m365_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS engineering_m365_connections_workspace_tenant ON engineering_m365_connections;
CREATE TRIGGER engineering_m365_connections_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_m365_connections
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

DROP TRIGGER IF EXISTS engineering_sharepoint_scopes_workspace_tenant ON engineering_sharepoint_scopes;
CREATE TRIGGER engineering_sharepoint_scopes_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_sharepoint_scopes
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

DROP TRIGGER IF EXISTS engineering_connector_sync_state_workspace_tenant ON engineering_connector_sync_state;
CREATE TRIGGER engineering_connector_sync_state_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_connector_sync_state
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

DROP TRIGGER IF EXISTS engineering_external_source_refs_workspace_tenant ON engineering_external_source_refs;
CREATE TRIGGER engineering_external_source_refs_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_external_source_refs
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

DROP TRIGGER IF EXISTS engineering_connector_audit_workspace_tenant ON engineering_connector_audit_events;
CREATE TRIGGER engineering_connector_audit_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_connector_audit_events
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

ALTER TABLE engineering_m365_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_sharepoint_scopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_connector_sync_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_external_source_refs ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_connector_audit_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eng_m365_connections_select ON engineering_m365_connections;
DROP POLICY IF EXISTS eng_m365_connections_insert ON engineering_m365_connections;
DROP POLICY IF EXISTS eng_m365_connections_update ON engineering_m365_connections;
DROP POLICY IF EXISTS eng_m365_connections_delete ON engineering_m365_connections;

CREATE POLICY eng_m365_connections_select ON engineering_m365_connections
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_m365_connections_insert ON engineering_m365_connections
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_m365_connections_update ON engineering_m365_connections
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_m365_connections_delete ON engineering_m365_connections
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eng_sharepoint_scopes_select ON engineering_sharepoint_scopes;
DROP POLICY IF EXISTS eng_sharepoint_scopes_insert ON engineering_sharepoint_scopes;
DROP POLICY IF EXISTS eng_sharepoint_scopes_update ON engineering_sharepoint_scopes;
DROP POLICY IF EXISTS eng_sharepoint_scopes_delete ON engineering_sharepoint_scopes;

CREATE POLICY eng_sharepoint_scopes_select ON engineering_sharepoint_scopes
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_sharepoint_scopes_insert ON engineering_sharepoint_scopes
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_sharepoint_scopes_update ON engineering_sharepoint_scopes
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_sharepoint_scopes_delete ON engineering_sharepoint_scopes
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eng_connector_sync_select ON engineering_connector_sync_state;
DROP POLICY IF EXISTS eng_connector_sync_insert ON engineering_connector_sync_state;
DROP POLICY IF EXISTS eng_connector_sync_update ON engineering_connector_sync_state;
DROP POLICY IF EXISTS eng_connector_sync_delete ON engineering_connector_sync_state;

CREATE POLICY eng_connector_sync_select ON engineering_connector_sync_state
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_connector_sync_insert ON engineering_connector_sync_state
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_connector_sync_update ON engineering_connector_sync_state
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_connector_sync_delete ON engineering_connector_sync_state
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eng_external_sources_select ON engineering_external_source_refs;
DROP POLICY IF EXISTS eng_external_sources_insert ON engineering_external_source_refs;
DROP POLICY IF EXISTS eng_external_sources_update ON engineering_external_source_refs;
DROP POLICY IF EXISTS eng_external_sources_delete ON engineering_external_source_refs;

CREATE POLICY eng_external_sources_select ON engineering_external_source_refs
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_external_sources_insert ON engineering_external_source_refs
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_external_sources_update ON engineering_external_source_refs
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_external_sources_delete ON engineering_external_source_refs
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eng_connector_audit_select ON engineering_connector_audit_events;
DROP POLICY IF EXISTS eng_connector_audit_insert ON engineering_connector_audit_events;
DROP POLICY IF EXISTS eng_connector_audit_update ON engineering_connector_audit_events;
DROP POLICY IF EXISTS eng_connector_audit_delete ON engineering_connector_audit_events;

CREATE POLICY eng_connector_audit_select ON engineering_connector_audit_events
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_connector_audit_insert ON engineering_connector_audit_events
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_connector_audit_update ON engineering_connector_audit_events
  FOR UPDATE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_connector_audit_delete ON engineering_connector_audit_events
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_m365_connections TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_sharepoint_scopes TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_connector_sync_state TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_external_source_refs TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_connector_audit_events TO anon, authenticated, service_role;
