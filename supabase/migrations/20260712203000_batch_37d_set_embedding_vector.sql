-- Batch 37d: governed pgvector write helper (PostgREST-safe).
CREATE OR REPLACE FUNCTION pi_document_set_embedding_vector(
  p_chunk_id UUID,
  p_provider TEXT,
  p_model TEXT,
  p_processing_version TEXT,
  p_vector DOUBLE PRECISION[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_chunk_id IS NULL OR p_provider IS NULL OR p_model IS NULL OR p_processing_version IS NULL THEN
    RAISE EXCEPTION 'chunk_id, provider, model, and processing_version are required';
  END IF;
  IF p_vector IS NULL OR array_length(p_vector, 1) IS DISTINCT FROM 1536 THEN
    RAISE EXCEPTION 'embedding vector must have 1536 dimensions';
  END IF;

  UPDATE project_intelligence_document_embeddings
  SET embedding_vector = p_vector::vector(1536),
      updated_at = NOW()
  WHERE chunk_id = p_chunk_id
    AND embedding_provider = p_provider
    AND embedding_model = p_model
    AND processing_version = p_processing_version
    AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'embedding row not found for chunk %', p_chunk_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION pi_document_set_embedding_vector(UUID, TEXT, TEXT, TEXT, DOUBLE PRECISION[])
  TO service_role;

COMMENT ON FUNCTION pi_document_set_embedding_vector(UUID, TEXT, TEXT, TEXT, DOUBLE PRECISION[]) IS
  'Sets embedding_vector via cast from float8[]; used by document worker after jsonb upsert.';
