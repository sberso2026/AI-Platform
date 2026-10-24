SELECT p.proname,
       pg_get_userbyid(p.proowner) AS owner,
       p.prosecdef AS security_definer,
       p.proconfig AS config,
       p.proacl::text AS acl,
       pg_get_function_identity_arguments(p.oid) AS args
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
    'get_user_tenant_ids',
    'is_tenant_member',
    'has_permission',
    'is_platform_admin',
    'rtb_sec_rls_public_violations'
  )
ORDER BY p.proname;
