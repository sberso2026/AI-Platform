# Digital Twin — Phase 12G Simulation Governance

Status: simulation · Version: `0.7.0-simulation` · Phase: `12G`

## Baseline

| Pin | Value |
| --- | --- |
| Phase 12F commit | `2846421e7905a69c789a882a86da4071272278e3` |
| Phase 12F hosted | `31261555990` |
| Phase 12F version | `0.6.0-representation` |

## Delivered

1. Terminology lock (simulation ≠ observation ≠ measurement ≠ prediction).
2. Method + provider registries with governed statuses.
3. Versioned definitions, hypothetical scenarios, immutable input sets.
4. Execution orchestrator with **deterministic_fixture** only.
5. Separate **TwinSimulatedState** plane (batch_80) — does not rewrite batch_76.
6. Validation + review distinct from execution success.
7. Scenario comparison (differences only — not optimization).
8. Calibration reserved stub only.
9. HTTP surfaces + SIMULATED UI markers.
10. Certification gates A–BS (71).

## Flags (selected)

| Flag | Value |
| --- | --- |
| `simulationExecutionImplemented` | `true` (framework + fixture ONLY) |
| `nativeEngineeringSolverImplemented` | `false` |
| `simulationOptimizationImplemented` | `false` |
| `automaticSimulationApprovalEnabled` | `false` |
| `predictiveTwinImplemented` | `false` |
| `shmRuntimeImplemented` | `false` |
| `duplicateEngineeringToolFrameworkDetected` | `false` |
| `spatialOwnershipFullyResolved` | `false` |
| `phase12HReady` | `true` (flag only — do not start 12H) |

## Migration

`supabase/migrations/20260808190000_batch_80_digital_twin_simulation.sql`

batch_75–79 **untouched**.

## Stop condition

When PASS: produce Phase 12G report only. **Do not start Phase 12H.**
