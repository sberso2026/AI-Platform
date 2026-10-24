select conname, contype, pg_get_constraintdef(oid) as def
from pg_constraint
where conrelid = 'public.engineering_decisions'::regclass
  and conname like '%selected%' or conrelid = 'public.engineering_decisions'::regclass and conname like '%supersede%'
order by conname;
