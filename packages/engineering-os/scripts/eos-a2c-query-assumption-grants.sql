select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'engineering_assumptions'
  and grantee in ('anon', 'authenticated', 'service_role')
  and privilege_type = 'SELECT'
order by grantee;
