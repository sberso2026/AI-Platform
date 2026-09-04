# Project context

Founder project: **UAT2-245013-API — Founder workflow UAT-2** (`b35e0b5e-e404-4d4f-8926-0992f55b1696`).

- Shell selector: `pi-project-select` (`PiProjectSelector`)
- Page selectors: `PiPageProjectSelect` with view-specific test ids
- Persistence: `?projectId=` + `localStorage` `pi.selectedProjectId`
- All Projects: explicit `__all__` in the shell only. Intelligence views require a selected project and show a professional empty state when All Projects is chosen.
- APIs take `projectId` from the path. Hosted core validates tenant, workspace, and project (`cross_tenant` / `cross_workspace`).

```
PI_PROJECT_CONTEXT_API_PASS=true
PI_PROJECT_SELECTOR_SYNC_PASS=true
```
