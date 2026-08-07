-- Phase 11C — Project Controls schedule intelligence persistence (batch_63)
--
-- Schedule Intelligence is ADVISORY. It describes declared milestone posture from
-- evidence — not CPM, not float, not schedule execution. Boolean locks below are
-- CHECK-constrained to false.
--
-- Additive only; extends batch_62 outbox event types and project profile schema.

-- ---------------------------------------------------------------------------
-- Schedule assessments
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_controls_schedule_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  scope_kind text NOT NULL
    CHECK (scope_kind IN ('project', 'phase', 'wbs_node', 'work_package', 'activity', 'milestone')),
  scope_reference_id uuid,
  version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'assessed'
    CHECK (status IN ('draft', 'assessed', 'pending_review', 'changes_requested', 'reviewed', 'published', 'rejected')),
  assessment_class text NOT NULL
    CHECK (assessment_class IN ('assessed', 'abstained')),
  milestone_posture text
    CHECK (milestone_posture IS NULL OR milestone_posture IN ('on_track', 'at_risk', 'missed', 'unknown')),
  declared_baseline_date timestamptz,
  declared_current_date timestamptz,
  declared_date_delta_days integer,
  confidence_class text NOT NULL
    CHECK (confidence_class IN ('high', 'medium', 'low', 'unavailable')),
  confidence_score numeric,
  data_sufficiency text NOT NULL
    CHECK (data_sufficiency IN ('sufficient', 'limited', 'insufficient', 'conflicting', 'stale')),
  confidence_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
  abstained boolean NOT NULL DEFAULT false,
  abstention_reason text,
  narrative text,
  method text NOT NULL DEFAULT 'schedule_intelligence_advisory_v1'
    CHECK (method = 'schedule_intelligence_advisory_v1'),
  method_version text NOT NULL DEFAULT '1',
  assessed_at timestamptz NOT NULL DEFAULT now(),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  published_at timestamptz,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  supersedes_id uuid REFERENCES project_controls_schedule_assessments(id) ON DELETE SET NULL,
  workflow_instance_id text,
  earned_value_computed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_schedule_no_earned_value CHECK (earned_value_computed = false),
  critical_path_computed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_schedule_no_cpm CHECK (critical_path_computed = false),
  float_computed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_schedule_no_float CHECK (float_computed = false),
  forward_backward_pass_computed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_schedule_no_fb_pass CHECK (forward_backward_pass_computed = false),
  cost_integrated boolean NOT NULL DEFAULT false
    CONSTRAINT pc_schedule_no_cost_engine CHECK (cost_integrated = false),
  forecast_produced boolean NOT NULL DEFAULT false
    CONSTRAINT pc_schedule_no_forecasting CHECK (forecast_produced = false),
  schedule_executed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_schedule_no_schedule_execution CHECK (schedule_executed = false),
  resource_levelled boolean NOT NULL DEFAULT false
    CONSTRAINT pc_schedule_no_resource_leveling CHECK (resource_levelled = false),
  advisory_only boolean NOT NULL DEFAULT true
    CONSTRAINT pc_schedule_advisory_only CHECK (advisory_only = true),
  mutates_project_identity boolean NOT NULL DEFAULT false
    CONSTRAINT pc_schedule_no_identity_mutation CHECK (mutates_project_identity = false),
  mutates_activity_identity boolean NOT NULL DEFAULT false
    CONSTRAINT pc_schedule_no_activity_mutation CHECK (mutates_activity_identity = false),
  CONSTRAINT pc_schedule_abstention_has_no_posture
    CHECK (abstained = false OR milestone_posture IS NULL),
  UNIQUE (tenant_id, workspace_id, project_id, scope_kind, scope_reference_id, version)
);

CREATE INDEX IF NOT EXISTS idx_pc_schedule_tenant_ws_project
  ON project_controls_schedule_assessments(tenant_id, workspace_id, project_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_pc_schedule_scope_latest
  ON project_controls_schedule_assessments(project_id, scope_kind, scope_reference_id, version DESC);
CREATE INDEX IF NOT EXISTS idx_pc_schedule_published
  ON project_controls_schedule_assessments(tenant_id, workspace_id, project_id)
  WHERE status = 'published';

-- ---------------------------------------------------------------------------
-- Schedule evidence
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_controls_schedule_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  assessment_id uuid NOT NULL
    REFERENCES project_controls_schedule_assessments(id) ON DELETE CASCADE,
  scope_kind text NOT NULL
    CHECK (scope_kind IN ('project', 'phase', 'wbs_node', 'work_package', 'activity', 'milestone')),
  scope_reference_id uuid,
  evidence_kind text NOT NULL
    CHECK (evidence_kind IN (
      'baseline_declaration', 'milestone_declaration', 'meeting_statement', 'document_status',
      'inspection_result', 'progress_assessment_ref', 'manual_engineering_update',
      'planning_system_import', 'photo_record', 'finding_record'
    )),
  source_type text NOT NULL
    CHECK (source_type IN (
      'manual_engineering_assessment', 'inspection_intelligence', 'project_intelligence',
      'progress_intelligence', 'approved_document', 'approved_meeting', 'external_planning_import'
    )),
  source_key text NOT NULL,
  source_reference text,
  observed_at timestamptz,
  narrative text,
  declared_baseline_date timestamptz,
  declared_current_date timestamptz,
  declared_posture text
    CHECK (declared_posture IS NULL OR declared_posture IN ('on_track', 'at_risk', 'missed', 'unknown')),
  weight numeric CHECK (weight IS NULL OR (weight >= 0 AND weight <= 1)),
  review_status text NOT NULL DEFAULT 'unreviewed'
    CHECK (review_status IN ('unreviewed', 'pending_review', 'reviewed', 'approved', 'published')),
  revoked boolean NOT NULL DEFAULT false,
  conflicts_with jsonb NOT NULL DEFAULT '[]'::jsonb,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  derived_from_cpm boolean NOT NULL DEFAULT false
    CONSTRAINT pc_sched_evidence_not_from_cpm CHECK (derived_from_cpm = false),
  derived_from_float boolean NOT NULL DEFAULT false
    CONSTRAINT pc_sched_evidence_not_from_float CHECK (derived_from_float = false),
  derived_from_earned_value boolean NOT NULL DEFAULT false
    CONSTRAINT pc_sched_evidence_not_from_ev CHECK (derived_from_earned_value = false),
  mutates_activity_identity boolean NOT NULL DEFAULT false
    CONSTRAINT pc_sched_evidence_no_activity_mutation CHECK (mutates_activity_identity = false)
);

CREATE INDEX IF NOT EXISTS idx_pc_schedule_evidence_assessment
  ON project_controls_schedule_evidence(tenant_id, workspace_id, assessment_id);
CREATE INDEX IF NOT EXISTS idx_pc_schedule_evidence_project
  ON project_controls_schedule_evidence(tenant_id, workspace_id, project_id, recorded_at DESC);

-- ---------------------------------------------------------------------------
-- Schedule reviews
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_controls_schedule_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  assessment_id uuid NOT NULL
    REFERENCES project_controls_schedule_assessments(id) ON DELETE CASCADE,
  workflow_instance_id text NOT NULL,
  workflow_state text NOT NULL
    CHECK (workflow_state IN ('draft', 'pending_review', 'changes_requested', 'approved', 'rejected')),
  outcome text
    CHECK (outcome IS NULL OR outcome IN ('approved', 'rejected', 'changes_requested', 'resubmitted')),
  reviewer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  self_approved boolean NOT NULL DEFAULT false
    CONSTRAINT pc_schedule_review_no_self_approval CHECK (self_approved = false)
);

CREATE INDEX IF NOT EXISTS idx_pc_schedule_reviews_assessment
  ON project_controls_schedule_reviews(tenant_id, workspace_id, assessment_id);

-- ---------------------------------------------------------------------------
-- Schedule snapshots
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_controls_schedule_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  schema_version text NOT NULL DEFAULT 'project_controls_schedule_snapshot/1',
  scope_kind text NOT NULL,
  scope_reference_id uuid,
  captured_at timestamptz NOT NULL DEFAULT now(),
  assessment_id uuid REFERENCES project_controls_schedule_assessments(id) ON DELETE SET NULL,
  status text NOT NULL,
  assessment_class text NOT NULL CHECK (assessment_class IN ('assessed', 'abstained')),
  milestone_posture text,
  confidence_class text NOT NULL,
  data_sufficiency text NOT NULL,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_project_registry boolean NOT NULL DEFAULT false
    CONSTRAINT pc_sched_snapshot_not_project_registry CHECK (is_project_registry = false),
  mutates_project_identity boolean NOT NULL DEFAULT false
    CONSTRAINT pc_sched_snapshot_no_identity_mutation CHECK (mutates_project_identity = false),
  critical_path_computed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_sched_snapshot_no_cpm CHECK (critical_path_computed = false),
  float_computed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_sched_snapshot_no_float CHECK (float_computed = false),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pc_schedule_snapshots_project
  ON project_controls_schedule_snapshots(tenant_id, workspace_id, project_id, captured_at DESC);

-- ---------------------------------------------------------------------------
-- Schedule timeline
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_controls_schedule_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  entry_id text NOT NULL,
  state_id text,
  scope_kind text NOT NULL,
  scope_reference_id uuid,
  kind text NOT NULL
    CHECK (kind IN (
      'schedule_assessed', 'schedule_abstained', 'schedule_reviewed',
      'schedule_published', 'schedule_rejected'
    )),
  event_type text NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  source_key text NOT NULL,
  actor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  detail text,
  governance jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, entry_id)
);

CREATE INDEX IF NOT EXISTS idx_pc_schedule_timeline_project
  ON project_controls_schedule_timeline(tenant_id, workspace_id, project_id, recorded_at ASC);

-- ---------------------------------------------------------------------------
-- Extend project profiles with schedule summary
-- ---------------------------------------------------------------------------
ALTER TABLE project_controls_project_profiles
  ADD COLUMN IF NOT EXISTS schedule_summary jsonb NOT NULL DEFAULT '{}'::jsonb;

-- ---------------------------------------------------------------------------
-- Extend outbox event types for schedule events
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
    'engineering.project.profile.updated'
  ));

-- ---------------------------------------------------------------------------
-- RLS — tenant + workspace isolation (mirrors batch_62)
-- ---------------------------------------------------------------------------
ALTER TABLE project_controls_schedule_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_controls_schedule_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_controls_schedule_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_controls_schedule_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_controls_schedule_timeline ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'project_controls_schedule_assessments',
    'project_controls_schedule_evidence',
    'project_controls_schedule_reviews',
    'project_controls_schedule_snapshots',
    'project_controls_schedule_timeline'
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

COMMENT ON TABLE project_controls_schedule_assessments IS
  'Project Controls advisory schedule intelligence. Not CPM, not float, not schedule execution.';
COMMENT ON TABLE project_controls_schedule_evidence IS
  'Evidence supporting a schedule assessment. May never derive from CPM, float or earned value.';
COMMENT ON TABLE project_controls_schedule_reviews IS
  'Human review records for schedule assessments. self_approved must remain false.';
COMMENT ON TABLE project_controls_schedule_snapshots IS
  'Immutable composed schedule snapshots. critical_path_computed and float_computed must remain false.';
