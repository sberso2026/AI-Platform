select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'engineering_optimization_run_manifests',
    'engineering_optimization_runs'
  )
order by table_name;
