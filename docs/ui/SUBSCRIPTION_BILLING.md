# Subscription & Billing

## Route

`/system/subscription-billing`

Implementation: `apps/web/src/app/(platform)/system/subscription-billing/page.tsx`

## Audience

**Owner only.** Hidden from tenant admins in sidebar and blocked at API layer (`403 Owner access required`).

## Purpose

Consolidated view of tenant subscriptions, billing accounts, and invoice history sourced from `@rtb/platform-commerce` — not static placeholders.

## API

`GET /api/platform/administration/subscription-billing`

Guards:

1. Authenticated session
2. `roleSlug === "owner"`
3. `requireCommerceAdmin(ctx)` — commerce entitlement for admin operations

Services called:

- `ctx.commerce.subscriptions.listByTenant`
- `ctx.commerce.billing.listAccounts`
- `ctx.commerce.billing.listInvoices`
- `ctx.commerce.products.listCatalog` (product name/slug resolution)

View mapping: `mapSubscriptionBillingViews`, `mapInvoiceAdministrationViews` in `@rtb/platform-core`.

## Page sections

### Summary cards

- **Active subscriptions** — count from live subscription records
- **Billing providers** — informational (Manual enterprise invoicing, Xero, Stripe, future providers)

### Subscriptions table

| Column | Source field |
|--------|--------------|
| Product | `productName` |
| Plan | `planName` |
| Interval | `billingInterval` |
| Status | `billingStatus` (mapped from subscription status) |
| Renewal | `renewalDate` |
| Contract value | `contractValueCents` + `currency` (owner-only) |

Subscription status mapping: `trial` → `trialing`; `active`, `grace_period`, `pending_renewal` → `active`; `pending_payment`, `paused` → `past_due`; `cancelled` → `cancelled`.

### Invoice history

| Column | Source |
|--------|--------|
| Invoice | `invoiceNumber` |
| Status | Invoice status |
| Total | `totalCents` / `currency` |
| Due | `dueAt` |
| Provider | `provider` |

Empty states display when no records exist — no sample rows.

## Legacy route

`/system/subscriptions` remains available for entitlement diagnostics and legacy bookmarks. System Administration sidebar uses `/system/subscription-billing` as the primary billing entry.

## Related documentation

- [PLATFORM_COMMERCE_SUBSCRIPTIONS.md](../architecture/PLATFORM_COMMERCE_SUBSCRIPTIONS.md)
- [CUSTOMER_ADMINISTRATION_ACCESS.md](../security/CUSTOMER_ADMINISTRATION_ACCESS.md)
