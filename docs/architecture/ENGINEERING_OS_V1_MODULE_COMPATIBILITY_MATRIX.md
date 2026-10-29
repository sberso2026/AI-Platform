# Engineering OS V1 Module Compatibility Matrix

Status: Phase 14A · `EngineeringOSModuleCompatibilityAssessed = true`  
Require: `privateCrossModuleCouplingDetected = false`

Modules: PI · II · AI · PC · DT · Interop

## Relationship rules (all pairs)

| From → To | Public contract | Event contract | Query contract | Shared canonical refs | Allowed dependency | Forbidden private dependency | Compat version | Certification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PI → * | PI public contracts | `project_intelligence.*` | PI query APIs | project/asset/doc refs | via EOS/Platform | private package internals | PI 1.0.0 | certified |
| II → * | II public contracts | `inspection_intelligence.*` | II APIs | asset/project/target refs | via EOS/Platform | private AI/DT tables | II 1.0.0 | certified |
| AI → * | AI public contracts | `asset_intelligence.*` | AI APIs | asset/timeseries refs | via EOS/Platform | private PC/DT internals | AI 1.0.0 | certified |
| PC → * | PC public contracts | `project_controls.*` | PC APIs | project refs | via EOS/Platform | private PI/AI internals | PC 1.0.0 | certified |
| DT → * | DT public contracts 1.0.0 | `digital_twin.*` | DT APIs | asset/spatial/twin refs | via EOS/Platform | private Interop vendor impl | DT 1.0.0 | certified |
| Interop → * | Interop public contracts 1.0.0 | interop events | federation APIs | model/element/mapping refs | DT public + EOS + Exec Host | private DT internals; vendor COM | Interop 1.0.0 | certified |

## Notable integrations

| Pair | Integration mode |
| --- | --- |
| Interop → DT | Governed Twin model binding via DT public contracts only |
| Interop → Exec Host | Host infra compatibility; not solver certification |
| DT → ETF | CalculiX / solver adapters via Tool Framework |
| II → Workflow SDK | Inspection review workflows |
| AI → Time series | AI owns engineering time series |

## Coupling assertion

`privateCrossModuleCouplingDetected = false` for Phase 14A assessment scope.
Any future private import across module packages is a GA blocker.
