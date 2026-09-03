# Retrieval evaluation

Channels used: raw lexical, normalized lexical, distinctive terms, engineering concept query, clause/metadata cues, optional vector.

Fusion + lexical rerank remain the primary rankers. Vector hits were present on the pre-fix lanyard trace but did not put the 4.5 m window at rank 1.

`HYBRID_RETRIEVAL_PASS=false` — semantic scores were observed; they did not measurably improve the asked-property rank versus lexical + DIRECT classification.

Offline recall (in-memory fixtures, `benchmark-results.json`):

| Split | R@1 | R@3 | R@5 |
|---|---|---|---|
| All supported | 0.926 | 0.926 | 0.926 |
| Development | 1.00 | 1.00 | 1.00 |
| Founder-style | 0.917 | 0.917 | 0.917 |
| Blind holdout | 0.766 | 0.766 | 0.766 |

Pilot gate `RETRIEVAL_RECALL_AT_5 >= 0.97` is **not** met on the combined / holdout sets.
