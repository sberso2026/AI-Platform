-- EOS 2.8 geotechnical design delivery.
-- Additive workflow records. Does not alter lifecycle, basis, structural, process, mechanical, piping, civil, or D1 tables.
-- Site rows are delivery references. They do not replace the geotechnical identity foundation.
-- Existing geotechnical projects are not enrolled.
-- This schema stores governed records. It does not evaluate bearing, settlement, or slope formulas.

CREATE TABLE IF NOT EXISTS engineering_geotechnical_deliveries (
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

CREATE TABLE IF NOT EXISTS engineering_geotechnical_investigations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_geotechnical_deliveries(id) ON DELETE CASCADE,
  investigation_key TEXT NOT NULL,
  coordinate_system TEXT NOT NULL,
  vertical_datum TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'current' CHECK (status IN ('current', 'superseded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_geotechnical_boreholes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_geotechnical_deliveries(id) ON DELETE CASCADE,
  borehole_key TEXT NOT NULL,
  provenance TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_geotechnical_ground_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_geotechnical_deliveries(id) ON DELETE CASCADE,
  model_key TEXT NOT NULL,
  boundary TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'current' CHECK (status IN ('current', 'superseded')),
  freshness TEXT NOT NULL DEFAULT 'current',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_geotechnical_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_geotechnical_deliveries(id) ON DELETE CASCADE,
  parameter_key TEXT NOT NULL,
  parameter_value TEXT NOT NULL,
  unit TEXT NOT NULL,
  classification TEXT NOT NULL CHECK (classification IN ('MEASURED', 'DERIVED', 'INTERPRETED', 'CHARACTERISTIC', 'DESIGN', 'ASSUMED')),
  revision INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'current' CHECK (status IN ('current', 'superseded')),
  freshness TEXT NOT NULL DEFAULT 'current',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_geotechnical_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_geotechnical_deliveries(id) ON DELETE CASCADE,
  assessment_key TEXT NOT NULL,
  assessment_kind TEXT NOT NULL,
  provenance TEXT NOT NULL,
  freshness TEXT NOT NULL DEFAULT 'current',
  calculated_here BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_geotechnical_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_geotechnical_deliveries(id) ON DELETE CASCADE,
  recommendation_key TEXT NOT NULL,
  consumer TEXT NOT NULL,
  freshness TEXT NOT NULL DEFAULT 'current',
  structural_capacity_claimed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_geotechnical_deliverable_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_geotechnical_deliveries(id) ON DELETE CASCADE,
  deliverable_key TEXT NOT NULL,
  title TEXT NOT NULL,
  lifecycle_stage TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  freshness TEXT NOT NULL DEFAULT 'current',
  ifc BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_geotechnical_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_geotechnical_deliveries(id) ON DELETE CASCADE,
  review_key TEXT NOT NULL,
  subject_key TEXT NOT NULL,
  outcome TEXT NOT NULL,
  approval_granted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_geotechnical_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID REFERENCES engineering_geotechnical_deliveries(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  actor_id UUID,
  detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE engineering_geotechnical_parameters IS
  'EOS 2.8 parameter records. Classification is explicit. A measured value is not promoted to a design value by this table.';
COMMENT ON COLUMN engineering_geotechnical_assessments.calculated_here IS
  'Bearing, settlement, pile, and slope results are not calculated by EOS 2.8.';

DROP TRIGGER IF EXISTS engineering_geotechnical_deliveries_updated_at ON engineering_geotechnical_deliveries;
CREATE TRIGGER engineering_geotechnical_deliveries_updated_at
  BEFORE UPDATE ON engineering_geotechnical_deliveries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DO $$
DECLARE
  target TEXT;
BEGIN
  FOREACH target IN ARRAY ARRAY[
    'engineering_geotechnical_deliveries',
    'engineering_geotechnical_investigations',
    'engineering_geotechnical_boreholes',
    'engineering_geotechnical_ground_models',
    'engineering_geotechnical_parameters',
    'engineering_geotechnical_assessments',
    'engineering_geotechnical_recommendations',
    'engineering_geotechnical_deliverable_items',
    'engineering_geotechnical_reviews',
    'engineering_geotechnical_audit'
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

ALTER TABLE engineering_geotechnical_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_geotechnical_investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_geotechnical_boreholes ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_geotechnical_ground_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_geotechnical_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_geotechnical_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_geotechnical_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_geotechnical_deliverable_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_geotechnical_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_geotechnical_audit ENABLE ROW LEVEL SECURITY;
