select version, name from supabase_migrations.schema_migrations
where version >= '20260929180000' order by version;
