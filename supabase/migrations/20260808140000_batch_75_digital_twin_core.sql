-- Phase 12B — Digital Twin core domain persistence (batch_75)
--
-- Hybrid approach: PRESERVE kernel digital_twins* tables — do not drop/rewrite.
-- ADD module tables with PC-style naming for identity, representation, relationships,
-- thread links, state references, reviews, and outbox.
--
-- Core slice only: NO telemetry tables, NO simulation execution, NO runtime sync.

-- ---------------------------------------------------------------------------
-- Twin identities
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_identities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL,
  canonical_entity_type text NOT NULL
    CHECK (canonical_entity_type IN (
      'asset', 'project', 'facility', 'structure', 'location', 'system', 'component'
    )),
  canonical_entity_id uuid NOT NULL,
  twin_type text NOT NULL DEFAULT 'reference'
    CHECK (twin_type IN ('reference', 'operational', 'design', 'as_built', 'reserved')),
  twin_version integer NOT NULL DEFAULT 1,
  configuration_version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected', 'published', 'archived')),
  kernel_twin_id uuid,
  review_workflow_instance_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  published_at timestamptz,
  -- Forbid locks
  mutates_canonical_identity boolean NOT NULL DEFAULT false
    CONSTRAINT dt_identity_no_identity_mutation CHECK (mutates_canonical_identity = false),
  duplicates_asset_fields boolean NOT NULL DEFAULT false
    CONSTRAINT dt_identity_no_asset_duplication CHECK (duplicates_asset_fields = false),
  live_telemetry_bound boolean NOT NULL DEFAULT false
    CONSTRAINT dt_identity_no_live_telemetry CHECK (live_telemetry_bound = false),
  simulation_executed boolean NOT NULL DEFAULT false
    CONSTRAINT dt_identity_no_simulation CHECK (simulation_executed = false),
  runtime_sync_enabled boolean NOT NULL DEFAULT false
    CONSTRAINT dt_identity_no_runtime_sync CHECK (runtime_sync_enabled = false),
  physical_actuation_enabled boolean NOT NULL DEFAULT false
    CONSTRAINT dt_identity_no_actuation CHECK (physical_actuation_enabled = false),
  UNIQUE (tenant_id, workspace_id, twin_id),
  UNIQUE (tenant_id, workspace_id, canonical_entity_type, canonical_entity_id)
);

CREATE INDEX IF NOT EXISTS idx_dt_identities_tenant_ws
  ON digital_twin_identities(tenant_id, workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dt_identities_target
  ON digital_twin_identities(canonical_entity_type, canonical_entity_id);
CREATE INDEX IF NOT EXISTS idx_dt_identities_kernel
  ON digital_twin_identities(kernel_twin_id) WHERE kernel_twin_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Twin representations (references only)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_representations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
  representation_type text NOT NULL
    CHECK (representation_type IN (
      'bim', 'ifc', 'cad', 'drawing', 'gis', 'point_cloud', 'process_diagram'
    )),
  source_ref text NOT NULL,
  version text NOT NULL,
  fidelity_level text NOT NULL
    CHECK (fidelity_level IN ('L0', 'L1', 'L2', 'L3', 'L4', 'L5')),
  coordinate_system text,
  units text,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft', 'active', 'superseded', 'archived', 'unavailable')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  stores_geometry_payload boolean NOT NULL DEFAULT false
    CONSTRAINT dt_rep_no_geometry CHECK (stores_geometry_payload = false),
  viewer_enabled boolean NOT NULL DEFAULT false
    CONSTRAINT dt_rep_no_viewer CHECK (viewer_enabled = false),
  live_telemetry_bound boolean NOT NULL DEFAULT false
    CONSTRAINT dt_rep_no_telemetry CHECK (live_telemetry_bound = false)
);

CREATE INDEX IF NOT EXISTS idx_dt_representations_twin
  ON digital_twin_representations(tenant_id, workspace_id, twin_id);

-- ---------------------------------------------------------------------------
-- Twin typed relationships (module plane)
-- NOTE: Kernel already owns digital_twin_relationships (from↔to twin edges).
-- Module typed edges live in digital_twin_typed_relationships to avoid collision.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_typed_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
  relationship_type text NOT NULL
    CHECK (relationship_type IN (
      'represents', 'contains', 'connected_to', 'monitored_by', 'references', 'derived_from'
    )),
  target_ref text NOT NULL,
  target_kind text NOT NULL
    CHECK (target_kind IN ('twin', 'canonical_entity', 'external_ref')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  knowledge_graph_reuse boolean NOT NULL DEFAULT true
    CONSTRAINT dt_rel_kg_reuse CHECK (knowledge_graph_reuse = true),
  new_graph_engine_introduced boolean NOT NULL DEFAULT false
    CONSTRAINT dt_rel_no_new_graph CHECK (new_graph_engine_introduced = false)
);

CREATE INDEX IF NOT EXISTS idx_dt_typed_relationships_twin
  ON digital_twin_typed_relationships(tenant_id, workspace_id, twin_id);

-- ---------------------------------------------------------------------------
-- Digital thread links
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_thread_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
  target_type text NOT NULL
    CHECK (target_type IN (
      'asset', 'project', 'document', 'inspection', 'asset_intelligence_ref',
      'project_controls_ref', 'project_intelligence_ref', 'inspection_intelligence_ref',
      'platform_timeline', 'knowledge_graph_node', 'other_twin'
    )),
  target_ref text NOT NULL,
  platform_timeline_ref text
    CHECK (platform_timeline_ref IS NULL OR platform_timeline_ref IN (
      'project_controls_project_timeline',
      'asset_intelligence_timeline',
      'inspection_intelligence_timeline',
      'engineering_project_timeline'
    )),
  label text,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  duplicates_timeline_storage boolean NOT NULL DEFAULT false
    CONSTRAINT dt_thread_no_timeline_dup CHECK (duplicates_timeline_storage = false)
);

CREATE INDEX IF NOT EXISTS idx_dt_thread_links_twin
  ON digital_twin_thread_links(tenant_id, workspace_id, twin_id);

-- ---------------------------------------------------------------------------
-- State references (observed/derived/operational/simulated)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_state_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
  category text NOT NULL
    CHECK (category IN ('observed', 'derived', 'operational', 'simulated')),
  version integer NOT NULL DEFAULT 1,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'superseded', 'archived')),
  external_ref text NOT NULL,
  observed_at timestamptz,
  derived_from_refs jsonb DEFAULT '[]'::jsonb,
  operational_context text,
  simulation_scenario_ref text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  simulation_executed boolean NOT NULL DEFAULT false
    CONSTRAINT dt_state_no_simulation CHECK (simulation_executed = false),
  live_ingestion_enabled boolean NOT NULL DEFAULT false
    CONSTRAINT dt_state_no_live_ingestion CHECK (live_ingestion_enabled = false)
);

CREATE INDEX IF NOT EXISTS idx_dt_state_refs_twin
  ON digital_twin_state_references(tenant_id, workspace_id, twin_id, category);

-- ---------------------------------------------------------------------------
-- Identity reviews
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
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
    CONSTRAINT dt_review_no_self_approval CHECK (self_approved = false)
);

CREATE INDEX IF NOT EXISTS idx_dt_reviews_twin
  ON digital_twin_reviews(tenant_id, workspace_id, twin_id);

-- ---------------------------------------------------------------------------
-- Outbox events
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_outbox_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
  event_type text NOT NULL
    CHECK (event_type IN (
      'engineering.digital_twin.created',
      'engineering.digital_twin.updated',
      'engineering.digital_twin.relationship.updated',
      'engineering.digital_twin.representation.updated'
    )),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  correlation_id text,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_dt_outbox_unpublished
  ON digital_twin_outbox_events(published, created_at ASC)
  WHERE published = false;

-- ---------------------------------------------------------------------------
-- RLS — tenant + workspace isolation
-- ---------------------------------------------------------------------------
ALTER TABLE digital_twin_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_representations ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_typed_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_thread_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_state_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_outbox_events ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'digital_twin_identities',
    'digital_twin_representations',
    'digital_twin_typed_relationships',
    'digital_twin_thread_links',
    'digital_twin_state_references',
    'digital_twin_reviews',
    'digital_twin_outbox_events'
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

COMMENT ON TABLE digital_twin_identities IS
  'Digital Twin core identity. References canonical entity only — never duplicates Asset/Project identity fields.';
COMMENT ON TABLE digital_twin_representations IS
  'Representation references only — no geometry payload, no viewer, no live telemetry.';
COMMENT ON TABLE digital_twin_typed_relationships IS
  'Module typed twin relationships (distinct from kernel digital_twin_relationships). Surfaces via Platform KG — no new graph engine.';
COMMENT ON TABLE digital_twin_thread_links IS
  'Digital thread links by reference — reuses platform timelines, does not duplicate storage.';
COMMENT ON TABLE digital_twin_state_references IS
  'State reference containers. Simulated ≠ observed. No live ingestion in Phase 12B.';
COMMENT ON TABLE digital_twin_reviews IS
  'Human review records for twin identity. self_approved must remain false.';
COMMENT ON TABLE digital_twin_outbox_events IS
  'Digital Twin domain outbox — identifiers only, no telemetry payloads.';
