-- Phase 11D — Project Controls change intelligence persistence (batch_64)
--
-- Change Intelligence is ADVISORY. It records what evidence supports about a
-- change; it is not contractual change authority and it never approves, prices
-- or executes a change. Boolean locks below are CHECK-constrained so a bad
-- write fails at the database rather than in review:
--   no earned value, no CPM/float, no financial posting, no budget mutation,
--   no contractual approval claimed, no core risk mutation, advisory_only=true.
--
-- Also introduces the shared, project-level snapshot and append-only timeline.
-- These coexist with the progress-scoped and schedule-scoped equivalents.
--
-- Additive only; batch_61/62/63 are not rewritten.

-- ---------------------------------------------------------------------------
-- Change candidates — a candidate is NOT an approved change
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_controls_change_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  scope_kind text NOT NULL
    CHECK (scope_kind IN ('project', 'phase', 'wbs_node', 'work_package', 'activity', 'milestone')),
  scope_reference_id uuid,
  change_class text NOT NULL
    CHECK (change_class IN (
      'scope', 'design', 'schedule', 'cost', 'technical', 'contractual', 'regulatory',
      'procurement', 'construction', 'quality', 'safety', 'asset_interface', 'other'
    )),
  status text NOT NULL DEFAULT 'candidate'
    CHECK (status IN ('candidate', 'assessed', 'withdrawn', 'superseded')),
  signal_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  title text,
  narrative text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  supersedes_id uuid REFERENCES project_controls_change_candidates(id) ON DELETE SET NULL,
  is_approved_change boolean NOT NULL DEFAULT false
    CONSTRAINT pc_change_candidate_is_not_approved CHECK (is_approved_change = false),
  contractual_approval_claimed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_change_candidate_no_contractual_approval CHECK (contractual_approval_claimed = false),
  mutates_budget boolean NOT NULL DEFAULT false
    CONSTRAINT pc_change_candidate_no_budget_mutation CHECK (mutates_budget = false),
  derived_from_earned_value boolean NOT NULL DEFAULT false
    CONSTRAINT pc_change_candidate_not_from_ev CHECK (derived_from_earned_value = false)
);

CREATE INDEX IF NOT EXISTS idx_pc_change_candidates_project
  ON project_controls_change_candidates(tenant_id, workspace_id, project_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- Change states — the advisory assessment, versioned per scope + change class
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_controls_change_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  scope_kind text NOT NULL
    CHECK (scope_kind IN ('project', 'phase', 'wbs_node', 'work_package', 'activity', 'milestone')),
  scope_reference_id uuid,
  version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'assessed'
    CHECK (status IN (
      'draft', 'assessed', 'pending_review', 'changes_requested', 'reviewed',
      'published', 'rejected', 'superseded'
    )),
  assessment_class text NOT NULL
    CHECK (assessment_class IN ('assessed', 'abstained')),
  change_class text NOT NULL
    CHECK (change_class IN (
      'scope', 'design', 'schedule', 'cost', 'technical', 'contractual', 'regulatory',
      'procurement', 'construction', 'quality', 'safety', 'asset_interface', 'other'
    )),
  change_status_context text NOT NULL DEFAULT 'unknown'
    CHECK (change_status_context IN ('pending', 'approved_context', 'rejected_context', 'unknown')),
  authoritative_change_ref jsonb,
  candidate_id uuid REFERENCES project_controls_change_candidates(id) ON DELETE SET NULL,
  impact_contexts jsonb NOT NULL DEFAULT '{}'::jsonb,
  confidence_class text NOT NULL
    CHECK (confidence_class IN ('high', 'medium', 'low', 'unavailable')),
  confidence_score numeric,
  data_sufficiency text NOT NULL
    CHECK (data_sufficiency IN ('sufficient', 'limited', 'insufficient', 'conflicting', 'stale', 'revoked')),
  confidence_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  abstained boolean NOT NULL DEFAULT false,
  abstention_reason text,
  narrative text,
  method text NOT NULL DEFAULT 'change_intelligence_advisory_v1'
    CHECK (method = 'change_intelligence_advisory_v1'),
  method_version text NOT NULL DEFAULT '1',
  assessed_at timestamptz NOT NULL DEFAULT now(),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  published_at timestamptz,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  supersedes_id uuid REFERENCES project_controls_change_states(id) ON DELETE SET NULL,
  workflow_instance_id text,
  earned_value_computed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_change_no_earned_value CHECK (earned_value_computed = false),
  critical_path_computed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_change_no_cpm CHECK (critical_path_computed = false),
  float_computed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_change_no_float CHECK (float_computed = false),
  cost_integrated boolean NOT NULL DEFAULT false
    CONSTRAINT pc_change_no_cost_engine CHECK (cost_integrated = false),
  budget_mutated boolean NOT NULL DEFAULT false
    CONSTRAINT pc_change_no_budget_mutation CHECK (budget_mutated = false),
  financial_posting_performed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_change_no_financial_posting CHECK (financial_posting_performed = false),
  forecast_produced boolean NOT NULL DEFAULT false
    CONSTRAINT pc_change_no_forecasting CHECK (forecast_produced = false),
  contingency_drawn boolean NOT NULL DEFAULT false
    CONSTRAINT pc_change_no_contingency_drawdown CHECK (contingency_drawn = false),
  change_executed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_change_no_change_execution CHECK (change_executed = false),
  contractual_approval_claimed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_change_no_contractual_approval CHECK (contractual_approval_claimed = false),
  contractual_authority_claimed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_change_no_contractual_authority CHECK (contractual_authority_claimed = false),
  core_risk_mutated boolean NOT NULL DEFAULT false
    CONSTRAINT pc_change_no_core_risk_mutation CHECK (core_risk_mutated = false),
  advisory_only boolean NOT NULL DEFAULT true
    CONSTRAINT pc_change_advisory_only CHECK (advisory_only = true),
  mutates_project_identity boolean NOT NULL DEFAULT false
    CONSTRAINT pc_change_no_identity_mutation CHECK (mutates_project_identity = false),
  CONSTRAINT pc_change_abstention_has_no_status_context
    CHECK (abstained = false OR change_status_context = 'unknown'),
  UNIQUE (tenant_id, workspace_id, project_id, scope_kind, scope_reference_id, change_class, version)
);

CREATE INDEX IF NOT EXISTS idx_pc_change_states_tenant_ws_project
  ON project_controls_change_states(tenant_id, workspace_id, project_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_pc_change_states_thread_latest
  ON project_controls_change_states(project_id, scope_kind, scope_reference_id, change_class, version DESC);
CREATE INDEX IF NOT EXISTS idx_pc_change_states_published
  ON project_controls_change_states(tenant_id, workspace_id, project_id)
  WHERE status = 'published';

-- ---------------------------------------------------------------------------
-- Change evidence — references only, never a copy of the source payload
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_controls_change_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  change_state_id uuid NOT NULL
    REFERENCES project_controls_change_states(id) ON DELETE CASCADE,
  scope_kind text NOT NULL
    CHECK (scope_kind IN ('project', 'phase', 'wbs_node', 'work_package', 'activity', 'milestone')),
  scope_reference_id uuid,
  evidence_kind text NOT NULL
    CHECK (evidence_kind IN (
      'document_reference', 'meeting_statement', 'instruction_reference',
      'design_revision_reference', 'inspection_result', 'progress_assessment_ref',
      'schedule_assessment_ref', 'correspondence_reference',
      'manual_engineering_attestation', 'external_register_reference'
    )),
  source_type text NOT NULL
    CHECK (source_type IN (
      'manual_engineering_assessment', 'project_intelligence', 'inspection_intelligence',
      'progress_intelligence', 'schedule_intelligence', 'approved_document',
      'approved_meeting', 'external_change_register'
    )),
  source_ref text NOT NULL,
  source_key text NOT NULL,
  source_version text,
  provenance text NOT NULL DEFAULT 'unknown'
    CHECK (provenance IN (
      'primary_source', 'system_reference', 'human_attestation', 'derived_reference', 'unknown'
    )),
  review_status text NOT NULL DEFAULT 'unreviewed'
    CHECK (review_status IN (
      'unreviewed', 'pending_review', 'reviewed', 'approved', 'published', 'revoked'
    )),
  observed_at timestamptz,
  confidence numeric CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  weight numeric CHECK (weight IS NULL OR (weight >= 0 AND weight <= 1)),
  declared_change_class text,
  declared_status_context text
    CHECK (declared_status_context IS NULL OR declared_status_context IN (
      'pending', 'approved_context', 'rejected_context', 'unknown'
    )),
  narrative text,
  revoked boolean NOT NULL DEFAULT false,
  conflicts_with jsonb NOT NULL DEFAULT '[]'::jsonb,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  derived_from_earned_value boolean NOT NULL DEFAULT false
    CONSTRAINT pc_change_evidence_not_from_ev CHECK (derived_from_earned_value = false),
  mutates_core_risk boolean NOT NULL DEFAULT false
    CONSTRAINT pc_change_evidence_no_core_risk_mutation CHECK (mutates_core_risk = false),
  mutates_budget boolean NOT NULL DEFAULT false
    CONSTRAINT pc_change_evidence_no_budget_mutation CHECK (mutates_budget = false),
  contractual_approval_claimed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_change_evidence_no_contractual_approval CHECK (contractual_approval_claimed = false)
);

CREATE INDEX IF NOT EXISTS idx_pc_change_evidence_state
  ON project_controls_change_evidence(tenant_id, workspace_id, change_state_id);
CREATE INDEX IF NOT EXISTS idx_pc_change_evidence_project
  ON project_controls_change_evidence(tenant_id, workspace_id, project_id, recorded_at DESC);

-- ---------------------------------------------------------------------------
-- Change confidence
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_controls_change_confidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  change_state_id uuid NOT NULL
    REFERENCES project_controls_change_states(id) ON DELETE CASCADE,
  scope_kind text NOT NULL,
  scope_reference_id uuid,
  score numeric NOT NULL,
  confidence_class text NOT NULL
    CHECK (confidence_class IN ('high', 'medium', 'low', 'unavailable')),
  data_sufficiency text NOT NULL
    CHECK (data_sufficiency IN ('sufficient', 'limited', 'insufficient', 'conflicting', 'stale', 'revoked')),
  evidence_count integer NOT NULL DEFAULT 0,
  usable_evidence_count integer NOT NULL DEFAULT 0,
  source_diversity numeric NOT NULL DEFAULT 0,
  freshness numeric NOT NULL DEFAULT 0,
  review_completeness numeric NOT NULL DEFAULT 0,
  provenance_quality numeric NOT NULL DEFAULT 0,
  agreement numeric NOT NULL DEFAULT 0,
  conflict_state text NOT NULL DEFAULT 'none'
    CHECK (conflict_state IN ('none', 'detected')),
  abstention boolean NOT NULL DEFAULT false,
  abstention_reason text,
  reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
  method text NOT NULL DEFAULT 'change_confidence_v1'
    CHECK (method = 'change_confidence_v1'),
  method_version text NOT NULL DEFAULT '1',
  assessed_at timestamptz NOT NULL DEFAULT now(),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  engineering_correctness_claimed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_change_confidence_no_correctness_claim CHECK (engineering_correctness_claimed = false),
  contractual_certainty_claimed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_change_confidence_no_contractual_certainty CHECK (contractual_certainty_claimed = false)
);

CREATE INDEX IF NOT EXISTS idx_pc_change_confidence_state
  ON project_controls_change_confidence(tenant_id, workspace_id, change_state_id);

-- ---------------------------------------------------------------------------
-- Change reviews — approving an assessment is not approving a change
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_controls_change_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  change_state_id uuid NOT NULL
    REFERENCES project_controls_change_states(id) ON DELETE CASCADE,
  workflow_instance_id text NOT NULL,
  workflow_state text NOT NULL
    CHECK (workflow_state IN (
      'draft', 'pending_review', 'changes_requested', 'approved', 'rejected', 'published'
    )),
  outcome text
    CHECK (outcome IS NULL OR outcome IN ('approved', 'rejected', 'changes_requested', 'resubmitted')),
  reviewer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  self_approved boolean NOT NULL DEFAULT false
    CONSTRAINT pc_change_review_no_self_approval CHECK (self_approved = false),
  contractual_approval_claimed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_change_review_no_contractual_approval CHECK (contractual_approval_claimed = false)
);

CREATE INDEX IF NOT EXISTS idx_pc_change_reviews_state
  ON project_controls_change_reviews(tenant_id, workspace_id, change_state_id);

-- ---------------------------------------------------------------------------
-- Shared project snapshots — identifiers only, immutable
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_controls_project_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  schema_version text NOT NULL DEFAULT 'project_controls_project_snapshot/1'
    CHECK (schema_version = 'project_controls_project_snapshot/1'),
  captured_at timestamptz NOT NULL DEFAULT now(),
  profile_id uuid REFERENCES project_controls_project_profiles(id) ON DELETE SET NULL,
  progress_state_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  schedule_state_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  change_state_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  immutable boolean NOT NULL DEFAULT true
    CONSTRAINT pc_project_snapshot_immutable CHECK (immutable = true),
  contains_evidence_payloads boolean NOT NULL DEFAULT false
    CONSTRAINT pc_project_snapshot_no_evidence_payloads CHECK (contains_evidence_payloads = false),
  is_project_registry boolean NOT NULL DEFAULT false
    CONSTRAINT pc_project_snapshot_not_project_registry CHECK (is_project_registry = false),
  mutates_project_identity boolean NOT NULL DEFAULT false
    CONSTRAINT pc_project_snapshot_no_identity_mutation CHECK (mutates_project_identity = false),
  earned_value_computed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_project_snapshot_no_earned_value CHECK (earned_value_computed = false),
  financial_posting_performed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_project_snapshot_no_financial_posting CHECK (financial_posting_performed = false),
  contractual_approval_claimed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_project_snapshot_no_contractual_approval CHECK (contractual_approval_claimed = false)
);

CREATE INDEX IF NOT EXISTS idx_pc_project_snapshots_project
  ON project_controls_project_snapshots(tenant_id, workspace_id, project_id, captured_at DESC);

-- ---------------------------------------------------------------------------
-- Shared project timeline — append-only, project level
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_controls_project_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  entry_id text NOT NULL,
  state_id text,
  kind text NOT NULL
    CHECK (kind IN (
      'change_candidate_created', 'change_assessed', 'change_abstained', 'change_reviewed',
      'change_published', 'change_rejected', 'change_superseded',
      'project_profile_composed', 'project_snapshot_created'
    )),
  event_type text NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  source_key text NOT NULL,
  actor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  detail text,
  governance jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, entry_id)
);

CREATE INDEX IF NOT EXISTS idx_pc_project_timeline_project
  ON project_controls_project_timeline(tenant_id, workspace_id, project_id, recorded_at ASC);

-- ---------------------------------------------------------------------------
-- Extend project profiles with the change summary
-- ---------------------------------------------------------------------------
ALTER TABLE project_controls_project_profiles
  ADD COLUMN IF NOT EXISTS change_summary jsonb NOT NULL DEFAULT '{}'::jsonb;

-- ---------------------------------------------------------------------------
-- Extend outbox event types for change and snapshot events
-- ---------------------------------------------------------------------------
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
    'engineering.project.snapshot.created'
  ));

-- ---------------------------------------------------------------------------
-- RLS — tenant + workspace isolation (mirrors batch_62/63)
-- ---------------------------------------------------------------------------
ALTER TABLE project_controls_change_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_controls_change_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_controls_change_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_controls_change_confidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_controls_change_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_controls_project_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_controls_project_timeline ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'project_controls_change_candidates',
    'project_controls_change_states',
    'project_controls_change_evidence',
    'project_controls_change_confidence',
    'project_controls_change_reviews',
    'project_controls_project_snapshots',
    'project_controls_project_timeline'
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

COMMENT ON TABLE project_controls_change_candidates IS
  'Grouped change signals worth assessing. is_approved_change must remain false: a candidate is never an approved change.';
COMMENT ON TABLE project_controls_change_states IS
  'Project Controls advisory change intelligence. Not contractual change authority, no cost quantum, no earned value, no CPM.';
COMMENT ON TABLE project_controls_change_evidence IS
  'Evidence supporting a change assessment; references only. May never derive from earned value, mutate core risk or budget, or claim contractual approval.';
COMMENT ON TABLE project_controls_change_confidence IS
  'Confidence in the evidence basis for a change assessment. Never claims engineering correctness or contractual certainty.';
COMMENT ON TABLE project_controls_change_reviews IS
  'Human review of a change assessment. self_approved and contractual_approval_claimed must remain false.';
COMMENT ON TABLE project_controls_project_snapshots IS
  'Immutable project-level reference sets holding state identifiers only. No evidence payloads.';
COMMENT ON TABLE project_controls_project_timeline IS
  'Append-only project-level timeline. Coexists with progress and schedule timelines.';
