SELECT n.nspname AS schema_name,
       c.relname AS view_name,
       c.relkind
FROM pg_rewrite r
JOIN pg_class c ON c.oid = r.ev_class
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_class t ON t.oid = r.ev_class
WHERE c.relkind IN ('v', 'm')
  AND pg_get_viewdef(c.oid) ILIKE ANY (ARRAY[
    '%digital_twin_source_adapters%',
    '%digital_twin_state_schemas%',
    '%digital_twin_source_authority_policies%',
    '%security_assurance_compliance_frameworks%',
    '%security_assurance_compliance_framework_versions%',
    '%security_assurance_compliance_requirements%',
    '%security_assurance_compliance_control_mappings%',
    '%security_assurance_customer_claims%'
  ]);
