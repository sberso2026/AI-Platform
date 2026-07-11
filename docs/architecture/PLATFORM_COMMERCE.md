# Platform Commerce

Consolidated reference for the RTB Platform Commerce Engine and its integration with tenant-facing administration.

## Engine

Authoritative implementation: `@rtb/platform-commerce` (`packages/platform-commerce/`).

See detailed module documentation:

- [PLATFORM_COMMERCE_ENGINE.md](./PLATFORM_COMMERCE_ENGINE.md)
- [PLATFORM_COMMERCE_SUBSCRIPTIONS.md](./PLATFORM_COMMERCE_SUBSCRIPTIONS.md)
- [PLATFORM_COMMERCE_LICENSING.md](./PLATFORM_COMMERCE_LICENSING.md)
- [PLATFORM_COMMERCE_UI.md](./PLATFORM_COMMERCE_UI.md)

## Phases

| Phase | Deliverable |
|-------|-------------|
| Phase 2 | Commerce engine, tables, entitlement enforcement, legacy admin routes |
| Phase 3 | Installation lifecycle, provisioning, health checks |
| **Phase 4** | **Customer Administration Portal** — administration services, BFF APIs, System Administration UI |

## Phase 4 — Customer Administration integration

Phase 4 adds a **presentation and BFF layer** in `@rtb/platform-core/administration` without duplicating commerce business logic.

### Administration services

| Service | Maps from |
|---------|-----------|
| `product-administration-service` | Catalog adapter + health normalization |
| `subscription-administration-service` | `CommercialSubscription`, invoices, billing accounts |
| `licence-seat-administration-service` | `LicenseService`, `SeatService` |
| `usage-administration-service` | `UsageService` aggregates + allowance labels |
| `growth-credit-administration-service` | `GrowthCreditService` (Batch 33) |
| `installation-administration-service` | `InstallationLifecycleService` workflow steps |
| `my-account-administration-service` | Entitlement checks + personal usage |

### API surface split

| Layer | Prefix | Purpose |
|-------|--------|---------|
| Commerce (Phase 2) | `/api/platform/commerce/*` | CRUD, catalog, entitlements, usage |
| Administration (Phase 4) | `/api/platform/administration/*` | Customer view models, owner guards, progress mapping |

Pages prefer administration routes where view mapping or owner-only guards apply; catalog and usage reads may call commerce routes directly.

### Growth Credits (Batch 33)

New commerce module:

- Tables: `commercial_growth_credit_accounts`, `commercial_growth_credit_transactions`
- Service: `GrowthCreditService`
- UI: `/system/growth-credits` (owner only)
- Migration: `20260211000000_batch_33_growth_credits.sql`

### Data integrity principle

Phase 4 UI renders **only** records returned by commerce and installation services. Registry fallback (`CatalogueFallbackBanner`) is shown when live catalog is unavailable — never silent fabrication of subscription or licence state.

### Related Phase 4 docs

- [CUSTOMER_ADMINISTRATION_PORTAL.md](./CUSTOMER_ADMINISTRATION_PORTAL.md)
- [CUSTOMER_ADMINISTRATION_ACCESS.md](../security/CUSTOMER_ADMINISTRATION_ACCESS.md)
- [PHASE_4_CERTIFICATION.md](../testing/PHASE_4_CERTIFICATION.md)
