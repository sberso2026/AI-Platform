-- EOS 2.5 mechanical design delivery.
-- Additive workflow records. Does not alter lifecycle, basis, structural, process, or D1 tables.
-- Existing mechanical projects are not enrolled.
-- This schema stores governed records. It does not evaluate mechanical formulas.

CREATE TABLE IF NOT EXISTS engineering_mechanical_deliveries (
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

CREATE TABLE IF NOT EXISTS engineering_mechanical_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_mechanical_deliveries(id) ON DELETE CASCADE,
  equipment_tag TEXT NOT NULL,
  equipment_kind TEXT NOT NULL CHECK (equipment_kind IN ('rotating', 'static', 'package')),
  service TEXT NOT NULL,
  process_duty_key TEXT,
  lifecycle_stage TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('current', 'superseded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_mechanical_datasheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_mechanical_deliveries(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES engineering_mechanical_equipment(id) ON DELETE CASCADE,
  revision INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL CHECK (status IN ('current', 'superseded')),
  freshness TEXT NOT NULL DEFAULT 'current',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_mechanical_vendor_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_mechanical_deliveries(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES engineering_mechanical_equipment(id) ON DELETE CASCADE,
  vendor_revision INTEGER NOT NULL,
  review_status TEXT NOT NULL CHECK (review_status IN ('received', 'under_review', 'accepted_with_comments', 'accepted', 'rejected', 'superseded')),
  checksum TEXT,
  package_approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_mechanical_calculation_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_mechanical_deliveries(id) ON DELETE CASCADE,
  calculation_key TEXT NOT NULL,
  purpose TEXT NOT NULL,
  engine TEXT NOT NULL,
  freshness TEXT NOT NULL DEFAULT 'current',
  revision INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_mechanical_deliverable_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_mechanical_deliveries(id) ON DELETE CASCADE,
  deliverable_key TEXT NOT NULL,
  title TEXT NOT NULL,
  lifecycle_stage TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  freshness TEXT NOT NULL DEFAULT 'current',
  ifc BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_mechanical_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_mechanical_deliveries(id) ON DELETE CASCADE,
  review_key TEXT NOT NULL,
  subject_key TEXT NOT NULL,
  outcome TEXT NOT NULL,
  approval_granted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_mechanical_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID REFERENCES engineering_mechanical_deliveries(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  actor_id UUID,
  detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE engineering_mechanical_calculation_links IS
  'EOS 2.5 calculation provenance. This table does not evaluate wall thickness, MAWP, shaft power, or nozzle allowable loads.';
COMMENT ON COLUMN engineering_mechanical_vendor_data.package_approved IS
  'Acceptance of a vendor revision is not approval of the equipment package.';

DROP TRIGGER IF EXISTS engineering_mechanical_deliveries_updated_at ON engineering_mechanical_deliveries;
CREATE TRIGGER engineering_mechanical_deliveries_updated_at
  BEFORE UPDATE ON engineering_mechanical_deliveries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DO $$
DECLARE
  target TEXT;
BEGIN
  FOREACH target IN ARRAY ARRAY[
    'engineering_mechanical_deliveries',
    'engineering_mechanical_equipment',
    'engineering_mechanical_datasheets',
    'engineering_mechanical_vendor_data',
    'engineering_mechanical_calculation_links',
    'engineering_mechanical_deliverable_items',
    'engineering_mechanical_reviews',
    'engineering_mechanical_audit'
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

ALTER TABLE engineering_mechanical_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_mechanical_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_mechanical_datasheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_mechanical_vendor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_mechanical_calculation_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_mechanical_deliverable_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_mechanical_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_mechanical_audit ENABLE ROW LEVEL SECURITY;
