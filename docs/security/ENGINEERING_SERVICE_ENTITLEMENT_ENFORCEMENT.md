# Engineering Service Entitlement Enforcement

Defense-in-depth below HTTP route guards. Engineering OS services assert a **verified commerce execution context** before performing tenant mutations.

## Policy registry

`packages/platform-commerce/src/domain/engineering-service-policies.ts` → `ENGINEERING_SERVICE_POLICIES`.

Maps service entry points to `CommerceAccessPolicy`:

```typescript
"project.create": {
  productKey: "engineering-os",
  applicationKey: "project_intelligence",
  action: "project.create",
  seatRequired: true,
  cachePolicy: "fresh",
}
```

Coverage includes: `project.*`, `asset.*`, `document.*`, `decision.*`, `risk.*`, `issue.*`, `action.*`, `lesson.*`, `technical_query.*`, `company.*`, `discipline.*`, `search.query`, `dashboard.read`, `settings.*`, `application.list`, `demo.*`, `ai.execute`, `timeline.list`, `activity.list`.

## Assertion API

`packages/platform-commerce/src/domain/service-assertions.ts`:

```typescript
import { assertVerifiedCommerceContext } from "@rtb/platform-commerce";

assertVerifiedCommerceContext(commerce, ENGINEERING_SERVICE_POLICIES["project.create"]);
```

### Checks performed

1. `commerce.authorization` exists
2. HMAC signature valid and not expired (`verifyCommerceAuthorization`)
3. Tenant ID matches request tenant
4. `authorization.action` matches policy action
5. `applicationKey` / `featureKey` scope matches policy
6. `workspaceRequired` — workspace present when required
7. `seatRequired` — seat assigned when policy and authorization require it

Scheduler jobs may pass `allowScheduler: true` on policy to accept `actorType: "scheduler"` contexts created by `createSchedulerCommerceContext()`.

### Additional helpers

| Function | Purpose |
|----------|---------|
| `assertTenantMatch` | Tenant ID alignment |
| `assertWorkspaceMatch` | Workspace scope |
| `assertCommerceAction` | Action string match |
| `assertApplicationScope` | Application key match |
| `assertFeatureScope` | Feature key match |

Failures throw `CommerceDomainError` with HTTP-mappable status (403).

## Authorization creation

Route layer creates context after entitlement check:

```typescript
const commerce = createCommerceExecutionContext({
  tenantId: ctx.tenantId,
  workspaceId: ctx.workspaceId,
  actorUserId: ctx.userId,
  correlationId,
  decision: entitlementDecision,
  policy: apiPolicy,
});
```

`VerifiedCommerceAuthorization` fields:

- `decisionId`, `signatureOrInternalToken` (HMAC-SHA256)
- `validUntil` — 5 minutes from evaluation
- `seatRequired`, `seatAssigned` copied from entitlement decision

Secret: `COMMERCE_AUTH_SECRET` (defaults to dev secret — **must be set in production**).

## Recommended service pattern

```typescript
export async function createProject(
  commerce: CommerceExecutionContext,
  tenantId: string,
  input: CreateProjectInput
) {
  assertVerifiedCommerceContext(commerce, ENGINEERING_SERVICE_POLICIES["project.create"]);
  assertTenantMatch(commerce, tenantId);
  // ... domain logic
}
```

## Route vs service alignment

| Layer | Registry | Key format |
|-------|----------|------------|
| HTTP API | `ENGINEERING_API_POLICIES` | `{segment}.read` / `{segment}.write` |
| Service | `ENGINEERING_SERVICE_POLICIES` | `{entity}.{operation}` |

Action strings must match between route policy and service policy for the same operation. Mismatches cause `action_mismatch` errors at service boundary.

## Testing

- `service-assertions.test.ts` — tenant/action/seat/scheduler cases
- `commerce-execution-context.test.ts` — signature and expiry

## Known limitations

- Services not yet migrated may skip `assertVerifiedCommerceContext` — route guard is sole enforcement
- Scheduler context bypasses entitlement re-check; jobs must only run trusted lifecycle operations
- Authorization TTL (5 min) may expire on long-running requests
- No replay protection beyond signature + expiry (decisionId not stored server-side)

## Related docs

- [ENGINEERING_COMMERCE_ROUTE_ENFORCEMENT.md](./ENGINEERING_COMMERCE_ROUTE_ENFORCEMENT.md)
- [PLATFORM_ENTITLEMENT_ENGINE.md](../architecture/PLATFORM_ENTITLEMENT_ENGINE.md)
