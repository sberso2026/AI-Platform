# Customer Administration Access Control

## Overview

Phase 4 Customer Administration enforces access at three layers: sidebar visibility, middleware route guards, and API entitlement checks. Owner-only commerce routes are restricted separately from general admin routes.

## Role tiers

| Tier | Role slugs | Customer admin access |
|------|------------|------------------------|
| Viewer | `viewer` | `/my-account` only |
| Engineer | `member`, `engineer` | `/my-account` only |
| Manager | `engineering_manager`, `manager` | My Account + Users & Permissions, System Health, Audit Logs |
| Admin | `admin` | Full System Administration except owner-only routes |
| Owner | `owner` | Full System Administration including billing and Growth Credits |

Implementation: `resolveNavTier()`, `canAccessPlatformRoute()`, `canSeeNavItem()` in `packages/platform-core/src/nav-visibility.ts`.

## Owner-only routes

```typescript
OWNER_COMMERCE_ROUTES = [
  "/system/billing",
  "/system/subscription-billing",
  "/system/growth-credits",
  "/system/analytics",
]
```

Sidebar hides `subscription-billing` and `growth-credits` nav items when `roleSlug !== "owner"`.

API routes return `403 Owner access required` for non-owners even if commerce-admin entitlement passes.

## Admin commerce routes

Require admin nav tier **and** commerce admin entitlement via `requireCommerceAdmin()`:

- `/api/platform/administration/licenses-seats`
- `/api/platform/administration/installations/[id]/progress`
- Underlying `/api/platform/commerce/*` mutation routes

## Route matrix

| Route | Viewer | Engineer | Manager | Admin | Owner |
|-------|--------|----------|---------|-------|-------|
| `/my-account` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/system/products` | ✗ | ✗ | ✗ | ✓ | ✓ |
| `/system/subscription-billing` | ✗ | ✗ | ✗ | ✗ | ✓ |
| `/system/licenses-seats` | ✗ | ✗ | ✗ | ✓ | ✓ |
| `/system/usage` | ✗ | ✗ | ✗ | ✓ | ✓ |
| `/system/growth-credits` | ✗ | ✗ | ✗ | ✗ | ✓ |
| `/system/installations/*` | ✗ | ✗ | ✗ | ✓ | ✓ |
| `/platform/users-permissions` | ✗ | ✗ | ✓ | ✓ | ✓ |
| `/platform/health` | ✗ | ✗ | ✓ | ✓ | ✓ |
| `/platform/audit` | ✗ | ✗ | ✓ | ✓ | ✓ |
| `/platform/integrations` | ✗ | ✗ | ✗ | ✓ | ✓ |
| `/platform/settings` | ✗ | ✗ | ✗ | ✓ | ✓ |

Unauthorized direct URL access redirects to `/engineering` (middleware).

## Engineering product access

Opening Engineering OS (`/engineering/*`) requires product entitlement via `requireProductEntitlement()` — separate from administration route access. A viewer with a seat can use Engineering OS but cannot open `/system/products`.

## RLS and database

Growth Credits tables enforce tenant isolation:

- **SELECT** — `tenant_id = ANY(get_user_tenant_ids())`
- **WRITE** — same tenant scope + `has_permission('commerce', 'admin', tenant_id)`

Commerce and installation tables retain Phase 2–3 RLS policies. Administration APIs never bypass RLS; they use authenticated Supabase clients from `AuthContext`.

## Defense in depth checklist

1. Sidebar — `filterSidebarNavigation` + owner item filter
2. Middleware — `canAccessPlatformRoute`
3. API — session auth + role checks + `requireCommerceAdmin`
4. Entitlement engine — product/application access for runtime routes
5. RLS — tenant-scoped database reads/writes

## Related documentation

- [ROLE_BASED_NAVIGATION.md](./ROLE_BASED_NAVIGATION.md)
- [COMMERCE_RLS_AND_PERMISSIONS.md](./COMMERCE_RLS_AND_PERMISSIONS.md)
- [ENGINEERING_COMMERCE_ROUTE_ENFORCEMENT.md](./ENGINEERING_COMMERCE_ROUTE_ENFORCEMENT.md)
