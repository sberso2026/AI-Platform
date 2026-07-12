-- RTB AI Platform Batch 37b — Hybrid search RPCs (lexical + pgvector)
-- Filters are applied in SQL before candidates are returned.

-- Lexical search
CREATE OR REPLACE FUNCTION pi_document_lexical_search(
  p_tenant_id UUID,
  p_workspace_id UUID,
  p_query TEXT,
  p_limit INT DEFAULT 10,
  p_project_ids UUID[] DEFAULT NULL,
  p_document_ids UUID[] DEFAULT NULL,
  p_revisions TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  tenant_id UUID,
  workspace_id UUID,
  engineering_project_id UUID,
  engineering_document_id UUID,
  source_revision TEXT,
  processing_version TEXT,
  chunk_index INT,
  stable_chunk_id TEXT,
  content TEXT,
  content_hash TEXT,
  section_path TEXT,
  page_start INT,
  page_end INT,
  block_type TEXT,
  score DOUBLE PRECISION
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    c.id,
    c.tenant_id,
    c.workspace_id,
    c.engineering_project_id,
    c.engineering_document_id,
    c.source_revision,
    c.processing_version,
    c.chunk_index,
    c.stable_chunk_id,
    c.content,
    c.content_hash,
    c.section_path,
    c.page_start,
    c.page_end,
    c.block_type,
    ts_rank_cd(c.content_tsv, websearch_to_tsquery('english', p_query))::double precision AS score
  FROM project_intelligence_document_chunks c
  WHERE c.deleted_at IS NULL
    AND c.tenant_id = p_tenant_id
    AND c.workspace_id = p_workspace_id
    AND c.content_tsv @@ websearch_to_tsquery('english', p_query)
    AND (p_project_ids IS NULL OR c.engineering_project_id = ANY(p_project_ids))
    AND (p_document_ids IS NULL OR c.engineering_document_id = ANY(p_document_ids))
    AND (p_revisions IS NULL OR c.source_revision = ANY(p_revisions))
  ORDER BY score DESC
  LIMIT GREATEST(LEAST(COALESCE(p_limit, 10), 100), 1);
$$;

-- Vector search (cosine distance → similarity)
CREATE OR REPLACE FUNCTION pi_document_vector_search(
  p_tenant_id UUID,
  p_workspace_id UUID,
  p_query_embedding vector(1536),
  p_limit INT DEFAULT 10,
  p_project_ids UUID[] DEFAULT NULL,
  p_document_ids UUID[] DEFAULT NULL,
  p_revisions TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  chunk_id UUID,
  tenant_id UUID,
  workspace_id UUID,
  engineering_project_id UUID,
  engineering_document_id UUID,
  source_revision TEXT,
  processing_version TEXT,
  chunk_index INT,
  stable_chunk_id TEXT,
  content TEXT,
  content_hash TEXT,
  section_path TEXT,
  page_start INT,
  page_end INT,
  block_type TEXT,
  score DOUBLE PRECISION
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    e.id,
    c.id AS chunk_id,
    c.tenant_id,
    c.workspace_id,
    c.engineering_project_id,
    c.engineering_document_id,
    c.source_revision,
    c.processing_version,
    c.chunk_index,
    c.stable_chunk_id,
    c.content,
    c.content_hash,
    c.section_path,
    c.page_start,
    c.page_end,
    c.block_type,
    (1 - (e.embedding_vector <=> p_query_embedding))::double precision AS score
  FROM project_intelligence_document_embeddings e
  INNER JOIN project_intelligence_document_chunks c ON c.id = e.chunk_id
  WHERE e.deleted_at IS NULL
    AND c.deleted_at IS NULL
    AND e.embedding_vector IS NOT NULL
    AND e.tenant_id = p_tenant_id
    AND e.workspace_id = p_workspace_id
    AND (p_project_ids IS NULL OR c.engineering_project_id = ANY(p_project_ids))
    AND (p_document_ids IS NULL OR c.engineering_document_id = ANY(p_document_ids))
    AND (p_revisions IS NULL OR c.source_revision = ANY(p_revisions))
  ORDER BY e.embedding_vector <=> p_query_embedding
  LIMIT GREATEST(LEAST(COALESCE(p_limit, 10), 100), 1);
$$;

GRANT EXECUTE ON FUNCTION pi_document_lexical_search(UUID, UUID, TEXT, INT, UUID[], UUID[], TEXT[])
  TO service_role, authenticated;
GRANT EXECUTE ON FUNCTION pi_document_vector_search(UUID, UUID, vector, INT, UUID[], UUID[], TEXT[])
  TO service_role, authenticated;
