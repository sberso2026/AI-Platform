insert into supabase_migrations.schema_migrations (version, name)
values ('20260929180000', 'eos_a2_decision_assumption_intelligence')
on conflict (version) do nothing
returning version, name;
