# Project Intelligence Document Data Ownership

**Phase:** 6C-2

## Engineering Core (authoritative)

Owns document register identity and lifecycle metadata:

- document identity (`engineering_documents.id`)
- tenant, workspace, project, asset relationships
- document number, title, type, discipline
- revision, status, issue/authorship/approval metadata
- file reference (`file_path`, `file_name`, `mime_type`, `file_size`)
- register access permissions and supersession

Project Intelligence **must not** create a competing document register or mutate Core status as a side effect of processing.

## Project Intelligence (derivatives)

Owns intelligence-plane records keyed by `engineering_document_id`:

- ingestions and processing runs
- parser/normalized structured output
- chunks, embeddings, index records
- extractions, summaries, comparisons
- evidence, citations, answer traces
- findings and review items
- processing diagnostics and retention metadata

## Binding rule

Every PI intelligence row that speaks about a document **must** reference:

- `tenant_id`, `workspace_id`
- `engineering_project_id` (when known)
- `engineering_document_id`
- `source_revision` (Core revision string)
- `processing_version`

## Review boundary

```
PI finding / extraction
  → human review
  → proposed Core mutation (optional)
  → authorized Core service call
```

AI must never write authoritative risks, issues, actions, decisions, or TQs directly.
