-- RTB-SEC-RLS-1C production inventory (read-only). Single result set.
SELECT json_build_object(
  'identity', json_build_object(
    'current_database', current_database(),
    'current_user', current_user
  ),
  'counts', json_build_object(
    'public_tables', (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r'),
    'rls_enabled', (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' AND c.relrowsecurity),
    'rls_disabled', (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' AND NOT c.relrowsecurity),
    'rls_forced', (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' AND c.relforcerowsecurity),
    'anon_grant_tables', (
      SELECT count(DISTINCT g.table_name)
      FROM information_schema.role_table_grants g
      JOIN pg_class c ON c.relname = g.table_name
      JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = g.table_schema
      WHERE g.table_schema = 'public' AND c.relkind = 'r' AND g.grantee = 'anon'
    ),
    'unrestricted_select_public', (
      SELECT count(*) FROM pg_policies
      WHERE schemaname = 'public' AND cmd = 'SELECT' AND 'public' = ANY (roles) AND qual IN ('true', '(true)')
    )
  ),
  'rls_disabled_tables', (
    SELECT coalesce(json_agg(json_build_object(
      'table_name', c.relname,
      'owner', pg_get_userbyid(c.relowner),
      'has_tenant_id', EXISTS (SELECT 1 FROM information_schema.columns col WHERE col.table_schema='public' AND col.table_name=c.relname AND col.column_name='tenant_id'),
      'has_workspace_id', EXISTS (SELECT 1 FROM information_schema.columns col WHERE col.table_schema='public' AND col.table_name=c.relname AND col.column_name='workspace_id'),
      'has_user_id', EXISTS (SELECT 1 FROM information_schema.columns col WHERE col.table_schema='public' AND col.table_name=c.relname AND col.column_name IN ('user_id','created_by')),
      'anon_privileges', (
        SELECT coalesce(json_agg(g.privilege_type ORDER BY g.privilege_type), '[]'::json)
        FROM information_schema.role_table_grants g
        WHERE g.table_schema='public' AND g.table_name=c.relname AND g.grantee='anon'
      ),
      'authenticated_privileges', (
        SELECT coalesce(json_agg(g.privilege_type ORDER BY g.privilege_type), '[]'::json)
        FROM information_schema.role_table_grants g
        WHERE g.table_schema='public' AND g.table_name=c.relname AND g.grantee='authenticated'
      ),
      'policy_count', (SELECT count(*) FROM pg_policies p WHERE p.schemaname='public' AND p.tablename=c.relname)
    ) ORDER BY c.relname), '[]'::json)
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT c.relrowsecurity
  ),
  'dt_and_taxonomy', (
    SELECT coalesce(json_agg(json_build_object(
      'table_name', c.relname,
      'exists', true,
      'rls', c.relrowsecurity,
      'columns', (
        SELECT json_agg(col.column_name ORDER BY col.ordinal_position)
        FROM information_schema.columns col
        WHERE col.table_schema='public' AND col.table_name=c.relname
      )
    ) ORDER BY c.relname), '[]'::json)
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname='public' AND c.relkind='r'
      AND c.relname IN (
        'digital_twin_source_adapters',
        'digital_twin_state_schemas',
        'digital_twin_source_authority_policies',
        'asset_intelligence_failure_taxonomy'
      )
  ),
  'unrestricted_select_policies', (
    SELECT coalesce(json_agg(json_build_object(
      'table_name', tablename,
      'policy_name', policyname,
      'roles', roles,
      'qual', qual
    ) ORDER BY tablename, policyname), '[]'::json)
    FROM pg_policies
    WHERE schemaname = 'public'
      AND cmd = 'SELECT'
      AND 'public' = ANY (roles)
      AND qual IN ('true', '(true)')
  ),
  'taxonomy_policies', (
    SELECT coalesce(json_agg(json_build_object(
      'policy_name', policyname,
      'cmd', cmd,
      'roles', roles,
      'qual', qual,
      'with_check', with_check
    ) ORDER BY policyname), '[]'::json)
    FROM pg_policies
    WHERE schemaname='public' AND tablename='asset_intelligence_failure_taxonomy'
  ),
  'helpers', (
    SELECT coalesce(json_agg(json_build_object(
      'proname', p.proname,
      'args', pg_get_function_identity_arguments(p.oid),
      'owner', pg_get_userbyid(p.proowner),
      'security_definer', p.prosecdef,
      'config', p.proconfig,
      'acl', p.proacl::text
    ) ORDER BY p.proname), '[]'::json)
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname='public'
      AND p.proname IN (
        'get_user_tenant_ids','is_tenant_member','has_permission','is_platform_admin',
        'handle_new_user','generate_tenant_slug','create_default_tenant_roles',
        'handle_new_tenant','handle_new_tenant_kernel','provision_tenant_kernel_defaults',
        'seed_tenant_engineering_os','seed_tenant_engineering_registers',
        'seed_tenant_intelligence','seed_tenant_workflows','rtb_sec_rls_public_violations'
      )
  ),
  'required_objects', json_build_object(
    'tenant_memberships', to_regclass('public.tenant_memberships') IS NOT NULL,
    'roles', to_regclass('public.roles') IS NOT NULL,
    'security_assurance_compliance_frameworks', to_regclass('public.security_assurance_compliance_frameworks') IS NOT NULL,
    'rtb_public_table_security_classification', to_regclass('public.rtb_public_table_security_classification') IS NOT NULL
  ),
  'security_migration_versions', CASE
    WHEN to_regclass('supabase_migrations.schema_migrations') IS NULL THEN '[]'::json
    ELSE coalesce((
      SELECT json_agg(version ORDER BY version)
      FROM supabase_migrations.schema_migrations
      WHERE version IN ('20261007120000','20261007140000','20261007160000')
    ), '[]'::json)
  END,
  'migration_head', CASE
    WHEN to_regclass('supabase_migrations.schema_migrations') IS NULL THEN '[]'::json
    ELSE coalesce((
      SELECT json_agg(version ORDER BY version DESC)
      FROM (SELECT version FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 5) t
    ), '[]'::json)
  END
) AS inventory;
