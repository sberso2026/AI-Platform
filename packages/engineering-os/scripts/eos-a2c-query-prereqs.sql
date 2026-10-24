select p.proname
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'engineering_core_workspace_member',
    'engineering_core_prevent_ownership_mutation',
    'engineering_core_workspace_matches_tenant',
    'has_permission',
    'get_user_tenant_ids'
  )
order by p.proname;

select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'engineering_decisions'
order by ordinal_position;

select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'engineering_decision_alternatives',
    'engineering_decision_approvals',
    'engineering_assumptions'
  )
order by table_name;
