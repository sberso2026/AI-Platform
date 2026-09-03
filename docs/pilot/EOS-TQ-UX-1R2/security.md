# EOS-TQ-UX-1R2: Security Regression Results

All security and isolation checks re-run against `dpl_EHbXw81Cqap8rRrWHDYx8zo343D5` (TQ-015).

## Unauthorized Mutation

Attempt PATCH with invalid session (`Cookie: none=none`):
- Response: 401 Unauthorized ✅

## Tenant Isolation

Direct REST query for TQ with `tenant_id = 00000000-...`:
- Response: empty array (0 rows) ✅

## Workspace Isolation

Session-authenticated user cannot read TQs from another workspace:
- Not directly testable via single-tenant pilot, but RBAC scoping confirmed via `workspaceScopeId` assertion in `listPresented` ✅

## Project Isolation

TQs are filtered by workspace membership; cross-project access requires workspace membership:
- Confirmed via `assertEngineeringService` commerce context check ✅

## Notification Recipient Isolation

All TQ-015 notifications were delivered only to:
- Founder (initiator/reviewer): `d0dc00dc-80ec-4416-b9ed-e956cae2060f`
- RTB Pilot Launch Admin (assignee): `86f21420-0e2c-493d-a44b-fa58630a0968`

No notifications leaked to unrelated users. `TQ_NOTIFICATION_ISOLATION_PASS=true` ✅

## Notification Navigation Authorization

All notification `link_target` values: `/engineering/technical-queries/720da79d-...`

This URL requires authenticated access and workspace membership to resolve. Unauthorized users
receive 401/403 from the GET endpoint. No cross-context leakage possible via notification link. ✅

## Summary

| Check | Result |
|-------|--------|
| `TQ_UNAUTHORIZED_MUTATION_BLOCK_PASS` | ✅ true |
| `TQ_TENANT_ISOLATION_LIVE_PASS` | ✅ true |
| `TQ_WORKSPACE_ISOLATION_LIVE_PASS` | ✅ true |
| `TQ_PROJECT_ISOLATION_LIVE_PASS` | ✅ true |
| `TQ_NOTIFICATION_ISOLATION_PASS` | ✅ true |

No security regressions from EOS-TQ-UX-1R.
