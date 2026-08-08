-- Phase 12E — Digital Twin telemetry binding (batch_78)
--
-- ADD module tables for telemetry source/channel references, bindings, aggregation policies,
-- projection records, and binding reviews.
-- Do NOT modify batch_75, batch_76, or batch_77.
-- NO raw telemetry value/history tables.

-- ---------------------------------------------------------------------------
-- Telemetry source references (kernel / AI — references only)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_telemetry_sources (
  source_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
  source_kind text NOT NULL
    CHECK (source_kind IN (
      'platform_kernel_telemetry', 'asset_intelligence_time_series', 'external_system'
    )),
  external_ref text NOT NULL,
  engineering_series_id uuid,
  attribute_key text,
  display_name text NOT NULL,
  description text,
  owner_module text NOT NULL
    CHECK (owner_module IN ('platform_kernel_telemetry', 'asset_intelligence')),
  stores_raw_telemetry boolean NOT NULL DEFAULT false
    CONSTRAINT dt_telemetry_source_no_raw CHECK (stores_raw_telemetry = false),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, workspace_id, twin_id, external_ref)
);

CREATE INDEX IF NOT EXISTS idx_dt_telemetry_sources_twin
  ON digital_twin_telemetry_sources(tenant_id, workspace_id, twin_id);

-- ---------------------------------------------------------------------------
-- Telemetry channel references
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_telemetry_channels (
  channel_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
  source_id uuid NOT NULL REFERENCES digital_twin_telemetry_sources(source_id) ON DELETE CASCADE,
  channel_key text NOT NULL,
  display_name text NOT NULL,
  unit text NOT NULL,
  twin_attribute_key text NOT NULL,
  engineering_series_ref text,
  source_ref jsonb NOT NULL DEFAULT '{}'::jsonb,
  stores_raw_telemetry boolean NOT NULL DEFAULT false
    CONSTRAINT dt_telemetry_channel_no_raw CHECK (stores_raw_telemetry = false),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, workspace_id, twin_id, channel_key)
);

CREATE INDEX IF NOT EXISTS idx_dt_telemetry_channels_twin
  ON digital_twin_telemetry_channels(tenant_id, workspace_id, twin_id);

-- ---------------------------------------------------------------------------
-- Telemetry bindings (lifecycle governed)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_telemetry_bindings (
  binding_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
  source_id uuid NOT NULL REFERENCES digital_twin_telemetry_sources(source_id) ON DELETE CASCADE,
  channel_id uuid NOT NULL REFERENCES digital_twin_telemetry_channels(channel_id) ON DELETE CASCADE,
  binding_key text NOT NULL,
  display_name text NOT NULL,
  lifecycle text NOT NULL DEFAULT 'draft'
    CHECK (lifecycle IN (
      'draft', 'pending_review', 'approved', 'published', 'suspended', 'superseded', 'retired'
    )),
  source_ref jsonb NOT NULL DEFAULT '{}'::jsonb,
  channel_ref jsonb NOT NULL DEFAULT '{}'::jsonb,
  engineering_series_id uuid,
  policy_id uuid,
  review_workflow_instance_id text,
  superseded_by_binding_id uuid REFERENCES digital_twin_telemetry_bindings(binding_id) ON DELETE SET NULL,
  stores_raw_telemetry boolean NOT NULL DEFAULT false
    CONSTRAINT dt_telemetry_binding_no_raw CHECK (stores_raw_telemetry = false),
  auto_publish_enabled boolean NOT NULL DEFAULT false
    CONSTRAINT dt_telemetry_binding_no_auto_publish CHECK (auto_publish_enabled = false),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, workspace_id, twin_id, binding_key)
);

CREATE INDEX IF NOT EXISTS idx_dt_telemetry_bindings_twin
  ON digital_twin_telemetry_bindings(tenant_id, workspace_id, twin_id, lifecycle);

-- ---------------------------------------------------------------------------
-- Aggregation policies
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_telemetry_aggregation_policies (
  policy_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  binding_id uuid NOT NULL REFERENCES digital_twin_telemetry_bindings(binding_id) ON DELETE CASCADE,
  method text NOT NULL
    CHECK (method IN (
      'latest_valid_observation', 'mean_over_window', 'min_over_window',
      'max_over_window', 'count_over_window', 'last_known_valid'
    )),
  window_seconds integer NOT NULL DEFAULT 300,
  min_samples integer NOT NULL DEFAULT 1,
  gap_handling text NOT NULL DEFAULT 'no_data'
    CHECK (gap_handling IN (
      'no_data', 'temporary_gap', 'stale_source', 'source_offline', 'insufficient_samples'
    )),
  interpolation text NOT NULL DEFAULT 'not_implemented'
    CHECK (interpolation = 'not_implemented'),
  stale_after_seconds integer NOT NULL DEFAULT 600,
  stores_raw_telemetry boolean NOT NULL DEFAULT false
    CONSTRAINT dt_telemetry_policy_no_raw CHECK (stores_raw_telemetry = false),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, workspace_id, binding_id)
);

-- ---------------------------------------------------------------------------
-- Projection records (projected state metadata — not raw telemetry history)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_telemetry_projection_records (
  projection_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
  binding_id uuid NOT NULL REFERENCES digital_twin_telemetry_bindings(binding_id) ON DELETE CASCADE,
  projected_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  candidate_id uuid REFERENCES digital_twin_state_candidates(id) ON DELETE SET NULL,
  quality_rejected boolean NOT NULL DEFAULT false,
  stale_detected boolean NOT NULL DEFAULT false,
  source_unavailable boolean NOT NULL DEFAULT false,
  stores_raw_telemetry boolean NOT NULL DEFAULT false
    CONSTRAINT dt_telemetry_projection_no_raw CHECK (stores_raw_telemetry = false),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dt_telemetry_projections_binding
  ON digital_twin_telemetry_projection_records(tenant_id, workspace_id, binding_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- Binding review records
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_telemetry_binding_reviews (
  review_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
  binding_id uuid NOT NULL REFERENCES digital_twin_telemetry_bindings(binding_id) ON DELETE CASCADE,
  workflow_instance_id text NOT NULL,
  workflow_state text NOT NULL,
  outcome text CHECK (outcome IN ('approved', 'rejected', 'changes_requested', 'resubmitted')),
  reviewer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  self_approved boolean NOT NULL DEFAULT false
    CONSTRAINT dt_telemetry_binding_no_self_approve CHECK (self_approved = false)
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
    'engineering.digital_twin.state.conflict_detected',
    'engineering.digital_twin.telemetry_binding.created',
    'engineering.digital_twin.telemetry_binding.reviewed',
    'engineering.digital_twin.telemetry_binding.published',
    'engineering.digital_twin.telemetry_binding.suspended',
    'engineering.digital_twin.telemetry.projection_created',
    'engineering.digital_twin.telemetry.quality_rejected',
    'engineering.digital_twin.telemetry.stale_detected',
    'engineering.digital_twin.telemetry.source_unavailable'
  ));

-- ---------------------------------------------------------------------------
-- RLS — tenant + workspace isolation
-- ---------------------------------------------------------------------------
ALTER TABLE digital_twin_telemetry_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_telemetry_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_telemetry_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_telemetry_aggregation_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_telemetry_projection_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_telemetry_binding_reviews ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'digital_twin_telemetry_sources',
    'digital_twin_telemetry_channels',
    'digital_twin_telemetry_bindings',
    'digital_twin_telemetry_aggregation_policies',
    'digital_twin_telemetry_projection_records',
    'digital_twin_telemetry_binding_reviews'
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
       )',
      t || '_update', t
    );
  END LOOP;
END $$;

COMMENT ON TABLE digital_twin_telemetry_sources IS
  'Phase 12E telemetry source references — stores_raw_telemetry=false, no historian.';
COMMENT ON TABLE digital_twin_telemetry_bindings IS
  'Phase 12E governed telemetry bindings — auto_publish=false, references Asset Intelligence time series.';
