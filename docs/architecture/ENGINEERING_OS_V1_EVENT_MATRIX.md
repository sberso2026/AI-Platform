# Engineering OS V1 Event Matrix

Status: Phase 14A · `EngineeringOSEventMatrixReady = true`

## Inventory (representative)

| Event namespace | Owner | Versioning | Cross-module bus | Sensitive payload risk |
| --- | --- | --- | --- | --- |
| `engineering.module.*` | Engineering OS | yes | Platform Event Bus | low |
| `project_intelligence.*` | PI | yes | Platform Event Bus | medium (doc metadata only) |
| `inspection_intelligence.*` | II | yes | Platform Event Bus | medium |
| `asset_intelligence.*` | AI | yes | Platform Event Bus | medium |
| `project_controls.*` | PC | yes | Platform Event Bus | medium |
| `digital_twin.*` | DT | yes | Platform Event Bus | medium |
| interoperability / model events | Interop | yes (1.0.0 contracts) | Platform Event Bus | medium — no vendor secrets |
| `engineering.workflow.*` | Workflow SDK / II et al. | yes | Platform Event Bus | low |

## Rules

- Unique ownership per event type family
- No direct hidden cross-module coupling
- No commercial license keys / private evidence / CoT in payloads
- Cross-module consumers use Platform Event Bus only
