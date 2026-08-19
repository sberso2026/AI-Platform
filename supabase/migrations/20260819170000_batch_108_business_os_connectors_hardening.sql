-- Batch 108: Business OS BOS-12 Connectors and Hardening
-- Operational metadata for optional connector installations, sync runs, staging, and import batches.
-- Reuses Platform secret management (secret_id references only). Does not create a second
-- integration, secrets, jobs, agent, graph, or canonical business record stack.
-- External writes remain disabled. Staged records never become canonical merely because they were imported.

CREATE TABLE IF NOT EXISTS business_os_connector_installations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  connector_id text NOT NULL CHECK (connector_id IN ('xero', 'microsoft_365', 'hubspot', 'csv_excel')),
  version text NOT NULL,
  requested_mode text NOT NULL CHECK (requested_mode IN ('fixture', 'sandbox', 'live')),
  effective_mode text NOT NULL CHECK (effective_mode IN ('fixture', 'sandbox', 'live')),
  health text NOT NULL CHECK (health IN ('unconfigured', 'configured', 'healthy', 'degraded', 'unavailable', 'revoked')),
  write_classification text NOT NULL DEFAULT 'read_only' CHECK (write_classification = 'read_only'),
  secret_id text,
  data_classes jsonb NOT NULL DEFAULT '[]'::jsonb,
  mapping_version text NOT NULL,
  cursor text,
  last_successful_sync_at timestamptz,
  last_sync_at timestamptz,
  records_processed integer NOT NULL DEFAULT 0,
  records_rejected integer NOT NULL DEFAULT 0,
  conflicts integer NOT NULL DEFAULT 0,
  rate_limit_state text NOT NULL DEFAULT 'ok' CHECK (rate_limit_state IN ('ok', 'limited', 'backoff')),
  error_category text,
  error_message text,
  revoked_at timestamptz,
  configured_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, workspace_id, connector_id)
);

CREATE INDEX IF NOT EXISTS business_os_connector_installations_scope_idx
  ON business_os_connector_installations (tenant_id, workspace_id, health);

CREATE TABLE IF NOT EXISTS business_os_connector_sync_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_id uuid NOT NULL REFERENCES business_os_connector_installations(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  connector_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('started', 'completed', 'partial', 'failed', 'cancelled')),
  records_processed integer NOT NULL DEFAULT 0,
  records_rejected integer NOT NULL DEFAULT 0,
  conflicts integer NOT NULL DEFAULT 0,
  duplicates integer NOT NULL DEFAULT 0,
  checkpoint text,
  idempotency_key text NOT NULL,
  error_category text,
  cancelled boolean NOT NULL DEFAULT false,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, workspace_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS business_os_connector_sync_runs_scope_idx
  ON business_os_connector_sync_runs (tenant_id, workspace_id, started_at DESC);

CREATE TABLE IF NOT EXISTS business_os_connector_staging (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  connector_id text NOT NULL,
  installation_id uuid NOT NULL REFERENCES business_os_connector_installations(id) ON DELETE CASCADE,
  sync_run_id uuid NOT NULL REFERENCES business_os_connector_sync_runs(id) ON DELETE CASCADE,
  provider text NOT NULL,
  external_source_id text NOT NULL,
  data_class text NOT NULL,
  retrieved_at timestamptz NOT NULL DEFAULT now(),
  source_updated_at timestamptz,
  mapping_version text NOT NULL,
  freshness timestamptz NOT NULL DEFAULT now(),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  match_status text NOT NULL CHECK (match_status IN ('unmatched', 'duplicate', 'conflict', 'mapped')),
  conflict_reason text,
  canonical_entity_type text,
  canonical_entity_id text,
  becomes_canonical boolean NOT NULL DEFAULT false CHECK (becomes_canonical = false),
  suppressed boolean NOT NULL DEFAULT false,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS business_os_connector_staging_scope_idx
  ON business_os_connector_staging (tenant_id, workspace_id, connector_id, external_source_id);

CREATE TABLE IF NOT EXISTS business_os_connector_import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  filename text NOT NULL,
  entity_type text NOT NULL,
  status text NOT NULL CHECK (status IN ('previewed', 'committed', 'rejected')),
  row_count integer NOT NULL DEFAULT 0,
  valid_count integer NOT NULL DEFAULT 0,
  rejected_count integer NOT NULL DEFAULT 0,
  duplicates integer NOT NULL DEFAULT 0,
  conflicts integer NOT NULL DEFAULT 0,
  mapping jsonb NOT NULL DEFAULT '{}'::jsonb,
  mapping_version text NOT NULL,
  content_hash text NOT NULL,
  committed_at timestamptz,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS business_os_connector_import_batches_scope_idx
  ON business_os_connector_import_batches (tenant_id, workspace_id, created_at DESC);

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'business_os_connector_installations',
    'business_os_connector_sync_runs',
    'business_os_connector_staging',
    'business_os_connector_import_batches'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('GRANT ALL ON %I TO anon, authenticated, service_role', t);

    EXECUTE format('DROP TRIGGER IF EXISTS %I_updated_at ON %I', t, t);
    IF t IN ('business_os_connector_installations', 'business_os_connector_import_batches') THEN
      EXECUTE format(
        'CREATE TRIGGER %I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
        t, t
      );
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
       ) WITH CHECK (
         tenant_id = ANY(get_user_tenant_ids())
         AND workspace_id IN (
           SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
         )
       )',
      t || '_update', t
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_delete', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR DELETE USING (
         tenant_id = ANY(get_user_tenant_ids())
         AND workspace_id IN (
           SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
         )
       )',
      t || '_delete', t
    );
  END LOOP;
END $$;

COMMENT ON TABLE business_os_connector_installations IS
  'BOS-12 optional connector installations. secret_id is a Platform secret reference only; decrypted provider secrets never live here.';
COMMENT ON TABLE business_os_connector_sync_runs IS
  'Bounded connector sync runs with checkpoint/idempotency. Not a second jobs runtime.';
COMMENT ON TABLE business_os_connector_staging IS
  'Staged external records. becomes_canonical is always false; canonical BOS domains retain ownership.';
COMMENT ON TABLE business_os_connector_import_batches IS
  'CSV/Excel import preview and explicit commit metadata. Formulas/macros must not execute.';
