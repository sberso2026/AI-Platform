# Project Intelligence Document Intelligence — Phase 6C-2 Final

**Certified baseline (capability port):** `499af0caee7916ccb8a1093339708f8a38103762`  
**This batch:** durable jobs, outbox, worker, pgvector, governed embeddings/parsers.

## Production path

API enqueue → `pi_document_enqueue_processing` → worker claim (`SKIP LOCKED`) → steps → persistent chunks → pgvector → hybrid retrieval.

## Vector index

- Extension: `vector`
- Dimension: 1536
- Metric: cosine (`<=>`)
- Index: HNSW (`vector_cosine_ops`)
- Scale claim: staging / fixture scale only

## Embedding

- Adapter: `GovernedEmbeddingAdapter`
- Preferred: OpenAI `text-embedding-3-small` via `PLATFORM_EMBEDDING_API_KEY` / `OPENAI_API_KEY`
- Staging fallback: `platform-staging-hash-1536-v1` (path parity, not production semantic proof)
- Unit tests may still use `DeterministicLocalEmbeddingAdapter`

## Parsers

- `native-text`
- `pdf-text` (pdf-parse)
- `docx-mammoth`
- Advanced Docling/Azure: stub interface only
- OCR: policy detection + review warning; no silent authoritative OCR substitution

## Worker

- Endpoint: `POST /api/platform/project-intelligence/document-jobs/run`
- Auth: scheduler secret or tenant owner
- Independent of document process handlers
