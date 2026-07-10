-- Batch 32: Backfill product installations for legacy entitled tenants
-- Creates installation records where active subscription + product licence exist but no installation row.

DO $$
DECLARE
  v_engineering_product_id UUID := 'c1000000-0000-4000-8000-000000000001';
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT DISTINCT
      s.tenant_id,
      s.id AS subscription_id,
      s.product_id,
      l.id AS licence_id,
      COALESCE(pv.version, '1.0.0') AS installed_version
    FROM commercial_subscriptions s
    JOIN commercial_licenses l
      ON l.tenant_id = s.tenant_id
      AND l.subscription_id = s.id
      AND l.license_type = 'product'
      AND l.status = 'active'
      AND l.deleted_at IS NULL
    LEFT JOIN commercial_product_versions pv
      ON pv.product_id = s.product_id AND pv.is_current = TRUE AND pv.deleted_at IS NULL
    WHERE s.product_id = v_engineering_product_id
      AND s.status IN ('active', 'trial', 'trialing', 'grace_period', 'scheduled_cancellation')
      AND s.deleted_at IS NULL
      AND NOT EXISTS (
        SELECT 1 FROM commercial_installations ci
        WHERE ci.tenant_id = s.tenant_id
          AND ci.product_id = s.product_id
          AND ci.deleted_at IS NULL
      )
  LOOP
    INSERT INTO commercial_installations (
      tenant_id, product_id, subscription_id, licence_id,
      status, desired_state, current_state,
      installed_version, requested_version,
      started_at, completed_at, installed_at,
      metadata
    ) VALUES (
      rec.tenant_id, rec.product_id, rec.subscription_id, rec.licence_id,
      'active', 'active', 'active',
      rec.installed_version, rec.installed_version,
      NOW(), NOW(), NOW(),
      jsonb_build_object('source', 'batch_32_backfill', 'backfilled_at', NOW())
    );

    INSERT INTO commercial_installation_events (
      tenant_id, installation_id, event_type, from_status, to_status, payload
    )
    SELECT
      rec.tenant_id, ci.id, 'installation.backfilled', 'not_installed', 'active',
      jsonb_build_object('source', 'batch_32_backfill')
    FROM commercial_installations ci
    WHERE ci.tenant_id = rec.tenant_id AND ci.product_id = rec.product_id AND ci.deleted_at IS NULL
    LIMIT 1;

    PERFORM bump_commercial_installation_version(rec.tenant_id);
  END LOOP;
END $$;

-- Remove Engineering OS auto-seed from signup — installation must use controlled workflow
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_tenant_name TEXT;
  v_tenant_slug TEXT;
  v_tenant_id UUID;
  v_owner_role_id UUID;
  v_workspace_id UUID;
BEGIN
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.profiles (id, email, full_name, avatar_url, status)
  VALUES (NEW.id, NEW.email, v_full_name, NEW.raw_user_meta_data->>'avatar_url', 'active')
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
        updated_at = NOW();

  IF EXISTS (SELECT 1 FROM public.tenant_memberships WHERE user_id = NEW.id AND status = 'active') THEN
    RETURN NEW;
  END IF;

  v_tenant_name := COALESCE(
    NULLIF(trim(NEW.raw_user_meta_data->>'tenant_name'), ''),
    NULLIF(trim(NEW.raw_user_meta_data->>'company_name'), ''),
    NULLIF(trim(NEW.raw_user_meta_data->>'organization'), ''),
    (v_full_name || '''s Organization')
  );
  v_tenant_slug := public.generate_tenant_slug(
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'tenant_slug'), ''), split_part(NEW.email, '@', 1))
  );

  INSERT INTO public.tenants (name, slug, status, settings)
  VALUES (v_tenant_name, v_tenant_slug, 'active', jsonb_build_object('created_via', 'signup', 'owner_user_id', NEW.id::text))
  RETURNING id INTO v_tenant_id;

  SELECT id INTO v_owner_role_id FROM public.roles WHERE tenant_id = v_tenant_id AND slug = 'owner' LIMIT 1;
  IF v_owner_role_id IS NULL THEN
    RAISE EXCEPTION 'Owner role missing after tenant create for tenant %', v_tenant_id;
  END IF;

  INSERT INTO public.tenant_memberships (tenant_id, user_id, role_id, status, joined_at)
  VALUES (v_tenant_id, NEW.id, v_owner_role_id, 'active', NOW())
  ON CONFLICT (tenant_id, user_id) DO NOTHING;

  SELECT id INTO v_workspace_id FROM public.workspaces WHERE tenant_id = v_tenant_id AND slug = 'default' LIMIT 1;
  IF v_workspace_id IS NOT NULL THEN
    INSERT INTO public.workspace_memberships (workspace_id, user_id, role_id)
    VALUES (v_workspace_id, NEW.id, v_owner_role_id)
    ON CONFLICT (workspace_id, user_id) DO NOTHING;
  END IF;

  -- Phase 3: Do NOT auto-install Engineering OS or Intelligence on signup.
  -- Product installation runs through entitlement-gated installation workflow.

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'handle_new_user failed for %: %', NEW.email, SQLERRM;
END;
$$;
