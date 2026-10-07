SELECT g.grantee,
       g.privilege_type,
       count(DISTINCT g.table_name) AS table_count
FROM information_schema.role_table_grants g
JOIN pg_class c ON c.relname = g.table_name
JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = g.table_schema
WHERE g.table_schema = 'public'
  AND c.relkind = 'r'
  AND g.grantee IN ('anon', 'PUBLIC')
GROUP BY g.grantee, g.privilege_type
ORDER BY g.grantee, g.privilege_type;
