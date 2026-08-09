# Engineering OS V1 Public Contracts

Status: **FROZEN** · `EngineeringOSPublicContractsVersion = 1.0.0` · `EngineeringOSPublicContractsFrozen = true`

## Product hierarchy (frozen)

RTB AI Platform → Engineering OS → Shared Engineering Domains (Asset / Project / Spatial) →
Shared Engineering Infrastructure (Module/Domain/Workflow SDKs, Tool Framework, Execution Host) →
Product Modules (six frozen V1) → Product Composition (manifest, context, search, AI, health, nav, commerce).

OS-level product contracts only. Module public contracts remain owned by frozen module tags
and are referenced by version — not copied into Engineering OS ownership.

## Frozen contracts

| Contract | Version | Notes |
| --- | --- | --- |
| EngineeringOSManifest | 1.0.0 | Composition metadata; pins modules/domains/SDKs |
| EngineeringContext | 1.0.0 | Coordination refs only; not a domain registry |
| EngineeringOSHealth | 1.0.0 | Aggregate component health |
| Capability aggregation | 1.0.0 | OS capability list + maturity refs |
| Module lifecycle | 1.0.0 | installed/enabled/disabled/degraded/incompatible |
| Module discovery | 1.0.0 | Registry truth for six production modules |
| Cross-module search result | 1.0.0 | Normalized hits; ≠ authority |
| Navigation / route | 1.0.0 | Shell routes + entitled module entry |
| OS-level entitlement | 1.0.0 | Platform Commerce product container |
| OS-level event references | 1.0.0 | Correlation metadata only |

## Module contract references (immutable tags)

| Module | Tag | Contract |
| --- | --- | --- |
| Project Intelligence | `project-intelligence-v1.0.0` | 1.0.0 |
| Inspection Intelligence | `inspection-intelligence-v1.0.0` | 1.0.0 |
| Asset Intelligence | `asset-intelligence-v1.0.0` | 1.0.0 |
| Project Controls | `project-controls-v1.0.0` | 1.0.0 |
| Digital Twin | `digital-twin-v1.0.0` | 1.0.0 |
| Engineering Model Interoperability | `engineering-model-interoperability-v1.0.0` | 1.0.0 |

## Locks

- Engineering OS owns composition/shell only
- Must never absorb frozen module business logic
- `search result ≠ authority`
- `AI output ≠ engineering approval`
