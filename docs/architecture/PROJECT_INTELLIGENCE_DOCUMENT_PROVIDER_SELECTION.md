# Project Intelligence — Document Provider Selection (Phase 6C-2 Production Provider Closure)

**Status:** Governing decision  
**Scope:** Document Intelligence embeddings, advanced parsing, OCR  
**Out of scope:** Meeting Intelligence  

Provider keys are never printed or committed. Configuration uses server-only secrets.

---

## 1. Embedding provider

| Role | Provider | Model | Dimensions |
|------|----------|-------|------------|
| **Primary** | OpenAI (Platform-governed) | `text-embedding-3-small` | **1536** |
| **Fallback** | Azure OpenAI (same model family) | `text-embedding-3-small` via `PLATFORM_EMBEDDING_BASE_URL` | **1536** |

### Selection rationale

| Criterion | Decision |
|-----------|----------|
| Engineering document suitability | Strong semantic match for specs, revisions, abbreviations |
| Model dimensions | Exact match to existing `vector(1536)` + HNSW — no reindex required |
| Region / privacy | Configurable via OpenAI org / Azure region; documented in security note |
| Retention | Provider retention per Platform AI terms; no silent long-term training use without policy |
| Cost / latency / rate limits | Metered via Platform usage logs; batch embed with backoff |
| Auditability | Model key, version, trace ID, request ID, tenant/workspace scope |
| Governance | Activated only through Platform AI model registry + dimension guard |

### Rejected for production readiness

- `platform-staging-hash` / deterministic hash embeddings — path proof only; **not** semantic quality
- Models with non-1536 native dimensions without a versioned embedding table migration

### Activation rule

Hosted staging and production **fail closed** if the active embedding provider is hash/deterministic.  
Unit tests may use deterministic adapters only in `unit_test` mode.

---

## 2. Advanced document parser

| Role | Provider | Notes |
|------|----------|-------|
| **Primary (digital)** | `platform-structured` | Governed structured parser: pages, headings, paragraphs, lists, tables/cells, captions, page numbers, approximate coordinates, confidence, warnings, language, version, trace |
| **Primary (scanned / complex layout)** | Azure Document Intelligence (`prebuilt-layout`) when configured | Tables, coordinates, OCR fusion |
| **Optional** | Docling HTTP service (`DOCLING_SERVICE_URL`) | When self-hosted Docling is available |

### Routing policy (not every document)

Native text / PDF text / DOCX remain default when text density and table complexity are sufficient.  
Advanced parser is selected when:

- MIME suggests complex layout or scanned content
- Table complexity / image content flags are set
- Classification or cost budget permits
- OCR-required pages need structure preservation

---

## 3. OCR provider

| Role | Provider | Notes |
|------|----------|-------|
| **Primary (cloud)** | Azure Document Intelligence Read/Layout | Preferred when `AZURE_DOCUMENT_INTELLIGENCE_*` secrets present |
| **Primary (local / privacy)** | `platform-ocr-tesseract` | Page-level OCR for image pages and low-density PDF pages; coordinates + confidence |

OCR runs only after lightweight extraction and page-level density checks. Uncertain OCR is never silently promoted as authoritative.

---

## 4. Runtime modes

| Mode | Embeddings | Advanced / OCR |
|------|------------|----------------|
| `unit_test` | Deterministic permitted | Stubs / fixtures permitted |
| `local_development` | Deterministic or sandbox with visible warning | Sandbox permitted with warning |
| `hosted_staging` | Real governed embedding required for production-readiness | Real advanced/OCR providers required for those gates |
| `production` | Approved providers only; no hash fallback | Approved parsers/OCR only; fail closed if misconfigured |

---

## 5. Decision summary

1. **Embeddings:** OpenAI `text-embedding-3-small` (1536) via Platform AI governance.  
2. **Fallback embeddings:** Azure OpenAI endpoint with the same model and dimension guard.  
3. **Advanced parser:** `platform-structured` for digital engineering docs; Azure DI when scanned/complex and configured.  
4. **OCR:** Azure DI when configured; otherwise Platform Tesseract OCR with page-level confidence and review markers.

This selection preserves the durable job, outbox, RLS, citation, abstention, and review architecture without Meeting Intelligence porting.
