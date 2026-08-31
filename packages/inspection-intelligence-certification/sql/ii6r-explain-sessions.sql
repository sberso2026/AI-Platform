EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT id, status, updated_at
FROM inspection_sessions
WHERE tenant_id = (SELECT tenant_id FROM inspection_sessions LIMIT 1)
  AND workspace_id = (SELECT workspace_id FROM inspection_sessions LIMIT 1);
