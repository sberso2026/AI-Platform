SELECT schemaname, tablename, policyname, cmd, roles::text, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND (
    qual IN ('true', '(true)')
    OR with_check IN ('true', '(true)')
  )
ORDER BY tablename, policyname;
