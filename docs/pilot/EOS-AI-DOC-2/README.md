# EOS-AI-DOC-2 — Document Identity, Deduplication, Ingestion and Engineering AI Repair

**Host:** https://eos-pilot.rtbea.com.au  
**Preview deployment:** `dpl_F8EAbDVxdMkmpkRs4QnEM7BsDSVc`  
**Production:** `dpl_EF2DKHT59waxGKL28HSvGMpgtDBG` (not promoted)

Canonical path (unchanged ownership):

1. Engineering OS Documents owns identity, RBAC, register.
2. Canonical `engineering-documents` bucket owns the source object (signed upload/download).
3. Project Intelligence worker owns extract → chunk → index.
4. Engineering AI Ask composes PI retrieval through Kernel/Intelligence routing. No direct provider access.

This phase repaired duplicate register rows, timestamp revisions, HTTP 413 upload, Vercel PDF worker ingest, document-scope retrieval, degraded generation UX, and live AS/NZS + conveyor Q&A.

Certification pack:

- [root-causes.md](root-causes.md)
- [canonical-identity.md](canonical-identity.md)
- [duplicate-reconciliation.md](duplicate-reconciliation.md)
- [ingestion-architecture.md](ingestion-architecture.md)
- [retrieval-architecture.md](retrieval-architecture.md)
- [provider-failure.md](provider-failure.md)
- [live-uat.md](live-uat.md)
- [security-evidence.md](security-evidence.md)
- [performance-evidence.md](performance-evidence.md)
- [known-limitations.md](known-limitations.md)

`EXTERNAL_DOCUMENT_UAT_READY` and `EXTERNAL_ENGINEERING_AI_UAT_READY` remain **false**. Do not start EOS-PILOT-UAT-3. Production was not promoted.
