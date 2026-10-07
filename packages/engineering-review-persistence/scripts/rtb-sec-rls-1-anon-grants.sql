SELECT table_name, string_agg(privilege_type, ',' ORDER BY privilege_type) AS anon_privileges
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND grantee = 'anon'
  AND privilege_type IN ('SELECT','INSERT','UPDATE','DELETE')
GROUP BY table_name
ORDER BY table_name;
