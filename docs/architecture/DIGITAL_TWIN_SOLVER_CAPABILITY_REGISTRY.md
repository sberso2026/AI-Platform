# DIGITAL_TWIN_SOLVER_CAPABILITY_REGISTRY

## Purpose

Phase 12J introduces a **multi-provider engineering solver capability registry**.
It catalogs what each external solver *could* support, with qualification metadata —
**without implementing additional solver execution**.

## Four-layer separation (intact)

```
capability ≠ method ≠ provider ≠ application ≠ execution
```

| Layer | Meaning |
| --- | --- |
| Capability | Declared solver ability (e.g. CalculiX modal) — registry entry |
| Method | Twin simulation method key (e.g. `linear_elastic_static`) |
| Provider | Solver/provider identity (e.g. `calculix`) |
| Application | Context-bounded Method+Provider permission |
| Execution | Run-level qualification / orchestrated spawn |

**Capability qualification NEVER implies whole-solver qualification.**

## Seed registry

| Capability | Status | Notes |
| --- | --- | --- |
| `calculix.linear_elastic_static` | **qualified** | Links to Phase 12I certified method; sole real execution path |
| `calculix.modal` | reserved / not_qualified | No execute path |
| `calculix.buckling` | reserved / not_qualified | No execute path |
| `calculix.thermal` | reserved / not_qualified | No execute path |
| `calculix.contact` | reserved / not_qualified | No execute path |
| Abaqus / ANSYS / OpenSees / OpenFOAM / SAP2000 / ETABS / STAAD / SpaceGass | reserved adapters | No execute path |

## Services

- `EngineeringSolverCapabilityRegistry` — register capabilities per solver independently
- `SolverCapabilityQualification` — historic immutable; no AI self-approval
- `SolverProviderCompatibilityMatrix` — Method×Solver×Version×Application×ProjectType queries (no execution)
- `EngineeringCapabilityDiscoveryService` — **query only**; rejects execute-on-discover
- Adapter version governance — supported / deprecated / revoked solver versions; historic runs reproducible

## Explicit non-goals (12J)

- Do **not** implement nonlinear / modal / thermal / CFD / optimization / SHM / predictive / PoF / RUL / actuation / GA
- Do **not** automatically qualify or execute new capabilities
- Do **not** add new CalculiX execute paths for reserved capabilities
- `silentSolverFallbackAllowed` stays **false**
- `productionDigitalTwinReady` stays **false**
- `spatialOwnershipFullyResolved` stays **false**

## Events (identifiers only)

- `engineering.solver.capability.registered`
- `engineering.solver.capability.qualified`
- `engineering.solver.capability.revoked`
- `engineering.solver.provider.updated`

## Review

`digital_twin.capability_review` — no AI self-approval; historic immutable.
