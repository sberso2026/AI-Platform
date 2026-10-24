insert into supabase_migrations.schema_migrations (version, name)
values
  ('20260930050000', 'eos_a8b_platform_kg_thread_projection'),
  ('20260930060000', 'eos_a8b_c_platform_kg_workspace_security')
on conflict (version) do nothing
returning version, name;
