select c.relname as table_name, c.relrowsecurity as rls
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'engineering_decision_alternatives',
    'engineering_decision_approvals',
    'engineering_assumptions',
    'engineering_object_links'
  )
order by c.relname;
