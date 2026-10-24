-- batch_90: Security & Assurance Control/Evidence/Assessment Foundation (Phase 15B)
-- Additive only. Platform-level Sec&A persistence. No SIEM/Trust Center/second engines.
-- Evidence stores metadata/refs only — no sensitive payloads.
-- Uses Platform Files refs when artifacts required.

-- ---------------------------------------------------------------------------
-- Controls (catalogue)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS security_assurance_controls (
  control_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title text NOT NULL,
  objective text NOT NULL,
  category text NOT NULL,
  lifecycle text NOT NULL DEFAULT 'draft' CHECK (lifecycle IN (
    'draft', 'active', 'deprecated', 'retired'
  )),
  owner_domain text NOT NULL CHECK (owner_domain IN (
    'security_assurance', 'platform_core', 'ops', 'external'
  )),
  defined_only boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_sa_controls_scope
  ON security_assurance_controls(tenant_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_sa_controls_lifecycle
  ON security_assurance_controls(lifecycle);

-- ---------------------------------------------------------------------------
-- Control implementation references (pointers only)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS security_assurance_control_implementations (
  implementation_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  control_id text NOT NULL REFERENCES security_assurance_controls(control_id) ON DELETE CASCADE,
  owner text NOT NULL,
  capability_ref text NOT NULL,
  version text NOT NULL,
  scope text NOT NULL,
  authoritative boolean NOT NULL DEFAULT true
    CONSTRAINT sa_impl_authoritative CHECK (authoritative = true),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sa_impl_scope
  ON security_assurance_control_implementations(tenant_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_sa_impl_control
  ON security_assurance_control_implementations(control_id);

-- ---------------------------------------------------------------------------
-- Evidence references (no sensitive payloads)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS security_assurance_evidence (
  evidence_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  control_id text NOT NULL REFERENCES security_assurance_controls(control_id) ON DELETE CASCADE,
  source_type text NOT NULL,
  source_ref text NOT NULL,
  scope text NOT NULL,
  collector text NOT NULL,
  collected_at timestamptz NOT NULL,
  effective_at timestamptz NOT NULL,
  expires_at timestamptz,
  freshness text NOT NULL CHECK (freshness IN (
    'current', 'stale', 'expired', 'missing', 'invalid', 'conflicting', 'unknown'
  )),
  status text NOT NULL CHECK (status IN (
    'current', 'stale', 'expired', 'missing', 'invalid', 'conflicting', 'unknown'
  )),
  integrity_ref text,
  classification text NOT NULL CHECK (classification IN (
    'PUBLIC', 'INTERNAL', 'CLIENT_CONFIDENTIAL', 'ENGINEERING_SENSITIVE', 'RESTRICTED'
  )),
  provenance jsonb NOT NULL DEFAULT '{"observed":true,"inferred":false,"fabricated":false}'::jsonb,
  limitations text,
  platform_file_ref text,
  contains_sensitive_payload boolean NOT NULL DEFAULT false
    CONSTRAINT sa_evidence_no_sensitive CHECK (contains_sensitive_payload = false),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sa_evidence_scope
  ON security_assurance_evidence(tenant_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_sa_evidence_control
  ON security_assurance_evidence(control_id);

-- ---------------------------------------------------------------------------
-- Assessments
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS security_assurance_assessments (
  assessment_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  control_id text NOT NULL REFERENCES security_assurance_controls(control_id) ON DELETE CASCADE,
  scope text NOT NULL,
  result text NOT NULL CHECK (result IN (
    'pass', 'partial', 'fail', 'not_applicable', 'unknown'
  )),
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  assessment_method text NOT NULL CHECK (assessment_method IN (
    'automated_candidate', 'human_governed', 'reproducible_rule'
  )),
  assessed_at timestamptz NOT NULL,
  limitations text,
  review_status text NOT NULL CHECK (review_status IN (
    'candidate', 'pending_review', 'approved', 'rejected'
  )),
  provenance jsonb NOT NULL DEFAULT '{"reproducibleFromEvidence":true,"aiSelfApproval":false,"governedReviewRequired":true}'::jsonb,
  reviewed_by text,
  reviewed_at timestamptz,
  ai_self_approval boolean NOT NULL DEFAULT false
    CONSTRAINT sa_assess_no_ai_self CHECK (ai_self_approval = false),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sa_assess_scope
  ON security_assurance_assessments(tenant_id, workspace_id);

-- ---------------------------------------------------------------------------
-- Findings (normalized; not SIEM)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS security_assurance_findings (
  finding_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  control_id text REFERENCES security_assurance_controls(control_id) ON DELETE SET NULL,
  severity text NOT NULL CHECK (severity IN (
    'critical', 'high', 'medium', 'low', 'informational', 'unknown'
  )),
  state text NOT NULL CHECK (state IN (
    'open', 'accepted', 'remediation_planned', 'remediated', 'closed', 'false_positive'
  )),
  source text NOT NULL,
  summary text NOT NULL,
  normalized_at timestamptz NOT NULL,
  is_incident boolean NOT NULL DEFAULT false
    CONSTRAINT sa_finding_neq_incident CHECK (is_incident = false),
  contains_sensitive_payload boolean NOT NULL DEFAULT false
    CONSTRAINT sa_finding_no_sensitive CHECK (contains_sensitive_payload = false),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sa_findings_scope
  ON security_assurance_findings(tenant_id, workspace_id);

-- ---------------------------------------------------------------------------
-- Exceptions (time-bounded; no AI approval)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS security_assurance_exceptions (
  exception_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  control_ref text NOT NULL,
  scope text NOT NULL,
  reason text NOT NULL,
  owner text NOT NULL,
  approved_by text NOT NULL,
  approved_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  review_status text NOT NULL CHECK (review_status IN (
    'active', 'expired', 'revoked', 'pending_review'
  )),
  ai_approved boolean NOT NULL DEFAULT false
    CONSTRAINT sa_exception_no_ai CHECK (ai_approved = false),
  permanent_implicit boolean NOT NULL DEFAULT false
    CONSTRAINT sa_exception_no_permanent CHECK (permanent_implicit = false),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sa_exceptions_scope
  ON security_assurance_exceptions(tenant_id, workspace_id);

-- ---------------------------------------------------------------------------
-- Posture snapshots (dimensional; no universal score)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS security_assurance_posture_snapshots (
  snapshot_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  scope text NOT NULL,
  captured_at timestamptz NOT NULL,
  dimensions jsonb NOT NULL DEFAULT '[]'::jsonb,
  universal_score_present boolean NOT NULL DEFAULT false
    CONSTRAINT sa_posture_no_universal CHECK (universal_score_present = false),
  universal_numeric_score numeric
    CONSTRAINT sa_posture_score_null CHECK (universal_numeric_score IS NULL),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sa_posture_scope
  ON security_assurance_posture_snapshots(tenant_id, workspace_id);

-- ---------------------------------------------------------------------------
-- Framework mappings (≠ certification)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS security_assurance_framework_mappings (
  mapping_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  control_id text NOT NULL REFERENCES security_assurance_controls(control_id) ON DELETE CASCADE,
  framework_id text NOT NULL CHECK (framework_id IN (
    'ISO27001', 'NIST_CSF_2', 'ESSENTIAL_EIGHT', 'SOC2_TSC_RESERVED'
  )),
  framework_requirement_ref text NOT NULL,
  mapping_note text,
  certified boolean NOT NULL DEFAULT false
    CONSTRAINT sa_mapping_not_certified CHECK (certified = false),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sa_mappings_scope
  ON security_assurance_framework_mappings(tenant_id, workspace_id);

-- ---------------------------------------------------------------------------
-- External assurance metadata only
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS security_assurance_external_refs (
  assurance_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  assurance_type text NOT NULL CHECK (assurance_type IN (
    'penetration_test', 'iso_certification', 'soc_report',
    'essential_eight_assessment', 'customer_audit', 'other_independent'
  )),
  status text NOT NULL CHECK (status IN (
    'not_obtained', 'in_progress', 'obtained', 'expired'
  )),
  reference_ref text,
  is_external_opinion boolean NOT NULL DEFAULT true
    CONSTRAINT sa_ext_opinion CHECK (is_external_opinion = true),
  generated_by_security_assurance boolean NOT NULL DEFAULT false
    CONSTRAINT sa_ext_not_generated CHECK (generated_by_security_assurance = false),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sa_external_scope
  ON security_assurance_external_refs(tenant_id, workspace_id);

-- ---------------------------------------------------------------------------
-- Append-only domain timeline
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS security_assurance_timeline_events (
  event_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  actor_id text,
  summary text NOT NULL,
  refs jsonb NOT NULL DEFAULT '{}'::jsonb,
  append_only boolean NOT NULL DEFAULT true
    CONSTRAINT sa_timeline_append_only CHECK (append_only = true),
  overwrites_prior_event boolean NOT NULL DEFAULT false
    CONSTRAINT sa_timeline_no_overwrite CHECK (overwrites_prior_event = false),
  contains_sensitive_payload boolean NOT NULL DEFAULT false
    CONSTRAINT sa_timeline_no_sensitive CHECK (contains_sensitive_payload = false)
);

CREATE INDEX IF NOT EXISTS idx_sa_timeline_scope
  ON security_assurance_timeline_events(tenant_id, workspace_id);

-- ---------------------------------------------------------------------------
-- Domain outbox (Platform Event Bus integration)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS security_assurance_outbox_events (
  outbox_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN (
    'security_assurance.evidence_recorded',
    'security_assurance.assessment_completed',
    'security_assurance.finding_opened',
    'security_assurance.exception_changed',
    'security_assurance.posture_published'
  )),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sa_outbox_no_sensitive_marker CHECK (
    NOT (payload ? 'secret') AND NOT (payload ? 'password') AND NOT (payload ? 'token')
  )
);

CREATE INDEX IF NOT EXISTS idx_sa_outbox_scope
  ON security_assurance_outbox_events(tenant_id, workspace_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE security_assurance_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_assurance_control_implementations ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_assurance_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_assurance_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_assurance_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_assurance_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_assurance_posture_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_assurance_framework_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_assurance_external_refs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_assurance_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_assurance_outbox_events ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'security_assurance_controls',
    'security_assurance_control_implementations',
    'security_assurance_evidence',
    'security_assurance_assessments',
    'security_assurance_findings',
    'security_assurance_exceptions',
    'security_assurance_posture_snapshots',
    'security_assurance_framework_mappings',
    'security_assurance_external_refs',
    'security_assurance_timeline_events',
    'security_assurance_outbox_events'
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
