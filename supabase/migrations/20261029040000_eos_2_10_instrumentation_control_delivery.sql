-- EOS 2.10 instrumentation and control design delivery.
-- Additive workflow records. Does not alter lifecycle, basis, or earlier discipline tables.
-- Instrument and cable rows are delivery references. They do not replace existing masters.
-- Existing I&C projects are not enrolled.
-- This schema stores governed records. It does not determine SIL targets or evaluate SIS performance.

CREATE TABLE IF NOT EXISTS engineering_ic_deliveries (
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

CREATE TABLE IF NOT EXISTS engineering_ic_instruments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_ic_deliveries(id) ON DELETE CASCADE,
  instrument_key TEXT NOT NULL,
  tag TEXT NOT NULL,
  range_value TEXT,
  unit TEXT,
  revision INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'current' CHECK (status IN ('current', 'superseded')),
  freshness TEXT NOT NULL DEFAULT 'current',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_ic_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_ic_deliveries(id) ON DELETE CASCADE,
  signal_key TEXT NOT NULL,
  source_name TEXT NOT NULL,
  destination_name TEXT NOT NULL,
  allocation TEXT NOT NULL CHECK (allocation IN ('bpcs', 'sis')),
  freshness TEXT NOT NULL DEFAULT 'current',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_ic_alarms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_ic_deliveries(id) ON DELETE CASCADE,
  alarm_key TEXT NOT NULL,
  setpoint_value TEXT,
  unit TEXT,
  approval_granted BOOLEAN NOT NULL DEFAULT FALSE,
  freshness TEXT NOT NULL DEFAULT 'current',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_ic_sif (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_ic_deliveries(id) ON DELETE CASCADE,
  sif_key TEXT NOT NULL,
  sil_target TEXT,
  authorized_source_id TEXT,
  allocated_to_bpcs BOOLEAN NOT NULL DEFAULT FALSE,
  verified_here BOOLEAN NOT NULL DEFAULT FALSE,
  freshness TEXT NOT NULL DEFAULT 'current',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_ic_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_ic_deliveries(id) ON DELETE CASCADE,
  verification_key TEXT NOT NULL,
  provenance TEXT NOT NULL,
  calculated_here BOOLEAN NOT NULL DEFAULT FALSE,
  certified BOOLEAN NOT NULL DEFAULT FALSE,
  freshness TEXT NOT NULL DEFAULT 'current',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_ic_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_ic_deliveries(id) ON DELETE CASCADE,
  package_key TEXT NOT NULL,
  signals_invented BOOLEAN NOT NULL DEFAULT FALSE,
  freshness TEXT NOT NULL DEFAULT 'current',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_ic_networks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_ic_deliveries(id) ON DELETE CASCADE,
  network_key TEXT NOT NULL,
  protocol TEXT NOT NULL,
  secret_stored BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_ic_cyber (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_ic_deliveries(id) ON DELETE CASCADE,
  requirement_key TEXT NOT NULL,
  statement TEXT NOT NULL,
  access_opened BOOLEAN NOT NULL DEFAULT FALSE,
  firewall_changed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_ic_deliverable_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_ic_deliveries(id) ON DELETE CASCADE,
  deliverable_key TEXT NOT NULL,
  title TEXT NOT NULL,
  lifecycle_stage TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  freshness TEXT NOT NULL DEFAULT 'current',
  ifc BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_ic_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES engineering_ic_deliveries(id) ON DELETE CASCADE,
  review_key TEXT NOT NULL,
  subject_key TEXT NOT NULL,
  outcome TEXT NOT NULL,
  approval_granted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_ic_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  delivery_id UUID REFERENCES engineering_ic_deliveries(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  actor_id UUID,
  detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE engineering_ic_sif IS
  'EOS 2.10 SIF records. A SIL target must cite an authorized safety-study source. This table does not determine SIL.';
COMMENT ON COLUMN engineering_ic_verifications.calculated_here IS
  'SIL performance is not calculated by EOS 2.10.';
COMMENT ON COLUMN engineering_ic_networks.secret_stored IS
  'Network secrets, passwords, and keys are not stored in I&C delivery records.';

DROP TRIGGER IF EXISTS engineering_ic_deliveries_updated_at ON engineering_ic_deliveries;
CREATE TRIGGER engineering_ic_deliveries_updated_at
  BEFORE UPDATE ON engineering_ic_deliveries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DO $$
DECLARE
  target TEXT;
BEGIN
  FOREACH target IN ARRAY ARRAY[
    'engineering_ic_deliveries',
    'engineering_ic_instruments',
    'engineering_ic_signals',
    'engineering_ic_alarms',
    'engineering_ic_sif',
    'engineering_ic_verifications',
    'engineering_ic_packages',
    'engineering_ic_networks',
    'engineering_ic_cyber',
    'engineering_ic_deliverable_items',
    'engineering_ic_reviews',
    'engineering_ic_audit'
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

ALTER TABLE engineering_ic_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_ic_instruments ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_ic_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_ic_alarms ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_ic_sif ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_ic_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_ic_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_ic_networks ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_ic_cyber ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_ic_deliverable_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_ic_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_ic_audit ENABLE ROW LEVEL SECURITY;
