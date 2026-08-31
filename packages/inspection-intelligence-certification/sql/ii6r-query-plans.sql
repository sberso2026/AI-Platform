-- II-6R diagnostic query plans. Admin path only. Does not serve user reads.
SELECT 'inspection_table_counts' AS section, relname AS table_name, n_live_tup AS live_rows
FROM pg_stat_user_tables
WHERE relname LIKE 'inspection_%'
ORDER BY n_live_tup DESC;

SELECT indexrelname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE relname LIKE 'inspection_%'
ORDER BY idx_scan DESC;

SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename LIKE 'inspection_%'
ORDER BY tablename, indexname;
