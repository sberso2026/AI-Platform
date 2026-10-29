select
  to_regclass('public.engineering_requirements') as requirements,
  to_regclass('public.engineering_changes') as changes,
  to_regclass('public.engineering_impacts') as impacts,
  to_regclass('public.engineering_configuration_baselines') as baselines,
  to_regclass('public.engineering_configuration_items') as items;
