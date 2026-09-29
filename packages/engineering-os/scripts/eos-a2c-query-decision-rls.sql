select pol.polname, pol.polcmd, pg_get_expr(pol.polqual, pol.polrelid) as using_expr, pg_get_expr(pol.polwithcheck, pol.polrelid) as with_check
from pg_policy pol
join pg_class c on c.oid = pol.polrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'engineering_decisions'
order by pol.polname;

select c.relname, c.relrowsecurity, c.relforcerowsecurity
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'engineering_decisions',
    'engineering_decision_alternatives',
    'engineering_decision_approvals',
    'engineering_assumptions',
    'engineering_object_links'
  )
order by c.relname;
