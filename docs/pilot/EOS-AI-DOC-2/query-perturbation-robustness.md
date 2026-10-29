# Query perturbation robustness

Evaluation artifact for the founder control/perturbed pair. Fixture strings belong here and in tests, not in production retrieval logic.

## Scope

Same tenant `8195e176-5f9f-449a-a1d3-2aedaf403989`, workspace `776aab04-e2eb-4a2a-855f-e04a81f0a0ce`, document `008ff87c-ede6-4007-b94d-480ef54a77e0`, revision `A`, live indexed corpus (1966 chunk rows, including duplicate ingestions).

Retriever measured: Project Intelligence query planner + multi-channel lexical fusion + overlap rerank, run locally against that corpus. Preview HTTP Ask still serves the previous build until this change is deployed.

## Root cause

`pi_document_lexical_search` uses `websearch_to_tsquery('english', p_query)`, which ANDs content words. Conversational frames such as `design` become required terms. The gold clause is also phrased as `not less than` / `thick`, so AND of `minimum` and `thickness` returns zero RPC hits for both the control and the perturbed query (live RPC hit count = 0).

The ILIKE fallback previously OR-ed the first raw tokens, including generic `design`, then took an unordered 80-row sample. Generic matches flooded the window, so the gold clause never reached rerank. Fallback was skipped when RPC returned any (unrelated) hits.

## Side-by-side (top candidate before generation)

Gold body: page 14, `Sheet metal guards shall be not less than 1.5 mm thick` (`a5b6a04cbbf9efbd6cf1af63f5a796e6`). Section 5.2.1 is a neighbouring header chunk; the numeric requirement is in this body window.

| Field | Control | Perturbed |
| --- | --- | --- |
| Rank | 1 | 1 |
| Combined score | 1 | 1 |
| Lexical score | 1 | 1 |
| Semantic score | null | null |
| Selected | true | true |
| Live RPC gold rank | null (0 hits) | null (0 hits) |

Full candidate lists: `query-perturbation-live-trace.json`.

## Channels

- Raw query preserved on the plan (`raw_query`).
- Normalized/concept lexical queries drop conversational frames.
- Distinctive terms are OR-fused for tsquery and ILIKE fallback.
- Vector search is attempted when an embedding adapter is present. This measurement used the local hash embedder; gold evidence was recovered lexically (`semantic_score=null`). Preview production embeddings were not used. Hybrid is therefore not claimed.

## Gates

100 supported variants (20 information needs × 5 formulations) in `packages/project-intelligence/tests/query-perturbation-robustness.test.ts`. Prefix, suffix, question-form, and paraphrase suites also pass for the guard-thickness need.
