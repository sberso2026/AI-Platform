-- EOS 2.7 civil design delivery.
-- Additive workflow records. Does not alter lifecycle, basis, structural, process, mechanical, piping, or D1 tables.
-- Site and area rows are delivery records. They do not replace the civil identity foundation.
-- Existing civil projects are not enrolled.
-- This schema stores governed records. It does not evaluate grading, drainage, or earthworks.

CREATE TABLE IF NOT EXISTS engineering_civil_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'not_classified',
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  revision INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, workspace_id, project_id)
);

CREATE TABLE IF NOT EXISTS engineering_civil_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_civil_deliveries(id) ON DELETE CASCADE,
  survey_key TEXT NOT NULL,
  horizontal_datum TEXT NOT NULL,
  vertical_datum TEXT NOT NULL,
  coordinate_system TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'current' CHECK (status IN ('current', 'superseded')),
  checksum TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_civil_surfaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_civil_deliveries(id) ON DELETE CASCADE,
  surface_key TEXT NOT NULL,
  surface_kind TEXT NOT NULL CHECK (surface_kind IN ('existing', 'design')),
  datum TEXT NOT NULL,
  provenance TEXT NOT NULL,
  freshness TEXT NOT NULL DEFAULT 'current',
  calculated_here BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_civil_grading (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_civil_deliveries(id) ON DELETE CASCADE,
  grading_key TEXT NOT NULL,
  freshness TEXT NOT NULL DEFAULT 'current',
  calculated_here BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_civil_earthworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_civil_deliveries(id) ON DELETE CASCADE,
  earthworks_key TEXT NOT NULL,
  provenance TEXT NOT NULL,
  freshness TEXT NOT NULL DEFAULT 'current',
  calculated_here BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_civil_drainage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_civil_deliveries(id) ON DELETE CASCADE,
  drainage_key TEXT NOT NULL,
  provenance TEXT NOT NULL,
  freshness TEXT NOT NULL DEFAULT 'current',
  calculated_here BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_civil_roads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_civil_deliveries(id) ON DELETE CASCADE,
  road_key TEXT NOT NULL,
  road_class TEXT NOT NULL,
  freshness TEXT NOT NULL DEFAULT 'current',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_civil_quantities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_civil_deliveries(id) ON DELETE CASCADE,
  quantity_key TEXT NOT NULL,
  quantity_value TEXT NOT NULL,
  unit TEXT NOT NULL,
  provenance TEXT NOT NULL,
  freshness TEXT NOT NULL DEFAULT 'current',
  procurement_accurate BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_civil_deliverable_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_civil_deliveries(id) ON DELETE CASCADE,
  deliverable_key TEXT NOT NULL,
  title TEXT NOT NULL,
  lifecycle_stage TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  freshness TEXT NOT NULL DEFAULT 'current',
  ifc BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_civil_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_civil_deliveries(id) ON DELETE CASCADE,
  review_key TEXT NOT NULL,
  subject_key TEXT NOT NULL,
  outcome TEXT NOT NULL,
  approval_granted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_civil_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID REFERENCES engineering_civil_deliveries(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  actor_id UUID,
  detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE engineering_civil_surveys IS
  'EOS 2.7 survey delivery records. Mixed datums are rejected unless transformation metadata is supplied.';
COMMENT ON COLUMN engineering_civil_earthworks.calculated_here IS
  'Cut and fill are not calculated by EOS 2.7.';
COMMENT ON COLUMN engineering_civil_drainage.calculated_here IS
  'Drainage flow is not calculated by EOS 2.7.';

DROP TRIGGER IF EXISTS engineering_civil_deliveries_updated_at ON engineering_civil_deliveries;
CREATE TRIGGER engineering_civil_deliveries_updated_at
  BEFORE UPDATE ON engineering_civil_deliveries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DO $$
DECLARE
  target TEXT;
BEGIN
  FOREACH target IN ARRAY ARRAY[
    'engineering_civil_deliveries',
    'engineering_civil_surveys',
    'engineering_civil_surfaces',
    'engineering_civil_grading',
    'engineering_civil_earthworks',
    'engineering_civil_drainage',
    'engineering_civil_roads',
    'engineering_civil_quantities',
    'engineering_civil_deliverable_items',
    'engineering_civil_reviews',
    'engineering_civil_audit'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I_workspace_tenant ON %I', target, target);
    EXECUTE format('CREATE TRIGGER %I_workspace_tenant BEFORE INSERT OR UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant()', target, target);
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', target);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', target || '_select', target);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', target || '_insert', target);
    EXECUTE format($policy$
      CREATE POLICY %I ON %I FOR SELECT USING (
        tenant_id = ANY (get_user_tenant_ids())
        AND engineering_core_workspace_member(workspace_id)
      )
    $policy$, target || '_select', target);
    EXECUTE format($policy$
      CREATE POLICY %I ON %I FOR INSERT WITH CHECK (
        tenant_id = ANY (get_user_tenant_ids())
        AND engineering_core_workspace_member(workspace_id)
        AND has_permission('engineering', 'execute', tenant_id)
      )
    $policy$, target || '_insert', target);
  END LOOP;
END $$;

ALTER TABLE engineering_civil_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_civil_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_civil_surfaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_civil_grading ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_civil_earthworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_civil_drainage ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_civil_roads ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_civil_quantities ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_civil_deliverable_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_civil_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_civil_audit ENABLE ROW LEVEL SECURITY;
