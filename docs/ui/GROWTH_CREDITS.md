# Growth Credits

## Route

`/system/growth-credits`

Implementation: `apps/web/src/app/(platform)/system/growth-credits/page.tsx`

## Audience

**Owner only** — same restrictions as Subscription & Billing.

## Purpose

Display the tenant Growth Credits programme balance and transaction ledger. Credits are earned through customer participation activities — **not** cash, shares, or investments.

## API

`GET /api/platform/administration/growth-credits`

Guards: owner role + `requireCommerceAdmin`.

Services:

- `ctx.commerce.growthCredits.getAccount`
- `ctx.commerce.growthCredits.listTransactions`
- `ctx.commerce.growthCredits.expiringSoonAmount` (30-day window)

Mapping: `mapGrowthCreditAccount`, `mapGrowthCreditTransactions`, `GROWTH_CREDIT_DISCLAIMERS`.

## Programme disclosure

Required disclaimers (rendered in amber disclosure card):

- Growth Credits are not shares, investments, or cash
- Growth Credits do not track RTB valuation
- Subject to expiry and programme terms

## Balance cards

| Metric | Source |
|--------|--------|
| Available balance | `availableBalance` |
| Reserved | `reservedBalance` |
| Expiring soon | Sum of earned credits expiring within 30 days |
| Lifetime earned | `lifetimeEarned` |
| Lifetime redeemed | `lifetimeRedeemed` |

## Transaction ledger

| Column | Field |
|--------|-------|
| Type | `transactionType` |
| Amount | `amount` |
| Source | `source` (e.g. `founding_customer`, `renewal`) |
| Description | `description` |
| Expires | `expiresAt` |
| Date | `createdAt` |

Transaction types: `earned`, `redeemed`, `reserved`, `released`, `expired`, `reversed`, `adjusted`.

## Schema

Migration: `supabase/migrations/20260211000000_batch_33_growth_credits.sql`

- `commercial_growth_credit_accounts` — unique per tenant
- `commercial_growth_credit_transactions` — append-only ledger
- RLS: read for tenant members; write requires `commerce.admin`

## Empty state

Zero balances and empty transaction table when no account activity — no seeded demo credits in production paths.

## Related documentation

- [PLATFORM_COMMERCE.md](../architecture/PLATFORM_COMMERCE.md) — Growth Credits integration
