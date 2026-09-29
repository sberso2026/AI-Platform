select policyname, tablename
from pg_policies
where tablename in (
  'engineering_requirements',
  'engineering_changes',
  'engineering_impacts',
  'engineering_configuration_baselines',
  'engineering_configuration_items'
)
order by tablename, policyname;
