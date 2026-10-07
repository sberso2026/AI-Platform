SELECT g.table_name,
       string_agg(DISTINCT g.privilege_type, ',' ORDER BY g.privilege_type) AS anon_write_privileges,
       c.relrowsecurity AS rls_enabled,
       s.classification
FROM information_schema.role_table_grants g
JOIN pg_class c ON c.relname = g.table_name
JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = g.table_schema
LEFT JOIN public.rtb_public_table_security_classification s ON s.table_name = g.table_name
WHERE g.table_schema = 'public'
  AND c.relkind = 'r'
  AND g.grantee = 'anon'
  AND g.privilege_type IN ('INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER')
GROUP BY g.table_name, c.relrowsecurity, s.classification
ORDER BY g.table_name;
