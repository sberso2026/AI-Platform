insert into supabase_migrations.schema_migrations (version, name)
values ('20260929210000', 'eos_a4_requirements_change_impact_configuration')
on conflict (version) do nothing
returning version, name;
