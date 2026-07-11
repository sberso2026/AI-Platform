# Customer Administration Portal (Phase 4)

## Purpose

Phase 4 delivers a **tenant-facing Customer Administration Portal** under the **System Administration** sidebar. It replaces placeholder shells with read paths backed by real Commerce and Installation Lifecycle services. No fabricated subscription, licence, installation, or usage state is rendered in production paths.

The portal is the operational home for tenant owners and administrators to manage products, commerce, workspaces, and access without exposing platform kernel internals.

## Architecture

```
apps/web (Next.js)
├── (platform)/system/*          Customer admin pages
├── (platform)/my-account        End-user account view
└── api/platform/administration/*  Administration BFF routes

packages/platform-core/src/administration/
├── administration-types.ts       View models
├── product-administration-service.ts
├── installation-administration-service.ts
├── subscription-administration-service.ts
├── licence-seat-administration-service.ts
├── usage-administration-service.ts
├── growth-credit-administration-service.ts
├── my-account-administration-service.ts
├── workspace-product-administration-service.ts
└── status-normalizers.ts

packages/platform-commerce/       Authoritative data & services
packages/platform-core/src/commerce/   Catalog adapter (Phase 2–3)
```

### Data flow

1. **Pages** fetch tenant-scoped JSON from `/api/platform/administration/*` or certified `/api/platform/commerce/*` routes.
2. **Administration API routes** authenticate via `getAuthContext()`, enforce role/commerce guards, and call `ctx.commerce.*` services.
3. **Administration services** in `@rtb/platform-core` map raw commerce records into customer-facing view models (health normalization, installation step translation, usage allowances).
4. **Persistence** remains in Commerce tables and Installation Lifecycle tables — administration layer does not duplicate business rules.

## System Administration navigation

Defined in `packages/platform-core/src/navigation.ts` → `PLATFORM_NAVIGATION`:

| Item | Route | Minimum access |
|------|-------|----------------|
| Installed Products | `/system/products` | Admin |
| Subscription & Billing | `/system/subscription-billing` | Owner |
| Licences & Seats | `/system/licenses-seats` | Admin |
| Usage | `/system/usage` | Admin |
| Growth Credits | `/system/growth-credits` | Owner |
| Workspaces | `/workspaces` | Admin |
| Users & Permissions | `/platform/users-permissions` | Manager |
| Integrations | `/platform/integrations` | Admin |
| System Health | `/platform/health` | Manager |
| Audit Logs | `/platform/audit` | Manager |
| Settings | `/platform/settings` | Admin |

Legacy commerce routes (`/system/subscriptions`, `/system/licenses`, `/system/billing`, etc.) remain reachable but are hidden from the sidebar via `LEGACY_PLATFORM_NAVIGATION`.

## Administration API routes

| Route | Method | Guard | Commerce services |
|-------|--------|-------|-------------------|
| `/api/platform/administration/subscription-billing` | GET | Owner + commerce admin | `subscriptions`, `billing` |
| `/api/platform/administration/licenses-seats` | GET | Commerce admin | `licenses`, `seats`, `products` |
| `/api/platform/administration/growth-credits` | GET | Owner + commerce admin | `growthCredits` |
| `/api/platform/administration/my-account` | GET | Authenticated | `entitlements`, `usage` |
| `/api/platform/administration/installations/[id]/progress` | GET | Commerce admin | `installations`, `installationLifecycle`, `installationHealth` |

Catalog, usage aggregates, and entitlement checks continue to use existing `/api/platform/commerce/*` endpoints.

## Customer pages

| Route | Documentation |
|-------|---------------|
| `/system/products` | [INSTALLED_PRODUCTS.md](../ui/INSTALLED_PRODUCTS.md) |
| `/system/products/[slug]` | [PRODUCT_DETAIL.md](../ui/PRODUCT_DETAIL.md) |
| `/system/products/[slug]/install` | Installation request UI (Phase 3) |
| `/system/installations/[id]` | Installation progress (customer step mapping) |
| `/system/applications/[slug]/install` | Application install entry |
| `/system/subscription-billing` | [SUBSCRIPTION_BILLING.md](../ui/SUBSCRIPTION_BILLING.md) |
| `/system/licenses-seats` | [LICENSES_SEATS.md](../ui/LICENSES_SEATS.md) |
| `/system/usage` | [USAGE_PORTAL.md](../ui/USAGE_PORTAL.md) |
| `/system/growth-credits` | [GROWTH_CREDITS.md](../ui/GROWTH_CREDITS.md) |
| `/my-account` | [MY_ACCOUNT.md](../ui/MY_ACCOUNT.md) |

Shared UI shell: `CommerceAdminShell`, `CommerceDataTable`, `MetricCard` (`@rtb/ui`).

## Installation progress mapping

Internal workflow steps from `InstallationLifecycleService` are translated to customer-readable steps via `CUSTOMER_INSTALLATION_STEP_DEFS` in `installation-administration-service.ts`. Future steps are never marked completed prematurely (see unit test `installation-administration.test.ts`).

Customer steps: Request received → Subscription verified → Licence verified → Dependencies validated → Provisioning queued/running → Artifacts validated → Workspace assignment → Health verification → Activation complete.

## Growth Credits schema

Migration `20260211000000_batch_33_growth_credits.sql`:

- `commercial_growth_credit_accounts` — one row per tenant (available, reserved, lifetime totals)
- `commercial_growth_credit_transactions` — immutable ledger (earned, redeemed, reserved, released, expired, reversed, adjusted)
- RLS: tenant read for members; write requires `commerce.admin` permission

Service: `GrowthCreditService` in `@rtb/platform-commerce`.

## Health status model

Customer health (`HealthStatus`) is distinct from installation state machine status. `normalizeHealthStatus()` combines installation status with optional health-check outcome to produce: `healthy`, `warning`, `degraded`, `failed`, or `suspended`.

## Related documentation

- [PLATFORM_COMMERCE.md](./PLATFORM_COMMERCE.md) — commerce engine and Phase 4 administration integration
- [INSTALLATION_LIFECYCLE.md](./INSTALLATION_LIFECYCLE.md) — installation services and Phase 4 progress UI
- [SYSTEM_ADMINISTRATION.md](../ui/SYSTEM_ADMINISTRATION.md) — sidebar and role visibility
- [CUSTOMER_ADMINISTRATION_ACCESS.md](../security/CUSTOMER_ADMINISTRATION_ACCESS.md) — access control
- [PHASE_4_CERTIFICATION.md](../testing/PHASE_4_CERTIFICATION.md) — certification gates
- [CUSTOMER_ADMINISTRATION_RUNBOOK.md](../operations/CUSTOMER_ADMINISTRATION_RUNBOOK.md) — operational procedures
