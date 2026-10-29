-- Phase 12C — Digital Twin governed state, versioning, snapshots, timeline (batch_76)
--
-- ADD module tables for governed twin state. Do NOT modify batch_75.
-- NO telemetry tables, NO simulation execution, NO runtime sync.

-- ---------------------------------------------------------------------------
-- Governed twin states
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
  category text NOT NULL
    CHECK (category IN ('observed', 'derived', 'operational', 'simulated')),
  lifecycle text NOT NULL DEFAULT 'draft'
    CHECK (lifecycle IN ('draft', 'pending_review', 'published', 'superseded', 'archived')),
  current_version integer NOT NULL DEFAULT 1,
  provenance jsonb NOT NULL,
  external_ref text NOT NULL,
  confidence numeric,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  review_status text NOT NULL DEFAULT 'not_reviewed'
    CHECK (review_status IN ('not_reviewed', 'pending_review', 'approved', 'rejected')),
  review_workflow_instance_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  superseded_at timestamptz,
  superseded_by_state_id uuid REFERENCES digital_twin_states(id) ON DELETE SET NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  simulation_executed boolean NOT NULL DEFAULT false
    CONSTRAINT dt_state_row_no_simulation CHECK (simulation_executed = false),
  live_ingestion_enabled boolean NOT NULL DEFAULT false
    CONSTRAINT dt_state_row_no_live_ingestion CHECK (live_ingestion_enabled = false),
  stores_telemetry_payload boolean NOT NULL DEFAULT false
    CONSTRAINT dt_state_row_no_telemetry CHECK (stores_telemetry_payload = false)
);

CREATE INDEX IF NOT EXISTS idx_dt_states_twin
  ON digital_twin_states(tenant_id, workspace_id, twin_id, lifecycle);

-- ---------------------------------------------------------------------------
-- Immutable state version history
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_state_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
  state_id uuid NOT NULL REFERENCES digital_twin_states(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  category text NOT NULL
    CHECK (category IN ('observed', 'derived', 'operational', 'simulated')),
  lifecycle text NOT NULL
    CHECK (lifecycle IN ('draft', 'pending_review', 'published', 'superseded', 'archived')),
  provenance jsonb NOT NULL,
  external_ref text NOT NULL,
  confidence numeric,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  review_status text NOT NULL
    CHECK (review_status IN ('not_reviewed', 'pending_review', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  simulation_executed boolean NOT NULL DEFAULT false
    CONSTRAINT dt_state_ver_no_simulation CHECK (simulation_executed = false),
  stores_telemetry_payload boolean NOT NULL DEFAULT false
    CONSTRAINT dt_state_ver_no_telemetry CHECK (stores_telemetry_payload = false),
  UNIQUE (state_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_dt_state_versions_state
  ON digital_twin_state_versions(tenant_id, workspace_id, state_id, version_number DESC);

-- ---------------------------------------------------------------------------
-- Immutable representation versions (append/supersede only)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_representation_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
  representation_type text NOT NULL
    CHECK (representation_type IN (
      'bim', 'ifc', 'cad', 'drawing', 'gis', 'point_cloud', 'process_diagram'
    )),
  source_system text NOT NULL,
  source_ref text NOT NULL,
  revision text NOT NULL,
  effective_date timestamptz NOT NULL,
  fidelity_level text NOT NULL
    CHECK (fidelity_level IN ('L0', 'L1', 'L2', 'L3', 'L4', 'L5')),
  coordinate_system text,
  units text,
  superseded_by uuid REFERENCES digital_twin_representation_versions(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  stores_geometry_payload boolean NOT NULL DEFAULT false
    CONSTRAINT dt_rep_ver_no_geometry CHECK (stores_geometry_payload = false),
  viewer_enabled boolean NOT NULL DEFAULT false
    CONSTRAINT dt_rep_ver_no_viewer CHECK (viewer_enabled = false),
  live_telemetry_bound boolean NOT NULL DEFAULT false
    CONSTRAINT dt_rep_ver_no_telemetry CHECK (live_telemetry_bound = false),
  overwrites_historical_version boolean NOT NULL DEFAULT false
    CONSTRAINT dt_rep_ver_append_only CHECK (overwrites_historical_version = false)
);

CREATE INDEX IF NOT EXISTS idx_dt_rep_versions_twin
  ON digital_twin_representation_versions(tenant_id, workspace_id, twin_id, effective_date DESC);

-- ---------------------------------------------------------------------------
-- Snapshots (versioned state refs only)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
  state_version_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  representation_version_ids jsonb,
  label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  stores_telemetry_payload boolean NOT NULL DEFAULT false
    CONSTRAINT dt_snapshot_no_telemetry CHECK (stores_telemetry_payload = false)
);

CREATE INDEX IF NOT EXISTS idx_dt_snapshots_twin
  ON digital_twin_snapshots(tenant_id, workspace_id, twin_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- Append-only timeline events
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
  event_type text NOT NULL
    CHECK (event_type IN (
      'state_created', 'state_reviewed', 'state_published', 'state_superseded', 'representation_updated'
    )),
  entity_type text NOT NULL
    CHECK (entity_type IN ('twin_state', 'representation_version', 'twin_snapshot')),
  entity_id text NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  actor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  correlation_id text,
  summary text NOT NULL,
  refs jsonb NOT NULL DEFAULT '{}'::jsonb,
  append_only boolean NOT NULL DEFAULT true
    CONSTRAINT dt_timeline_append_only CHECK (append_only = true),
  overwrites_prior_event boolean NOT NULL DEFAULT false
    CONSTRAINT dt_timeline_no_overwrite CHECK (overwrites_prior_event = false)
);

CREATE INDEX IF NOT EXISTS idx_dt_timeline_twin
  ON digital_twin_timeline_events(tenant_id, workspace_id, twin_id, recorded_at DESC);

-- ---------------------------------------------------------------------------
-- State review records (digital_twin.state_review workflow)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_state_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
  state_id uuid NOT NULL REFERENCES digital_twin_states(id) ON DELETE CASCADE,
  workflow_instance_id text NOT NULL,
  workflow_state text NOT NULL
    CHECK (workflow_state IN (
      'draft', 'pending_review', 'changes_requested', 'approved', 'rejected', 'published'
    )),
  outcome text
    CHECK (outcome IS NULL OR outcome IN (
      'approved', 'rejected', 'changes_requested', 'resubmitted'
    )),
  reviewer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  self_approved boolean NOT NULL DEFAULT false
    CONSTRAINT dt_state_review_no_self_approval CHECK (self_approved = false)
);

CREATE INDEX IF NOT EXISTS idx_dt_state_reviews_state
  ON digital_twin_state_reviews(tenant_id, workspace_id, state_id);

-- ---------------------------------------------------------------------------
-- Extend outbox event types (additive — drop/recreate CHECK)
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
    'engineering.digital_twin.snapshot.updated'
  ));

-- ---------------------------------------------------------------------------
-- RLS — tenant + workspace isolation
-- ---------------------------------------------------------------------------
ALTER TABLE digital_twin_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_state_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_representation_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_state_reviews ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'digital_twin_states',
    'digital_twin_state_versions',
    'digital_twin_representation_versions',
    'digital_twin_snapshots',
    'digital_twin_timeline_events',
    'digital_twin_state_reviews'
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

COMMENT ON TABLE digital_twin_states IS
  'Governed twin state rows with provenance — no inline telemetry payloads.';
COMMENT ON TABLE digital_twin_state_versions IS
  'Immutable twin state version history — append only.';
COMMENT ON TABLE digital_twin_representation_versions IS
  'Immutable representation versions — supersede, never overwrite.';
COMMENT ON TABLE digital_twin_snapshots IS
  'Versioned state reference snapshots — no telemetry payloads.';
COMMENT ON TABLE digital_twin_timeline_events IS
  'Append-only twin timeline — identifiers only.';
COMMENT ON TABLE digital_twin_state_reviews IS
  'Human review records for twin state. self_approved must remain false.';
