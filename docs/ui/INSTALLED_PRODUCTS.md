# Installed Products

## Overview

The **Installed Products** page (`/system/products`) is the primary entry point for Phase 4 Customer Administration. It provides a commercially aware catalogue of RTB Operating Systems with separate subscription, licence, and installation status — sourced from live Commerce services via the catalog adapter.

Implementation: `apps/web/src/app/(platform)/system/products/page.tsx`

## Page structure

### Header

- **Title:** Installed Products
- **Subtitle:** Manage your RTB Operating Systems, applications, licences, workspaces, and access.
- **Actions:** Entitlement diagnose for Engineering OS
- **Search:** Client-side filter on product name, slug, and type

### Summary cards

Built by `buildProductCatalogSummary()` from live catalog products:

| Card | Source |
|------|--------|
| Installed Operating Systems | Installed tab count |
| Installed Applications | Active application installations |
| Assigned Seats | Seat pool assigned / total |
| Current Plan | Edition / plan name from commerce |
| Renewal Date | Primary installed product renewal |
| Installation Health | Aggregated health across installed products |

Health aggregation uses `normalizeHealthStatus()` — worst status wins (failed > degraded > warning > healthy).

### Tabs

Default tab: **Installed**

| Tab | Content |
|-----|---------|
| Installed | Tenant-owned products with active entitlement |
| Available | Purchasable or trial-eligible products |
| Trials | Trialing subscriptions |
| Coming Soon | Registered future products (reduced visual prominence) |

Tab counts from `filterProductsByTab()`.

## Data loading

| Request | Purpose |
|---------|---------|
| `GET /api/platform/commerce/catalog` | Product list and fallback flag |
| `GET /api/platform/nav-context` | Role for action gating |

When `catalogueFallback` is true, `CatalogueFallbackBanner` warns that registry fallback is in use.

## Product cards

Each card renders via `ProductCard`:

- Product name, type, description, edition
- Separate status chips: Subscription, Licence, Installation
- Version, seat usage, renewal date
- Installed application count
- Usage summary
- Primary and secondary actions (role-gated) — Open, Manage, Install, Subscribe

Action hrefs resolve through `commerce-adapter` (e.g. Manage → `/system/products/[slug]`, billing actions → owner routes).

### Engineering OS (installed)

| Field | Source |
|-------|--------|
| Edition | Commerce plan / manifest |
| Subscription | Live subscription status |
| Licence | Live licence status |
| Installation | Installation lifecycle status |
| Open | `/engineering` (entitlement required) |
| Manage | `/system/products/engineering-os` |

## Product detail

See [PRODUCT_DETAIL.md](./PRODUCT_DETAIL.md) for `/system/products/[productSlug]`.

## Installation progress

In-progress or failed installs link to `/system/installations/[installationId]` for customer workflow progress.

## Legacy redirect

`/operating-systems` redirects to `/system/products`.

## Components

| Component | Path |
|-----------|------|
| Product card | `apps/web/src/components/commerce/product-card.tsx` |
| Application card | `apps/web/src/components/commerce/application-card.tsx` |
| Status chips | `apps/web/src/components/commerce/commercial-status-chips.tsx` |
| Catalog tabs | `apps/web/src/components/commerce/product-catalog-tabs.tsx` |
| Admin shell | `apps/web/src/components/commerce/commerce-admin-shell.tsx` |

## Administration services

| Function | Module |
|----------|--------|
| `buildProductCatalogSummary` | `product-administration-service.ts` |
| `enrichProductAdministrationView` | `product-administration-service.ts` |
| `HEALTH_STATUS_LABELS` | `status-normalizers.ts` |

## Tests

- `packages/platform-core/src/commerce/commerce-adapter.test.ts`
- `packages/platform-core/src/navigation.test.ts`
- `packages/platform-core/src/nav-visibility.test.ts`
- E2E: `packages/installation-certification/playwright/installation.spec.ts`

## Related documentation

- [CUSTOMER_ADMINISTRATION_PORTAL.md](../architecture/CUSTOMER_ADMINISTRATION_PORTAL.md)
- [PRODUCT_DETAIL.md](./PRODUCT_DETAIL.md)
