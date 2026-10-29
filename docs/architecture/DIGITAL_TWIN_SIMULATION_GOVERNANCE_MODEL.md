# Digital Twin — Simulation Governance Model (Phase 12G)

Status: simulation · Version: `0.7.0-simulation`

## Terminology lock

| Term | Meaning | Must not be confused with |
| --- | --- | --- |
| **Simulation** | Governed hypothetical computation under registered method/provider | Observation, measurement, prediction |
| **Observation** | Evidence of real-world / measured twin state | Simulation output |
| **Measurement** | Quantitative reading from sensors / inspections | Simulated value |
| **Prediction** | Forward estimate of future condition (PoF/RUL/ML) | Scenario result |
| **Scenario** | Hypothetical what-if configuration | Forecast |
| **Forecast** | Predictive estimate of future states | Scenario |
| **Result** | Immutable output of a simulation run | Engineering approval / acceptance |
| **Validation** | Technical check that a result is coherent / complete | Engineering acceptance |
| **Approval** | Human-gated engineering review decision | Successful execution |
| **Successful execution** | Orchestrator completed fixture/provider call | Engineering acceptance |

## State semantic firewall

```
Observed  ≠  Simulated  ≠  Derived  ≠  Operational
```

- **Simulated Twin State** lives on a **separate plane** (`digital_twin_simulated_states` / `TwinSimulatedState`).
- It **never** silently replaces Observed / Derived / Operational rows (batch_76 path keeps `simulationExecuted=false`).
- Snapshots may reference `simulatedStateRefs` / `activeScenarioRefs` **alongside** observed `stateVersionRefs` — never merge identities.

## Certified execution path

- `simulationExecutionImplemented=true` means: **bounded governed framework + deterministic_fixture provider ONLY**.
- `nativeEngineeringSolverImplemented=false` — no FEA / CFD / physics / process solvers in-package.
- Fixture qualification certifies **orchestration framework**, not engineering solver quality.
- Input sets pin representation versions + published Twin state versions; default `simulationUsesPublishedStateOnly=true`.
- Input sets become **immutable** when a run starts (`contentHash`).

## Review lifecycle

`digital_twin.simulation_review`: draft → pending_review → approved|rejected → published

- `automaticSimulationApprovalEnabled=false`
- No AI self-approval
- Successful execution ≠ validated ≠ approved

## Out of scope (Phase 12G)

Native solvers, optimization, predictive Twin, PoF/RUL, SHM runtime/calibration, actuation, 3D viewer, historian, duplicate Engineering Tool Framework.
