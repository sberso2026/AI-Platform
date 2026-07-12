-- RTB AI Platform Batch 34 — Project Intelligence mapping foundation
-- Legacy identifiers remain external references; Engineering Core is canonical.

CREATE TABLE project_intelligence_project_mappings (
  id                                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id                            UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  engineering_project_id                  UUID NOT NULL REFERENCES engineering_projects(id) ON DELETE CASCADE,
  legacy_project_intelligence_project_id  TEXT NOT NULL,
  legacy_source_system                    TEXT NOT NULL DEFAULT 'project_intelligence',
  mapping_status                          TEXT NOT NULL DEFAULT 'discovered' CHECK (mapping_status IN (
    'discovered', 'candidate', 'matched', 'conflict', 'pending_review', 'approved',
    'migrated', 'verified', 'failed', 'rolled_back', 'retired'
  )),
  confidence_score                        NUMERIC(5,4) NOT NULL DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  match_method                            TEXT,
  migration_source                        TEXT NOT NULL DEFAULT 'phase_6b',
  migration_version                       TEXT,
  conflict_state                          TEXT CHECK (conflict_state IS NULL OR conflict_state IN (
    'none', 'open', 'resolved', 'deferred'
  )),
  reviewed_by                             UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at                             TIMESTAMPTZ,
  metadata                                JSONB NOT NULL DEFAULT '{}',
  approved_by                             UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at                             TIMESTAMPTZ,
  last_sync_at                            TIMESTAMPTZ,
  last_sync_status                        TEXT,
  created_at                              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((approved_at IS NULL) OR approved_by IS NOT NULL)
);

CREATE INDEX idx_pi_project_mappings_tenant ON project_intelligence_project_mappings(tenant_id);
CREATE INDEX idx_pi_project_mappings_workspace ON project_intelligence_project_mappings(workspace_id);
CREATE INDEX idx_pi_project_mappings_engineering_project ON project_intelligence_project_mappings(engineering_project_id);
CREATE INDEX idx_pi_project_mappings_legacy_project ON project_intelligence_project_mappings(tenant_id, legacy_project_intelligence_project_id);
CREATE INDEX idx_pi_project_mappings_status ON project_intelligence_project_mappings(tenant_id, mapping_status);
CREATE INDEX idx_pi_project_mappings_conflict_state ON project_intelligence_project_mappings(tenant_id, conflict_state);

-- NULL workspaces are normalized so the default tenant workspace remains unique.
CREATE UNIQUE INDEX uq_pi_mappings_active_engineering_workspace
  ON project_intelligence_project_mappings(tenant_id, workspace_id, engineering_project_id)
  WHERE mapping_status NOT IN ('retired', 'rolled_back', 'failed');
CREATE UNIQUE INDEX uq_pi_mappings_active_legacy_project
  ON project_intelligence_project_mappings(tenant_id, legacy_source_system, legacy_project_intelligence_project_id)
  WHERE mapping_status NOT IN ('retired', 'rolled_back', 'failed');

CREATE TRIGGER project_intelligence_project_mappings_updated_at
  BEFORE UPDATE ON project_intelligence_project_mappings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Approved mappings retain their source identity to preserve migration provenance.
CREATE OR REPLACE FUNCTION prevent_pi_migration_source_change_after_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.approved_at IS NOT NULL AND NEW.migration_source IS DISTINCT FROM OLD.migration_source THEN
    RAISE EXCEPTION 'migration_source is immutable after approval';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

CREATE TRIGGER project_intelligence_project_mappings_source_immutable
  BEFORE UPDATE ON project_intelligence_project_mappings
  FOR EACH ROW EXECUTE FUNCTION prevent_pi_migration_source_change_after_approval();

COMMENT ON COLUMN project_intelligence_project_mappings.migration_source
  IS 'Source identity; immutable after mapping approval.';

CREATE TABLE project_intelligence_mapping_audit (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  mapping_id      UUID NOT NULL REFERENCES project_intelligence_project_mappings(id) ON DELETE CASCADE,
  actor_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action          TEXT NOT NULL,
  from_status     TEXT,
  to_status       TEXT,
  event_id        TEXT NOT NULL,
  correlation_id  UUID,
  details         JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id)
);

CREATE INDEX idx_pi_mapping_audit_mapping ON project_intelligence_mapping_audit(mapping_id, created_at DESC);
CREATE INDEX idx_pi_mapping_audit_tenant ON project_intelligence_mapping_audit(tenant_id, created_at DESC);

ALTER TABLE project_intelligence_project_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_intelligence_mapping_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY pi_project_mappings_select ON project_intelligence_project_mappings FOR SELECT
  USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND workspace_id IN (
      SELECT workspace_id
      FROM workspace_memberships
      WHERE user_id = auth.uid()
    )
  );
CREATE POLICY pi_project_mappings_manage ON project_intelligence_project_mappings FOR ALL
  USING (
    has_permission('engineering', 'admin', tenant_id)
    AND workspace_id IN (
      SELECT workspace_id
      FROM workspace_memberships
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    has_permission('engineering', 'admin', tenant_id)
    AND workspace_id IN (
      SELECT workspace_id
      FROM workspace_memberships
      WHERE user_id = auth.uid()
    )
  );
CREATE POLICY pi_mapping_audit_select ON project_intelligence_mapping_audit FOR SELECT
  USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND workspace_id IN (
      SELECT workspace_id
      FROM workspace_memberships
      WHERE user_id = auth.uid()
    )
  );
CREATE POLICY pi_mapping_audit_insert ON project_intelligence_mapping_audit FOR INSERT
  WITH CHECK (
    tenant_id = ANY(get_user_tenant_ids())
    AND workspace_id IN (
      SELECT workspace_id
      FROM workspace_memberships
      WHERE user_id = auth.uid()
    )
  );
