-- RTB-SEC-RLS-1B production pre-flight (read-only). Single result set. Do not print secrets.
SELECT json_build_object(
  'identity', json_build_object(
    'current_database', current_database(),
    'current_user', current_user
  ),
  'counts', json_build_object(
    'public_tables', (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r'),
    'rls_enabled', (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' AND c.relrowsecurity),
    'rls_disabled', (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' AND NOT c.relrowsecurity),
    'rls_forced', (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' AND c.relforcerowsecurity),
    'anon_grant_tables', (
      SELECT count(DISTINCT g.table_name)
      FROM information_schema.role_table_grants g
      JOIN pg_class c ON c.relname = g.table_name
      JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = g.table_schema
      WHERE g.table_schema = 'public' AND c.relkind = 'r' AND g.grantee = 'anon'
    ),
    'anon_grant_rows', (
      SELECT count(*)
      FROM information_schema.role_table_grants g
      JOIN pg_class c ON c.relname = g.table_name
      JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = g.table_schema
      WHERE g.table_schema = 'public' AND c.relkind = 'r' AND g.grantee = 'anon'
    )
  ),
  'rls_disabled_tables', (
    SELECT coalesce(json_agg(c.relname ORDER BY c.relname), '[]'::json)
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT c.relrowsecurity
  ),
  'required_tables', json_build_object(
    'digital_twin_source_adapters', to_regclass('public.digital_twin_source_adapters') IS NOT NULL,
    'digital_twin_state_schemas', to_regclass('public.digital_twin_state_schemas') IS NOT NULL,
    'digital_twin_source_authority_policies', to_regclass('public.digital_twin_source_authority_policies') IS NOT NULL,
    'security_assurance_compliance_frameworks', to_regclass('public.security_assurance_compliance_frameworks') IS NOT NULL,
    'security_assurance_compliance_framework_versions', to_regclass('public.security_assurance_compliance_framework_versions') IS NOT NULL,
    'security_assurance_compliance_requirements', to_regclass('public.security_assurance_compliance_requirements') IS NOT NULL,
    'security_assurance_compliance_control_mappings', to_regclass('public.security_assurance_compliance_control_mappings') IS NOT NULL,
    'security_assurance_customer_claims', to_regclass('public.security_assurance_customer_claims') IS NOT NULL,
    'asset_intelligence_failure_taxonomy', to_regclass('public.asset_intelligence_failure_taxonomy') IS NOT NULL,
    'tenant_memberships', to_regclass('public.tenant_memberships') IS NOT NULL,
    'roles', to_regclass('public.roles') IS NOT NULL,
    'rtb_public_table_security_classification', to_regclass('public.rtb_public_table_security_classification') IS NOT NULL,
    'rtb_anon_table_grant_exceptions', to_regclass('public.rtb_anon_table_grant_exceptions') IS NOT NULL
  ),
  'required_columns', json_build_object(
    'tenant_memberships_user_id', EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tenant_memberships' AND column_name='user_id'),
    'tenant_memberships_tenant_id', EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tenant_memberships' AND column_name='tenant_id'),
    'tenant_memberships_status', EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tenant_memberships' AND column_name='status'),
    'tenant_memberships_role_id', EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tenant_memberships' AND column_name='role_id'),
    'roles_id', EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='roles' AND column_name='id'),
    'roles_permissions', EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='roles' AND column_name='permissions'),
    'roles_slug', EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='roles' AND column_name='slug')
  ),
  'helpers', (
    SELECT coalesce(json_object_agg(p.proname, json_build_object(
      'exists', true,
      'security_definer', p.prosecdef,
      'config', p.proconfig,
      'args', pg_get_function_identity_arguments(p.oid)
    )), '{}'::json)
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'get_user_tenant_ids',
        'is_tenant_member',
        'has_permission',
        'is_platform_admin',
        'rtb_sec_rls_public_violations',
        'handle_new_user'
      )
  ),
  'required_roles', json_build_object(
    'anon', EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon'),
    'authenticated', EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated'),
    'service_role', EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role'),
    'postgres', EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'postgres')
  ),
  'security_migration_versions', CASE
    WHEN to_regclass('supabase_migrations.schema_migrations') IS NULL THEN '[]'::json
    ELSE coalesce((
      SELECT json_agg(version ORDER BY version)
      FROM supabase_migrations.schema_migrations
      WHERE version IN ('20261007120000', '20261007140000')
    ), '[]'::json)
  END,
  'migration_head', CASE
    WHEN to_regclass('supabase_migrations.schema_migrations') IS NULL THEN '[]'::json
    ELSE coalesce((
      SELECT json_agg(version ORDER BY version DESC)
      FROM (
        SELECT version FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 20
      ) t
    ), '[]'::json)
  END,
  'remediating_table_policies', coalesce((
    SELECT json_agg(json_build_object(
      'table_name', tablename,
      'policy_name', policyname,
      'cmd', cmd,
      'roles', roles,
      'qual', left(qual, 80)
    ) ORDER BY tablename, policyname)
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'digital_twin_source_adapters',
        'digital_twin_state_schemas',
        'digital_twin_source_authority_policies',
        'security_assurance_compliance_frameworks',
        'security_assurance_compliance_framework_versions',
        'security_assurance_compliance_requirements',
        'security_assurance_compliance_control_mappings',
        'security_assurance_customer_claims',
        'asset_intelligence_failure_taxonomy'
      )
  ), '[]'::json),
  'simulated_unresolved', coalesce((
    SELECT json_agg(relname ORDER BY relname)
    FROM (
      SELECT c.relname
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relkind = 'r'
        AND c.relname NOT IN (
          'profiles', 'tenants',
          'digital_twin_source_adapters', 'digital_twin_state_schemas', 'digital_twin_source_authority_policies',
          'asset_intelligence_failure_taxonomy', 'capability_dependencies', 'capability_versions', 'ai_tool_versions',
          'commercial_application_features', 'commercial_features', 'commercial_marketplace_products',
          'commercial_partner_products', 'commercial_plan_entitlements', 'commercial_plan_prices', 'commercial_plans',
          'commercial_product_applications', 'commercial_product_versions', 'commercial_publishers', 'commercial_usage_types',
          'engineering_application_registry', 'eval_cases', 'feature_assignments', 'features', 'inspection_pack_registry',
          'memory_scopes', 'model_capabilities', 'plugin_dependencies', 'plugin_permissions', 'plugin_versions', 'plugins',
          'policy_actions', 'policy_conditions', 'policy_versions', 'prompt_approvals', 'prompt_variables',
          'rtb_public_table_security_classification', 'rtb_anon_table_grant_exceptions',
          'security_assurance_compliance_frameworks', 'security_assurance_compliance_framework_versions',
          'security_assurance_compliance_requirements', 'security_assurance_compliance_control_mappings',
          'security_assurance_customer_claims', 'agent_messages', 'agent_tool_calls', 'api_key_permissions',
          'command_centre_messages', 'cost_allocations', 'digital_twin_attributes', 'digital_twin_status_history',
          'engineering_document_versions', 'engineering_execution_host_health', 'engineering_execution_job_artifacts',
          'engineering_handover_package_items', 'eval_results', 'event_dispatch_attempts', 'job_attempts',
          'memory_links', 'notification_deliveries', 'prompt_versions', 'secret_permissions', 'secret_versions',
          'trace_spans', 'workflow_step_runs', 'workflow_steps', 'workflow_transitions', 'workflow_versions'
        )
        AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns col
          WHERE col.table_schema = 'public' AND col.table_name = c.relname AND col.column_name = 'workspace_id'
        )
        AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns col
          WHERE col.table_schema = 'public' AND col.table_name = c.relname AND col.column_name = 'tenant_id'
        )
    ) u
  ), '[]'::json)
) AS preflight;
