# DIGITAL_TWIN_PHASE_12I_EXTERNAL_SOLVER

## Baseline

| Item | Value |
| --- | --- |
| Prior phase | 12H PASS |
| Prior commit | `f276dbb15b3a68d2863b3547a2dc58aa1ef3afbe` |
| Hosted 12H | `31263802033` |
| Prior version | `0.8.0-simulation-assurance` |
| This version | `0.9.0-external-solver` |
| Status | `external_solver` |
| Phase | `12I` |

## Delivered

- EngineeringSolverAdapter contract (solver-agnostic)
- CalculiXSolverAdapter (`versionProbe`, `healthCheck`, `execute`, `cancel`)
- Input/output mappers + defaults manifest for `linear_elastic_static`
- Axial-bar benchmark + negative cases
- Orchestrator wiring (no silent fixture fallback for real solvers)
- Qualification chain before real execution
- Reserved stubs for other solvers
- Platform Tool Registry compatibility (`toolRegistryRef`) — no competing Twin solver registry
- batch_82 tables + outbox event extensions on `digital_twin_outbox_events`
- HTTP solver routes + UI `digital-twin-external-solver-ready`
- Certification gates A–BW (75) + CalculiX CI install

## Flags

| Flag | Value |
| --- | --- |
| `ExternalSolverAdapterFrameworkReady` | true |
| `firstRealEngineeringSolverAdapterImplemented` | true |
| `firstRealEngineeringSolverMethodCertified` | true |
| `firstRealSolverId` | `calculix` |
| `externalSolverCountCertified` | 1 |
| `silentSolverFallbackAllowed` | false |
| `nativeEngineeringSolverImplemented` | false |
| `externalEngineeringSolverAdaptersImplemented` | true |
| `PHASE_12J_READY` | true (flag only) |
| prediction / SHM / calibration / actuation / optimization / spatialOwnershipFullyResolved | false |
| `duplicateSolverOwnershipDetected` | false |

`realSolverHostedExecutionCertified` is **derived from evidence** in the certification runner
(env `REAL_SOLVER_HOSTED=1` or successful live `ccx` benchmark during certify).

## Stop condition

Do **not** start Phase 12J implementation in this phase. Do not move V1 tags.
Do not modify batch_75–81.
