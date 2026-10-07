-- RTB-SEC-REL-1D read-only SECURITY DEFINER untrusted-execute summary.
SELECT json_build_object(
  'distinct_functions', (
    SELECT count(DISTINCT p.oid)
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    JOIN LATERAL aclexplode(COALESCE(p.proacl, acldefault('f'::"char", p.proowner))) a ON true
    LEFT JOIN pg_roles r ON r.oid = a.grantee
    WHERE n.nspname = 'public'
      AND p.prosecdef
      AND a.privilege_type = 'EXECUTE'
      AND (a.grantee = 0 OR r.rolname IN ('anon', 'authenticated'))
  ),
  'grant_rows', (
    SELECT count(*)
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    JOIN LATERAL aclexplode(COALESCE(p.proacl, acldefault('f'::"char", p.proowner))) a ON true
    LEFT JOIN pg_roles r ON r.oid = a.grantee
    WHERE n.nspname = 'public'
      AND p.prosecdef
      AND a.privilege_type = 'EXECUTE'
      AND (a.grantee = 0 OR r.rolname IN ('anon', 'authenticated'))
  ),
  'names', (
    SELECT coalesce(json_agg(name ORDER BY name), '[]'::json)
    FROM (
      SELECT DISTINCT p.proname AS name
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      JOIN LATERAL aclexplode(COALESCE(p.proacl, acldefault('f'::"char", p.proowner))) a ON true
      LEFT JOIN pg_roles r ON r.oid = a.grantee
      WHERE n.nspname = 'public'
        AND p.prosecdef
        AND a.privilege_type = 'EXECUTE'
        AND (a.grantee = 0 OR r.rolname IN ('anon', 'authenticated'))
    ) t
  ),
  'quarantined_untrusted', (
    SELECT EXISTS (
      SELECT 1
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      JOIN LATERAL aclexplode(COALESCE(p.proacl, acldefault('f'::"char", p.proowner))) a ON true
      LEFT JOIN pg_roles r ON r.oid = a.grantee
      WHERE n.nspname = 'public'
        AND p.proname = 'provision_signup_commercial_defaults'
        AND p.prosecdef
        AND a.privilege_type = 'EXECUTE'
        AND (a.grantee = 0 OR r.rolname IN ('anon', 'authenticated'))
    )
  )
) AS summary;
