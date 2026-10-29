select pg_get_constraintdef(oid) as def
from pg_constraint
where conname = 'eng_obj_links_governed_taxonomy';
