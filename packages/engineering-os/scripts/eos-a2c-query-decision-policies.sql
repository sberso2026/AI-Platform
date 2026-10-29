select pol.polname as policy, pol.polcmd as cmd
from pg_policy pol
join pg_class c on c.oid = pol.polrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'engineering_decisions'
order by pol.polname;
