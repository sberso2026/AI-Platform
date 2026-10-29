-- batch_95: Security & Assurance Customer Assurance (Phase 15G)
-- Additive only. Does NOT rewrite batch_90–94.
-- Approved customer-safe disclosure metadata only — not Trust Center / certification.

CREATE TABLE IF NOT EXISTS security_assurance_customer_profiles (
  profile_id text PRIMARY KEY,
  version text NOT NULL,
  scope text NOT NULL,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  categories jsonb NOT NULL DEFAULT '[]'::jsonb,
  approved_claim_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  approved_document_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  disclosure_level text NOT NULL,
  review_status text NOT NULL,
  effective_at timestamptz NOT NULL,
  expires_at timestamptz,
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  certification_claimed boolean NOT NULL DEFAULT false
    CONSTRAINT sa_ca_profile_no_cert CHECK (certification_claimed = false),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS security_assurance_customer_claims (
  claim_id text PRIMARY KEY,
  version text NOT NULL,
  claim_type text NOT NULL,
  statement_key text NOT NULL,
  statement text NOT NULL,
  scope text NOT NULL,
  control_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  external_assurance_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  disclosure_level text NOT NULL,
  status text NOT NULL CHECK (status IN (
    'supported', 'partially_supported', 'unsupported', 'unknown',
    'not_applicable', 'not_disclosed', 'requires_external_assurance',
    'stale', 'requires_review'
  )),
  review_status text NOT NULL,
  effective_at timestamptz NOT NULL,
  expires_at timestamptz,
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  certification_wording_forbidden boolean NOT NULL DEFAULT true
    CONSTRAINT sa_ca_claim_no_cert_wording CHECK (certification_wording_forbidden = true),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS security_assurance_customer_packages (
  package_id text PRIMARY KEY,
  version text NOT NULL,
  scope text NOT NULL,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  profile_id text NOT NULL,
  claim_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  document_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  disclosure_level text NOT NULL,
  review_status text NOT NULL,
  published_at timestamptz,
  effective_at timestamptz NOT NULL,
  expires_at timestamptz,
  immutable_once_published boolean NOT NULL DEFAULT true
    CONSTRAINT sa_ca_pkg_immutable CHECK (immutable_once_published = true),
  certification_claimed boolean NOT NULL DEFAULT false
    CONSTRAINT sa_ca_pkg_no_cert CHECK (certification_claimed = false),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sa_ca_pkg_tenant
  ON security_assurance_customer_packages(tenant_id);

CREATE TABLE IF NOT EXISTS security_assurance_customer_disclosures (
  disclosure_id text PRIMARY KEY,
  actor_id text NOT NULL,
  audience text NOT NULL,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  claim_or_package_ref text NOT NULL,
  version text NOT NULL,
  policy_decision_ref text NOT NULL,
  disclosed_at timestamptz NOT NULL,
  result text NOT NULL CHECK (result IN ('allowed', 'denied', 'redacted')),
  contains_sensitive_payload boolean NOT NULL DEFAULT false
    CONSTRAINT sa_ca_disc_no_sensitive CHECK (contains_sensitive_payload = false),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sa_ca_disc_tenant
  ON security_assurance_customer_disclosures(tenant_id);

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
    'security_assurance.compliance.framework_registered',
    'security_assurance.customer.claim_approved',
    'security_assurance.customer.package_published',
    'security_assurance.customer.package_accessed',
    'security_assurance.customer.document_disclosed'
  ));

ALTER TABLE security_assurance_customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_assurance_customer_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_assurance_customer_disclosures ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'security_assurance_customer_profiles',
    'security_assurance_customer_packages',
    'security_assurance_customer_disclosures'
  ]
  LOOP
    EXECUTE format('GRANT ALL ON %I TO anon, authenticated, service_role', t);

    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_select', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR SELECT USING (
         tenant_id IS NULL
         OR (
           tenant_id = ANY(get_user_tenant_ids())
         )
       )',
      t || '_select', t
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_insert', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR INSERT WITH CHECK (
         tenant_id IS NULL
         OR tenant_id = ANY(get_user_tenant_ids())
       )',
      t || '_insert', t
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_update', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR UPDATE USING (
         tenant_id IS NULL
         OR tenant_id = ANY(get_user_tenant_ids())
       )',
      t || '_update', t
    );
  END LOOP;
END $$;

GRANT ALL ON security_assurance_customer_claims TO anon, authenticated, service_role;
