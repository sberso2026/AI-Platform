-- EOS-3-DOMAIN-3 Relationship Graph Core.
-- Relational adjacency/edge model. Does not clone canonical object payloads.
-- No Neo4j / external graph DB. Composes Domain-1/2 by reference.
-- Rollback: DROP TABLE eos3_relationship_edges;

CREATE TABLE IF NOT EXISTS eos3_relationship_edges (
  relationship_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id                 UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id                   TEXT,
  source_object_class          TEXT NOT NULL,
  source_object_stable_id      TEXT NOT NULL,
  source_object_id             TEXT,
  source_revision_id           TEXT,
  source_revision_label        TEXT,
  relationship_type            TEXT NOT NULL,
  target_object_class          TEXT NOT NULL,
  target_object_stable_id      TEXT NOT NULL,
  target_object_id             TEXT,
  target_revision_id           TEXT,
  target_revision_label        TEXT,
  status                       TEXT NOT NULL DEFAULT 'ACTIVE'
                               CHECK (status IN ('ACTIVE','SUPERSEDED','RETIRED','INVALIDATED')),
  origin                       TEXT NOT NULL DEFAULT 'HUMAN'
                               CHECK (origin IN ('HUMAN','SYSTEM_DERIVED','INFERRED','MIGRATED')),
  inference_basis              TEXT,
  confidence                   NUMERIC,
  confirmation_state           TEXT NOT NULL DEFAULT 'CONFIRMED'
                               CHECK (confirmation_state IN ('CONFIRMED','PROPOSED','REJECTED','NOT_REQUIRED')),
  evidence_refs                JSONB NOT NULL DEFAULT '[]'::jsonb,
  materiality                  TEXT NOT NULL DEFAULT 'UNKNOWN'
                               CHECK (materiality IN ('LOW','MEDIUM','HIGH','UNKNOWN')),
  relatedness                  TEXT NOT NULL DEFAULT 'RELATED'
                               CHECK (relatedness IN (
                                 'RELATED','DEPENDENT','POTENTIALLY_AFFECTED','EXPLICITLY_AFFECTED'
                               )),
  effective_at                 TIMESTAMPTZ,
  created_by                   TEXT,
  created_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  superseded_by_relationship_id UUID REFERENCES eos3_relationship_edges(relationship_id),
  supersedes_relationship_id    UUID REFERENCES eos3_relationship_edges(relationship_id),
  provenance                   JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_eos3_rel_active_edge
  ON eos3_relationship_edges (
    workspace_id,
    relationship_type,
    source_object_stable_id,
    target_object_stable_id,
    COALESCE(source_revision_id, ''),
    COALESCE(target_revision_id, '')
  )
  WHERE status = 'ACTIVE';

CREATE INDEX IF NOT EXISTS idx_eos3_rel_source
  ON eos3_relationship_edges (tenant_id, workspace_id, source_object_stable_id);

CREATE INDEX IF NOT EXISTS idx_eos3_rel_target
  ON eos3_relationship_edges (tenant_id, workspace_id, target_object_stable_id);

CREATE INDEX IF NOT EXISTS idx_eos3_rel_project
  ON eos3_relationship_edges (tenant_id, workspace_id, project_id);

ALTER TABLE eos3_relationship_edges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_rel_select ON eos3_relationship_edges;
CREATE POLICY eos3_rel_select ON eos3_relationship_edges
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_rel_insert ON eos3_relationship_edges;
CREATE POLICY eos3_rel_insert ON eos3_relationship_edges
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_rel_update ON eos3_relationship_edges;
CREATE POLICY eos3_rel_update ON eos3_relationship_edges
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

COMMENT ON TABLE eos3_relationship_edges IS
  'DOMAIN-3 governed relationship edges. References canonical objects by stable ID; does not store object payloads. No staleness propagation in this phase.';
