select lower(btrim(system)) as label_norm, count(*) as n
from engineering_assets
where system is not null and btrim(system) <> ''
group by 1
order by n desc
limit 50;
