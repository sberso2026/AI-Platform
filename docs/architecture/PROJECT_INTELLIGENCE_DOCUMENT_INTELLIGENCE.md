# Project Intelligence Document Intelligence

**Phase:** 6C-2

## Ownership

Engineering Core `engineering_documents` is the metadata source of truth. Project Intelligence stores **derivatives only**, always keyed by `engineering_document_id` (+ tenant/workspace, revision, processing version).

PI owns: ingestions, processing runs, chunks, embeddings, extractions, summaries, comparisons, evidence, citations, findings, answer traces, review items, document audit.

Meetings are **out of scope** for 6C-2.

## Processing lifecycle

`registered → queued → fetching → validating → parsing → normalizing → chunking → embedding → indexing → extracting → validating_output → ready | ready_with_warnings`

Failure/control states: `retry_pending`, `failed`, `cancelled`, `superseded`, `archived`.

Rules:

- Server-validated transitions (`ingestion-state-machine`)
- Every transition audited (`project_intelligence_document_audit`)
- Failed / incomplete processing cannot back authoritative answers
- Processing never mutates Core document status

## Package surface

`packages/project-intelligence/src/documents/`:

| Module | Role |
|--------|------|
| `document-service` | Orchestrate process / retry / status / query |
| `parser` | `ProjectIntelligenceDocumentParser` + native text |
| `chunking` | Deterministic section/page chunker; tables intact |
| `embedding-adapter` | Governed embedding port + deterministic local cert adapter |
| `index-adapter` | In-memory index + Postgres stub interface |
| `retrieval-service` | Authorize → filter → lexical → vector → combine → rerank → threshold → citations |
| `grounded-answer` / `abstention` | Answer contract + abstain/conflict policy |
| `comparison-service` | Revision diffs with evidence; human review required for impact |
| `findings` | Finding types + **no Core mutation** review boundary |
| `storage-policy` | PDF/TXT/DOCX, 25 MiB |
| `legacy-document-adapter` | Read-only equivalence only |

## Schema

Migration: `supabase/migrations/20260712180000_batch_36_project_intelligence_documents.sql`

Embeddings are `jsonb` float arrays until pgvector is enabled platform-wide.
