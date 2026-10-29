# Digital Twin — External Solver Adapter Model (Phase 12I)

## Purpose

Define the **EngineeringSolverAdapter** contract used by Digital Twin to invoke
external engineering solvers without Twin owning a competing tool framework or
claiming native FEA product breadth.

## Ownership

| Concern | Owner |
| --- | --- |
| `engineeringToolFrameworkOwnership` | `platform_intelligence` (Platform Tool Registry) |
| `engineeringSolverOwnership` | `external_engineering_tool` |
| Twin simulation governance / assurance | `digital_twin` |
| `duplicateSolverOwnershipDetected` | `false` |
| `duplicateEngineeringToolFrameworkDetected` | `false` |

Twin stores `toolRegistryRef` / `engineeringToolRegistryRef` on providers —
**not** a `DigitalTwinSolverRegistry`.

## Contract (solver-agnostic)

Adapters expose:

- `versionProbe()` — identity via CLI (e.g. `ccx -v`)
- `healthCheck()`
- `execute(request)` — sandboxed process spawn (cwd = artifact dir, timeout, no shell injection, path confinement)
- `cancel(requestId)` where feasible

Statuses: `completed | completed_with_warnings | non_converged | failed | cancelled | timeout | unknown`.

## Mapping & defaults

- Versioned `SolverInputMapper` / `SolverOutputMapper` for the **one** certified method
- `SolverExecutionDefaultsManifest` — all material/section/unit pins explicit; unknown defaults fail closed

## Qualification

Real execution requires method / provider / application eligibility **before** spawn,
and execution qualification **after**. TwinSimulatedState only after validation + review (12H path).

## Truthfulness

- `silentSolverFallbackAllowed = false`
- Real/external/calculix providers **must not** fall back to `deterministic_fixture`
- Fixture provider remains test-only

## First solver

CalculiX (`ccx`) — see `DIGITAL_TWIN_PHASE_12I_FIRST_SOLVER_SELECTION.md`.
