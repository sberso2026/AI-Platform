# Subscriptions Admin UI

System Administration page for tenant subscription lifecycle management.

## Route

`/system/subscriptions`

Implementation: `apps/web/src/app/(platform)/system/subscriptions/page.tsx`

## Access control

| Role | Access |
|------|--------|
| Owner | Full |
| Tenant admin (`admin`) with `commerce:manage_subscriptions` | Full |
| Member / viewer | Hidden in navigation |

API routes enforce `requireCommerceAdmin()` or equivalent commerce permissions.

## Data sources

| Endpoint | Purpose |
|----------|---------|
| `GET /api/platform/commerce/subscriptions` | List tenant subscriptions |
| `POST /api/platform/commerce/subscriptions/[id]/activate` | Convert trial / activate |
| `POST /api/platform/commerce/subscriptions/[id]/pause` | Pause |
| `POST /api/platform/commerce/subscriptions/[id]/resume` | Resume from paused |
| `POST /api/platform/commerce/subscriptions/[id]/suspend` | Suspend |

All lifecycle actions invoke `SubscriptionLifecycleService` in `@rtb/platform-commerce`.

## UI features

### Summary cards

Counts by status: Active, Trials, Suspended, Cancelled.

### Data table

| Column | Source field |
|--------|--------------|
| Product | `product_id` (truncated; product name resolution planned) |
| Status | `status` badge |
| Trial End | `trial_end` or `trial_ends_at` |
| Period End | `current_period_end` |
| Actions | Contextual lifecycle buttons |

### Actions by status

| Status | Available actions |
|--------|-------------------|
| `paused` | Resume |
| `active` | Pause, Suspend |
| `trialing` | Suspend, Convert (activate) |

### Entitlement diagnose

`EntitlementDiagnoseButton` with `productKey="engineering-os"` — calls entitlement diagnose API for troubleshooting access issues.

## Components

- `CommerceAdminShell` — layout, search, actions slot
- `CommerceDataTable` — sortable table shell
- `EntitlementDiagnoseButton` — step-by-step entitlement trace

## Operational notes

- Empty state directs admins to provision from Products catalogue (`/system/products`)
- Errors from API displayed inline (`json.error`)
- Search filters by status string or subscription ID substring
- No inline plan change UI — use subscription change API or Phase 3 billing flows

## Known limitations

- No create-subscription form on this page (provision via Products catalogue or API)
- Cancel and schedule-cancellation actions not exposed in UI (API available)
- Product column shows ID fragment, not product name
- No audit event timeline on detail view

## Related docs

- [PLATFORM_COMMERCE_SUBSCRIPTIONS.md](../architecture/PLATFORM_COMMERCE_SUBSCRIPTIONS.md)
- [LICENSES_AND_SEATS.md](./LICENSES_AND_SEATS.md)
- [PRODUCT_COMMERCIAL_STATUS.md](./PRODUCT_COMMERCIAL_STATUS.md)
