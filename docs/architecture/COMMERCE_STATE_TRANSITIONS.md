# Commerce State Transitions

Subscription lifecycle is governed by `SubscriptionStateMachine` in `@rtb/platform-commerce/src/domain/subscription-state-machine.ts`.

All production transitions must go through `SubscriptionLifecycleService.transition()`.

## Statuses

`draft`, `pending_activation`, `trialing`, `active`, `past_due`, `grace_period`, `paused`, `suspended`, `scheduled_cancellation`, `cancelled`, `expired`, `pending_renewal`, `pending_payment`

Legacy alias: `trial` → normalized to `trialing` in entitlement evaluation and migration `20260209000000`.

## Transition matrix

| From | Allowed targets |
|------|-----------------|
| `draft` | `pending_activation` |
| `pending_activation` | `trialing`, `active`, `cancelled` |
| `trialing` | `active`, `expired`, `cancelled` |
| `active` | `past_due`, `paused`, `suspended`, `scheduled_cancellation`, `cancelled` |
| `past_due` | `active`, `grace_period`, `suspended` |
| `grace_period` | `active`, `suspended` |
| `paused` | `active`, `cancelled` |
| `suspended` | `active`, `cancelled` |
| `scheduled_cancellation` | `active`, `cancelled` |
| `cancelled` | `active` |
| `expired` | `active` |
| `pending_renewal` | `active`, `cancelled`, `expired` |
| `pending_payment` | `active`, `cancelled`, `past_due` |

Invalid transitions throw `InvalidSubscriptionTransitionError`.

Unit tests: `subscription-state-machine.test.ts`.

## Guarded transition pipeline

`SubscriptionLifecycleService.transition()`:

1. Loads current subscription
2. `SubscriptionStateMachine.assertTransition(from, to)`
3. Applies timestamp patches (`activated_at`, `trial_start`, `paused_at`, `suspended_at`, `expired_at`, cancellation fields)
4. Persists status via `SubscriptionRepository.transition()`
5. Records immutable `commercial_subscription_events` with mapped `event_type`
6. Enqueues outbox event via `CommerceEventService`
7. Invalidates entitlement cache and bumps tenant entitlement version

## Access-granting statuses

`SubscriptionStateMachine.isAccessGranting()`:

- `trialing`
- `active`
- `grace_period`
- `scheduled_cancellation` (until `cancellation_effective_at` passes — enforced in `EntitlementService`)

### Non-granting statuses

`draft`, `pending_activation`, `past_due`, `paused`, `suspended`, `cancelled`, `expired`, `pending_renewal`, `pending_payment`

Note: `past_due` does not grant access in Phase 2 — payment recovery must transition to `active` or `grace_period`.

## Scheduler-driven transitions

| Job | Transition |
|-----|------------|
| `expireTrials` | `trialing → expired` |
| `applyScheduledCancellations` | `scheduled_cancellation → cancelled` (via `lifecycle.cancel`) |
| `processGracePeriodExpiry` | `grace_period → suspended` (via `lifecycle.suspend`) |
| `applyScheduledSubscriptionChanges` | Plan change only; status unchanged unless conversion workflow applies |

## Convenience methods

| Method | Target status |
|--------|---------------|
| `activate()` | `active` |
| `pause()` | `paused` |
| `resume()` | `active` (from `paused`) |
| `suspend()` | `suspended` |
| `scheduleCancellation()` | `scheduled_cancellation` |
| `cancel()` | `cancelled` |
| `renew()` | `active` (from `expired` or `cancelled`) |

## Reactivation and renewal

- `cancelled → active` — explicit reactivation (`subscription.reactivated`)
- `expired → active` — renewal (`subscription.renewed`)
- Both require valid licences and seat assignments to restore access

## Licence and seat side effects

State transitions do **not** automatically revoke licences. Scheduler `expireLicences` handles licence expiry independently. Seat assignments remain until explicitly removed.

## Known limitations

- `SubscriptionService.changeStatus()` can bypass the state machine — avoid in production
- `pending_renewal` / `pending_payment` have no automated entry transitions
- No automatic `active → past_due` from billing webhooks
- Cancellation at period end requires `scheduleCancellation` + scheduler; immediate cancel uses `cancel()`

## Related docs

- [PLATFORM_COMMERCE_SUBSCRIPTIONS.md](./PLATFORM_COMMERCE_SUBSCRIPTIONS.md)
- [COMMERCE_EVENTS.md](./COMMERCE_EVENTS.md)
- [COMMERCE_LIFECYCLE_JOBS.md](../operations/COMMERCE_LIFECYCLE_JOBS.md)
