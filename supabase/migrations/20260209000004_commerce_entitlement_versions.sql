-- RTB Commerce Phase 2 — per-tenant entitlement version counters for distributed cache invalidation

CREATE TABLE IF NOT EXISTS commercial_entitlement_versions (
  tenant_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  version BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE commercial_entitlement_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY commercial_entitlement_versions_select ON commercial_entitlement_versions
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE OR REPLACE FUNCTION bump_commercial_entitlement_version(p_tenant_id UUID)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_version BIGINT;
BEGIN
  INSERT INTO commercial_entitlement_versions (tenant_id, version, updated_at)
  VALUES (p_tenant_id, 1, NOW())
  ON CONFLICT (tenant_id) DO UPDATE
    SET version = commercial_entitlement_versions.version + 1,
        updated_at = NOW()
  RETURNING version INTO v_version;
  RETURN v_version;
END;
$$;

COMMENT ON TABLE commercial_entitlement_versions IS
  'Monotonic per-tenant version stamp bumped on commerce mutations for entitlement cache invalidation.';
