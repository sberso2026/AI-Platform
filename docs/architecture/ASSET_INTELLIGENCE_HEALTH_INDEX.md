# Asset Health Index Abstraction

Health Index is **derived intelligence**, not identity.

Reserved fields: healthIndex, healthClass, healthConfidence, healthTrend, healthMethod, healthSourceRefs, healthComputedAt, healthReviewedBy, healthApprovedAt.

Rules:
- Distinct from `conditionRating` and `criticalityRating`
- Default status: `unavailable` unless evidence + method present
- May compose condition (later criticality/reliability)
- Advisory only — `accuracyClaimsCertified = false`, `rulClaimsCertified = false`
- Abstain when evidence insufficient

See `packages/asset-intelligence/src/domain/health-index.ts`.
