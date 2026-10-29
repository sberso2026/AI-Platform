-- EOS 2.9 electrical design delivery.
-- Additive workflow records. Does not alter lifecycle, basis, structural, process, mechanical, piping, civil, geotechnical, or D1 tables.
-- Equipment and cable rows are delivery references. They do not replace existing equipment or cable masters.
-- Existing electrical projects are not enrolled.
-- This schema stores governed records. It does not evaluate load-flow, fault-level, or cable-sizing formulas.

CREATE TABLE IF NOT EXISTS engineering_electrical_deliveries (
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

CREATE TABLE IF NOT EXISTS engineering_electrical_loads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_electrical_deliveries(id) ON DELETE CASCADE,
  load_key TEXT NOT NULL,
  rated_power TEXT NOT NULL,
  unit TEXT NOT NULL,
  category TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'current' CHECK (status IN ('current', 'superseded')),
  freshness TEXT NOT NULL DEFAULT 'current',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_electrical_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_electrical_deliveries(id) ON DELETE CASCADE,
  source_key TEXT NOT NULL,
  capacity TEXT,
  unit TEXT,
  adequacy_claimed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_electrical_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_electrical_deliveries(id) ON DELETE CASCADE,
  model_key TEXT NOT NULL,
  tool TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  execution_certified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_electrical_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_electrical_deliveries(id) ON DELETE CASCADE,
  study_key TEXT NOT NULL,
  study_kind TEXT NOT NULL,
  provenance TEXT NOT NULL,
  freshness TEXT NOT NULL DEFAULT 'current',
  calculated_here BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_electrical_cables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_electrical_deliveries(id) ON DELETE CASCADE,
  cable_key TEXT NOT NULL,
  size_value TEXT,
  unit TEXT,
  freshness TEXT NOT NULL DEFAULT 'current',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_electrical_protection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_electrical_deliveries(id) ON DELETE CASCADE,
  protection_key TEXT NOT NULL,
  setting_value TEXT,
  unit TEXT,
  approval_granted BOOLEAN NOT NULL DEFAULT FALSE,
  freshness TEXT NOT NULL DEFAULT 'current',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_electrical_earthing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_electrical_deliveries(id) ON DELETE CASCADE,
  earthing_key TEXT NOT NULL,
  calculated_here BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_electrical_deliverable_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_electrical_deliveries(id) ON DELETE CASCADE,
  deliverable_key TEXT NOT NULL,
  title TEXT NOT NULL,
  lifecycle_stage TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  freshness TEXT NOT NULL DEFAULT 'current',
  ifc BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_electrical_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_electrical_deliveries(id) ON DELETE CASCADE,
  review_key TEXT NOT NULL,
  subject_key TEXT NOT NULL,
  outcome TEXT NOT NULL,
  approval_granted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_electrical_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID REFERENCES engineering_electrical_deliveries(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  actor_id UUID,
  detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE engineering_electrical_studies IS
  'EOS 2.9 study records. An imported ETAP, PowerFactory, SKM, or EasyPower result is not an EOS-qualified calculation.';
COMMENT ON COLUMN engineering_electrical_studies.calculated_here IS
  'Load flow, short circuit, voltage drop, and cable size are not calculated by EOS 2.9.';

DROP TRIGGER IF EXISTS engineering_electrical_deliveries_updated_at ON engineering_electrical_deliveries;
CREATE TRIGGER engineering_electrical_deliveries_updated_at
  BEFORE UPDATE ON engineering_electrical_deliveries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DO $$
DECLARE
  target TEXT;
BEGIN
  FOREACH target IN ARRAY ARRAY[
    'engineering_electrical_deliveries',
    'engineering_electrical_loads',
    'engineering_electrical_sources',
    'engineering_electrical_models',
    'engineering_electrical_studies',
    'engineering_electrical_cables',
    'engineering_electrical_protection',
    'engineering_electrical_earthing',
    'engineering_electrical_deliverable_items',
    'engineering_electrical_reviews',
    'engineering_electrical_audit'
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

ALTER TABLE engineering_electrical_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_electrical_loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_electrical_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_electrical_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_electrical_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_electrical_cables ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_electrical_protection ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_electrical_earthing ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_electrical_deliverable_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_electrical_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_electrical_audit ENABLE ROW LEVEL SECURITY;
