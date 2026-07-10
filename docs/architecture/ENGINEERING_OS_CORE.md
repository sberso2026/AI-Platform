# Engineering OS Core

## Purpose

Batch 2.0 core modules inside `@rtb/engineering-os`. Factory: `createEngineeringOS()` → dashboards, registers, search, settings, AI shell, and application runtime stubs.

## Modules

| Module | Service | UI | API |
|--------|---------|----|-----|
| Dashboard | `EngineeringDashboardService` | `/engineering` | `/api/engineering/dashboard` |
| Projects | `EngineeringProjectService` | `/engineering/projects` | `/api/engineering/projects` |
| Assets | `EngineeringAssetService` | `/engineering/assets` | `/api/engineering/assets` |
| Documents | `EngineeringDocumentService` | `/engineering/documents` | `/api/engineering/documents` |
| Disciplines | `EngineeringDisciplineService` | `/engineering/disciplines` | `/api/engineering/disciplines` |
| Companies | `EngineeringCompanyService` | `/engineering/companies` | `/api/engineering/companies` |
| Search | `EngineeringSearchService` | `/engineering/search` | `/api/engineering/search` |
| Reports shell | (placeholder UI) | `/engineering/reports` | — |
| AI Workspace | `EngineeringAIService` | `/engineering/ai` | `/api/engineering/ai` |
| Settings | `EngineeringSettingsService` | `/engineering/settings` | `/api/engineering/settings` |
| Applications | `EngineeringApplicationRuntime` | settings / API | `/api/engineering/applications` |

Detail routes: `/engineering/projects/[id]`, `/assets/[id]`, `/documents/[id]`, plus `new` / `upload` create flows.

## Domain Capabilities

Seeded per tenant by `seed_tenant_engineering_os`:

- `engineering_os`
- `engineering_project_management`
- `engineering_asset_register`
- `engineering_document_register`
- `engineering_ai_workspace`
- `engineering_search`
- `engineering_reporting`

## Entity Summary

| Entity | Keys / notes |
|--------|----------------|
| Project | `project_code` unique per tenant; phase + status enums |
| Asset | `asset_tag` unique; hierarchy via `parent_asset_id`; criticality |
| Document | `document_number` + `revision`; optional project/asset links |
| Discipline | System + tenant copies (Structural, Civil, …) |
| Company | Owner/consultant/contractor/… + contacts |
| Settings | Numbering formats, `ai_review_threshold`, enabled apps |

## Kernel Integration

- Event bus: project/asset/document/AI lifecycle events
- Knowledge graph: optional node links on projects, assets, documents
- Digital twin: optional `digital_twin_id` on assets
- Intelligence: feature flag, prompts, models, policies on AI path

## Out of Scope (Core)

- Project Intelligence analytics / decision apps
- Live RAG pipelines, inspection workflows, structural calc engines
- Autonomous approvals

## Related

- [ENGINEERING_OS.md](./ENGINEERING_OS.md)
- [ENGINEERING_OS_DATABASE.md](./ENGINEERING_OS_DATABASE.md)
- [ENGINEERING_OS_APPLICATION_RUNTIME.md](./ENGINEERING_OS_APPLICATION_RUNTIME.md)
