-- batch_88: Controlled Engineering Execution Host Foundation (Phase 13D.1)
-- Additive host/provider/job metadata. Does NOT rewrite batches 86/87.
-- NO model binaries. NO license secrets. NO PostGIS.
-- Prefer Platform Files string refs. silent_solver_fallback_allowed = false.

-- ---------------------------------------------------------------------------
-- Execution hosts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engineering_execution_hosts (
  host_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  host_class text NOT NULL CHECK (host_class IN (
    'engineering_workstation',
    'dedicated_windows_vm',
    'self_hosted_ci_runner',
    'controlled_remote_host',
    'future_cloud_engineering_host'
  )),
  operating_system text NOT NULL DEFAULT 'windows',
  architecture text NOT NULL DEFAULT 'x64',
  execution_mode text NOT NULL DEFAULT 'headless_local' CHECK (execution_mode IN (
    'interactive_workstation',
    'headless_local',
    'self_hosted_runner',
    'controlled_remote'
  )),
  status text NOT NULL DEFAULT 'registered' CHECK (status IN (
    'registered', 'ready', 'busy', 'draining', 'revoked', 'unavailable'
  )),
  health text NOT NULL DEFAULT 'unknown' CHECK (health IN (
    'healthy', 'degraded', 'unavailable', 'draining', 'revoked', 'unknown'
  )),
  installed_provider_versions jsonb NOT NULL DEFAULT '{}'::jsonb,
  license_statuses jsonb NOT NULL DEFAULT '{}'::jsonb,
  max_concurrent_jobs integer NOT NULL DEFAULT 1 CHECK (max_concurrent_jobs >= 0),
  supported_execution_modes jsonb NOT NULL DEFAULT '["headless_local"]'::jsonb,
  last_heartbeat timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  silent_solver_fallback_allowed boolean NOT NULL DEFAULT false
    CONSTRAINT eng_eeh_host_no_silent CHECK (silent_solver_fallback_allowed = false),
  spacegass_live_execution_certified boolean NOT NULL DEFAULT false
    CONSTRAINT eng_eeh_host_no_sg_live CHECK (spacegass_live_execution_certified = false),
  etabs_adapter_implemented boolean NOT NULL DEFAULT false
    CONSTRAINT eng_eeh_host_no_etabs CHECK (etabs_adapter_implemented = false),
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_eng_eeh_hosts_scope
  ON engineering_execution_hosts(tenant_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_eng_eeh_hosts_status
  ON engineering_execution_hosts(status);

-- ---------------------------------------------------------------------------
-- Host provider installation declarations (no license secrets)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engineering_execution_host_providers (
  host_provider_id text PRIMARY KEY,
  host_id text NOT NULL REFERENCES engineering_execution_hosts(host_id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  provider_id text NOT NULL,
  provider_version text,
  installation_status text NOT NULL DEFAULT 'unknown' CHECK (installation_status IN (
    'installed', 'missing', 'unknown'
  )),
  license_status text NOT NULL DEFAULT 'unknown' CHECK (license_status IN (
    'available', 'unavailable', 'expired', 'invalid', 'unknown'
  )),
  health_status text NOT NULL DEFAULT 'unknown' CHECK (health_status IN (
    'healthy', 'degraded', 'unavailable', 'unknown'
  )),
  revoked boolean NOT NULL DEFAULT false,
  detail_notes text,
  observed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT eng_eeh_provider_no_secret_cols CHECK (true)
);

CREATE INDEX IF NOT EXISTS idx_eng_eeh_providers_scope
  ON engineering_execution_host_providers(tenant_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_eng_eeh_providers_host
  ON engineering_execution_host_providers(host_id);

-- ---------------------------------------------------------------------------
-- Execution jobs (authorization refs; no solver qualification decisions)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engineering_execution_jobs (
  job_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  host_id text REFERENCES engineering_execution_hosts(host_id) ON DELETE SET NULL,
  provider_id text NOT NULL,
  provider_version text,
  tool_registration_ref text NOT NULL,
  method_qualification_ref text NOT NULL,
  provider_qualification_ref text NOT NULL,
  application_qualification_ref text NOT NULL,
  source_model_ref text NOT NULL,
  input_artifact_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL CHECK (status IN (
    'queued', 'accepted', 'running', 'completed', 'completed_with_warnings',
    'failed', 'timeout', 'cancelled', 'rejected',
    'provider_unavailable', 'license_unavailable', 'version_mismatch'
  )),
  timeout_ms integer NOT NULL DEFAULT 300000 CHECK (timeout_ms > 0),
  requested_by text NOT NULL,
  idempotency_key text,
  rejection_reason text,
  correlation_id text,
  request_id text,
  silent_solver_fallback_used boolean NOT NULL DEFAULT false
    CONSTRAINT eng_eeh_job_no_silent CHECK (silent_solver_fallback_used = false),
  spacegass_live_execution_certified boolean NOT NULL DEFAULT false
    CONSTRAINT eng_eeh_job_no_sg_live CHECK (spacegass_live_execution_certified = false),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_eng_eeh_jobs_idempotency
  ON engineering_execution_jobs(tenant_id, workspace_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_eng_eeh_jobs_scope
  ON engineering_execution_jobs(tenant_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_eng_eeh_jobs_status
  ON engineering_execution_jobs(status);

-- ---------------------------------------------------------------------------
-- Job artifacts (Platform Files refs only)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engineering_execution_job_artifacts (
  artifact_id text PRIMARY KEY,
  job_id text NOT NULL REFERENCES engineering_execution_jobs(job_id) ON DELETE CASCADE,
  platform_file_ref text NOT NULL,
  role text NOT NULL CHECK (role IN ('input', 'output', 'log', 'evidence')),
  content_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_eng_eeh_artifacts_job
  ON engineering_execution_job_artifacts(job_id);

-- ---------------------------------------------------------------------------
-- Host health observations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engineering_execution_host_health (
  health_id text PRIMARY KEY,
  host_id text NOT NULL REFERENCES engineering_execution_hosts(host_id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN (
    'healthy', 'degraded', 'unavailable', 'draining', 'revoked', 'unknown'
  )),
  checked_at timestamptz NOT NULL DEFAULT now(),
  heartbeat_ok boolean NOT NULL DEFAULT false,
  capacity_ok boolean NOT NULL DEFAULT false,
  provider_readiness_ok boolean NOT NULL DEFAULT false,
  workspace_readiness_ok boolean NOT NULL DEFAULT false,
  artifact_transport_ok boolean NOT NULL DEFAULT false,
  active_job_count integer NOT NULL DEFAULT 0,
  max_concurrent_jobs integer NOT NULL DEFAULT 1,
  detail_notes text
);

CREATE INDEX IF NOT EXISTS idx_eng_eeh_health_host
  ON engineering_execution_host_health(host_id, checked_at DESC);

-- ---------------------------------------------------------------------------
-- Outbox (ids/status only)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engineering_execution_host_outbox_events (
  outbox_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN (
    'engineering.execution.host.registered',
    'engineering.execution.host.health_changed',
    'engineering.execution.job.queued',
    'engineering.execution.job.started',
    'engineering.execution.job.completed',
    'engineering.execution.job.failed',
    'engineering.execution.provider.unavailable'
  )),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  correlation_id text,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_eng_eeh_outbox_scope
  ON engineering_execution_host_outbox_events(tenant_id, workspace_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE engineering_execution_hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_execution_host_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_execution_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_execution_job_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_execution_host_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_execution_host_outbox_events ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'engineering_execution_hosts',
    'engineering_execution_host_providers',
    'engineering_execution_jobs',
    'engineering_execution_job_artifacts',
    'engineering_execution_host_health',
    'engineering_execution_host_outbox_events'
  ]
  LOOP
    EXECUTE format('GRANT ALL ON %I TO anon, authenticated, service_role', t);

    IF t = 'engineering_execution_job_artifacts' OR t = 'engineering_execution_host_health' THEN
      -- Scoped via parent job/host join is preferred; allow service_role-heavy use.
      -- Tenant-scoped policies for tables with tenant_id:
      CONTINUE;
    END IF;

    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_select', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR SELECT USING (
         tenant_id = ANY(get_user_tenant_ids())
         AND workspace_id IN (
           SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
         )
       )',
      t || '_select', t
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_insert', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR INSERT WITH CHECK (
         tenant_id = ANY(get_user_tenant_ids())
         AND workspace_id IN (
           SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
         )
       )',
      t || '_insert', t
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_update', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR UPDATE USING (
         tenant_id = ANY(get_user_tenant_ids())
         AND workspace_id IN (
           SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
         )
       )',
      t || '_update', t
    );
  END LOOP;

  -- Artifacts: join to jobs for tenant/workspace
  DROP POLICY IF EXISTS engineering_execution_job_artifacts_select ON engineering_execution_job_artifacts;
  CREATE POLICY engineering_execution_job_artifacts_select ON engineering_execution_job_artifacts
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM engineering_execution_jobs j
        WHERE j.job_id = engineering_execution_job_artifacts.job_id
          AND j.tenant_id = ANY(get_user_tenant_ids())
          AND j.workspace_id IN (
            SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
          )
      )
    );
  DROP POLICY IF EXISTS engineering_execution_job_artifacts_insert ON engineering_execution_job_artifacts;
  CREATE POLICY engineering_execution_job_artifacts_insert ON engineering_execution_job_artifacts
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM engineering_execution_jobs j
        WHERE j.job_id = engineering_execution_job_artifacts.job_id
          AND j.tenant_id = ANY(get_user_tenant_ids())
          AND j.workspace_id IN (
            SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
          )
      )
    );

  -- Health: join to hosts for tenant/workspace
  DROP POLICY IF EXISTS engineering_execution_host_health_select ON engineering_execution_host_health;
  CREATE POLICY engineering_execution_host_health_select ON engineering_execution_host_health
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM engineering_execution_hosts h
        WHERE h.host_id = engineering_execution_host_health.host_id
          AND h.tenant_id = ANY(get_user_tenant_ids())
          AND h.workspace_id IN (
            SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
          )
      )
    );
  DROP POLICY IF EXISTS engineering_execution_host_health_insert ON engineering_execution_host_health;
  CREATE POLICY engineering_execution_host_health_insert ON engineering_execution_host_health
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM engineering_execution_hosts h
        WHERE h.host_id = engineering_execution_host_health.host_id
          AND h.tenant_id = ANY(get_user_tenant_ids())
          AND h.workspace_id IN (
            SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
          )
      )
    );
END $$;
