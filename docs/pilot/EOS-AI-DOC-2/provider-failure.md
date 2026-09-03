# Provider failure analysis

Observed live string: “Provider or API failure” / generic unexpected error.

Trace:

| Layer | Finding |
|---|---|
| Ask client | Non-OK HTTP / `[object Object]` was mapped to provider failure and evidence was discarded. |
| Grounded Ask | Reasoning/generation throw is now `degradedToRetrievalOnly` with retrieved evidence kept. |
| AI Director / Model Registry | Generation still fails on Preview. Routing remains Kernel/Intelligence only. No browser or API route calls a model provider directly. |
| Prompt Registry | Not the conveyor ingest failure. |
| PDF ingest | Previously blocked conveyor indexing (`pdf.worker.mjs` missing, then `pdf-parse` not in the lambda). Fixed independently of generation. |

Live AS/NZS and conveyor answers in this certification are **retrieval-grounded DOCUMENT FACT** answers under degraded generation. They are advisory-only. Abstention still fires when body evidence is empty.
