# Engineering Model Interoperability — ETABS Discovery (Phase 13A)

Status: **discovered** (`ETABSIntegrationDiscovered=true`) · **not implemented**

## Summary

CSI ETABS is a priority structural analysis interoperability candidate. Digital Twin
V1 already reserves an `etabs` external solver stub
(`RESERVED_EXTERNAL_SOLVER_ADAPTERS`) — **without** an activatable adapter.

Phase 13A records discovery only. No production ETABS COM/API adapter, no model
mutation runtime, no solver execution via ETABS.

## Independent capability flags (discovery)

| Flag | Value |
| --- | --- |
| `modelFederationSupported` | true |
| `resultFederationSupported` | true |
| `solverExecutionSupported` | true (class only — not qualified/executed) |
| `modelMutationSupported` | false (13A) |
| `analysisModelGenerationSupported` | true (class only — never auto-certified) |
| `productionAdapterImplemented` | **false** |

## CSI family governance

- Assess common `CSIInteropCore` benefit for shared CSI interop plumbing
- Product-specific adapters + qualifications remain **separate** for:
  - ETABS
  - SAP2000
  - SAFE
  - CSiBridge
- Supported ≠ qualified ≠ project-approved ≠ execution-qualified ≠ engineering-approved

## Ownership

- External ETABS models/results remain `source_client_engineering_application` /
  `external_engineering_tool` owned
- Federated references do not transfer ownership to RTB
- Solver execution (future) must reuse Digital Twin `EngineeringSolverAdapter`

## Non-goals (13A)

- No ETABS installation automation
- No production model import/export
- No project-approved silent substitute with SAP2000/SAFE
- No Phase 13B implementation
