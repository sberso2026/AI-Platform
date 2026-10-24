-- RTB-SEC-RLS-1: grants, policies, keys for RLS-disabled public tables (read-only).
SELECT c.relname AS table_name,
       COUNT(*) FILTER (WHERE c2.relname IS NOT NULL) AS dummy
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_class c2 ON false
WHERE n.nspname = 'public' AND c.relkind = 'r'
GROUP BY c.relname
LIMIT 0;

SELECT
  (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r') AS public_tables,
  (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' AND c.relrowsecurity) AS rls_enabled,
  (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' AND NOT c.relrowsecurity) AS rls_disabled;

SELECT table_name, grantee, string_agg(privilege_type, ',' ORDER BY privilege_type) AS privileges
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN (
    'digital_twin_source_adapters',
    'digital_twin_state_schemas',
    'digital_twin_source_authority_policies',
    'security_assurance_compliance_frameworks',
    'security_assurance_compliance_framework_versions',
    'security_assurance_compliance_requirements',
    'security_assurance_compliance_control_mappings',
    'security_assurance_customer_claims'
  )
  AND grantee IN ('anon', 'authenticated', 'service_role', 'postgres')
GROUP BY table_name, grantee
ORDER BY table_name, grantee;

SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check
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
    'security_assurance_customer_claims'
  )
ORDER BY tablename, policyname;

SELECT tc.table_name, tc.constraint_type, kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
WHERE tc.table_schema = 'public'
  AND tc.table_name IN (
    'digital_twin_source_adapters',
    'digital_twin_state_schemas',
    'digital_twin_source_authority_policies',
    'security_assurance_compliance_frameworks',
    'security_assurance_compliance_framework_versions',
    'security_assurance_compliance_requirements',
    'security_assurance_compliance_control_mappings',
    'security_assurance_customer_claims'
  )
  AND tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY')
ORDER BY tc.table_name, tc.constraint_type, kcu.ordinal_position;
