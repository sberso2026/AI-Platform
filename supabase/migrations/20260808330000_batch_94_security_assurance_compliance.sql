-- batch_94: Security & Assurance Compliance Intelligence Foundation (Phase 15F)
-- Additive only. Does NOT rewrite batch_90–93.
-- Mapping/assessment only — does NOT claim certification or create duplicate control/evidence stores.

CREATE TABLE IF NOT EXISTS security_assurance_compliance_frameworks (
  framework_id text PRIMARY KEY CHECK (framework_id IN (
    'ISO27001_2022', 'NIST_CSF_2_0', 'ESSENTIAL_EIGHT', 'SOC2_TSC'
  )),
  name text NOT NULL,
  publisher text NOT NULL,
  description text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'draft', 'retired')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS security_assurance_compliance_framework_versions (
  framework_version_id text PRIMARY KEY,
  framework_id text NOT NULL REFERENCES security_assurance_compliance_frameworks(framework_id),
  version_label text NOT NULL,
  published_year int,
  provenance_ref text NOT NULL,
  registered_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS security_assurance_compliance_requirements (
  requirement_id text PRIMARY KEY,
  framework_id text NOT NULL,
  framework_version_id text NOT NULL,
  requirement_code text NOT NULL,
  title text NOT NULL,
  requires_external_assurance boolean NOT NULL DEFAULT false,
  external_assurance_types jsonb NOT NULL DEFAULT '[]'::jsonb,
  not_applicable_allowed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sa_comp_req_fw
  ON security_assurance_compliance_requirements(framework_id);

CREATE TABLE IF NOT EXISTS security_assurance_compliance_control_mappings (
  mapping_id text PRIMARY KEY,
  requirement_id text NOT NULL,
  control_id text NOT NULL,
  framework_id text NOT NULL,
  sole_control_infers_compliance boolean NOT NULL DEFAULT false
    CONSTRAINT sa_comp_cmap_no_sole CHECK (sole_control_infers_compliance = false),
  certified boolean NOT NULL DEFAULT false
    CONSTRAINT sa_comp_cmap_not_certified CHECK (certified = false),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sa_comp_cmap_req
  ON security_assurance_compliance_control_mappings(requirement_id);
CREATE INDEX IF NOT EXISTS idx_sa_comp_cmap_ctrl
  ON security_assurance_compliance_control_mappings(control_id);

CREATE TABLE IF NOT EXISTS security_assurance_compliance_assessments (
  assessment_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  requirement_id text NOT NULL,
  framework_id text NOT NULL,
  framework_version_id text NOT NULL,
  control_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL CHECK (status IN (
    'supported', 'partially_supported', 'unsupported', 'unknown',
    'not_assessed', 'not_applicable', 'requires_external_assurance'
  )),
  freshness text NOT NULL,
  assessor_source text NOT NULL,
  observed_at timestamptz NOT NULL,
  limitations text,
  review_status text NOT NULL,
  governed_review_action text NOT NULL DEFAULT 'security_assurance.compliance_review',
  certification_claimed boolean NOT NULL DEFAULT false
    CONSTRAINT sa_comp_assess_no_cert CHECK (certification_claimed = false),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sa_comp_assess_scope
  ON security_assurance_compliance_assessments(tenant_id, workspace_id);

CREATE TABLE IF NOT EXISTS security_assurance_compliance_gaps (
  gap_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  framework_id text NOT NULL,
  requirement_id text NOT NULL,
  missing_or_weak_control_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  missing_or_stale_evidence_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  severity text NOT NULL,
  priority text NOT NULL,
  external_assurance_dependency boolean NOT NULL DEFAULT false,
  recommended_human_action text NOT NULL,
  is_incident boolean NOT NULL DEFAULT false
    CONSTRAINT sa_comp_gap_not_incident CHECK (is_incident = false),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sa_comp_gap_scope
  ON security_assurance_compliance_gaps(tenant_id, workspace_id);

CREATE TABLE IF NOT EXISTS security_assurance_compliance_snapshots (
  snapshot_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  scope text NOT NULL,
  captured_at timestamptz NOT NULL,
  frameworks jsonb NOT NULL DEFAULT '[]'::jsonb,
  isolation_dimension_preserved boolean NOT NULL DEFAULT true
    CONSTRAINT sa_comp_snap_iso CHECK (isolation_dimension_preserved = true),
  ai_data_dimension_preserved boolean NOT NULL DEFAULT true
    CONSTRAINT sa_comp_snap_aid CHECK (ai_data_dimension_preserved = true),
  secure_compute_dimension_preserved boolean NOT NULL DEFAULT true
    CONSTRAINT sa_comp_snap_sc CHECK (secure_compute_dimension_preserved = true),
  universal_score_present boolean NOT NULL DEFAULT false
    CONSTRAINT sa_comp_snap_no_score CHECK (universal_score_present = false),
  certification_claimed boolean NOT NULL DEFAULT false
    CONSTRAINT sa_comp_snap_no_cert CHECK (certification_claimed = false),
  iso27001_certified_claimed boolean NOT NULL DEFAULT false
    CONSTRAINT sa_comp_snap_no_iso CHECK (iso27001_certified_claimed = false),
  soc2_compliant_claimed boolean NOT NULL DEFAULT false
    CONSTRAINT sa_comp_snap_no_soc2 CHECK (soc2_compliant_claimed = false),
  automatic_remediation_enabled boolean NOT NULL DEFAULT false
    CONSTRAINT sa_comp_snap_no_remediation CHECK (automatic_remediation_enabled = false),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sa_comp_snap_scope
  ON security_assurance_compliance_snapshots(tenant_id, workspace_id);

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
    'security_assurance.secure_compute.context_recorded',
    'security_assurance.compliance.assessment_completed',
    'security_assurance.compliance.gap_opened',
    'security_assurance.compliance.posture_updated',
    'security_assurance.compliance.framework_registered'
  ));

ALTER TABLE security_assurance_compliance_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_assurance_compliance_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_assurance_compliance_snapshots ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'security_assurance_compliance_assessments',
    'security_assurance_compliance_gaps',
    'security_assurance_compliance_snapshots'
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

GRANT ALL ON security_assurance_compliance_frameworks TO anon, authenticated, service_role;
GRANT ALL ON security_assurance_compliance_framework_versions TO anon, authenticated, service_role;
GRANT ALL ON security_assurance_compliance_requirements TO anon, authenticated, service_role;
GRANT ALL ON security_assurance_compliance_control_mappings TO anon, authenticated, service_role;
