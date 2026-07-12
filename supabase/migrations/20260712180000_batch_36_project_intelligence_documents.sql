-- RTB AI Platform Batch 36 — Project Intelligence Document Intelligence
-- Engineering Core engineering_documents remains metadata SoT.
-- PI tables store derivatives keyed by engineering_document_id only.
-- No pgvector extension in prior migrations — embeddings stored as jsonb float arrays.

CREATE OR REPLACE FUNCTION prevent_pi_document_identity_mutation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
     OR NEW.workspace_id IS DISTINCT FROM OLD.workspace_id
     OR NEW.engineering_document_id IS DISTINCT FROM OLD.engineering_document_id THEN
    RAISE EXCEPTION 'tenant_id, workspace_id, and engineering_document_id are immutable after insert';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

-- Processing status shared by ingestions and processing runs
-- registered,queued,fetching,validating,parsing,normalizing,chunking,embedding,
-- indexing,extracting,validating_output,ready,ready_with_warnings,retry_pending,
-- failed,cancelled,superseded,archived

CREATE TABLE project_intelligence_document_ingestions (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  engineering_project_id    UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  engineering_document_id   UUID NOT NULL REFERENCES engineering_documents(id) ON DELETE CASCADE,
  source_revision           TEXT NOT NULL,
  processing_version        TEXT NOT NULL DEFAULT '1',
  status                    TEXT NOT NULL DEFAULT 'registered' CHECK (status IN (
    'registered', 'queued', 'fetching', 'validating', 'parsing', 'normalizing',
    'chunking', 'embedding', 'indexing', 'extracting', 'validating_output',
    'ready', 'ready_with_warnings', 'retry_pending', 'failed', 'cancelled',
    'superseded', 'archived'
  )),
  confidence                NUMERIC(5,4) CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  parser_provider           TEXT,
  parser_version            TEXT,
  embedding_provider        TEXT,
  embedding_model           TEXT,
  content_hash              TEXT,
  mime_type                 TEXT,
  file_size_bytes           BIGINT,
  idempotency_key           TEXT,
  metadata                  JSONB NOT NULL DEFAULT '{}',
  created_by                UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at                TIMESTAMPTZ,
  UNIQUE (tenant_id, idempotency_key)
);

CREATE INDEX idx_pi_doc_ingestions_tenant ON project_intelligence_document_ingestions(tenant_id);
CREATE INDEX idx_pi_doc_ingestions_workspace ON project_intelligence_document_ingestions(workspace_id);
CREATE INDEX idx_pi_doc_ingestions_document ON project_intelligence_document_ingestions(engineering_document_id);
CREATE INDEX idx_pi_doc_ingestions_status ON project_intelligence_document_ingestions(tenant_id, status)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_pi_doc_ingestions_project ON project_intelligence_document_ingestions(engineering_project_id)
  WHERE engineering_project_id IS NOT NULL;

CREATE TRIGGER project_intelligence_document_ingestions_updated_at
  BEFORE UPDATE ON project_intelligence_document_ingestions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER project_intelligence_document_ingestions_identity_immutable
  BEFORE UPDATE ON project_intelligence_document_ingestions
  FOR EACH ROW EXECUTE FUNCTION prevent_pi_document_identity_mutation();

CREATE TABLE project_intelligence_document_processing_runs (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  engineering_project_id    UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  engineering_document_id   UUID NOT NULL REFERENCES engineering_documents(id) ON DELETE CASCADE,
  ingestion_id              UUID NOT NULL REFERENCES project_intelligence_document_ingestions(id) ON DELETE CASCADE,
  source_revision           TEXT NOT NULL,
  processing_version        TEXT NOT NULL DEFAULT '1',
  status                    TEXT NOT NULL DEFAULT 'queued' CHECK (status IN (
    'registered', 'queued', 'fetching', 'validating', 'parsing', 'normalizing',
    'chunking', 'embedding', 'indexing', 'extracting', 'validating_output',
    'ready', 'ready_with_warnings', 'retry_pending', 'failed', 'cancelled',
    'superseded', 'archived'
  )),
  confidence                NUMERIC(5,4) CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  attempt                   INTEGER NOT NULL DEFAULT 1 CHECK (attempt >= 1),
  error_code                TEXT,
  error_message             TEXT,
  correlation_id            TEXT,
  idempotency_key           TEXT,
  started_at                TIMESTAMPTZ,
  completed_at              TIMESTAMPTZ,
  metadata                  JSONB NOT NULL DEFAULT '{}',
  created_by                UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, idempotency_key)
);

CREATE INDEX idx_pi_doc_runs_ingestion ON project_intelligence_document_processing_runs(ingestion_id, created_at DESC);
CREATE INDEX idx_pi_doc_runs_document ON project_intelligence_document_processing_runs(engineering_document_id);
CREATE INDEX idx_pi_doc_runs_status ON project_intelligence_document_processing_runs(tenant_id, status);

CREATE TRIGGER project_intelligence_document_processing_runs_updated_at
  BEFORE UPDATE ON project_intelligence_document_processing_runs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER project_intelligence_document_processing_runs_identity_immutable
  BEFORE UPDATE ON project_intelligence_document_processing_runs
  FOR EACH ROW EXECUTE FUNCTION prevent_pi_document_identity_mutation();

CREATE TABLE project_intelligence_document_chunks (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  engineering_project_id    UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  engineering_document_id   UUID NOT NULL REFERENCES engineering_documents(id) ON DELETE CASCADE,
  ingestion_id              UUID NOT NULL REFERENCES project_intelligence_document_ingestions(id) ON DELETE CASCADE,
  processing_run_id         UUID REFERENCES project_intelligence_document_processing_runs(id) ON DELETE SET NULL,
  source_revision           TEXT NOT NULL,
  processing_version        TEXT NOT NULL DEFAULT '1',
  chunk_index               INTEGER NOT NULL CHECK (chunk_index >= 0),
  stable_chunk_id           TEXT NOT NULL,
  content                   TEXT NOT NULL,
  content_hash              TEXT NOT NULL,
  section_path              TEXT,
  page_start                INTEGER,
  page_end                  INTEGER,
  block_type                TEXT NOT NULL DEFAULT 'text' CHECK (block_type IN (
    'text', 'heading', 'paragraph', 'table', 'list', 'caption', 'image', 'other'
  )),
  table_payload             JSONB,
  source_offsets            JSONB,
  confidence                NUMERIC(5,4) CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  status                    TEXT NOT NULL DEFAULT 'ready' CHECK (status IN (
    'registered', 'queued', 'fetching', 'validating', 'parsing', 'normalizing',
    'chunking', 'embedding', 'indexing', 'extracting', 'validating_output',
    'ready', 'ready_with_warnings', 'retry_pending', 'failed', 'cancelled',
    'superseded', 'archived'
  )),
  metadata                  JSONB NOT NULL DEFAULT '{}',
  created_by                UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at                TIMESTAMPTZ,
  UNIQUE (ingestion_id, chunk_index),
  UNIQUE (tenant_id, engineering_document_id, source_revision, processing_version, stable_chunk_id)
);

CREATE INDEX idx_pi_doc_chunks_document ON project_intelligence_document_chunks(engineering_document_id)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_pi_doc_chunks_ingestion ON project_intelligence_document_chunks(ingestion_id)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_pi_doc_chunks_hash ON project_intelligence_document_chunks(content_hash);

CREATE TRIGGER project_intelligence_document_chunks_updated_at
  BEFORE UPDATE ON project_intelligence_document_chunks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER project_intelligence_document_chunks_identity_immutable
  BEFORE UPDATE ON project_intelligence_document_chunks
  FOR EACH ROW EXECUTE FUNCTION prevent_pi_document_identity_mutation();

-- Embeddings as jsonb float arrays (no vector extension in prior migrations)
CREATE TABLE project_intelligence_document_embeddings (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  engineering_project_id    UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  engineering_document_id   UUID NOT NULL REFERENCES engineering_documents(id) ON DELETE CASCADE,
  chunk_id                  UUID NOT NULL REFERENCES project_intelligence_document_chunks(id) ON DELETE CASCADE,
  source_revision           TEXT NOT NULL,
  processing_version        TEXT NOT NULL DEFAULT '1',
  embedding_provider        TEXT NOT NULL,
  embedding_model           TEXT NOT NULL,
  embedding_dimensions      INTEGER NOT NULL CHECK (embedding_dimensions > 0),
  embedding                 JSONB NOT NULL,
  status                    TEXT NOT NULL DEFAULT 'ready' CHECK (status IN (
    'registered', 'queued', 'fetching', 'validating', 'parsing', 'normalizing',
    'chunking', 'embedding', 'indexing', 'extracting', 'validating_output',
    'ready', 'ready_with_warnings', 'retry_pending', 'failed', 'cancelled',
    'superseded', 'archived'
  )),
  confidence                NUMERIC(5,4) CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  metadata                  JSONB NOT NULL DEFAULT '{}',
  created_by                UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at                TIMESTAMPTZ,
  UNIQUE (chunk_id, embedding_provider, embedding_model, processing_version)
);

CREATE INDEX idx_pi_doc_embeddings_document ON project_intelligence_document_embeddings(engineering_document_id)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_pi_doc_embeddings_chunk ON project_intelligence_document_embeddings(chunk_id)
  WHERE deleted_at IS NULL;

CREATE TRIGGER project_intelligence_document_embeddings_updated_at
  BEFORE UPDATE ON project_intelligence_document_embeddings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER project_intelligence_document_embeddings_identity_immutable
  BEFORE UPDATE ON project_intelligence_document_embeddings
  FOR EACH ROW EXECUTE FUNCTION prevent_pi_document_identity_mutation();

CREATE TABLE project_intelligence_document_extractions (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  engineering_project_id    UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  engineering_document_id   UUID NOT NULL REFERENCES engineering_documents(id) ON DELETE CASCADE,
  ingestion_id              UUID REFERENCES project_intelligence_document_ingestions(id) ON DELETE SET NULL,
  source_revision           TEXT NOT NULL,
  processing_version        TEXT NOT NULL DEFAULT '1',
  extraction_type           TEXT NOT NULL,
  payload                   JSONB NOT NULL DEFAULT '{}',
  status                    TEXT NOT NULL DEFAULT 'ready' CHECK (status IN (
    'registered', 'queued', 'fetching', 'validating', 'parsing', 'normalizing',
    'chunking', 'embedding', 'indexing', 'extracting', 'validating_output',
    'ready', 'ready_with_warnings', 'retry_pending', 'failed', 'cancelled',
    'superseded', 'archived'
  )),
  confidence                NUMERIC(5,4) CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  metadata                  JSONB NOT NULL DEFAULT '{}',
  created_by                UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at                TIMESTAMPTZ
);

CREATE INDEX idx_pi_doc_extractions_document ON project_intelligence_document_extractions(engineering_document_id)
  WHERE deleted_at IS NULL;

CREATE TRIGGER project_intelligence_document_extractions_updated_at
  BEFORE UPDATE ON project_intelligence_document_extractions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER project_intelligence_document_extractions_identity_immutable
  BEFORE UPDATE ON project_intelligence_document_extractions
  FOR EACH ROW EXECUTE FUNCTION prevent_pi_document_identity_mutation();

CREATE TABLE project_intelligence_document_summaries (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  engineering_project_id    UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  engineering_document_id   UUID NOT NULL REFERENCES engineering_documents(id) ON DELETE CASCADE,
  source_revision           TEXT NOT NULL,
  processing_version        TEXT NOT NULL DEFAULT '1',
  summary_type              TEXT NOT NULL DEFAULT 'document',
  summary_text              TEXT NOT NULL,
  status                    TEXT NOT NULL DEFAULT 'ready' CHECK (status IN (
    'registered', 'queued', 'fetching', 'validating', 'parsing', 'normalizing',
    'chunking', 'embedding', 'indexing', 'extracting', 'validating_output',
    'ready', 'ready_with_warnings', 'retry_pending', 'failed', 'cancelled',
    'superseded', 'archived'
  )),
  confidence                NUMERIC(5,4) CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  model                     TEXT,
  prompt_version            TEXT,
  metadata                  JSONB NOT NULL DEFAULT '{}',
  created_by                UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at                TIMESTAMPTZ
);

CREATE INDEX idx_pi_doc_summaries_document ON project_intelligence_document_summaries(engineering_document_id)
  WHERE deleted_at IS NULL;

CREATE TRIGGER project_intelligence_document_summaries_updated_at
  BEFORE UPDATE ON project_intelligence_document_summaries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER project_intelligence_document_summaries_identity_immutable
  BEFORE UPDATE ON project_intelligence_document_summaries
  FOR EACH ROW EXECUTE FUNCTION prevent_pi_document_identity_mutation();

CREATE TABLE project_intelligence_document_comparisons (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  engineering_project_id    UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  engineering_document_id   UUID NOT NULL REFERENCES engineering_documents(id) ON DELETE CASCADE,
  base_revision             TEXT NOT NULL,
  target_revision           TEXT NOT NULL,
  source_revision           TEXT NOT NULL,
  processing_version        TEXT NOT NULL DEFAULT '1',
  status                    TEXT NOT NULL DEFAULT 'ready' CHECK (status IN (
    'registered', 'queued', 'fetching', 'validating', 'parsing', 'normalizing',
    'chunking', 'embedding', 'indexing', 'extracting', 'validating_output',
    'ready', 'ready_with_warnings', 'retry_pending', 'failed', 'cancelled',
    'superseded', 'archived'
  )),
  confidence                NUMERIC(5,4) CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  diff_payload              JSONB NOT NULL DEFAULT '{}',
  impact_candidates         JSONB NOT NULL DEFAULT '[]',
  metadata                  JSONB NOT NULL DEFAULT '{}',
  created_by                UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at                TIMESTAMPTZ,
  UNIQUE (tenant_id, engineering_document_id, base_revision, target_revision, processing_version)
);

CREATE INDEX idx_pi_doc_comparisons_document ON project_intelligence_document_comparisons(engineering_document_id)
  WHERE deleted_at IS NULL;

CREATE TRIGGER project_intelligence_document_comparisons_updated_at
  BEFORE UPDATE ON project_intelligence_document_comparisons FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER project_intelligence_document_comparisons_identity_immutable
  BEFORE UPDATE ON project_intelligence_document_comparisons
  FOR EACH ROW EXECUTE FUNCTION prevent_pi_document_identity_mutation();

CREATE TABLE project_intelligence_document_evidence (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  engineering_project_id    UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  engineering_document_id   UUID NOT NULL REFERENCES engineering_documents(id) ON DELETE CASCADE,
  chunk_id                  UUID REFERENCES project_intelligence_document_chunks(id) ON DELETE SET NULL,
  source_revision           TEXT NOT NULL,
  processing_version        TEXT NOT NULL DEFAULT '1',
  excerpt                   TEXT NOT NULL,
  score                     NUMERIC(8,6),
  page_start                INTEGER,
  page_end                  INTEGER,
  section_path              TEXT,
  status                    TEXT NOT NULL DEFAULT 'ready' CHECK (status IN (
    'registered', 'queued', 'fetching', 'validating', 'parsing', 'normalizing',
    'chunking', 'embedding', 'indexing', 'extracting', 'validating_output',
    'ready', 'ready_with_warnings', 'retry_pending', 'failed', 'cancelled',
    'superseded', 'archived'
  )),
  confidence                NUMERIC(5,4) CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  metadata                  JSONB NOT NULL DEFAULT '{}',
  created_by                UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at                TIMESTAMPTZ
);

CREATE INDEX idx_pi_doc_evidence_document ON project_intelligence_document_evidence(engineering_document_id)
  WHERE deleted_at IS NULL;

CREATE TRIGGER project_intelligence_document_evidence_updated_at
  BEFORE UPDATE ON project_intelligence_document_evidence FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER project_intelligence_document_evidence_identity_immutable
  BEFORE UPDATE ON project_intelligence_document_evidence
  FOR EACH ROW EXECUTE FUNCTION prevent_pi_document_identity_mutation();

CREATE TABLE project_intelligence_document_citations (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  engineering_project_id    UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  engineering_document_id   UUID NOT NULL REFERENCES engineering_documents(id) ON DELETE CASCADE,
  evidence_id               UUID REFERENCES project_intelligence_document_evidence(id) ON DELETE SET NULL,
  chunk_id                  UUID REFERENCES project_intelligence_document_chunks(id) ON DELETE SET NULL,
  answer_trace_id           UUID,
  source_revision           TEXT NOT NULL,
  processing_version        TEXT NOT NULL DEFAULT '1',
  document_number           TEXT,
  document_title            TEXT,
  page_start                INTEGER,
  page_end                  INTEGER,
  section_path              TEXT,
  excerpt                   TEXT NOT NULL,
  evidence_score            NUMERIC(8,6),
  source_coordinates        JSONB,
  status                    TEXT NOT NULL DEFAULT 'ready' CHECK (status IN (
    'registered', 'queued', 'fetching', 'validating', 'parsing', 'normalizing',
    'chunking', 'embedding', 'indexing', 'extracting', 'validating_output',
    'ready', 'ready_with_warnings', 'retry_pending', 'failed', 'cancelled',
    'superseded', 'archived'
  )),
  confidence                NUMERIC(5,4) CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  metadata                  JSONB NOT NULL DEFAULT '{}',
  created_by                UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at                TIMESTAMPTZ
);

CREATE INDEX idx_pi_doc_citations_document ON project_intelligence_document_citations(engineering_document_id)
  WHERE deleted_at IS NULL;

CREATE TRIGGER project_intelligence_document_citations_updated_at
  BEFORE UPDATE ON project_intelligence_document_citations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER project_intelligence_document_citations_identity_immutable
  BEFORE UPDATE ON project_intelligence_document_citations
  FOR EACH ROW EXECUTE FUNCTION prevent_pi_document_identity_mutation();

CREATE TABLE project_intelligence_document_findings (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  engineering_project_id    UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  engineering_document_id   UUID NOT NULL REFERENCES engineering_documents(id) ON DELETE CASCADE,
  source_revision           TEXT NOT NULL,
  processing_version        TEXT NOT NULL DEFAULT '1',
  finding_type              TEXT NOT NULL,
  severity                  TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title                     TEXT NOT NULL,
  description               TEXT,
  evidence                  JSONB NOT NULL DEFAULT '[]',
  affected_documents        JSONB NOT NULL DEFAULT '[]',
  suggested_review_action   TEXT,
  review_state              TEXT NOT NULL DEFAULT 'pending' CHECK (review_state IN (
    'pending', 'in_review', 'approved', 'rejected', 'deferred'
  )),
  model                     TEXT,
  prompt_version            TEXT,
  status                    TEXT NOT NULL DEFAULT 'ready' CHECK (status IN (
    'registered', 'queued', 'fetching', 'validating', 'parsing', 'normalizing',
    'chunking', 'embedding', 'indexing', 'extracting', 'validating_output',
    'ready', 'ready_with_warnings', 'retry_pending', 'failed', 'cancelled',
    'superseded', 'archived'
  )),
  confidence                NUMERIC(5,4) CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  metadata                  JSONB NOT NULL DEFAULT '{}',
  created_by                UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at                TIMESTAMPTZ
);

CREATE INDEX idx_pi_doc_findings_document ON project_intelligence_document_findings(engineering_document_id)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_pi_doc_findings_review ON project_intelligence_document_findings(tenant_id, review_state)
  WHERE deleted_at IS NULL;

CREATE TRIGGER project_intelligence_document_findings_updated_at
  BEFORE UPDATE ON project_intelligence_document_findings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER project_intelligence_document_findings_identity_immutable
  BEFORE UPDATE ON project_intelligence_document_findings
  FOR EACH ROW EXECUTE FUNCTION prevent_pi_document_identity_mutation();

CREATE TABLE project_intelligence_document_answer_traces (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  engineering_project_id    UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  engineering_document_id   UUID REFERENCES engineering_documents(id) ON DELETE SET NULL,
  source_revision           TEXT,
  processing_version        TEXT NOT NULL DEFAULT '1',
  query_text                TEXT NOT NULL,
  answer_text               TEXT,
  answer_status             TEXT NOT NULL CHECK (answer_status IN (
    'answered', 'partially_answered', 'abstained', 'conflicting_evidence',
    'document_not_ready', 'insufficient_permission'
  )),
  confidence                NUMERIC(5,4) CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  retrieval_trace_id        TEXT NOT NULL,
  model                     TEXT,
  prompt_version            TEXT,
  citations                 JSONB NOT NULL DEFAULT '[]',
  evidence                  JSONB NOT NULL DEFAULT '[]',
  documents_used            JSONB NOT NULL DEFAULT '[]',
  processing_versions       JSONB NOT NULL DEFAULT '[]',
  warnings                  JSONB NOT NULL DEFAULT '[]',
  review_state              TEXT,
  status                    TEXT NOT NULL DEFAULT 'ready' CHECK (status IN (
    'registered', 'queued', 'fetching', 'validating', 'parsing', 'normalizing',
    'chunking', 'embedding', 'indexing', 'extracting', 'validating_output',
    'ready', 'ready_with_warnings', 'retry_pending', 'failed', 'cancelled',
    'superseded', 'archived'
  )),
  metadata                  JSONB NOT NULL DEFAULT '{}',
  created_by                UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at                TIMESTAMPTZ
);

CREATE INDEX idx_pi_doc_answer_traces_tenant ON project_intelligence_document_answer_traces(tenant_id, created_at DESC)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_pi_doc_answer_traces_document ON project_intelligence_document_answer_traces(engineering_document_id)
  WHERE engineering_document_id IS NOT NULL AND deleted_at IS NULL;

CREATE TRIGGER project_intelligence_document_answer_traces_updated_at
  BEFORE UPDATE ON project_intelligence_document_answer_traces FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- answer traces may omit engineering_document_id (cross-doc query); still lock tenant/workspace
CREATE OR REPLACE FUNCTION prevent_pi_document_answer_trace_identity_mutation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
     OR NEW.workspace_id IS DISTINCT FROM OLD.workspace_id THEN
    RAISE EXCEPTION 'tenant_id and workspace_id are immutable after insert';
  END IF;
  IF OLD.engineering_document_id IS NOT NULL
     AND NEW.engineering_document_id IS DISTINCT FROM OLD.engineering_document_id THEN
    RAISE EXCEPTION 'engineering_document_id is immutable after insert when set';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

CREATE TRIGGER project_intelligence_document_answer_traces_identity_immutable
  BEFORE UPDATE ON project_intelligence_document_answer_traces
  FOR EACH ROW EXECUTE FUNCTION prevent_pi_document_answer_trace_identity_mutation();

CREATE TABLE project_intelligence_document_review_items (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  engineering_project_id    UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  engineering_document_id   UUID REFERENCES engineering_documents(id) ON DELETE SET NULL,
  finding_id                UUID REFERENCES project_intelligence_document_findings(id) ON DELETE SET NULL,
  answer_trace_id           UUID REFERENCES project_intelligence_document_answer_traces(id) ON DELETE SET NULL,
  source_revision           TEXT,
  processing_version        TEXT NOT NULL DEFAULT '1',
  review_type               TEXT NOT NULL,
  title                     TEXT NOT NULL,
  description               TEXT,
  review_state              TEXT NOT NULL DEFAULT 'pending' CHECK (review_state IN (
    'pending', 'in_review', 'approved', 'rejected', 'deferred', 'reprocess_requested'
  )),
  assigned_to               UUID REFERENCES profiles(id) ON DELETE SET NULL,
  decided_by                UUID REFERENCES profiles(id) ON DELETE SET NULL,
  decided_at                TIMESTAMPTZ,
  decision_comment          TEXT,
  proposed_core_mutation    JSONB,
  status                    TEXT NOT NULL DEFAULT 'ready' CHECK (status IN (
    'registered', 'queued', 'fetching', 'validating', 'parsing', 'normalizing',
    'chunking', 'embedding', 'indexing', 'extracting', 'validating_output',
    'ready', 'ready_with_warnings', 'retry_pending', 'failed', 'cancelled',
    'superseded', 'archived'
  )),
  confidence                NUMERIC(5,4) CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  metadata                  JSONB NOT NULL DEFAULT '{}',
  created_by                UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at                TIMESTAMPTZ
);

CREATE INDEX idx_pi_doc_review_items_tenant ON project_intelligence_document_review_items(tenant_id, review_state)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_pi_doc_review_items_document ON project_intelligence_document_review_items(engineering_document_id)
  WHERE engineering_document_id IS NOT NULL AND deleted_at IS NULL;

CREATE TRIGGER project_intelligence_document_review_items_updated_at
  BEFORE UPDATE ON project_intelligence_document_review_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER project_intelligence_document_review_items_identity_immutable
  BEFORE UPDATE ON project_intelligence_document_review_items
  FOR EACH ROW EXECUTE FUNCTION prevent_pi_document_answer_trace_identity_mutation();

CREATE TABLE project_intelligence_document_audit (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  engineering_document_id   UUID REFERENCES engineering_documents(id) ON DELETE SET NULL,
  ingestion_id              UUID REFERENCES project_intelligence_document_ingestions(id) ON DELETE SET NULL,
  processing_run_id         UUID REFERENCES project_intelligence_document_processing_runs(id) ON DELETE SET NULL,
  actor_id                  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action                    TEXT NOT NULL,
  from_status               TEXT,
  to_status                 TEXT,
  event_id                  TEXT NOT NULL,
  correlation_id            UUID,
  details                   JSONB NOT NULL DEFAULT '{}',
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id)
);

CREATE INDEX idx_pi_doc_audit_document ON project_intelligence_document_audit(engineering_document_id, created_at DESC);
CREATE INDEX idx_pi_doc_audit_tenant ON project_intelligence_document_audit(tenant_id, created_at DESC);
CREATE INDEX idx_pi_doc_audit_ingestion ON project_intelligence_document_audit(ingestion_id, created_at DESC);

-- RLS
ALTER TABLE project_intelligence_document_ingestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_intelligence_document_processing_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_intelligence_document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_intelligence_document_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_intelligence_document_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_intelligence_document_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_intelligence_document_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_intelligence_document_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_intelligence_document_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_intelligence_document_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_intelligence_document_answer_traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_intelligence_document_review_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_intelligence_document_audit ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION pi_document_workspace_allowed(p_workspace_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM workspace_memberships
    WHERE user_id = auth.uid()
      AND workspace_id = p_workspace_id
  );
$$ LANGUAGE sql STABLE
SET search_path = public, pg_temp;

-- Policies: tenant via get_user_tenant_ids() + workspace membership (batch_34 pattern)
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'project_intelligence_document_ingestions',
    'project_intelligence_document_processing_runs',
    'project_intelligence_document_chunks',
    'project_intelligence_document_embeddings',
    'project_intelligence_document_extractions',
    'project_intelligence_document_summaries',
    'project_intelligence_document_comparisons',
    'project_intelligence_document_evidence',
    'project_intelligence_document_citations',
    'project_intelligence_document_findings',
    'project_intelligence_document_answer_traces',
    'project_intelligence_document_review_items'
  ]
  LOOP
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR SELECT USING (
         tenant_id = ANY(get_user_tenant_ids())
         AND workspace_id IN (SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid())
       )',
      tbl || '_select', tbl
    );
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR ALL USING (
         has_permission(''engineering'', ''admin'', tenant_id)
         AND workspace_id IN (SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid())
       ) WITH CHECK (
         has_permission(''engineering'', ''admin'', tenant_id)
         AND workspace_id IN (SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid())
       )',
      tbl || '_manage', tbl
    );
  END LOOP;
END $$;

CREATE POLICY pi_document_audit_select ON project_intelligence_document_audit FOR SELECT
  USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND workspace_id IN (
      SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
    )
  );
CREATE POLICY pi_document_audit_insert ON project_intelligence_document_audit FOR INSERT
  WITH CHECK (
    tenant_id = ANY(get_user_tenant_ids())
    AND workspace_id IN (
      SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
    )
  );

COMMENT ON TABLE project_intelligence_document_ingestions IS
  'PI document processing registration; metadata SoT remains engineering_documents.';
COMMENT ON COLUMN project_intelligence_document_embeddings.embedding IS
  'Float array stored as jsonb; prefer vector(3072) only after pgvector is enabled platform-wide.';
