-- EOS 3.9 Migration and EOS 2 Coexistence.
-- Additive. Staging/development only. NO Production migration.
-- EOS_2_PROJECT != EOS_3_PROJECT_UNTIL_EXPLICITLY_MIGRATED

CREATE TABLE IF NOT EXISTS eos3_migration_jobs (
  migration_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id              UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id           UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  source_project_id      TEXT NOT NULL,
  state                  TEXT NOT NULL,
  source_generation      INTEGER NOT NULL DEFAULT 2 CHECK (source_generation = 2),
  target_generation      INTEGER NOT NULL DEFAULT 3 CHECK (target_generation = 3),
  policy_version         TEXT NOT NULL DEFAULT '1.0.0',
  manifest               JSONB,
  preflight_fingerprint  TEXT,
  evidence_fingerprint   TEXT,
  authorized_by          TEXT,
  failure_reason         TEXT,
  verification           JSONB,
  production_target      BOOLEAN NOT NULL DEFAULT FALSE CHECK (production_target = FALSE),
  provenance             JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eos3_migration_jobs_ws
  ON eos3_migration_jobs (tenant_id, workspace_id, created_at DESC);

DROP TRIGGER IF EXISTS eos3_migration_jobs_updated_at ON eos3_migration_jobs;
CREATE TRIGGER eos3_migration_jobs_updated_at
  BEFORE UPDATE ON eos3_migration_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE eos3_migration_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_migration_jobs_select ON eos3_migration_jobs;
CREATE POLICY eos3_migration_jobs_select ON eos3_migration_jobs
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_migration_jobs_write ON eos3_migration_jobs;
CREATE POLICY eos3_migration_jobs_write ON eos3_migration_jobs
  FOR ALL USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
    AND production_target = FALSE
  );

CREATE TABLE IF NOT EXISTS eos3_migrated_project_targets (
  target_project_id   TEXT PRIMARY KEY,
  migration_id        UUID NOT NULL REFERENCES eos3_migration_jobs(migration_id) ON DELETE CASCADE,
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id        UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  source_project_id   TEXT NOT NULL,
  generation          INTEGER NOT NULL DEFAULT 3 CHECK (generation = 3),
  activated           BOOLEAN NOT NULL DEFAULT FALSE CHECK (activated = FALSE),
  production_activated BOOLEAN NOT NULL DEFAULT FALSE CHECK (production_activated = FALSE),
  snapshot            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (migration_id)
);

ALTER TABLE eos3_migrated_project_targets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_migrated_targets_select ON eos3_migrated_project_targets;
CREATE POLICY eos3_migrated_targets_select ON eos3_migrated_project_targets
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_migrated_targets_write ON eos3_migrated_project_targets;
CREATE POLICY eos3_migrated_targets_write ON eos3_migrated_project_targets
  FOR ALL USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
    AND production_activated = FALSE
  );

COMMENT ON TABLE eos3_migration_jobs IS
  'EOS 3.9 migration jobs. production_target always false. Human authorization required. No automatic migration.';
COMMENT ON TABLE eos3_migrated_project_targets IS
  'EOS 3.9 migrated targets. Separate from EOS 2 source. Never Production-activated in this phase.';
