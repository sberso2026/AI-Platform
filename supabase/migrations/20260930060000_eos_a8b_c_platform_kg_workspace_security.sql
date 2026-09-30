-- EOS-A8B-C: Platform KG workspace isolation for product reads.
-- Additive. Does not create a graph store. Does not change A8B index migration.
--
-- Scope model (derived from native columns; no speculative scope_kind):
--   TENANT    = knowledge_nodes.workspace_id IS NULL
--   WORKSPACE = knowledge_nodes.workspace_id IS NOT NULL
--   PLATFORM  = not represented on knowledge_nodes (tenant_id is NOT NULL)
--
-- Engineering Digital Thread projection always stores native workspace_id.
-- Edges have no workspace column; visibility requires BOTH endpoint nodes visible.
-- Derived engineering_thread_object rows are not user-mutable (service_role bypasses RLS).

CREATE OR REPLACE FUNCTION platform_kg_node_visible(p_tenant_id UUID, p_workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT p_tenant_id = ANY(get_user_tenant_ids())
    AND (
      p_workspace_id IS NULL
      OR engineering_core_workspace_member(p_workspace_id)
    );
$$;

CREATE OR REPLACE FUNCTION platform_kg_is_engineering_thread_node(p_node_type TEXT, p_metadata JSONB)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT p_node_type = 'engineering_thread_object'
      OR COALESCE(p_metadata->>'family', '') = 'engineering-thread-projection';
$$;

CREATE OR REPLACE FUNCTION platform_kg_is_engineering_thread_edge(p_metadata JSONB)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(p_metadata->>'family', '') = 'engineering-thread-projection';
$$;

COMMENT ON FUNCTION platform_kg_node_visible(UUID, UUID) IS
  'EOS-A8B-C: tenant membership plus workspace membership when workspace_id is set. Fail-closed.';
COMMENT ON FUNCTION platform_kg_is_engineering_thread_node(TEXT, JSONB) IS
  'EOS-A8B-C: derived Engineering Digital Thread projection node. User DML denied.';
COMMENT ON FUNCTION platform_kg_is_engineering_thread_edge(JSONB) IS
  'EOS-A8B-C: derived Engineering Digital Thread projection edge. User DML denied.';

DROP POLICY IF EXISTS knowledge_nodes_select ON knowledge_nodes;
DROP POLICY IF EXISTS knowledge_nodes_manage ON knowledge_nodes;
DROP POLICY IF EXISTS knowledge_nodes_insert ON knowledge_nodes;
DROP POLICY IF EXISTS knowledge_nodes_update ON knowledge_nodes;
DROP POLICY IF EXISTS knowledge_nodes_delete ON knowledge_nodes;

CREATE POLICY knowledge_nodes_select ON knowledge_nodes
  FOR SELECT USING (platform_kg_node_visible(tenant_id, workspace_id));

CREATE POLICY knowledge_nodes_insert ON knowledge_nodes
  FOR INSERT WITH CHECK (
    NOT platform_kg_is_engineering_thread_node(node_type, metadata)
    AND has_permission('knowledge', 'execute', tenant_id)
    AND (workspace_id IS NULL OR engineering_core_workspace_member(workspace_id))
  );

CREATE POLICY knowledge_nodes_update ON knowledge_nodes
  FOR UPDATE USING (
    NOT platform_kg_is_engineering_thread_node(node_type, metadata)
    AND has_permission('knowledge', 'execute', tenant_id)
    AND (workspace_id IS NULL OR engineering_core_workspace_member(workspace_id))
  ) WITH CHECK (
    NOT platform_kg_is_engineering_thread_node(node_type, metadata)
    AND has_permission('knowledge', 'execute', tenant_id)
    AND (workspace_id IS NULL OR engineering_core_workspace_member(workspace_id))
  );

CREATE POLICY knowledge_nodes_delete ON knowledge_nodes
  FOR DELETE USING (
    NOT platform_kg_is_engineering_thread_node(node_type, metadata)
    AND has_permission('knowledge', 'execute', tenant_id)
    AND (workspace_id IS NULL OR engineering_core_workspace_member(workspace_id))
  );

DROP POLICY IF EXISTS knowledge_edges_select ON knowledge_edges;
DROP POLICY IF EXISTS knowledge_edges_manage ON knowledge_edges;
DROP POLICY IF EXISTS knowledge_edges_insert ON knowledge_edges;
DROP POLICY IF EXISTS knowledge_edges_update ON knowledge_edges;
DROP POLICY IF EXISTS knowledge_edges_delete ON knowledge_edges;

CREATE POLICY knowledge_edges_select ON knowledge_edges
  FOR SELECT USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND EXISTS (SELECT 1 FROM knowledge_nodes s WHERE s.id = from_node_id)
    AND EXISTS (SELECT 1 FROM knowledge_nodes t WHERE t.id = to_node_id)
  );

CREATE POLICY knowledge_edges_insert ON knowledge_edges
  FOR INSERT WITH CHECK (
    NOT platform_kg_is_engineering_thread_edge(metadata)
    AND has_permission('knowledge', 'execute', tenant_id)
    AND EXISTS (SELECT 1 FROM knowledge_nodes s WHERE s.id = from_node_id)
    AND EXISTS (SELECT 1 FROM knowledge_nodes t WHERE t.id = to_node_id)
  );

CREATE POLICY knowledge_edges_update ON knowledge_edges
  FOR UPDATE USING (
    NOT platform_kg_is_engineering_thread_edge(metadata)
    AND has_permission('knowledge', 'execute', tenant_id)
    AND EXISTS (SELECT 1 FROM knowledge_nodes s WHERE s.id = from_node_id)
    AND EXISTS (SELECT 1 FROM knowledge_nodes t WHERE t.id = to_node_id)
  ) WITH CHECK (
    NOT platform_kg_is_engineering_thread_edge(metadata)
    AND has_permission('knowledge', 'execute', tenant_id)
    AND EXISTS (SELECT 1 FROM knowledge_nodes s WHERE s.id = from_node_id)
    AND EXISTS (SELECT 1 FROM knowledge_nodes t WHERE t.id = to_node_id)
  );

CREATE POLICY knowledge_edges_delete ON knowledge_edges
  FOR DELETE USING (
    NOT platform_kg_is_engineering_thread_edge(metadata)
    AND has_permission('knowledge', 'execute', tenant_id)
    AND EXISTS (SELECT 1 FROM knowledge_nodes s WHERE s.id = from_node_id)
    AND EXISTS (SELECT 1 FROM knowledge_nodes t WHERE t.id = to_node_id)
  );

CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_workspace_id
  ON knowledge_nodes (tenant_id, workspace_id)
  WHERE workspace_id IS NOT NULL;

COMMENT ON INDEX idx_knowledge_nodes_workspace_id IS
  'EOS-A8B-C workspace isolation predicate for Platform KG nodes with native workspace_id.';

NOTIFY pgrst, 'reload schema';
