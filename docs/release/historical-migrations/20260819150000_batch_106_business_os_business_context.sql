-- Batch 106: Business OS BOS-10 Business Context Graph
-- Projection metadata for the existing Platform Kernel Knowledge Graph.
-- Does not create a second graph database, vector store, search engine, or memory service.

CREATE UNIQUE INDEX IF NOT EXISTS knowledge_nodes_tenant_workspace_source_ref_uidx
  ON knowledge_nodes (tenant_id, workspace_id, source_ref)
  WHERE source_ref IS NOT NULL AND workspace_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS knowledge_nodes_bos_projection_idx
  ON knowledge_nodes (tenant_id, workspace_id, node_type)
  WHERE node_type LIKE 'bos.%';

CREATE TABLE IF NOT EXISTS business_os_context_settings (
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  ontology_version text NOT NULL DEFAULT 'business_context_graph.v1',
  stale_after_hours integer NOT NULL DEFAULT 24,
  max_depth integer NOT NULL DEFAULT 2,
  max_neighbours integer NOT NULL DEFAULT 80,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, workspace_id),
  CONSTRAINT business_os_context_settings_ontology_check
    CHECK (ontology_version = 'business_context_graph.v1'),
  CONSTRAINT business_os_context_settings_depth_check
    CHECK (max_depth >= 1 AND max_depth <= 4)
);

CREATE TABLE IF NOT EXISTS business_os_context_projection_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('running', 'completed', 'failed')),
  trigger text NOT NULL DEFAULT 'rebuild' CHECK (trigger IN ('rebuild', 'event', 'demo', 'deletion')),
  nodes_projected integer NOT NULL DEFAULT 0,
  relationships_projected integer NOT NULL DEFAULT 0,
  unresolved integer NOT NULL DEFAULT 0,
  failed_reason text,
  ontology_version text NOT NULL DEFAULT 'business_context_graph.v1',
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS business_os_context_projection_runs_scope_idx
  ON business_os_context_projection_runs (tenant_id, workspace_id, started_at DESC);

CREATE TABLE IF NOT EXISTS business_os_context_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  relationship_type text NOT NULL,
  from_canonical_ref text NOT NULL,
  to_canonical_ref text NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'reversed')),
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  reversed_at timestamptz,
  reversed_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS business_os_context_overrides_scope_idx
  ON business_os_context_overrides (tenant_id, workspace_id, status);

CREATE TABLE IF NOT EXISTS business_os_context_unresolved (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  relationship_type text,
  from_canonical_ref text,
  to_ref text NOT NULL,
  reason text NOT NULL,
  source_domain text,
  source_event text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'ignored')),
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS business_os_context_unresolved_scope_idx
  ON business_os_context_unresolved (tenant_id, workspace_id, status);

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'business_os_context_settings',
    'business_os_context_projection_runs',
    'business_os_context_overrides',
    'business_os_context_unresolved'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('GRANT ALL ON %I TO anon, authenticated, service_role', t);

    EXECUTE format('DROP TRIGGER IF EXISTS %I_updated_at ON %I', t, t);
    IF t = 'business_os_context_settings' THEN
      EXECUTE format(
        'CREATE TRIGGER %I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
        t, t
      );
    END IF;

    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_select', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR SELECT USING (
         tenant_id = ANY(get_user_tenant_ids())
         AND workspace_id IN (
           SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
         )
       )',
      t || '_select', t
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_insert', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR INSERT WITH CHECK (
         tenant_id = ANY(get_user_tenant_ids())
         AND workspace_id IN (
           SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
         )
       )',
      t || '_insert', t
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_update', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR UPDATE USING (
         tenant_id = ANY(get_user_tenant_ids())
         AND workspace_id IN (
           SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
         )
       ) WITH CHECK (
         tenant_id = ANY(get_user_tenant_ids())
         AND workspace_id IN (
           SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
         )
       )',
      t || '_update', t
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_delete', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR DELETE USING (
         tenant_id = ANY(get_user_tenant_ids())
         AND workspace_id IN (
           SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
         )
       )',
      t || '_delete', t
    );
  END LOOP;
END $$;

COMMENT ON TABLE business_os_context_settings IS
  'BOS-10 projection settings. Canonical business records remain in domain tables; graph nodes live in knowledge_nodes.';
COMMENT ON TABLE business_os_context_projection_runs IS
  'Observable rebuild/sync runs for Kernel Knowledge Graph projections.';
COMMENT ON TABLE business_os_context_overrides IS
  'Managed, reversible relationship overrides. Cannot rewrite canonical source records.';
COMMENT ON TABLE business_os_context_unresolved IS
  'Unresolved graph references. Ambiguous mappings are recorded, not silently repaired.';
