# System Administration

## Overview

The sidebar section formerly labelled **Platform Administration** is now **System Administration**. It provides tenant-level administration for products, commerce, workspaces, users, integrations, health, audit, and settings.

## Navigation items

| Item | Route | Audience |
|------|-------|----------|
| Installed Products | `/system/products` | Admin |
| Subscription & Billing | `/system/subscription-billing` | Owner only |
| Licences & Seats | `/system/licenses-seats` | Admin |
| Usage | `/system/usage` | Admin |
| Growth Credits | `/system/growth-credits` | Owner only |
| Workspaces | `/workspaces` | Admin |
| Users & Permissions | `/platform/users-permissions` | Manager+ |
| Integrations | `/platform/integrations` | Admin |
| System Health | `/platform/health` | Manager+ |
| Audit Logs | `/platform/audit` | Manager+ |
| Settings | `/platform/settings` | Admin |

## Visibility by role

| Role | Visible items |
|------|---------------|
| Viewer / engineer | None (Engineering OS nav only) |
| Engineering manager | Users & Permissions, System Health, Audit Logs |
| Tenant admin | All except owner-only commerce routes |
| Owner | Full System Administration |

## Not exposed

Internal platform services (AI Director, agents, kernel routes, feature flags, etc.) remain under **Advanced Platform Tools** and are not listed in System Administration.

## Configuration

Navigation is defined in:

- `packages/platform-core/src/navigation.ts` — `PLATFORM_NAVIGATION`, `SIDEBAR_SECTIONS`
- `packages/platform-core/src/nav-visibility.ts` — route and item access rules

## Sidebar persistence

Section id `platform_admin` is unchanged to preserve `sessionStorage` group collapse state (`rtb.sidebar.groupState`).

## Legacy routes

| Legacy | Behaviour |
|--------|-----------|
| `/operating-systems` | Redirects to `/system/products` |

## Phase 4 — Customer Administration Portal

Phase 4 connects System Administration items to real Commerce and Installation Lifecycle services. Placeholder shells are replaced with data-backed pages and dedicated administration API routes.

### Data-backed pages

| Item | API / service source |
|------|---------------------|
| Installed Products | `/api/platform/commerce/catalog` + `buildProductCatalogSummary` |
| Subscription & Billing | `/api/platform/administration/subscription-billing` |
| Licences & Seats | `/api/platform/administration/licenses-seats` |
| Usage | `/api/platform/commerce/usage` + `mapUsageMetrics` |
| Growth Credits | `/api/platform/administration/growth-credits` |

### Additional routes (not in sidebar)

| Route | Purpose |
|-------|---------|
| `/my-account` | All authenticated users — assigned products and usage |
| `/system/installations/[id]` | Installation workflow progress |
| `/system/applications/[slug]/install` | Application install entry |

### Legacy sidebar-hidden routes

Still reachable for bookmarks and diagnostics:

- `/system/subscriptions`, `/system/licenses`, `/system/seats`, `/system/billing`
- `/system/marketplace`, `/system/analytics`, `/system/customers`, `/system/commerce-audit`

Defined in `LEGACY_PLATFORM_NAVIGATION` in `navigation.ts`.

### Architecture reference

- [CUSTOMER_ADMINISTRATION_PORTAL.md](../architecture/CUSTOMER_ADMINISTRATION_PORTAL.md)
- Per-page UI docs under `docs/ui/` (INSTALLED_PRODUCTS, PRODUCT_DETAIL, SUBSCRIPTION_BILLING, etc.)
