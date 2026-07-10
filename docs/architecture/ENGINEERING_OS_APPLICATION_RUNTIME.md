# Engineering OS Application Runtime

## Purpose

Registry and install facade for future Engineering product apps on RTB AI Platform. Batch 2.0 **registers** apps and supports tenant enable/disable — it does **not** implement app product logic.

Class: `EngineeringApplicationRuntime` in `@rtb/engineering-os`.

## Tables

| Table | Scope |
|-------|--------|
| `engineering_application_registry` | Global catalog (`app_key` unique) |
| `engineering_application_installations` | Per-tenant enable + config |

API: `GET/POST` `/api/engineering/applications` (list + toggle).

## Registered Apps (all `enabled: false`, version `0.0.0`)

| `app_key` | Name | Required capability | Route (future) |
|-----------|------|---------------------|----------------|
| `project_intelligence` | Project Intelligence | `engineering_project_management` | `/engineering/apps/project-intelligence` |
| `inspection_intelligence` | Inspection Intelligence | `engineering_asset_register` | `/engineering/apps/inspection-intelligence` |
| `project_controls` | Project Controls | `engineering_project_management` | `/engineering/apps/project-controls` |
| `document_intelligence` | Document Intelligence | `engineering_document_register` | `/engineering/apps/document-intelligence` |
| `meeting_intelligence` | Meeting Intelligence | `engineering_ai_workspace` | `/engineering/apps/meeting-intelligence` |
| `structural_intelligence` | Structural Intelligence | `engineering_ai_workspace` | `/engineering/apps/structural-intelligence` |
| `standards_intelligence` | Standards Intelligence | `engineering_document_register` | `/engineering/apps/standards-intelligence` |
| `engineering_reports` | Engineering Reports | `engineering_reporting` | `/engineering/reports` |

Source of truth in code: `ENGINEERING_APPLICATIONS` in `packages/engineering-os/src/manifest.ts` (mirrored in seed SQL).

## Runtime Behavior (Batch 2.0)

1. `listApplications()` — read global registry
2. `listInstallations(tenantId)` — tenant install rows
3. `setEnabled(tenantId, appKey, enabled)` — upsert installation; publish `engineering.application.enabled` when enabling
4. Install requires `engineering.application.install` → platform `engineering` / `admin`

Apps remain **status: registered**. Enabling a flag row does not ship UI or APIs for that product.

`EngineeringDashboardService` surfaces registry status counts; Settings can list enabled applications. Core still owns `/engineering/reports` as a shell until the reports app is implemented.

## Preconditions for a Real App Install

| Check | Source |
|-------|--------|
| Engineering OS Core flag | `engineering_os_enabled` |
| Required capabilities | Registry JSON → Capability Registry |
| Required permissions | Fine-grained → platform RBAC map |
| Human review policies | Policy Engine (engineering scope) |

## Explicit Non-Claims

- Project Intelligence is **not** built in Batch 2.0
- No app-specific routes under `/engineering/apps/*` are implemented yet
- `/engineering/reports` is a Core shell only

## Next Batch

Batch 2.1 targets **Project Intelligence** — first consumer of this registry. See [BATCH_2_READINESS.md](./BATCH_2_READINESS.md).

## Related

- [ENGINEERING_OS.md](./ENGINEERING_OS.md)
- [ENGINEERING_OS_CORE.md](./ENGINEERING_OS_CORE.md)
- [ENGINEERING_OS_PERMISSIONS.md](./ENGINEERING_OS_PERMISSIONS.md)
