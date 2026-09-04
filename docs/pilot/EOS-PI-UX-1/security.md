# Security

- Tenant / workspace / project isolation is unchanged: Command Centre, analyst, reports, documents, meetings, and findings queries still filter `tenant_id` / `workspace_id` and selected `engineering_project_id`.
- PI pages remain behind `ENGINEERING_PAGE_POLICIES` and application entitlement.
- Findings list reuses `project-intelligence-findings.read`.
- Ask Project Intelligence remains advisory: `mutationEnabled: false`, no autonomous approval, no external write.
- No second project truth: schedule/cost still read published Project Controls assessments; documents remain Engineering Core.
- No second AI stack: analyst still uses Platform AI Director overlay on Command Centre evidence.

PI tests covering entitlement and hosted adapter non-mutation remain green (`pi-1` through `pi-10`, plus `pi-ux-1`).
