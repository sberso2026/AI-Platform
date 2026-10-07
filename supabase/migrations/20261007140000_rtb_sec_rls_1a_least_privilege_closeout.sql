-- RTB-SEC-RLS-1A: least-privilege closeout + canonical helper hardening
-- STAGING / additive only. No destructive schema or data operations.
-- Does not weaken existing membership policies.
--
-- Findings from hosted staging rntonzigxwxcjlcsadip:
-- - 659 public ordinary tables still GRANT ALL to anon (writes included).
--   Login/signup/reset use GoTrue only; handle_new_user() is SECURITY DEFINER.
--   No repository unauthenticated PostgREST table access was found.
-- - Unrestricted catalog SELECT policies exist only on PLATFORM_REFERENCE tables.
--   Authenticated global SELECT is intentional. Taxonomy insert/update was open.
-- - get_user_tenant_ids/is_tenant_member/has_permission are SECURITY DEFINER
--   with unpinned search_path.

CREATE TABLE IF NOT EXISTS public.rtb_anon_table_grant_exceptions (
  table_name text NOT NULL,
  privilege_type text NOT NULL,
  rationale text NOT NULL,
  PRIMARY KEY (table_name, privilege_type)
);

COMMENT ON TABLE public.rtb_anon_table_grant_exceptions IS
  'RTB-SEC-RLS-1A reviewed anonymous table-privilege exceptions. Empty means anon has no justified public-table grants.';

ALTER TABLE public.rtb_anon_table_grant_exceptions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.rtb_anon_table_grant_exceptions FROM PUBLIC;
REVOKE ALL ON TABLE public.rtb_anon_table_grant_exceptions FROM anon;
REVOKE ALL ON TABLE public.rtb_anon_table_grant_exceptions FROM authenticated;
GRANT ALL ON TABLE public.rtb_anon_table_grant_exceptions TO service_role;

INSERT INTO public.rtb_public_table_security_classification (
  table_name, classification, intended_read, intended_write, rationale
) VALUES (
  'rtb_anon_table_grant_exceptions',
  'BACKEND_ONLY',
  'service_role / backend only',
  'service_role / backend only',
  'RTB-SEC-RLS-1A exception register for reviewed anonymous table grants. Client access would leak authorization decisions.'
)
ON CONFLICT (table_name) DO UPDATE
SET classification = EXCLUDED.classification,
    intended_read = EXCLUDED.intended_read,
    intended_write = EXCLUDED.intended_write,
    rationale = EXCLUDED.rationale,
    classified_at = now();

-- ---------------------------------------------------------------------------
-- Revoke unjustified anonymous table privileges.
-- Authenticated and service_role grants are left intact.
-- ---------------------------------------------------------------------------
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;

DO $$
BEGIN
  ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON TABLES FROM anon;
  ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon;
  ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'postgres default privilege revoke skipped';
END $$;

DO $$
BEGIN
  ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public REVOKE ALL ON TABLES FROM anon;
  ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon;
  ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'supabase_admin default privilege revoke skipped';
END $$;

-- ---------------------------------------------------------------------------
-- PLATFORM_REFERENCE SELECT: keep authenticated global read; stop TO public.
-- Taxonomy writes: pack registration is not a tenant self-service API (GET-only
-- route + in-memory registry). Restrict writes to is_platform_admin().
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  rec record;
BEGIN
  FOR rec IN
    SELECT tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND cmd = 'SELECT'
      AND 'public' = ANY (roles)
      AND qual IN ('true', '(true)')
      AND tablename IN (
        SELECT table_name FROM public.rtb_public_table_security_classification
        WHERE classification = 'PLATFORM_REFERENCE'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', rec.policyname, rec.tablename);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL)',
      rec.policyname, rec.tablename
    );
  END LOOP;
END $$;

DROP POLICY IF EXISTS asset_intelligence_failure_taxonomy_insert ON public.asset_intelligence_failure_taxonomy;
DROP POLICY IF EXISTS asset_intelligence_failure_taxonomy_update ON public.asset_intelligence_failure_taxonomy;

CREATE POLICY asset_intelligence_failure_taxonomy_insert
  ON public.asset_intelligence_failure_taxonomy
  FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_admin());

CREATE POLICY asset_intelligence_failure_taxonomy_update
  ON public.asset_intelligence_failure_taxonomy
  FOR UPDATE TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- ---------------------------------------------------------------------------
-- Canonical SECURITY DEFINER helpers: pin search_path and qualify objects.
-- Semantics unchanged: membership still keyed on auth.uid() + active status.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_tenant_ids()
RETURNS UUID[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT COALESCE(
    ARRAY_AGG(tm.tenant_id),
    ARRAY[]::UUID[]
  )
  FROM public.tenant_memberships tm
  WHERE tm.user_id = auth.uid()
    AND tm.status = 'active';
$$;

CREATE OR REPLACE FUNCTION public.is_tenant_member(p_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_memberships tm
    WHERE tm.tenant_id = p_tenant_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.has_permission(
  p_resource TEXT,
  p_action TEXT,
  p_tenant_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_memberships tm
    JOIN public.roles r ON r.id = tm.role_id
    WHERE tm.user_id = auth.uid()
      AND tm.tenant_id = p_tenant_id
      AND tm.status = 'active'
      AND (
        r.permissions @> jsonb_build_array(
          jsonb_build_object('resource', p_resource, 'action', p_action)
        )
        OR r.permissions @> jsonb_build_array(
          jsonb_build_object('resource', p_resource, 'action', 'admin')
        )
        OR r.slug = 'owner'
        OR r.slug = 'admin'
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'platform_admin')::boolean,
    false
  )
  OR COALESCE(auth.jwt() ->> 'role', '') = 'service_role';
$$;

COMMENT ON FUNCTION public.get_user_tenant_ids() IS
  'RTB-SEC-RLS-1A canonical tenant membership helper. SECURITY DEFINER; search_path pinned to pg_catalog, public.';
COMMENT ON FUNCTION public.is_tenant_member(uuid) IS
  'RTB-SEC-RLS-1A canonical tenant membership predicate. SECURITY DEFINER; search_path pinned.';
COMMENT ON FUNCTION public.has_permission(text, text, uuid) IS
  'RTB-SEC-RLS-1A canonical tenant permission helper. SECURITY DEFINER; search_path pinned.';
COMMENT ON FUNCTION public.is_platform_admin() IS
  'Platform operator bypass. RTB-SEC-RLS-1A pinned search_path to pg_catalog, public.';

REVOKE ALL ON FUNCTION public.get_user_tenant_ids() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_user_tenant_ids() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_user_tenant_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_tenant_ids() TO service_role;

REVOKE ALL ON FUNCTION public.is_tenant_member(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_tenant_member(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_tenant_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_tenant_member(uuid) TO service_role;

REVOKE ALL ON FUNCTION public.has_permission(text, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_permission(text, text, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_permission(text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(text, text, uuid) TO service_role;

REVOKE ALL ON FUNCTION public.is_platform_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_platform_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO service_role;

-- Related tenant-provisioning DEFINER functions already had search_path=public.
-- Pin pg_catalog first without replacing bodies.
DO $$
BEGIN
  ALTER FUNCTION public.handle_new_user() SET search_path = pg_catalog, public;
EXCEPTION WHEN undefined_function THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER FUNCTION public.generate_tenant_slug(text) SET search_path = pg_catalog, public;
EXCEPTION WHEN undefined_function THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER FUNCTION public.create_default_tenant_roles(uuid) SET search_path = pg_catalog, public;
EXCEPTION WHEN undefined_function THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER FUNCTION public.handle_new_tenant() SET search_path = pg_catalog, public;
EXCEPTION WHEN undefined_function THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER FUNCTION public.handle_new_tenant_kernel() SET search_path = pg_catalog, public;
EXCEPTION WHEN undefined_function THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER FUNCTION public.provision_tenant_kernel_defaults(uuid) SET search_path = pg_catalog, public;
EXCEPTION WHEN undefined_function THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER FUNCTION public.seed_tenant_engineering_os(uuid) SET search_path = pg_catalog, public;
EXCEPTION WHEN undefined_function THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER FUNCTION public.seed_tenant_engineering_registers(uuid) SET search_path = pg_catalog, public;
EXCEPTION WHEN undefined_function THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER FUNCTION public.seed_tenant_intelligence(uuid) SET search_path = pg_catalog, public;
EXCEPTION WHEN undefined_function THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER FUNCTION public.seed_tenant_workflows(uuid) SET search_path = pg_catalog, public;
EXCEPTION WHEN undefined_function THEN
  NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Extended regression guard (replaces RLS-1 body; same name/grants).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rtb_sec_rls_public_violations()
RETURNS TABLE(violation_code text, table_name text, detail text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT 'RLS_DISABLED'::text,
         c.relname::text,
         'public ordinary table has relrowsecurity=false'::text
  FROM pg_catalog.pg_class c
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND NOT c.relrowsecurity

  UNION ALL

  SELECT 'UNCLASSIFIED'::text,
         c.relname::text,
         'public ordinary table missing rtb_public_table_security_classification row'::text
  FROM pg_catalog.pg_class c
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND NOT EXISTS (
      SELECT 1
      FROM public.rtb_public_table_security_classification s
      WHERE s.table_name = c.relname
    )

  UNION ALL

  SELECT 'UNRESOLVED'::text,
         s.table_name,
         'classification is UNRESOLVED'::text
  FROM public.rtb_public_table_security_classification s
  WHERE s.classification = 'UNRESOLVED'

  UNION ALL

  SELECT 'UNJUSTIFIED_ANON_GRANT'::text,
         g.table_name::text,
         (g.privilege_type || ' granted to anon')::text
  FROM information_schema.role_table_grants g
  JOIN pg_catalog.pg_class c ON c.relname = g.table_name
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace AND n.nspname = g.table_schema
  WHERE g.table_schema = 'public'
    AND c.relkind = 'r'
    AND g.grantee = 'anon'
    AND NOT EXISTS (
      SELECT 1
      FROM public.rtb_anon_table_grant_exceptions e
      WHERE e.table_name = g.table_name
        AND e.privilege_type = g.privilege_type
    )

  UNION ALL

  SELECT 'UNSAFE_SECURITY_DEFINER_SEARCH_PATH'::text,
         p.proname::text,
         COALESCE(array_to_string(p.proconfig, ','), 'search_path unpinned')::text
  FROM pg_catalog.pg_proc p
  JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.prosecdef
    AND p.proname IN (
      'get_user_tenant_ids',
      'is_tenant_member',
      'has_permission',
      'is_platform_admin'
    )
    AND NOT EXISTS (
      SELECT 1
      FROM unnest(COALESCE(p.proconfig, ARRAY[]::text[])) cfg
      WHERE cfg LIKE 'search_path=pg_catalog, public%'
         OR cfg LIKE 'search_path=pg_catalog,public%'
    )
$$;

COMMENT ON FUNCTION public.rtb_sec_rls_public_violations() IS
  'RTB-SEC-RLS-1A guard. Empty result = no RLS-disabled, unclassified, unresolved, unjustified-anon-grant, or unpinned canonical helper issues.';

REVOKE ALL ON FUNCTION public.rtb_sec_rls_public_violations() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rtb_sec_rls_public_violations() FROM anon;
REVOKE ALL ON FUNCTION public.rtb_sec_rls_public_violations() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.rtb_sec_rls_public_violations() TO service_role;

NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  IF to_regclass('supabase_migrations.schema_migrations') IS NOT NULL THEN
    INSERT INTO supabase_migrations.schema_migrations (version)
    SELECT '20261007140000'
    WHERE NOT EXISTS (
      SELECT 1 FROM supabase_migrations.schema_migrations WHERE version = '20261007140000'
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;
