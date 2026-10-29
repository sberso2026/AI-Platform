-- Phase 11H — Project Controls decision support persistence (batch_68)
--
-- Decision Support is ADVISORY. It records options and recommendations from
-- published composed contributors and forecast intelligence; it is not
-- auto-execution, not project/contract approval, and not schedule/cost/contract
-- instruction.
--
-- Reuses project_controls_project_snapshots + project_controls_project_timeline.
-- Additive only; batch_61–67 not rewritten.

CREATE TABLE IF NOT EXISTS project_controls_decision_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  scope_kind text NOT NULL
    CHECK (scope_kind IN ('project', 'phase', 'wbs_node', 'work_package', 'activity', 'milestone')),
  scope_reference_id uuid,
  decision_unit_id text NOT NULL,
  decision_unit_label text,
  version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'assessed'
    CHECK (status IN (
      'draft', 'assessed', 'pending_review', 'changes_requested', 'reviewed',
      'published', 'rejected', 'superseded'
    )),
  assessment_class text NOT NULL
    CHECK (assessment_class IN ('assessed', 'abstained')),
  dominant_decision_class text
    CHECK (dominant_decision_class IS NULL OR dominant_decision_class IN (
      'monitor', 'investigate', 'escalate', 'review', 'coordinate', 'defer', 'prioritise'
    )),
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
  control_context jsonb NOT NULL DEFAULT '{}'::jsonb,
  contributing_contributors jsonb NOT NULL DEFAULT '[]'::jsonb,
  assumptions jsonb NOT NULL DEFAULT '[]'::jsonb,
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
  composed_context_id text,
  forecast_context_id text,
  method text NOT NULL DEFAULT 'decision_support_advisory_v1'
    CHECK (method = 'decision_support_advisory_v1'),
  method_version text NOT NULL DEFAULT '1',
  assessed_at timestamptz NOT NULL DEFAULT now(),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  published_at timestamptz,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  supersedes_id uuid REFERENCES project_controls_decision_states(id) ON DELETE SET NULL,
  workflow_instance_id text,
  earned_value_computed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_dc_no_earned_value CHECK (earned_value_computed = false),
  critical_path_computed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_dc_no_cpm CHECK (critical_path_computed = false),
  float_computed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_dc_no_float CHECK (float_computed = false),
  auto_execution_enabled boolean NOT NULL DEFAULT false
    CONSTRAINT pc_dc_no_auto_execution CHECK (auto_execution_enabled = false),
  schedule_execution_performed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_dc_no_schedule_execution CHECK (schedule_execution_performed = false),
  cost_execution_performed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_dc_no_cost_execution CHECK (cost_execution_performed = false),
  contract_instruction_performed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_dc_no_contract_instruction CHECK (contract_instruction_performed = false),
  approval_authority_claimed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_dc_no_approval_authority CHECK (approval_authority_claimed = false),
  resource_planning_performed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_dc_no_resource_planning CHECK (resource_planning_performed = false),
  budget_ledger_mutated boolean NOT NULL DEFAULT false
    CONSTRAINT pc_dc_no_budget_ledger CHECK (budget_ledger_mutated = false),
  financial_posting_performed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_dc_no_financial_posting CHECK (financial_posting_performed = false),
  predictive_scheduling_performed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_dc_no_predictive_scheduling CHECK (predictive_scheduling_performed = false),
  mutates_upstream_contributors boolean NOT NULL DEFAULT false
    CONSTRAINT pc_dc_no_upstream_mutation CHECK (mutates_upstream_contributors = false),
  advisory_only boolean NOT NULL DEFAULT true
    CONSTRAINT pc_dc_advisory_only CHECK (advisory_only = true),
  mutates_project_identity boolean NOT NULL DEFAULT false
    CONSTRAINT pc_dc_no_identity_mutation CHECK (mutates_project_identity = false),
  UNIQUE (tenant_id, workspace_id, project_id, scope_kind, scope_reference_id, decision_unit_id, version)
);

CREATE INDEX IF NOT EXISTS idx_pc_decision_states_tenant_ws_project
  ON project_controls_decision_states(tenant_id, workspace_id, project_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS project_controls_decision_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  decision_state_id uuid NOT NULL REFERENCES project_controls_decision_states(id) ON DELETE CASCADE,
  evidence_kind text NOT NULL,
  source_type text NOT NULL,
  source_ref text NOT NULL,
  source_key text NOT NULL,
  source_version text,
  provenance text NOT NULL,
  review_status text NOT NULL,
  observed_at timestamptz,
  declared_signal text,
  contributor_key text,
  confidence numeric,
  weight numeric,
  narrative text,
  revoked boolean NOT NULL DEFAULT false,
  conflicts_with jsonb NOT NULL DEFAULT '[]'::jsonb,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  auto_execution_claimed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_dc_evidence_no_auto_execution CHECK (auto_execution_claimed = false),
  schedule_execution_claimed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_dc_evidence_no_schedule_execution CHECK (schedule_execution_claimed = false),
  cost_execution_claimed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_dc_evidence_no_cost_execution CHECK (cost_execution_claimed = false),
  contract_instruction_claimed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_dc_evidence_no_contract_instruction CHECK (contract_instruction_claimed = false),
  approval_authority_claimed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_dc_evidence_no_approval_authority CHECK (approval_authority_claimed = false),
  earned_value_derived boolean NOT NULL DEFAULT false
    CONSTRAINT pc_dc_evidence_not_from_ev CHECK (earned_value_derived = false),
  cpm_derived boolean NOT NULL DEFAULT false
    CONSTRAINT pc_dc_evidence_no_cpm CHECK (cpm_derived = false),
  financial_posting_claimed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_dc_evidence_no_financial_posting CHECK (financial_posting_claimed = false)
);

CREATE INDEX IF NOT EXISTS idx_pc_decision_evidence_state
  ON project_controls_decision_evidence(decision_state_id);

CREATE TABLE IF NOT EXISTS project_controls_decision_confidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  decision_state_id uuid NOT NULL REFERENCES project_controls_decision_states(id) ON DELETE CASCADE,
  confidence_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_controls_decision_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  decision_state_id uuid NOT NULL REFERENCES project_controls_decision_states(id) ON DELETE CASCADE,
  workflow_instance_id text NOT NULL,
  workflow_state text NOT NULL,
  outcome text,
  reviewer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  self_approved boolean NOT NULL DEFAULT false
    CONSTRAINT pc_dc_review_no_self_approval CHECK (self_approved = false),
  approval_authority_claimed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_dc_review_no_approval_authority CHECK (approval_authority_claimed = false)
);

ALTER TABLE project_controls_project_snapshots
  ADD COLUMN IF NOT EXISTS decision_state_ids jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE project_controls_project_profiles
  ADD COLUMN IF NOT EXISTS decision_summary jsonb;

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
    'engineering.project.productivity.published',
    'engineering.project.forecast.updated',
    'engineering.project.forecast.reviewed',
    'engineering.project.forecast.published',
    'engineering.project.decision.updated',
    'engineering.project.decision.reviewed',
    'engineering.project.decision.published'
  ));

ALTER TABLE project_controls_decision_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_controls_decision_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_controls_decision_confidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_controls_decision_reviews ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'project_controls_decision_states',
    'project_controls_decision_evidence',
    'project_controls_decision_confidence',
    'project_controls_decision_reviews'
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

COMMENT ON TABLE project_controls_decision_states IS
  'Project Controls advisory decision support from composed contributors. Not auto-execution or contract approval.';
COMMENT ON TABLE project_controls_decision_evidence IS
  'Evidence supporting a decision support assessment; composed contributor references only.';
COMMENT ON TABLE project_controls_decision_confidence IS
  'Confidence in the composed contributor basis for a decision support assessment.';
COMMENT ON TABLE project_controls_decision_reviews IS
  'Human review of a decision support assessment. self_approved must remain false.';
