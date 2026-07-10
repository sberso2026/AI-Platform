# Commerce Outbox Processing

Transactional outbox for async commerce domain events. Decouples commit path from Growth Engine hooks and future external webhooks.

## Components

| Component | Location |
|-----------|----------|
| Enqueue | `CommerceEventService.emit()` |
| Storage | `commercial_outbox_events` |
| Processor | `CommerceOutboxProcessor` |
| Scheduler job | `processCommerceOutbox` |

## Enqueue path

Every `emit()` inserts a row:

```typescript
{
  tenant_id,
  aggregate_type,    // subscription | licence | seat_assignment
  aggregate_id,
  event_type,
  payload: { ...payload, payloadVersion: "1.0", occurredAt },
  correlation_id,
  idempotency_key,
  status: "pending",
}
```

Synchronous growth hooks also fire inline in `CommerceEventService` for `subscription.created` and `subscription.renewed` when `commerceExtensions.growth` is registered.

## Processing pipeline

`CommerceOutboxProcessor.processBatch(limit = 50)`:

1. `OutboxRepository.claimPending()` — select `pending` where `available_at <= now`
2. Optimistic lock: `pending → processing`
3. Dispatch to registered handler by `event_type`
4. On success: `processing → processed`
5. On failure: increment `retry_count`, exponential backoff, or `dead_letter` after 5 retries

### Backoff

`min(60s, 1s × 2^(retryCount-1))` — updates `available_at` for retry.

### Default handlers

Registered only when Growth Engine extension is present:

- `subscription.created` → `growth.onSubscriptionCreated`
- `subscription.renewed` → `growth.onSubscriptionRenewed`

Custom handlers: `processor.registerHandler(eventType, fn)`.

## Invocation

| Method | Command |
|--------|---------|
| Scheduler (all jobs) | `POST /api/platform/commerce/jobs/run` |
| Scheduler (outbox only) | `{ "jobs": ["processCommerceOutbox"] }` |
| Direct | `await commerce.outboxProcessor.processBatch(50)` |

Service role via `COMMERCE_SCHEDULER_SECRET` recommended for production cron.

## Outbox statuses

| Status | Meaning |
|--------|---------|
| `pending` | Awaiting processing |
| `processing` | Claimed by worker |
| `processed` | Handler succeeded |
| `failed` | Transient failure (returns to pending with backoff) |
| `dead_letter` | Max retries exceeded |

## RLS and access

- Direct table access: platform admin only
- Tenant audit: `CommerceAuditService` reads licence aggregate events via service client
- Application code should use `OutboxRepository`, not raw Supabase client

## Monitoring queries

```sql
-- Pending backlog
SELECT count(*) FROM commercial_outbox_events WHERE status = 'pending';

-- Dead letters (last 24h)
SELECT event_type, last_error, created_at
FROM commercial_outbox_events
WHERE status = 'dead_letter'
  AND created_at > now() - interval '24 hours'
ORDER BY created_at DESC;

-- Retry pressure
SELECT status, count(*) FROM commercial_outbox_events GROUP BY status;
```

## Operational procedures

### Clear backlog

1. Run `processCommerceOutbox` job repeatedly until `processed` count stabilizes
2. Investigate `errors` array in scheduler response
3. For poison messages, inspect `dead_letter` rows and fix handler or payload

### Replay dead letter

Phase 2 has no admin replay UI. Manual procedure:

1. Identify root cause (handler bug, missing extension)
2. Fix handler code
3. Update row: `status = 'pending'`, `retry_count = 0`, `available_at = now()` (platform admin SQL)
4. Run `processCommerceOutbox`

### Disable outbox temporarily

Not recommended. If Growth hooks cause outages, unregister extension rather than stopping outbox inserts (audit trail preserved).

## Known limitations

- No external webhook delivery (Stripe, email) — handlers are in-process only
- Claim pattern is not `SELECT FOR UPDATE SKIP LOCKED` — concurrent workers may contend
- Events without registered handlers are marked **processed** silently (no-op success)
- No payload schema validation at enqueue time
- Tenant_id nullable for platform-level events

## Related docs

- [COMMERCE_EVENTS.md](../architecture/COMMERCE_EVENTS.md)
- [COMMERCE_LIFECYCLE_JOBS.md](./COMMERCE_LIFECYCLE_JOBS.md)
- [COMMERCE_INCIDENT_RESPONSE.md](./COMMERCE_INCIDENT_RESPONSE.md)
