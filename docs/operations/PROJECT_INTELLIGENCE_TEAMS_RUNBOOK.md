# Project Intelligence — Teams Operations Runbook

**Phase:** 6C-3D

## Configure (staging)

1. Register a Microsoft Entra app in the **non-production** test tenant.
2. Grant least-privilege Graph permissions listed in `PROJECT_INTELLIGENCE_TEAMS_GRAPH_PERMISSIONS.md`.
3. Set server secrets: `MICROSOFT_TENANT_ID`, `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_GRAPH_WEBHOOK_SECRET`, notification URLs.
4. Set `PI_TEAMS_GRAPH_MODE=live` (or `fixture` for contract certification only).
5. As tenant admin, open Meetings → Providers → Microsoft Teams → Configure / Test / Health.

## Subscriptions

- Create via subscription service after connection is healthy.
- Renew before expiry (worker job `project_intelligence.meeting.teams_renew_subscriptions`).
- Lifecycle notifications disable expired or revoked subscriptions.
- Revoking a provider connection disables renewals.

## Webhook health

- ValidationToken handshake must respond within Graph timeout.
- clientState must match `MICROSOFT_GRAPH_WEBHOOK_SECRET`.
- Duplicates are suppressed durably; replays return controlled codes.

## Incident response

| Symptom | Action |
|---------|--------|
| 401/403 Graph | Check consent; mark connection degraded/failed |
| 429 | Honour Retry-After; circuit breaker; health=degraded |
| Subscription expired | Renew or recreate; audit |
| Transcript denied | Leave transcript_mode unavailable; keep meeting manual path |
| Secret leak suspicion | Rotate client secret; revoke connection; fail cert scan |

## Cleanup

Non-production fixtures only. Do not use confidential customer meetings for certification.
