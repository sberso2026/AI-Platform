# EOS-AI-DOC-2R known limitations

MEDIUM

- `HYBRID_RETRIEVAL_PASS=false`. Canonical embeddings are present on some Preview calls (`retrievalMode=hybrid` once) but were not separately certified. Lexical retrieval remains the accepted path for this phase.
- `CITATION_DEDUPLICATION_PASS=false`. Same-page overlapping PDF windows still produce extra citations when `section_path` is null (conveyor platform width returned 12 evidence rows). Clause-keyed dedupe holds when a numbered section is present.

LOW

- Some PDF chunks still have null `section_path`, and a few running-header leftovers remain. After reindex, 1334 / 1966 conveyor chunks have a section path, including 4.2.1 / 4.2.3.
- Conveyor ingest completed as `ready_with_warnings` / `partial` (66 pages indexed). Upload p95 was not re-measured (`n/a`, not 0).

Accepted / closed from DOC-2

- Provider route now succeeds through AI Director → Model Registry → OpenAI adapter. Mock is treated as generation failure, not a silent answer.
- If generation fails, Ask stays in labelled degraded mode with retrieved evidence. This run did not need that path because generation succeeded.
- Conveyor canonical number is reviewed `AS 1755:1986`. Filename fallback is stored separately and is not the trusted register number.

Production was not promoted.
