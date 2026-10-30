# EOS-3-PILOT-UI-HOTFIX-1 — Project Setup Save

## Defect

`PILOT-BUG-001 = PROJECT_SETUP_SAVE_AUTHORIZATION_ACTION_MISMATCH` (P0)

Observed UI:
- `Cannot load this record`
- `This page requested data you are not authorized to view in the current context.`
- `Action mismatch: expected project.read`

## Root cause

`PROJECT_SETUP_SAVE_ROOT_CAUSE_IDENTIFIED=YES`

POST `/api/engineering/projects/{id}/workspace` is guarded as `projects.write` → commerce action **`project.create`** (established HTTP write mapping).

The handler then called:

`ctx.engineering.projects.get(commerce, …)`

`projects.get` asserts service policy **`project.get` → `project.read`**.

Verified commerce context therefore threw:

`Action mismatch: expected project.read`

The client humanized that write-path failure as a load/authorization view error.

This is **not** an entitlement gap and **not** an RLS failure. It is a write-context / read-service action mismatch.

## Fix

1. Keep route-level write authorization as `projects.write` / `project.create` for mutations.
2. Authorize a **distinct** `projects` GET commerce (`project.read`) for existence checks and post-save revalidation via `authorizeEngineeringSegment(ctx, "projects", "GET", …)`.
3. Persist editable setup fields with `projects.update(writeCommerce, …)` into project columns + `metadata.eos_project_setup`.
4. Re-read with `project.read` and hydrate the workspace snapshot.
5. Surface user-facing save errors as:  
   `Project setup could not be saved. Your changes have been preserved.`  
   Technical diagnostics remain in logs / `diagnostic`.

## Authorization semantics

| Operation | Commerce action |
|-----------|-----------------|
| Read setup / project existence | `project.read` |
| Update setup (HTTP write) | `project.create` via established `projects.write` |

`PROJECT_SETUP_AUTHORIZATION_BYPASS_CREATED=NO`  
`EOS_UI_AUTHORITY_EXPANSION=NO`  
No RLS weakening. No allow-all.
