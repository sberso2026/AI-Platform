-- EOS-PILOT-LAUNCH-1R: invited users must never bootstrap a signup tenant.
-- Invite metadata present → join intended tenant/workspace/role only. No INSERT tenants.

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
  v_invite_tenant_id UUID;
  v_invite_role_slug TEXT;
  v_invite_role_id UUID;
  v_invite_workspace_id UUID;
  v_invite_marker TEXT;
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

  v_invite_marker := COALESCE(
    NULLIF(trim(NEW.raw_user_meta_data->>'invited_tenant_id'), ''),
    NULLIF(trim(NEW.raw_app_meta_data->>'invited_tenant_id'), ''),
    NULLIF(trim(NEW.raw_user_meta_data->>'invited_by'), ''),
    NULLIF(trim(NEW.raw_app_meta_data->>'invited_by'), ''),
    NULLIF(trim(NEW.raw_user_meta_data->>'invited_role_slug'), ''),
    NULLIF(trim(NEW.raw_app_meta_data->>'invited_role_slug'), '')
  );

  BEGIN
    v_invite_tenant_id := NULLIF(trim(COALESCE(
      NEW.raw_user_meta_data->>'invited_tenant_id',
      NEW.raw_app_meta_data->>'invited_tenant_id'
    )), '')::uuid;
  EXCEPTION
    WHEN OTHERS THEN
      v_invite_tenant_id := NULL;
  END;

  IF v_invite_marker IS NOT NULL THEN
    IF v_invite_tenant_id IS NULL OR NOT EXISTS (SELECT 1 FROM public.tenants WHERE id = v_invite_tenant_id) THEN
      RAISE EXCEPTION 'Invite requires a valid invited_tenant_id; signup tenant bootstrap is forbidden for invited users';
    END IF;

    v_invite_role_slug := COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'invited_role_slug'), ''), NULLIF(trim(NEW.raw_app_meta_data->>'invited_role_slug'), ''), 'member');
    IF v_invite_role_slug NOT IN ('admin', 'member', 'viewer') THEN
      v_invite_role_slug := 'member';
    END IF;

    SELECT id INTO v_invite_role_id
    FROM public.roles
    WHERE tenant_id = v_invite_tenant_id AND slug = v_invite_role_slug
    LIMIT 1;

    IF v_invite_role_id IS NULL THEN
      SELECT id INTO v_invite_role_id
      FROM public.roles
      WHERE tenant_id = v_invite_tenant_id AND slug = 'member'
      LIMIT 1;
    END IF;

    IF v_invite_role_id IS NULL THEN
      RAISE EXCEPTION 'Invite role missing for tenant %', v_invite_tenant_id;
    END IF;

    INSERT INTO public.tenant_memberships (tenant_id, user_id, role_id, status, invited_at, joined_at)
    VALUES (v_invite_tenant_id, NEW.id, v_invite_role_id, 'active', NOW(), NOW())
    ON CONFLICT (tenant_id, user_id) DO NOTHING;

    BEGIN
      v_invite_workspace_id := NULLIF(trim(COALESCE(
        NEW.raw_user_meta_data->>'invited_workspace_id',
        NEW.raw_app_meta_data->>'invited_workspace_id'
      )), '')::uuid;
    EXCEPTION
      WHEN OTHERS THEN
        v_invite_workspace_id := NULL;
    END;

    IF v_invite_workspace_id IS NULL OR NOT EXISTS (
      SELECT 1 FROM public.workspaces WHERE id = v_invite_workspace_id AND tenant_id = v_invite_tenant_id
    ) THEN
      SELECT id INTO v_invite_workspace_id
      FROM public.workspaces
      WHERE tenant_id = v_invite_tenant_id AND status = 'active'
      ORDER BY CASE WHEN slug = 'default' THEN 0 ELSE 1 END, slug
      LIMIT 1;
    END IF;

    IF v_invite_workspace_id IS NOT NULL THEN
      INSERT INTO public.workspace_memberships (workspace_id, user_id, role_id)
      VALUES (v_invite_workspace_id, NEW.id, v_invite_role_id)
      ON CONFLICT (workspace_id, user_id) DO NOTHING;
    END IF;

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

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'handle_new_user failed for %: %', NEW.email, SQLERRM;
END;
$$;
