-- EOS 2.20R canonical GA entitlement grants for EOS 2.
-- Billing-independent authorization record. Legacy engineering-os entitlement does not create rows.
-- Additive. Fail closed: absence of an active grant means EOS 2 product entitlement is denied.

CREATE TABLE IF NOT EXISTS eos2_ga_entitlements (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id      UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  product_key       TEXT NOT NULL CHECK (product_key = 'eos-2'),
  status            TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'suspended', 'revoked', 'expired')),
  grant_source      TEXT NOT NULL
                    CHECK (grant_source IN (
                      'COMMERCIAL_SUBSCRIPTION',
                      'COMMERCIAL_TRIAL',
                      'INTERNAL_VALIDATION',
                      'COMPLIMENTARY'
                    )),
  classification    TEXT NOT NULL DEFAULT 'standard'
                    CHECK (classification IN ('standard', 'INTERNAL_GA_VALIDATION', 'controlled_pilot')),
  valid_from        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until       TIMESTAMPTZ,
  suspended_at      TIMESTAMPTZ,
  revoked_at        TIMESTAMPTZ,
  reason            TEXT NOT NULL,
  granted_by        UUID,
  authority_role    TEXT NOT NULL,
  metadata          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, workspace_id, product_key)
);

CREATE INDEX IF NOT EXISTS idx_eos2_ga_entitlements_ws
  ON eos2_ga_entitlements (tenant_id, workspace_id)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_eos2_ga_entitlements_product
  ON eos2_ga_entitlements (product_key, status);

DROP TRIGGER IF EXISTS eos2_ga_entitlements_updated_at ON eos2_ga_entitlements;
CREATE TRIGGER eos2_ga_entitlements_updated_at
  BEFORE UPDATE ON eos2_ga_entitlements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE eos2_ga_entitlements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos2_ga_entitlements_select ON eos2_ga_entitlements;
CREATE POLICY eos2_ga_entitlements_select ON eos2_ga_entitlements
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos2_ga_entitlements_insert ON eos2_ga_entitlements;
CREATE POLICY eos2_ga_entitlements_insert ON eos2_ga_entitlements
  FOR INSERT WITH CHECK (has_permission('tenant', 'admin', tenant_id));

DROP POLICY IF EXISTS eos2_ga_entitlements_update ON eos2_ga_entitlements;
CREATE POLICY eos2_ga_entitlements_update ON eos2_ga_entitlements
  FOR UPDATE USING (has_permission('tenant', 'admin', tenant_id))
  WITH CHECK (has_permission('tenant', 'admin', tenant_id));

COMMENT ON TABLE eos2_ga_entitlements IS
  'Canonical EOS 2 GA entitlement grants. product_key must be eos-2. Does not auto-enable from legacy engineering-os entitlement. Authorization is billing-independent.';

CREATE TABLE IF NOT EXISTS eos2_ga_entitlement_audit (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entitlement_id  UUID REFERENCES eos2_ga_entitlements(id) ON DELETE SET NULL,
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  product_key     TEXT NOT NULL,
  action          TEXT NOT NULL,
  actor_id        UUID,
  authority_role  TEXT NOT NULL,
  detail          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eos2_ga_entitlement_audit_ws
  ON eos2_ga_entitlement_audit (tenant_id, workspace_id, created_at DESC);

ALTER TABLE eos2_ga_entitlement_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos2_ga_entitlement_audit_select ON eos2_ga_entitlement_audit;
CREATE POLICY eos2_ga_entitlement_audit_select ON eos2_ga_entitlement_audit
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos2_ga_entitlement_audit_insert ON eos2_ga_entitlement_audit;
CREATE POLICY eos2_ga_entitlement_audit_insert ON eos2_ga_entitlement_audit
  FOR INSERT WITH CHECK (has_permission('tenant', 'admin', tenant_id));

COMMENT ON TABLE eos2_ga_entitlement_audit IS
  'Append-oriented audit of EOS 2 GA entitlement grants, suspensions, and revocations.';
