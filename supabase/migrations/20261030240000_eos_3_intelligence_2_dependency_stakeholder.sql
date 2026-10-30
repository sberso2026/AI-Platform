-- EOS-3-INTELLIGENCE-2 Engineering Dependency & Stakeholder
-- Additive. Reuses Relationship Graph; does not duplicate graph or user identities.
-- Rollback: DROP tables in reverse order.

CREATE TABLE IF NOT EXISTS eos3_information_dependencies (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stable_id                       TEXT NOT NULL,
  tenant_id                       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id                    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id                      TEXT NOT NULL,
  dependency_type                 TEXT NOT NULL,
  information_object_stable_id    TEXT NOT NULL,
  information_object_class        TEXT NOT NULL,
  information_object_revision     TEXT,
  interface_stable_id             TEXT,
  upstream_work_package_stable_id TEXT,
  downstream_work_package_stable_id TEXT,
  producer_discipline             TEXT,
  consumer_discipline             TEXT,
  producers                       JSONB NOT NULL DEFAULT '[]'::jsonb,
  consumers                       JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_asset_system_ref         TEXT,
  target_asset_system_ref         TEXT,
  status                          TEXT NOT NULL DEFAULT 'IDENTIFIED',
  criticality                     TEXT NOT NULL DEFAULT 'MEDIUM',
  blocking                        BOOLEAN NOT NULL DEFAULT FALSE,
  required_by_date                DATE,
  relationship_edge_ids           JSONB NOT NULL DEFAULT '[]'::jsonb,
  resolution_object_stable_id     TEXT,
  handoff_history                 JSONB NOT NULL DEFAULT '[]'::jsonb,
  accepted_for_use                BOOLEAN NOT NULL DEFAULT FALSE,
  confirmation_state              TEXT NOT NULL DEFAULT 'CONFIRMED',
  inference_basis                 TEXT,
  provenance                      JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, stable_id)
);

CREATE INDEX IF NOT EXISTS idx_eos3_info_deps_wp
  ON eos3_information_dependencies (workspace_id, project_id, downstream_work_package_stable_id);

CREATE INDEX IF NOT EXISTS idx_eos3_info_deps_upstream
  ON eos3_information_dependencies (workspace_id, project_id, upstream_work_package_stable_id);

DROP TRIGGER IF EXISTS eos3_information_dependencies_updated_at ON eos3_information_dependencies;
CREATE TRIGGER eos3_information_dependencies_updated_at
  BEFORE UPDATE ON eos3_information_dependencies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE eos3_information_dependencies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_info_deps_select ON eos3_information_dependencies;
CREATE POLICY eos3_info_deps_select ON eos3_information_dependencies
  FOR SELECT USING (engineering_core_workspace_member(workspace_id));

DROP POLICY IF EXISTS eos3_info_deps_write ON eos3_information_dependencies;
CREATE POLICY eos3_info_deps_write ON eos3_information_dependencies
  FOR ALL USING (engineering_core_workspace_member(workspace_id))
  WITH CHECK (engineering_core_workspace_member(workspace_id));

CREATE TABLE IF NOT EXISTS eos3_stakeholder_associations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id        UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id          TEXT NOT NULL,
  scope               TEXT NOT NULL,
  scope_stable_id     TEXT NOT NULL,
  identity_id         TEXT NOT NULL,
  display_name        TEXT NOT NULL,
  role                TEXT,
  discipline          TEXT,
  organization        TEXT,
  stakeholder_class   TEXT NOT NULL,
  authority_role      TEXT,
  responsibility      TEXT NOT NULL,
  provenance          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eos3_stakeholder_scope
  ON eos3_stakeholder_associations (workspace_id, project_id, scope, scope_stable_id);

ALTER TABLE eos3_stakeholder_associations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_stakeholder_select ON eos3_stakeholder_associations;
CREATE POLICY eos3_stakeholder_select ON eos3_stakeholder_associations
  FOR SELECT USING (engineering_core_workspace_member(workspace_id));

DROP POLICY IF EXISTS eos3_stakeholder_write ON eos3_stakeholder_associations;
CREATE POLICY eos3_stakeholder_write ON eos3_stakeholder_associations
  FOR ALL USING (engineering_core_workspace_member(workspace_id))
  WITH CHECK (engineering_core_workspace_member(workspace_id));
