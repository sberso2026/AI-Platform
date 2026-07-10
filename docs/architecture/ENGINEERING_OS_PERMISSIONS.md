# Engineering OS Permissions

## Purpose

Fine-grained Engineering permissions on RTB AI Platform map to platform RBAC (`resource` / `action`). Definition: `@rtb/types` `ENGINEERING_PERMISSIONS`; mapping: `@rtb/engineering-os` `ENGINEERING_PERMISSION_MAP` / `hasEngineeringPermission()`.

Platform actions used: `engineering` + `read` | `execute` | `admin`.

## Permission Map

| Fine-grained | Platform resource | Platform action |
|--------------|-------------------|-----------------|
| `engineering.view` | engineering | read |
| `engineering.admin` | engineering | admin |
| `engineering.project.create` | engineering | execute |
| `engineering.project.update` | engineering | execute |
| `engineering.project.delete` | engineering | admin |
| `engineering.asset.create` | engineering | execute |
| `engineering.asset.update` | engineering | execute |
| `engineering.asset.delete` | engineering | admin |
| `engineering.document.upload` | engineering | execute |
| `engineering.document.review` | engineering | execute |
| `engineering.ai.use` | engineering | execute |
| `engineering.report.create` | engineering | execute |
| `engineering.application.install` | engineering | admin |
| `engineering.settings.manage` | engineering | admin |

`engineering.admin` (platform) short-circuits all fine-grained checks.

## Role Mapping (seed)

Updated `create_default_tenant_roles` + Engineering-specific roles:

| Role slug | Engineering access |
|-----------|--------------------|
| `owner` | Full platform (implicit) |
| `admin` | engineering admin + execute + read |
| `member` | engineering read + execute |
| `viewer` | engineering read |
| `engineering-owner` | engineering admin/execute/read + AI/knowledge/twin execute |
| `engineering-manager` | execute + read + AI/knowledge |
| `lead-engineer` | execute + read + AI |
| `engineer` | execute + read + AI |
| `inspector` | read + execute |
| `document-controller` | read + execute |
| `project-controls-user` | read + execute |

Plugin manifest also declares `engineering` admin/read/execute and `ai_agent` / `knowledge` / `digital_twin` execute.

## RLS Alignment

- **read** → SELECT within tenant
- **execute** → INSERT/UPDATE projects, assets, documents
- **admin** → DELETE, settings, installations, project members, tags, discipline/type manage

App install toggles require admin. AI use requires execute (plus `engineering_os_enabled`).

## Related

- [ENGINEERING_OS_DATABASE.md](./ENGINEERING_OS_DATABASE.md)
- [ENGINEERING_OS_AI.md](./ENGINEERING_OS_AI.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
