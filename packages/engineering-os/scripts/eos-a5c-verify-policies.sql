select tablename, policyname, cmd
from pg_policies
where tablename = 'engineering_optimization_run_manifests'
order by policyname;
