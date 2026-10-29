# Performance evidence

Ingestion time is not included in Q&A latency. Background drain runs in the ingest POST (`maxDuration` 300s).

Live Preview `dpl_F8EAbDVxdMkmpkRs4QnEM7BsDSVc` (small sample; reported as conservative observed max, not a statistical p95):

| Metric | Observed (ms) | Notes |
|---|---|---|
| Upload (signed PUT path) | not re-timed this run | 413 proxy path closed; browser → storage |
| Conveyor ingest HTTP + drain | 19458 | 66-page PDF parse + index in worker drain |
| Conveyor ingest wall (enqueue + first indexed poll) | 26525 | First poll already `partial` / AI searchable |
| Document Q&A | 2566–3013 | AS/NZS and conveyor Ask POST totals (generation degraded; retrieval-grounded) |
| Retrieval | included in Ask | No separate public timer |

Flag values: `DOCUMENT_UPLOAD_P95_MS=0` (not sampled this run; path is signed PUT). `DOCUMENT_INGESTION_P95_MS=26525`. `DOCUMENT_RETRIEVAL_P95_MS=3013`. `DOCUMENT_QA_P95_MS=3013`.
