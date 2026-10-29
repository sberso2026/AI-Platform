# Asset Intelligence V1.0 — Capability Matrix

- Module: `asset_intelligence`
- Version: **1.0.0**
- Status: **ga**
- Release tag: `asset-intelligence-v1.0.0`
- Readiness marker: `asset-intelligence-v1-ready`
- Authoritative source: `packages/asset-intelligence/src/version.ts`
- Machine-readable source: `packages/asset-intelligence/src/domain/capability-registry.ts`
- Snapshot: `packages/asset-intelligence/manifest/asset-intelligence-module-manifest.json`

## Classification (locked)

| Class | Meaning |
| --- | --- |
| `ga` | Production capability. Deterministic, governed, evidence-bounded output. |
| `ga_advisory` | Production capability whose output is advisory input to a human decision. It never mutates canonical Engineering OS state. |
| `reserved` | Modelled in the domain but deliberately not implemented in V1.0. |
| `unavailable` | Explicitly **not** a production function of V1.0. Never surfaced as a result. |

Classification is data, not prose: every row below is generated from
`ASSET_INTELLIGENCE_CAPABILITY_CATALOG` and cross-checked by
`assertNoModuleRegistryDrift()`.

## GA capabilities

| Capability | Surface | Class |
| --- | --- | --- |
| `asset_intelligence.condition` | condition | ga |
| `asset_intelligence.criticality` | criticality | ga |
| `asset_intelligence.reliability` | reliability | ga_advisory |
| `asset_intelligence.failure` | failure | ga |
| `asset_intelligence.time_series` | time_series | ga |
| `asset_intelligence.trend_degradation` | trend_degradation | ga_advisory |
| `asset_intelligence.lifecycle` | lifecycle | ga |
| `asset_intelligence.decision_context` | decision_context | ga |
| `asset_intelligence.risk_signal` | risk_signal | ga_advisory |
| `asset_intelligence.maintenance_recommendation` | maintenance_recommendation | ga_advisory |
| `asset_intelligence.priority` | priority | ga_advisory |
| `asset_intelligence.fusion` | fusion | ga |
| `asset_intelligence.predictive_governance` | predictive_governance | ga |
| `asset_intelligence.health_composition` | health | ga |
| `asset_intelligence.evidence_confidence` | evidence_confidence | ga |
| `asset_intelligence.timeline` | timeline | ga |
| `asset_intelligence.snapshot` | snapshot | ga |

`asset_intelligence.predictive_governance` is GA as **governance**: it registers
objectives and methods, assesses objective-specific readiness, evaluates method
eligibility and runs fixture-bounded qualification. It executes nothing.

## Reserved capabilities

| Capability | Governing flag | Value |
| --- | --- | --- |
| `asset_intelligence.source_trust_model` | `SOURCE_TRUST_MODEL_READY` | `false` |
| `asset_intelligence.quantitative_reliability` | `QUANTITATIVE_RELIABILITY_CERTIFIED` | `false` |

## Unavailable capabilities

These are **not production functions of Asset Intelligence V1.0**. See
`docs/release/ASSET_INTELLIGENCE_V1_UNAVAILABLE_CAPABILITIES.md` for the full
matrix and `packages/asset-intelligence/src/domain/unavailable-capabilities.ts`
for the machine-readable form.

| Capability | Governing flag | Value |
| --- | --- | --- |
| `asset_intelligence.predictive_execution` | `PRODUCTION_PREDICTIVE_EXECUTION_ENABLED` | `false` |
| `asset_intelligence.probability_of_failure` | `PROBABILITY_OF_FAILURE_CERTIFIED` | `false` |
| `asset_intelligence.remaining_useful_life` | `RUL_CLAIMS_CERTIFIED` | `false` |
| `asset_intelligence.predictive_ml` | `PREDICTIVE_ML_ENABLED` | `false` |
| `asset_intelligence.certified_predictive_methods` | `PREDICTIVE_METHODS_CERTIFIED` | `false` |
| `asset_intelligence.accuracy_claims` | `ACCURACY_CLAIMS_CERTIFIED` | `false` |
| `asset_intelligence.predictive_health_contribution` | `PREDICTIVE_HEALTH_CONTRIBUTION_ENABLED` | `false` |
| `asset_intelligence.core_risk_mutation` | `RISK_CORE_AUTO_MUTATION_ALLOWED` | `false` |
| `asset_intelligence.cmms_work_order` | `CMMS_WORK_ORDER_OWNERSHIP` | `none_in_asset_intelligence` |
| `asset_intelligence.digital_twin` | — | no ownership claimed |

## Health boundary

The Asset Health Index is composed from condition evidence only. Criticality,
failure, degradation, lifecycle, risk, priority, fusion and predictive
governance all carry `healthContribution: false` and every corresponding
`*_HEALTH_CONTRIBUTION_ENABLED` flag is `false`.

## Ownership

| Concern | Owner |
| --- | --- |
| Asset identity | `engineering_os_shared_domain` |
| Canonical asset lifecycle | `engineering_os_shared_domain` |
| Asset intelligence | `asset_intelligence` |
| Fusion | `asset_intelligence` |
| Predictive governance | `asset_intelligence` |
| Canonical Engineering Risk | `engineering_core` |
| CMMS work order | `none_in_asset_intelligence` |
