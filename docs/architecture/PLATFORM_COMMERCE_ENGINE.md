# RTB Platform Commerce Engine

## Overview

The **Platform Commerce Engine** (`@rtb/platform-commerce`) is a shared Platform Service inside RTB AI Platform. It is the single source of truth for:

- Product catalog and plans
- Subscriptions
- Licensing
- Seat management
- Product and application installations
- Usage metering
- Billing and invoices
- Marketplace listings

No RTB product (Engineering OS, Business OS, future products) may implement its own billing, subscriptions, licensing, usage metering, or seat management.

## Architecture

```
RTB AI Platform
├── Platform Services
│   ├── Identity
│   ├── Tenant Management
│   ├── Workspace Management
│   ├── Commerce Engine          ← @rtb/platform-commerce
│   ├── Growth Engine            ← extension hooks only
│   ├── AI Services
│   └── …
├── Products (dynamic)
└── Applications (dynamic)
```

## Package structure

```
packages/platform-commerce/
  src/
    platform-commerce.ts       # createPlatformCommerce() factory
    repositories/              # Data access layer (Supabase)
    services/                  # Business logic layer
    extensions/                # Growth / referral / partner hooks (interfaces)
```

## Modules

| Module | Service | Repository tables |
|--------|---------|-------------------|
| Product Catalog | `ProductService` | `commercial_products`, `commercial_categories`, `commercial_product_versions` |
| Plans | `PlanService` | `commercial_plans`, `commercial_plan_prices` |
| Subscriptions | `SubscriptionService` | `commercial_subscriptions`, `commercial_subscription_events` |
| Licensing | `LicenseService` | `commercial_licenses`, `commercial_license_assignments` |
| Seats | `SeatService` | `commercial_seats` |
| Installations | `InstallationService` | `commercial_installations`, `commercial_application_installations` |
| Usage | `UsageService` | `commercial_usage_types`, `commercial_usage_records` |
| Billing | `BillingService` | `commercial_billing_accounts`, `commercial_invoices`, `commercial_transactions` |
| Marketplace | `MarketplaceService` | `commercial_marketplace_products`, `commercial_publishers` |
| Analytics | `AnalyticsService` | Aggregates across commerce tables |
| Catalog UI adapter | `CatalogDataService` | Feeds `PlatformCommerceData` to UI adapter |

## API surface

All UI and products consume commerce via typed services — never direct table access.

Web API routes: `/api/platform/commerce/*`

| Route | Methods |
|-------|---------|
| `/catalog` | GET — tenant catalogue view models |
| `/products` | GET — global product catalog |
| `/subscriptions` | GET, POST |
| `/licenses` | GET |
| `/seats` | GET |
| `/usage` | GET |
| `/billing` | GET |
| `/marketplace` | GET |
| `/analytics` | GET |

## Extension hooks (not implemented)

Reserved for future Growth Engine integration:

- `GrowthEngineHook` — subscription and usage events
- `ReferralEngineHook` — tenant signup referrals
- `PartnerCommissionHook` — invoice paid events

Register via `commerceExtensions.register({ growth: … })`.

## Tenant isolation

- All tenant-scoped tables include `tenant_id`
- RLS policies enforce `get_user_tenant_ids()` for reads
- Writes require `has_permission('commerce', 'admin', tenant_id)`
- Global catalog tables (`commercial_products` where `tenant_id IS NULL`) are read-only for tenants

## UI integration

- System Administration pages under `/system/*`
- UI adapter in `@rtb/platform-core/commerce` maps engine data to view models
- Reusable components: `CommerceAdminShell`, `CommerceDataTable`, `ProductCard`

## Billing providers

Provider enum reserved: `stripe`, `xero`, `manual`, `purchase_order`. Integration not implemented in this batch.
