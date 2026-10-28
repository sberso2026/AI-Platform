-- EOS 2.11 cross-discipline interface intelligence.
-- Additive handoff records. Does not alter engineering_interfaces or earlier discipline tables.
-- These rows are revision contracts. They are not a second interface identity master.
-- This schema does not replace D1K interface governance and does not calculate engineering results.
-- Existing interface rows are not enrolled or rewritten.

CREATE TABLE IF NOT EXISTS engineering_interface_handoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL,
  handoff_key TEXT NOT NULL,
  source_discipline TEXT NOT NULL,
  parameter_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'OTHER',
  revision INTEGER NOT NULL DEFAULT 1,
  previous_handoff_id UUID,
  source_object_type TEXT,
  source_object_id TEXT,
  source_revision TEXT,
  value_text TEXT,
  unit TEXT,
  coordinate_system TEXT,
  axis_convention TEXT,
  datum TEXT,
  transformation_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'ready_for_issue', 'issued', 'received', 'under_review',
    'accepted', 'accepted_with_conditions', 'rejected', 'superseded', 'cancelled'
  )),
  criticality TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (criticality IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  lifecycle_stage TEXT NOT NULL DEFAULT 'concept',
  maturity TEXT NOT NULL DEFAULT 'preliminary',
  due_date TIMESTAMPTZ,
  current_revision BOOLEAN NOT NULL DEFAULT TRUE,
  provenance TEXT NOT NULL DEFAULT 'controlled',
  canonical_interface_id UUID,
  tq_id TEXT,
  decision_id TEXT,
  recalculated BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (value_text IS NULL OR unit IS NOT NULL),
  CHECK (recalculated = FALSE)
);

CREATE TABLE IF NOT EXISTS engineering_interface_receivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  handoff_id UUID NOT NULL REFERENCES engineering_interface_handoffs(id) ON DELETE CASCADE,
  receiving_discipline TEXT NOT NULL,
  acceptance_status TEXT NOT NULL DEFAULT 'pending' CHECK (acceptance_status IN (
    'pending', 'received', 'under_review', 'accepted', 'accepted_with_conditions', 'rejected'
  )),
  condition_text TEXT,
  blocks_stage TEXT,
  rationale TEXT,
  acting_role TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_interface_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL,
  package_key TEXT NOT NULL,
  title TEXT NOT NULL,
  handoff_keys TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_interface_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL,
  from_key TEXT NOT NULL,
  to_key TEXT NOT NULL,
  relation TEXT NOT NULL CHECK (relation IN (
    'SUPPLIES', 'CONSUMES', 'DEPENDS_ON', 'SUPERSEDES', 'ACCEPTS', 'REJECTS', 'AFFECTS', 'REFERENCES', 'VERIFIES'
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_interface_dependents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL,
  dependent_key TEXT NOT NULL,
  dependent_kind TEXT NOT NULL CHECK (dependent_kind IN ('input', 'model', 'calculation', 'deliverable')),
  input_keys TEXT[] NOT NULL DEFAULT '{}',
  freshness TEXT NOT NULL DEFAULT 'current' CHECK (freshness IN ('current', 'potentially_stale')),
  conclusion TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (conclusion IS NULL)
);

CREATE TABLE IF NOT EXISTS engineering_interface_baseline_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL,
  baseline_key TEXT NOT NULL,
  baseline_type TEXT NOT NULL,
  handoff_key TEXT NOT NULL,
  revision INTEGER NOT NULL,
  acceptance_status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_interface_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  handoff_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_interface_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL,
  action TEXT NOT NULL,
  actor_id UUID,
  acting_role TEXT,
  detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE engineering_interface_handoffs IS
  'EOS 2.11 handoff revisions. Not a second interface identity master. Does not alter engineering_interfaces or calculate engineering results.';
COMMENT ON COLUMN engineering_interface_handoffs.canonical_interface_id IS
  'Optional reference to the existing engineering_interfaces row. Null when the handoff is not linked.';
COMMENT ON COLUMN engineering_interface_handoffs.recalculated IS
  'Interface changes do not recalculate engineering results.';
COMMENT ON TABLE engineering_interface_dependents IS
  'Downstream records may be marked potentially stale. Conclusions are not written by this schema.';

DROP TRIGGER IF EXISTS engineering_interface_handoffs_updated_at ON engineering_interface_handoffs;
CREATE TRIGGER engineering_interface_handoffs_updated_at
  BEFORE UPDATE ON engineering_interface_handoffs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DO $$
DECLARE
  target TEXT;
BEGIN
  FOREACH target IN ARRAY ARRAY[
    'engineering_interface_handoffs',
    'engineering_interface_receivers',
    'engineering_interface_packages',
    'engineering_interface_dependencies',
    'engineering_interface_dependents',
    'engineering_interface_baseline_revisions',
    'engineering_interface_events',
    'engineering_interface_audit'
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

ALTER TABLE engineering_interface_handoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_interface_receivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_interface_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_interface_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_interface_dependents ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_interface_baseline_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_interface_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_interface_audit ENABLE ROW LEVEL SECURITY;
