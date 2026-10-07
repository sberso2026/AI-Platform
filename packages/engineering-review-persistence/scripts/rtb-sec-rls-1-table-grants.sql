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
  AND grantee IN ('anon', 'authenticated', 'service_role')
GROUP BY table_name, grantee
ORDER BY table_name, grantee;
