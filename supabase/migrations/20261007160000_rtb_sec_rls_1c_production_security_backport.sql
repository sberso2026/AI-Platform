-- RTB-SEC-RLS-1C: production security backport of RLS-1 / RLS-1A controls
-- Targets the CURRENT Engineering OS production schema (wcydlhqiqdwgoaqrlget).
-- Does NOT apply 20261007120000 or 20261007140000.
-- Does NOT create Security Assurance product tables.
-- Does NOT replay unrelated missing feature migrations.
-- Additive security only: no DROP TABLE / TRUNCATE / DELETE FROM.

DO $$
BEGIN
  IF to_regclass('public.digital_twin_source_adapters') IS NULL
     OR to_regclass('public.digital_twin_state_schemas') IS NULL
     OR to_regclass('public.digital_twin_source_authority_policies') IS NULL THEN
    RAISE EXCEPTION 'rtb_sec_rls_1c: expected Digital Twin catalog tables are missing';
  END IF;
  IF to_regclass('public.asset_intelligence_failure_taxonomy') IS NULL THEN
    RAISE EXCEPTION 'rtb_sec_rls_1c: expected asset_intelligence_failure_taxonomy is missing';
  END IF;
  IF to_regclass('public.tenant_memberships') IS NULL OR to_regclass('public.roles') IS NULL THEN
    RAISE EXCEPTION 'rtb_sec_rls_1c: expected tenant membership tables are missing';
  END IF;
  IF to_regprocedure('public.get_user_tenant_ids()') IS NULL
     OR to_regprocedure('public.is_tenant_member(uuid)') IS NULL
     OR to_regprocedure('public.has_permission(text,text,uuid)') IS NULL
     OR to_regprocedure('public.is_platform_admin()') IS NULL THEN
    RAISE EXCEPTION 'rtb_sec_rls_1c: expected canonical authorization helpers are missing';
  END IF;
  IF to_regclass('supabase_migrations.schema_migrations') IS NULL THEN
    RAISE EXCEPTION 'rtb_sec_rls_1c: schema_migrations catalog is missing';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.rtb_public_table_security_classification (
  table_name text PRIMARY KEY,
  classification text NOT NULL CHECK (classification IN (
    'TENANT_SCOPED',
    'WORKSPACE_SCOPED',
    'PROJECT_SCOPED',
    'USER_SCOPED',
    'PLATFORM_REFERENCE',
    'BACKEND_ONLY',
    'PUBLIC_INTENTIONAL',
    'UNRESOLVED'
  )),
  intended_read text NOT NULL,
  intended_write text NOT NULL,
  rationale text NOT NULL,
  classified_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.rtb_public_table_security_classification IS
  'RTB-SEC-RLS-1C security decision register for public ordinary tables. Backend/service only.';

ALTER TABLE public.rtb_public_table_security_classification ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.rtb_public_table_security_classification FROM PUBLIC;
REVOKE ALL ON TABLE public.rtb_public_table_security_classification FROM anon;
REVOKE ALL ON TABLE public.rtb_public_table_security_classification FROM authenticated;
GRANT ALL ON TABLE public.rtb_public_table_security_classification TO service_role;

CREATE TABLE IF NOT EXISTS public.rtb_anon_table_grant_exceptions (
  table_name text NOT NULL,
  privilege_type text NOT NULL,
  rationale text NOT NULL,
  PRIMARY KEY (table_name, privilege_type)
);

COMMENT ON TABLE public.rtb_anon_table_grant_exceptions IS
  'RTB-SEC-RLS-1C reviewed anonymous table-privilege exceptions. Empty means anon has no justified public-table grants.';

ALTER TABLE public.rtb_anon_table_grant_exceptions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.rtb_anon_table_grant_exceptions FROM PUBLIC;
REVOKE ALL ON TABLE public.rtb_anon_table_grant_exceptions FROM anon;
REVOKE ALL ON TABLE public.rtb_anon_table_grant_exceptions FROM authenticated;
GRANT ALL ON TABLE public.rtb_anon_table_grant_exceptions TO service_role;

INSERT INTO public.rtb_public_table_security_classification (
  table_name, classification, intended_read, intended_write, rationale
)
SELECT
  c.relname,
  CASE
    WHEN c.relname = 'profiles' THEN 'USER_SCOPED'
    WHEN c.relname = 'tenants' THEN 'TENANT_SCOPED'
    WHEN c.relname IN (
      'digital_twin_source_adapters',
      'digital_twin_state_schemas',
      'digital_twin_source_authority_policies',
      'asset_intelligence_failure_taxonomy',
      'capability_dependencies',
      'capability_versions',
      'ai_tool_versions',
      'commercial_application_features',
      'commercial_features',
      'commercial_marketplace_products',
      'commercial_partner_products',
      'commercial_plan_entitlements',
      'commercial_plan_prices',
      'commercial_plans',
      'commercial_product_applications',
      'commercial_product_versions',
      'commercial_publishers',
      'commercial_usage_types',
      'engineering_application_registry',
      'eval_cases',
      'feature_assignments',
      'features',
      'inspection_pack_registry',
      'memory_scopes',
      'model_capabilities',
      'plugin_dependencies',
      'plugin_permissions',
      'plugin_versions',
      'plugins',
      'policy_actions',
      'policy_conditions',
      'policy_versions',
      'prompt_approvals',
      'prompt_variables'
    ) THEN 'PLATFORM_REFERENCE'
    WHEN c.relname IN (
      'rtb_public_table_security_classification',
      'rtb_anon_table_grant_exceptions',
      'agent_messages',
      'agent_tool_calls',
      'api_key_permissions',
      'command_centre_messages',
      'cost_allocations',
      'digital_twin_attributes',
      'digital_twin_status_history',
      'engineering_document_versions',
      'engineering_execution_host_health',
      'engineering_execution_job_artifacts',
      'engineering_handover_package_items',
      'eval_results',
      'event_dispatch_attempts',
      'job_attempts',
      'memory_links',
      'notification_deliveries',
      'prompt_versions',
      'secret_permissions',
      'secret_versions',
      'trace_spans',
      'workflow_step_runs',
      'workflow_steps',
      'workflow_transitions',
      'workflow_versions'
    ) THEN 'BACKEND_ONLY'
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns col
      WHERE col.table_schema = 'public' AND col.table_name = c.relname AND col.column_name = 'workspace_id'
    ) THEN 'WORKSPACE_SCOPED'
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns col
      WHERE col.table_schema = 'public' AND col.table_name = c.relname AND col.column_name = 'tenant_id'
    ) THEN 'TENANT_SCOPED'
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns col
      WHERE col.table_schema = 'public' AND col.table_name = c.relname AND col.column_name = 'project_id'
    ) THEN 'PROJECT_SCOPED'
    ELSE 'UNRESOLVED'
  END,
  CASE
    WHEN c.relname IN (
      'digital_twin_source_adapters',
      'digital_twin_state_schemas',
      'digital_twin_source_authority_policies'
    ) THEN 'authenticated SELECT (JWT present)'
    WHEN c.relname IN (
      'rtb_public_table_security_classification',
      'rtb_anon_table_grant_exceptions'
    ) THEN 'service_role / backend only'
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns col
      WHERE col.table_schema = 'public' AND col.table_name = c.relname AND col.column_name = 'workspace_id'
    ) THEN 'workspace membership'
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns col
      WHERE col.table_schema = 'public' AND col.table_name = c.relname AND col.column_name = 'tenant_id'
    ) OR c.relname = 'tenants' THEN 'tenant membership'
    WHEN c.relname = 'profiles' THEN 'own profile / tenant peers'
    ELSE 'documented existing policy / backend'
  END,
  CASE
    WHEN c.relname IN (
      'digital_twin_source_adapters',
      'digital_twin_state_schemas',
      'digital_twin_source_authority_policies'
    ) THEN 'is_platform_admin() or service_role'
    WHEN c.relname IN (
      'rtb_public_table_security_classification',
      'rtb_anon_table_grant_exceptions'
    ) THEN 'service_role / backend only'
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns col
      WHERE col.table_schema = 'public' AND col.table_name = c.relname AND col.column_name = 'workspace_id'
    ) THEN 'workspace membership'
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns col
      WHERE col.table_schema = 'public' AND col.table_name = c.relname AND col.column_name = 'tenant_id'
    ) THEN 'tenant membership'
    WHEN c.relname = 'profiles' THEN 'own profile'
    ELSE 'documented existing policy / backend'
  END,
  CASE
    WHEN c.relname IN (
      'digital_twin_source_adapters',
      'digital_twin_state_schemas',
      'digital_twin_source_authority_policies'
    ) THEN 'RTB-SEC-RLS-1C PLATFORM_REFERENCE backport. Authenticated SELECT; writes is_platform_admin()/service_role. No anon.'
    WHEN c.relname IN (
      'rtb_public_table_security_classification',
      'rtb_anon_table_grant_exceptions'
    ) THEN 'Security decision register. Client access would leak authorization architecture.'
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns col
      WHERE col.table_schema = 'public' AND col.table_name = c.relname AND col.column_name = 'workspace_id'
    ) THEN 'Hosted table has workspace_id; existing RLS uses workspace membership. Not remediating existing membership policies.'
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns col
      WHERE col.table_schema = 'public' AND col.table_name = c.relname AND col.column_name = 'tenant_id'
    ) THEN 'Hosted table has tenant_id without workspace_id; existing tenant membership RLS. Not remediating existing membership policies.'
    ELSE 'Unscoped public table with RLS already enabled; classified from schema/name. Catalog SELECT tightening follows RLS-1A.'
  END
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
ON CONFLICT (table_name) DO UPDATE
SET
  classification = EXCLUDED.classification,
  intended_read = EXCLUDED.intended_read,
  intended_write = EXCLUDED.intended_write,
  rationale = EXCLUDED.rationale,
  classified_at = now();

INSERT INTO public.rtb_public_table_security_classification (
  table_name, classification, intended_read, intended_write, rationale
) VALUES (
  'rtb_anon_table_grant_exceptions',
  'BACKEND_ONLY',
  'service_role / backend only',
  'service_role / backend only',
  'RTB-SEC-RLS-1C exception register for reviewed anonymous table grants.'
)
ON CONFLICT (table_name) DO UPDATE
SET classification = EXCLUDED.classification,
    intended_read = EXCLUDED.intended_read,
    intended_write = EXCLUDED.intended_write,
    rationale = EXCLUDED.rationale,
    classified_at = now();

DO $$
DECLARE
  unresolved_count integer;
BEGIN
  SELECT count(*) INTO unresolved_count
  FROM public.rtb_public_table_security_classification
  WHERE classification = 'UNRESOLVED';
  IF unresolved_count > 0 THEN
    RAISE EXCEPTION 'rtb_sec_rls_1c: % public tables classified UNRESOLVED', unresolved_count;
  END IF;
END $$;

-- Digital Twin global catalogs: PLATFORM_REFERENCE (same semantics as RLS-1).
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'digital_twin_source_adapters',
    'digital_twin_state_schemas',
    'digital_twin_source_authority_policies'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC', t);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon', t);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM authenticated', t);
    EXECUTE format('GRANT SELECT ON TABLE public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON TABLE public.%I TO service_role', t);

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_select_authenticated', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL)',
      t || '_select_authenticated', t
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_insert_platform_admin', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_platform_admin())',
      t || '_insert_platform_admin', t
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_update_platform_admin', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin())',
      t || '_update_platform_admin', t
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_delete_platform_admin', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (public.is_platform_admin())',
      t || '_delete_platform_admin', t
    );
  END LOOP;
END $$;

COMMENT ON TABLE public.digital_twin_source_adapters IS
  'RTB-SEC-RLS-1C PLATFORM_REFERENCE. Authenticated SELECT; writes is_platform_admin()/service_role. No anon.';
COMMENT ON TABLE public.digital_twin_state_schemas IS
  'RTB-SEC-RLS-1C PLATFORM_REFERENCE. Authenticated SELECT; writes is_platform_admin()/service_role. No anon.';
COMMENT ON TABLE public.digital_twin_source_authority_policies IS
  'RTB-SEC-RLS-1C PLATFORM_REFERENCE. Authenticated SELECT; writes is_platform_admin()/service_role. No anon.';

-- Security Assurance product tables are absent on production. Do not CREATE them.
-- RLS-1 statements against those relations are NOT_APPLICABLE_OBJECT_ABSENT.

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
  'RTB-SEC-RLS-1C canonical tenant membership helper. SECURITY DEFINER; search_path pinned to pg_catalog, public.';
COMMENT ON FUNCTION public.is_tenant_member(uuid) IS
  'RTB-SEC-RLS-1C canonical tenant membership predicate. SECURITY DEFINER; search_path pinned.';
COMMENT ON FUNCTION public.has_permission(text, text, uuid) IS
  'RTB-SEC-RLS-1C canonical tenant permission helper. SECURITY DEFINER; search_path pinned.';
COMMENT ON FUNCTION public.is_platform_admin() IS
  'Platform operator bypass. RTB-SEC-RLS-1C pinned search_path to pg_catalog, public.';

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

DO $$
BEGIN
  IF to_regprocedure('public.handle_new_user()') IS NOT NULL THEN
    ALTER FUNCTION public.handle_new_user() SET search_path = pg_catalog, public;
  END IF;
  IF to_regprocedure('public.generate_tenant_slug(text)') IS NOT NULL THEN
    ALTER FUNCTION public.generate_tenant_slug(text) SET search_path = pg_catalog, public;
  END IF;
  IF to_regprocedure('public.create_default_tenant_roles(uuid)') IS NOT NULL THEN
    ALTER FUNCTION public.create_default_tenant_roles(uuid) SET search_path = pg_catalog, public;
  END IF;
  IF to_regprocedure('public.handle_new_tenant()') IS NOT NULL THEN
    ALTER FUNCTION public.handle_new_tenant() SET search_path = pg_catalog, public;
  END IF;
  IF to_regprocedure('public.handle_new_tenant_kernel()') IS NOT NULL THEN
    ALTER FUNCTION public.handle_new_tenant_kernel() SET search_path = pg_catalog, public;
  END IF;
  IF to_regprocedure('public.provision_tenant_kernel_defaults(uuid)') IS NOT NULL THEN
    ALTER FUNCTION public.provision_tenant_kernel_defaults(uuid) SET search_path = pg_catalog, public;
  END IF;
  IF to_regprocedure('public.seed_tenant_engineering_os(uuid)') IS NOT NULL THEN
    ALTER FUNCTION public.seed_tenant_engineering_os(uuid) SET search_path = pg_catalog, public;
  END IF;
  IF to_regprocedure('public.seed_tenant_engineering_registers(uuid)') IS NOT NULL THEN
    ALTER FUNCTION public.seed_tenant_engineering_registers(uuid) SET search_path = pg_catalog, public;
  END IF;
  IF to_regprocedure('public.seed_tenant_intelligence(uuid)') IS NOT NULL THEN
    ALTER FUNCTION public.seed_tenant_intelligence(uuid) SET search_path = pg_catalog, public;
  END IF;
  IF to_regprocedure('public.seed_tenant_workflows(uuid)') IS NOT NULL THEN
    ALTER FUNCTION public.seed_tenant_workflows(uuid) SET search_path = pg_catalog, public;
  END IF;
END $$;

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
  'RTB-SEC-RLS-1C guard. Empty result = no RLS-disabled, unclassified, unresolved, unjustified-anon-grant, or unpinned canonical helper issues.';

REVOKE ALL ON FUNCTION public.rtb_sec_rls_public_violations() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rtb_sec_rls_public_violations() FROM anon;
REVOKE ALL ON FUNCTION public.rtb_sec_rls_public_violations() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.rtb_sec_rls_public_violations() TO service_role;

NOTIFY pgrst, 'reload schema';

INSERT INTO supabase_migrations.schema_migrations (version)
SELECT '20261007160000'
WHERE NOT EXISTS (
  SELECT 1 FROM supabase_migrations.schema_migrations WHERE version = '20261007160000'
);
