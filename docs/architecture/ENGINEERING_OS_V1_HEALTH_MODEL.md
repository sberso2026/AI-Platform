# Engineering OS V1 Health Model

Status: Phase 14A · `EngineeringOSHealthModelDefined = true`

## Aggregate inputs

| Component | Health input |
| --- | --- |
| Platform dependencies | DB, auth, commerce |
| Shared Domains | asset/project/spatial readiness |
| Product modules | PI/II/AI/PC/DT/Interop health |
| Tool Framework | registry / invocation |
| Execution Host | host/provider health |
| Search | provider availability |
| AI Runtime | availability |
| Database | connectivity / RLS posture |

## Aggregation rules

- Preserve component detail in reports
- Partial degradation ≠ false healthy
- Host healthy ≠ solver certified
- Federation ready ≠ live execution ready

Existing locus: `EngineeringHealthService` — extend aggregation in later closure
phases without collapsing semantics.
