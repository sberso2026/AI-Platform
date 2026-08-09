-- batch_91: Security & Assurance Isolation Assurance (Phase 15C)
-- Additive only. Does NOT rewrite batch_90.
-- Observes/probes/evidences isolation — does NOT mutate RLS/authorization.
-- Evidence refs/status only — no sensitive payloads.

-- ---------------------------------------------------------------------------
-- Isolation probe definitions (versioned metadata; no executable payloads)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS security_assurance_isolation_probes (
  probe_key text PRIMARY KEY,
  probe_id text NOT NULL,
  version text NOT NULL,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  target_plane text NOT NULL CHECK (target_plane IN (
    'DATABASE', 'API', 'FILES', 'SEARCH', 'KNOWLEDGE_GRAPH', 'AI_CONTEXT',
    'BACKGROUND_JOB', 'EVENT', 'EXECUTION_HOST', 'SOLVER_WORKSPACE', 'CACHE'
  )),
  scope text NOT NULL,
  required_actor_contexts jsonb NOT NULL DEFAULT '[]'::jsonb,
  expected_outcome text NOT NULL CHECK (expected_outcome IN (
    'allow', 'deny', 'not_applicable'
  )),
  control_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence_policy text NOT NULL,
  freshness_policy text NOT NULL,
  timeout_policy_ms integer NOT NULL DEFAULT 5000 CHECK (timeout_policy_ms > 0),
  risk_classification text NOT NULL CHECK (risk_classification IN (
    'low', 'medium', 'high', 'critical'
  )),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'active', 'deprecated', 'retired'
  )),
  harness_key text NOT NULL,
  production_safe boolean NOT NULL DEFAULT true
    CONSTRAINT sa_iso_probe_prod_safe CHECK (production_safe = true),
  mutates_authorization boolean NOT NULL DEFAULT false
    CONSTRAINT sa_iso_probe_no_authz_mut CHECK (mutates_authorization = false),
  mutates_rls boolean NOT NULL DEFAULT false
    CONSTRAINT sa_iso_probe_no_rls_mut CHECK (mutates_rls = false),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (probe_id, version)
);

CREATE INDEX IF NOT EXISTS idx_sa_iso_probes_scope
  ON security_assurance_isolation_probes(tenant_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_sa_iso_probes_plane
  ON security_assurance_isolation_probes(target_plane);

-- ---------------------------------------------------------------------------
-- Probe runs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS security_assurance_isolation_probe_runs (
  run_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  probe_ref text NOT NULL,
  probe_version text NOT NULL,
  target_plane text NOT NULL,
  scope text NOT NULL,
  actor_context_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  target_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  expected_outcome text NOT NULL,
  actual_outcome text NOT NULL,
  result text NOT NULL CHECK (result IN (
    'pass', 'fail', 'partial', 'not_applicable', 'unknown', 'error'
  )),
  executed_at timestamptz NOT NULL DEFAULT now(),
  duration_ms integer NOT NULL DEFAULT 0,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  integrity_ref text,
  limitations text,
  freshness text NOT NULL DEFAULT 'current',
  execution_mode text NOT NULL CHECK (execution_mode IN (
    'on_demand', 'ci', 'scheduled', 'release_gate'
  )),
  fallback_to_pass_forbidden boolean NOT NULL DEFAULT true
    CONSTRAINT sa_iso_run_no_fallback CHECK (fallback_to_pass_forbidden = true),
  contains_sensitive_payload boolean NOT NULL DEFAULT false
    CONSTRAINT sa_iso_run_no_sensitive CHECK (contains_sensitive_payload = false),
  access_decision text,
  data_disclosure text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sa_iso_runs_scope
  ON security_assurance_isolation_probe_runs(tenant_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_sa_iso_runs_plane
  ON security_assurance_isolation_probe_runs(target_plane);

-- ---------------------------------------------------------------------------
-- Isolation assessments
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS security_assurance_isolation_assessments (
  assessment_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  scope text NOT NULL,
  scope_kind text NOT NULL CHECK (scope_kind IN (
    'platform', 'tenant', 'workspace', 'service', 'module', 'plane'
  )),
  control_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  probe_run_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  result text NOT NULL CHECK (result IN (
    'pass', 'fail', 'partial', 'not_applicable', 'unknown', 'error'
  )),
  freshness text NOT NULL,
  limitations text,
  finding_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  assessed_at timestamptz NOT NULL,
  review_status text NOT NULL CHECK (review_status IN (
    'candidate', 'pending_review', 'approved', 'rejected'
  )),
  governed_review_action text NOT NULL DEFAULT 'security_assurance.isolation_review',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sa_iso_assess_scope
  ON security_assurance_isolation_assessments(tenant_id, workspace_id);

-- ---------------------------------------------------------------------------
-- Isolation assurance snapshots
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS security_assurance_isolation_snapshots (
  snapshot_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  scope text NOT NULL,
  captured_at timestamptz NOT NULL,
  planes jsonb NOT NULL DEFAULT '[]'::jsonb,
  overall_result text NOT NULL,
  known_cross_tenant_leakage_detected boolean NOT NULL DEFAULT false
    CONSTRAINT sa_iso_snap_no_tenant_leak CHECK (known_cross_tenant_leakage_detected = false),
  known_cross_workspace_leakage_detected boolean NOT NULL DEFAULT false
    CONSTRAINT sa_iso_snap_no_ws_leak CHECK (known_cross_workspace_leakage_detected = false),
  universal_score_present boolean NOT NULL DEFAULT false
    CONSTRAINT sa_iso_snap_no_score CHECK (universal_score_present = false),
  automatic_remediation_enabled boolean NOT NULL DEFAULT false
    CONSTRAINT sa_iso_snap_no_remediation CHECK (automatic_remediation_enabled = false),
  automatic_authorization_mutation_enabled boolean NOT NULL DEFAULT false
    CONSTRAINT sa_iso_snap_no_authz CHECK (automatic_authorization_mutation_enabled = false),
  automatic_rls_mutation_enabled boolean NOT NULL DEFAULT false
    CONSTRAINT sa_iso_snap_no_rls CHECK (automatic_rls_mutation_enabled = false),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sa_iso_snap_scope
  ON security_assurance_isolation_snapshots(tenant_id, workspace_id);

-- ---------------------------------------------------------------------------
-- Extend outbox event types for isolation (additive CHECK replace)
-- ---------------------------------------------------------------------------
ALTER TABLE security_assurance_outbox_events
  DROP CONSTRAINT IF EXISTS security_assurance_outbox_events_event_type_check;

ALTER TABLE security_assurance_outbox_events
  ADD CONSTRAINT security_assurance_outbox_events_event_type_check
  CHECK (event_type IN (
    'security_assurance.evidence_recorded',
    'security_assurance.assessment_completed',
    'security_assurance.finding_opened',
    'security_assurance.exception_changed',
    'security_assurance.posture_published',
    'security_assurance.isolation.probe_completed',
    'security_assurance.isolation.assessment_completed',
    'security_assurance.isolation.finding_opened',
    'security_assurance.isolation.posture_updated'
  ));

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE security_assurance_isolation_probes ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_assurance_isolation_probe_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_assurance_isolation_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_assurance_isolation_snapshots ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'security_assurance_isolation_probes',
    'security_assurance_isolation_probe_runs',
    'security_assurance_isolation_assessments',
    'security_assurance_isolation_snapshots'
  ]
  LOOP
    EXECUTE format('GRANT ALL ON %I TO anon, authenticated, service_role', t);

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
