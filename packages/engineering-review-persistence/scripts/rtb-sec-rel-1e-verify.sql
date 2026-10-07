-- RTB-SEC-REL-1E post-apply read-only verification.
SELECT json_build_object(
  'ledger', EXISTS (
    SELECT 1 FROM supabase_migrations.schema_migrations WHERE version = '20261007190000'
  ),
  'assert_fn', to_regprocedure('public.rtb_sec_rel_1e_assert_tenant_caller(uuid)') IS NOT NULL,
  'counts', (
    SELECT json_build_object(
      'in_scope', count(DISTINCT p.oid),
      'public_execute', count(DISTINCT p.oid) FILTER (
        WHERE EXISTS (
          SELECT 1 FROM aclexplode(COALESCE(p.proacl, acldefault('f'::"char", p.proowner))) a
          WHERE a.privilege_type = 'EXECUTE' AND a.grantee = 0
        )
      ),
      'anon_execute', count(DISTINCT p.oid) FILTER (
        WHERE EXISTS (
          SELECT 1
          FROM aclexplode(COALESCE(p.proacl, acldefault('f'::"char", p.proowner))) a
          JOIN pg_roles r ON r.oid = a.grantee
          WHERE a.privilege_type = 'EXECUTE' AND r.rolname = 'anon'
        )
      ),
      'authenticated_execute', count(DISTINCT p.oid) FILTER (
        WHERE EXISTS (
          SELECT 1
          FROM aclexplode(COALESCE(p.proacl, acldefault('f'::"char", p.proowner))) a
          JOIN pg_roles r ON r.oid = a.grantee
          WHERE a.privilege_type = 'EXECUTE' AND r.rolname = 'authenticated'
        )
      )
    )
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef
      AND EXISTS (
        SELECT 1
        FROM aclexplode(COALESCE(p.proacl, acldefault('f'::"char", p.proowner))) a
        LEFT JOIN pg_roles r ON r.oid = a.grantee
        WHERE a.privilege_type = 'EXECUTE'
          AND (a.grantee = 0 OR r.rolname IN ('anon', 'authenticated'))
      )
  ),
  'functions', (
    SELECT coalesce(json_agg(json_build_object(
      'name', p.proname,
      'args', pg_get_function_identity_arguments(p.oid),
      'search_path', p.proconfig,
      'public_execute', EXISTS (
        SELECT 1 FROM aclexplode(COALESCE(p.proacl, acldefault('f'::"char", p.proowner))) a
        WHERE a.privilege_type = 'EXECUTE' AND a.grantee = 0
      ),
      'anon_execute', EXISTS (
        SELECT 1 FROM aclexplode(COALESCE(p.proacl, acldefault('f'::"char", p.proowner))) a
        JOIN pg_roles r ON r.oid = a.grantee
        WHERE a.privilege_type = 'EXECUTE' AND r.rolname = 'anon'
      ),
      'authenticated_execute', EXISTS (
        SELECT 1 FROM aclexplode(COALESCE(p.proacl, acldefault('f'::"char", p.proowner))) a
        JOIN pg_roles r ON r.oid = a.grantee
        WHERE a.privilege_type = 'EXECUTE' AND r.rolname = 'authenticated'
      ),
      'grantees', (
        SELECT coalesce(json_agg(grantee ORDER BY grantee), '[]'::json)
        FROM (
          SELECT DISTINCT CASE WHEN a.grantee = 0 THEN 'PUBLIC' ELSE COALESCE(r.rolname, a.grantee::text) END AS grantee
          FROM aclexplode(COALESCE(p.proacl, acldefault('f'::"char", p.proowner))) a
          LEFT JOIN pg_roles r ON r.oid = a.grantee
          WHERE a.privilege_type = 'EXECUTE'
        ) g
      )
    ) ORDER BY p.proname), '[]'::json)
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef
      AND p.proname IN (
        'bump_commercial_entitlement_version',
        'bump_commercial_installation_version',
        'create_default_tenant_roles',
        'generate_tenant_slug',
        'get_user_tenant_ids',
        'handle_new_tenant',
        'handle_new_tenant_kernel',
        'handle_new_user',
        'has_permission',
        'is_platform_admin',
        'is_tenant_member',
        'pi_document_claim_jobs',
        'pi_document_enqueue_processing',
        'pi_document_ensure_core_document',
        'pi_document_lexical_search',
        'pi_document_release_expired_leases',
        'pi_document_renew_lease',
        'pi_document_set_embedding_vector',
        'pi_document_vector_search',
        'pi_meeting_claim_jobs',
        'pi_meeting_release_expired_leases',
        'provision_signup_commercial_defaults',
        'provision_tenant_kernel_defaults',
        'reset_engineering_os_demo_data',
        'seed_engineering_os_demo_data',
        'seed_tenant_engineering_os',
        'seed_tenant_engineering_registers',
        'seed_tenant_intelligence',
        'seed_tenant_workflows',
        'rtb_sec_rel_1e_assert_tenant_caller'
      )
  )
) AS verify;
