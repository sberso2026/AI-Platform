-- Diagnostic only. Not a migration.
SELECT json_agg(json_build_object(
  'column_name', column_name,
  'data_type', data_type,
  'is_nullable', is_nullable
) ORDER BY ordinal_position) AS columns
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'engineering_object_links';
