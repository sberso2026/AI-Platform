# Project Intelligence Document Intelligence — Production Baseline (Phase 8C)

**Target:** hosted staging  
**Scope:** fixture-scale certification — not an enterprise capacity claim

## Fixture assumptions

| Dimension | Certified baseline |
|-----------|-------------------|
| Documents per workspace | ≤ 20 processing fixtures |
| Concurrent workers | 2–4 claimers |
| Max upload size | 25 MiB |
| MIME | PDF, TXT, DOCX |
| Embedding model | `text-embedding-3-small` |
| Dimension | 1536 |
| Index | HNSW cosine on `embedding_vector` |

## Provider quotas / cost assumptions

- OpenAI embedding calls metered via Platform cost controls
- Azure Document Intelligence used only when configured
- Hash embedding fallback **disabled** in provider certification mode
- Deterministic local ports allowed only when `PROJECT_INTELLIGENCE_CERTIFICATION` / unit mode

## Timeout / retry limits

| Path | Limit |
|------|-------|
| Parser | bounded provider timeout; stable error codes |
| Embedding | retries with backoff; no silent hash in production provider mode |
| Job lease | SKIP LOCKED claim; lease expiry → recovery |
| Dead letter | after max attempts |

## Observed hosted staging characteristics (fixture scale)

| Metric | Expectation at fixture scale |
|--------|------------------------------|
| Upload / register | Sub-second API accept |
| Enqueue latency | Transactional RPC; typically &lt; 2s |
| Parser throughput | Sequential per job; provider-bound |
| Chunk persistence | Durable insert before embed |
| Embedding throughput | Batch per document; provider-bound |
| Lexical / vector / hybrid search | Postgres RPCs; typically &lt; 2s p95 on fixtures |
| Grounded-answer latency | Retrieval + contract assemble; typically &lt; 3s p95 |
| Queue recovery | Lease reclaim after expiry |
| Multi-worker exclusion | SKIP LOCKED — one claimer per job |

Exact p50/p95 are recorded in certification run artifacts when hosted gates execute.
Do **not** extrapolate fixture p95 to enterprise concurrency.

## Known scaling boundaries

- Single-region hosted staging
- Fixture corpus size ≪ production corpora
- Provider rate limits dominate embedding/OCR throughput
- HNSW build/maintenance cost grows with embedding row count
