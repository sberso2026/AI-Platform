insert into supabase_migrations.schema_migrations (version, name)
values ('20260929200000', 'eos_a3_systems_interface_intelligence')
on conflict (version) do nothing
returning version, name;
