select
  count(*) filter (where system is not null and btrim(system) <> '') as populated,
  count(*) filter (where system is null or btrim(system) = '') as empty_or_null,
  count(*) as total_assets
from engineering_assets;
