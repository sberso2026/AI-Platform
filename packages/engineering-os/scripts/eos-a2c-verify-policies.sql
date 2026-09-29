select pol.polname, c.relname as table_name,
  case pol.polcmd when 'r' then 'SELECT' when 'a' then 'INSERT' when 'w' then 'UPDATE' when 'd' then 'DELETE' else pol.polcmd::text end as cmd
from pg_policy pol
join pg_class c on c.oid = pol.polrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'engineering_decisions',
    'engineering_decision_alternatives',
    'engineering_decision_approvals',
    'engineering_assumptions',
    'engineering_object_links'
  )
order by c.relname, pol.polname;
