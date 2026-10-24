SELECT p.proname,
       pg_get_functiondef(p.oid) AS def
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('get_user_tenant_ids', 'is_tenant_member', 'has_permission', 'is_platform_admin');
