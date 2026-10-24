insert into supabase_migrations.schema_migrations (version, name)
values ('20260929220000', 'eos_a5_engineering_optimization_core')
on conflict (version) do nothing
returning version, name;
