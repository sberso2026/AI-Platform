insert into supabase_migrations.schema_migrations (version, name)
values ('20260930020000', 'eos_a6_external_tool_licence_governance')
on conflict (version) do nothing
returning version, name;
