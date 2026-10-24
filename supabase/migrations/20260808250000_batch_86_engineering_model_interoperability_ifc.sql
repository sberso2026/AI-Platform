-- batch_86: Engineering Model Interoperability IFC Federation (Phase 13B)
-- Federated model references, versions, elements, mappings, reviews,
-- change-impacts, result references. NO model binaries in PG.
-- NO PostGIS / geometry blobs. Prefer Platform Files string refs.

-- ---------------------------------------------------------------------------
-- Engineering model references (federated; source-owned)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engineering_model_references (
  model_ref_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  provider_key text NOT NULL,
  external_model_id text NOT NULL,
  display_name text,
  format_family text NOT NULL DEFAULT 'unknown' CHECK (format_family IN (
    'ifc', 'native', 'exchange', 'unknown'
  )),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'ingested', 'federated', 'superseded', 'rejected', 'unknown'
  )),
  platform_file_ref text,
  project_id text,
  asset_id text,
  spatial_reference_id text,
  twin_id text,
  schema_hint text,
  notes text,
  rtb_owned boolean NOT NULL DEFAULT false
    CONSTRAINT eng_model_ref_not_rtb_owned CHECK (rtb_owned = false),
  federated boolean NOT NULL DEFAULT true
    CONSTRAINT eng_model_ref_federated CHECK (federated = true),
  version integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_eng_model_refs_scope
  ON engineering_model_references(tenant_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_eng_model_refs_provider
  ON engineering_model_references(provider_key);

-- ---------------------------------------------------------------------------
-- Model versions (metadata + Platform Files ref; no binary blob)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engineering_model_versions (
  model_version_id text PRIMARY KEY,
  model_ref_id text NOT NULL REFERENCES engineering_model_references(model_ref_id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  version_label text NOT NULL,
  platform_file_ref text,
  schema_id text,
  parser_version text,
  content_sha256 text,
  element_count integer,
  ingested_at timestamptz,
  notes text,
  stores_model_binary boolean NOT NULL DEFAULT false
    CONSTRAINT eng_model_ver_no_binary CHECK (stores_model_binary = false),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_eng_model_versions_scope
  ON engineering_model_versions(tenant_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_eng_model_versions_model
  ON engineering_model_versions(model_ref_id);

-- ---------------------------------------------------------------------------
-- Model elements (ids + source properties; no geometry blobs)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engineering_model_elements (
  element_ref_id text PRIMARY KEY,
  model_ref_id text NOT NULL REFERENCES engineering_model_references(model_ref_id) ON DELETE CASCADE,
  model_version_id text REFERENCES engineering_model_versions(model_version_id) ON DELETE SET NULL,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  external_element_id text NOT NULL,
  global_id text,
  element_kind text,
  ifc_entity_type text,
  display_name text,
  storey_name text,
  source_properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  spatial_reference_id text,
  asset_id text,
  twin_id text,
  stores_geometry_blob boolean NOT NULL DEFAULT false
    CONSTRAINT eng_model_el_no_geometry CHECK (stores_geometry_blob = false),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_eng_model_elements_scope
  ON engineering_model_elements(tenant_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_eng_model_elements_model
  ON engineering_model_elements(model_ref_id);
CREATE INDEX IF NOT EXISTS idx_eng_model_elements_global
  ON engineering_model_elements(global_id);

-- ---------------------------------------------------------------------------
-- Mappings (candidate ≠ confirmed; human review required)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engineering_model_mappings (
  mapping_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  model_ref_id text NOT NULL REFERENCES engineering_model_references(model_ref_id) ON DELETE CASCADE,
  model_version_id text REFERENCES engineering_model_versions(model_version_id) ON DELETE SET NULL,
  element_ref_id text REFERENCES engineering_model_elements(element_ref_id) ON DELETE SET NULL,
  target_kind text NOT NULL CHECK (target_kind IN (
    'asset', 'project', 'spatial', 'twin', 'element', 'unknown'
  )),
  target_id text,
  state text NOT NULL DEFAULT 'unmapped' CHECK (state IN (
    'unmapped', 'candidate', 'confirmed', 'conflicting', 'superseded', 'unknown'
  )),
  candidate_target_id text,
  confirmed_target_id text,
  notes text,
  ai_self_approval boolean NOT NULL DEFAULT false
    CONSTRAINT eng_model_map_no_ai_self CHECK (ai_self_approval = false),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_eng_model_mappings_scope
  ON engineering_model_mappings(tenant_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_eng_model_mappings_model
  ON engineering_model_mappings(model_ref_id);

-- ---------------------------------------------------------------------------
-- Mapping reviews (no AI self-approval)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engineering_model_mapping_reviews (
  review_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  mapping_id text NOT NULL REFERENCES engineering_model_mappings(mapping_id) ON DELETE CASCADE,
  decision text NOT NULL CHECK (decision IN (
    'confirm', 'reject', 'request_changes', 'abstain'
  )),
  reviewer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  rationale text,
  ai_self_approval boolean NOT NULL DEFAULT false
    CONSTRAINT eng_model_review_no_ai_self CHECK (ai_self_approval = false),
  workflow_slug text NOT NULL DEFAULT 'engineering_model_interoperability.mapping_review',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_eng_model_reviews_scope
  ON engineering_model_mapping_reviews(tenant_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_eng_model_reviews_mapping
  ON engineering_model_mapping_reviews(mapping_id);

-- ---------------------------------------------------------------------------
-- Change impacts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engineering_model_change_impacts (
  change_impact_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  model_ref_id text NOT NULL REFERENCES engineering_model_references(model_ref_id) ON DELETE CASCADE,
  from_model_version_id text REFERENCES engineering_model_versions(model_version_id) ON DELETE SET NULL,
  to_model_version_id text REFERENCES engineering_model_versions(model_version_id) ON DELETE SET NULL,
  summary text NOT NULL,
  severity text NOT NULL DEFAULT 'unknown' CHECK (severity IN (
    'info', 'low', 'medium', 'high', 'unknown'
  )),
  affected_element_count integer,
  affected_mapping_count integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_eng_model_impacts_scope
  ON engineering_model_change_impacts(tenant_id, workspace_id);

-- ---------------------------------------------------------------------------
-- Result references (IFC imported ≠ rtb_execution_certified)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engineering_model_result_references (
  result_ref_id text PRIMARY KEY,
  model_ref_id text NOT NULL REFERENCES engineering_model_references(model_ref_id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  external_result_id text NOT NULL,
  result_kind text,
  provenance text NOT NULL CHECK (provenance IN ('external_existing', 'rtb_generated')),
  rtb_generated boolean NOT NULL DEFAULT false,
  trust_classification text NOT NULL CHECK (trust_classification IN (
    'source_declared', 'source_reviewed', 'externally_approved',
    'rtb_execution_certified', 'unknown'
  )),
  solver_provider_id text,
  platform_file_ref text,
  owner text NOT NULL CHECK (owner IN (
    'source_client_engineering_application', 'digital_twin'
  )),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  CONSTRAINT eng_model_result_ifc_import_trust CHECK (
    NOT (provenance = 'external_existing' AND trust_classification = 'rtb_execution_certified')
  )
);

CREATE INDEX IF NOT EXISTS idx_eng_model_results_scope
  ON engineering_model_result_references(tenant_id, workspace_id);

-- ---------------------------------------------------------------------------
-- Lightweight outbox (ids only)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engineering_model_interop_outbox_events (
  outbox_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN (
    'engineering.model.reference.created',
    'engineering.model.version.ingested',
    'engineering.model.element.indexed',
    'engineering.model.mapping.candidate',
    'engineering.model.mapping.confirmed',
    'engineering.model.mapping.review.recorded',
    'engineering.model.change_impact.recorded',
    'engineering.model.result.referenced'
  )),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  correlation_id text,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_eng_model_outbox_scope
  ON engineering_model_interop_outbox_events(tenant_id, workspace_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE engineering_model_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_model_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_model_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_model_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_model_mapping_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_model_change_impacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_model_result_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_model_interop_outbox_events ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'engineering_model_references',
    'engineering_model_versions',
    'engineering_model_elements',
    'engineering_model_mappings',
    'engineering_model_mapping_reviews',
    'engineering_model_change_impacts',
    'engineering_model_result_references',
    'engineering_model_interop_outbox_events'
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
