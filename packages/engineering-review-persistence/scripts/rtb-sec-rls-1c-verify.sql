-- RTB-SEC-RLS-1C post-migration verification (read-only).
SELECT json_build_object(
  'counts', json_build_object(
    'public_tables', (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r'),
    'rls_disabled', (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' AND NOT c.relrowsecurity),
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
    ),
    'unresolved', (SELECT count(*) FROM public.rtb_public_table_security_classification WHERE classification = 'UNRESOLVED')
  ),
  'violations', (SELECT coalesce(json_agg(json_build_object('code', violation_code, 'table_name', table_name, 'detail', detail)), '[]'::json) FROM public.rtb_sec_rls_public_violations()),
  'helpers', (
    SELECT coalesce(json_object_agg(p.proname, p.proconfig), '{}'::json)
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname='public' AND p.proname IN ('get_user_tenant_ids','is_tenant_member','has_permission','is_platform_admin')
  ),
  'security_assurance_present', to_regclass('public.security_assurance_compliance_frameworks') IS NOT NULL,
  'ledger', coalesce((
    SELECT json_agg(version ORDER BY version)
    FROM supabase_migrations.schema_migrations
    WHERE version IN ('20261007120000','20261007140000','20261007160000')
  ), '[]'::json)
) AS verify;
