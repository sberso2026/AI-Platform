-- Phase 12D — Digital Twin governed state ingestion (batch_77)
--
-- ADD module tables for source adapters, schema registry, candidates, reconciliation.
-- Do NOT modify batch_75 or batch_76.
-- NO telemetry tables, NO auto-publish default, NO simulation execution.

-- ---------------------------------------------------------------------------
-- Source adapter registry
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_source_adapters (
  adapter_id text PRIMARY KEY,
  adapter_version text NOT NULL,
  source_type text NOT NULL
    CHECK (source_type IN (
      'manual', 'inspection_intelligence', 'asset_intelligence', 'project_controls',
      'project_intelligence', 'external_api', 'file_import', 'telemetry_reference', 'operational_system'
    )),
  source_system text NOT NULL,
  source_owner text NOT NULL,
  supported_target_types jsonb NOT NULL DEFAULT '[]'::jsonb,
  supported_state_schemas jsonb NOT NULL DEFAULT '[]'::jsonb,
  authentication_mode text NOT NULL
    CHECK (authentication_mode IN ('none', 'service_account', 'oauth', 'api_key', 'mutual_tls')),
  polling_or_push_mode text NOT NULL
    CHECK (polling_or_push_mode IN ('polling', 'push', 'manual')),
  data_freshness_policy text NOT NULL,
  idempotency_support boolean NOT NULL DEFAULT true,
  health text NOT NULL DEFAULT 'unknown'
    CHECK (health IN ('healthy', 'degraded', 'unhealthy', 'unknown')),
  status text NOT NULL DEFAULT 'inactive'
    CHECK (status IN ('active', 'inactive', 'certified', 'readiness_stub', 'unsupported')),
  public_contract_ref text,
  stores_telemetry_payload boolean NOT NULL DEFAULT false
    CONSTRAINT dt_adapter_no_telemetry CHECK (stores_telemetry_payload = false),
  auto_publish_enabled boolean NOT NULL DEFAULT false
    CONSTRAINT dt_adapter_no_auto_publish CHECK (auto_publish_enabled = false),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Versioned state schemas (no unrestricted blobs)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_state_schemas (
  schema_id text PRIMARY KEY,
  schema_version text NOT NULL,
  display_name text NOT NULL,
  category text NOT NULL
    CHECK (category IN ('observed', 'derived', 'operational')),
  fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  allows_unrestricted_blob boolean NOT NULL DEFAULT false
    CONSTRAINT dt_schema_no_blob CHECK (allows_unrestricted_blob = false),
  stores_telemetry_payload boolean NOT NULL DEFAULT false
    CONSTRAINT dt_schema_no_telemetry CHECK (stores_telemetry_payload = false),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Observed state candidates (candidate ≠ published)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_state_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
  adapter_id text NOT NULL REFERENCES digital_twin_source_adapters(adapter_id),
  schema_id text NOT NULL REFERENCES digital_twin_state_schemas(schema_id),
  schema_version text NOT NULL,
  category text NOT NULL DEFAULT 'observed'
    CHECK (category IN ('observed', 'derived', 'operational', 'simulated')),
  lifecycle text NOT NULL DEFAULT 'received'
    CHECK (lifecycle IN (
      'received', 'validated', 'reconciled', 'pending_review', 'rejected', 'published', 'superseded'
    )),
  external_ref text NOT NULL,
  idempotency_key text NOT NULL,
  observed_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  freshness text NOT NULL DEFAULT 'unknown'
    CHECK (freshness IN ('fresh', 'aging', 'stale', 'expired', 'unknown')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  provenance jsonb NOT NULL,
  unit_governance jsonb,
  confidence numeric,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  reconciliation_id uuid,
  published_state_id uuid REFERENCES digital_twin_states(id) ON DELETE SET NULL,
  review_workflow_instance_id text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  stores_telemetry_payload boolean NOT NULL DEFAULT false
    CONSTRAINT dt_candidate_no_telemetry CHECK (stores_telemetry_payload = false),
  auto_publish_attempted boolean NOT NULL DEFAULT false
    CONSTRAINT dt_candidate_no_auto_publish CHECK (auto_publish_attempted = false),
  simulation_executed boolean NOT NULL DEFAULT false
    CONSTRAINT dt_candidate_no_simulation CHECK (simulation_executed = false),
  live_ingestion_enabled boolean NOT NULL DEFAULT false
    CONSTRAINT dt_candidate_no_live_ingestion CHECK (live_ingestion_enabled = false),
  UNIQUE (tenant_id, workspace_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_dt_candidates_twin
  ON digital_twin_state_candidates(tenant_id, workspace_id, twin_id, lifecycle);

-- ---------------------------------------------------------------------------
-- State reconciliation records
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_state_reconciliation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES digital_twin_state_candidates(id) ON DELETE CASCADE,
  outcome text NOT NULL
    CHECK (outcome IN ('accepted', 'accepted_with_review', 'conflicting', 'rejected', 'superseded', 'unknown')),
  conflicting_state_id uuid REFERENCES digital_twin_states(id) ON DELETE SET NULL,
  superseded_state_id uuid REFERENCES digital_twin_states(id) ON DELETE SET NULL,
  notes text,
  evaluated_at timestamptz NOT NULL DEFAULT now(),
  evaluated_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  requires_review boolean NOT NULL DEFAULT true,
  auto_publish_blocked boolean NOT NULL DEFAULT true
    CONSTRAINT dt_recon_no_auto_publish CHECK (auto_publish_blocked = true),
  UNIQUE (tenant_id, workspace_id, candidate_id)
);

-- ---------------------------------------------------------------------------
-- Source authority policies (class-based, not universal ranking)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_source_authority_policies (
  policy_id text PRIMARY KEY,
  policy_version text NOT NULL,
  description text NOT NULL,
  rules jsonb NOT NULL DEFAULT '[]'::jsonb,
  universal_ranking_forbidden boolean NOT NULL DEFAULT true
    CONSTRAINT dt_authority_no_universal_rank CHECK (universal_ranking_forbidden = true),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Ingestion idempotency / replay detection
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_ingestion_idempotency (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  idempotency_key text NOT NULL,
  candidate_id uuid NOT NULL REFERENCES digital_twin_state_candidates(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, workspace_id, idempotency_key)
);

-- ---------------------------------------------------------------------------
-- Extend outbox event types (additive)
-- ---------------------------------------------------------------------------
ALTER TABLE digital_twin_outbox_events DROP CONSTRAINT IF EXISTS digital_twin_outbox_events_event_type_check;
ALTER TABLE digital_twin_outbox_events ADD CONSTRAINT digital_twin_outbox_events_event_type_check
  CHECK (event_type IN (
    'engineering.digital_twin.created',
    'engineering.digital_twin.updated',
    'engineering.digital_twin.relationship.updated',
    'engineering.digital_twin.representation.updated',
    'engineering.digital_twin.state.created',
    'engineering.digital_twin.state.reviewed',
    'engineering.digital_twin.state.published',
    'engineering.digital_twin.state.superseded',
    'engineering.digital_twin.snapshot.updated',
    'engineering.digital_twin.state_candidate.received',
    'engineering.digital_twin.state_candidate.validated',
    'engineering.digital_twin.state_candidate.rejected',
    'engineering.digital_twin.state.conflict_detected'
  ));

-- ---------------------------------------------------------------------------
-- RLS — tenant + workspace isolation
-- ---------------------------------------------------------------------------
ALTER TABLE digital_twin_state_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_state_reconciliation ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_ingestion_idempotency ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'digital_twin_state_candidates',
    'digital_twin_state_reconciliation',
    'digital_twin_ingestion_idempotency'
  ]
  LOOP
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
    EXECUTE format('GRANT ALL ON %I TO anon, authenticated, service_role', t);
  END LOOP;
END $$;

COMMENT ON TABLE digital_twin_source_adapters IS
  'Source adapter metadata — no telemetry payloads, no auto-publish.';
COMMENT ON TABLE digital_twin_state_schemas IS
  'Versioned twin state schemas — no unrestricted blobs.';
COMMENT ON TABLE digital_twin_state_candidates IS
  'Observed state candidates — require review before publication.';
COMMENT ON TABLE digital_twin_state_reconciliation IS
  'Reconciliation outcomes — auto_publish_blocked must remain true.';
COMMENT ON TABLE digital_twin_source_authority_policies IS
  'Class-based source authority — universal ranking forbidden.';
COMMENT ON TABLE digital_twin_ingestion_idempotency IS
  'Idempotency keys for governed ingestion replay detection.';
