# Role-Based Navigation

Batch **2.12** — navigation visibility by role tier.

## Tiers

| Tier | Role slugs | Platform Administration |
|------|------------|------------------------|
| Viewer | `viewer` | None (Engineering OS read-focused) |
| Engineer | `member`, `engineer` | None |
| Manager | `engineering_manager`, `manager` | Users & Permissions, System Health, Audit Logs |
| Admin | `owner`, `admin` | Full simplified Platform Administration |

## Engineering sections

| Section | Viewer | Engineer | Manager | Admin |
|---------|--------|----------|---------|-------|
| Engineering OS | Yes | Yes | Yes | Yes |
| Engineering Registers | Yes | Yes | Yes | Yes |
| Engineering Administration | If `engineering.admin` | If permitted | Yes (with permission) | Yes |

## Advanced Platform Tools

- **Not** visible to Viewer, Engineer, or Manager in sidebar
- **Admin only** — direct URL and hub page enforce `admin` tier in middleware
- Optional sidebar link when `showAdvancedPlatformTools` is enabled

## Defense in depth

1. **Sidebar** — `filterSidebarNavigation` hides unauthorized items
2. **Middleware** — `canAccessPlatformRoute` redirects unauthorized direct URLs to `/engineering`
3. **Search** — `shouldIncludePlatformSearchResults` excludes knowledge graph for non-admins

## APIs

- `GET /api/platform/nav-context` — role slug, tier, permissions, advanced sidebar flag

## Types

- `NavTier` on `NavItem.audience` in `@rtb/types`
- `sidebarHidden: true` for routes that exist but are not listed in sidebar

## Phase 4 — Customer Administration routes

### My Account

`/my-account` is available to **all authenticated users** (viewer tier minimum). It is not part of System Administration sidebar filtering.

### Owner-only commerce UI

These routes require `roleSlug === "owner"` in addition to admin tier:

- `/system/subscription-billing`
- `/system/growth-credits`
- `/system/billing` (legacy)
- `/system/analytics` (legacy)

Sidebar: `canSeeNavItem` hides `subscription-billing` and `growth-credits` for non-owners.

API: administration routes return `403 Owner access required` for admins attempting billing or Growth Credits reads.

### Admin commerce UI

Require admin tier (`canAccessPlatformRoute`):

- `/system/products` and sub-routes
- `/system/licenses-seats`, `/system/usage`
- `/system/installations/*`, `/system/applications/*`

### Route constants

`PLATFORM_ADMIN_ROUTES`, `OWNER_COMMERCE_ROUTES`, and `MY_ACCOUNT_ROUTE` in `nav-visibility.ts`.

See [CUSTOMER_ADMINISTRATION_ACCESS.md](./CUSTOMER_ADMINISTRATION_ACCESS.md) for full access matrix.
