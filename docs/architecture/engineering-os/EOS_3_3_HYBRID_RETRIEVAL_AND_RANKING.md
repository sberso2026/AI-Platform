# EOS 3.3 Hybrid Retrieval and Ranking

`EOS_3_HYBRID_RETRIEVAL_IMPLEMENTED=YES`

`EOS_3_RETRIEVAL_RANKING_MODEL_IMPLEMENTED=YES`

`EOS_3_RETRIEVAL_POLICY_ENGINE_IMPLEMENTED=YES`

`EOS_3_QUERY_ROUTING_IMPLEMENTED=YES`

`EOS_3_CANONICAL_OBJECT_RETRIEVAL=PASS`

`EOS_3_DIGITAL_THREAD_RETRIEVAL=PASS`

## Hybrid channels

Structured filters + lexical search + vector similarity. Not all three required for every query.

## Ranking signals

Source authority, current revision, lifecycle state, project/workspace scope, object relationship, lexical relevance, semantic relevance, document status, qualification/evidence status.

## Policy routing examples

| Query class | First path |
| --- | --- |
| Current revision / object lookup | Structured canonical |
| Baseline / frozen | Baseline membership graph |
| Document clause | Controlled document + hybrid |
| General explanation | Knowledge corpus + model inference (labeled) |
| Authority request | Deny + recommendation only |

## Modules

- `eos3-retrieval-engine.ts`
- `eos3-vector-index.ts`
- `eos3-structured-retrieval.ts`
- `eos3-digital-thread.ts`
