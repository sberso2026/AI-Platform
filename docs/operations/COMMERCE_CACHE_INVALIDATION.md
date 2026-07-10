# Commerce Cache Invalidation

Entitlement decisions are cached in-process to reduce database load. Phase 2 relies on explicit invalidation on mutations — there is no cross-instance broadcast.

## Implementation

`EntitlementCache` — `packages/platform-commerce/src/services/entitlement-cache.ts`

| Setting | Value |
|---------|-------|
| Default TTL | 30 seconds |
| Storage | Per-process `Map` |
| Key format | Sorted `key=value` pairs joined by `\|` |

## Cache policy on reads

| `cachePolicy` | Behaviour |
|---------------|-----------|
| `allow-short-cache` | Return cached decision if not expired (default for reads) |
| `fresh` | Always evaluate; still writes result to cache |

Route policies set `cachePolicy: "fresh"` on write operations (`projects.write`, `documents.write`, etc.).

## Invalidation triggers

`EntitlementCache.invalidateTenant(tenantId)` deletes all keys containing `tenantId={id}`.

| Mutation path | Invalidates cache | Bumps version |
|---------------|-------------------|---------------|
| `SubscriptionLifecycleService.transition()` | Yes | Yes (`commercial_entitlement_versions`) |
| `LicenseIssuanceService` issue/revoke/suspend | Yes | No* |
| `SeatAssignmentService` assign/remove/transfer | Yes | Yes |
| Scheduler `expireLicences` | Yes | No |
| `EntitlementService.invalidateTenant()` | Yes | No |

\*Version bump on licence paths is recommended but not universally wired — subscription and seat paths bump via `EntitlementVersionRepository`.

## Version stamp

`commercial_entitlement_versions.version` incremented by RPC `bump_commercial_entitlement_version`.

Clients may poll version to detect stale UI. Long-term: ETag on entitlement API responses.

## Multi-instance deployment

```
Instance A: user denied after revoke on Instance B
           └── may still see ALLOW for up to TTL (30s)
```

### Mitigations (Phase 2)

| Approach | Trade-off |
|----------|-----------|
| Accept 30s revocation lag | Simplest; document for support |
| Run all commerce mutations through single instance | Not practical |
| Reduce TTL | Higher DB load |
| Pass `cachePolicy: "fresh"` on sensitive reads | Per-request cost |
| Phase 3: Redis pub/sub invalidation | Not implemented |

## Manual invalidation

No public API to flush all caches. Options:

1. Redeploy / restart app instances (clears in-memory cache)
2. Wait for TTL expiry
3. Trigger any commerce mutation that calls `invalidateTenant` for the affected tenant

## Operational checklist

When user reports "still has access after revoke":

1. Confirm licence/subscription status in database
2. Check if request hit a different instance (load balancer)
3. Wait 30s and retest with hard refresh
4. Use Entitlement Diagnose with fresh evaluation (diagnose bypasses cache)
5. If persistent, check for `commercial_entitlement_overrides` allow row

## Testing

`entitlement-service.integration.test.ts` — cache hit/miss behaviour.

## Known limitations

- No negative caching distinction (denies cached same as allows within TTL)
- `invalidateAll()` exists but is not exposed via API
- Permanent allow decisions comment in `set()` is not enforced differently
- Cross-region replication lag on read replicas not addressed (service uses primary Supabase client)

## Related docs

- [PLATFORM_ENTITLEMENT_ENGINE.md](../architecture/PLATFORM_ENTITLEMENT_ENGINE.md)
- [COMMERCE_INCIDENT_RESPONSE.md](./COMMERCE_INCIDENT_RESPONSE.md)
