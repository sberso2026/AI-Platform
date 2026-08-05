# Project Intelligence Document Intelligence — Phase 8C Reconciliation

**Platform:** RTB AI Platform  
**Phase:** 8C — Document Intelligence Module Integration and Production Closure  
**Baselines:** Phase 7B `1a2c76f…`, Phase 8A `3d66906…`, Phase 8B `118f933…`  
**Runtime baselines:** durable `1a62407…`, provider `a0ec510…`, parser/OCR `dfcf6a1…`

## Intent

Integrate the **existing certified Document Intelligence runtime** into Engineering OS (8A)
and Project Intelligence (8B). **Do not rebuild.** No second runtime, no duplicate tables.

## Classification legend

| Class | Meaning |
|-------|---------|
| Preserve | Keep as-is under PI feature `document_intelligence` |
| Rebind | Keep behaviour; bind to shared Engineering Services / Platform AI |
| Consolidate | Merge duplicate surface behind one owned path |
| Replace legacy adapter | Swap legacy-only adapter for Eng Core / Platform adapter |
| Retire duplicate | Remove competing ownership (not physical delete of certified schema) |
| Defer | Explicitly out of 8C |

## Inventory

| Component | Location | Class | Notes |
|-----------|----------|-------|-------|
| Feature registration | `features/registry.ts`, Eng OS module registry | Preserve | `document_intelligence` under `project_intelligence` |
| PI shell navigation | `project-intelligence-shell.tsx` | Preserve | Document Intelligence tab |
| Documents home UI | `…/documents/page.tsx` | Preserve + Rebind | Add `document-intelligence-ready` |
| Document detail / query / review / health UI | `…/documents/**` | Preserve | Inside PI shell only |
| Engineering Core document register UI | `/engineering/documents` | Preserve | Metadata SoT shell — not DI runtime |
| DI APIs | `api/engineering/project-intelligence/documents/**` | Preserve | Nested error contracts |
| Domain services | `packages/project-intelligence/src/documents/*` | Preserve | Certified Phase 6C-2 stack |
| Durable enqueue / jobs / outbox / worker | `durable-enqueue.ts`, `jobs.ts`, `document-worker.ts` | Preserve | SKIP LOCKED claim RPCs |
| Parser adapters | native, pdf-parse v2, Mammoth, Azure DI | Preserve | Governed routing |
| Embedding adapters | OpenAI `text-embedding-3-small` @ 1536 | Preserve | Governed; hash only cert/staging |
| Index / retrieval | pgvector HNSW + lexical RPCs | Preserve | No in-memory production index |
| Grounded answers / citations / abstention | `grounded-answer.ts`, `abstention.ts` | Rebind | API uses domain builders (8C) |
| Conflict handling | `detectConflictingCitations` | Preserve | Surface conflict; no silent pick |
| Revision comparison | `comparison-service.ts` | Rebind | API uses comparison service (8C) |
| Findings table + boundary | `findings.ts`, `project_intelligence_document_findings` | Preserve | No Core mutation |
| Findings → Findings Intelligence handoff | `findings-handoff.ts` | Consolidate | Typed candidate emission only |
| Review queue | `project_intelligence_document_review_items` | Preserve + Consolidate | Full action set in 8C |
| Migrations / tables | Batch 36–37g | Preserve | No competing DI tables |
| Storage policy | `storage-policy.ts` | Preserve | MIME/size limits |
| Shared Eng services declaration | registry + `shared-services-binding.ts` | Rebind | Catalog consumption proven in cert |
| Local AI stack | — | Retire duplicate | `implementsOwnAiStack: false` |
| Meeting / Teams / Zoom | meetings/* | Defer | Out of 8C |
| Broad Findings / Reporting modules | findings/reports pages | Defer | Handoff only |
| Legacy standalone DI | `legacy-document-adapter.ts` | Replace legacy adapter | Equivalence only |

## Proven equivalence (no destructive change)

- Durable processing path unchanged: API → validate → enqueue → outbox → SKIP LOCKED claim → steps → activate
- Vector storage remains `vector(1536)` + HNSW cosine
- Engineering Core remains document metadata SoT via `engineering_documents`
- PI owns intelligence derivatives only (`project_intelligence_document_*`)

## Duplicate runtime check

| Candidate | Status |
|-----------|--------|
| Second DI package | **None** |
| Competing chunk/embedding tables | **None** (legacy names retired) |
| In-memory production index | **Forbidden**; in-memory adapters are unit/cert only |

## 8C closure actions

1. Shared-service binding assertions + architectural tests  
2. Typed Findings Intelligence handoff  
3. Review action completeness  
4. Query/compare API rebind to domain services  
5. UI readiness marker `document-intelligence-ready`  
6. Phase 8C certification gates A–X + hosted workflow
