# Platform Entitlement Engine

Commerce is the single source of truth for commercial access. All product, application, and feature access decisions flow through `ctx.commerce.entitlements.check()`.

Implementation: `packages/platform-commerce/src/services/entitlement-service.ts`.

## Interface

```typescript
const decision = await ctx.commerce.entitlements.check({
  tenantId,
  workspaceId,
  userId,
  productKey,      // e.g. engineering-os
  applicationKey,  // e.g. project_intelligence
  featureKey,      // e.g. ai_assistant
  action: "access",
  cachePolicy: "allow-short-cache", // or "fresh"
});
```

### Diagnostics

```typescript
const result = await ctx.commerce.entitlements.diagnose({ ...input });
// Returns { allowed, reasonCode, steps: [{ step, passed, detail }] }
```

Used by the Entitlement Diagnose button in System Administration UI.

## Domain model

### Inputs

`EntitlementCheckInput` — tenant, optional workspace/user, product/application/feature keys, action, cache policy.

### Outputs

`EntitlementDecision`:

| Field | Meaning |
|-------|---------|
| `allowed` | Boolean grant |
| `decision` | `allow`, `deny`, `unavailable`, `error` |
| `reasonCode` | `EntitlementReasonCode` constant |
| `subscriptionId`, `subscriptionStatus` | Matched subscription |
| `licenceId`, `licenceStatus` | Matched licence |
| `seatRequired`, `seatAssigned` | Seat pool state |
| `workspaceAllowed` | Workspace scope result |
| `validUntil` | Licence or period end |
| `limits.seatLimit` | Max seats on licence |

### Overrides

Table: `commercial_entitlement_overrides`

Evaluated first (deny before allow). Scoped by tenant, optional user/workspace/application/feature. Effects: `allow`, `deny` (limit overrides reserved for Phase 3).

### Version stamp

Table: `commercial_entitlement_versions`

`EntitlementVersionRepository.bumpTenant()` is called on lifecycle mutations so clients can detect stale cached decisions. RPC: `bump_commercial_entitlement_version(p_tenant_id)`.

## Evaluation sequence

1. Administrative override (deny, then allow)
2. Product existence and lifecycle (`active` or `preview`)
3. Active subscription for product (`findActiveByProduct`)
4. Subscription status and effective dates
5. Licence existence and status (`active`, `expiring_soon`)
6. Plan entitlement (application/feature when no explicit licence)
7. Workspace scope (application licences)
8. Seat pool assignment (when seat-controlled)
9. Default deny

### Subscription rules

- `trial` status normalized to `trialing`
- `scheduled_cancellation` grants access until `cancellation_effective_at`
- Expired trial end denies even in `trialing` status
- Access-granting statuses: `trialing`, `active`, `grace_period`, `scheduled_cancellation`

### Seat rules

Seat required when licence `max_seats > 0` or licence type is not `feature`. Assignment looked up in `commercial_seat_assignments` via seat pool for product.

## Decision types

| `decision` | Meaning |
|---|---|
| `allow` | Commercial access granted |
| `deny` | Commercial access denied (authoritative) |
| `unavailable` | Commerce data could not be evaluated |
| `error` | Internal evaluation failure (fail closed) |

## Reason codes

Defined in `@rtb/platform-commerce` → `EntitlementReasonCode`:

| Allow | Deny |
|-------|------|
| `active_application_licence` | `subscription_suspended` |
| `active_product_licence` | `subscription_cancelled` |
| `feature_enabled` | `subscription_expired` |
| `administrative_override` | `subscription_not_found` |
| | `subscription_inactive` |
| | `licence_expired` |
| | `licence_revoked` |
| | `licence_not_found` |
| | `seat_not_assigned` |
| | `application_not_in_plan` |
| | `feature_not_enabled` |
| | `workspace_not_entitled` |
| | `product_not_found` |
| | `product_inactive` |
| | `override_deny` |
| | `internal_evaluation_error` |

## Execution context (downstream enforcement)

After a successful route-level check, `createCommerceExecutionContext()` produces a signed `VerifiedCommerceAuthorization` (5-minute TTL, HMAC via `COMMERCE_AUTH_SECRET`). Service-layer code asserts this context with `assertVerifiedCommerceContext()` — see [ENGINEERING_SERVICE_ENTITLEMENT_ENFORCEMENT.md](../security/ENGINEERING_SERVICE_ENTITLEMENT_ENFORCEMENT.md).

## Caching

`EntitlementCache` — 30s in-process TTL per key.

| Trigger | Invalidation |
|---------|--------------|
| Subscription lifecycle transition | `invalidateTenant(tenantId)` + version bump |
| Licence issue/revoke/suspend | `invalidateTenant` |
| Seat assign/remove/transfer | `invalidateTenant` |
| Override change | Manual via commerce admin (invalidates on write paths) |

Cache key: sorted `tenantId|workspaceId|userId|productKey|applicationKey|featureKey|action`.

Write operations should pass `cachePolicy: "fresh"` on entitlement checks.

See [COMMERCE_CACHE_INVALIDATION.md](../operations/COMMERCE_CACHE_INVALIDATION.md).

## Server enforcement layers

| Layer | Mechanism |
|-------|-----------|
| Engineering pages | `requireProductEntitlement()` / `assertCommercePolicyForPage()` in layout |
| Engineering API | `withEngineeringApi` → `enforceCommercePolicy()` |
| Engineering services | `assertVerifiedCommerceContext()` with `ENGINEERING_SERVICE_POLICIES` |
| Commerce admin API | `hasCommerceAdmin()` / `requireCommerceAdmin()` |
| Database | RLS on commerce tables — see [COMMERCE_RLS_AND_PERMISSIONS.md](../security/COMMERCE_RLS_AND_PERMISSIONS.md) |

UI visibility is not security.

## Known limitations (Phase 2)

- Cache is per-process; multi-instance deployments may serve stale allows up to TTL
- `usage_limit_exceeded` reason code exists but usage metering is not evaluated
- Implicit product resolution defaults to `engineering-os` when only `applicationKey` is provided
- Registry catalogue fallback (`catalogueFallback`) is display-only and never affects entitlement decisions
- No distributed cache or pub/sub invalidation

## Related docs

- [PLATFORM_COMMERCE_SUBSCRIPTIONS.md](./PLATFORM_COMMERCE_SUBSCRIPTIONS.md)
- [PLATFORM_COMMERCE_LICENSING.md](./PLATFORM_COMMERCE_LICENSING.md)
- [ENGINEERING_COMMERCE_ROUTE_ENFORCEMENT.md](../security/ENGINEERING_COMMERCE_ROUTE_ENFORCEMENT.md)
