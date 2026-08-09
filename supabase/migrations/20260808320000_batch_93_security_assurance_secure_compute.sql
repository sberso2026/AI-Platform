-- batch_93: Security & Assurance Secure Compute Assurance (Phase 15E)
-- Additive only. Does NOT rewrite batch_90/91/92.
-- Observes/assesses secure compute — does NOT create execution host/sandbox/TEE.
-- Evidence refs/status only — no raw secrets.

CREATE TABLE IF NOT EXISTS security_assurance_secure_compute_contexts (
  execution_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  requester_identity text NOT NULL,
  workload_id text NOT NULL,
  job_id text,
  tool_id text,
  user_id text,
  service_id text,
  attributable boolean NOT NULL DEFAULT false,
  runtime_host_ref text NOT NULL,
  authorization_policy_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  security_classification text,
  input_evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  output_evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  artefact_version_ref text,
  artefact_hash_ref text,
  started_at timestamptz NOT NULL,
  ended_at timestamptz,
  status text NOT NULL CHECK (status IN (
    'pass', 'fail', 'partial', 'unknown', 'not_assessed', 'not_applicable', 'error'
  )),
  evidence_freshness text NOT NULL,
  contains_raw_secret boolean NOT NULL DEFAULT false
    CONSTRAINT sa_sc_ctx_no_secret CHECK (contains_raw_secret = false),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sa_sc_ctx_scope
  ON security_assurance_secure_compute_contexts(tenant_id, workspace_id);

CREATE TABLE IF NOT EXISTS security_assurance_secure_compute_assessments (
  assessment_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  plane text NOT NULL CHECK (plane IN (
    'WORKLOAD_IDENTITY', 'TENANT_WORKSPACE_SCOPE', 'EXECUTION_AUTHORIZATION',
    'RUNTIME_ISOLATION', 'FILESYSTEM_SCOPE', 'NETWORK_EGRESS', 'SECRET_ACCESS',
    'RESOURCE_LIMITS', 'EXECUTION_TIMEOUT', 'ARTEFACT_INTEGRITY',
    'EXECUTION_PROVENANCE', 'OUTPUT_HANDLING', 'TEMPORARY_DATA',
    'LOGGING_TELEMETRY', 'HOST_POSTURE'
  )),
  scope text NOT NULL,
  execution_id text,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  result text NOT NULL CHECK (result IN (
    'pass', 'fail', 'partial', 'unknown', 'not_assessed', 'not_applicable', 'error'
  )),
  freshness text NOT NULL,
  limitations text,
  finding_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  assessed_at timestamptz NOT NULL,
  review_status text NOT NULL CHECK (review_status IN (
    'candidate', 'pending_review', 'approved', 'rejected'
  )),
  governed_review_action text NOT NULL DEFAULT 'security_assurance.secure_compute_review',
  error_cannot_become_pass boolean NOT NULL DEFAULT true
    CONSTRAINT sa_sc_assess_no_error_pass CHECK (error_cannot_become_pass = true),
  fallback_to_pass_forbidden boolean NOT NULL DEFAULT true
    CONSTRAINT sa_sc_assess_no_fallback_pass CHECK (fallback_to_pass_forbidden = true),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sa_sc_assess_scope
  ON security_assurance_secure_compute_assessments(tenant_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_sa_sc_assess_plane
  ON security_assurance_secure_compute_assessments(plane);

CREATE TABLE IF NOT EXISTS security_assurance_secure_compute_control_evidence (
  evidence_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  plane text NOT NULL,
  control_ref text NOT NULL,
  observed boolean NOT NULL DEFAULT true
    CONSTRAINT sa_sc_ev_observed CHECK (observed = true),
  fabricated boolean NOT NULL DEFAULT false
    CONSTRAINT sa_sc_ev_no_fabricated CHECK (fabricated = false),
  freshness text NOT NULL,
  source_ref text NOT NULL,
  recorded_at timestamptz NOT NULL,
  contains_raw_secret boolean NOT NULL DEFAULT false
    CONSTRAINT sa_sc_ev_no_secret CHECK (contains_raw_secret = false),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sa_sc_ev_scope
  ON security_assurance_secure_compute_control_evidence(tenant_id, workspace_id);

CREATE TABLE IF NOT EXISTS security_assurance_secure_compute_snapshots (
  snapshot_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  scope text NOT NULL,
  captured_at timestamptz NOT NULL,
  planes jsonb NOT NULL DEFAULT '[]'::jsonb,
  overall_result text NOT NULL,
  isolation_dimension_preserved boolean NOT NULL DEFAULT true
    CONSTRAINT sa_sc_snap_iso_preserved CHECK (isolation_dimension_preserved = true),
  ai_data_dimension_preserved boolean NOT NULL DEFAULT true
    CONSTRAINT sa_sc_snap_aid_preserved CHECK (ai_data_dimension_preserved = true),
  universal_score_present boolean NOT NULL DEFAULT false
    CONSTRAINT sa_sc_snap_no_score CHECK (universal_score_present = false),
  confidential_computing_claimed boolean NOT NULL DEFAULT false
    CONSTRAINT sa_sc_snap_no_cc CHECK (confidential_computing_claimed = false),
  tee_claimed boolean NOT NULL DEFAULT false
    CONSTRAINT sa_sc_snap_no_tee CHECK (tee_claimed = false),
  hardware_attestation_claimed boolean NOT NULL DEFAULT false
    CONSTRAINT sa_sc_snap_no_attest CHECK (hardware_attestation_claimed = false),
  known_cross_tenant_execution_leakage_detected boolean NOT NULL DEFAULT false
    CONSTRAINT sa_sc_snap_no_leak CHECK (known_cross_tenant_execution_leakage_detected = false),
  automatic_remediation_enabled boolean NOT NULL DEFAULT false
    CONSTRAINT sa_sc_snap_no_remediation CHECK (automatic_remediation_enabled = false),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sa_sc_snap_scope
  ON security_assurance_secure_compute_snapshots(tenant_id, workspace_id);

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
    'security_assurance.isolation.posture_updated',
    'security_assurance.ai_data.flow_recorded',
    'security_assurance.ai_data.assessment_completed',
    'security_assurance.ai_data.finding_opened',
    'security_assurance.ai_data.posture_updated',
    'security_assurance.secure_compute.assessment_completed',
    'security_assurance.secure_compute.finding_opened',
    'security_assurance.secure_compute.posture_updated',
    'security_assurance.secure_compute.context_recorded'
  ));

ALTER TABLE security_assurance_secure_compute_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_assurance_secure_compute_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_assurance_secure_compute_control_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_assurance_secure_compute_snapshots ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'security_assurance_secure_compute_contexts',
    'security_assurance_secure_compute_assessments',
    'security_assurance_secure_compute_control_evidence',
    'security_assurance_secure_compute_snapshots'
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
