-- batch_92: Security & Assurance AI & Data Security Assurance (Phase 15D)
-- Additive only. Does NOT rewrite batch_90/91.
-- Observes/assesses AI/data security — does NOT create AI stack/DLP/secrets vault.
-- Evidence refs/status only — no raw secrets.

CREATE TABLE IF NOT EXISTS security_assurance_ai_data_flows (
  flow_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  plane text NOT NULL CHECK (plane IN (
    'DATA_INGESTION', 'DATA_STORAGE', 'RETRIEVAL', 'AI_CONTEXT', 'PROMPT',
    'MODEL_PROVIDER', 'TOOL_INPUT', 'TOOL_OUTPUT', 'MODEL_OUTPUT',
    'PERSISTENCE', 'LOGGING_TELEMETRY', 'DATA_EGRESS'
  )),
  source text NOT NULL,
  classification text NOT NULL CHECK (classification IN (
    'public', 'internal', 'confidential', 'restricted', 'unknown'
  )),
  purpose text NOT NULL,
  destination text NOT NULL,
  provider_id text,
  model_id text,
  model_version text,
  tool_id text,
  policy_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  provenance_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  decision text NOT NULL CHECK (decision IN ('allow', 'deny', 'unknown')),
  status text NOT NULL CHECK (status IN (
    'pass', 'fail', 'partial', 'not_applicable', 'unknown', 'not_assessed', 'error'
  )),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  contains_raw_secret boolean NOT NULL DEFAULT false
    CONSTRAINT sa_aid_flow_no_secret CHECK (contains_raw_secret = false),
  contains_sensitive_payload boolean NOT NULL DEFAULT false
    CONSTRAINT sa_aid_flow_no_sensitive CHECK (contains_sensitive_payload = false),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sa_aid_flows_scope
  ON security_assurance_ai_data_flows(tenant_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_sa_aid_flows_plane
  ON security_assurance_ai_data_flows(plane);

CREATE TABLE IF NOT EXISTS security_assurance_ai_data_assessments (
  assessment_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  plane text NOT NULL,
  scope text NOT NULL,
  flow_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  result text NOT NULL CHECK (result IN (
    'pass', 'fail', 'partial', 'not_applicable', 'unknown', 'not_assessed', 'error'
  )),
  freshness text NOT NULL,
  limitations text,
  finding_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  assessed_at timestamptz NOT NULL,
  review_status text NOT NULL CHECK (review_status IN (
    'candidate', 'pending_review', 'approved', 'rejected'
  )),
  governed_review_action text NOT NULL DEFAULT 'security_assurance.ai_data_review',
  error_cannot_become_pass boolean NOT NULL DEFAULT true
    CONSTRAINT sa_aid_assess_no_error_pass CHECK (error_cannot_become_pass = true),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sa_aid_assess_scope
  ON security_assurance_ai_data_assessments(tenant_id, workspace_id);

CREATE TABLE IF NOT EXISTS security_assurance_ai_data_provider_assessments (
  assessment_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  provider_id text NOT NULL,
  model_id text,
  model_version text,
  approved_status text NOT NULL CHECK (approved_status IN (
    'approved', 'unknown', 'unapproved'
  )),
  data_handling_policy_ref text,
  retention_training_posture text,
  egress_classification text NOT NULL,
  result text NOT NULL,
  assessed_at timestamptz NOT NULL,
  fabricated_pass_forbidden boolean NOT NULL DEFAULT true
    CONSTRAINT sa_aid_prov_no_fabricated CHECK (fabricated_pass_forbidden = true),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sa_aid_prov_scope
  ON security_assurance_ai_data_provider_assessments(tenant_id, workspace_id);

CREATE TABLE IF NOT EXISTS security_assurance_ai_data_snapshots (
  snapshot_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  scope text NOT NULL,
  captured_at timestamptz NOT NULL,
  planes jsonb NOT NULL DEFAULT '[]'::jsonb,
  overall_result text NOT NULL,
  isolation_dimension_preserved boolean NOT NULL DEFAULT true
    CONSTRAINT sa_aid_snap_iso_preserved CHECK (isolation_dimension_preserved = true),
  universal_score_present boolean NOT NULL DEFAULT false
    CONSTRAINT sa_aid_snap_no_score CHECK (universal_score_present = false),
  prompt_injection_completely_prevented_claimed boolean NOT NULL DEFAULT false
    CONSTRAINT sa_aid_snap_no_injection_claim CHECK (prompt_injection_completely_prevented_claimed = false),
  known_sensitive_data_leakage_detected boolean NOT NULL DEFAULT false
    CONSTRAINT sa_aid_snap_no_leak CHECK (known_sensitive_data_leakage_detected = false),
  automatic_remediation_enabled boolean NOT NULL DEFAULT false
    CONSTRAINT sa_aid_snap_no_remediation CHECK (automatic_remediation_enabled = false),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sa_aid_snap_scope
  ON security_assurance_ai_data_snapshots(tenant_id, workspace_id);

-- Extend outbox event types
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
    'security_assurance.ai_data.posture_updated'
  ));

ALTER TABLE security_assurance_ai_data_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_assurance_ai_data_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_assurance_ai_data_provider_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_assurance_ai_data_snapshots ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'security_assurance_ai_data_flows',
    'security_assurance_ai_data_assessments',
    'security_assurance_ai_data_provider_assessments',
    'security_assurance_ai_data_snapshots'
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
