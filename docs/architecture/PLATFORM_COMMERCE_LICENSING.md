# Platform Commerce — Licensing

Licences materialize plan entitlements into tenant-scoped grants. The entitlement engine evaluates licences after subscription state and before seat assignment.

## Domain model

### `CommercialLicense`

Table: `commercial_licenses`.

| Field | Purpose |
|-------|---------|
| `license_type` | `product`, `application`, `feature`, `workspace`, `named_user`, `seat_pool`, `floating` |
| `status` | `pending`, `active`, `expiring_soon`, `expired`, `suspended`, `revoked`, `cancelled` |
| `product_id` | Parent product |
| `application_key` | For `application` licences |
| `feature_key` | For `feature` licences |
| `workspace_id` | Optional workspace scope |
| `subscription_id` | Owning subscription |
| `max_seats` | Seat cap on product licence |
| `valid_from`, `valid_until`, `expires_at` | Validity window |
| `issued_at`, `issued_by`, `revoked_by`, `revocation_reason` | Provenance |

### Catalogue entitlements

Plan definitions use `commercial_plan_entitlements`:

| `entitlement_type` | `entitlement_key` example | Effect |
|--------------------|---------------------------|--------|
| `product_access` | `engineering-os` | Product-level grant |
| `application_access` | `project_intelligence` | Application licence issued |
| `feature_access` | `ai_ocr` | Feature licence issued |
| `seat_limit` | `default` | Seat pool size (`integer_value`) |

Catalogue tables: `commercial_features`, `commercial_product_applications`, `commercial_application_features`.

## Services

| Service | Responsibility |
|---------|----------------|
| `LicenseService` | List, create, revoke, suspend, expiry queries |
| `LicenseIssuanceService` | Issue licences from plan entitlements; emit events; invalidate cache |

### Issuance flow

`LicenseIssuanceService.issueForSubscription()`:

1. Creates `product` licence (with optional `max_seats`)
2. Reads `commercial_plan_entitlements` for the plan
3. Issues `application` and `feature` licences per plan rows
4. Upserts seat pool when `seat_limit` entitlement present
5. Emits `licence.issued` per licence
6. Calls `EntitlementCache.invalidateTenant()`

### Revocation / suspension

```typescript
await commerce.licenceIssuance.revoke(tenantId, licenceId, revokedBy, reason);
await commerce.licenceIssuance.suspend(tenantId, licenceId, actorUserId);
```

Both emit outbox events (`licence.revoked`, `licence.suspended`) and invalidate cache.

## Entitlement evaluation

`EntitlementService` licence rules:

| Check level | Rule |
|-------------|------|
| Product access | Active `product` licence required |
| Application access | `application` licence **or** plan `application_access` entitlement; workspace must match when scoped |
| Feature access | `feature` licence **or** plan `feature_access` entitlement |
| Seat | Required when `max_seats > 0` or licence type is not `feature` |

Active licence statuses: `active`, `expiring_soon`.

Denied reason codes: `licence_not_found`, `licence_expired`, `licence_revoked`, `application_not_in_plan`, `feature_not_enabled`, `workspace_not_entitled`.

## Scheduler integration

| Job | Licence behaviour |
|-----|-------------------|
| `expireLicences` | Transitions due licences to `expired`; emits `licence.expired` |
| `detectExpiringLicences` | Emits `licence.expiring_soon` with idempotency key |

## API routes

| Route | Methods |
|-------|---------|
| `/api/platform/commerce/licenses` | GET |
| `/api/platform/commerce/licenses/issue` | POST |
| `/api/platform/commerce/licenses/[id]` | GET |
| `/api/platform/commerce/licenses/[id]/revoke` | POST |
| `/api/platform/commerce/licenses/[id]/suspend` | POST |

UI: `/system/licenses` — see [LICENSES_AND_SEATS.md](../ui/LICENSES_AND_SEATS.md).

## Known limitations (Phase 2)

- Usage limits (`usage_limit` column) are not enforced in `EntitlementService`
- `expiring_soon` status is not automatically set by scheduler (warnings only)
- Floating / named-user licence types exist in schema but have no assignment workflow
- Plan downgrade licence reconciliation is partial — review seat counts after downgrade
- Workspace licences require explicit `workspace_id` on licence row

## Related docs

- [PLATFORM_ENTITLEMENT_ENGINE.md](./PLATFORM_ENTITLEMENT_ENGINE.md)
- [COMMERCE_EVENTS.md](./COMMERCE_EVENTS.md)
- [COMMERCE_RLS_AND_PERMISSIONS.md](../security/COMMERCE_RLS_AND_PERMISSIONS.md)
