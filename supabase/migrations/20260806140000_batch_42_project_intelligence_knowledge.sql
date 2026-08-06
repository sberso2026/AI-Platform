-- Phase 8G — Knowledge Intelligence relationship / search reference tables.
-- Stores refs and edges only. Does not duplicate Core or feature business records.

CREATE TABLE IF NOT EXISTS project_intelligence_knowledge_nodes (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  engineering_project_id    UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  ref_id                    TEXT NOT NULL,
  entity_kind               TEXT NOT NULL,
  source_owner              TEXT NOT NULL,
  title                     TEXT NOT NULL,
  snippet                   TEXT,
  drill_down_path           TEXT NOT NULL,
  metadata                  JSONB NOT NULL DEFAULT '{}',
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT pi_knowledge_nodes_ref_uidx UNIQUE (tenant_id, workspace_id, ref_id)
);

CREATE TABLE IF NOT EXISTS project_intelligence_knowledge_edges (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  from_ref_id               TEXT NOT NULL,
  to_ref_id                 TEXT NOT NULL,
  edge_type                 TEXT NOT NULL,
  weight                    NUMERIC(8,4) NOT NULL DEFAULT 1,
  metadata                  JSONB NOT NULL DEFAULT '{}',
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT pi_knowledge_edges_uidx UNIQUE (tenant_id, workspace_id, from_ref_id, to_ref_id, edge_type)
);

CREATE INDEX IF NOT EXISTS idx_pi_knowledge_nodes_scope
  ON project_intelligence_knowledge_nodes(tenant_id, workspace_id, entity_kind);

CREATE INDEX IF NOT EXISTS idx_pi_knowledge_edges_scope
  ON project_intelligence_knowledge_edges(tenant_id, workspace_id, from_ref_id);

ALTER TABLE project_intelligence_knowledge_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_intelligence_knowledge_edges ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'project_intelligence_knowledge_nodes',
    'project_intelligence_knowledge_edges'
  ]
  LOOP
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR SELECT USING (
         tenant_id = ANY(get_user_tenant_ids())
         AND workspace_id IN (SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid())
       )',
      tbl || '_select', tbl
    );
  END LOOP;
END $$;

COMMENT ON TABLE project_intelligence_knowledge_nodes IS
  'Phase 8G knowledge search refs only — authoritative records remain with Core or emitting features.';
COMMENT ON TABLE project_intelligence_knowledge_edges IS
  'Phase 8G relationship edges between refs — no duplicated business payloads.';
