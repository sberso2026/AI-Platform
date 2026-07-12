# Project Intelligence Document Intelligence Runbook

**Phase:** 6C-2  
**Application:** `/engineering/apps/project-intelligence/documents`

## Ownership reminder

- Engineering Core owns document register metadata (`engineering_documents`).
- Project Intelligence owns processing derivatives keyed by `engineering_document_id`.
- Processing must never mutate Core document status as a side effect.

## Operator paths

| Task | Path |
|------|------|
| List Core docs + processing markers | `/engineering/apps/project-intelligence/documents` |
| Document detail | `/engineering/apps/project-intelligence/documents/[documentId]` |
| Grounded query | `/engineering/apps/project-intelligence/documents/query` |
| Review queue | `/engineering/apps/project-intelligence/documents/review` |
| Processing health | `/engineering/apps/project-intelligence/documents/health` |

## API surface

Base: `/api/engineering/project-intelligence/documents`

- `GET /` — list intelligence status joined with Core docs where available  
- `GET /[documentId]` — detail  
- `POST /[documentId]/process` — enqueue / run processing  
- `POST /[documentId]/retry` — retry failed/retry_pending  
- `GET /[documentId]/status` — processing status  
- `GET /[documentId]/chunks` — chunks  
- `GET /[documentId]/findings` — findings  
- `POST /query` — grounded answer contract  
- `POST /compare` — revision comparison  
- `GET /review` — review queue  
- `POST /review/[reviewId]/approve|reject` — review actions (no Core writes)

Entitlement: commerce policies `project-intelligence-documents.read|write` with seat + workspace required.

## Certification mode

When `PROJECT_INTELLIGENCE_CERTIFICATION=1`, the web API may run an in-memory text-fixture processor for hosted Playwright scenarios. This path is for certification only and is not a durable production worker.

## Health checks

Use Documents → Processing health or `GET .../documents/health`. Treat `degraded` processing checks as a signal that durable job enqueue is incomplete outside certification mode.

## Related docs

- `docs/operations/PROJECT_INTELLIGENCE_DOCUMENT_FAILURE_RECOVERY.md`
- `docs/architecture/PROJECT_INTELLIGENCE_DOCUMENT_DATA_OWNERSHIP.md`
- `docs/testing/PROJECT_INTELLIGENCE_PHASE_6C2_CERTIFICATION.md`
