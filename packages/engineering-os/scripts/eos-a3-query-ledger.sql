select version, name
from supabase_migrations.schema_migrations
where version >= '20260919133000'
order by version;
