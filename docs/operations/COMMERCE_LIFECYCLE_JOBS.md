# Commerce Lifecycle Jobs

Callable via `ctx.commerce.scheduler.runAll()` or `POST /api/platform/commerce/jobs/run`.

Implementation: `CommerceSchedulerService` in `@rtb/platform-commerce`.

## Invocation

### HTTP

```http
POST /api/platform/commerce/jobs/run
Content-Type: application/json

{ "jobs": ["expireTrials", "processCommerceOutbox"] }
```

Omit `jobs` to run all jobs in sequence.

**Auth options:**

| Method | Requirement |
|--------|-------------|
| `x-commerce-scheduler-secret` header | Must match `COMMERCE_SCHEDULER_SECRET` — uses service role client |
| Session | Authenticated `owner` role |

Response: `{ correlationId, data: SchedulerRunResult[] }`

### Programmatic

```typescript
await commerce.scheduler.runAll();
await commerce.scheduler.runJobs(["expireLicences"]);
```

## Job catalogue

| Job | Handler | Description |
|-----|---------|-------------|
| `expireTrials` | `TrialService.expireTrials()` | `trialing → expired` when trial end passed |
| `expireLicences` | `LicenseService.transitionToExpired()` | Batch expiry; emits `licence.expired` |
| `applyScheduledSubscriptionChanges` | `SubscriptionChangeService.applyScheduledChange()` | Applies due plan changes |
| `applyScheduledCancellations` | `lifecycle.cancel()` | `scheduled_cancellation → cancelled` when effective date reached |
| `processGracePeriodExpiry` | `lifecycle.suspend()` | `grace_period → suspended` when `grace_period_end` passed |
| `detectExpiringSubscriptions` | `CommerceEventService.emit()` | `subscription.expiring_soon` within 7 days |
| `detectExpiringLicences` | `CommerceEventService.emit()` | `licence.expiring_soon` within 7 days |
| `emitTrialWarnings` | `CommerceEventService.emit()` | `trial.warning` at 7, 3, 1 days remaining |
| `processCommerceOutbox` | `CommerceOutboxProcessor.processBatch()` | Delivers pending outbox events |

Batch size: 100 records per iteration (licence expiry, cancellations, grace period loop until drained).

## Recommended schedule

| Job | Frequency | Notes |
|-----|-----------|-------|
| `processCommerceOutbox` | Every 1–5 min | Keeps integration hooks current |
| `expireTrials` | Hourly | Time-sensitive access revocation |
| `expireLicences` | Hourly | |
| `applyScheduledCancellations` | Hourly | Align with billing period end |
| `processGracePeriodExpiry` | Hourly | |
| `applyScheduledSubscriptionChanges` | Hourly | |
| `detectExpiringSubscriptions` | Daily | Idempotent per day bucket |
| `detectExpiringLicences` | Daily | |
| `emitTrialWarnings` | Daily | Only fires on exact day thresholds |

Example cron (external scheduler):

```bash
curl -X POST "$APP_URL/api/platform/commerce/jobs/run" \
  -H "x-commerce-scheduler-secret: $COMMERCE_SCHEDULER_SECRET" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Idempotency

- Jobs are safe to rerun; state transitions guard invalid repeats
- Warning events use `idempotencyKey` (e.g. `trial-warning:{subId}:{daysRemaining}`)
- Outbox processor uses claim-and-lock pattern (`pending → processing`)

## Side effects

Jobs that mutate commerce state call `EntitlementCache.invalidateTenant()`:

- `expireLicences`
- Lifecycle transitions via `SubscriptionLifecycleService` (cancellations, grace expiry)

## Monitoring

Inspect `SchedulerRunResult`:

```typescript
{ job: string; processed: number; errors: string[] }
```

Non-zero `errors` should be logged and alerted. Partial success is normal when individual records fail validation.

## Multi-instance note

Entitlement cache is in-process (30s TTL). Scheduler may run on any instance; cache invalidation only affects the processing node unless all instances process mutations. See [COMMERCE_CACHE_INVALIDATION.md](./COMMERCE_CACHE_INVALIDATION.md).

## Known limitations

- No distributed job locking — multiple schedulers may race (transitions are idempotent but duplicate warning events possible without idempotency keys)
- `detectExpiringSubscriptions` skips trialing subs (trial warnings separate)
- No job persistence or dead-letter queue for scheduler failures (only outbox DLQ)
- Owner-only HTTP auth — no granular `commerce:admin` scheduler path without shared secret

## Related docs

- [COMMERCE_OUTBOX_PROCESSING.md](./COMMERCE_OUTBOX_PROCESSING.md)
- [COMMERCE_STATE_TRANSITIONS.md](../architecture/COMMERCE_STATE_TRANSITIONS.md)
- [COMMERCE_INCIDENT_RESPONSE.md](./COMMERCE_INCIDENT_RESPONSE.md)
