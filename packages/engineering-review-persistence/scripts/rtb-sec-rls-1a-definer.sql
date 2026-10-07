SELECT p.proname,
       pg_get_function_identity_arguments(p.oid) AS args,
       pg_get_userbyid(p.proowner) AS owner,
       COALESCE(array_to_string(p.proconfig, ';'), '') AS config,
       p.proacl::text AS acl
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prosecdef = true
  AND (
    p.proname ILIKE '%tenant%'
    OR p.proname ILIKE '%workspace%'
    OR p.proname ILIKE '%member%'
    OR p.proname ILIKE '%permission%'
    OR p.proname ILIKE '%platform_admin%'
    OR p.proname ILIKE '%auth%'
    OR p.proname IN ('get_user_tenant_ids','is_tenant_member','has_permission','is_platform_admin')
  )
ORDER BY p.proname;
