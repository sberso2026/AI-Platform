-- EOS-3-INTELLIGENCE-3 Dynamic Affected Discipline Discovery
-- Additive. Role + provenance + confirmation. No duplicate taxonomy.
-- Rollback: DROP TABLE eos3_discipline_associations; DROP TABLE eos3_discipline_association_history;

CREATE TABLE IF NOT EXISTS eos3_discipline_associations (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id                UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id                  TEXT NOT NULL,
  work_package_stable_id      TEXT NOT NULL,
  discipline                  TEXT NOT NULL,
  role                        TEXT NOT NULL,
  origin                      TEXT NOT NULL CHECK (origin IN ('EXPLICIT','DERIVED','INFERRED')),
  confidence                  TEXT NOT NULL CHECK (confidence IN ('HIGH','MEDIUM','LOW')),
  materiality                 TEXT NOT NULL DEFAULT 'MEDIUM',
  confirmation_state          TEXT NOT NULL DEFAULT 'SUGGESTED',
  reason                      TEXT NOT NULL DEFAULT '',
  source_object_stable_ids    JSONB NOT NULL DEFAULT '[]'::jsonb,
  relationship_path           JSONB NOT NULL DEFAULT '[]'::jsonb,
  asset_system_refs           JSONB NOT NULL DEFAULT '[]'::jsonb,
  evidence_priority           INT NOT NULL DEFAULT 8,
  revision_key                TEXT NOT NULL DEFAULT '',
  provenance                  JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eos3_disc_assoc_wp
  ON eos3_discipline_associations (workspace_id, project_id, work_package_stable_id);

DROP TRIGGER IF EXISTS eos3_discipline_associations_updated_at ON eos3_discipline_associations;
CREATE TRIGGER eos3_discipline_associations_updated_at
  BEFORE UPDATE ON eos3_discipline_associations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE eos3_discipline_associations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_disc_assoc_select ON eos3_discipline_associations;
CREATE POLICY eos3_disc_assoc_select ON eos3_discipline_associations
  FOR SELECT USING (engineering_core_workspace_member(workspace_id));

DROP POLICY IF EXISTS eos3_disc_assoc_write ON eos3_discipline_associations;
CREATE POLICY eos3_disc_assoc_write ON eos3_discipline_associations
  FOR ALL USING (engineering_core_workspace_member(workspace_id))
  WITH CHECK (engineering_core_workspace_member(workspace_id));

CREATE TABLE IF NOT EXISTS eos3_discipline_association_history (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id      UUID NOT NULL,
  workspace_id        UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  event               TEXT NOT NULL,
  note                TEXT NOT NULL DEFAULT '',
  actor_id            TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE eos3_discipline_association_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_disc_hist_select ON eos3_discipline_association_history;
CREATE POLICY eos3_disc_hist_select ON eos3_discipline_association_history
  FOR SELECT USING (engineering_core_workspace_member(workspace_id));

DROP POLICY IF EXISTS eos3_disc_hist_write ON eos3_discipline_association_history;
CREATE POLICY eos3_disc_hist_write ON eos3_discipline_association_history
  FOR ALL USING (engineering_core_workspace_member(workspace_id))
  WITH CHECK (engineering_core_workspace_member(workspace_id));
