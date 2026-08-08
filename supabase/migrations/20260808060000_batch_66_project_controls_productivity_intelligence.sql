-- Phase 11F — Project Controls productivity intelligence persistence (batch_66)
--
-- Productivity Intelligence is ADVISORY. It records what evidence supports about
-- execution efficiency posture; it is not workforce management, not payroll,
-- not timesheets and not labour productivity %. Boolean locks are CHECK-constrained.
--
-- Reuses project_controls_project_snapshots + project_controls_project_timeline.
-- Additive only; batch_61–65 not rewritten.

CREATE TABLE IF NOT EXISTS project_controls_productivity_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  scope_kind text NOT NULL
    CHECK (scope_kind IN ('project', 'phase', 'wbs_node', 'work_package', 'activity', 'milestone')),
  scope_reference_id uuid,
  control_unit_id text NOT NULL,
  control_unit_label text,
  version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'assessed'
    CHECK (status IN (
      'draft', 'assessed', 'pending_review', 'changes_requested', 'reviewed',
      'published', 'rejected', 'superseded'
    )),
  assessment_class text NOT NULL
    CHECK (assessment_class IN ('assessed', 'abstained')),
  productivity_posture text NOT NULL DEFAULT 'unknown'
    CHECK (productivity_posture IN (
      'improving', 'stable', 'declining', 'constrained', 'recovering', 'unknown'
    )),
  control_context jsonb NOT NULL DEFAULT '{}'::jsonb,
  factors jsonb NOT NULL DEFAULT '[]'::jsonb,
  confidence_class text NOT NULL
    CHECK (confidence_class IN ('high', 'medium', 'low', 'unavailable')),
  confidence_score numeric,
  data_sufficiency text NOT NULL
    CHECK (data_sufficiency IN ('sufficient', 'limited', 'insufficient', 'conflicting', 'stale')),
  confidence_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  abstained boolean NOT NULL DEFAULT false,
  abstention_reason text,
  narrative text,
  method text NOT NULL DEFAULT 'productivity_intelligence_advisory_v1'
    CHECK (method = 'productivity_intelligence_advisory_v1'),
  method_version text NOT NULL DEFAULT '1',
  assessed_at timestamptz NOT NULL DEFAULT now(),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  published_at timestamptz,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  supersedes_id uuid REFERENCES project_controls_productivity_states(id) ON DELETE SET NULL,
  workflow_instance_id text,
  earned_value_computed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_prod_no_earned_value CHECK (earned_value_computed = false),
  critical_path_computed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_prod_no_cpm CHECK (critical_path_computed = false),
  float_computed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_prod_no_float CHECK (float_computed = false),
  workforce_management_performed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_prod_no_workforce_mgmt CHECK (workforce_management_performed = false),
  timesheet_processed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_prod_no_timesheet CHECK (timesheet_processed = false),
  payroll_processed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_prod_no_payroll CHECK (payroll_processed = false),
  resource_planning_performed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_prod_no_resource_planning CHECK (resource_planning_performed = false),
  labour_cost_computed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_prod_no_labour_cost CHECK (labour_cost_computed = false),
  labour_productivity_percent_computed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_prod_no_labour_pct CHECK (labour_productivity_percent_computed = false),
  forecast_produced boolean NOT NULL DEFAULT false
    CONSTRAINT pc_prod_no_forecasting CHECK (forecast_produced = false),
  financial_posting_performed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_prod_no_financial_posting CHECK (financial_posting_performed = false),
  change_executed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_prod_no_change_execution CHECK (change_executed = false),
  schedule_executed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_prod_no_schedule_execution CHECK (schedule_executed = false),
  advisory_only boolean NOT NULL DEFAULT true
    CONSTRAINT pc_prod_advisory_only CHECK (advisory_only = true),
  mutates_project_identity boolean NOT NULL DEFAULT false
    CONSTRAINT pc_prod_no_identity_mutation CHECK (mutates_project_identity = false),
  CONSTRAINT pc_prod_abstention_has_unknown_posture
    CHECK (abstained = false OR productivity_posture = 'unknown'),
  UNIQUE (tenant_id, workspace_id, project_id, scope_kind, scope_reference_id, control_unit_id, version)
);

CREATE INDEX IF NOT EXISTS idx_pc_productivity_states_tenant_ws_project
  ON project_controls_productivity_states(tenant_id, workspace_id, project_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS project_controls_productivity_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  productivity_state_id uuid NOT NULL REFERENCES project_controls_productivity_states(id) ON DELETE CASCADE,
  evidence_kind text NOT NULL,
  source_type text NOT NULL,
  source_ref text NOT NULL,
  source_key text NOT NULL,
  source_version text,
  provenance text NOT NULL,
  review_status text NOT NULL,
  observed_at timestamptz,
  declared_trend text,
  confidence numeric,
  weight numeric,
  narrative text,
  revoked boolean NOT NULL DEFAULT false,
  conflicts_with jsonb NOT NULL DEFAULT '[]'::jsonb,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  derived_from_timesheet boolean NOT NULL DEFAULT false
    CONSTRAINT pc_prod_evidence_not_from_timesheet CHECK (derived_from_timesheet = false),
  derived_from_payroll boolean NOT NULL DEFAULT false
    CONSTRAINT pc_prod_evidence_not_from_payroll CHECK (derived_from_payroll = false),
  labour_productivity_percent_claimed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_prod_evidence_no_labour_pct CHECK (labour_productivity_percent_claimed = false),
  resource_planning_claimed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_prod_evidence_no_resource_planning CHECK (resource_planning_claimed = false),
  forecast_derived boolean NOT NULL DEFAULT false
    CONSTRAINT pc_prod_evidence_no_forecast CHECK (forecast_derived = false),
  earned_value_derived boolean NOT NULL DEFAULT false
    CONSTRAINT pc_prod_evidence_not_from_ev CHECK (earned_value_derived = false)
);

CREATE INDEX IF NOT EXISTS idx_pc_productivity_evidence_state
  ON project_controls_productivity_evidence(productivity_state_id);

CREATE TABLE IF NOT EXISTS project_controls_productivity_confidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  productivity_state_id uuid NOT NULL REFERENCES project_controls_productivity_states(id) ON DELETE CASCADE,
  confidence_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_controls_productivity_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  productivity_state_id uuid NOT NULL REFERENCES project_controls_productivity_states(id) ON DELETE CASCADE,
  workflow_instance_id text NOT NULL,
  workflow_state text NOT NULL,
  outcome text,
  reviewer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  self_approved boolean NOT NULL DEFAULT false
    CONSTRAINT pc_prod_review_no_self_approval CHECK (self_approved = false),
  workforce_management_claimed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_prod_review_no_workforce_mgmt CHECK (workforce_management_claimed = false)
);

ALTER TABLE project_controls_project_snapshots
  ADD COLUMN IF NOT EXISTS productivity_state_ids jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE project_controls_project_profiles
  ADD COLUMN IF NOT EXISTS productivity_summary jsonb;

ALTER TABLE project_controls_outbox_events
  DROP CONSTRAINT IF EXISTS project_controls_outbox_events_event_type_check;

ALTER TABLE project_controls_outbox_events
  ADD CONSTRAINT project_controls_outbox_events_event_type_check
  CHECK (event_type IN (
    'engineering.project.progress.updated',
    'engineering.project.progress.reviewed',
    'engineering.project.progress.published',
    'engineering.project.schedule.updated',
    'engineering.project.schedule.reviewed',
    'engineering.project.schedule.published',
    'engineering.project.profile.updated',
    'engineering.project.change.assessed',
    'engineering.project.change.reviewed',
    'engineering.project.change.published',
    'engineering.project.change.superseded',
    'engineering.project.change_candidate.created',
    'engineering.project.snapshot.created',
    'engineering.project.cost.assessed',
    'engineering.project.cost.reviewed',
    'engineering.project.cost.published',
    'engineering.project.cost.superseded',
    'engineering.project.cost.variance_attributed',
    'engineering.project.productivity.updated',
    'engineering.project.productivity.reviewed',
    'engineering.project.productivity.published'
  ));

ALTER TABLE project_controls_productivity_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_controls_productivity_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_controls_productivity_confidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_controls_productivity_reviews ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'project_controls_productivity_states',
    'project_controls_productivity_evidence',
    'project_controls_productivity_confidence',
    'project_controls_productivity_reviews'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_select', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR SELECT USING (
         tenant_id = ANY(get_user_tenant_ids())
         AND workspace_id IN (
           SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
         )
       )',
      t || '_select', t
    );
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_insert', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR INSERT WITH CHECK (
         tenant_id = ANY(get_user_tenant_ids())
         AND workspace_id IN (
           SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
         )
       )',
      t || '_insert', t
    );
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_update', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR UPDATE USING (
         tenant_id = ANY(get_user_tenant_ids())
         AND workspace_id IN (
           SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
         )
       ) WITH CHECK (
         tenant_id = ANY(get_user_tenant_ids())
         AND workspace_id IN (
           SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
         )
       )',
      t || '_update', t
    );
    EXECUTE format('GRANT ALL ON %I TO anon, authenticated, service_role', t);
  END LOOP;
END $$;

COMMENT ON TABLE project_controls_productivity_states IS
  'Project Controls advisory productivity intelligence. Not workforce management, payroll or labour %.';
COMMENT ON TABLE project_controls_productivity_evidence IS
  'Evidence supporting a productivity assessment; references only.';
COMMENT ON TABLE project_controls_productivity_confidence IS
  'Confidence in the evidence basis for a productivity assessment.';
COMMENT ON TABLE project_controls_productivity_reviews IS
  'Human review of a productivity assessment. self_approved must remain false.';
