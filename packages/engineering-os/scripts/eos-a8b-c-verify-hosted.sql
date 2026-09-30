select kind, name
from (
  select 1 as ord, 'migration'::text as kind, version as name
  from supabase_migrations.schema_migrations
  where version in ('20260930050000', '20260930060000')
  union all
  select 2, 'index', indexname
  from pg_indexes
  where indexname in (
    'idx_knowledge_nodes_eos_thread_source',
    'idx_knowledge_edges_eos_thread_projection_key',
    'idx_knowledge_nodes_workspace_id'
  )
  union all
  select 3, 'policy', tablename || '.' || policyname
  from pg_policies
  where tablename in ('knowledge_nodes', 'knowledge_edges')
  union all
  select 4, 'function', proname
  from pg_proc
  where proname in (
    'platform_kg_node_visible',
    'platform_kg_is_engineering_thread_node',
    'platform_kg_is_engineering_thread_edge',
    'engineering_core_workspace_member'
  )
) s
order by ord, name;
