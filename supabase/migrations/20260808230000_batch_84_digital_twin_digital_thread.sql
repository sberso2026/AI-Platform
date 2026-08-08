-- batch_84: Digital Twin Phase 12K — Digital Thread Intelligence
-- Metadata/refs only — NO duplicated Assets/Projects/documents/II/AI/PC/PI/TS/KG/sim binaries.
-- Outbox: digital_twin_outbox_events (NOT digital_twin_outbox).
-- Do NOT modify batch_75–83.

-- ---------------------------------------------------------------------------
-- Thread profiles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_thread_profiles (
  profile_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  twin_id text NOT NULL,
  profile_key text NOT NULL,
  display_name text NOT NULL,
  twin_thread_integration text NOT NULL DEFAULT 'by_reference'
    CHECK (twin_thread_integration = 'by_reference'),
  twin_snapshot_integration text NOT NULL DEFAULT 'by_reference'
    CHECK (twin_snapshot_integration = 'by_reference'),
  twin_timeline_integration text NOT NULL DEFAULT 'by_reference'
    CHECK (twin_timeline_integration = 'by_reference'),
  knowledge_graph_reuse boolean NOT NULL DEFAULT true CHECK (knowledge_graph_reuse = true),
  duplicate_knowledge_graph_detected boolean NOT NULL DEFAULT false
    CHECK (duplicate_knowledge_graph_detected = false),
  composition_mode text NOT NULL DEFAULT 'references_only'
    CHECK (composition_mode = 'references_only'),
  taxonomy_version text NOT NULL DEFAULT '1.0.0',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, workspace_id, twin_id, profile_key)
);

CREATE TABLE IF NOT EXISTS digital_twin_thread_snapshots (
  thread_snapshot_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  twin_id text NOT NULL,
  snapshot_version text NOT NULL,
  as_of timestamptz NOT NULL,
  twin_thread_ref text,
  twin_snapshot_ref text,
  twin_timeline_ref text,
  composition_mode text NOT NULL DEFAULT 'references_only'
    CHECK (composition_mode = 'references_only'),
  replaces_twin_snapshot boolean NOT NULL DEFAULT false
    CHECK (replaces_twin_snapshot = false),
  duplicates_source_stores boolean NOT NULL DEFAULT false
    CHECK (duplicates_source_stores = false),
  status text NOT NULL CHECK (status IN (
    'draft','composed','reviewed','published','superseded'
  )),
  composed_by text,
  composed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, workspace_id, twin_id, snapshot_version)
);

CREATE TABLE IF NOT EXISTS digital_twin_thread_references (
  thread_reference_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  twin_id text NOT NULL,
  thread_snapshot_id text REFERENCES digital_twin_thread_snapshots(thread_snapshot_id) ON DELETE CASCADE,
  kind text NOT NULL,
  target_ref text NOT NULL,
  target_version text,
  ownership_claimed boolean NOT NULL DEFAULT false CHECK (ownership_claimed = false),
  implies_observed_state boolean NOT NULL DEFAULT false CHECK (implies_observed_state = false),
  replaces_twin_snapshot boolean NOT NULL DEFAULT false CHECK (replaces_twin_snapshot = false),
  duplicates_source_store boolean NOT NULL DEFAULT false CHECK (duplicates_source_store = false),
  adapter_status text CHECK (adapter_status IN ('available','reserved','unavailable')),
  label text,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS digital_twin_thread_relationships (
  thread_relationship_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  twin_id text NOT NULL,
  thread_snapshot_id text REFERENCES digital_twin_thread_snapshots(thread_snapshot_id) ON DELETE CASCADE,
  from_reference_id text NOT NULL,
  to_reference_id text NOT NULL,
  relationship_type text NOT NULL,
  taxonomy_version text NOT NULL DEFAULT '1.0.0',
  implies_causality boolean NOT NULL DEFAULT false CHECK (implies_causality = false),
  implies_dependency boolean NOT NULL DEFAULT false CHECK (implies_dependency = false),
  notes text,
  superseded_by text,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS digital_twin_thread_provenance (
  provenance_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  twin_id text NOT NULL,
  thread_snapshot_id text REFERENCES digital_twin_thread_snapshots(thread_snapshot_id) ON DELETE CASCADE,
  source_domain text NOT NULL DEFAULT 'unknown',
  source_reference text NOT NULL DEFAULT 'unknown',
  source_version text,
  source_timestamp timestamptz,
  relationship_type text NOT NULL DEFAULT 'unknown',
  taxonomy_version text NOT NULL DEFAULT '1.0.0',
  provenance_status text NOT NULL CHECK (provenance_status IN (
    'known','partial','unknown','conflicting','stale'
  )),
  review_status text NOT NULL CHECK (review_status IN (
    'not_reviewed','submitted','approved','rejected','unknown'
  )),
  validity text NOT NULL CHECK (validity IN ('valid','invalid','unknown','expired')),
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  fabricated boolean NOT NULL DEFAULT false CHECK (fabricated = false),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS digital_twin_thread_integrity (
  integrity_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  twin_id text NOT NULL,
  thread_snapshot_id text NOT NULL REFERENCES digital_twin_thread_snapshots(thread_snapshot_id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN (
    'complete','partial','broken_reference','conflicting','stale','unknown'
  )),
  findings jsonb NOT NULL DEFAULT '[]'::jsonb,
  auto_repair_attempted boolean NOT NULL DEFAULT false CHECK (auto_repair_attempted = false),
  assessed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS digital_twin_thread_change_sets (
  change_set_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  twin_id text NOT NULL,
  from_snapshot_id text NOT NULL,
  to_snapshot_id text NOT NULL,
  changes jsonb NOT NULL DEFAULT '[]'::jsonb,
  causal_inference_performed boolean NOT NULL DEFAULT false
    CHECK (causal_inference_performed = false),
  compared_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS digital_twin_thread_reviews (
  review_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  twin_id text NOT NULL,
  subject_ref text NOT NULL,
  slug text NOT NULL DEFAULT 'digital_twin.digital_thread_review'
    CHECK (slug = 'digital_twin.digital_thread_review'),
  status text NOT NULL CHECK (status IN ('draft','submitted','approved','rejected')),
  submitted_by text,
  decided_by text,
  decided_at timestamptz,
  notes text,
  ai_self_approval boolean NOT NULL DEFAULT false CHECK (ai_self_approval = false),
  automatic_approval boolean NOT NULL DEFAULT false CHECK (automatic_approval = false),
  historic_immutable boolean NOT NULL DEFAULT true CHECK (historic_immutable = true),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS digital_twin_thread_profiles_twin_idx
  ON digital_twin_thread_profiles (tenant_id, workspace_id, twin_id);
CREATE INDEX IF NOT EXISTS digital_twin_thread_snapshots_twin_idx
  ON digital_twin_thread_snapshots (tenant_id, workspace_id, twin_id, as_of);
CREATE INDEX IF NOT EXISTS digital_twin_thread_references_snap_idx
  ON digital_twin_thread_references (thread_snapshot_id);
CREATE INDEX IF NOT EXISTS digital_twin_thread_relationships_snap_idx
  ON digital_twin_thread_relationships (thread_snapshot_id);
CREATE INDEX IF NOT EXISTS digital_twin_thread_provenance_snap_idx
  ON digital_twin_thread_provenance (thread_snapshot_id);
CREATE INDEX IF NOT EXISTS digital_twin_thread_integrity_snap_idx
  ON digital_twin_thread_integrity (thread_snapshot_id);
CREATE INDEX IF NOT EXISTS digital_twin_thread_change_sets_twin_idx
  ON digital_twin_thread_change_sets (tenant_id, workspace_id, twin_id);
CREATE INDEX IF NOT EXISTS digital_twin_thread_reviews_twin_idx
  ON digital_twin_thread_reviews (tenant_id, workspace_id, twin_id);

-- ---------------------------------------------------------------------------
-- Outbox event types (extend digital_twin_outbox_events)
-- ---------------------------------------------------------------------------
ALTER TABLE digital_twin_outbox_events DROP CONSTRAINT IF EXISTS digital_twin_outbox_events_event_type_check;
ALTER TABLE digital_twin_outbox_events ADD CONSTRAINT digital_twin_outbox_events_event_type_check
  CHECK (event_type IN (
    'engineering.digital_twin.created',
    'engineering.digital_twin.updated',
    'engineering.digital_twin.relationship.updated',
    'engineering.digital_twin.representation.updated',
    'engineering.digital_twin.state.created',
    'engineering.digital_twin.state.reviewed',
    'engineering.digital_twin.state.published',
    'engineering.digital_twin.state.superseded',
    'engineering.digital_twin.snapshot.updated',
    'engineering.digital_twin.state_candidate.received',
    'engineering.digital_twin.state_candidate.validated',
    'engineering.digital_twin.state_candidate.rejected',
    'engineering.digital_twin.state.conflict_detected',
    'engineering.digital_twin.telemetry_binding.created',
    'engineering.digital_twin.telemetry_binding.reviewed',
    'engineering.digital_twin.telemetry_binding.published',
    'engineering.digital_twin.telemetry_binding.suspended',
    'engineering.digital_twin.telemetry.projection_created',
    'engineering.digital_twin.telemetry.quality_rejected',
    'engineering.digital_twin.telemetry.stale_detected',
    'engineering.digital_twin.telemetry.source_unavailable',
    'engineering.digital_twin.representation.registered',
    'engineering.digital_twin.representation.versioned',
    'engineering.digital_twin.mapping.created',
    'engineering.digital_twin.mapping.reviewed',
    'engineering.digital_twin.mapping.published',
    'engineering.digital_twin.mapping.superseded',
    'engineering.digital_twin.mapping.review_required',
    'engineering.digital_twin.simulation.method.registered',
    'engineering.digital_twin.simulation.provider.registered',
    'engineering.digital_twin.simulation.definition.versioned',
    'engineering.digital_twin.simulation.scenario.created',
    'engineering.digital_twin.simulation.input_set.frozen',
    'engineering.digital_twin.simulation.run.started',
    'engineering.digital_twin.simulation.run.succeeded',
    'engineering.digital_twin.simulation.run.failed',
    'engineering.digital_twin.simulation.result.persisted',
    'engineering.digital_twin.simulation.validation.updated',
    'engineering.digital_twin.simulation.review.submitted',
    'engineering.digital_twin.simulation.review.decided',
    'engineering.digital_twin.simulated_state.published',
    'engineering.digital_twin.simulation.method_qualification.activated',
    'engineering.digital_twin.simulation.method_qualification.revoked',
    'engineering.digital_twin.simulation.provider_qualification.activated',
    'engineering.digital_twin.simulation.provider_qualification.revoked',
    'engineering.digital_twin.simulation.application_qualification.activated',
    'engineering.digital_twin.simulation.application_qualification.revoked',
    'engineering.digital_twin.simulation.execution_qualification.issued',
    'engineering.digital_twin.simulation.execution_qualification.revoked',
    'engineering.digital_twin.simulation.package.assembled',
    'engineering.digital_twin.simulation.package.sealed',
    'engineering.digital_twin.simulation.package.integrity_checked',
    'engineering.digital_twin.simulation.reproducibility.assessed',
    'engineering.digital_twin.simulation.eligibility.assessed',
    'engineering.digital_twin.solver.adapter.registered',
    'engineering.digital_twin.solver.version.probed',
    'engineering.digital_twin.solver.health.checked',
    'engineering.digital_twin.solver.run.started',
    'engineering.digital_twin.solver.run.completed',
    'engineering.digital_twin.solver.run.failed',
    'engineering.digital_twin.solver.run.timeout',
    'engineering.digital_twin.solver.run.cancelled',
    'engineering.digital_twin.solver.benchmark.executed',
    'engineering.solver.capability.registered',
    'engineering.solver.capability.qualified',
    'engineering.solver.capability.revoked',
    'engineering.solver.provider.updated',
    'engineering.digital_twin.thread.composed',
    'engineering.digital_twin.thread.reviewed',
    'engineering.digital_twin.thread.published',
    'engineering.digital_twin.thread.integrity_changed'
  ));

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE digital_twin_thread_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_thread_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_thread_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_thread_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_thread_provenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_thread_integrity ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_thread_change_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_thread_reviews ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'digital_twin_thread_profiles',
    'digital_twin_thread_snapshots',
    'digital_twin_thread_references',
    'digital_twin_thread_relationships',
    'digital_twin_thread_provenance',
    'digital_twin_thread_integrity',
    'digital_twin_thread_change_sets',
    'digital_twin_thread_reviews'
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
       )',
      t || '_update', t
    );
  END LOOP;
END $$;
