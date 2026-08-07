# Asset Intelligence — Health Semantics

## Locked definitions

| Term | Meaning |
|------|---------|
| **Condition** | Current observed/calculated physical or functional state. |
| **Criticality** | Importance or consequence significance if the asset fails or becomes unavailable. |
| **Reliability** | Evidence-supported ability or likelihood to perform the required function under defined conditions for a defined interval, where sufficient data exists. |
| **Health** | Current multidimensional assessment primarily derived from condition, reliability, and evidence confidence. |
| **Priority** | Operational/action context that MAY consider health + criticality + other governed factors. Reserved (`AssetPriorityEngine` not in 10D). |
| **Risk** | Likelihood × consequence intelligence, distinct from health and criticality, and not the Engineering Core canonical risk record. |

## Criticality vs Health

Criticality must **NOT** directly make a healthy asset physically unhealthy.

- Phase 10C method `compose_condition_criticality_v1` remains historical/auditable.
- Phase 10D default method `compose_condition_reliability_v2` uses condition + reliability + evidence confidence.
- Criticality appears on `AssetHealthProfile` as **context only** (`criticalityContext`).

## Claims

- `accuracyClaimsCertified = false`
- `rulClaimsCertified = false`
- `probabilityOfFailureCertified = false`
- `criticalityIsHealthFactor = false` (for v2+)
