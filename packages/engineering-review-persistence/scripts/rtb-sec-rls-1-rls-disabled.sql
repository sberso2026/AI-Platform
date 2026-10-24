-- RTB-SEC-RLS-1: public ordinary tables with RLS disabled (read-only).
SELECT c.relname AS table_name,
       c.relrowsecurity AS rls_enabled,
       c.relforcerowsecurity AS rls_forced,
       pg_get_userbyid(c.relowner) AS owner,
       c.reltuples::bigint AS est_rows,
       EXISTS (SELECT 1 FROM information_schema.columns col WHERE col.table_schema='public' AND col.table_name=c.relname AND col.column_name='tenant_id') AS has_tenant_id,
       EXISTS (SELECT 1 FROM information_schema.columns col WHERE col.table_schema='public' AND col.table_name=c.relname AND col.column_name='workspace_id') AS has_workspace_id,
       EXISTS (SELECT 1 FROM information_schema.columns col WHERE col.table_schema='public' AND col.table_name=c.relname AND col.column_name='project_id') AS has_project_id
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relrowsecurity = false
ORDER BY c.relname;
