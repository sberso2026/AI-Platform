# Asset Intelligence — Cross-Module Contract Drafts (Phase 10H)

Status: **drafts only**. Phase 10H implements no cross-module integration, no adapters,
no schedulers, and no write paths into any other module. Every draft below is
**consume-only** from the Asset Intelligence side.

## Governing locks

- `canonicalEngineeringRiskOwnership = engineering_core` — Asset Intelligence never
  creates or mutates canonical risk records.
- `riskCoreAutoMutationAllowed = false` — Risk Candidates convert only through a
  human-gated Engineering Core adapter that does not exist in 10H.
- `cmmsWorkOrderOwnership = none_in_asset_intelligence` — Maintenance Recommendations
  are advisory classes, never work orders.
- `multiSourceFusionReady = false` — no fusion of external module signals.
- Draft contracts here are not frozen and carry no compatibility guarantee.

## Project Controls (consume-only draft)

| Item | Draft |
|------|-------|
| Direction | Project Controls → Asset Intelligence |
| Payload | cost/schedule context references only (identifiers, no financial records) |
| Use | optional context annotation on Priority Profile dimensions |
| Forbidden | Asset Intelligence writing cost, schedule, or budget state |
| Status | `draft_consume_only`, not implemented |

## Digital Twin (consume-only draft)

| Item | Draft |
|------|-------|
| Direction | Digital Twin → Asset Intelligence |
| Payload | twin state references (`twin.state_refs`), no simulation ownership |
| Use | additional published-slice evidence reference for Decision Context |
| Forbidden | Asset Intelligence owning twin state, geometry, or simulation runs |
| Status | `reserved_future` in the Intelligence Source Registry |

## Structural Health Monitoring (consume-only draft)

| Item | Draft |
|------|-------|
| Direction | SHM → Asset Intelligence |
| Payload | governed signal summaries (`shm.signals`), never raw sensor streams |
| Use | condition/reliability evidence input, subject to Evidence Confidence |
| Forbidden | Asset Intelligence owning sensor streams or alarm thresholds |
| Status | `reserved_future` in the Intelligence Source Registry |

## Maintenance / CMMS (consume-only draft)

| Item | Draft |
|------|-------|
| Direction | CMMS → Asset Intelligence (feedback only) |
| Payload | completed-intervention feedback references (`maintenance.feedback`) |
| Use | closes the loop on prior Maintenance Recommendations for future evidence |
| Forbidden | Asset Intelligence creating, scheduling, or closing work orders |
| Status | `reserved_future` in the Intelligence Source Registry |

## Engineering Core Risk adapter (deferred)

A future human-gated adapter may accept an `AssetRiskCandidate` and let an authorised
reviewer create a canonical Core Risk record. Phase 10H ships the candidate model only:
`autoMutatesCoreRisk = false`, `requiresHumanGatedAdapter = true`.
