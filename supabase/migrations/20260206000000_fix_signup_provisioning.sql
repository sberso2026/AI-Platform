-- Batch 2.06b — Fix auth signup provisioning (Auth 500 on /auth/v1/signup)
-- Root causes:
-- 1) handle_new_user only inserted profiles; never created tenant/membership
-- 2) SECURITY DEFINER triggers lacked SET search_path (Supabase Auth 500)
-- 3) No reliable membership → owner role → workspace membership chain on signup

-- ─── Stable UUID slug helper ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.generate_tenant_slug(p_base TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_base TEXT;
  v_slug TEXT;
  v_n INTEGER := 0;
BEGIN
  v_base := lower(regexp_replace(COALESCE(NULLIF(trim(p_base), ''), 'org'), '[^a-z0-9]+', '-', 'g'));
  v_base := trim(BOTH '-' FROM v_base);
  IF v_base = '' THEN
    v_base := 'org';
  END IF;
  v_base := left(v_base, 40);
  v_slug := v_base;

  WHILE EXISTS (SELECT 1 FROM tenants WHERE slug = v_slug) LOOP
    v_n := v_n + 1;
    v_slug := left(v_base, 36) || '-' || v_n::text;
  END LOOP;

  RETURN v_slug;
END;
$$;

-- ─── Hardened profile + tenant bootstrap on auth.users insert ─────────────────

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

  -- 1) Profile (extends auth.users)
  INSERT INTO public.profiles (id, email, full_name, avatar_url, status)
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    NEW.raw_user_meta_data->>'avatar_url',
    'active'
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
        updated_at = NOW();

  -- Skip tenant bootstrap if user already has an active membership (invite path)
  IF EXISTS (
    SELECT 1 FROM public.tenant_memberships
    WHERE user_id = NEW.id AND status = 'active'
  ) THEN
    RETURN NEW;
  END IF;

  -- 2) Tenant
  v_tenant_name := COALESCE(
    NULLIF(trim(NEW.raw_user_meta_data->>'tenant_name'), ''),
    NULLIF(trim(NEW.raw_user_meta_data->>'company_name'), ''),
    NULLIF(trim(NEW.raw_user_meta_data->>'organization'), ''),
    (v_full_name || '''s Organization')
  );
  v_tenant_slug := public.generate_tenant_slug(
    COALESCE(
      NULLIF(trim(NEW.raw_user_meta_data->>'tenant_slug'), ''),
      split_part(NEW.email, '@', 1)
    )
  );

  INSERT INTO public.tenants (name, slug, status, settings)
  VALUES (
    v_tenant_name,
    v_tenant_slug,
    'active',
    jsonb_build_object(
      'created_via', 'signup',
      'owner_user_id', NEW.id::text
    )
  )
  RETURNING id INTO v_tenant_id;

  -- handle_new_tenant / handle_new_tenant_kernel triggers create:
  -- roles, default workspace, workflows, kernel defaults

  -- 3) Owner membership
  SELECT id INTO v_owner_role_id
  FROM public.roles
  WHERE tenant_id = v_tenant_id AND slug = 'owner'
  LIMIT 1;

  IF v_owner_role_id IS NULL THEN
    RAISE EXCEPTION 'Owner role missing after tenant create for tenant %', v_tenant_id;
  END IF;

  INSERT INTO public.tenant_memberships (tenant_id, user_id, role_id, status, joined_at)
  VALUES (v_tenant_id, NEW.id, v_owner_role_id, 'active', NOW())
  ON CONFLICT (tenant_id, user_id) DO NOTHING;

  -- 4) Default workspace membership (uses roles.id FK)
  SELECT id INTO v_workspace_id
  FROM public.workspaces
  WHERE tenant_id = v_tenant_id AND slug = 'default'
  LIMIT 1;

  IF v_workspace_id IS NOT NULL THEN
    INSERT INTO public.workspace_memberships (workspace_id, user_id, role_id)
    VALUES (v_workspace_id, NEW.id, v_owner_role_id)
    ON CONFLICT (workspace_id, user_id) DO NOTHING;
  END IF;

  -- 5) Engineering OS seed (best-effort — must not fail signup)
  BEGIN
    IF EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname = 'seed_tenant_engineering_os'
    ) THEN
      PERFORM public.seed_tenant_engineering_os(v_tenant_id);
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'seed_tenant_engineering_os failed for tenant %: %', v_tenant_id, SQLERRM;
  END;

  -- 6) Intelligence seed (best-effort)
  BEGIN
    IF EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname = 'seed_tenant_intelligence'
    ) THEN
      PERFORM public.seed_tenant_intelligence(v_tenant_id);
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'seed_tenant_intelligence failed for tenant %: %', v_tenant_id, SQLERRM;
  END;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'handle_new_user failed for %: %', NEW.email, SQLERRM;
END;
$$;

-- Recreate trigger (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Harden tenant provisioning triggers ─────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_tenant()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.create_default_tenant_roles(NEW.id);

  INSERT INTO public.workspaces (tenant_id, name, slug, description, type, status)
  VALUES (NEW.id, 'Default Workspace', 'default', 'Primary workspace', 'default', 'active')
  ON CONFLICT (tenant_id, slug) DO NOTHING;

  BEGIN
    IF EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname = 'seed_tenant_workflows'
    ) THEN
      PERFORM public.seed_tenant_workflows(NEW.id);
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'seed_tenant_workflows failed for tenant %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_default_tenant_roles(p_tenant_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO roles (tenant_id, name, slug, description, permissions, is_system) VALUES
  (p_tenant_id, 'Owner', 'owner', 'Full platform access', '[]'::jsonb, TRUE),
  (p_tenant_id, 'Administrator', 'admin', 'Administrative access', jsonb_build_array(
    jsonb_build_object('resource', 'tenant', 'action', 'admin'),
    jsonb_build_object('resource', 'workspace', 'action', 'admin'),
    jsonb_build_object('resource', 'user', 'action', 'admin'),
    jsonb_build_object('resource', 'role', 'action', 'admin'),
    jsonb_build_object('resource', 'plugin', 'action', 'admin'),
    jsonb_build_object('resource', 'audit', 'action', 'read'),
    jsonb_build_object('resource', 'settings', 'action', 'admin'),
    jsonb_build_object('resource', 'command_centre', 'action', 'admin'),
    jsonb_build_object('resource', 'ai_agent', 'action', 'admin'),
    jsonb_build_object('resource', 'ai_agent', 'action', 'execute'),
    jsonb_build_object('resource', 'workflow', 'action', 'admin'),
    jsonb_build_object('resource', 'workflow', 'action', 'execute'),
    jsonb_build_object('resource', 'knowledge', 'action', 'execute'),
    jsonb_build_object('resource', 'digital_twin', 'action', 'execute'),
    jsonb_build_object('resource', 'automation', 'action', 'admin'),
    jsonb_build_object('resource', 'automation', 'action', 'execute'),
    jsonb_build_object('resource', 'engineering', 'action', 'admin'),
    jsonb_build_object('resource', 'engineering', 'action', 'execute'),
    jsonb_build_object('resource', 'engineering', 'action', 'read')
  ), TRUE),
  (p_tenant_id, 'Member', 'member', 'Standard workspace access', jsonb_build_array(
    jsonb_build_object('resource', 'workspace', 'action', 'read'),
    jsonb_build_object('resource', 'command_centre', 'action', 'execute'),
    jsonb_build_object('resource', 'ai_agent', 'action', 'execute'),
    jsonb_build_object('resource', 'settings', 'action', 'read'),
    jsonb_build_object('resource', 'engineering', 'action', 'read'),
    jsonb_build_object('resource', 'engineering', 'action', 'execute')
  ), TRUE),
  (p_tenant_id, 'Viewer', 'viewer', 'Read-only access', jsonb_build_array(
    jsonb_build_object('resource', 'workspace', 'action', 'read'),
    jsonb_build_object('resource', 'settings', 'action', 'read'),
    jsonb_build_object('resource', 'engineering', 'action', 'read')
  ), TRUE)
  ON CONFLICT (tenant_id, slug) DO NOTHING;

  -- Engineering roles (ignore if already present)
  INSERT INTO roles (tenant_id, name, slug, description, permissions, is_system) VALUES
  (p_tenant_id, 'Engineering Owner', 'engineering-owner', 'Full Engineering OS access', jsonb_build_array(
    jsonb_build_object('resource', 'engineering', 'action', 'admin'),
    jsonb_build_object('resource', 'engineering', 'action', 'execute'),
    jsonb_build_object('resource', 'engineering', 'action', 'read'),
    jsonb_build_object('resource', 'ai_agent', 'action', 'execute'),
    jsonb_build_object('resource', 'knowledge', 'action', 'execute'),
    jsonb_build_object('resource', 'digital_twin', 'action', 'execute')
  ), TRUE),
  (p_tenant_id, 'Engineering Manager', 'engineering-manager', 'Engineering OS management', jsonb_build_array(
    jsonb_build_object('resource', 'engineering', 'action', 'execute'),
    jsonb_build_object('resource', 'engineering', 'action', 'read'),
    jsonb_build_object('resource', 'ai_agent', 'action', 'execute'),
    jsonb_build_object('resource', 'knowledge', 'action', 'execute')
  ), TRUE),
  (p_tenant_id, 'Lead Engineer', 'lead-engineer', 'Lead engineer access', jsonb_build_array(
    jsonb_build_object('resource', 'engineering', 'action', 'execute'),
    jsonb_build_object('resource', 'engineering', 'action', 'read'),
    jsonb_build_object('resource', 'ai_agent', 'action', 'execute')
  ), TRUE),
  (p_tenant_id, 'Engineer', 'engineer', 'Standard engineer access', jsonb_build_array(
    jsonb_build_object('resource', 'engineering', 'action', 'execute'),
    jsonb_build_object('resource', 'engineering', 'action', 'read'),
    jsonb_build_object('resource', 'ai_agent', 'action', 'execute')
  ), TRUE),
  (p_tenant_id, 'Inspector', 'inspector', 'Inspection access', jsonb_build_array(
    jsonb_build_object('resource', 'engineering', 'action', 'read'),
    jsonb_build_object('resource', 'engineering', 'action', 'execute')
  ), TRUE),
  (p_tenant_id, 'Document Controller', 'document-controller', 'Document control access', jsonb_build_array(
    jsonb_build_object('resource', 'engineering', 'action', 'read'),
    jsonb_build_object('resource', 'engineering', 'action', 'execute')
  ), TRUE),
  (p_tenant_id, 'Project Controls User', 'project-controls-user', 'Project controls access', jsonb_build_array(
    jsonb_build_object('resource', 'engineering', 'action', 'read'),
    jsonb_build_object('resource', 'engineering', 'action', 'execute')
  ), TRUE)
  ON CONFLICT (tenant_id, slug) DO NOTHING;
END;
$$;

-- Harden kernel tenant trigger search_path
CREATE OR REPLACE FUNCTION public.handle_new_tenant_kernel()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  BEGIN
    IF EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname = 'provision_tenant_kernel_defaults'
    ) THEN
      PERFORM public.provision_tenant_kernel_defaults(NEW.id);
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'provision_tenant_kernel_defaults failed for tenant %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$;

-- Ensure SECURITY DEFINER helpers ignore RLS (table owner / superuser bypass);
-- grant execute to roles that may invoke triggers.
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_tenant() TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.generate_tenant_slug(TEXT) TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.create_default_tenant_roles(UUID) TO postgres, service_role;

-- Harden search_path on dependent seed helpers (prevent Auth 500 from unresolved names)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'provision_tenant_kernel_defaults') THEN
    EXECUTE 'ALTER FUNCTION public.provision_tenant_kernel_defaults(UUID) SET search_path = public';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'seed_tenant_workflows') THEN
    EXECUTE 'ALTER FUNCTION public.seed_tenant_workflows(UUID) SET search_path = public';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'seed_tenant_intelligence') THEN
    EXECUTE 'ALTER FUNCTION public.seed_tenant_intelligence(UUID) SET search_path = public';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'seed_tenant_engineering_os') THEN
    EXECUTE 'ALTER FUNCTION public.seed_tenant_engineering_os(UUID) SET search_path = public';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'seed_tenant_engineering_registers') THEN
    EXECUTE 'ALTER FUNCTION public.seed_tenant_engineering_registers(UUID) SET search_path = public';
  END IF;
END $$;

-- Allow authenticated users to see their own memberships immediately after signup
-- (select policies already exist; ensure INSERT for trigger path is not required under RLS
-- because SECURITY DEFINER with search_path=public runs as function owner.)

-- Signup-friendly: allow selecting own membership by user_id even before tenant list resolves
DROP POLICY IF EXISTS tenant_memberships_select_own ON tenant_memberships;
CREATE POLICY tenant_memberships_select_own ON tenant_memberships
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS tenants_select_via_membership ON tenants;
CREATE POLICY tenants_select_via_membership ON tenants
  FOR SELECT USING (
    id IN (
      SELECT tm.tenant_id FROM tenant_memberships tm
      WHERE tm.user_id = auth.uid() AND tm.status = 'active'
    )
  );
