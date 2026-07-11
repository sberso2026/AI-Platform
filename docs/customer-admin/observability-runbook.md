# Customer Administration — Observability Runbook

## Structured lifecycle events

Lifecycle mutations emit commerce events via `emitLifecycleObservation` with payload fields:

- `tenant_id`, `workspace_id`, `installation_id`
- `actor_id`, `actor_role`
- `operation`, `result`, `error_code`
- `correlation_id`, `timestamp`

## Event types (Phase 5)

| Event | Route |
|-------|-------|
| `installation.uninstall.requested` | POST uninstall |
| `installation.uninstall.blocked_by_dependencies` | POST uninstall (422) |
| `installation.uninstalled` | POST uninstall (200) |
| `installation.upgrade.requested` / `installation.upgraded` | POST upgrade |
| `installation.rollback.requested` / `installation.rollback_pending` | POST rollback |
| `installation.suspended` / `installation.resumed` | POST suspend/resume |
| `seat.assigned` / `seat.removed` | POST seats assign/remove |
| `licence.suspended` / `licence.resumed` | POST license suspend/resume |

## Correlation with API responses

Error responses include `requestId` in nested envelope:

```json
{
  "error": {
    "code": "active_dependencies_exist",
    "message": "...",
    "requestId": "uuid"
  }
}
```

Search logs/events by this ID.

## Validation checklist

- [ ] Each representative operation emits exactly one success event per successful request
- [ ] Blocked uninstall emits `blocked_by_dependencies` without state transition
- [ ] No secrets in event payloads
- [ ] Tenant isolation — events scoped to tenant_id
- [ ] Unexpected 5xx fail certification (`unexpectedServerErrorCount=0`)

## Inspection

1. Query `commercial_installation_events` / commerce event store by `installation_id`
2. Filter by `correlation_id` matching API `requestId`
3. Compare actor_id with authenticated user

## Certification

HTTP and Playwright gates verify uninstall audit proof in `uninstall-http-certification.ts`.
