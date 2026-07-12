# Project Intelligence Document Capability Inventory

**Phase:** 6C-2  
**Frozen baseline:** `project-intelligence-integration-baseline-1` / `ab1f44276715888123d9f669464987e6f7c39b6c`  
**Certified AI Platform runtime (prior):** `871c0fdb0d5b152ef680a6535243829411af7426`  
**Source of freeze behaviour:** extracted worktree / vendored archive of standalone PI

## Classification legend

| Class | Meaning |
|-------|---------|
| preserve | Behaviour retained as-is behind Platform adapters |
| preserve_with_adapter | Same contract; Core/Platform ownership boundaries applied |
| modernize | Improve while keeping equivalence tests |
| replace_platform | Use Platform AI / Commerce / storage governance |
| defer | Out of Phase 6C-2 (meetings or later) |
| retire | Documented removal; not ported |

## Inventory

| ID | Capability | Freeze paths (representative) | Class | Notes |
|----|------------|-------------------------------|-------|-------|
| DOC-UPLOAD | Upload + registration | `api/documents/upload.ts`, `/documents` UI | preserve_with_adapter | Registration binds to Core `engineering_documents`; no duplicate register |
| DOC-META | Authoritative metadata | Standalone `documents` table | replace_platform | **Core SoT** — `engineering_documents` |
| DOC-STORAGE | Private object storage | `tenant-documents` bucket, `storageReadiness.ts` | replace_platform | Platform private storage + signed short-lived access |
| DOC-PROCESS | Processing jobs | `documentIndexingScheduler.ts`, jobs table | modernize | PI processing runs + outbox jobs |
| DOC-PARSE | Parsing | FastAPI parser, `documentParser.ts` | preserve_with_adapter | `ProjectIntelligenceDocumentParser` + native/Docling/Azure adapters |
| DOC-OCR | OCR | `documentOcrPipeline.ts`, `lib/ocr/*` | preserve_with_adapter | Optional stage; quality gates retained |
| DOC-CHUNK | Chunking | `indexableDocumentText.ts`, enrichment | preserve | Hierarchy + page + table integrity |
| DOC-EMBED | Embeddings | `embeddingService.ts` (3072-d) | replace_platform | Platform model registry + metering |
| DOC-INDEX | Vector/keyword index | `vectorStore.ts`, `match_document_chunks` | modernize | PI index tables + hybrid RPC/service |
| DOC-HYBRID | Hybrid retrieval | `hybridRetrievalEngine.ts` | preserve_with_adapter | Auth → filter → lexical → vector → rerank |
| DOC-QUERY | Grounded query | Thor `prepareThorDocumentGrounding.ts` | modernize | Governed answer contract + Director path |
| DOC-CITE | Citations | `evidencePackBuilder.ts` | preserve | Mandatory for factual answers |
| DOC-ABSTAIN | Abstention | Thor grounding gates | preserve | Thresholds + incomplete processing |
| DOC-CONFLICT | Conflicting evidence | revision / evidence gates | preserve | Surface conflict; no silent pick |
| DOC-TABLE | Table structure | parser tables, table retrieval | preserve | No meaning-changing flatten |
| DOC-REV | Revision compare | revision metadata + compare flows | modernize | Core revision + PI comparison service |
| DOC-FIND | Findings | `engineering_findings` | preserve_with_adapter | PI findings → review → Core proposal only |
| DOC-REVIEW | Review queue | `ai_human_review_queue` | modernize | PI document review items |
| DOC-LIMITS | MIME/size | PDF/TXT/DOCX, 25 MiB | preserve | Same limits unless Platform policy tightens |
| DOC-RLS | Tenant RLS | documents/chunks policies | modernize | Workspace + commerce seat/licence chain |
| DOC-MEET | Meeting intelligence | meetings/* | defer | Explicitly out of 6C-2 |
| DOC-LEGACY-DB | Standalone DB as runtime | Supabase PI project | retire | Equivalence adapter only; no permanent dependency |

## Supported file types (freeze)

- `application/pdf`
- `text/plain`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Max size: **25 MiB** (env override `DOCUMENT_UPLOAD_MAX_BYTES`)
- Batch: max 10 files (standalone UI)

## Security controls (freeze → platform)

| Control | Freeze | Platform 6C-2 |
|---------|--------|---------------|
| Auth | Bearer → profile tenant | Commerce entitlement + seats |
| Storage | Private bucket | Private; signed URL; no public service-role client paths |
| Retrieval | Server authorize | Tenant + workspace + project filters |
| Match RPC | SECURITY DEFINER processed-only | PI RLS + service with fixed search_path |

## Test corpus (freeze)

- ~335 Vitest files / **1892** cases at baseline equivalence
- Dense document coverage under `tests/lib/document*`, `tests/services/retrieval*`, `tests/thor*`, `tests/security/document*`

## AI Platform before 6C-2

- Core document register + routes exist
- PI shell/mapping/health only
- Abstention proof only in AI adapter
- No PI document-intelligence schema or processors
