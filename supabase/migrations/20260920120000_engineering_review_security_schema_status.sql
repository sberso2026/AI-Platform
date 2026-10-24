-- ERA-7 additive security schema status. Does not edit historical migrations.

CREATE OR REPLACE FUNCTION engineering_review_security_schema_status()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT jsonb_build_object(
    'core_workspace_member', EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname = 'engineering_core_workspace_member'
    ),
    'projects_policy_workspace', EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'engineering_projects'
        AND policyname = 'eng_projects_select'
        AND COALESCE(qual, '') ILIKE '%engineering_core_workspace_member%'
    ),
    'documents_policy_workspace', EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'engineering_documents'
        AND policyname = 'eng_documents_select'
        AND COALESCE(qual, '') ILIKE '%engineering_core_workspace_member%'
    ),
    'review_tables_ready', (
      SELECT COUNT(*) = 5 FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN (
          'engineering_review_packages',
          'engineering_review_runs',
          'engineering_review_findings',
          'engineering_review_evidence',
          'engineering_review_dispositions'
        )
    )
  );
$$;

REVOKE ALL ON FUNCTION engineering_review_security_schema_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION engineering_review_security_schema_status() TO authenticated, service_role;

COMMENT ON FUNCTION engineering_review_security_schema_status() IS
  'ERA-7: fail-closed deployment check for Core workspace RLS and Review tables.';
