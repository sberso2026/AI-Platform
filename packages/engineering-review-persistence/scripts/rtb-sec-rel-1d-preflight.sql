-- RTB-SEC-REL-1D read-only preflight. No schema or data mutation.
SELECT json_build_object(
  'fn', (
    SELECT json_build_object(
      'schema', n.nspname,
      'name', p.proname,
      'identity_args', pg_get_function_identity_arguments(p.oid),
      'result', pg_get_function_result(p.oid),
      'language', l.lanname,
      'security_definer', p.prosecdef,
      'owner', pg_get_userbyid(p.proowner),
      'config', p.proconfig,
      'fingerprint', md5(pg_get_functiondef(p.oid)),
      'src_mentions_pg_catalog_only_names', p.prosrc ILIKE '%pg_proc%' OR p.prosrc ILIKE '%pg_namespace%'
    )
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    JOIN pg_language l ON l.oid = p.prolang
    WHERE n.nspname = 'public'
      AND p.proname = 'provision_signup_commercial_defaults'
      AND pg_get_function_identity_arguments(p.oid) = 'p_tenant_id uuid, p_user_id uuid'
  ),
  'acl', (
    SELECT json_agg(json_build_object(
      'grantee', CASE WHEN a.grantee = 0 THEN 'PUBLIC' ELSE COALESCE(r.rolname, a.grantee::text) END,
      'privilege', a.privilege_type
    ) ORDER BY 1)
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    JOIN LATERAL aclexplode(COALESCE(p.proacl, acldefault('f'::"char", p.proowner))) a ON true
    LEFT JOIN pg_roles r ON r.oid = a.grantee
    WHERE n.nspname = 'public'
      AND p.proname = 'provision_signup_commercial_defaults'
      AND pg_get_function_identity_arguments(p.oid) = 'p_tenant_id uuid, p_user_id uuid'
      AND a.privilege_type = 'EXECUTE'
  ),
  'handle_new_user_mentions', (
    SELECT p.prosrc ILIKE '%provision_signup_commercial_defaults%'
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'handle_new_user'
    LIMIT 1
  ),
  'handle_new_tenant_mentions', (
    SELECT p.prosrc ILIKE '%provision_signup_commercial_defaults%'
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'handle_new_tenant'
    LIMIT 1
  ),
  'other_proc_callers', (
    SELECT coalesce(json_agg(json_build_object('schema', n.nspname, 'name', p.proname) ORDER BY p.proname), '[]'::json)
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.prosrc ILIKE '%provision_signup_commercial_defaults%'
      AND NOT (n.nspname = 'public' AND p.proname = 'provision_signup_commercial_defaults')
  ),
  'ledger_head', (
    SELECT json_agg(version ORDER BY version DESC)
    FROM (
      SELECT version FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 8
    ) t
  )
) AS preflight;
