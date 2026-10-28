-- EOS 2.3 structural design delivery.
-- Additive workflow records. Does not alter D1 calculation tables, EOS 2.1 lifecycle tables, or EOS 2.2 basis tables.
-- Existing structural projects are not enrolled.

CREATE TABLE IF NOT EXISTS engineering_structural_deliveries (
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

CREATE TABLE IF NOT EXISTS engineering_structural_loads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_structural_deliveries(id) ON DELETE CASCADE,
  load_key TEXT NOT NULL,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  value TEXT,
  unit TEXT,
  revision INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL CHECK (status IN ('current', 'superseded')),
  synthetic BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_structural_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_structural_deliveries(id) ON DELETE CASCADE,
  model_key TEXT NOT NULL,
  purpose TEXT NOT NULL,
  solver TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  freshness TEXT NOT NULL DEFAULT 'current' CHECK (freshness IN ('current', 'potentially_stale', 'superseded', 'requires_review')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_structural_calculation_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_structural_deliveries(id) ON DELETE CASCADE,
  calculation_key TEXT NOT NULL,
  purpose TEXT NOT NULL,
  engine TEXT NOT NULL,
  d1_calculation_id TEXT,
  freshness TEXT NOT NULL DEFAULT 'current' CHECK (freshness IN ('current', 'potentially_stale', 'superseded', 'requires_review')),
  revision INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_structural_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_structural_deliveries(id) ON DELETE CASCADE,
  result_key TEXT NOT NULL,
  calculation_key TEXT NOT NULL,
  provenance TEXT NOT NULL,
  freshness TEXT NOT NULL DEFAULT 'current',
  synthetic BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_structural_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_structural_deliveries(id) ON DELETE CASCADE,
  deliverable_key TEXT NOT NULL,
  title TEXT NOT NULL,
  lifecycle_stage TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  freshness TEXT NOT NULL DEFAULT 'current',
  ifc BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_structural_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_structural_deliveries(id) ON DELETE CASCADE,
  review_key TEXT NOT NULL,
  subject_key TEXT NOT NULL,
  outcome TEXT NOT NULL,
  approval_granted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_structural_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID REFERENCES engineering_structural_deliveries(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  actor_id UUID,
  detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE engineering_structural_calculation_links IS
  'EOS 2.3 calculation linkage and provenance. This table does not store a new structural formula result.';
COMMENT ON COLUMN engineering_structural_deliverables.ifc IS
  'False unless an authorized review and the readiness gaps are clear. Field completeness is not IFC.';

DROP TRIGGER IF EXISTS engineering_structural_deliveries_updated_at ON engineering_structural_deliveries;
CREATE TRIGGER engineering_structural_deliveries_updated_at
  BEFORE UPDATE ON engineering_structural_deliveries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DO $$
DECLARE
  target TEXT;
BEGIN
  FOREACH target IN ARRAY ARRAY[
    'engineering_structural_deliveries',
    'engineering_structural_loads',
    'engineering_structural_models',
    'engineering_structural_calculation_links',
    'engineering_structural_results',
    'engineering_structural_deliverables',
    'engineering_structural_reviews',
    'engineering_structural_audit'
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

ALTER TABLE engineering_structural_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_structural_loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_structural_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_structural_calculation_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_structural_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_structural_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_structural_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_structural_audit ENABLE ROW LEVEL SECURITY;
