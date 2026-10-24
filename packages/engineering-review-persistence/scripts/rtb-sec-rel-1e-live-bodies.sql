-- RTB-SEC-REL-1E read-only live bodies for functions that may receive
-- membership hardening. Not historical reconstruction.
SELECT json_agg(json_build_object(
  'name', p.proname,
  'identity_args', pg_catalog.pg_get_function_identity_arguments(p.oid),
  'search_path', p.proconfig,
  'src', p.prosrc
) ORDER BY p.proname) AS bodies
FROM pg_catalog.pg_proc p
JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
    'bump_commercial_entitlement_version',
    'bump_commercial_installation_version',
    'seed_engineering_os_demo_data',
    'reset_engineering_os_demo_data',
    'seed_tenant_engineering_os'
  );
