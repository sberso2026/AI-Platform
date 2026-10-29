insert into supabase_migrations.schema_migrations (version, name)
values ('20260929190000', 'eos_a2c_decision_workspace_rls')
on conflict (version) do nothing
returning version, name;
