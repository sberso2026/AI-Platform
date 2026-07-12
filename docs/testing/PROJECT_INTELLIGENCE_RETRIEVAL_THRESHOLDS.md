# Project Intelligence — Semantic Retrieval Thresholds

**Declared before measurement.** Do not lower these after observing results.

**Dataset:** `packages/project-intelligence-certification/fixtures/retrieval/evaluation-set.json`  
**Checksum field:** `datasetChecksum` in certification artifact  

---

## Minimum thresholds (production-readiness)

| Metric | Minimum |
|--------|---------|
| Recall@1 | ≥ 0.70 |
| Recall@5 | ≥ 0.90 |
| Precision@5 | ≥ 0.60 |
| MRR | ≥ 0.75 |
| nDCG@5 | ≥ 0.80 |
| Citation source accuracy | ≥ 0.95 |
| Citation page accuracy | ≥ 0.85 |
| Answer faithfulness | ≥ 0.90 |
| Abstention precision | ≥ 0.90 |
| Abstention recall | ≥ 0.85 |
| Conflict detection accuracy | ≥ 0.90 |
| Superseded-revision avoidance | ≥ 0.95 |
| Numeric value accuracy | ≥ 0.90 |
| Unit accuracy | ≥ 0.90 |
| Table row/column accuracy | ≥ 0.85 |

---

## Evaluation rules

1. Queries run only against authorized document scope.
2. Hash / deterministic embeddings **do not** count toward production-readiness thresholds.
3. Low-confidence table extractions must abstain or mark review — not count as authoritative hits.
4. Conflicting current revisions must surface `conflicting_evidence` (no silent pick).
5. Absent-evidence queries must abstain.

---

## Failure policy

Any metric below its minimum fails Gate G (semantic retrieval) and blocks production readiness.
