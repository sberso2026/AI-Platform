-- EOS 3.6 Integration and Solver Framework.
-- Additive. Staging/development only.
-- CONNECTOR_AVAILABLE != SOLVER_QUALIFIED; RESULT_IMPORTED != RESULT_APPROVED.

CREATE TABLE IF NOT EXISTS eos3_connectors (
  connector_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id              UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id           UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  category               TEXT NOT NULL,
  provider               TEXT NOT NULL,
  vendor                 TEXT NOT NULL,
  version                TEXT NOT NULL,
  capabilities           JSONB NOT NULL DEFAULT '[]'::jsonb,
  auth_method            TEXT NOT NULL,
  execution_mode         TEXT NOT NULL,
  status                 TEXT NOT NULL DEFAULT 'configured',
  health                 TEXT NOT NULL DEFAULT 'UNCONFIGURED',
  qualification_state    TEXT NOT NULL DEFAULT 'INTEGRATED_NOT_VALIDATED',
  system_of_record       TEXT NOT NULL,
  owner_id               TEXT NOT NULL,
  configuration_revision INTEGER NOT NULL DEFAULT 1,
  enabled_execution      BOOLEAN NOT NULL DEFAULT FALSE,
  secret_ref             TEXT,
  provenance             JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (secret_ref IS NULL OR secret_ref LIKE 'vault://%')
);

CREATE INDEX IF NOT EXISTS idx_eos3_connectors_ws
  ON eos3_connectors (tenant_id, workspace_id);

DROP TRIGGER IF EXISTS eos3_connectors_updated_at ON eos3_connectors;
CREATE TRIGGER eos3_connectors_updated_at
  BEFORE UPDATE ON eos3_connectors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE eos3_connectors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_connectors_select ON eos3_connectors;
CREATE POLICY eos3_connectors_select ON eos3_connectors
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_connectors_write ON eos3_connectors;
CREATE POLICY eos3_connectors_write ON eos3_connectors
  FOR ALL USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

-- Secrets are never stored in connector rows beyond vault references.
CREATE TABLE IF NOT EXISTS eos3_connector_secret_refs (
  secret_ref_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  connector_id  UUID NOT NULL REFERENCES eos3_connectors(connector_id) ON DELETE CASCADE,
  cipher_ref    TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (cipher_ref LIKE 'vault://%')
);

ALTER TABLE eos3_connector_secret_refs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_connector_secret_refs_deny_select ON eos3_connector_secret_refs;
CREATE POLICY eos3_connector_secret_refs_deny_select ON eos3_connector_secret_refs
  FOR SELECT USING (false);

CREATE TABLE IF NOT EXISTS eos3_integration_imports (
  import_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id        UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id          TEXT NOT NULL,
  connector_id        UUID NOT NULL REFERENCES eos3_connectors(connector_id) ON DELETE CASCADE,
  source_system       TEXT NOT NULL,
  source_identifier   TEXT NOT NULL,
  source_revision     TEXT NOT NULL,
  content_hash        TEXT NOT NULL,
  classification      TEXT NOT NULL,
  qualification_state TEXT NOT NULL,
  eos_owns_source     BOOLEAN NOT NULL DEFAULT FALSE CHECK (eos_owns_source = FALSE),
  indexed_for_retrieval BOOLEAN NOT NULL DEFAULT FALSE,
  provenance          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, workspace_id, connector_id, source_identifier, source_revision)
);

ALTER TABLE eos3_integration_imports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_integration_imports_select ON eos3_integration_imports;
CREATE POLICY eos3_integration_imports_select ON eos3_integration_imports
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_integration_imports_write ON eos3_integration_imports;
CREATE POLICY eos3_integration_imports_write ON eos3_integration_imports
  FOR ALL USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE TABLE IF NOT EXISTS eos3_solvers (
  solver_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id         UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  connector_id         UUID NOT NULL REFERENCES eos3_connectors(connector_id) ON DELETE CASCADE,
  provider             TEXT NOT NULL,
  product              TEXT NOT NULL,
  version              TEXT NOT NULL,
  execution_mode       TEXT NOT NULL,
  supported_analysis   JSONB NOT NULL DEFAULT '[]'::jsonb,
  qualification_state  TEXT NOT NULL DEFAULT 'INTEGRATED_NOT_VALIDATED',
  validation_state     TEXT NOT NULL DEFAULT 'none',
  environment          TEXT NOT NULL DEFAULT 'staging_synthetic',
  provenance           JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE eos3_solvers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_solvers_select ON eos3_solvers;
CREATE POLICY eos3_solvers_select ON eos3_solvers
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_solvers_write ON eos3_solvers;
CREATE POLICY eos3_solvers_write ON eos3_solvers
  FOR ALL USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE TABLE IF NOT EXISTS eos3_solver_jobs (
  job_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id     UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id       TEXT NOT NULL,
  solver_id        UUID NOT NULL REFERENCES eos3_solvers(solver_id) ON DELETE CASCADE,
  connector_id     UUID NOT NULL REFERENCES eos3_connectors(connector_id) ON DELETE CASCADE,
  manifest         JSONB NOT NULL,
  state            TEXT NOT NULL,
  idempotency_key  TEXT NOT NULL,
  result_id        UUID,
  failure_reason   TEXT,
  retry_count      INTEGER NOT NULL DEFAULT 0,
  provenance       JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, workspace_id, idempotency_key)
);

ALTER TABLE eos3_solver_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_solver_jobs_select ON eos3_solver_jobs;
CREATE POLICY eos3_solver_jobs_select ON eos3_solver_jobs
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_solver_jobs_write ON eos3_solver_jobs;
CREATE POLICY eos3_solver_jobs_write ON eos3_solver_jobs
  FOR ALL USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE TABLE IF NOT EXISTS eos3_solver_results (
  result_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id         UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  job_id               UUID NOT NULL REFERENCES eos3_solver_jobs(job_id) ON DELETE CASCADE,
  solver_id            UUID NOT NULL REFERENCES eos3_solvers(solver_id) ON DELETE CASCADE,
  solver_version       TEXT NOT NULL,
  manifest_id          TEXT NOT NULL,
  output_hash          TEXT NOT NULL,
  classification       TEXT NOT NULL DEFAULT 'RESULT' CHECK (classification = 'RESULT'),
  validation_state     TEXT NOT NULL,
  qualification_state  TEXT NOT NULL,
  units                JSONB NOT NULL DEFAULT '{}'::jsonb,
  payload              JSONB NOT NULL DEFAULT '{}'::jsonb,
  calculation_object_id TEXT,
  immutable            BOOLEAN NOT NULL DEFAULT TRUE CHECK (immutable = TRUE),
  provenance           JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE eos3_solver_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_solver_results_select ON eos3_solver_results;
CREATE POLICY eos3_solver_results_select ON eos3_solver_results
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_solver_results_insert ON eos3_solver_results;
CREATE POLICY eos3_solver_results_insert ON eos3_solver_results
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

COMMENT ON TABLE eos3_connectors IS
  'EOS 3.6 connectors. Health AVAILABLE does not imply solver qualification. Secrets via vault refs only.';
COMMENT ON TABLE eos3_solver_results IS
  'EOS 3.6 solver results classified as RESULT only; never HUMAN_DECISION. Immutable history.';
