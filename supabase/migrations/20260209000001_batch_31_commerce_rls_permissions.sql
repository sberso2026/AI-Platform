-- RTB Platform Commerce Phase 2 — RLS for new tables + commerce permission seeds

-- Platform admin helper (required by catalogue and outbox policies below)
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'platform_admin')::boolean,
    false
  )
  OR COALESCE(auth.jwt() ->> 'role', '') = 'service_role';
$$;

ALTER TABLE commercial_seat_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_product_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_application_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_plan_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_subscription_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_entitlement_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_outbox_events ENABLE ROW LEVEL SECURITY;

-- Seat assignments
CREATE POLICY commercial_seat_assignments_select ON commercial_seat_assignments
  FOR SELECT USING (
    deleted_at IS NULL
    AND tenant_id = ANY(get_user_tenant_ids())
  );

CREATE POLICY commercial_seat_assignments_write ON commercial_seat_assignments
  FOR ALL USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('commerce', 'admin', tenant_id)
  )
  WITH CHECK (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('commerce', 'admin', tenant_id)
  );

-- Global catalog tables
CREATE POLICY commercial_plan_entitlements_select ON commercial_plan_entitlements
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY commercial_plan_entitlements_write ON commercial_plan_entitlements
  FOR ALL USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

CREATE POLICY commercial_features_select ON commercial_features
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY commercial_features_write ON commercial_features
  FOR ALL USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

CREATE POLICY commercial_product_applications_select ON commercial_product_applications
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY commercial_product_applications_write ON commercial_product_applications
  FOR ALL USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

CREATE POLICY commercial_application_features_select ON commercial_application_features
  FOR SELECT USING (true);

CREATE POLICY commercial_application_features_write ON commercial_application_features
  FOR ALL USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

-- Subscription changes
CREATE POLICY commercial_subscription_changes_select ON commercial_subscription_changes
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY commercial_subscription_changes_write ON commercial_subscription_changes
  FOR ALL USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('commerce', 'admin', tenant_id)
  )
  WITH CHECK (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('commerce', 'admin', tenant_id)
  );

-- Entitlement overrides
CREATE POLICY commercial_entitlement_overrides_select ON commercial_entitlement_overrides
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY commercial_entitlement_overrides_write ON commercial_entitlement_overrides
  FOR ALL USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('commerce', 'admin', tenant_id)
  )
  WITH CHECK (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('commerce', 'admin', tenant_id)
  );

-- Outbox: platform admin only
CREATE POLICY commercial_outbox_events_select ON commercial_outbox_events
  FOR SELECT USING (is_platform_admin());

CREATE POLICY commercial_outbox_events_write ON commercial_outbox_events
  FOR ALL USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

-- Backfill commerce permissions on existing roles (do not replace create_default_tenant_roles)

UPDATE roles
SET permissions = permissions || jsonb_build_array(
  jsonb_build_object('resource', 'commerce', 'action', 'admin'),
  jsonb_build_object('resource', 'commerce', 'action', 'read'),
  jsonb_build_object('resource', 'commerce', 'action', 'manage_subscriptions'),
  jsonb_build_object('resource', 'commerce', 'action', 'manage_licences'),
  jsonb_build_object('resource', 'commerce', 'action', 'manage_seats'),
  jsonb_build_object('resource', 'commerce', 'action', 'manage_trials'),
  jsonb_build_object('resource', 'commerce', 'action', 'manage_billing'),
  jsonb_build_object('resource', 'commerce', 'action', 'manage_overrides'),
  jsonb_build_object('resource', 'commerce', 'action', 'manage_products'),
  jsonb_build_object('resource', 'commerce', 'action', 'manage_marketplace')
)
WHERE slug = 'admin'
  AND NOT permissions @> jsonb_build_array(jsonb_build_object('resource', 'commerce', 'action', 'admin'));

UPDATE roles
SET permissions = permissions || jsonb_build_array(
  jsonb_build_object('resource', 'commerce', 'action', 'read')
)
WHERE slug IN ('member', 'viewer', 'engineer', 'engineering-owner', 'engineering-manager')
  AND NOT permissions @> jsonb_build_array(jsonb_build_object('resource', 'commerce', 'action', 'read'));
