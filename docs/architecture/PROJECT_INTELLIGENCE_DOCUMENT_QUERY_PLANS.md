# Project Intelligence — Document Query Plans

Representative retrieval plans for Phase 6C-2 (hosted Supabase / pgvector).

## Expected index usage

| Query class | Intended access path |
|-------------|----------------------|
| Vector-only | HNSW on `embedding_vector` via `pi_document_vector_search` |
| Lexical-only | btree / text filters + `pi_document_lexical_search` |
| Hybrid | lexical candidates ∪ vector candidates, then SQL tenant/workspace filters |
| Tenant / workspace filtered | `tenant_id` / `workspace_id` equality in SQL before ranking |
| Project filtered | `engineering_project_id` predicate |
| Current-revision filtered | supersession / current revision flag in SQL |
| Document filtered | `engineering_document_id` equality |

## Authorization

Unauthorized candidates must be excluded in SQL (not only in application post-filters). RLS covers user JWT paths; worker search RPCs enforce tenant/workspace arguments.

## Scale notes

- HNSW (`vector_cosine_ops`) for 1536-d embeddings
- Soft-deleted chunks (`deleted_at`) excluded from active retrieval
- Reindex required only when embedding dimension or model family changes (versioned embedding rows)
