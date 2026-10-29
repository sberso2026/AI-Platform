-- EOS 3.1 foundation: development entitlement + enrollment scaffolding.
-- Additive. Compatible with EOS 2. Does not enable EOS 3 in Production by itself.
-- Fail closed: absence of active eos-3 grant + DEVELOPMENT/STAGING/PILOT enrollment => deny.

CREATE TABLE IF NOT EXISTS eos3_dev_entitlements (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id      UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  product_key       TEXT NOT NULL CHECK (product_key = 'eos-3'),
  status            TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'suspended', 'revoked', 'expired')),
  grant_source      TEXT NOT NULL
                    CHECK (grant_source IN (
                      'INTERNAL_VALIDATION',
                      'INTERNAL_DEVELOPMENT',
                      'COMPLIMENTARY'
                    )),
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

CREATE INDEX IF NOT EXISTS idx_eos3_dev_entitlements_ws
  ON eos3_dev_entitlements (tenant_id, workspace_id)
  WHERE status = 'active';

DROP TRIGGER IF EXISTS eos3_dev_entitlements_updated_at ON eos3_dev_entitlements;
CREATE TRIGGER eos3_dev_entitlements_updated_at
  BEFORE UPDATE ON eos3_dev_entitlements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE eos3_dev_entitlements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_dev_entitlements_select ON eos3_dev_entitlements;
CREATE POLICY eos3_dev_entitlements_select ON eos3_dev_entitlements
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_dev_entitlements_insert ON eos3_dev_entitlements;
CREATE POLICY eos3_dev_entitlements_insert ON eos3_dev_entitlements
  FOR INSERT WITH CHECK (has_permission('tenant', 'admin', tenant_id));

DROP POLICY IF EXISTS eos3_dev_entitlements_update ON eos3_dev_entitlements;
CREATE POLICY eos3_dev_entitlements_update ON eos3_dev_entitlements
  FOR UPDATE USING (has_permission('tenant', 'admin', tenant_id))
  WITH CHECK (has_permission('tenant', 'admin', tenant_id));

COMMENT ON TABLE eos3_dev_entitlements IS
  'EOS 3 development entitlements. product_key=eos-3. EOS 2 grants do not create or imply rows. Production access remains denied by application policy in EOS 3.1.';

CREATE TABLE IF NOT EXISTS eos3_dev_enrollment (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id      UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  state             TEXT NOT NULL DEFAULT 'NOT_ELIGIBLE'
                    CHECK (state IN ('NOT_ELIGIBLE', 'DEVELOPMENT', 'STAGING', 'PILOT')),
  reason            TEXT NOT NULL,
  enrolled_by       UUID,
  authority_role    TEXT NOT NULL,
  metadata          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, workspace_id)
);

CREATE INDEX IF NOT EXISTS idx_eos3_dev_enrollment_ws
  ON eos3_dev_enrollment (tenant_id, workspace_id);

DROP TRIGGER IF EXISTS eos3_dev_enrollment_updated_at ON eos3_dev_enrollment;
CREATE TRIGGER eos3_dev_enrollment_updated_at
  BEFORE UPDATE ON eos3_dev_enrollment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE eos3_dev_enrollment ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_dev_enrollment_select ON eos3_dev_enrollment;
CREATE POLICY eos3_dev_enrollment_select ON eos3_dev_enrollment
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_dev_enrollment_insert ON eos3_dev_enrollment;
CREATE POLICY eos3_dev_enrollment_insert ON eos3_dev_enrollment
  FOR INSERT WITH CHECK (has_permission('tenant', 'admin', tenant_id));

DROP POLICY IF EXISTS eos3_dev_enrollment_update ON eos3_dev_enrollment;
CREATE POLICY eos3_dev_enrollment_update ON eos3_dev_enrollment
  FOR UPDATE USING (has_permission('tenant', 'admin', tenant_id))
  WITH CHECK (has_permission('tenant', 'admin', tenant_id));

COMMENT ON TABLE eos3_dev_enrollment IS
  'EOS 3 development enrollment states. EOS 2 enrollment does not auto-enable. No Production GA states.';

CREATE TABLE IF NOT EXISTS eos3_foundation_audit (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  action          TEXT NOT NULL,
  actor_id        UUID,
  authority_role  TEXT NOT NULL,
  detail          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eos3_foundation_audit_ws
  ON eos3_foundation_audit (tenant_id, workspace_id, created_at DESC);

ALTER TABLE eos3_foundation_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_foundation_audit_select ON eos3_foundation_audit;
CREATE POLICY eos3_foundation_audit_select ON eos3_foundation_audit
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_foundation_audit_insert ON eos3_foundation_audit;
CREATE POLICY eos3_foundation_audit_insert ON eos3_foundation_audit
  FOR INSERT WITH CHECK (has_permission('tenant', 'admin', tenant_id));

COMMENT ON TABLE eos3_foundation_audit IS
  'Audit of EOS 3.1 foundation entitlement/enrollment actions.';
