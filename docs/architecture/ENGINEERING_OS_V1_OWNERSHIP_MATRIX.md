# Engineering OS V1 Ownership Matrix

Status: Locked (Phase 14A) · `EngineeringOSOwnershipModelLocked = true`

Legend: **OWNS** · **CONSUMES** · **REFERENCES** · **ORCHESTRATES** · **RESERVED** · **MUST_NEVER_OWN**

| Concern | Platform | Engineering OS | Shared Asset | Shared Project | Shared Spatial | PI | II | AI | PC | DT | Interop | ETF | Exec Host |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Tenant / workspace identity | OWNS | CONSUMES | REFERENCES | REFERENCES | REFERENCES | CONSUMES | CONSUMES | CONSUMES | CONSUMES | CONSUMES | CONSUMES | CONSUMES | CONSUMES |
| Commerce / entitlements | OWNS | CONSUMES | — | — | — | CONSUMES | CONSUMES | CONSUMES | CONSUMES | CONSUMES | CONSUMES | CONSUMES | CONSUMES |
| Product shell / nav | — | OWNS | — | — | — | CONSUMES | CONSUMES | CONSUMES | CONSUMES | CONSUMES | CONSUMES | — | — |
| Canonical asset identity | — | ORCHESTRATES | OWNS | REFERENCES | REFERENCES | REFERENCES | REFERENCES | REFERENCES | REFERENCES | REFERENCES | REFERENCES | — | — |
| Canonical project identity | — | ORCHESTRATES | REFERENCES | OWNS | REFERENCES | REFERENCES | REFERENCES | REFERENCES | REFERENCES | REFERENCES | REFERENCES | — | — |
| Canonical spatial reference | — | ORCHESTRATES | REFERENCES | REFERENCES | OWNS | REFERENCES | REFERENCES | REFERENCES | REFERENCES | REFERENCES | REFERENCES | — | — |
| Engineering risk (core) | — | ORCHESTRATES | — | — | — | REFERENCES | REFERENCES | REFERENCES | REFERENCES | — | — | — | — |
| Engineering time series | — | MUST_NEVER_OWN | — | — | — | — | — | OWNS | — | CONSUMES | — | — | — |
| Knowledge Graph store | OWNS | CONSUMES | REFERENCES | REFERENCES | REFERENCES | CONTRIBUTES | CONTRIBUTES | CONTRIBUTES | CONTRIBUTES | CONTRIBUTES | CONTRIBUTES | — | — |
| Platform Files | OWNS | CONSUMES | — | — | — | CONSUMES | CONSUMES | CONSUMES | CONSUMES | CONSUMES | CONSUMES | — | CONSUMES |
| Workflow engine | Platform / EOS SDK | ORCHESTRATES | — | — | — | CONSUMES | CONSUMES | CONSUMES | CONSUMES | CONSUMES | CONSUMES | — | — |
| AI Runtime | OWNS | ORCHESTRATES | — | — | — | CONSUMES | CONSUMES | CONSUMES | CONSUMES | CONSUMES | CONSUMES | CONSUMES | — |
| Tool Framework | Platform Intelligence / ETF | ORCHESTRATES | — | — | — | CONSUMES | — | — | — | CONSUMES | CONSUMES | OWNS | CONSUMES |
| Controlled execution | — | ORCHESTRATES | — | — | — | — | — | — | — | CONSUMES | CONSUMES | CONSUMES | OWNS |
| Twin identity/state | — | MUST_NEVER_OWN | — | — | — | — | — | — | — | OWNS | REFERENCES | — | — |
| Model federation refs | — | MUST_NEVER_OWN | — | — | — | — | — | — | — | CONSUMES | OWNS | — | — |
| Source commercial models | — | MUST_NEVER_OWN | — | — | — | — | — | — | — | MUST_NEVER_OWN | REFERENCES | — | — |
| Commercial solver license | Client | MUST_NEVER_OWN | — | — | — | — | — | — | — | MUST_NEVER_OWN | MUST_NEVER_OWN | MUST_NEVER_OWN | MUST_NEVER_OWN |

## Duplicate ownership detection (required false)

- `duplicateAssetOwnershipDetected = false`
- `duplicateProjectOwnershipDetected = false`
- `duplicateSpatialOwnershipDetected = false`
- `duplicateKnowledgeGraphDetected = false`
- `duplicateWorkflowEngineDetected = false`
- `duplicateEngineeringToolFrameworkDetected = false`
