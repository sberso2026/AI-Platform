select version, name
from supabase_migrations.schema_migrations
where version in ('20260919133000', '20260929180000', '20260929190000')
order by version;
