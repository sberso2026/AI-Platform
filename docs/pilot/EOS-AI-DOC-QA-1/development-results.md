# Development-set results

Split known during implementation (144 supported questions). Source: `benchmark-results.json`.

- RETRIEVAL_RECALL_AT_1=1
- RETRIEVAL_RECALL_AT_3=1
- RETRIEVAL_RECALL_AT_5=1
- ANSWER_CORRECTNESS_RATE=0.646
- NUMERICAL_ANSWER_CORRECTNESS_RATE=0.646

Development retrieval meets the recall gates. Development numerical correctness does **not** meet 0.98. The extractor misses mixed-property paraphrases and non-interval quantity forms; runtime generation is not executed in this offline harness (`GENERATION_SUCCESS_RATE=0` by design of the fixture runner).
