# ERA-6 security change control — before state

**Phase:** ERA-6  
**Not a certification claim.** Shared security changes fail closed. Historical migrations are not edited.

## Affected tables

| Table | Before ERA-6 | ERA-6 change |
| --- | --- | --- |
| `engineering_projects` | Tenant-only RLS (`20260203000001`) | Tenant + workspace membership; NULL workspace fail-closed for user JWT |
| `engineering_documents` | Tenant-only RLS | Same |
| `engineering_document_versions` | Parent document tenant only | Follows parent tenant + workspace membership |
| Review tables | Tenant + workspace (ERA-2/3A) | Unchanged |
| `audit_events` | User INSERT not usable in practice | Unchanged; trusted service-role write after authorized Review op |
| `tenants.settings` | Unstructured JSON | Review identity keys `engineeringReview.requireMfa` / `requireEnterpriseSso` (additive) |

## Affected routes / services

- Engineering OS project/document services (JWT already workspace-filtered in application)
- Project Intelligence document listing (already tenant+workspace on PI tables)
- Engineering Review MUP `/api/review/*` and `/review`
- PI upload-session / upload-complete (magic-byte + filename sanitization)
- Web middleware `/review` identity policy (not a global MFA force)
- `COMMERCE_AUTH_SECRET` production fail-closed (Review does not use commerce auth)
- `SecretManagementService.encryptPlaceholder` production fail-closed (Review does not call it)

## Existing RLS consumers

Engineering OS `core-services` lists projects with `.eq("workspace_id", workspaceId)`. After Core RLS, same-tenant other-workspace SELECT returns zero rows even if application filtering is omitted. That is the intended fail-closed outcome.

E12 is certification-not-feature and must not depend on cross-workspace Core SELECT.

## Compatibility

- Legacy NULL `workspace_id` rows are **not deleted**. User JWT cannot read them. Service role can still see them. One-time workspace assignment is allowed; non-null workspace is immutable.
- New INSERTs require a workspace that belongs to the tenant and that the actor is a member of.
- If an established product required same-tenant cross-workspace Core SELECT, that incompatibility is documented rather than weakening RLS.

## E12

E12 architecture tests remain the regression gate. No E12 invariant is relaxed to pass Core RLS.
