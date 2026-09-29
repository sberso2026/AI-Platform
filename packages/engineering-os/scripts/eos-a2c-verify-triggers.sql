select tgname, pg_get_triggerdef(oid) as def
from pg_trigger
where tgrelid in (
  'public.engineering_decisions'::regclass,
  'public.engineering_decision_alternatives'::regclass,
  'public.engineering_decision_approvals'::regclass,
  'public.engineering_assumptions'::regclass,
  'public.engineering_object_links'::regclass
)
and not tgisinternal
order by tgrelid::regclass::text, tgname;
