# Engineering OS Context Model

Status: Locked (Phase 14A) · `EngineeringOSContextModelLocked = true`

## EngineeringContext (candidate)

| Field | Purpose |
| --- | --- |
| `tenantRef` | Tenant isolation |
| `workspaceRef` | Workspace isolation |
| `projectRef` | Active project |
| `assetRef` | Active asset |
| `spatialRef` | Active spatial reference |
| `twinRef` | Active digital twin |
| `modelRef` | Active engineering model reference |
| `userRef` | Acting user |
| `permissions` | Effective permission snapshot |
| `activeModule` | Active product module key |
| `activeObject` | Active object type/id |
| `correlationId` | Request/audit correlation |

## Rules

- Coordinates navigation and query context across modules
- **MUST_NEVER** become a duplicate domain registry
- Holds references only; domain authorities remain with owning modules/domains
- Propagates into AI/tool calls with least privilege
