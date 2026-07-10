# Platform Commerce — Subscriptions

Phase 2 subscription lifecycle in `@rtb/platform-commerce`. Subscriptions are the tenant-scoped commercial contract for a product; access is granted only when status, dates, licences, and seats align with the entitlement engine.

## Domain model

### `CommercialSubscription`

Primary table: `commercial_subscriptions`.

| Field | Purpose |
|-------|---------|
| `tenant_id` | Tenant isolation |
| `product_id` | Product under contract |
| `plan_id` | Active commercial plan |
| `workspace_id` | Optional workspace scope |
| `status` | Lifecycle state (see [COMMERCE_STATE_TRANSITIONS.md](./COMMERCE_STATE_TRANSITIONS.md)) |
| `trial_start`, `trial_end`, `trial_ends_at` | Trial window |
| `current_period_start`, `current_period_end` | Billing period |
| `grace_period_end` | End of payment grace |
| `cancellation_requested_at`, `cancel_at_period_end`, `cancellation_effective_at` | Scheduled / effective cancellation |
| `paused_at`, `suspended_at`, `activated_at`, `expired_at` | Lifecycle timestamps |
| `plan_snapshot_json` | Immutable plan snapshot at activation |
| `metadata` | Provenance (`migration_legacy_access`, trial flags, etc.) |

### `CommercialSubscriptionEvent`

Table: `commercial_subscription_events` — **immutable** audit log.

Written by `SubscriptionLifecycleService.transition()` and `SubscriptionService.create()`. Rows cannot be updated or deleted (DB trigger `prevent_subscription_event_mutation`).

### `CommercialSubscriptionChange`

Table: `commercial_subscription_changes` — scheduled plan upgrades/downgrades.

Managed by `SubscriptionChangeService`. Applied by scheduler job `applyScheduledSubscriptionChanges`.

## Services

| Service | Responsibility |
|---------|----------------|
| `SubscriptionService` | CRUD, naive `changeStatus`, query helpers for scheduler |
| `SubscriptionLifecycleService` | Guarded transitions via `SubscriptionStateMachine` |
| `SubscriptionChangeService` | Plan upgrade/downgrade scheduling and application |
| `TrialService` | Trial eligibility, start, extend, expire |

### Lifecycle entry points

```typescript
await commerce.lifecycle.activate(tenantId, subscriptionId, actorUserId);
await commerce.lifecycle.pause(tenantId, subscriptionId, actorUserId, reason);
await commerce.lifecycle.resume(tenantId, subscriptionId, actorUserId);
await commerce.lifecycle.suspend(tenantId, subscriptionId, actorUserId, reason);
await commerce.lifecycle.scheduleCancellation(tenantId, subscriptionId, actorUserId, effectiveAt);
await commerce.lifecycle.cancel(tenantId, subscriptionId, actorUserId, reason);
await commerce.lifecycle.renew(tenantId, subscriptionId, actorUserId);
```

All lifecycle methods call `transition()`, which:

1. Asserts `SubscriptionStateMachine.canTransition(from, to)`
2. Patches subscription timestamps
3. Records immutable `commercial_subscription_events`
4. Enqueues domain event to `commercial_outbox_events` via `CommerceEventService`
5. Invalidates entitlement cache and bumps `commercial_entitlement_versions`

### Trial flow

`TrialService.startTrial()`:

1. Checks eligibility (no active sub; no prior trial on product)
2. Creates subscription in `draft`
3. Transitions `draft → pending_activation → trialing`
4. Issues licences via `LicenseIssuanceService.issueForSubscription()`
5. Emits `subscription.trial_started`

Default trial length: 14 days. Default trial seat pool: 5.

## Enforcement

- **Entitlement**: `EntitlementService.evaluateSubscription()` requires access-granting status (`trialing`, `active`, `grace_period`, `scheduled_cancellation` with future `cancellation_effective_at`)
- **Seat assignment**: `SeatAssignmentService.assign()` rejects when subscription is not access-granting
- **Plan changes**: `SubscriptionChangeService` only schedules changes when subscription is access-granting

## API routes

| Route | Methods | Permission |
|-------|---------|------------|
| `/api/platform/commerce/subscriptions` | GET, POST | `commerce:read` / `commerce:admin` |
| `/api/platform/commerce/subscriptions/[id]/activate` | POST | `commerce:manage_subscriptions` |
| `/api/platform/commerce/subscriptions/[id]/pause` | POST | `commerce:manage_subscriptions` |
| `/api/platform/commerce/subscriptions/[id]/resume` | POST | `commerce:manage_subscriptions` |
| `/api/platform/commerce/subscriptions/[id]/suspend` | POST | `commerce:manage_subscriptions` |
| `/api/platform/commerce/subscriptions/[id]/cancel` | POST | `commerce:manage_subscriptions` |

UI: `/system/subscriptions` — see [SUBSCRIPTIONS_ADMIN.md](../ui/SUBSCRIPTIONS_ADMIN.md).

## Known limitations (Phase 2)

- No live billing provider webhooks (Stripe/Xero adapters reserved)
- `SubscriptionService.changeStatus()` bypasses the state machine — prefer `lifecycle.transition()` for production paths
- `pending_renewal` and `pending_payment` statuses exist in schema but have no dedicated workflow yet
- Payment failure → `past_due` must be driven manually or by future billing integration
- Workspace-scoped subscriptions are stored but most enforcement is tenant-level

## Related docs

- [COMMERCE_STATE_TRANSITIONS.md](./COMMERCE_STATE_TRANSITIONS.md)
- [COMMERCE_EVENTS.md](./COMMERCE_EVENTS.md)
- [PLATFORM_COMMERCE_LICENSING.md](./PLATFORM_COMMERCE_LICENSING.md)
- [COMMERCE_LIFECYCLE_JOBS.md](../operations/COMMERCE_LIFECYCLE_JOBS.md)
