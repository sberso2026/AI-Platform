-- RTB-SEC-REL-1D post-apply privilege verification. Read-only.
SELECT json_build_object(
  'present', to_regprocedure('public.provision_signup_commercial_defaults(uuid, uuid)') IS NOT NULL,
  'security_definer', (
    SELECT p.prosecdef
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'provision_signup_commercial_defaults'
      AND pg_get_function_identity_arguments(p.oid) = 'p_tenant_id uuid, p_user_id uuid'
  ),
  'owner', (
    SELECT pg_get_userbyid(p.proowner)
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'provision_signup_commercial_defaults'
      AND pg_get_function_identity_arguments(p.oid) = 'p_tenant_id uuid, p_user_id uuid'
  ),
  'search_path', (
    SELECT p.proconfig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'provision_signup_commercial_defaults'
      AND pg_get_function_identity_arguments(p.oid) = 'p_tenant_id uuid, p_user_id uuid'
  ),
  'fingerprint', (
    SELECT md5(pg_get_functiondef(p.oid))
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'provision_signup_commercial_defaults'
      AND pg_get_function_identity_arguments(p.oid) = 'p_tenant_id uuid, p_user_id uuid'
  ),
  'execute_grantees', (
    SELECT coalesce(json_agg(CASE WHEN a.grantee = 0 THEN 'PUBLIC' ELSE COALESCE(r.rolname, a.grantee::text) END ORDER BY 1), '[]'::json)
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    JOIN LATERAL aclexplode(COALESCE(p.proacl, acldefault('f'::"char", p.proowner))) a ON true
    LEFT JOIN pg_roles r ON r.oid = a.grantee
    WHERE n.nspname = 'public'
      AND p.proname = 'provision_signup_commercial_defaults'
      AND pg_get_function_identity_arguments(p.oid) = 'p_tenant_id uuid, p_user_id uuid'
      AND a.privilege_type = 'EXECUTE'
  ),
  'ledger', (
    SELECT EXISTS (
      SELECT 1 FROM supabase_migrations.schema_migrations WHERE version = '20261007180000'
    )
  )
) AS verify;
