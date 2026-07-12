# Project Intelligence Retrieval

**Phase:** 6C-2

## Pipeline

`ProjectIntelligenceDocumentRetrievalService` runs:

1. Authorize user (tenant / workspace / project scope)
2. Apply metadata filters (project, document, revision, …)
3. Lexical search
4. Vector search
5. Combine candidates
6. Light rerank / diversify by document+revision
7. Score threshold
8. Citation construction
9. Hand off to grounded answer or abstention

## Security

- Never retrieve outside permitted tenant/workspace/project set
- Index adapters must re-check filter predicates locally (in-memory) or via RLS (Postgres)
- Superseded revisions must not silently win for `answered` status

## Adapters

- `ProjectIntelligenceEmbeddingAdapter` — model registry / metering at Platform boundary
- `ProjectIntelligenceDocumentIndexAdapter` — `InMemoryDocumentIndexAdapter` for unit/cert; Postgres stub for hosted path
- Deterministic local embeddings (dim 64 or 3072) are for certification only
