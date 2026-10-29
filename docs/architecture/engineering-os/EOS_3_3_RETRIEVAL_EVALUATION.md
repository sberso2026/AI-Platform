# EOS 3.3 Retrieval Evaluation

`EOS_3_RETRIEVAL_EVALUATION_PACK_CREATED=YES`

`EOS_3_RETRIEVAL_GOLDEN_SET_CREATED=YES`

`EOS_3_RETRIEVAL_METRICS_CAPTURED=YES`

`EOS_3_STAGING_KNOWLEDGE_DATASET_READY=YES`

`EOS_3_STAGING_KNOWLEDGE_RETRIEVAL_VALIDATION=PASS`

`EOS_3_ENGINEERING_QUERY_VALIDATION=PASS`

`EOS_3_CONFLICTING_EVIDENCE_TEST=PASS`

`EOS_3_BASELINE_RETRIEVAL_TEST=PASS`

`EOS_3_ABSTENTION_TEST=PASS`

`EOS_3_RETRIEVAL_AI_AUTHORITY_TEST=PASS`

`EOS_3_RETRIEVAL_PERFORMANCE_BASELINE_CAPTURED=YES`

## Golden set

15 bounded queries covering object lookup, current/superseded revision, baseline, requirement/interface/change traces, assumptions, decisions, deliverables, document/hybrid search, insufficient evidence, conflict, unauthorized workspace.

Scoring targets evidence selection correctness — not LLM prose style.

## Metrics (staging sample; not statistically significant)

Captured: source precision/recall proxy, current-revision accuracy, authorization accuracy, abstention correctness, provenance completeness. `statisticalSignificanceClaimed=false`.

## Modules

- `eos3-retrieval-evaluation.ts`
- `eos3-knowledge-staging.ts`
- `apps/web/src/__tests__/eos3-knowledge-retrieval.test.ts`
