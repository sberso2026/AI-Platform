-- EOS 2.13 design freeze and deliverable governance.
-- Additive freeze and release records. Does not alter engineering_configuration_baselines, engineering_documents, or engineering_deliverable_assessments.
-- A freeze stores exact revisions. It is not a second document-control system.
-- Release is not performed by this schema. AI does not approve a baseline.

CREATE TABLE IF NOT EXISTS engineering_design_freezes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL,
  freeze_key TEXT NOT NULL,
  freeze_type TEXT NOT NULL,
  stage TEXT NOT NULL,
  title TEXT NOT NULL,
  scope TEXT NOT NULL,
  frozen BOOLEAN NOT NULL DEFAULT FALSE,
  fingerprint TEXT NOT NULL,
  approval_status TEXT NOT NULL DEFAULT 'pending',
  approved_by_ai BOOLEAN NOT NULL DEFAULT FALSE,
  provenance TEXT NOT NULL DEFAULT 'controlled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (approved_by_ai = FALSE)
);

CREATE TABLE IF NOT EXISTS engineering_design_freeze_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  freeze_id UUID NOT NULL REFERENCES engineering_design_freezes(id) ON DELETE CASCADE,
  object_key TEXT NOT NULL,
  revision TEXT NOT NULL,
  member_status TEXT NOT NULL,
  discipline TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (revision <> 'latest')
);

CREATE TABLE IF NOT EXISTS engineering_design_freeze_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  freeze_id UUID NOT NULL REFERENCES engineering_design_freezes(id) ON DELETE CASCADE,
  exception_key TEXT NOT NULL,
  discipline TEXT NOT NULL,
  object_key TEXT NOT NULL,
  rationale TEXT NOT NULL,
  condition_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_governed_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL,
  deliverable_key TEXT NOT NULL,
  discipline TEXT NOT NULL,
  deliverable_type TEXT NOT NULL,
  deliverable_number TEXT NOT NULL,
  title TEXT NOT NULL,
  revision TEXT NOT NULL,
  issue_purpose TEXT NOT NULL,
  review_status TEXT NOT NULL DEFAULT 'not_started',
  approval_status TEXT NOT NULL DEFAULT 'pending',
  release_status TEXT NOT NULL DEFAULT 'not_released',
  freshness TEXT NOT NULL DEFAULT 'current',
  checksum TEXT,
  current_revision BOOLEAN NOT NULL DEFAULT TRUE,
  released_by_ai BOOLEAN NOT NULL DEFAULT FALSE,
  provenance TEXT NOT NULL DEFAULT 'controlled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (revision <> 'latest'),
  CHECK (released_by_ai = FALSE)
);

CREATE TABLE IF NOT EXISTS engineering_governed_deliverable_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL,
  package_key TEXT NOT NULL,
  package_type TEXT NOT NULL,
  deliverable_keys TEXT[] NOT NULL DEFAULT '{}',
  required_keys TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_governed_transmittals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL,
  transmittal_key TEXT NOT NULL,
  package_key TEXT NOT NULL,
  issue_purpose TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_design_freeze_audit (
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

COMMENT ON TABLE engineering_design_freezes IS
  'EOS 2.13 freeze snapshot. engineering_configuration_baselines remains the EOS-A4 baseline. This table does not issue documents.';
COMMENT ON COLUMN engineering_design_freeze_members.revision IS
  'Exact revision. The value latest is rejected.';
COMMENT ON COLUMN engineering_governed_deliverables.released_by_ai IS
  'AI cannot authorize release or IFC.';

DROP TRIGGER IF EXISTS engineering_design_freezes_updated_at ON engineering_design_freezes;
CREATE TRIGGER engineering_design_freezes_updated_at
  BEFORE UPDATE ON engineering_design_freezes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DO $$
DECLARE
  target TEXT;
BEGIN
  FOREACH target IN ARRAY ARRAY[
    'engineering_design_freezes',
    'engineering_design_freeze_members',
    'engineering_design_freeze_exceptions',
    'engineering_governed_deliverables',
    'engineering_governed_deliverable_packages',
    'engineering_governed_transmittals',
    'engineering_design_freeze_audit'
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

ALTER TABLE engineering_design_freezes ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_design_freeze_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_design_freeze_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_governed_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_governed_deliverable_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_governed_transmittals ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_design_freeze_audit ENABLE ROW LEVEL SECURITY;
