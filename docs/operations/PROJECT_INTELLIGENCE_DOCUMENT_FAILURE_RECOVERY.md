# Project Intelligence Document Failure Recovery

**Phase:** 6C-2

## Processing failure codes

| Code | Operator action |
|------|-----------------|
| `document_not_found` | Confirm Core document ID and workspace scope |
| `document_access_denied` | Check seat, workspace assignment, installation |
| `document_unsupported_file_type` | Convert to PDF/TXT/DOCX within policy |
| `document_file_too_large` | Split or compress under 25 MiB |
| `document_source_file_unavailable` | Restore private storage object; re-process |
| `document_parser_failed` | Inspect parser warnings; retry once; escalate if persistent |
| `document_normalization_failed` | Retry; capture correlation ID |
| `document_chunking_failed` | Retry; verify table integrity requirements |
| `document_embedding_failed` | Check Platform model registry / metering |
| `document_indexing_failed` | Retry index job; verify tenant filters |
| `document_extraction_failed` | Open review item; do not publish findings |
| `document_processing_version_incompatible` | Re-process on current processing version |
| `document_revision_superseded` | Target current Core revision intentionally |
| `document_transition_invalid` | Do not force status; use retry endpoint |
| `document_not_ready` | Wait for ready / ready_with_warnings before answering |
| `document_insufficient_evidence` | Abstain; gather additional authorized documents |
| `document_citation_required` | Block release of answer until citations exist |
| `document_conflict_requires_review` | Route to review queue; do not pick a side silently |

## Retry policy

1. Prefer `POST /[documentId]/retry` over ad-hoc status edits.  
2. Retries must preserve prior evidence and audit transitions.  
3. Idempotency keys prevent duplicate indexing for the same revision + processing version.  
4. After max retries, leave status `failed` and open a review item.

## Review boundary

Approving a PI finding **must not** write risks, issues, actions, decisions, or TQs into Engineering Core. Any Core mutation requires an authorized Core service call after human review.

## Certification vs production

- Certification may use in-memory fixture processing (`PROJECT_INTELLIGENCE_CERTIFICATION=1`).  
- Production recovery depends on governed outbox jobs (`project_intelligence.document.*`).  
- If health reports an incomplete durable processor, treat process/retry outside certification as **INCOMPLETE STUB** until workers are wired.

## Escalation checklist

1. Capture `requestId` / correlation ID from nested error envelope.  
2. Confirm tenant + workspace + document ID.  
3. Confirm Core document still exists and revision matches.  
4. Check Documents health status counts.  
5. Re-run retry once.  
6. If still failing, open review item and escalate with parser/provider versions.
