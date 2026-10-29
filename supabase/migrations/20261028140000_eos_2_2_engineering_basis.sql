-- EOS 2.2 common design basis and requirements.
-- Additive. Does not alter engineering_requirements or EOS 2.1 lifecycle tables.
-- Existing requirement rows are not copied or reclassified.

CREATE TABLE IF NOT EXISTS engineering_basis_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'not_classified',
  jurisdiction_profile TEXT,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  revision INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, workspace_id, project_id)
);

CREATE TABLE IF NOT EXISTS engineering_basis_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  basis_set_id UUID NOT NULL REFERENCES engineering_basis_sets(id) ON DELETE CASCADE,
  source_key TEXT NOT NULL,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  revision TEXT NOT NULL,
  locator TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_basis_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  basis_set_id UUID NOT NULL REFERENCES engineering_basis_sets(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  hierarchy_level TEXT NOT NULL CHECK (hierarchy_level IN ('project', 'discipline', 'system', 'asset')),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  statement TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'under_review', 'accepted_for_stage', 'approved', 'superseded', 'withdrawn')),
  revision INTEGER NOT NULL DEFAULT 1,
  parent_item_key TEXT,
  inheritance TEXT NOT NULL CHECK (inheritance IN ('inherit', 'specialize', 'override', 'add', 'not_applicable')),
  override_rationale TEXT,
  lifecycle_stage TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_basis_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  basis_set_id UUID NOT NULL REFERENCES engineering_basis_sets(id) ON DELETE CASCADE,
  requirement_key TEXT NOT NULL,
  title TEXT NOT NULL,
  statement TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'proposed', 'accepted', 'verified', 'deferred', 'superseded', 'rejected', 'not_applicable')),
  legacy_requirement_id UUID,
  revision INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_basis_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  basis_set_id UUID NOT NULL REFERENCES engineering_basis_sets(id) ON DELETE CASCADE,
  criterion_key TEXT NOT NULL,
  title TEXT NOT NULL,
  statement TEXT NOT NULL,
  status TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_basis_assumptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  basis_set_id UUID NOT NULL REFERENCES engineering_basis_sets(id) ON DELETE CASCADE,
  assumption_key TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'accepted_for_stage', 'validated', 'resolved', 'superseded', 'rejected')),
  blocks_next_stage BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_basis_inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  basis_set_id UUID NOT NULL REFERENCES engineering_basis_sets(id) ON DELETE CASCADE,
  input_key TEXT NOT NULL,
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  unit TEXT,
  status TEXT NOT NULL CHECK (status IN ('current', 'superseded')),
  revision INTEGER NOT NULL DEFAULT 1,
  freshness TEXT NOT NULL DEFAULT 'current' CHECK (freshness IN ('current', 'potentially_stale', 'superseded', 'requires_review')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_basis_standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  basis_set_id UUID NOT NULL REFERENCES engineering_basis_sets(id) ON DELETE CASCADE,
  standard_key TEXT NOT NULL,
  identifier TEXT NOT NULL,
  edition TEXT NOT NULL,
  jurisdiction_profile TEXT,
  status TEXT NOT NULL DEFAULT 'current',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_basis_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  basis_set_id UUID NOT NULL REFERENCES engineering_basis_sets(id) ON DELETE CASCADE,
  verification_key TEXT NOT NULL,
  requirement_key TEXT NOT NULL,
  method TEXT NOT NULL,
  evidence_ref TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('pass', 'fail', 'conditional')),
  freshness TEXT NOT NULL DEFAULT 'current',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_basis_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  basis_set_id UUID NOT NULL REFERENCES engineering_basis_sets(id) ON DELETE CASCADE,
  from_type TEXT NOT NULL,
  from_key TEXT NOT NULL,
  to_type TEXT NOT NULL,
  to_key TEXT NOT NULL,
  relationship TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_basis_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  basis_set_id UUID REFERENCES engineering_basis_sets(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  actor_id UUID,
  detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE engineering_basis_requirements IS
  'EOS 2.2 lifecycle basis-chain requirement. Not a copy of EOS-A4 engineering_requirements. legacy_requirement_id may point at an existing row and is not backfilled.';
COMMENT ON COLUMN engineering_basis_items.status IS
  'accepted_for_stage is stage acceptance, not final engineering approval.';

DROP TRIGGER IF EXISTS engineering_basis_sets_updated_at ON engineering_basis_sets;
CREATE TRIGGER engineering_basis_sets_updated_at
  BEFORE UPDATE ON engineering_basis_sets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DO $$
DECLARE
  target TEXT;
BEGIN
  FOREACH target IN ARRAY ARRAY[
    'engineering_basis_sets',
    'engineering_basis_sources',
    'engineering_basis_items',
    'engineering_basis_requirements',
    'engineering_basis_criteria',
    'engineering_basis_assumptions',
    'engineering_basis_inputs',
    'engineering_basis_standards',
    'engineering_basis_verifications',
    'engineering_basis_links',
    'engineering_basis_audit'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I_workspace_tenant ON %I', target, target);
    EXECUTE format('CREATE TRIGGER %I_workspace_tenant BEFORE INSERT OR UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant()', target, target);
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', target);
    EXECUTE format('DROP POLICY IF EXISTS %I_select ON %I', target, target);
    EXECUTE format('DROP POLICY IF EXISTS %I_insert ON %I', target, target);
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

ALTER TABLE engineering_basis_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_basis_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_basis_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_basis_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_basis_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_basis_assumptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_basis_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_basis_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_basis_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_basis_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_basis_audit ENABLE ROW LEVEL SECURITY;
