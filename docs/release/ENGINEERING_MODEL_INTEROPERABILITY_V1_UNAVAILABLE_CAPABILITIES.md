# Engineering Model Interoperability V1.0 — Unavailable Capabilities

## UNAVAILABLE — not production functions of V1.0

- SPACE GASS live API / live execution (`blocked_external_dependency`)
- SPACE GASS hosted/controlled execution certified claims
- ETABS live COM/API / real execution
- SAP2000 / SAFE / CSiBridge
- Revit / Navisworks / Tekla native adapters
- Analysis-model generation / automatic analysis-model certification
- Source-model mutation / authoring
- Automatic mapping approval
- Silent solver fallback

## Enforcement points

- `version.ts` honesty flags
- `unavailable-capabilities.ts` registry
- UI `emi-unavailable-*` markers
- Fail-closed solver adapters
- Certification artifact `phase13DStatus === blocked_external_dependency`
