-- EOS-3-WORKFLOW-2 Multi-Level Maturity Model
-- Additive. WP stage history + Deliverable maturity. No duplicate lifecycle model.
-- Does not grant engineering authority. Rollback: DROP tables in reverse order.

CREATE TABLE IF NOT EXISTS eos3_work_package_maturity_transitions (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id                UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id                  TEXT NOT NULL,
  work_package_stable_id      TEXT NOT NULL,
  pattern_id                  TEXT NOT NULL,
  pattern_version             TEXT NOT NULL,
  previous_stage_id           TEXT NOT NULL,
  new_stage_id                TEXT NOT NULL,
  previous_band               TEXT NOT NULL,
  new_band                    TEXT NOT NULL,
  direction                   TEXT NOT NULL CHECK (direction IN ('FORWARD','BACKWARD','LATERAL')),
  actor_id                    TEXT NOT NULL,
  actor_kind                  TEXT NOT NULL CHECK (actor_kind IN ('human','system')),
  readiness_snapshot          JSONB NOT NULL DEFAULT '{}'::jsonb,
  evidence_refs               JSONB NOT NULL DEFAULT '[]'::jsonb,
  rationale                   TEXT NOT NULL DEFAULT '',
  override_payload            JSONB,
  provenance                  JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eos3_wp_maturity_hist_wp
  ON eos3_work_package_maturity_transitions (workspace_id, project_id, work_package_stable_id);

ALTER TABLE eos3_work_package_maturity_transitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_wp_maturity_hist_select ON eos3_work_package_maturity_transitions;
CREATE POLICY eos3_wp_maturity_hist_select ON eos3_work_package_maturity_transitions
  FOR SELECT USING (engineering_core_workspace_member(workspace_id));

DROP POLICY IF EXISTS eos3_wp_maturity_hist_write ON eos3_work_package_maturity_transitions;
CREATE POLICY eos3_wp_maturity_hist_write ON eos3_work_package_maturity_transitions
  FOR ALL USING (engineering_core_workspace_member(workspace_id))
  WITH CHECK (engineering_core_workspace_member(workspace_id));

CREATE TABLE IF NOT EXISTS eos3_deliverable_maturity (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id                UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id                  TEXT NOT NULL,
  work_package_stable_id      TEXT,
  deliverable_stable_id       TEXT NOT NULL,
  maturity                    TEXT NOT NULL
                              CHECK (maturity IN (
                                'PLANNED','IN_DEVELOPMENT','READY_FOR_REVIEW','UNDER_REVIEW',
                                'READY_FOR_CURRENT_PURPOSE','COMPLETE','SUPERSEDED'
                              )),
  revision                    TEXT NOT NULL DEFAULT 'A',
  review_status               TEXT NOT NULL DEFAULT 'NOT_STARTED',
  issue_purpose               TEXT NOT NULL DEFAULT 'UNSPECIFIED',
  approval_state              TEXT NOT NULL DEFAULT 'NOT_APPROVED',
  schedule_percent_complete   NUMERIC,
  provenance                  JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, project_id, deliverable_stable_id)
);

CREATE INDEX IF NOT EXISTS idx_eos3_del_maturity_wp
  ON eos3_deliverable_maturity (workspace_id, project_id, work_package_stable_id);

DROP TRIGGER IF EXISTS eos3_deliverable_maturity_updated_at ON eos3_deliverable_maturity;
CREATE TRIGGER eos3_deliverable_maturity_updated_at
  BEFORE UPDATE ON eos3_deliverable_maturity
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE eos3_deliverable_maturity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_del_maturity_select ON eos3_deliverable_maturity;
CREATE POLICY eos3_del_maturity_select ON eos3_deliverable_maturity
  FOR SELECT USING (engineering_core_workspace_member(workspace_id));

DROP POLICY IF EXISTS eos3_del_maturity_write ON eos3_deliverable_maturity;
CREATE POLICY eos3_del_maturity_write ON eos3_deliverable_maturity
  FOR ALL USING (engineering_core_workspace_member(workspace_id))
  WITH CHECK (engineering_core_workspace_member(workspace_id));
