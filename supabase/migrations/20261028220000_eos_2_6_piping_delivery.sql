-- EOS 2.6 piping design delivery.
-- Additive workflow records. Does not alter lifecycle, basis, structural, process, mechanical, or D1 tables.
-- Line rows are delivery records. They do not replace the piping identity foundation.
-- Existing piping projects are not enrolled.
-- This schema stores governed records. It does not evaluate piping stress or pipe size.

CREATE TABLE IF NOT EXISTS engineering_piping_deliveries (
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

CREATE TABLE IF NOT EXISTS engineering_piping_line_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_piping_deliveries(id) ON DELETE CASCADE,
  line_number TEXT NOT NULL,
  identity_ref TEXT,
  service TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL CHECK (status IN ('current', 'superseded')),
  freshness TEXT NOT NULL DEFAULT 'current',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_piping_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_piping_deliveries(id) ON DELETE CASCADE,
  class_key TEXT NOT NULL,
  material_family TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL CHECK (status IN ('current', 'superseded')),
  approval_granted BOOLEAN NOT NULL DEFAULT FALSE,
  freshness TEXT NOT NULL DEFAULT 'current',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_piping_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_piping_deliveries(id) ON DELETE CASCADE,
  route_key TEXT NOT NULL,
  classification TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  freshness TEXT NOT NULL DEFAULT 'current',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_piping_stress_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_piping_deliveries(id) ON DELETE CASCADE,
  model_key TEXT NOT NULL,
  solver TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  freshness TEXT NOT NULL DEFAULT 'current',
  execution_certified BOOLEAN NOT NULL DEFAULT FALSE,
  provenance TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_piping_stress_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_piping_deliveries(id) ON DELETE CASCADE,
  result_key TEXT NOT NULL,
  provenance TEXT NOT NULL,
  value TEXT,
  unit TEXT,
  freshness TEXT NOT NULL DEFAULT 'current',
  code_compliance_claimed BOOLEAN NOT NULL DEFAULT FALSE,
  execution_certified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_piping_supports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_piping_deliveries(id) ON DELETE CASCADE,
  support_key TEXT NOT NULL,
  support_type TEXT NOT NULL,
  reaction TEXT,
  unit TEXT,
  freshness TEXT NOT NULL DEFAULT 'current',
  structural_design BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_piping_tie_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_piping_deliveries(id) ON DELETE CASCADE,
  tie_in_number TEXT NOT NULL,
  field_verified BOOLEAN NOT NULL DEFAULT FALSE,
  evidence_ref TEXT,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_piping_deliverable_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_piping_deliveries(id) ON DELETE CASCADE,
  deliverable_key TEXT NOT NULL,
  title TEXT NOT NULL,
  lifecycle_stage TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  freshness TEXT NOT NULL DEFAULT 'current',
  ifc BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_piping_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_piping_deliveries(id) ON DELETE CASCADE,
  review_key TEXT NOT NULL,
  subject_key TEXT NOT NULL,
  outcome TEXT NOT NULL,
  approval_granted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_piping_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID REFERENCES engineering_piping_deliveries(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  actor_id UUID,
  detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE engineering_piping_line_records IS
  'EOS 2.6 line-list delivery records. This table is not a second piping identity master.';
COMMENT ON COLUMN engineering_piping_stress_models.execution_certified IS
  'CAESAR II and AutoPIPE execution are not certified by EOS 2.6.';
COMMENT ON COLUMN engineering_piping_stress_results.code_compliance_claimed IS
  'A stored stress fixture is not a code-compliance claim.';

DROP TRIGGER IF EXISTS engineering_piping_deliveries_updated_at ON engineering_piping_deliveries;
CREATE TRIGGER engineering_piping_deliveries_updated_at
  BEFORE UPDATE ON engineering_piping_deliveries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DO $$
DECLARE
  target TEXT;
BEGIN
  FOREACH target IN ARRAY ARRAY[
    'engineering_piping_deliveries',
    'engineering_piping_line_records',
    'engineering_piping_classes',
    'engineering_piping_routes',
    'engineering_piping_stress_models',
    'engineering_piping_stress_results',
    'engineering_piping_supports',
    'engineering_piping_tie_ins',
    'engineering_piping_deliverable_items',
    'engineering_piping_reviews',
    'engineering_piping_audit'
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

ALTER TABLE engineering_piping_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_piping_line_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_piping_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_piping_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_piping_stress_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_piping_stress_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_piping_supports ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_piping_tie_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_piping_deliverable_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_piping_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_piping_audit ENABLE ROW LEVEL SECURITY;
