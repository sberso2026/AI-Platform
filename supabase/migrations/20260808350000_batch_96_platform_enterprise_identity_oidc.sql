-- batch_96: Platform Enterprise Identity OIDC / Entra SSO foundation (Phase 16B)
-- Additive only. Platform Identity owned. Secrets referenced by ID only.
-- No SCIM. No SAML tables. No second auth runtime.

CREATE TABLE IF NOT EXISTS platform_enterprise_identity_providers (
  provider_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  provider_type text NOT NULL CHECK (provider_type IN (
    'microsoft_entra', 'generic_oidc', 'saml', 'okta', 'other'
  )),
  protocol text NOT NULL DEFAULT 'oidc' CHECK (protocol IN ('oidc')),
  issuer text NOT NULL,
  client_id text NOT NULL,
  client_secret_ref_id text NOT NULL,
  metadata_discovery_uri text,
  allowed_audience jsonb NOT NULL DEFAULT '[]'::jsonb,
  claim_mapping_policy_ref text,
  role_mapping_policy_ref text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'pending_verification', 'active', 'disabled', 'invalid', 'revoked'
  )),
  review_status text NOT NULL DEFAULT 'unreviewed' CHECK (review_status IN (
    'unreviewed', 'approved', 'rejected', 'expired'
  )),
  configuration_version integer NOT NULL DEFAULT 1,
  secret_reference_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  CONSTRAINT pei_provider_no_plaintext_secret CHECK (
    NOT (metadata ? 'client_secret')
    AND NOT (metadata ? 'clientSecret')
    AND NOT (metadata ? 'private_key')
  )
);

CREATE INDEX IF NOT EXISTS idx_pei_providers_tenant
  ON platform_enterprise_identity_providers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pei_providers_issuer
  ON platform_enterprise_identity_providers(tenant_id, issuer);

CREATE TABLE IF NOT EXISTS platform_enterprise_sso_policies (
  tenant_id uuid PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  mode text NOT NULL DEFAULT 'disabled' CHECK (mode IN (
    'disabled', 'optional', 'required',
    'required_for_privileged_users', 'required_for_all_users'
  )),
  fallback_behavior text NOT NULL DEFAULT 'deny' CHECK (fallback_behavior IN (
    'deny', 'local_auth_allowed', 'privileged_local_break_glass_only'
  )),
  password_fallback_when_required boolean NOT NULL DEFAULT false
    CONSTRAINT pei_no_password_fallback_when_required CHECK (
      password_fallback_when_required = false
    ),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS platform_enterprise_verified_domains (
  domain_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  provider_id text NOT NULL REFERENCES platform_enterprise_identity_providers(provider_id) ON DELETE CASCADE,
  domain text NOT NULL,
  verification_method text NOT NULL CHECK (verification_method IN (
    'dns_txt', 'https_well_known', 'governed_manual_review'
  )),
  verification_status text NOT NULL DEFAULT 'pending' CHECK (verification_status IN (
    'pending', 'verified', 'revoked', 'expired'
  )),
  verified_at timestamptz,
  review_at timestamptz,
  evidence_ref text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, domain)
);

CREATE INDEX IF NOT EXISTS idx_pei_domains_domain
  ON platform_enterprise_verified_domains(domain);
CREATE INDEX IF NOT EXISTS idx_pei_domains_tenant
  ON platform_enterprise_verified_domains(tenant_id);

CREATE TABLE IF NOT EXISTS platform_enterprise_identity_bindings (
  binding_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  provider_id text NOT NULL REFERENCES platform_enterprise_identity_providers(provider_id) ON DELETE CASCADE,
  issuer text NOT NULL,
  subject text NOT NULL,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email text,
  display_name text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN (
    'active', 'revoked', 'superseded'
  )),
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  verified_at timestamptz,
  revoked_at timestamptz,
  superseded_by text,
  reason text,
  UNIQUE (provider_id, issuer, subject, version)
);

CREATE INDEX IF NOT EXISTS idx_pei_bindings_user
  ON platform_enterprise_identity_bindings(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_pei_bindings_subject
  ON platform_enterprise_identity_bindings(issuer, subject);

CREATE TABLE IF NOT EXISTS platform_enterprise_role_mappings (
  mapping_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  provider_id text NOT NULL REFERENCES platform_enterprise_identity_providers(provider_id) ON DELETE CASCADE,
  external_group_or_claim text NOT NULL,
  rtb_role_slug text NOT NULL,
  privileged boolean NOT NULL DEFAULT false,
  review_status text NOT NULL DEFAULT 'unreviewed' CHECK (review_status IN (
    'unreviewed', 'approved', 'rejected'
  )),
  mapping_version text NOT NULL DEFAULT '1',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pei_role_maps_tenant
  ON platform_enterprise_role_mappings(tenant_id, provider_id);

CREATE TABLE IF NOT EXISTS platform_enterprise_identity_health (
  provider_id text PRIMARY KEY REFERENCES platform_enterprise_identity_providers(provider_id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'unknown' CHECK (status IN (
    'healthy', 'degraded', 'unavailable', 'invalid', 'unknown'
  )),
  discovery_available boolean NOT NULL DEFAULT false,
  jwks_available boolean NOT NULL DEFAULT false,
  metadata_valid boolean NOT NULL DEFAULT false,
  last_successful_auth_at timestamptz,
  last_validated_at timestamptz,
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform_enterprise_identity_outbox (
  event_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pei_outbox_no_secrets CHECK (
    NOT (payload ? 'secret')
    AND NOT (payload ? 'password')
    AND NOT (payload ? 'token')
    AND NOT (payload ? 'client_secret')
    AND NOT (payload ? 'clientSecret')
  )
);

-- RLS: tenant isolation
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'platform_enterprise_identity_providers',
    'platform_enterprise_sso_policies',
    'platform_enterprise_verified_domains',
    'platform_enterprise_identity_bindings',
    'platform_enterprise_role_mappings',
    'platform_enterprise_identity_health',
    'platform_enterprise_identity_outbox'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS %I_select ON %I', t, t);
    EXECUTE format(
      'CREATE POLICY %I_select ON %I FOR SELECT USING (tenant_id = ANY (get_user_tenant_ids()))',
      t, t
    );
    EXECUTE format('DROP POLICY IF EXISTS %I_write ON %I', t, t);
    EXECUTE format(
      'CREATE POLICY %I_write ON %I FOR ALL USING (tenant_id = ANY (get_user_tenant_ids())) WITH CHECK (tenant_id = ANY (get_user_tenant_ids()))',
      t, t
    );
  END LOOP;
END $$;
