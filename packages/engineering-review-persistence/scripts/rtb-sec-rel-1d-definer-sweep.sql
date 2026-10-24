-- RTB-SEC-REL-1D read-only SECURITY DEFINER execute inventory.
SELECT coalesce(json_agg(row_data ORDER BY row_data->>'name'), '[]'::json) AS sweep
FROM (
  SELECT json_build_object(
    'schema', n.nspname,
    'name', p.proname,
    'args', pg_get_function_identity_arguments(p.oid),
    'security_definer', p.prosecdef,
    'search_path', p.proconfig,
    'grantee', CASE WHEN a.grantee = 0 THEN 'PUBLIC' ELSE COALESCE(r.rolname, a.grantee::text) END
  ) AS row_data
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  JOIN LATERAL aclexplode(COALESCE(p.proacl, acldefault('f'::"char", p.proowner))) a ON true
  LEFT JOIN pg_roles r ON r.oid = a.grantee
  WHERE n.nspname = 'public'
    AND p.prosecdef
    AND a.privilege_type = 'EXECUTE'
    AND (
      a.grantee = 0
      OR r.rolname IN ('anon', 'authenticated', 'PUBLIC')
    )
) s;
