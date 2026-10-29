# Performance evidence

Human-session timings were **not collected** (0 external sessions). Perceived wait tolerance was **not collected**.

Do not treat operator probes as cohort UX. If a cell would otherwise be 0 because n=0, it is **n/a**.

## Human-session (UAT-3)

| Metric | Value |
|---|---|
| PROJECTS_P50_MS | n/a |
| PROJECTS_P95_MS | n/a |
| DOCUMENT_UPLOAD_P50_MS | n/a |
| DOCUMENT_UPLOAD_P95_MS | n/a |
| DOCUMENT_INGESTION_P50_MS | n/a |
| DOCUMENT_INGESTION_P95_MS | n/a |
| DOCUMENT_RETRIEVAL_P50_MS | n/a |
| DOCUMENT_RETRIEVAL_P95_MS | n/a |
| ENGINEERING_AI_P50_MS | n/a |
| ENGINEERING_AI_P95_MS | n/a |
| Perceived wait tolerance | not_collected |

## Operator instrumentation (not human UAT)

Projects list GET `/api/engineering/projects` (founder, 2026-09-02, n=5): p50 **1077**, p95 **12023** (cold first sample).

EOS-AI-DOC-2R Preview (2026-09-03, founder/service session, n=1 ingest, n=5 QA):

| Metric | ms |
|---|---|
| DOCUMENT_UPLOAD_P95_MS | n/a |
| DOCUMENT_INGESTION_P95_MS | 95092 |
| DOCUMENT_RETRIEVAL_P95_MS | 2158 |
| DOCUMENT_QA_P95_MS / ENGINEERING_AI | 8318 |

These numbers describe Preview operator probes. They do not score HUMAN_VALUE_SIGNAL or wait tolerance.
