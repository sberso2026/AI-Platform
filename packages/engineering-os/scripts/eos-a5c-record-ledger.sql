insert into supabase_migrations.schema_migrations (version, name)
values ('20260929230000', 'eos_a5c_optimization_run_manifest')
on conflict (version) do nothing
returning version, name;
