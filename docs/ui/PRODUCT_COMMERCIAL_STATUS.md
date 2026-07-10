# Product Commercial Status UI

How installed products display commercial state in the System Administration catalogue.

## Route

`/system/products` (Installed Products)

Implementation: `apps/web/src/app/(platform)/system/products/page.tsx`

Adapter: `@rtb/platform-core/commerce` — `CatalogDataService` feeds `PlatformCommerceData` when commerce tables are available.

## Commercial status signals

Each `CommercialProductView` aggregates:

| Field | Source | Display |
|-------|--------|---------|
| `subscriptionStatus` | `commercial_subscriptions.status` | Tab placement, badges |
| `installationStatus` | `commercial_installations` | Installed vs available |
| `licenceSummary` | `commercial_licenses` counts | Product detail |
| `seatUsage` | `commercial_seats` assigned/total | Metrics on card |
| `trialEndsAt` | Subscription trial fields | Trials tab |
| `catalogueFallback` | Adapter flag | Warning banner |

## Catalogue tabs

Logic: `filterProductsByTab()` in `@rtb/platform-core`.

| Tab | Rule |
|-----|------|
| **Installed** | Active entitlement + healthy/degraded installation |
| **Available** | Commercially available, not yet installed |
| **Trials** | `trialing` subscription |
| **Coming Soon** | Registered but not commercially available (`lifecycle_status` draft/preview without subscription) |

Tab counts shown in `ProductCatalogTabs`.

## Fallback mode

When commerce API cannot supply live data, `catalogueFallback: true` and `CatalogueFallbackBanner` displays.

| Fallback source | Data |
|-----------------|------|
| `OPERATING_SYSTEMS` registry | Product names, slugs |
| `ENGINEERING_OS_MANIFEST` | Edition/version |
| Seeded placeholders | Subscription/licence display |

**Fallback never grants access** — entitlement enforcement always uses `@rtb/platform-commerce` tables.

## Product detail

`/system/products/[productSlug]`:

- Loads licences and subscriptions per product
- Maps application list from active application licences
- Shows commercial status alongside installation controls

## Summary metrics

`buildCatalogSummary()` provides:

- Installed product count
- Active subscriptions
- Trial count
- Seat utilization aggregate

Displayed via `MetricCard` components on catalogue page.

## Access control

| Role | View catalogue | Install/manage |
|------|----------------|----------------|
| Viewer / engineer | Assigned products via entitlement | Open apps only |
| Tenant admin | All tenant products | Install, manage apps |
| Owner | Full | Full + billing |

Owner-only nav items (Billing, Growth Credits) hidden from tenant admins per [PLATFORM_COMMERCE_UI.md](../architecture/PLATFORM_COMMERCE_UI.md).

## Entitlement diagnose

`EntitlementDiagnoseButton` on catalogue page — validates live entitlement path for `engineering-os` independent of display fallback.

## Operational checks

1. Open `/system/products` — confirm no `CatalogueFallbackBanner` in production
2. Engineering OS appears under **Installed** with `active` subscription
3. Trials tab populates when `TrialService.startTrial()` used
4. Product detail shows application licences matching plan entitlements

## Known limitations

- Commercial status on cards may lag cache TTL for seat counts
- Non-Engineering products show limited commercial metadata until provisioned
- `coming_soon` detection depends on catalogue seed + lifecycle_status
- No inline subscription purchase — provisioning is admin-driven in Phase 2

## Related docs

- [PLATFORM_COMMERCE_UI.md](../architecture/PLATFORM_COMMERCE_UI.md)
- [INSTALLED_PRODUCTS.md](./INSTALLED_PRODUCTS.md)
- [SUBSCRIPTIONS_ADMIN.md](./SUBSCRIPTIONS_ADMIN.md)
