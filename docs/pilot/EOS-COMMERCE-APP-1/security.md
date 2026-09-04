# EOS-COMMERCE-APP-1 security

- Tenant isolation: licences, installations, and reconcile run with `ctx.tenantId` only.
- Workspace isolation: entitlement checks pass `ctx.workspaceId`; installation requests use the current workspace.
- RBAC: reconcile and install require Commerce admin plus `owner`/`admin` install permission.
- Pilot tenant gate: `COMMERCE_PILOT_TENANT_ID` must match when set. If unset, Preview is treated as the single RTB tenant (documented risk, not a cross-tenant grant).
- No hardcoded founder user IDs.
- No route-guard bypass and no client-controlled application grant keys outside Commerce.
- No service-role key in browser or API handlers.
- No second commerce/licensing stack.
- Catalog upsert is identity only; Enterprise plan entitlements were not globally expanded.
- Existing GA declarations were not rewritten to make access pass.
