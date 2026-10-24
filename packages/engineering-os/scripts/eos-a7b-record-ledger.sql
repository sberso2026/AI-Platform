insert into supabase_migrations.schema_migrations (version, name)
values ('20260930030000', 'eos_a7b_analysis_execution_foundation')
on conflict (version) do nothing
returning version, name;
