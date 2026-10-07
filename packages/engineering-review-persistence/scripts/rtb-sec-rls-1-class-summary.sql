SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.columns col WHERE col.table_schema='public' AND col.table_name=c.relname AND col.column_name='workspace_id')
      THEN 'HAS_WORKSPACE'
    WHEN EXISTS (SELECT 1 FROM information_schema.columns col WHERE col.table_schema='public' AND col.table_name=c.relname AND col.column_name='tenant_id')
      THEN 'HAS_TENANT_ONLY'
    WHEN EXISTS (SELECT 1 FROM information_schema.columns col WHERE col.table_schema='public' AND col.table_name=c.relname AND col.column_name='project_id')
      THEN 'HAS_PROJECT_ONLY'
    ELSE 'UNSCOPED'
  END AS bucket,
  count(*) AS n,
  count(*) FILTER (WHERE NOT c.relrowsecurity) AS rls_disabled
FROM pg_class c
JOIN pg_namespace ns ON ns.oid = c.relnamespace
WHERE ns.nspname = 'public' AND c.relkind = 'r'
GROUP BY 1
ORDER BY 1;
