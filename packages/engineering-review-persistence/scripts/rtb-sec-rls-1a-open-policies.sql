SELECT p.tablename,
       p.policyname,
       p.cmd,
       p.roles::text AS roles,
       p.qual,
       p.with_check,
       s.classification
FROM pg_policies p
LEFT JOIN public.rtb_public_table_security_classification s ON s.table_name = p.tablename
WHERE p.schemaname = 'public'
  AND (
    p.qual IN ('true', '(true)')
    OR p.with_check IN ('true', '(true)')
  )
ORDER BY p.tablename, p.policyname;
