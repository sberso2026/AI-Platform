# Performance evidence

Measure separately. Do not hide ingestion latency inside Q&A latency.

Live Preview (`dpl_4raH2RyQ3hNWwUyuraAmrmgrxp3h`), authorised TXT fixture:

| Metric | Sample (ms) | Notes |
|---|---|---|
| Document ingestion | 6429 | Upload session + signed PUT + register + worker drain to `ready_with_warnings`. First GET already AI searchable. |
| Text extraction | included in ingestion | Native text parse checkpoint inside the worker; not a separate HTTP span. |
| Indexing | included in ingestion | Six chunks persisted; embeddings skipped (lexical index). |
| Retrieval | included in Ask | Not a separate public timer. TEST 3 (zero-hit abstain) completed in 1771 ms. |
| AI answer | 2552 / 2537 / 1771 | TEST 1 / TEST 2 / TEST 3 Engineering AI POST totals. |

Reported flag values use this run: ingestion 6429 ms; Q&A p95 2552 ms; retrieval reported as the same Ask envelope because live telemetry does not split retrieval vs synthesis.
