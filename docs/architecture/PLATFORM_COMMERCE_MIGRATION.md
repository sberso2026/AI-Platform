# Platform Commerce Engine — Migration Notes

## Batch 30 — `20260208000000_batch_30_commerce_*`

### New migrations

1. `20260208000000_batch_30_commerce_tables.sql` — 24 commerce tables
2. `20260208000001_batch_30_commerce_rls.sql` — RLS policies
3. `20260208000002_batch_30_commerce_seed.sql` — global catalog seed

### Apply

```bash
pnpm db:migrate
pnpm db:types
```

### New package

- `@rtb/platform-commerce` added to workspace
- Wired into `apps/web/src/lib/kernel.ts` as `ctx.commerce`

### Navigation changes

System Administration expanded with commerce modules:

| Route | Page |
|-------|------|
| `/system/products` | Products catalogue |
| `/system/subscriptions` | Subscriptions |
| `/system/licenses` | Licences |
| `/system/seats` | Seats |
| `/system/usage` | Usage |
| `/system/billing` | Billing (owner) |
| `/system/marketplace` | Marketplace |
| `/system/growth-credits` | Growth (owner) |
| `/system/analytics` | Analytics (owner) |
| `/system/customers` | Customers |

### Legacy redirects

| Old route | Redirects to |
|-----------|--------------|
| `/operating-systems` | `/system/products` |
| `/system/subscription-billing` | `/system/billing` |
| `/system/licenses-seats` | `/system/licenses` |

### Permissions

Commerce write operations require `commerce:admin` permission in RLS. Add to owner/admin roles:

```json
{ "resource": "commerce", "action": "admin" }
```

### Breaking changes

None. Registry-backed UI adapter remains fallback when commerce tables are unavailable.

### Post-migration provisioning

For existing tenants, provision subscriptions/installations via:

```typescript
await commerce.subscriptions.create({ tenantId, productId, planId });
await commerce.installations.installProduct({ tenantId, productId });
await commerce.seats.upsertPool({ tenantId, productId, totalSeats: 25 });
```

### Future work

- Stripe / Xero provider adapters
- Growth Engine hook implementations
- Customer portal self-service flows
- Admin commerce portal for platform owner product publishing
- Webhook handlers for subscription lifecycle
