insert into supabase_migrations.schema_migrations (version, name)
values ('20260930050000', 'eos_a8b_platform_kg_thread_projection')
on conflict (version) do nothing
returning version, name;
