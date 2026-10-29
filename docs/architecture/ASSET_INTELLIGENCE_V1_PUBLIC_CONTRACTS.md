# Asset Intelligence V1.0 — Public Contracts (frozen)

- Public contract version: **1.0.0**
- Module version: **1.0.0**
- Release tag: `asset-intelligence-v1.0.0`
- Authoritative sources:
  - `packages/asset-intelligence/src/version.ts`
  - `packages/asset-intelligence/src/domain/service-registry.ts`
  - `packages/asset-intelligence/src/domain/event-contracts.ts`
  - `packages/asset-intelligence/src/domain/module-manifest.ts`

## Freeze policy

Everything listed here is frozen for the 1.0.x line. Within 1.0.x we may add
optional response fields and add new event names inside an existing family. We
may not remove a field, rename an event family, change a service identifier, or
change the meaning of an existing status value. Anything that would break a
consumer requires a major version and a new release tag.

`assertNoModuleRegistryDrift()` fails the build if the manifest, capability
registry, service registry, event contracts and `version.ts` stop agreeing.

## Service contract family (16 services)

| Service ID | Class | Interface contract | Health check |
| --- | --- | --- | --- |
| `asset_intelligence` | `AssetIntelligenceService` | `ai.service.asset_intelligence` | `ai.health.asset_intelligence` |
| `condition` | `AssetConditionService` | `ai.service.condition` | `ai.health.condition` |
| `criticality` | `AssetCriticalityService` | `ai.service.criticality` | `ai.health.criticality` |
| `reliability` | `AssetReliabilityService` | `ai.service.reliability` | `ai.health.reliability` |
| `failure` | `AssetFailureService` | `ai.service.failure` | `ai.health.failure` |
| `degradation` | `AssetDegradationService` | `ai.service.degradation` | `ai.health.degradation` |
| `lifecycle` | `AssetLifecycleService` | `ai.service.lifecycle` | `ai.health.lifecycle` |
| `decision_context` | `AssetDecisionContextService` | `ai.service.decision_context` | `ai.health.decision_context` |
| `risk` | `AssetRiskService` | `ai.service.risk` | `ai.health.risk` |
| `maintenance_recommendation` | `AssetMaintenanceRecommendationService` | `ai.service.maintenance_recommendation` | `ai.health.maintenance_recommendation` |
| `priority` | `AssetPriorityService` | `ai.service.priority` | `ai.health.priority` |
| `fusion` | `AssetFusionService` | `ai.service.fusion` | `ai.health.fusion` |
| `predictive_readiness` | `AssetPredictiveReadinessService` | `ai.service.predictive_readiness` | `ai.health.predictive_readiness` |
| `predictive_governance` | `AssetPredictiveGovernanceService` | `ai.service.predictive_governance` | `ai.health.predictive_governance` |
| `health` | `AssetHealthIndexService` | `ai.service.health` | `ai.health.health_index` |
| `timeline` | `AssetTimelineService` | `ai.service.timeline` | `ai.health.timeline` |

Every entry carries `duplicateRuntimeForbidden: true` — a second runtime for any
of these services is a certification failure, not a deployment choice.

## Event contract families (17 families)

| Family | Advisory only |
| --- | --- |
| `engineering.asset.condition` | no |
| `engineering.asset.criticality` | no |
| `engineering.asset.reliability` | yes |
| `engineering.asset.failure` | no |
| `engineering.asset.time_series` | no |
| `engineering.asset.trend` | yes |
| `engineering.asset.degradation` | yes |
| `engineering.asset.health` | no |
| `engineering.asset.lifecycle` | no |
| `engineering.asset.decision_context` | yes |
| `engineering.asset.risk_signal` | yes |
| `engineering.asset.maintenance_recommendation` | yes |
| `engineering.asset.priority` | yes |
| `engineering.asset.fusion` | no |
| `engineering.asset.predictive_readiness` | yes |
| `engineering.asset.predictive_governance` | yes |
| `engineering.asset.intelligence_timeline` | no |

Invariants held by every family:

- `tenantIsolated: true` and `workspaceIsolated: true`
- `containsPredictionOutput: false` — no V1.0 event carries a predicted value
- `mutatesCanonicalStateOnConsume: false` — consumers must not treat an Asset
  Intelligence event as authority to mutate canonical Engineering state
- payloads carry identifiers and governance metadata only; raw evidence and
  secrets are forbidden

## HTTP contract

Base: `/api/engineering/asset-intelligence`

Routes: `condition`, `criticality`, `decision-context`, `degradation`,
`failure`, `failure/taxonomy`, `fusion`, `health`, `health-profile`,
`lifecycle`, `maintenance-recommendation`, `predictive-governance`,
`predictive-readiness`, `priority`, `reliability`, `risk`.

Error envelope is frozen as `error: { code, message, requestId, details }`.
Success envelope is frozen as `{ data, requestId }`.

## Entitlements

`asset_intelligence.read`, `.assess`, `.submit`, `.review`, `.approve`,
`.publish`, `.admin`. Segregation of duties is enforced in
`domain/role-matrix.ts`; an engineer may not approve their own submission.

## Consumed contracts

Inspection Intelligence public contracts **1.0.0** (`inspection-intelligence-v1.0.0`).
Asset Intelligence consumes them read-only through `domain/ii-consumption.ts` and
claims no Inspection Intelligence ownership.

## What is deliberately not in the public contract

No predictive execution endpoint, no PoF value, no RUL value, no accuracy
figure, no quantitative reliability figure, no CMMS work order, and no Digital
Twin surface. See `docs/release/ASSET_INTELLIGENCE_V1_UNAVAILABLE_CAPABILITIES.md`.
