-- RTB-SEC-RLS-1: public-schema RLS remediation (STAGING / additive only)
--
-- Threat: eight public ordinary tables shipped without RLS while GRANT ALL
-- included anon + authenticated (SELECT/INSERT/UPDATE/DELETE/TRUNCATE).
-- Additive only: no destructive schema or data operations.
-- FORCE RLS is intentionally NOT applied: service_role and table owners must
-- continue to operate; browser roles are constrained by REVOKE + policies.
-- Canonical helpers reused: public.is_platform_admin(). Tenant/workspace
-- membership helpers are not applicable to these eight tables (no tenant_id /
-- workspace_id columns). Do not copy unrestricted catalog policies.

CREATE TABLE IF NOT EXISTS public.rtb_public_table_security_classification (
  table_name text PRIMARY KEY,
  classification text NOT NULL CHECK (classification IN (
    'TENANT_SCOPED',
    'WORKSPACE_SCOPED',
    'PROJECT_SCOPED',
    'USER_SCOPED',
    'PLATFORM_REFERENCE',
    'BACKEND_ONLY',
    'PUBLIC_INTENTIONAL',
    'UNRESOLVED'
  )),
  intended_read text NOT NULL,
  intended_write text NOT NULL,
  rationale text NOT NULL,
  classified_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.rtb_public_table_security_classification IS
  'RTB-SEC-RLS-1 explicit security decision register for public ordinary tables. Backend/service only.';

ALTER TABLE public.rtb_public_table_security_classification ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.rtb_public_table_security_classification FROM PUBLIC;
REVOKE ALL ON TABLE public.rtb_public_table_security_classification FROM anon;
REVOKE ALL ON TABLE public.rtb_public_table_security_classification FROM authenticated;
GRANT ALL ON TABLE public.rtb_public_table_security_classification TO service_role;

-- ---------------------------------------------------------------------------
-- Classification seed (current hosted public ordinary tables).
-- New public tables after this migration are UNCLASSIFIED until a later
-- migration inserts a row — the guard function fails closed.
-- ---------------------------------------------------------------------------
INSERT INTO public.rtb_public_table_security_classification (
  table_name, classification, intended_read, intended_write, rationale
)
SELECT
  c.relname,
  CASE
    WHEN c.relname = 'profiles' THEN 'USER_SCOPED'
    WHEN c.relname = 'tenants' THEN 'TENANT_SCOPED'
    WHEN c.relname IN (
      'digital_twin_source_adapters',
      'digital_twin_state_schemas',
      'digital_twin_source_authority_policies',
      'asset_intelligence_failure_taxonomy',
      'capability_dependencies',
      'capability_versions',
      'ai_tool_versions',
      'commercial_application_features',
      'commercial_features',
      'commercial_marketplace_products',
      'commercial_partner_products',
      'commercial_plan_entitlements',
      'commercial_plan_prices',
      'commercial_plans',
      'commercial_product_applications',
      'commercial_product_versions',
      'commercial_publishers',
      'commercial_usage_types',
      'engineering_application_registry',
      'eval_cases',
      'feature_assignments',
      'features',
      'inspection_pack_registry',
      'memory_scopes',
      'model_capabilities',
      'plugin_dependencies',
      'plugin_permissions',
      'plugin_versions',
      'plugins',
      'policy_actions',
      'policy_conditions',
      'policy_versions',
      'prompt_approvals',
      'prompt_variables'
    ) THEN 'PLATFORM_REFERENCE'
    WHEN c.relname IN (
      'rtb_public_table_security_classification',
      'rtb_anon_table_grant_exceptions',
      'security_assurance_compliance_frameworks',
      'security_assurance_compliance_framework_versions',
      'security_assurance_compliance_requirements',
      'security_assurance_compliance_control_mappings',
      'security_assurance_customer_claims',
      'agent_messages',
      'agent_tool_calls',
      'api_key_permissions',
      'command_centre_messages',
      'cost_allocations',
      'digital_twin_attributes',
      'digital_twin_status_history',
      'engineering_document_versions',
      'engineering_execution_host_health',
      'engineering_execution_job_artifacts',
      'engineering_handover_package_items',
      'eval_results',
      'event_dispatch_attempts',
      'job_attempts',
      'memory_links',
      'notification_deliveries',
      'prompt_versions',
      'secret_permissions',
      'secret_versions',
      'trace_spans',
      'workflow_step_runs',
      'workflow_steps',
      'workflow_transitions',
      'workflow_versions'
    ) THEN 'BACKEND_ONLY'
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns col
      WHERE col.table_schema = 'public' AND col.table_name = c.relname AND col.column_name = 'workspace_id'
    ) THEN 'WORKSPACE_SCOPED'
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns col
      WHERE col.table_schema = 'public' AND col.table_name = c.relname AND col.column_name = 'tenant_id'
    ) THEN 'TENANT_SCOPED'
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns col
      WHERE col.table_schema = 'public' AND col.table_name = c.relname AND col.column_name = 'project_id'
    ) THEN 'PROJECT_SCOPED'
    ELSE 'UNRESOLVED'
  END,
  CASE
    WHEN c.relname IN (
      'digital_twin_source_adapters',
      'digital_twin_state_schemas',
      'digital_twin_source_authority_policies'
    ) THEN 'authenticated SELECT (JWT present)'
    WHEN c.relname IN (
      'security_assurance_compliance_frameworks',
      'security_assurance_compliance_framework_versions',
      'security_assurance_compliance_requirements',
      'security_assurance_compliance_control_mappings',
      'security_assurance_customer_claims',
      'rtb_public_table_security_classification'
    ) THEN 'service_role / backend only'
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns col
      WHERE col.table_schema = 'public' AND col.table_name = c.relname AND col.column_name = 'workspace_id'
    ) THEN 'workspace membership'
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns col
      WHERE col.table_schema = 'public' AND col.table_name = c.relname AND col.column_name = 'tenant_id'
    ) OR c.relname = 'tenants' THEN 'tenant membership'
    WHEN c.relname = 'profiles' THEN 'own profile / tenant peers'
    ELSE 'documented existing policy / backend'
  END,
  CASE
    WHEN c.relname IN (
      'digital_twin_source_adapters',
      'digital_twin_state_schemas',
      'digital_twin_source_authority_policies'
    ) THEN 'is_platform_admin() or service_role'
    WHEN c.relname IN (
      'security_assurance_compliance_frameworks',
      'security_assurance_compliance_framework_versions',
      'security_assurance_compliance_requirements',
      'security_assurance_compliance_control_mappings',
      'security_assurance_customer_claims',
      'rtb_public_table_security_classification'
    ) THEN 'service_role / backend only'
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns col
      WHERE col.table_schema = 'public' AND col.table_name = c.relname AND col.column_name = 'workspace_id'
    ) THEN 'workspace membership'
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns col
      WHERE col.table_schema = 'public' AND col.table_name = c.relname AND col.column_name = 'tenant_id'
    ) THEN 'tenant membership'
    WHEN c.relname = 'profiles' THEN 'own profile'
    ELSE 'documented existing policy / backend'
  END,
  CASE
    WHEN c.relname IN (
      'digital_twin_source_adapters',
      'digital_twin_state_schemas',
      'digital_twin_source_authority_policies'
    ) THEN 'Global Digital Twin catalogs. Workspace snapshot reads adapters via user JWT; no tenant column. Writes are not exposed on client routes.'
    WHEN c.relname IN (
      'security_assurance_compliance_frameworks',
      'security_assurance_compliance_framework_versions',
      'security_assurance_compliance_requirements',
      'security_assurance_compliance_control_mappings'
    ) THEN 'Compliance catalog rows with no tenant_id. Application engines use in-memory seeds; no PostgREST client usage. Backend-only until a product read path exists.'
    WHEN c.relname = 'security_assurance_customer_claims' THEN
      'Approved claim catalog has no tenant_id (profiles/packages are tenant-scoped separately). No client PostgREST usage. Backend-only.'
    WHEN c.relname = 'rtb_public_table_security_classification' THEN
      'Security decision register. Client access would leak authorization architecture.'
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns col
      WHERE col.table_schema = 'public' AND col.table_name = c.relname AND col.column_name = 'workspace_id'
    ) THEN 'Hosted table has workspace_id; existing RLS uses workspace_memberships + get_user_tenant_ids(). Not remediating existing policies in this phase.'
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns col
      WHERE col.table_schema = 'public' AND col.table_name = c.relname AND col.column_name = 'tenant_id'
    ) THEN 'Hosted table has tenant_id without workspace_id; existing tenant membership RLS. Not remediating existing policies in this phase.'
    ELSE 'Unscoped public table with RLS already enabled at RTB-SEC-RLS-1 audit; classified from schema/name/existing policies. Existing unrestricted catalog reads are a later hardening phase, not weakened here.'
  END
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
ON CONFLICT (table_name) DO UPDATE
SET
  classification = EXCLUDED.classification,
  intended_read = EXCLUDED.intended_read,
  intended_write = EXCLUDED.intended_write,
  rationale = EXCLUDED.rationale,
  classified_at = now();

-- ---------------------------------------------------------------------------
-- Digital Twin global catalogs: PLATFORM_REFERENCE
-- Authenticated SELECT required by workspace-snapshot (user JWT).
-- Writes restricted to platform admin. Anon privileges revoked.
-- Authenticated SELECT requires a real user id; anonymous requests are denied.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'digital_twin_source_adapters',
    'digital_twin_state_schemas',
    'digital_twin_source_authority_policies'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC', t);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon', t);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM authenticated', t);
    EXECUTE format('GRANT SELECT ON TABLE public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON TABLE public.%I TO service_role', t);

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_select_authenticated', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL)',
      t || '_select_authenticated', t
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_insert_platform_admin', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_platform_admin())',
      t || '_insert_platform_admin', t
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_update_platform_admin', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin())',
      t || '_update_platform_admin', t
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_delete_platform_admin', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (public.is_platform_admin())',
      t || '_delete_platform_admin', t
    );
  END LOOP;
END $$;

COMMENT ON TABLE public.digital_twin_source_adapters IS
  'RTB-SEC-RLS-1 PLATFORM_REFERENCE. Authenticated SELECT; writes is_platform_admin()/service_role. No anon. No tenant column.';
COMMENT ON TABLE public.digital_twin_state_schemas IS
  'RTB-SEC-RLS-1 PLATFORM_REFERENCE. Authenticated SELECT; writes is_platform_admin()/service_role. No anon. No tenant column.';
COMMENT ON TABLE public.digital_twin_source_authority_policies IS
  'RTB-SEC-RLS-1 PLATFORM_REFERENCE. Authenticated SELECT; writes is_platform_admin()/service_role. No anon. No tenant column.';

-- ---------------------------------------------------------------------------
-- Security Assurance catalogs + customer claim templates: BACKEND_ONLY
-- No browser grants. RLS enabled with zero client policies (deny by default).
-- service_role retains ALL and bypasses RLS (FORCE not set).
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'security_assurance_compliance_frameworks',
    'security_assurance_compliance_framework_versions',
    'security_assurance_compliance_requirements',
    'security_assurance_compliance_control_mappings',
    'security_assurance_customer_claims'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC', t);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon', t);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM authenticated', t);
    EXECUTE format('GRANT ALL ON TABLE public.%I TO service_role', t);

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_select_authenticated', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_insert_platform_admin', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_update_platform_admin', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_delete_platform_admin', t);
  END LOOP;
END $$;

COMMENT ON TABLE public.security_assurance_compliance_frameworks IS
  'RTB-SEC-RLS-1 BACKEND_ONLY. Compliance catalog; no client grants; service_role only.';
COMMENT ON TABLE public.security_assurance_compliance_framework_versions IS
  'RTB-SEC-RLS-1 BACKEND_ONLY. Compliance catalog; no client grants; service_role only.';
COMMENT ON TABLE public.security_assurance_compliance_requirements IS
  'RTB-SEC-RLS-1 BACKEND_ONLY. Compliance catalog; no client grants; service_role only.';
COMMENT ON TABLE public.security_assurance_compliance_control_mappings IS
  'RTB-SEC-RLS-1 BACKEND_ONLY. Compliance catalog; no client grants; service_role only.';
COMMENT ON TABLE public.security_assurance_customer_claims IS
  'RTB-SEC-RLS-1 BACKEND_ONLY. Global claim templates (no tenant_id). Client grants revoked.';

-- ---------------------------------------------------------------------------
-- Regression guard: public ordinary table without RLS or without classification.
-- SECURITY DEFINER reads pg_catalog only; search_path pinned; not granted to
-- anon/authenticated. Does not accept table-name parameters (no SQL injection).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rtb_sec_rls_public_violations()
RETURNS TABLE(violation_code text, table_name text, detail text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT 'RLS_DISABLED'::text,
         c.relname::text,
         'public ordinary table has relrowsecurity=false'::text
  FROM pg_catalog.pg_class c
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND NOT c.relrowsecurity

  UNION ALL

  SELECT 'UNCLASSIFIED'::text,
         c.relname::text,
         'public ordinary table missing rtb_public_table_security_classification row'::text
  FROM pg_catalog.pg_class c
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND NOT EXISTS (
      SELECT 1
      FROM public.rtb_public_table_security_classification s
      WHERE s.table_name = c.relname
    )

  UNION ALL

  SELECT 'UNRESOLVED'::text,
         s.table_name,
         'classification is UNRESOLVED'::text
  FROM public.rtb_public_table_security_classification s
  WHERE s.classification = 'UNRESOLVED'

  UNION ALL

  SELECT 'UNJUSTIFIED_ANON_GRANT'::text,
         t.table_name::text,
         (g.privilege_type || ' granted to anon on remediated table')::text
  FROM information_schema.role_table_grants g
  JOIN (
    VALUES
      ('digital_twin_source_adapters'),
      ('digital_twin_state_schemas'),
      ('digital_twin_source_authority_policies'),
      ('security_assurance_compliance_frameworks'),
      ('security_assurance_compliance_framework_versions'),
      ('security_assurance_compliance_requirements'),
      ('security_assurance_compliance_control_mappings'),
      ('security_assurance_customer_claims'),
      ('rtb_public_table_security_classification')
  ) AS t(table_name) ON t.table_name = g.table_name
  WHERE g.table_schema = 'public'
    AND g.grantee = 'anon'
$$;

COMMENT ON FUNCTION public.rtb_sec_rls_public_violations() IS
  'RTB-SEC-RLS-1 CI/live guard. Empty result = no public RLS-disabled, unclassified, unresolved, or remediated-anon-grant tables.';

REVOKE ALL ON FUNCTION public.rtb_sec_rls_public_violations() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rtb_sec_rls_public_violations() FROM anon;
REVOKE ALL ON FUNCTION public.rtb_sec_rls_public_violations() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.rtb_sec_rls_public_violations() TO service_role;

NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  IF to_regclass('supabase_migrations.schema_migrations') IS NOT NULL THEN
    INSERT INTO supabase_migrations.schema_migrations (version)
    SELECT '20261007120000'
    WHERE NOT EXISTS (
      SELECT 1 FROM supabase_migrations.schema_migrations WHERE version = '20261007120000'
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;
