-- EOS-A13B: Engineering, EDMS, construction and planning connector composition.
-- Additive after 20261001180000_eos_a13a_m365_sharepoint_connector.sql.
-- Reuses A13A Secrets, JobService, Event Bus, ManagedEngineeringRepository,
-- Work Events, InformationRef, and connector audit. External systems own
-- source objects. A13B_BINARY_DUPLICATION = NO.

CREATE TABLE IF NOT EXISTS engineering_external_connections (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id              UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id           UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  display_name           TEXT NOT NULL,
  category               TEXT NOT NULL CHECK (category IN (
    'EDMS', 'CONSTRUCTION_MANAGEMENT', 'BIM_DOCUMENT_SYSTEM',
    'PLANNING_SCHEDULE', 'ENGINEERING_APPLICATION', 'OTHER_APPROVED_ENTERPRISE_SOURCE'
  )),
  vendor                 TEXT NOT NULL CHECK (vendor IN (
    'ACONEX', 'ACC', 'P6', 'MSPROJECT', 'SHAREPOINT', 'SPACE_GASS', 'OTHER'
  )),
  credential_secret_id   TEXT NOT NULL,
  auth_mode              TEXT NOT NULL DEFAULT 'OAUTH'
    CHECK (auth_mode IN ('OAUTH', 'API_TOKEN', 'CERTIFICATE', 'MANAGED_IDENTITY', 'VENDOR_SERVICE')),
  write_policy           TEXT NOT NULL DEFAULT 'READ_ONLY'
    CHECK (write_policy IN ('READ_ONLY', 'PUBLISH_DOCUMENT', 'SUBMIT_DRAFT_RESPONSE', 'UPDATE_REFERENCE_METADATA')),
  status                 TEXT NOT NULL DEFAULT 'NOT_CONFIGURED',
  enabled                BOOLEAN NOT NULL DEFAULT FALSE,
  created_by             TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eng_external_connections_ws
  ON engineering_external_connections (tenant_id, workspace_id, category);

COMMENT ON TABLE engineering_external_connections IS
  'EOS-A13B generic external engineering connection. Stores Secrets service reference only. Default write policy READ_ONLY. A13B_BINARY_DUPLICATION = NO.';

CREATE TABLE IF NOT EXISTS engineering_external_project_bindings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id         UUID NOT NULL REFERENCES engineering_external_connections(id) ON DELETE RESTRICT,
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id          UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  eos_project_id        TEXT NOT NULL,
  external_account_id   TEXT NOT NULL,
  external_project_id   TEXT NOT NULL,
  external_scope        TEXT,
  repository_id         UUID REFERENCES engineering_managed_repositories(id) ON DELETE SET NULL,
  enabled               BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (tenant_id, workspace_id, connection_id, external_project_id)
);

CREATE INDEX IF NOT EXISTS idx_eng_external_bindings_ws
  ON engineering_external_project_bindings (tenant_id, workspace_id, eos_project_id);

COMMENT ON TABLE engineering_external_project_bindings IS
  'EOS-A13B admin-governed mapping from external project/account to canonical EOS project. Unregistered external projects are not ingested.';

CREATE TABLE IF NOT EXISTS engineering_external_object_refs (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id             UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id               TEXT NOT NULL,
  connection_id            UUID NOT NULL REFERENCES engineering_external_connections(id) ON DELETE RESTRICT,
  binding_id               UUID NOT NULL REFERENCES engineering_external_project_bindings(id) ON DELETE RESTRICT,
  repository_id            UUID REFERENCES engineering_managed_repositories(id) ON DELETE SET NULL,
  source_system            TEXT NOT NULL,
  external_account_id      TEXT NOT NULL,
  external_project_id      TEXT NOT NULL,
  object_type              TEXT NOT NULL CHECK (object_type IN (
    'DOCUMENT', 'DRAWING', 'MODEL', 'RFI', 'TQ', 'TRANSMITTAL',
    'FIELD_CHANGE', 'ISSUE', 'SCHEDULE_ACTIVITY', 'MILESTONE', 'ANALYSIS_FILE', 'VENDOR_DATA'
  )),
  object_id                TEXT NOT NULL,
  object_number            TEXT,
  display_name             TEXT NOT NULL,
  web_url                  TEXT,
  version                  TEXT,
  etag                     TEXT,
  vendor_status            TEXT,
  eos_mapped_status        TEXT,
  fingerprint              TEXT NOT NULL,
  availability             TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK (availability IN ('ACTIVE', 'DELETED', 'DISABLED', 'UNAVAILABLE')),
  information_ref_id       TEXT,
  related_canonical_type   TEXT,
  related_canonical_id     TEXT,
  occurred_at              TIMESTAMPTZ NOT NULL,
  recorded_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata                 JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, workspace_id, connection_id, object_type, object_id)
);

CREATE INDEX IF NOT EXISTS idx_eng_external_objects_ws
  ON engineering_external_object_refs (tenant_id, workspace_id, project_id, object_type, availability);

COMMENT ON TABLE engineering_external_object_refs IS
  'EOS-A13B reference-first normalized external engineering objects. Filename/subject is not canonical identity. Binaries are not stored here.';

CREATE TABLE IF NOT EXISTS engineering_external_sync_state (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id            UUID NOT NULL UNIQUE REFERENCES engineering_external_connections(id) ON DELETE CASCADE,
  tenant_id                UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id             UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  status                   TEXT NOT NULL DEFAULT 'NOT_CONFIGURED',
  cursor                   TEXT,
  last_successful_sync_at  TIMESTAMPTZ,
  last_attempted_sync_at   TIMESTAMPTZ,
  last_error               TEXT,
  items_scanned            INTEGER NOT NULL DEFAULT 0,
  items_changed            INTEGER NOT NULL DEFAULT 0,
  throttle_count           INTEGER NOT NULL DEFAULT 0,
  retry_count              INTEGER NOT NULL DEFAULT 0,
  duration_ms              INTEGER NOT NULL DEFAULT 0,
  sync_mode                TEXT NOT NULL DEFAULT 'BOUNDED_POLL' CHECK (sync_mode IN ('WEBHOOK', 'BOUNDED_POLL'))
);

COMMENT ON TABLE engineering_external_sync_state IS
  'EOS-A13B connector health and bounded-poll checkpoint. cursor is not an OAuth token.';

DROP TRIGGER IF EXISTS engineering_external_connections_updated_at ON engineering_external_connections;
CREATE TRIGGER engineering_external_connections_updated_at
  BEFORE UPDATE ON engineering_external_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS engineering_external_connections_workspace_tenant ON engineering_external_connections;
CREATE TRIGGER engineering_external_connections_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_external_connections
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

DROP TRIGGER IF EXISTS engineering_external_bindings_workspace_tenant ON engineering_external_project_bindings;
CREATE TRIGGER engineering_external_bindings_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_external_project_bindings
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

DROP TRIGGER IF EXISTS engineering_external_objects_workspace_tenant ON engineering_external_object_refs;
CREATE TRIGGER engineering_external_objects_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_external_object_refs
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

DROP TRIGGER IF EXISTS engineering_external_sync_workspace_tenant ON engineering_external_sync_state;
CREATE TRIGGER engineering_external_sync_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_external_sync_state
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

ALTER TABLE engineering_external_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_external_project_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_external_object_refs ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_external_sync_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eng_external_connections_select ON engineering_external_connections;
DROP POLICY IF EXISTS eng_external_connections_insert ON engineering_external_connections;
DROP POLICY IF EXISTS eng_external_connections_update ON engineering_external_connections;
DROP POLICY IF EXISTS eng_external_connections_delete ON engineering_external_connections;

CREATE POLICY eng_external_connections_select ON engineering_external_connections
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_external_connections_insert ON engineering_external_connections
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_external_connections_update ON engineering_external_connections
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_external_connections_delete ON engineering_external_connections
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eng_external_bindings_select ON engineering_external_project_bindings;
DROP POLICY IF EXISTS eng_external_bindings_insert ON engineering_external_project_bindings;
DROP POLICY IF EXISTS eng_external_bindings_update ON engineering_external_project_bindings;
DROP POLICY IF EXISTS eng_external_bindings_delete ON engineering_external_project_bindings;

CREATE POLICY eng_external_bindings_select ON engineering_external_project_bindings
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_external_bindings_insert ON engineering_external_project_bindings
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_external_bindings_update ON engineering_external_project_bindings
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_external_bindings_delete ON engineering_external_project_bindings
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eng_external_objects_select ON engineering_external_object_refs;
DROP POLICY IF EXISTS eng_external_objects_insert ON engineering_external_object_refs;
DROP POLICY IF EXISTS eng_external_objects_update ON engineering_external_object_refs;
DROP POLICY IF EXISTS eng_external_objects_delete ON engineering_external_object_refs;

CREATE POLICY eng_external_objects_select ON engineering_external_object_refs
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_external_objects_insert ON engineering_external_object_refs
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_external_objects_update ON engineering_external_object_refs
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_external_objects_delete ON engineering_external_object_refs
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eng_external_sync_select ON engineering_external_sync_state;
DROP POLICY IF EXISTS eng_external_sync_insert ON engineering_external_sync_state;
DROP POLICY IF EXISTS eng_external_sync_update ON engineering_external_sync_state;
DROP POLICY IF EXISTS eng_external_sync_delete ON engineering_external_sync_state;

CREATE POLICY eng_external_sync_select ON engineering_external_sync_state
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_external_sync_insert ON engineering_external_sync_state
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_external_sync_update ON engineering_external_sync_state
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_external_sync_delete ON engineering_external_sync_state
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_external_connections TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_external_project_bindings TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_external_object_refs TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_external_sync_state TO anon, authenticated, service_role;
