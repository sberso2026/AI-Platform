-- RTB-SEC-RLS-1 hosted inventory (read-only). Do not print secrets.
SELECT json_build_object(
  'current_database', current_database(),
  'current_user', current_user,
  'inet_server_addr', inet_server_addr()::text
) AS identity;

SELECT json_agg(row_to_json(t) ORDER BY t.rls_enabled, t.table_name)
FROM (
  SELECT
    n.nspname AS schema_name,
    c.relname AS table_name,
    c.relrowsecurity AS rls_enabled,
    c.relforcerowsecurity AS rls_forced,
    pg_get_userbyid(c.relowner) AS owner,
    c.reltuples::bigint AS est_rows,
    EXISTS (
      SELECT 1 FROM information_schema.columns col
      WHERE col.table_schema = n.nspname AND col.table_name = c.relname AND col.column_name = 'tenant_id'
    ) AS has_tenant_id,
    EXISTS (
      SELECT 1 FROM information_schema.columns col
      WHERE col.table_schema = n.nspname AND col.table_name = c.relname AND col.column_name = 'workspace_id'
    ) AS has_workspace_id,
    EXISTS (
      SELECT 1 FROM information_schema.columns col
      WHERE col.table_schema = n.nspname AND col.table_name = c.relname AND col.column_name = 'project_id'
    ) AS has_project_id,
    EXISTS (
      SELECT 1 FROM information_schema.columns col
      WHERE col.table_schema = n.nspname AND col.table_name = c.relname AND col.column_name IN ('user_id', 'created_by')
    ) AS has_user_id
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relkind = 'r'
) t;
