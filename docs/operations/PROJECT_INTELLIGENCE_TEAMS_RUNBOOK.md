# Project Intelligence — Teams Operations Runbook

**Phase:** 6C-3D / 6C-3E

## Configure (staging)

1. Register a Microsoft Entra app in the **non-production** test tenant.
2. Grant least-privilege Graph permissions listed in `PROJECT_INTELLIGENCE_TEAMS_GRAPH_PERMISSIONS.md` and grant **admin consent**.
3. Set server secrets (prefer `PI_TEAMS_*`; legacy `MICROSOFT_*` aliases accepted):

| Variable | Notes |
|----------|-------|
| `PI_TEAMS_GRAPH_MODE` | `live` for Entra cert; `fixture` for regression only |
| `PI_TEAMS_LIVE_CERT_ENABLED` | `true` only in certification environments |
| `PI_TEAMS_TENANT_ID` | Staging tenant GUID |
| `PI_TEAMS_CLIENT_ID` | App registration |
| `PI_TEAMS_CLIENT_SECRET` | Never log |
| `PI_TEAMS_WEBHOOK_CLIENT_STATE` | Graph clientState |
| `PI_TEAMS_WEBHOOK_BASE_URL` | Public notification base URL |
| `PI_TEAMS_TEST_MEETING_URL` | Non-confidential staging join URL |
| `PI_TEAMS_TEST_TENANT_LABEL` | Label only (no secret) |
| `PI_TEAMS_TEST_ORGANIZER_USER_ID` | Optional UPN/OID |
| `PI_TEAMS_TEST_PROVIDER_MEETING_ID` | Optional Graph meeting id |

4. Live certification workflow: `.github/workflows/project-intelligence-phase-6c3e-live-teams-provider-certification.yml`  
   Ops notes: `docs/operations/PROJECT_INTELLIGENCE_TEAMS_LIVE_CERTIFICATION.md`
5. Missing live config fails closed with `TEAMS_GRAPH_LIVE_CONFIG_MISSING` (no fixture fallback during 6C-3E).
6. As tenant admin, open Meetings → Providers → Microsoft Teams → Configure / Test / Health.

## Subscriptions

- Create via subscription service after connection is healthy (live Graph create/renew/revoke certified in 6C-3E Gates M–P).
- Renew before expiry (worker job `project_intelligence.meeting.teams_renew_subscriptions`).
- Lifecycle notifications disable expired or revoked subscriptions.
- Revoking a provider connection disables renewals.

## Webhook health

- ValidationToken handshake must respond within Graph timeout.
- clientState must match `PI_TEAMS_WEBHOOK_CLIENT_STATE` (or legacy `MICROSOFT_GRAPH_WEBHOOK_SECRET`).
- Duplicates are suppressed durably; replays return controlled codes.

## Incident response

| Symptom | Action |
|---------|--------|
| `TEAMS_GRAPH_LIVE_CONFIG_MISSING` | Populate live env; do not switch to fixture for PASS evidence |
| `TEAMS_GRAPH_ADMIN_CONSENT_REQUIRED` | Grant admin consent in Entra; re-run Gate F |
| 401/403 Graph | Check consent; mark connection degraded/failed |
| 429 | Honour Retry-After; circuit breaker; health=degraded |
| Subscription expired | Renew or recreate; audit |
| Transcript denied / unavailable | Classify latency `unavailable`; optional `PI_TEAMS_ACCEPT_TRANSCRIPT_UNAVAILABLE=1` |
| Secret leak suspicion | Rotate client secret; revoke connection; fail cert scan |

## Cleanup

Non-production fixtures and staging tenant meetings only. Do not use confidential customer meetings for certification.

## Rollback

1. Set `PI_TEAMS_GRAPH_MODE=fixture` or disable live cert flag.
2. Disable the Teams provider connection in admin UI.
3. Revoke Graph subscriptions for the staging app.
4. Keep `productionTeamsProviderReady=false` until a green 6C-3E artifact exists.
