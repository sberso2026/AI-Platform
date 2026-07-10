# Licences and Seats Admin UI

System Administration pages for licence provisioning and seat pool management.

## Routes

| Route | Purpose |
|-------|---------|
| `/system/licenses` | Licence list, filters, issue/revoke/suspend |
| `/system/seats` | Seat pools, assignments, transfer |
| `/system/licenses-seats` | Legacy redirect → `/system/licenses` |

## Access control

| Role | Licences | Seats |
|------|----------|-------|
| Owner | Full | Full |
| Tenant admin | `commerce:manage_licences` | `commerce:manage_seats` |
| Member / viewer | No | No |

## Licences page

Implementation: `apps/web/src/app/(platform)/system/licenses/page.tsx`

### Data sources

| Endpoint | Purpose |
|----------|---------|
| `GET /api/platform/commerce/licenses` | Tenant licence list |
| `GET /api/platform/commerce/subscriptions` | Subscription picker for issue dialog |
| `GET /api/platform/commerce/products` | Product name resolution |
| `POST /api/platform/commerce/licenses/issue` | Manual issuance |
| `POST /api/platform/commerce/licenses/[id]/revoke` | Revoke |
| `POST /api/platform/commerce/licenses/[id]/suspend` | Suspend |

### Filters

- Status: all, active, suspended, revoked, expired
- Type: product, application, feature, workspace
- Product dropdown
- Workspace dropdown (derived from licence rows)

### Table columns

Type, status, product/application, workspace, max seats, row actions (`LicenseRowActions`).

### Issue dialog

`LicenseIssueDialog` — selects subscription and product; calls `LicenseIssuanceService.issueForSubscription()` via API.

## Seats page

Implementation: `apps/web/src/app/(platform)/system/seats/page.tsx`

### Data sources

| Endpoint | Purpose |
|----------|---------|
| `GET /api/platform/commerce/seats` | Seat pools |
| `POST /api/platform/commerce/seats/assign` | Assign seat |
| `POST /api/platform/commerce/seats/remove` | Remove assignment |
| `POST /api/platform/commerce/seats/transfer` | Transfer between users |

### Table columns

Pool name, assigned count, total seats, available (computed), manage action.

### Pool management

Expanding a row shows `SeatPoolActions`:

- List current assignments
- Assign user to pool
- Remove / transfer seats

Backed by `SeatAssignmentService` — enforces pool capacity, active subscription, and active product licence.

## Side effects

All licence and seat mutations:

1. Emit commerce outbox events (`licence.*`, `seat.*`)
2. Invalidate entitlement cache for tenant
3. Bump `commercial_entitlement_versions` (seat paths)

Users may need to wait up to cache TTL (30s) or refresh session on other instances.

## Operational procedures

### Onboard new team member

1. Confirm active subscription and product licence
2. Open `/system/seats` → Manage pool → Assign user
3. Verify with Entitlement Diagnose or Engineering OS access

### Revoke application access

1. `/system/licenses` → filter by application type
2. Suspend or revoke application licence
3. Confirm user denied on next Engineering OS request (fresh cache policy on writes)

### Seat limit increase

1. Update plan or issue product licence with higher `max_seats`
2. Upsert seat pool `total_seats` via API or re-issue with new `seat_limit` entitlement
3. Assign additional users

## Known limitations

- No bulk seat import UI
- No visual seat usage history
- Workspace-scoped licence filter shows raw workspace ID prefix
- Transfer requires sequential remove+assign (brief unassignment window)
- Feature licences do not require seats but may still appear in licence list

## Related docs

- [PLATFORM_COMMERCE_LICENSING.md](../architecture/PLATFORM_COMMERCE_LICENSING.md)
- [SUBSCRIPTIONS_ADMIN.md](./SUBSCRIPTIONS_ADMIN.md)
- [COMMERCE_CACHE_INVALIDATION.md](../operations/COMMERCE_CACHE_INVALIDATION.md)
