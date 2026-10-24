-- RTB-SEC-REL-1E read-only inventory of SECURITY DEFINER functions
-- executable by PUBLIC, anon, or authenticated. One row per function.
SELECT coalesce(json_agg(row_data ORDER BY row_data->>'name'), '[]'::json) AS inventory
FROM (
  SELECT json_build_object(
    'schema', n.nspname,
    'name', p.proname,
    'identity_args', pg_catalog.pg_get_function_identity_arguments(p.oid),
    'result', pg_catalog.pg_get_function_result(p.oid),
    'language', l.lanname,
    'owner', pg_catalog.pg_get_userbyid(p.proowner),
    'security_definer', p.prosecdef,
    'search_path', p.proconfig,
    'acl_is_default', p.proacl IS NULL,
    'public_execute', EXISTS (
      SELECT 1 FROM pg_catalog.aclexplode(COALESCE(p.proacl, pg_catalog.acldefault('f'::"char", p.proowner))) a
      WHERE a.privilege_type = 'EXECUTE' AND a.grantee = 0
    ),
    'anon_execute', EXISTS (
      SELECT 1
      FROM pg_catalog.aclexplode(COALESCE(p.proacl, pg_catalog.acldefault('f'::"char", p.proowner))) a
      LEFT JOIN pg_catalog.pg_roles r ON r.oid = a.grantee
      WHERE a.privilege_type = 'EXECUTE' AND r.rolname = 'anon'
    ),
    'authenticated_execute', EXISTS (
      SELECT 1
      FROM pg_catalog.aclexplode(COALESCE(p.proacl, pg_catalog.acldefault('f'::"char", p.proowner))) a
      LEFT JOIN pg_catalog.pg_roles r ON r.oid = a.grantee
      WHERE a.privilege_type = 'EXECUTE' AND r.rolname = 'authenticated'
    ),
    'service_role_execute', EXISTS (
      SELECT 1
      FROM pg_catalog.aclexplode(COALESCE(p.proacl, pg_catalog.acldefault('f'::"char", p.proowner))) a
      LEFT JOIN pg_catalog.pg_roles r ON r.oid = a.grantee
      WHERE a.privilege_type = 'EXECUTE' AND r.rolname = 'service_role'
    ),
    'postgres_execute', EXISTS (
      SELECT 1
      FROM pg_catalog.aclexplode(COALESCE(p.proacl, pg_catalog.acldefault('f'::"char", p.proowner))) a
      LEFT JOIN pg_catalog.pg_roles r ON r.oid = a.grantee
      WHERE a.privilege_type = 'EXECUTE' AND r.rolname = 'postgres'
    ),
    'execute_grantees', (
      SELECT coalesce(json_agg(grantee ORDER BY grantee), '[]'::json)
      FROM (
        SELECT DISTINCT CASE WHEN a.grantee = 0 THEN 'PUBLIC' ELSE COALESCE(r.rolname, a.grantee::text) END AS grantee
        FROM pg_catalog.aclexplode(COALESCE(p.proacl, pg_catalog.acldefault('f'::"char", p.proowner))) a
        LEFT JOIN pg_catalog.pg_roles r ON r.oid = a.grantee
        WHERE a.privilege_type = 'EXECUTE'
      ) g
    ),
    'mentions_auth_uid', p.prosrc ILIKE '%auth.uid%',
    'mentions_auth_role', p.prosrc ILIKE '%auth.role%',
    'mentions_is_tenant_member', p.prosrc ILIKE '%is_tenant_member%',
    'mentions_get_user_tenant_ids', p.prosrc ILIKE '%get_user_tenant_ids%',
    'mentions_has_permission', p.prosrc ILIKE '%has_permission%',
    'mentions_is_platform_admin', p.prosrc ILIKE '%is_platform_admin%',
    'mentions_service_role', p.prosrc ILIKE '%service_role%',
    'mentions_execute', p.prosrc ILIKE '%EXECUTE %' OR p.prosrc ILIKE '%EXECUTE IMMEDIATE%',
    'src_len', length(p.prosrc)
  ) AS row_data
  FROM pg_catalog.pg_proc p
  JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
  JOIN pg_catalog.pg_language l ON l.oid = p.prolang
  WHERE n.nspname = 'public'
    AND p.prosecdef
    AND EXISTS (
      SELECT 1
      FROM pg_catalog.aclexplode(COALESCE(p.proacl, pg_catalog.acldefault('f'::"char", p.proowner))) a
      LEFT JOIN pg_catalog.pg_roles r ON r.oid = a.grantee
      WHERE a.privilege_type = 'EXECUTE'
        AND (a.grantee = 0 OR r.rolname IN ('anon', 'authenticated'))
    )
) s;
