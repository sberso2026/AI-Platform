# Retrieval architecture

Document scope:

1. Confirm the selected `engineering_documents` row exists for the caller tenant/workspace.
2. Refuse body Q&A until ingestion is authoritative (`isAuthoritativeAnswerAllowed`).
3. Lexical search via `pi_document_lexical_search` plus overlap fallback, filtered in SQL by tenant, workspace, and `engineering_document_id`.
4. Deterministic query planning strips conversational frames and searches normalized, concept, and OR-distinctive channels, then fuses candidates.
5. Vector search only through `GovernedEmbeddingAdapter` (not configured on this Preview). Hybrid is claimed only when that channel returns hits.
6. Rerank by distinctive query-term overlap. Generic title words (`conveyor`, `standard`, `safety`, `design`) are not enough. Property/constraint morphology (`width`/`wide`, `thick`/`thickness`, `minimum`/`not less than`) is matched generally.
7. Word-boundary matching (so `load` does not match `unloading`).
8. Sliding-window excerpt around the densest specific terms so clause text is what Ask shows, not the start of a 1200-character page window.
9. If a rich query has fewer than two specific term hits, return zero body evidence and abstain.

Citations: `/engineering/documents/{id}?page=&section=&chunk=`.

Ask generation failure does not drop evidence. User-facing copy: “Engineering AI could not generate an answer, but retrieved evidence is shown below.” Technical diagnostics stay under Show details.
