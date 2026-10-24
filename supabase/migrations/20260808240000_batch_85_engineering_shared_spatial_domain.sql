-- batch_85: Engineering Shared Spatial Domain Core (Phase 12M)
-- Canonical SpatialReference registry, CRS, coordinates, relationships,
-- reviews, legacy reconciliation. NO geometry blobs. NO PostGIS types required.
-- Declared relationships ≠ geometric proof.

-- ---------------------------------------------------------------------------
-- Coordinate reference systems (identity + metadata only)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engineering_coordinate_reference_systems (
  crs_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  crs_kind text NOT NULL CHECK (crs_kind IN ('epsg', 'project_grid', 'bim_model', 'external')),
  coordinate_reference_system text NOT NULL,
  authority text,
  epsg_code integer,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'published', 'superseded')),
  version integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  transform_implemented boolean NOT NULL DEFAULT false
    CONSTRAINT eng_crs_no_transform CHECK (transform_implemented = false),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_eng_crs_scope
  ON engineering_coordinate_reference_systems(tenant_id, workspace_id);

-- ---------------------------------------------------------------------------
-- Canonical spatial references (registry)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engineering_spatial_references (
  spatial_reference_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  code text,
  name text,
  reference_type text NOT NULL CHECK (reference_type IN (
    'site', 'facility', 'structure', 'zone', 'level', 'space',
    'asset_placement', 'project_site', 'linear_segment', 'grid_point',
    'model_anchor', 'external_place', 'unknown'
  )),
  parent_spatial_reference_id text REFERENCES engineering_spatial_references(spatial_reference_id) ON DELETE SET NULL,
  crs_id text REFERENCES engineering_coordinate_reference_systems(crs_id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'published', 'superseded')),
  version integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  superseded_by_id text REFERENCES engineering_spatial_references(spatial_reference_id) ON DELETE SET NULL,
  alignment_reference text,
  chainage text,
  station text,
  linear_offset text,
  notes text,
  hierarchy_implies_geometry boolean NOT NULL DEFAULT false
    CONSTRAINT eng_spatial_no_hierarchy_geometry CHECK (hierarchy_implies_geometry = false),
  stores_geometry_blob boolean NOT NULL DEFAULT false
    CONSTRAINT eng_spatial_no_geometry CHECK (stores_geometry_blob = false),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_eng_spatial_refs_scope
  ON engineering_spatial_references(tenant_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_eng_spatial_refs_parent
  ON engineering_spatial_references(parent_spatial_reference_id);
CREATE INDEX IF NOT EXISTS idx_eng_spatial_refs_crs
  ON engineering_spatial_references(crs_id);

-- ---------------------------------------------------------------------------
-- Declared spatial relationships (semantic only — not geometric proof)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engineering_spatial_relationships (
  relationship_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  from_spatial_reference_id text NOT NULL REFERENCES engineering_spatial_references(spatial_reference_id) ON DELETE CASCADE,
  to_spatial_reference_id text NOT NULL REFERENCES engineering_spatial_references(spatial_reference_id) ON DELETE CASCADE,
  relationship_kind text NOT NULL CHECK (relationship_kind IN (
    'located_at', 'contained_by', 'contains', 'adjacent_to', 'intersects',
    'crosses', 'aligned_with', 'positioned_on', 'mapped_to', 'references', 'unknown'
  )),
  geometric_proof boolean NOT NULL DEFAULT false
    CONSTRAINT eng_rel_no_geometric_proof CHECK (geometric_proof = false),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_eng_spatial_rels_scope
  ON engineering_spatial_relationships(tenant_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_eng_spatial_rels_from
  ON engineering_spatial_relationships(from_spatial_reference_id);
CREATE INDEX IF NOT EXISTS idx_eng_spatial_rels_to
  ON engineering_spatial_relationships(to_spatial_reference_id);

-- ---------------------------------------------------------------------------
-- Coordinate references (optional scalars WITH CRS — not geometry blobs)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engineering_coordinate_references (
  coordinate_reference_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  spatial_reference_id text REFERENCES engineering_spatial_references(spatial_reference_id) ON DELETE SET NULL,
  crs_id text NOT NULL REFERENCES engineering_coordinate_reference_systems(crs_id) ON DELETE RESTRICT,
  x double precision,
  y double precision,
  z double precision,
  latitude double precision,
  longitude double precision,
  elevation double precision,
  stores_geometry_blob boolean NOT NULL DEFAULT false
    CONSTRAINT eng_coord_no_geometry CHECK (stores_geometry_blob = false),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_eng_coords_scope
  ON engineering_coordinate_references(tenant_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_eng_coords_crs
  ON engineering_coordinate_references(crs_id);

-- ---------------------------------------------------------------------------
-- Spatial reference reviews (no AI self-approval)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engineering_spatial_reference_reviews (
  review_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  spatial_reference_id text NOT NULL REFERENCES engineering_spatial_references(spatial_reference_id) ON DELETE CASCADE,
  decision text NOT NULL CHECK (decision IN ('approve', 'reject', 'request_changes', 'abstain')),
  reviewer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  rationale text,
  ai_self_approval boolean NOT NULL DEFAULT false
    CONSTRAINT eng_spatial_review_no_ai_self CHECK (ai_self_approval = false),
  workflow_slug text NOT NULL DEFAULT 'engineering_shared_spatial_domain.spatial_reference_review',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_eng_spatial_reviews_scope
  ON engineering_spatial_reference_reviews(tenant_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_eng_spatial_reviews_ref
  ON engineering_spatial_reference_reviews(spatial_reference_id);

-- ---------------------------------------------------------------------------
-- Legacy TEXT reconciliation (candidate ≠ canonical; never auto-promote)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engineering_legacy_spatial_reconciliations (
  reconciliation_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  source_table text NOT NULL,
  source_column text NOT NULL,
  source_record_id text NOT NULL,
  legacy_text text NOT NULL,
  state text NOT NULL DEFAULT 'unmapped' CHECK (state IN (
    'unmapped', 'candidate_match', 'confirmed', 'conflicting', 'legacy_only', 'unknown'
  )),
  candidate_spatial_reference_id text REFERENCES engineering_spatial_references(spatial_reference_id) ON DELETE SET NULL,
  confirmed_spatial_reference_id text REFERENCES engineering_spatial_references(spatial_reference_id) ON DELETE SET NULL,
  is_canonical boolean NOT NULL DEFAULT false
    CONSTRAINT eng_legacy_not_auto_canonical CHECK (is_canonical = false),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_eng_legacy_spatial_scope
  ON engineering_legacy_spatial_reconciliations(tenant_id, workspace_id);

-- ---------------------------------------------------------------------------
-- Lightweight spatial outbox (ids only; separate from Digital Twin outbox tables)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engineering_shared_spatial_outbox_events (
  outbox_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN (
    'engineering.spatial.reference.created',
    'engineering.spatial.reference.updated',
    'engineering.spatial.reference.superseded',
    'engineering.spatial.reference.published',
    'engineering.spatial.relationship.created',
    'engineering.spatial.mapping.confirmed',
    'engineering.spatial.review.recorded',
    'engineering.spatial.crs.created',
    'engineering.spatial.coordinate.created',
    'engineering.spatial.legacy.classified'
  )),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  correlation_id text,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_eng_spatial_outbox_scope
  ON engineering_shared_spatial_outbox_events(tenant_id, workspace_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE engineering_coordinate_reference_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_spatial_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_spatial_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_coordinate_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_spatial_reference_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_legacy_spatial_reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_shared_spatial_outbox_events ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'engineering_coordinate_reference_systems',
    'engineering_spatial_references',
    'engineering_spatial_relationships',
    'engineering_coordinate_references',
    'engineering_spatial_reference_reviews',
    'engineering_legacy_spatial_reconciliations',
    'engineering_shared_spatial_outbox_events'
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
