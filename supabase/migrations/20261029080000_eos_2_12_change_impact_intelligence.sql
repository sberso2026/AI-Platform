-- EOS 2.12 engineering change impact intelligence.
-- Additive assessment records. Does not alter engineering_changes, engineering_impacts, or engineering_impact_assessments.
-- These rows are candidate-impact assessments. They are not a second change identity.
-- Discovery does not confirm materiality, recalculate results, revise deliverables, or rewrite a baseline.

CREATE TABLE IF NOT EXISTS engineering_change_impact_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL,
  case_key TEXT NOT NULL,
  title TEXT NOT NULL,
  initiating_discipline TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'OTHER',
  changed_field TEXT NOT NULL,
  previous_value TEXT,
  new_value TEXT,
  unit TEXT,
  previous_revision TEXT,
  new_revision TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  criticality TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (criticality IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  materiality_class TEXT NOT NULL DEFAULT 'unknown',
  baseline_key TEXT,
  baseline_disposition TEXT,
  canonical_change_id UUID,
  recalculated BOOLEAN NOT NULL DEFAULT FALSE,
  deliverable_revised BOOLEAN NOT NULL DEFAULT FALSE,
  baseline_rewritten BOOLEAN NOT NULL DEFAULT FALSE,
  provenance TEXT NOT NULL DEFAULT 'controlled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (recalculated = FALSE),
  CHECK (deliverable_revised = FALSE),
  CHECK (baseline_rewritten = FALSE)
);

CREATE TABLE IF NOT EXISTS engineering_change_candidate_impacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES engineering_change_impact_cases(id) ON DELETE CASCADE,
  object_key TEXT NOT NULL,
  object_type TEXT NOT NULL,
  discipline TEXT NOT NULL,
  depth INTEGER NOT NULL DEFAULT 1,
  direct_impact BOOLEAN NOT NULL DEFAULT FALSE,
  path_text TEXT NOT NULL,
  materiality TEXT NOT NULL DEFAULT 'UNASSESSED',
  confidence TEXT NOT NULL DEFAULT 'CONFIRMED_DEPENDENCY',
  required_action TEXT,
  action_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  freshness TEXT NOT NULL DEFAULT 'potentially_stale',
  previous_result TEXT,
  recalculated BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (recalculated = FALSE)
);

CREATE TABLE IF NOT EXISTS engineering_change_impact_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES engineering_change_impact_cases(id) ON DELETE CASCADE,
  action_key TEXT NOT NULL,
  action_type TEXT NOT NULL,
  confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  executed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (executed = FALSE)
);

CREATE TABLE IF NOT EXISTS engineering_change_impact_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL,
  case_key TEXT,
  event_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engineering_change_impact_audit (
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

COMMENT ON TABLE engineering_change_impact_cases IS
  'EOS 2.12 change-impact assessment. engineering_changes remains the EOS-A4 change. This table does not recalculate engineering results.';
COMMENT ON COLUMN engineering_change_impact_cases.canonical_change_id IS
  'Optional reference to an existing engineering_changes row. Null when the assessment is not linked.';
COMMENT ON COLUMN engineering_change_candidate_impacts.materiality IS
  'UNASSESSED until a human in the affected discipline records materiality. Discovery does not confirm impact.';

DROP TRIGGER IF EXISTS engineering_change_impact_cases_updated_at ON engineering_change_impact_cases;
CREATE TRIGGER engineering_change_impact_cases_updated_at
  BEFORE UPDATE ON engineering_change_impact_cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DO $$
DECLARE
  target TEXT;
BEGIN
  FOREACH target IN ARRAY ARRAY[
    'engineering_change_impact_cases',
    'engineering_change_candidate_impacts',
    'engineering_change_impact_actions',
    'engineering_change_impact_events',
    'engineering_change_impact_audit'
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

ALTER TABLE engineering_change_impact_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_change_candidate_impacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_change_impact_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_change_impact_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_change_impact_audit ENABLE ROW LEVEL SECURITY;
