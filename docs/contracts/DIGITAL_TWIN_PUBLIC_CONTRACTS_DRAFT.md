# Digital Twin Public Contracts (Draft 0.1.0-draft)

Status: draft only · `PUBLIC_CONTRACT_VERSION = "0.1.0-draft"`

Phase 12A publishes contract **families** only. No runtime serializers, HTTP routes,
or production persistence implement these types yet.

## Contract families

| Family | Purpose |
| --- | --- |
| TwinRegistrationDraft | Register a twin against a target reference |
| TwinTargetReferenceDraft | Canonical entity pointer |
| TwinRepresentationReferenceDraft | Fidelity and representation config |
| TwinStateSnapshotDraft | Category-tagged state snapshot |
| TwinRelationshipDraft | Twin-to-twin relationship edge |
| DigitalThreadLinkDraft | Provenance link in digital thread |
| FidelityConfigDraft | L0–L5 config block |
| TelemetryBindingDraft | Kernel telemetry event binding |
| SimulationScenarioDraft | Reserved scenario descriptor — execution forbidden |
| SpatialAnchorDraft | Reserved spatial frame — viewer forbidden in 12A |

## Versioning rules

- All draft payloads include `contractVersion: "0.1.0-draft"`
- Breaking changes require a new draft version — not silent field drift
- Promotion to `1.0.0` requires explicit GA phase certification
- `assertDraftContractsOnly()` in discovery package enforces draft-only lock

## Consumer modules

Future consumers (Asset Intelligence, Inspection Intelligence, Project Controls)
reference twins via `TwinTargetReferenceDraft` — never via parallel identity stores.

## Not in scope for 0.1.0-draft

- Live streaming contracts
- Simulation execution requests
- Actuation commands
- 3D scene graph payloads
