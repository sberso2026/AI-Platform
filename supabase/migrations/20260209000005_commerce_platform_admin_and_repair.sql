-- Repair migration: define is_platform_admin() and complete Phase 2 RLS policies
-- Required because 20260209000001 failed mid-apply when is_platform_admin() was missing.

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

COMMENT ON FUNCTION public.is_platform_admin() IS
  'Platform operator bypass for global commerce catalogue and outbox. Set app_metadata.platform_admin=true for RTB staff.';

-- Idempotent policy completion (statements that may have failed in 000001)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'commercial_plan_entitlements'
      AND policyname = 'commercial_plan_entitlements_write'
  ) THEN
    CREATE POLICY commercial_plan_entitlements_write ON commercial_plan_entitlements
      FOR ALL USING (is_platform_admin())
      WITH CHECK (is_platform_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'commercial_features'
      AND policyname = 'commercial_features_write'
  ) THEN
    CREATE POLICY commercial_features_write ON commercial_features
      FOR ALL USING (is_platform_admin())
      WITH CHECK (is_platform_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'commercial_product_applications'
      AND policyname = 'commercial_product_applications_write'
  ) THEN
    CREATE POLICY commercial_product_applications_write ON commercial_product_applications
      FOR ALL USING (is_platform_admin())
      WITH CHECK (is_platform_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'commercial_application_features'
      AND policyname = 'commercial_application_features_write'
  ) THEN
    CREATE POLICY commercial_application_features_write ON commercial_application_features
      FOR ALL USING (is_platform_admin())
      WITH CHECK (is_platform_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'commercial_subscription_changes'
      AND policyname = 'commercial_subscription_changes_select'
  ) THEN
    CREATE POLICY commercial_subscription_changes_select ON commercial_subscription_changes
      FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'commercial_subscription_changes'
      AND policyname = 'commercial_subscription_changes_write'
  ) THEN
    CREATE POLICY commercial_subscription_changes_write ON commercial_subscription_changes
      FOR ALL USING (
        tenant_id = ANY(get_user_tenant_ids())
        AND has_permission('commerce', 'admin', tenant_id)
      )
      WITH CHECK (
        tenant_id = ANY(get_user_tenant_ids())
        AND has_permission('commerce', 'admin', tenant_id)
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'commercial_entitlement_overrides'
      AND policyname = 'commercial_entitlement_overrides_select'
  ) THEN
    CREATE POLICY commercial_entitlement_overrides_select ON commercial_entitlement_overrides
      FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'commercial_entitlement_overrides'
      AND policyname = 'commercial_entitlement_overrides_write'
  ) THEN
    CREATE POLICY commercial_entitlement_overrides_write ON commercial_entitlement_overrides
      FOR ALL USING (
        tenant_id = ANY(get_user_tenant_ids())
        AND has_permission('commerce', 'admin', tenant_id)
      )
      WITH CHECK (
        tenant_id = ANY(get_user_tenant_ids())
        AND has_permission('commerce', 'admin', tenant_id)
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'commercial_outbox_events'
      AND policyname = 'commercial_outbox_events_select'
  ) THEN
    CREATE POLICY commercial_outbox_events_select ON commercial_outbox_events
      FOR SELECT USING (is_platform_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'commercial_outbox_events'
      AND policyname = 'commercial_outbox_events_write'
  ) THEN
    CREATE POLICY commercial_outbox_events_write ON commercial_outbox_events
      FOR ALL USING (is_platform_admin())
      WITH CHECK (is_platform_admin());
  END IF;
END $$;

-- Idempotent commerce permission backfill on existing admin roles

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
WHERE slug IN ('member', 'viewer', 'engineer', 'engineering-owner', 'engineering-manager', 'lead-engineer')
  AND NOT permissions @> jsonb_build_array(jsonb_build_object('resource', 'commerce', 'action', 'read'));
