-- EOS 3.3 knowledge source registry + chunk provenance foundation.
-- Additive. Staging/development only. Does not alter EOS 3.1/3.2 migrations or EOS 2 tables.
-- Vector embeddings are not system of record; index metadata may be rebuilt without mutating canonical objects.

CREATE TABLE IF NOT EXISTS eos3_knowledge_sources (
  source_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id              UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id           UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id             TEXT,
  source_type            TEXT NOT NULL CHECK (source_type IN ('canonical_object','controlled_document','enterprise','external','model')),
  knowledge_tier         TEXT NOT NULL,
  authority_class        TEXT NOT NULL,
  revision_or_version    TEXT,
  owner_id               TEXT,
  document_status        TEXT NOT NULL DEFAULT 'unknown'
                         CHECK (document_status IN ('draft','issued','approved','superseded','withdrawn','unknown')),
  effective_state        TEXT NOT NULL DEFAULT 'CURRENT'
                         CHECK (effective_state IN ('CURRENT','SUPERSEDED','HISTORICAL','WITHDRAWN','REVOKED')),
  jurisdiction_context   TEXT,
  standards_profile_ref  TEXT,
  access_scope           TEXT NOT NULL DEFAULT 'workspace',
  ingestion_status       TEXT NOT NULL DEFAULT 'REGISTER',
  index_status           TEXT NOT NULL DEFAULT 'not_indexed'
                         CHECK (index_status IN ('not_indexed','indexed','stale','removed')),
  content_fingerprint    TEXT,
  index_fingerprint      TEXT,
  contains_sensitive     BOOLEAN NOT NULL DEFAULT FALSE,
  provenance             JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eos3_knowledge_sources_ws
  ON eos3_knowledge_sources (tenant_id, workspace_id, project_id);

DROP TRIGGER IF EXISTS eos3_knowledge_sources_updated_at ON eos3_knowledge_sources;
CREATE TRIGGER eos3_knowledge_sources_updated_at
  BEFORE UPDATE ON eos3_knowledge_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE eos3_knowledge_sources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_knowledge_sources_select ON eos3_knowledge_sources;
CREATE POLICY eos3_knowledge_sources_select ON eos3_knowledge_sources
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_knowledge_sources_write ON eos3_knowledge_sources;
CREATE POLICY eos3_knowledge_sources_write ON eos3_knowledge_sources
  FOR ALL USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE TABLE IF NOT EXISTS eos3_knowledge_chunks (
  chunk_id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id                UUID NOT NULL REFERENCES eos3_knowledge_sources(source_id) ON DELETE CASCADE,
  tenant_id                UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id             UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id               TEXT,
  text                     TEXT NOT NULL,
  page_or_section          TEXT,
  authority_class          TEXT NOT NULL,
  effective_state          TEXT NOT NULL,
  document_status          TEXT NOT NULL,
  revision_or_version      TEXT,
  ingestion_record_id      UUID NOT NULL,
  evidence_classification  TEXT NOT NULL
                           CHECK (evidence_classification IN ('FACT','INFERENCE','ASSUMPTION','RECOMMENDATION','RESULT','HUMAN_DECISION')),
  instruction_isolated     BOOLEAN NOT NULL DEFAULT TRUE,
  embedding_present        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eos3_knowledge_chunks_source
  ON eos3_knowledge_chunks (source_id);

CREATE INDEX IF NOT EXISTS idx_eos3_knowledge_chunks_ws
  ON eos3_knowledge_chunks (tenant_id, workspace_id, project_id);

ALTER TABLE eos3_knowledge_chunks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_knowledge_chunks_select ON eos3_knowledge_chunks;
CREATE POLICY eos3_knowledge_chunks_select ON eos3_knowledge_chunks
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_knowledge_chunks_write ON eos3_knowledge_chunks;
CREATE POLICY eos3_knowledge_chunks_write ON eos3_knowledge_chunks
  FOR ALL USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE TABLE IF NOT EXISTS eos3_knowledge_audit (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  source_id       UUID,
  action          TEXT NOT NULL,
  detail          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE eos3_knowledge_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_knowledge_audit_select ON eos3_knowledge_audit;
CREATE POLICY eos3_knowledge_audit_select ON eos3_knowledge_audit
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_knowledge_audit_insert ON eos3_knowledge_audit;
CREATE POLICY eos3_knowledge_audit_insert ON eos3_knowledge_audit
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

COMMENT ON TABLE eos3_knowledge_sources IS
  'EOS 3.3 knowledge source registry. Embeddings are not system of record.';
COMMENT ON TABLE eos3_knowledge_chunks IS
  'Chunk provenance for governed retrieval. Content is data, not privileged instructions.';
