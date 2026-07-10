# Engineering Commerce Route Enforcement

All `/api/engineering/*` routes and `/engineering/*` pages are protected via centralized commerce policies in `@rtb/platform-commerce`.

## Architecture

```
Request
  → getAuthContext()
  → getEngineeringApiPolicy(segment, method)   // or ENGINEERING_PAGE_POLICIES
  → enforceCommercePolicy()                    // EntitlementService.check()
  → createCommerceExecutionContext()             // signed authorization
  → route handler / page render
```

Implementation:

- API wrapper: `apps/web/src/lib/commerce/engineering-api.ts`
- Policy enforcement: `apps/web/src/lib/commerce/with-commerce-entitlement.ts`
- Page guards: `apps/web/src/lib/commerce/guards.ts`

## Policy registry

Defined in `@rtb/platform-commerce` → `ENGINEERING_API_POLICIES`, `ENGINEERING_PAGE_POLICIES`, `getEngineeringApiPolicy()`.

Each policy specifies:

| Field | Purpose |
|-------|---------|
| `productKey` | `engineering-os` |
| `applicationKey` | Application entitlement (when applicable) |
| `featureKey` | Feature entitlement (AI routes) |
| `action` | Granular action string matched in execution context |
| `seatRequired` | Require active seat assignment |
| `workspaceRequired` | Require workspace in auth context |
| `cachePolicy` | `fresh` for writes, `allow-short-cache` for reads |
| `hideResourceExistence` | Return 404 instead of 403 |

### API segment mapping

`resolveApiPolicyKey(segment, method)` → `{segment}.read` or `{segment}.write`.

Registered segments include: `health`, `dashboard`, `projects`, `documents`, `assets`, `companies`, `disciplines`, `decisions`, `risks`, `issues`, `actions`, `lessons`, `technical-queries`, `timeline`, `activity`, `search`, `ai`, `settings`, `applications`, `demo`.

Unregistered segments fall back to:

```typescript
{
  productKey: "engineering-os",
  action: `${segment}.${method.toLowerCase()}`,
  seatRequired: true,
  cachePolicy: write ? "fresh" : "allow-short-cache",
}
```

### Page routes

`ENGINEERING_PAGE_POLICIES` maps paths including:

| Route | Application / feature |
|-------|----------------------|
| `/engineering` | Product |
| `/engineering/projects` | `project_intelligence` |
| `/engineering/documents` | `documents` |
| `/engineering/ai` | `ai_assistant` feature |
| `/engineering/reports` | `project_intelligence` |
| `/engineering/project-controls` | `project_controls` |
| `/engineering/knowledge` | `knowledge` |
| … | See `commerce-access-policy.ts` |

Page layout calls `requireProductEntitlement()` or `assertCommercePolicyForPage()` with the matching policy.

## Denial responses

| Condition | HTTP | Body |
|-----------|------|------|
| Unauthenticated | `401` | `{ error: "Unauthorized" }` |
| Entitlement denied | `403` | `{ error: "Access denied", code: reasonCode }` |
| Seat not assigned | `403` | `{ error: "Seat not assigned", code: "seat_not_assigned" }` |
| Workspace required | `403` | `{ error: "Workspace required" }` |
| `hideResourceExistence` | `404` | `{ error: "Not found" }` |
| Commerce unavailable | `503` | `{ error: "Entitlement service unavailable" }` |
| Evaluation error | `500` | `{ error: "Entitlement evaluation failed" }` |

Pages redirect to `/access-denied?reason={code}` instead of JSON errors.

## Execution context propagation

Successful API checks produce `CommerceExecutionContext` passed to handlers:

```typescript
export const GET = withEngineeringApi("projects", async ({ ctx, commerce }, request) => {
  // commerce.authorization is signed, 5-minute TTL
});
```

Handlers should pass `commerce` to Engineering OS services for secondary assertion. See [ENGINEERING_SERVICE_ENTITLEMENT_ENFORCEMENT.md](./ENGINEERING_SERVICE_ENTITLEMENT_ENFORCEMENT.md).

## Validation

| Test | Location |
|------|----------|
| Policy registry completeness | `commerce-access-policy.test.ts` |
| Route coverage | `apps/web/src/__tests__/commerce-route-policy-coverage.test.ts` |
| HTTP route enforcement | `http-route-enforcement.test.ts` |

Registry fallback (`catalogueFallback: true`) is display-only and never grants access.

## Known limitations

- Fallback API policies grant engineering-os product access for unknown segments — new routes should register explicit policies
- Page path resolution in `guards.ts` uses prefix lists that may drift from `ENGINEERING_PAGE_POLICIES`
- No per-workspace route policies beyond application licence workspace_id check
- Execution context signature uses `COMMERCE_AUTH_SECRET` — must be rotated with care in production

## Related docs

- [PLATFORM_ENTITLEMENT_ENGINE.md](../architecture/PLATFORM_ENTITLEMENT_ENGINE.md)
- [ENGINEERING_SERVICE_ENTITLEMENT_ENFORCEMENT.md](./ENGINEERING_SERVICE_ENTITLEMENT_ENFORCEMENT.md)
