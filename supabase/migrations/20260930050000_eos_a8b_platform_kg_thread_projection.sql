-- EOS-A8B: Engineering Digital Thread projection onto EXISTING Platform KG.
-- Does NOT create a graph table, EngineeringDigitalThreadGraph, or PI dual-write.
-- Canonical SOT remains domain tables + engineering_object_links.
-- knowledge_nodes / knowledge_edges remain the only graph persistence.
--
-- Justified indexes only:
-- 1. Lookup projected thread nodes by deterministic source_ref (eos-thread:{type}:{id}).
-- 2. Lookup projected edges by metadata projection_key for idempotent upsert/reconcile.
-- RLS is unchanged: Platform KG remains tenant-scoped. Product KG reads stay
-- uncertified until workspace isolation exists at the SQL layer.

CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_eos_thread_source
  ON knowledge_nodes (tenant_id, source_ref)
  WHERE node_type = 'engineering_thread_object'
    AND source_ref LIKE 'eos-thread:%';

CREATE INDEX IF NOT EXISTS idx_knowledge_edges_eos_thread_projection_key
  ON knowledge_edges ((metadata->>'projection_key'))
  WHERE (metadata->>'family') = 'engineering-thread-projection';

COMMENT ON INDEX idx_knowledge_nodes_eos_thread_source IS
  'EOS-A8B derived Engineering Digital Thread node projection onto knowledge_nodes. Disposable. Not source of truth.';

COMMENT ON INDEX idx_knowledge_edges_eos_thread_projection_key IS
  'EOS-A8B derived Engineering Digital Thread edge projection onto knowledge_edges. Identity is projection_key, not display label.';
