# Licences & Seats

## Route

`/system/licenses-seats`

Implementation: `apps/web/src/app/(platform)/system/licenses-seats/page.tsx`

## Purpose

Unified administration of product/application licences and seat pools. Data is loaded from certified Commerce `LicenseService` and `SeatService` — merged into `LicenceSeatPoolView` rows for display.

## API

`GET /api/platform/administration/licenses-seats`

Guard: `requireCommerceAdmin(ctx)` (admin-tier commerce entitlement).

Services:

- `ctx.commerce.licenses.listByTenant`
- `ctx.commerce.seats.listByTenant`
- `ctx.commerce.products.listCatalog`

Mapping: `mapLicenceSeatPools()` in `licence-seat-administration-service.ts`.

## Pool table columns

| Column | Description |
|--------|-------------|
| Product | Product name or truncated ID |
| Seat type | Pool name or `Licence` for licence-only rows |
| Licence | Status chip (`active`, `suspended`, `expired`) |
| Seats | `assignedSeats / seatLimit` |
| Available | Remaining seats |
| Valid until | Licence expiry when applicable |

### Row sources

1. **Seat pools** — from `commercial_seat_pools` with assigned/total counts
2. **Licences** — product and application licences appended with seat metadata from licence record

## Actions

- **Issue licence** — `LicenseIssueDialog` (uses certified commerce issue flow; refreshes table on success)
- Seat assignment and removal use existing Commerce seat APIs; removing a seat revokes access immediately

## Legacy routes

| Legacy | Behaviour |
|--------|-----------|
| `/system/licenses` | Full licence admin (issue/revoke/suspend) — sidebar hidden |
| `/system/seats` | Seat assignment admin — sidebar hidden |
| `/system/licenses-seats` | Phase 4 consolidated read-focused portal page |

## Access

Admin tier (`canAccessPlatformRoute`). Not visible to viewers or engineers.

## Related documentation

- [LICENSES_AND_SEATS.md](./LICENSES_AND_SEATS.md) — legacy detailed licence admin UI
- [PLATFORM_COMMERCE_LICENSING.md](../architecture/PLATFORM_COMMERCE_LICENSING.md)
