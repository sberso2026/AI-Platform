-- RTB-SEC-REL-1D read-only: whether writer DEFINER bodies check caller identity.
SELECT json_agg(json_build_object(
  'name', p.proname,
  'args', pg_get_function_identity_arguments(p.oid),
  'mentions_auth_uid', p.prosrc ILIKE '%auth.uid%',
  'mentions_auth_role', p.prosrc ILIKE '%auth.role%',
  'mentions_is_tenant_member', p.prosrc ILIKE '%is_tenant_member%',
  'mentions_has_permission', p.prosrc ILIKE '%has_permission%',
  'mentions_service_role', p.prosrc ILIKE '%service_role%'
) ORDER BY p.proname) AS review
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prosecdef
  AND p.proname IN (
    'create_default_tenant_roles',
    'generate_tenant_slug',
    'provision_tenant_kernel_defaults',
    'seed_tenant_engineering_os',
    'seed_tenant_engineering_registers',
    'seed_tenant_intelligence',
    'seed_tenant_workflows',
    'seed_engineering_os_demo_data',
    'reset_engineering_os_demo_data',
    'bump_commercial_entitlement_version',
    'bump_commercial_installation_version',
    'provision_signup_commercial_defaults'
  );
