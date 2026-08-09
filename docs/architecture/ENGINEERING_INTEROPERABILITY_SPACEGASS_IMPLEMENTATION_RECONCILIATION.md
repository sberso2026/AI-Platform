# Engineering Interoperability — SPACE GASS Implementation Reconciliation (Phase 13C)

Status: **implemented (federation + fail-closed solver adapter)** · version **0.3.0-spacegass** · phase **13C**

## Purpose

Reconcile Phase 13A discovery assumptions with what is actually available in this
repository and CI environment for SPACE GASS native model federation, existing
result federation, and governed solver execution — under the Digital Twin V1 freeze.

## Digital Twin V1 freeze (hard constraint)

| Constraint | Value |
| --- | --- |
| DT package | `packages/digital-twin/**` — **ZERO modifications** |
| Tag | `digital-twin-v1.0.0` @ `a94425ed009ca087c2f44c9d3757c0c82bd936b1` |
| Certified solver inside DT | CalculiX only (`linear_elastic_static`) |
| SPACE GASS inside DT | Reserved stub only (`activatable: false`) |

Because DT V1 cannot register a new activatable solver inside the frozen package,
SPACE GASS **execution is hosted by the interoperability runtime**, which
**consumes DT public contract shapes** (`EngineeringSolverAdapter`, Simulation
Package / four-layer qualification semantics) without forking meaning and without
creating a second solver framework (`SPACEGASSExecutionFramework` forbidden).

## Actual available mechanism vs discovery assumptions

| Discovery assumption (13A) | Actual available mechanism (13C) |
| --- | --- |
| Native SPACE GASS COM/API / `.sgg` binary SDK in-repo | **None.** No SPACE GASS SDK, installer, or licensed binary is present in the monorepo or standard CI images. |
| Production model federation via live SPACE GASS process | **Fixture export federation.** JSON export fixture under `packages/engineering-model-interoperability/fixtures/spacegass/` representing model metadata (nodes, members, plates, supports, sections, materials, groups) + existing results. Legitimate for federation; not a claim of live native I/O. |
| Hosted solver execution in CI | **Not feasible** without a licensed SPACE GASS install. Adapter probes `SPACEGASS_HOME` / `SPACEGASS_API` / executable path and **fails closed** (`solver_unavailable` / `license_unavailable`). |
| Silent fallback to CalculiX or fixture execution | **Forbidden.** `silentSolverFallbackAllowed = false`. When SPACE GASS is requested, never substitute CalculiX or fixture as a successful execution. |
| DT orchestrates SPACE GASS | DT remains CalculiX-only inside frozen package. Orchestration for SPACE GASS is via `apps/web` model-interoperability API → interop `SPACEGASSSolverAdapter`. |

## Licensing

- SPACE GASS is a commercial structural analysis product (AU/NZ context).
- This repository stores **no license keys, secrets, or vendor credentials**.
- License probing uses environment presence / path checks only (`spacegass-license.ts`).
- Absence of license/runtime → fail closed; never claim hosted certification.

## CI feasibility

| Capability | CI status |
| --- | --- |
| Model federation (fixture) | Runnable |
| Existing result federation (fixture) | Runnable |
| Negative execution benchmarks (unavailable, wrong version, unapproved project) | Runnable / required |
| Positive hosted SPACE GASS process spawn | **Not available** in standard CI |
| `spaceGassHostedExecutionCertified` | **`false`** (truthful) |

## Hosted execution certified = false (rationale)

`spaceGassHostedExecutionCertified = false` because:

1. No SPACE GASS binary runs in this CI environment.
2. Fixture dry-runs validate adapter contracts, mappers, qualification gates, and
   fail-closed paths — they do **not** constitute hosted solver certification.
3. Setting hosted=true without a real process would violate honesty locks.

`SPACEGASSSolverAdapterReady = true` is allowed because the adapter is genuinely
implemented (probe → map → qualify → execute-or-fail-closed).

Four-layer qualification flags for the **bounded method** `linear_elastic_static`
may be true based on recorded qualification records + negative benchmarks +
fail-closed tests (adapter contract / mapping / policy gates). This does **not**
imply hosted execution certification.

## Selected bounded method

**`linear_elastic_static`**

Rationale: aligns with Digital Twin V1’s certified CalculiX capability class,
keeps the first SPACE GASS method narrowly scoped, and matches typical SPACE GASS
linear-static project workflows without claiming nonlinear / dynamic / design-code
methods.

## Architecture split (implementation placement)

### A) Model / result federation — full production in interop

- `SPACEGASSModelAdapter` implementing `EngineeringModelAdapter`
- `EngineeringModelReference` / `ElementReference` for SPACE GASS entities
- Existing results via `EngineeringAnalysisResultReference`
- Trust: imported existing results are **never** `rtb_execution_certified` without
  RTB execution evidence
- Canonical mappings reuse `EngineeringModelMapping`
- IFC coexistence preserved (Phase 13B intact)

### B) Solver adapter — interop consumes DT contracts only

- Workspace dependency on `@rtb/digital-twin` for **types/contracts only**
- `SPACEGASSSolverAdapter` conforms to `EngineeringSolverAdapter` shape
- `SPACEGASSInputMapper` / `SPACEGASSOutputMapper`
- Four-layer qualification records in interop following DT semantics
  (method → provider → application → execution)
- Fail-closed when runtime unavailable; no silent fallback

### C) Hosted execution truthfulness

Documented above. Federation fixtures ≠ hosted solver success.

## Pins

| Pin | Value |
| --- | --- |
| Digital Twin V1 | `1.0.0` / `digital-twin-v1.0.0` @ `a94425ed…` |
| Phase 13A | `0.1.0-interop-discovery` @ `5d238f24…` / hosted `31288157345` |
| Phase 13B | `0.2.0-ifc-federation` @ `1540f806ada0cf70179c3cfdffe4157f29620778` |
| Phase 13C | `0.3.0-spacegass` (this phase; publicContractVersion prerelease, NOT 1.0.0) |

## Explicit non-goals (13C)

- No ETABS / SAP2000 / SAFE / CSiBridge / STAAD production adapters
- No analysis-model generation; no silent source-model mutation
- No second solver framework
- No Phase 13D
- No rewrite of batch_86 (additive batch_87 only)
