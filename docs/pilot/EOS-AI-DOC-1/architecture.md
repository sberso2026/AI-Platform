# Architecture

## Ownership

| Concern | Owner |
|---|---|
| Document identity, RBAC, project/workspace | Engineering OS Documents |
| Binary object | Canonical `engineering-documents` bucket, signed upload/download |
| Ingestion job, parse, chunk, embed, index | Project Intelligence document worker |
| Ask, abstention, citations | Engineering AI composing PI retrieval |
| Model access | Platform AI Director / Model Registry (`GovernedEmbeddingAdapter`) |

Ask, document GET, and upload-complete import `@rtb/project-intelligence/retrieval` (index + enqueue only). PDF/DOCX parsers load only inside the document worker.

## Flow

```
attach/create
  → enqueueCanonicalDocumentIngestion
  → worker fetch (tenant/workspace/document path only)
  → native PDF/DOCX/TXT extract (OCR only when policy says so)
  → engineering-aware segments
  → chunk + provenance
  → embeddings if configured, else lexical index
  → Engineering AI Ask (document or project scope)
```

## Presentation states

`metadata_only | queued | processing | indexed | partial | failed`

AI searchable is Yes only for `indexed` or `partial` with persisted chunks. Metadata-only is never searchable content.
