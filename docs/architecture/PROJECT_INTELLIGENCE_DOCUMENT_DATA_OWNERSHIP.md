# Project Intelligence — Document Data Ownership

**Platform:** RTB AI Platform  
**Operating System:** Engineering OS  
**Module:** `project_intelligence`  
**Feature:** `document_intelligence`

## Rule

There is exactly one source of truth per concern. Document Intelligence never competes
with Engineering Core for project, asset, or document identity.

## Engineering Core (authoritative)

| Concern | Owner |
|---------|-------|
| Engineering project | Engineering OS Core |
| Asset | Engineering OS Core |
| Document metadata | Engineering OS Core (`engineering_documents`) |
| Document identity | Engineering OS Core |
| Document revision identity | Engineering OS Core |
| File reference | Engineering OS Core / Platform storage |
| Discipline | Engineering OS Core |
| Package | Engineering OS Core |
| Company | Engineering OS Core |
| Engineering timeline | Engineering OS Core (`engineering_timelines` shared service) |

## Project Intelligence Document Intelligence (derivatives)

All rows reference canonical Engineering Core IDs (`engineering_document_id`,
`engineering_project_id`, tenant, workspace).

| Concern | Owner tables (representative) |
|---------|-------------------------------|
| Ingestion runs | `project_intelligence_document_ingestions` |
| Processing jobs / steps | `project_intelligence_document_jobs`, `…_processing_steps` |
| Parser output | `project_intelligence_document_extracted` |
| Chunks | `project_intelligence_document_chunks` |
| Table structures | chunk/extracted JSON |
| Embeddings | `project_intelligence_document_embeddings` (`vector(1536)`) |
| Retrieval indices | Postgres lexical GIN + pgvector HNSW |
| Intelligence findings | `project_intelligence_document_findings` |
| Evidence / citations | `…_evidence`, `…_citations` |
| Answer traces | `project_intelligence_document_answer_traces` |
| Review items | `project_intelligence_document_review_items` |
| Provider execution / evaluation | job attempt + checkpoint metadata |
| Outbox / leases / dead letters | `…_outbox`, `…_worker_leases`, `…_dead_letters` |

## Mutation boundary

- Document Intelligence **must not** directly create Engineering Core decisions,
  actions, risks, issues, or technical queries.
- Candidate findings emit a typed handoff to Findings Intelligence.
- Human review is mandatory before any proposed Core mutation.
- AI-generated revision impact is advisory only.

## Shared services consumed (not re-owned)

`document_references`, `attachments`, `version_history`, `engineering_timelines`,
`comments`, `approvals`, `audit`, `reporting`, `ai_context`, `activity`, `notification`.
