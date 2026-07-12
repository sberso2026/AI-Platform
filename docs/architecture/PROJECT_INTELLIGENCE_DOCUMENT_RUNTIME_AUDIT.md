# Project Intelligence Document Runtime Audit

**Phase:** 6C-2 Final  
**Baseline certified commit:** `499af0caee7916ccb8a1093339708f8a38103762`  
**Purpose:** Classify every certification/memory shortcut and define the durable replacement.

## Classification legend

| Class | Meaning |
|-------|---------|
| test fixture only | Allowed in unit/Playwright fixture setup |
| certification shortcut | Must not be required for hosted production-path cert |
| runtime dependency | Currently required for happy path — **must remove** |
| removable | Delete after durable path lands |
| requires durable replacement | Keep interface; change implementation |

## Inventory

| Location | Mechanism | Class | Durable replacement |
|----------|-----------|-------|---------------------|
| `apps/web/.../documents-service.ts` `__rtbPiDocumentMemory` | `globalThis` Map | runtime dependency | Supabase ingestions/chunks/findings |
| `apps/web/.../documents-service.ts` `__rtbPiDocumentReviews` | `globalThis` Map | runtime dependency | `project_intelligence_document_review_items` |
| `documents-service.certificationMode()` | `PROJECT_INTELLIGENCE_CERTIFICATION=1` gates sync pipeline | certification shortcut | Same enqueue→worker→DB path; flag only seeds fixtures / thresholds |
| `documents-service.processDocument` sync `runInMemoryPipeline` | In-process parse/chunk | runtime dependency | Enqueue job; worker processes |
| `documents-service.processDocument` non-cert stub | Returns `stub: true` | removable | Durable enqueue always |
| `documents-service.queryDocuments` memory candidates | Reads process Map | runtime dependency | Persistent hybrid retrieval |
| `InMemoryDocumentIndexAdapter` | Module Map | test fixture only (+ was runtime) | `PostgresDocumentIndexAdapter` + pgvector |
| `DeterministicLocalEmbeddingAdapter` | Hash vectors | test fixture only | Unit tests only; production uses governed provider |
| `document-service.ts` (package) in-memory orchestration | Service Map | requires durable replacement | Worker step runner persists each step |
| Cert Playwright process→query same process | Relies on memory | certification shortcut | Worker completes before status ready |
| Gate commands using unit mocks for H/I | Not production path | certification shortcut | Hosted durable-processing + retrieval-evaluation jobs |

## Non-goals for this audit

- Meeting Intelligence
- Permanent legacy PI DB dependency
- Weakening citation / abstention / RLS / Core ownership

## Target production path (mandatory for hosted cert)

```
API process request
  → transactional: ingestion + processing_run + job + outbox
  → return queued status
Worker (separate process / scheduler)
  → claim lease (SKIP LOCKED)
  → fetch → validate → parse → normalize → chunk → embed → index → extract → validate_output → activate
  → persist chunks + pgvector embeddings
  → emit outbox completion
API / UI
  → read durable status
Query
  → lexical + pgvector hybrid (filters in SQL)
  → citations / abstain / conflict
```

## Exit criteria for “production-ready”

- No process-global maps required for process/query/status
- `PROJECT_INTELLIGENCE_CERTIFICATION` does not replace architecture
- Multi-instance: enqueue on A, process on B, read on C
