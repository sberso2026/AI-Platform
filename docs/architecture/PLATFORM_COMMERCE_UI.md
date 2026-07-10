# Platform Commerce UI Architecture

## Purpose

The Platform Commerce UI layer presents commercially aware product and application management without binding UI components directly to the legacy OS registry shape. It prepares the tenant administration experience for future Platform Commerce backend tables.

## Adapter layer

Location: `packages/platform-core/src/commerce/`

| Module | Responsibility |
|--------|----------------|
| `commerce-types.ts` | View models and future table contracts |
| `commerce-adapter.ts` | Registry → view model mapping, tab logic, access helpers |

### Future table contracts

The adapter accepts optional `PlatformCommerceData` with:

- `commercial_products`
- `commercial_plans`
- `commercial_subscriptions`
- `commercial_licenses`
- `product_installations`
- `application_installations`
- `commercial_seat_pools`
- `commercial_usage_aggregates`

When these records are supplied, `mapRegistryToCommercialProducts()` maps from commerce tables instead of the static OS registry.

### Current data sources

Until Platform Commerce is live:

| Field | Source |
|-------|--------|
| Product catalogue | `OPERATING_SYSTEMS` registry |
| Engineering OS edition/version | `ENGINEERING_OS_MANIFEST` + adapter context |
| Applications | `ENGINEERING_APPLICATIONS` via web context builder |
| Subscription/licence/installation | Seeded placeholders for installed Engineering OS |
| Seat usage | Adapter context placeholder |

## UI routes

| Route | Purpose |
|-------|---------|
| `/system/products` | Installed Products catalogue (tabbed) |
| `/system/products/[productSlug]` | Product detail and application management |
| `/system/subscription-billing` | Billing shell (owner) |
| `/system/licenses-seats` | Licence and seat shell |
| `/system/usage` | Usage shell |
| `/system/growth-credits` | Growth credits shell (owner) |
| `/operating-systems` | Legacy redirect → `/system/products` |

## Catalog tabs

| Tab | Rule |
|-----|------|
| Installed | Active entitlement + healthy/degraded installation |
| Available | Commercially available, not yet installed |
| Trials | Trialing subscription |
| Coming Soon | Registered but not commercially available |

## Access control

| Role | Products | Billing | Licences | Seats | Applications |
|------|----------|---------|----------|-------|--------------|
| Viewer / engineer | Assigned product access via Engineering OS | No | No | No | Open only |
| Tenant admin (`admin`) | Manage products | No | No | Yes | Install/manage |
| Owner | Full | Yes | Yes | Yes | Full |

Navigation hides owner-only items (`Subscription & Billing`, `Growth Credits`) from tenant admins.

## Engineering OS compatibility

- `/engineering` remains the product entry point
- Registry data is preserved; internal `platform` OS is excluded from tenant catalogue cards
- No live billing provider integration in this batch
