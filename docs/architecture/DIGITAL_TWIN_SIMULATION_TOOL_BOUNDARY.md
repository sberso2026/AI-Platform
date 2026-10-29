# Digital Twin — Simulation Tool Boundary (Phase 12G)

Status: simulation · `duplicateEngineeringToolFrameworkDetected=false`

## Compatibility, not competition

Digital Twin **simulation method/provider registries** are **Digital Twin simulation governance**.

They are **adapters compatible with** the Platform Engineering Tool Framework
(`packages/platform-intelligence` Tool Registry / `ai_tools` catalog patterns).

They are **not** a second general-purpose engineering tool framework.

| Concern | Owner | Twin relation |
| --- | --- | --- |
| General Engineering Tool Framework / Tool Registry | `platform_intelligence` | consumes (compatibility refs) |
| TwinSimulationMethodRegistry | `digital_twin` | owns (simulation governance) |
| TwinSimulationProviderRegistry | `digital_twin` | owns (simulation governance) |
| Native FEA/CFD/physics solvers | external / future | forbidden in 12G |

## Adapter pattern

- Provider rows may carry `engineeringToolRegistryRef` pointing at Platform Tool Registry catalog entries.
- Executable path in Phase 12G: **`deterministic_fixture` only**.
- Provider types `external_solver`, `engineering_tool_adapter`, `remote_service`, `future_local_solver` are **metadata / reserved adapters** — not executed as native solvers.
- Sandbox: timeout + fail-closed; **no arbitrary code / shell**.

## Explicit non-goals

- Do not invent a competing `ai_tools`-style catalog inside Twin.
- Do not claim Twin owns general tool invocation, plugin lifecycle, or risk-level policy for all engineering tools.
- Do not treat fixture success as solver certification.

See also: `DIGITAL_TWIN_SIMULATION_GOVERNANCE_MODEL.md`, ownership matrix.
