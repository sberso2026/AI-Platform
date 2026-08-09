-- batch_87: Engineering Model Interoperability SPACE GASS (Phase 13C)
-- Additive SPACE GASS metadata / qualification / session refs.
-- Does NOT rewrite batch_86 model tables. NO model binaries. NO PostGIS.
-- Prefer Platform Files string refs.

-- ---------------------------------------------------------------------------
-- SPACE GASS provider status snapshots (runtime probe observations)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engineering_spacegass_provider_status (
  provider_status_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  provider_key text NOT NULL DEFAULT 'spacegass'
    CHECK (provider_key = 'spacegass'),
  adapter_ready boolean NOT NULL DEFAULT true,
  hosted_execution_certified boolean NOT NULL DEFAULT false
    CONSTRAINT eng_sg_status_hosted_false CHECK (hosted_execution_certified = false),
  silent_fallback_allowed boolean NOT NULL DEFAULT false
    CONSTRAINT eng_sg_status_no_silent CHECK (silent_fallback_allowed = false),
  runtime_configured boolean NOT NULL DEFAULT false,
  license_status text NOT NULL DEFAULT 'not_configured' CHECK (license_status IN (
    'available', 'unavailable', 'unknown', 'not_configured'
  )),
  version_text text,
  selected_method_key text NOT NULL DEFAULT 'linear_elastic_static',
  status_label text NOT NULL DEFAULT 'unavailable' CHECK (status_label IN (
    'healthy', 'degraded', 'unavailable', 'registered'
  )),
  detail_notes text,
  observed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_eng_sg_provider_status_scope
  ON engineering_spacegass_provider_status(tenant_id, workspace_id);

-- ---------------------------------------------------------------------------
-- Four-layer qualification records (DT semantics; interop-hosted storage)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engineering_spacegass_qualification_records (
  qualification_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  qual_layer text NOT NULL CHECK (qual_layer IN (
    'method', 'provider', 'application', 'execution'
  )),
  provider_key text NOT NULL DEFAULT 'spacegass'
    CHECK (provider_key = 'spacegass'),
  method_key text NOT NULL DEFAULT 'linear_elastic_static',
  status text NOT NULL DEFAULT 'active' CHECK (status IN (
    'draft', 'active', 'suspended', 'revoked', 'superseded'
  )),
  fixture_or_dry_run_evidence boolean NOT NULL DEFAULT true
    CONSTRAINT eng_sg_qual_fixture_evidence CHECK (fixture_or_dry_run_evidence = true),
  claims_hosted_execution_certified boolean NOT NULL DEFAULT false
    CONSTRAINT eng_sg_qual_no_hosted_claim CHECK (claims_hosted_execution_certified = false),
  claims_native_solver_ownership boolean NOT NULL DEFAULT false
    CONSTRAINT eng_sg_qual_no_native_claim CHECK (claims_native_solver_ownership = false),
  evidence_notes text,
  effective_from timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_eng_sg_qual_scope
  ON engineering_spacegass_qualification_records(tenant_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_eng_sg_qual_layer
  ON engineering_spacegass_qualification_records(qual_layer);

-- ---------------------------------------------------------------------------
-- Execution session refs (fail-closed outcomes; ids + status only)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engineering_spacegass_execution_sessions (
  execution_session_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  model_ref_id text REFERENCES engineering_model_references(model_ref_id) ON DELETE SET NULL,
  request_id text NOT NULL,
  provider_key text NOT NULL DEFAULT 'spacegass'
    CHECK (provider_key = 'spacegass'),
  method_key text NOT NULL DEFAULT 'linear_elastic_static',
  project_id text,
  project_approved boolean NOT NULL DEFAULT false,
  outcome_status text NOT NULL CHECK (outcome_status IN (
    'completed', 'completed_with_warnings', 'non_converged',
    'failed', 'cancelled', 'timeout', 'unknown'
  )),
  error_code text,
  external_process_spawned boolean NOT NULL DEFAULT false,
  silent_fallback_used boolean NOT NULL DEFAULT false
    CONSTRAINT eng_sg_sess_no_silent CHECK (silent_fallback_used = false),
  hosted_execution_certified boolean NOT NULL DEFAULT false
    CONSTRAINT eng_sg_sess_hosted_false CHECK (hosted_execution_certified = false),
  platform_file_ref text,
  detail_notes text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_eng_sg_sessions_scope
  ON engineering_spacegass_execution_sessions(tenant_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_eng_sg_sessions_model
  ON engineering_spacegass_execution_sessions(model_ref_id);

-- ---------------------------------------------------------------------------
-- Additive outbox event types for SPACE GASS (extend CHECK via new table)
-- batch_86 outbox CHECK is left intact; SPACE GASS uses dedicated outbox.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engineering_spacegass_outbox_events (
  outbox_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN (
    'engineering.spacegass.model.federated',
    'engineering.spacegass.result.referenced',
    'engineering.spacegass.qualification.recorded',
    'engineering.spacegass.execution.requested',
    'engineering.spacegass.execution.failed_closed'
  )),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  correlation_id text,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_eng_sg_outbox_scope
  ON engineering_spacegass_outbox_events(tenant_id, workspace_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE engineering_spacegass_provider_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_spacegass_qualification_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_spacegass_execution_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_spacegass_outbox_events ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'engineering_spacegass_provider_status',
    'engineering_spacegass_qualification_records',
    'engineering_spacegass_execution_sessions',
    'engineering_spacegass_outbox_events'
  ]
  LOOP
    EXECUTE format('GRANT ALL ON %I TO anon, authenticated, service_role', t);

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
END $$;
