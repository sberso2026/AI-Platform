# Engineering Interoperability — ETABS Implementation Reconciliation (Phase 13E)

Status: **implemented (export federation + fail-closed solver adapter)** · version **0.4.0-etabs-federation** · phase **13E** · status **etabs_federation**

## Purpose

Reconcile Phase 13A ETABS discovery assumptions with what is actually available in
this repository and workstation/CI environment for CSI ETABS model federation,
existing result federation, and governed solver execution — under the Digital Twin
V1 freeze and without claiming live native COM.

## Environment fact (truthful)

Parent workstation probe: **no ETABS install**, no `ETABS_*` env vars, no CSI
processes. Official integration is typically CSI COM OAPI (ETABS20xx) —
Windows-only, licensed.

Therefore:

| Claim | Value |
| --- | --- |
| `ETABSModelFederationReady` | **true** (export/fixture federation proven) |
| `ETABSResultFederationReady` | **true** (fixture existing results federated) |
| `ETABSAdapterImplemented` | **true** |
| `ETABSSolverAdapterReady` | **true** (fail-closed OK) |
| `ETABSHostedExecutionCertified` | **false** |
| `ETABSControlledExecutionCertified` | **false** |
| Live native COM | **not claimed** |

## Digital Twin V1 freeze (hard constraint)

| Constraint | Value |
| --- | --- |
| DT package | `packages/digital-twin/**` — **ZERO modifications** |
| Tag | `digital-twin-v1.0.0` @ `a94425ed009ca087c2f44c9d3757c0c82bd936b1` |
| Certified solver inside DT | CalculiX only (`linear_elastic_static`) |
| ETABS inside DT | Reserved stub only (`activatable: false`) |

ETABS **execution is hosted by the interoperability runtime**, which **consumes DT
public contract shapes** (`EngineeringSolverAdapter`) without forking meaning.

## Actual available mechanism vs discovery assumptions

| Discovery assumption (13A) | Actual available mechanism (13E) |
| --- | --- |
| Native ETABS COM OAPI in-repo / CI | **None.** No ETABS SDK, installer, or licensed binary in monorepo or standard CI. |
| Production model federation via live ETABS COM | **Export/fixture federation.** JSON under `fixtures/etabs/` — clearly labeled export federation — NOT live native COM. |
| Hosted / controlled solver execution | **Not certified.** Adapter probes `ETABS_HOME` / `ETABS_COM` / executable and **fails closed** (`com_unavailable` / `solver_unavailable` / `license_unavailable`). |
| Silent fallback to CalculiX / SPACE GASS / fixture success | **Forbidden.** `silentSolverFallbackAllowed = false`. |
| CSIInteropCore as product domain | **Internal helper only** (session/error/metadata). Product adapters remain separate. |
| SAP2000 / SAFE / CSiBridge | **Not implemented** (`AdapterImplemented=false`) |

## CSIInteropCore

`CSIInteropCore` is an **internal** session/error/metadata helper. It is **not**
business domain. ETABS product adapter remains separate; SAP2000 / SAFE /
CSiBridge stay reserved.

## CI / workstation feasibility

| Capability | Status |
| --- | --- |
| Model federation (export fixture) | Runnable / proven |
| Existing result federation (export fixture) | Runnable / proven |
| Negative execution benchmarks | Runnable / required |
| Positive live COM OAPI analysis | **Not available** |
| `ETABSHostedExecutionCertified` | **`false`** |
| `ETABSControlledExecutionCertified` | **`false`** |

## Host probe

Host probing reuses `@rtb/engineering-execution-host` generic mechanism (Phase
13D.1). No ETABS-specific host architecture is introduced.
`ControlledEngineeringExecutionHostReady=true` via dependency.

## SPACE GASS live status (must not falsify)

Phase 13D SPACE GASS live remains **blocked**:

- `SPACEGASSLiveProviderReady=false`
- `SPACEGASSLiveExecutionCertified=false`
- `spaceGassHostedExecutionCertified=false`
- `spaceGassControlledExecutionCertified=false`

## Pins

| Baseline | Commit / version |
| --- | --- |
| Digital Twin V1 | `a94425ed…` / `1.0.0` |
| Phase 13B | `1540f806…` / `0.2.0-ifc-federation` |
| Phase 13C | `a1c73721…` / `0.3.0-spacegass` |
| Phase 13D.1 | `0bbe0c7b…` / `0.1.0-execution-host` |

## Non-goals

- No live native COM certification
- No SAP2000 / SAFE / CSiBridge production adapters
- No analysis-model generation
- No silent solver fallback
- No Phase 13F implementation (`phase13FReady` flag only)
- No modifications to `packages/digital-twin/**`
- No SPACE GASS live corrective work / no flip of SPACE GASS live certified
