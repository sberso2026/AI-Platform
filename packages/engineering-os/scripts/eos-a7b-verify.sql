SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'engineering_analysis%'
ORDER BY 1;

SELECT indexname
FROM pg_indexes
WHERE tablename LIKE 'engineering_analysis%'
ORDER BY 1;

SELECT relname, relrowsecurity
FROM pg_class
WHERE relname LIKE 'engineering_analysis%';

SELECT conname
FROM pg_constraint
WHERE conrelid::regclass::text LIKE 'engineering_analysis%'
ORDER BY 1;

NOTIFY pgrst, 'reload schema';
