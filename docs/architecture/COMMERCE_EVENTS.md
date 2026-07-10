# Commerce Events

Commerce emits two complementary event streams: **immutable subscription events** (audit) and **transactional outbox events** (async integration).

## Event stores

| Store | Table | Mutability | Primary use |
|-------|-------|------------|-------------|
| Subscription audit | `commercial_subscription_events` | Immutable | Lifecycle audit, compliance |
| Domain outbox | `commercial_outbox_events` | Status-tracked | Growth hooks, notifications, external systems |

## Subscription events (`commercial_subscription_events`)

Written by `SubscriptionRepository.recordEvent()` and `SubscriptionLifecycleService.transition()`.

### Lifecycle event types

Mapped in `SubscriptionStateMachine.eventTypeForTransition()`:

| Transition | `event_type` |
|------------|--------------|
| `draft → pending_activation` | `subscription.pending_activation` |
| `pending_activation → trialing` | `subscription.trial_started` |
| `pending_activation → active` | `subscription.activated` |
| `trialing → active` | `subscription.activated` |
| `trialing → expired` | `subscription.expired` |
| `active → past_due` | `subscription.payment_failed` |
| `active → grace_period` | `subscription.grace_period_started` |
| `active → paused` | `subscription.paused` |
| `active → suspended` | `subscription.suspended` |
| `active → scheduled_cancellation` | `subscription.cancellation_scheduled` |
| `active → cancelled` | `subscription.cancelled` |
| `paused → active` | `subscription.resumed` |
| `suspended → active` | `subscription.reactivated` |
| `scheduled_cancellation → active` | `subscription.cancellation_reversed` |
| `scheduled_cancellation → cancelled` | `subscription.cancelled` |
| `cancelled → active` | `subscription.reactivated` |
| `expired → active` | `subscription.renewed` |
| Other valid transitions | `subscription.status_changed` |

Additional types from services:

| `event_type` | Source |
|--------------|--------|
| `subscription.created` | `SubscriptionService.create()` |
| `subscription.trial_started` | `TrialService.startTrial()` |
| `subscription.trial_extended` | `TrialService.extendTrial()` |

### Row shape (Phase 2 extensions)

`workspace_id`, `previous_status`, `new_status`, `effective_at`, `actor_user_id`, `actor_type`, `source`, `reason`, `correlation_id`, `idempotency_key`, `event_payload`.

Unique index on `(subscription_id, idempotency_key)` when key is set.

## Outbox events (`commercial_outbox_events`)

Enqueued by `CommerceEventService.emit()`:

```typescript
await commerce.events.emit({
  eventType: "licence.issued",
  tenantId,
  aggregateType: "licence",
  aggregateId: licenceId,
  payload: { licenceId, subscriptionId },
  correlationId,
  idempotencyKey,
});
```

### Payload envelope

All outbox payloads include:

- `payloadVersion`: `"1.0"`
- `occurredAt`: ISO timestamp
- `workspaceId`, `actorUserId` when provided

### Event catalogue

| `event_type` | `aggregate_type` | Emitter |
|--------------|------------------|---------|
| `subscription.created` | `subscription` | Lifecycle / create paths |
| `subscription.trial_started` | `subscription` | `TrialService` |
| `subscription.*` (lifecycle) | `subscription` | `SubscriptionLifecycleService` |
| `subscription.expiring_soon` | `subscription` | Scheduler `detectExpiringSubscriptions` |
| `trial.warning` | `subscription` | Scheduler `emitTrialWarnings` |
| `trial.expired` | `subscription` | `TrialService.expireTrials` |
| `licence.issued` | `licence` | `LicenseIssuanceService` |
| `licence.revoked` | `licence` | `LicenseIssuanceService` |
| `licence.suspended` | `licence` | `LicenseIssuanceService` |
| `licence.expired` | `licence` | Scheduler `expireLicences` |
| `licence.expiring_soon` | `licence` | Scheduler `detectExpiringLicences` |
| `seat.assigned` | `seat_assignment` | `SeatAssignmentService` |
| `seat.removed` | `seat_assignment` | `SeatAssignmentService` |
| `seat.transferred` | `seat_assignment` | `SeatAssignmentService` |

### Outbox status lifecycle

`pending` → `processing` → `processed` | `dead_letter`

Failed handlers retry with exponential backoff (max 5 attempts). See [COMMERCE_OUTBOX_PROCESSING.md](../operations/COMMERCE_OUTBOX_PROCESSING.md).

## Growth engine hooks

`CommerceEventService` and `CommerceOutboxProcessor` invoke `commerceExtensions.growth` when registered:

- `onSubscriptionCreated` — `subscription.created`
- `onSubscriptionRenewed` — `subscription.renewed`

Hooks are optional; no Growth Engine is wired in Phase 2.

## Audit API

`CommerceAuditService.listTenantAudit()` merges subscription events and licence outbox events for tenant admin views.

## Enforcement

- Subscription events: tenant RLS via `get_user_tenant_ids()`
- Outbox: **platform admin only** for direct table access; tenant-scoped reads via service layer

## Known limitations

- No external webhook delivery — outbox handlers are in-process only
- Seat events are outbox-only (no `commercial_seat_events` table)
- `CommerceAuditService` does not yet include seat or override events
- Idempotency keys are best-effort; not all emit paths set them

## Related docs

- [COMMERCE_STATE_TRANSITIONS.md](./COMMERCE_STATE_TRANSITIONS.md)
- [COMMERCE_OUTBOX_PROCESSING.md](../operations/COMMERCE_OUTBOX_PROCESSING.md)
- [COMMERCE_LIFECYCLE_JOBS.md](../operations/COMMERCE_LIFECYCLE_JOBS.md)
