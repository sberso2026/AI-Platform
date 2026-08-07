-- Phase 11B — Project Controls progress intelligence persistence (batch_62)
--
-- Intelligence ABOUT projects only. These tables do NOT create a project
-- registry: `project_id` is a foreign key into `engineering_projects`, whose
-- identity is owned by the Engineering Shared Project Domain (batch_20 for the
-- project record, batch_61 for the hierarchy references).
--
-- Progress here is ADVISORY. The boolean locks below are CHECK-constrained to
-- false so no row can ever claim earned value, a critical path, cost
-- integration, a forecast or a certified physical percent complete.
--
-- Additive only; do not rewrite batch_20 or batch_61.

-- ---------------------------------------------------------------------------
-- Progress assessments
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_controls_progress_assessments (
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
  indicated_completion numeric
    CHECK (indicated_completion IS NULL OR (indicated_completion >= 0 AND indicated_completion <= 1)),
  progress_band text
    CHECK (progress_band IS NULL OR progress_band IN (
      'not_started', 'early', 'in_progress', 'advanced', 'substantially_complete', 'complete', 'unavailable'
    )),
  trend_direction text NOT NULL DEFAULT 'unknown'
    CHECK (trend_direction IN ('improving', 'stable', 'declining', 'unknown')),
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
  method text NOT NULL DEFAULT 'progress_intelligence_advisory_v1'
    CHECK (method = 'progress_intelligence_advisory_v1'),
  method_version text NOT NULL DEFAULT '1',
  assessed_at timestamptz NOT NULL DEFAULT now(),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  published_at timestamptz,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  supersedes_id uuid REFERENCES project_controls_progress_assessments(id) ON DELETE SET NULL,
  workflow_instance_id text,
  -- Forbid locks. Flipping any of these requires a new certified phase.
  earned_value_computed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_progress_no_earned_value CHECK (earned_value_computed = false),
  critical_path_computed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_progress_no_cpm CHECK (critical_path_computed = false),
  cost_integrated boolean NOT NULL DEFAULT false
    CONSTRAINT pc_progress_no_cost_engine CHECK (cost_integrated = false),
  forecast_produced boolean NOT NULL DEFAULT false
    CONSTRAINT pc_progress_no_forecasting CHECK (forecast_produced = false),
  schedule_executed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_progress_no_schedule_execution CHECK (schedule_executed = false),
  resource_levelled boolean NOT NULL DEFAULT false
    CONSTRAINT pc_progress_no_resource_leveling CHECK (resource_levelled = false),
  physical_percent_complete_certified boolean NOT NULL DEFAULT false
    CONSTRAINT pc_progress_no_certified_percent CHECK (physical_percent_complete_certified = false),
  advisory_only boolean NOT NULL DEFAULT true
    CONSTRAINT pc_progress_advisory_only CHECK (advisory_only = true),
  mutates_project_identity boolean NOT NULL DEFAULT false
    CONSTRAINT pc_progress_no_identity_mutation CHECK (mutates_project_identity = false),
  -- An abstained assessment may never carry a completion indication.
  CONSTRAINT pc_progress_abstention_has_no_indication
    CHECK (abstained = false OR indicated_completion IS NULL),
  UNIQUE (tenant_id, workspace_id, project_id, scope_kind, scope_reference_id, version)
);

CREATE INDEX IF NOT EXISTS idx_pc_progress_tenant_ws_project
  ON project_controls_progress_assessments(tenant_id, workspace_id, project_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_pc_progress_scope_latest
  ON project_controls_progress_assessments(project_id, scope_kind, scope_reference_id, version DESC);
CREATE INDEX IF NOT EXISTS idx_pc_progress_published
  ON project_controls_progress_assessments(tenant_id, workspace_id, project_id)
  WHERE status = 'published';

-- ---------------------------------------------------------------------------
-- Progress evidence
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_controls_progress_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  assessment_id uuid NOT NULL
    REFERENCES project_controls_progress_assessments(id) ON DELETE CASCADE,
  scope_kind text NOT NULL
    CHECK (scope_kind IN ('project', 'phase', 'wbs_node', 'work_package', 'activity', 'milestone')),
  scope_reference_id uuid,
  evidence_kind text NOT NULL
    CHECK (evidence_kind IN (
      'site_observation', 'quantity_record', 'inspection_result', 'document_status',
      'milestone_attestation', 'meeting_statement', 'supplier_confirmation',
      'checklist_completion', 'photo_record', 'engineering_judgement'
    )),
  source_type text NOT NULL
    CHECK (source_type IN (
      'manual_engineering_assessment', 'inspection_intelligence', 'project_intelligence',
      'asset_intelligence', 'external_import', 'supplier_report'
    )),
  source_key text NOT NULL,
  source_reference text,
  observed_at timestamptz,
  narrative text,
  indicated_completion numeric
    CHECK (indicated_completion IS NULL OR (indicated_completion >= 0 AND indicated_completion <= 1)),
  weight numeric CHECK (weight IS NULL OR (weight >= 0 AND weight <= 1)),
  review_status text NOT NULL DEFAULT 'unreviewed'
    CHECK (review_status IN ('unreviewed', 'pending_review', 'reviewed', 'approved', 'published')),
  revoked boolean NOT NULL DEFAULT false,
  conflicts_with jsonb NOT NULL DEFAULT '[]'::jsonb,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  derived_from_earned_value boolean NOT NULL DEFAULT false
    CONSTRAINT pc_evidence_not_from_earned_value CHECK (derived_from_earned_value = false),
  derived_from_cost_data boolean NOT NULL DEFAULT false
    CONSTRAINT pc_evidence_not_from_cost CHECK (derived_from_cost_data = false)
);

CREATE INDEX IF NOT EXISTS idx_pc_progress_evidence_assessment
  ON project_controls_progress_evidence(tenant_id, workspace_id, assessment_id);
CREATE INDEX IF NOT EXISTS idx_pc_progress_evidence_project
  ON project_controls_progress_evidence(tenant_id, workspace_id, project_id, recorded_at DESC);

-- ---------------------------------------------------------------------------
-- Progress reviews
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_controls_progress_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  assessment_id uuid NOT NULL
    REFERENCES project_controls_progress_assessments(id) ON DELETE CASCADE,
  workflow_instance_id text NOT NULL,
  workflow_state text NOT NULL
    CHECK (workflow_state IN ('draft', 'pending_review', 'changes_requested', 'approved', 'rejected')),
  outcome text
    CHECK (outcome IS NULL OR outcome IN ('approved', 'rejected', 'changes_requested', 'resubmitted')),
  reviewer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  -- Segregation of duties is a data constraint, not just an engine check.
  self_approved boolean NOT NULL DEFAULT false
    CONSTRAINT pc_review_no_self_approval CHECK (self_approved = false)
);

CREATE INDEX IF NOT EXISTS idx_pc_progress_reviews_assessment
  ON project_controls_progress_reviews(tenant_id, workspace_id, assessment_id);

-- ---------------------------------------------------------------------------
-- Progress snapshots (immutable composed views)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_controls_progress_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  schema_version text NOT NULL DEFAULT 'project_controls_progress_snapshot/1',
  scope_kind text NOT NULL,
  scope_reference_id uuid,
  captured_at timestamptz NOT NULL DEFAULT now(),
  assessment_id uuid REFERENCES project_controls_progress_assessments(id) ON DELETE SET NULL,
  status text NOT NULL,
  assessment_class text NOT NULL CHECK (assessment_class IN ('assessed', 'abstained')),
  indicated_completion numeric,
  progress_band text,
  confidence_class text NOT NULL,
  data_sufficiency text NOT NULL,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_project_registry boolean NOT NULL DEFAULT false
    CONSTRAINT pc_snapshot_not_project_registry CHECK (is_project_registry = false),
  mutates_project_identity boolean NOT NULL DEFAULT false
    CONSTRAINT pc_snapshot_no_identity_mutation CHECK (mutates_project_identity = false),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pc_progress_snapshots_project
  ON project_controls_progress_snapshots(tenant_id, workspace_id, project_id, captured_at DESC);

-- ---------------------------------------------------------------------------
-- Progress timeline
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_controls_progress_timeline (
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
      'progress_assessed', 'progress_abstained', 'progress_review_started',
      'progress_reviewed', 'progress_published', 'progress_rejected',
      'project_profile_composed'
    )),
  event_type text NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  source_key text NOT NULL,
  actor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  detail text,
  governance jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, entry_id)
);

CREATE INDEX IF NOT EXISTS idx_pc_progress_timeline_project
  ON project_controls_progress_timeline(tenant_id, workspace_id, project_id, recorded_at ASC);

-- ---------------------------------------------------------------------------
-- Project profiles (Project Context Engine output)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_controls_project_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  version integer NOT NULL DEFAULT 1,
  profile_class text NOT NULL
    CHECK (profile_class IN ('composed', 'partially_composed', 'abstained')),
  composed_at timestamptz NOT NULL DEFAULT now(),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  -- Denormalised identity fields, copied from the resolved ProjectReference for
  -- display only. Never a second source of truth for project identity.
  project_code text NOT NULL,
  project_name text NOT NULL,
  project_phase text NOT NULL,
  project_status text NOT NULL,
  progress_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  contributors jsonb NOT NULL DEFAULT '[]'::jsonb,
  active_contributor_keys jsonb NOT NULL DEFAULT '[]'::jsonb,
  reserved_contributor_keys jsonb NOT NULL DEFAULT '[]'::jsonb,
  reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
  abstained boolean NOT NULL DEFAULT false,
  abstention_reason text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  supersedes_id uuid REFERENCES project_controls_project_profiles(id) ON DELETE SET NULL,
  earned_value_computed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_profile_no_earned_value CHECK (earned_value_computed = false),
  critical_path_computed boolean NOT NULL DEFAULT false
    CONSTRAINT pc_profile_no_cpm CHECK (critical_path_computed = false),
  cost_integrated boolean NOT NULL DEFAULT false
    CONSTRAINT pc_profile_no_cost_engine CHECK (cost_integrated = false),
  forecast_produced boolean NOT NULL DEFAULT false
    CONSTRAINT pc_profile_no_forecasting CHECK (forecast_produced = false),
  advisory_only boolean NOT NULL DEFAULT true
    CONSTRAINT pc_profile_advisory_only CHECK (advisory_only = true),
  mutates_project_identity boolean NOT NULL DEFAULT false
    CONSTRAINT pc_profile_no_identity_mutation CHECK (mutates_project_identity = false),
  is_project_registry boolean NOT NULL DEFAULT false
    CONSTRAINT pc_profile_not_project_registry CHECK (is_project_registry = false),
  UNIQUE (tenant_id, workspace_id, project_id, version)
);

CREATE INDEX IF NOT EXISTS idx_pc_project_profiles_latest
  ON project_controls_project_profiles(tenant_id, workspace_id, project_id, version DESC);

-- ---------------------------------------------------------------------------
-- Idempotency + outbox (PC-local, mirrors the asset intelligence pattern)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_controls_idempotency (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  idempotency_key text NOT NULL,
  operation text NOT NULL,
  resource_id text,
  request_hash text,
  response_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, workspace_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS project_controls_outbox_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  event_type text NOT NULL
    CHECK (event_type IN (
      'engineering.project.progress.updated',
      'engineering.project.progress.reviewed',
      'engineering.project.progress.published',
      'engineering.project.profile.updated'
    )),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  correlation_id text,
  state_id text,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_pc_outbox_unpublished
  ON project_controls_outbox_events(published, created_at ASC)
  WHERE published = false;

-- ---------------------------------------------------------------------------
-- RLS — tenant + workspace isolation
-- ---------------------------------------------------------------------------
ALTER TABLE project_controls_progress_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_controls_progress_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_controls_progress_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_controls_progress_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_controls_progress_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_controls_project_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_controls_idempotency ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_controls_outbox_events ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'project_controls_progress_assessments',
    'project_controls_progress_evidence',
    'project_controls_progress_reviews',
    'project_controls_progress_snapshots',
    'project_controls_progress_timeline',
    'project_controls_project_profiles',
    'project_controls_idempotency',
    'project_controls_outbox_events'
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

COMMENT ON TABLE project_controls_progress_assessments IS
  'Project Controls advisory progress intelligence. Not earned value, not a certified percent complete, not a project registry.';
COMMENT ON TABLE project_controls_progress_evidence IS
  'Evidence supporting a progress assessment. May never derive from earned value or cost data.';
COMMENT ON TABLE project_controls_progress_reviews IS
  'Human review records for progress assessments. self_approved must remain false.';
COMMENT ON TABLE project_controls_progress_snapshots IS
  'Immutable composed progress snapshots. is_project_registry must remain false.';
COMMENT ON TABLE project_controls_project_profiles IS
  'Project Context Engine output. Identity fields are display copies of the resolved ProjectReference.';
