-- Phase 12F — Digital Twin representation mapping (batch_79)
--
-- ADD module tables for representation sources, elements, mappings, reviews,
-- change impacts, and thin spatial references.
-- Do NOT modify batch_75, batch_76, batch_77, or batch_78.
-- NO source model binaries / geometry payloads / viewer authoring.

-- ---------------------------------------------------------------------------
-- Representation source references (external Engineering Model pointers)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_representation_sources (
  source_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
  format text NOT NULL
    CHECK (format IN (
      'ifc', 'bim', 'cad', 'drawing', 'gis', 'point_cloud', 'schematic', 'other'
    )),
  source_ref text NOT NULL,
  file_id text,
  display_name text NOT NULL,
  version text NOT NULL DEFAULT '1',
  fidelity_level text NOT NULL
    CHECK (fidelity_level IN ('L0', 'L1', 'L2', 'L3', 'L4', 'L5')),
  coordinate_reference_system text,
  unit_system text,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'registered', 'versioned', 'superseded', 'retired')),
  owner_module text NOT NULL DEFAULT 'external_or_existing_engineering_model_owner'
    CHECK (owner_module = 'external_or_existing_engineering_model_owner'),
  stores_geometry_payload boolean NOT NULL DEFAULT false
    CONSTRAINT dt_rep_source_no_geometry CHECK (stores_geometry_payload = false),
  stores_source_model_binary boolean NOT NULL DEFAULT false
    CONSTRAINT dt_rep_source_no_binary CHECK (stores_source_model_binary = false),
  viewer_authoring_enabled boolean NOT NULL DEFAULT false
    CONSTRAINT dt_rep_source_no_authoring CHECK (viewer_authoring_enabled = false),
  authoring_enabled boolean NOT NULL DEFAULT false
    CONSTRAINT dt_rep_source_no_authoring_alias CHECK (authoring_enabled = false),
  viewer_enabled boolean NOT NULL DEFAULT false
    CONSTRAINT dt_rep_source_no_viewer CHECK (viewer_enabled = false),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, workspace_id, twin_id, source_ref, version)
);

CREATE INDEX IF NOT EXISTS idx_dt_rep_sources_twin
  ON digital_twin_representation_sources(tenant_id, workspace_id, twin_id);

-- ---------------------------------------------------------------------------
-- Thin spatial references (outward shared-domain pointers + CRS)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_spatial_references (
  spatial_ref_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
  location_ref text,
  canonical_location_id text,
  asset_ref text,
  project_ref text,
  coordinate_reference_system text NOT NULL,
  unit_system text,
  zone_ref text,
  level_ref text,
  notes text,
  invents_location_registry boolean NOT NULL DEFAULT false
    CONSTRAINT dt_spatial_no_registry CHECK (invents_location_registry = false),
  owns_canonical_location boolean NOT NULL DEFAULT false
    CONSTRAINT dt_spatial_no_own_location CHECK (owns_canonical_location = false),
  creates_location_hierarchy boolean NOT NULL DEFAULT false
    CONSTRAINT dt_spatial_no_hierarchy CHECK (creates_location_hierarchy = false),
  stores_geometry_payload boolean NOT NULL DEFAULT false
    CONSTRAINT dt_spatial_no_geometry CHECK (stores_geometry_payload = false),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  CONSTRAINT dt_spatial_shared_pointer CHECK (
    location_ref IS NOT NULL
    OR canonical_location_id IS NOT NULL
    OR asset_ref IS NOT NULL
    OR project_ref IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_dt_spatial_refs_twin
  ON digital_twin_spatial_references(tenant_id, workspace_id, twin_id);

-- ---------------------------------------------------------------------------
-- Representation element references (no geometry blob)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_representation_elements (
  element_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
  source_id uuid NOT NULL REFERENCES digital_twin_representation_sources(source_id) ON DELETE CASCADE,
  external_element_id text NOT NULL,
  display_name text,
  element_type text,
  geometry_ref text,
  spatial_ref_id uuid REFERENCES digital_twin_spatial_references(spatial_ref_id) ON DELETE SET NULL,
  parent_element_id uuid REFERENCES digital_twin_representation_elements(element_id) ON DELETE SET NULL,
  state_context_ref text,
  telemetry_context_ref text,
  inspection_context_ref text,
  stores_geometry_payload boolean NOT NULL DEFAULT false
    CONSTRAINT dt_rep_element_no_geometry CHECK (stores_geometry_payload = false),
  stores_source_model_binary boolean NOT NULL DEFAULT false
    CONSTRAINT dt_rep_element_no_binary CHECK (stores_source_model_binary = false),
  viewer_authoring_enabled boolean NOT NULL DEFAULT false
    CONSTRAINT dt_rep_element_no_authoring CHECK (viewer_authoring_enabled = false),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, workspace_id, source_id, external_element_id)
);

CREATE INDEX IF NOT EXISTS idx_dt_rep_elements_twin
  ON digital_twin_representation_elements(tenant_id, workspace_id, twin_id);

-- ---------------------------------------------------------------------------
-- Representation mappings (versioned; published not silently overwritten)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_representation_mappings (
  mapping_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
  source_id uuid NOT NULL REFERENCES digital_twin_representation_sources(source_id) ON DELETE CASCADE,
  element_id uuid NOT NULL REFERENCES digital_twin_representation_elements(element_id) ON DELETE CASCADE,
  mapping_key text,
  display_name text,
  mapping_type text
    CHECK (mapping_type IS NULL OR mapping_type IN (
      'asset', 'component', 'location', 'telemetry', 'inspection', 'state'
    )),
  method text NOT NULL
    CHECK (method IN (
      'manual_confirmed', 'external_id_match', 'canonical_reference_match',
      'deterministic_metadata_match', 'ai_assisted_match'
    )),
  confidence text NOT NULL DEFAULT 'unknown'
    CHECK (confidence IN (
      'confirmed', 'high', 'medium', 'low', 'conflicting', 'unknown'
    )),
  lifecycle text NOT NULL DEFAULT 'draft'
    CHECK (lifecycle IN (
      'draft', 'pending_review', 'approved', 'rejected', 'published', 'superseded', 'retired'
    )),
  mapping_version integer NOT NULL DEFAULT 1,
  fidelity_level text
    CHECK (fidelity_level IS NULL OR fidelity_level IN ('L0', 'L1', 'L2', 'L3', 'L4', 'L5')),
  target_kind text
    CHECK (target_kind IS NULL OR target_kind IN (
      'twin', 'canonical_entity', 'state', 'telemetry', 'inspection'
    )),
  target_ref text,
  target_entity_ref text,
  review_workflow_instance_id text,
  superseded_by_mapping_id uuid REFERENCES digital_twin_representation_mappings(mapping_id) ON DELETE SET NULL,
  ai_suggested boolean NOT NULL DEFAULT false,
  stores_geometry_payload boolean NOT NULL DEFAULT false
    CONSTRAINT dt_rep_mapping_no_geometry CHECK (stores_geometry_payload = false),
  stores_source_model_binary boolean NOT NULL DEFAULT false
    CONSTRAINT dt_rep_mapping_no_binary CHECK (stores_source_model_binary = false),
  viewer_authoring_enabled boolean NOT NULL DEFAULT false
    CONSTRAINT dt_rep_mapping_no_authoring CHECK (viewer_authoring_enabled = false),
  auto_approve_enabled boolean NOT NULL DEFAULT false
    CONSTRAINT dt_rep_mapping_no_auto_approve CHECK (auto_approve_enabled = false),
  auto_approved boolean NOT NULL DEFAULT false
    CONSTRAINT dt_rep_mapping_no_auto_approved CHECK (auto_approved = false),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, workspace_id, twin_id, source_id, element_id, mapping_version)
);

CREATE INDEX IF NOT EXISTS idx_dt_rep_mappings_twin
  ON digital_twin_representation_mappings(tenant_id, workspace_id, twin_id, lifecycle);

-- ---------------------------------------------------------------------------
-- Mapping review records
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_representation_mapping_reviews (
  review_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
  mapping_id uuid NOT NULL REFERENCES digital_twin_representation_mappings(mapping_id) ON DELETE CASCADE,
  workflow_instance_id text NOT NULL,
  workflow_state text NOT NULL,
  outcome text CHECK (outcome IN ('approved', 'rejected', 'published', 'superseded')),
  reviewer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  self_approved boolean NOT NULL DEFAULT false
    CONSTRAINT dt_rep_mapping_no_self_approve CHECK (self_approved = false)
);

-- ---------------------------------------------------------------------------
-- Change impact records
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_representation_change_impacts (
  impact_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
  mapping_id uuid REFERENCES digital_twin_representation_mappings(mapping_id) ON DELETE SET NULL,
  source_id uuid REFERENCES digital_twin_representation_sources(source_id) ON DELETE SET NULL,
  element_id uuid REFERENCES digital_twin_representation_elements(element_id) ON DELETE SET NULL,
  impact text NOT NULL
    CHECK (impact IN ('unaffected', 'review_required', 'mapping_invalid', 'unknown')),
  reason text,
  change_summary text NOT NULL DEFAULT '',
  source_version_before text,
  source_version_after text,
  requires_review boolean NOT NULL DEFAULT false,
  detected_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  stores_geometry_payload boolean NOT NULL DEFAULT false
    CONSTRAINT dt_rep_impact_no_geometry CHECK (stores_geometry_payload = false)
);

CREATE INDEX IF NOT EXISTS idx_dt_rep_impacts_twin
  ON digital_twin_representation_change_impacts(tenant_id, workspace_id, twin_id, detected_at DESC);

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
    'engineering.digital_twin.telemetry.source_unavailable',
    'engineering.digital_twin.representation.registered',
    'engineering.digital_twin.representation.versioned',
    'engineering.digital_twin.mapping.created',
    'engineering.digital_twin.mapping.reviewed',
    'engineering.digital_twin.mapping.published',
    'engineering.digital_twin.mapping.superseded',
    'engineering.digital_twin.mapping.review_required'
  ));

-- ---------------------------------------------------------------------------
-- RLS — tenant + workspace isolation
-- ---------------------------------------------------------------------------
ALTER TABLE digital_twin_representation_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_representation_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_representation_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_representation_mapping_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_representation_change_impacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_spatial_references ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'digital_twin_representation_sources',
    'digital_twin_representation_elements',
    'digital_twin_representation_mappings',
    'digital_twin_representation_mapping_reviews',
    'digital_twin_representation_change_impacts',
    'digital_twin_spatial_references'
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

COMMENT ON TABLE digital_twin_representation_sources IS
  'Phase 12F representation source refs — stores_source_model_binary=false, no geometry.';
COMMENT ON TABLE digital_twin_representation_mappings IS
  'Phase 12F governed representation mappings — auto_approve=false, published not overwritten.';
COMMENT ON TABLE digital_twin_spatial_references IS
  'Phase 12F thin spatial refs — shared-domain location pointers + CRS only.';
