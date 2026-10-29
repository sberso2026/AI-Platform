select tablename, policyname, cmd
from pg_policies
where tablename like 'engineering_optimization%'
order by tablename, policyname;
