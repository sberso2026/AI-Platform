# Asset Intelligence — Evidence Confidence

## Purpose

`EvidenceConfidenceEngine` describes confidence in the **evidence basis**, not proof of engineering correctness.

## Outcomes (sufficiency policy)

| Outcome | Effect |
|---------|--------|
| sufficient | May compose reliability / health when other prerequisites hold |
| limited | Reduced confidence; may still compose with limitations |
| insufficient | Abstain — no reliability conclusion / no fabricated health contribution |
| conflicting | Surface conflict — no silent resolution |
| stale | Reduce confidence or abstain per policy |
| revoked | Exclude from new governed assessment |

## Output

`EvidenceConfidenceAssessment` includes score/class, source diversity, freshness, review completeness, conflict state, lineage integrity, data sufficiency, abstention reason, method version.

## Claims

Evidence confidence is **not** predictive accuracy, PoF, or RUL certification.
