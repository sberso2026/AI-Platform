# Ingestion contract

After a source file is attached (PDF, TXT, DOCX):

1. Create ingestion job (`project_intelligence.document.process`).
2. Extract native content. Do not silently OCR every PDF.
3. Normalize and segment into retrieval units (clauses, headings, tables, figures, notes, equations).
4. Persist provenance: `document_id`, `tenant_id`, `workspace_id`, `project_id`, `page_number`, `section`, `chunk_id`.
5. Index for lexical retrieval; write embeddings only through the governed adapter.
6. Expose presentation state on the Engineering document detail API (Documents read, not a second registry).

Re-index is operator/admin/owner only (`POST /api/engineering/documents/{id}/ingest`).
