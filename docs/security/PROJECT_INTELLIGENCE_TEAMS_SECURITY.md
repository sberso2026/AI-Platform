# Project Intelligence — Teams Security

**Phase:** 6C-3D / 6C-3E

## Trust boundaries

1. Browser never receives Microsoft client secrets or access tokens.
2. Graph webhooks authenticate via validationToken handshake + clientState, not user JWT.
3. Users cannot inject provider events or claim worker jobs.
4. Provider connections are tenant-scoped; credential reference only (no secret columns).
5. Join URLs are validated; full URLs are not written to application logs; hash may be stored.
6. Microsoft tenant admin consent ≠ participant recording/transcription consent.
7. Teams transcript content follows PI privacy, retention, and legal-hold rules before processing.
8. Live certification artifacts must never include raw client secrets, access tokens, clientState, or transcript text.

## Credential handling

| Item | Rule |
|------|------|
| Client secret | Server env / secret manager only (`PI_TEAMS_CLIENT_SECRET`) |
| Access tokens | In-memory cache; never logged; never browser |
| Webhook secret | Compared as clientState; presence-only in preflight |
| Tenant IDs | Redact in artifacts (`redactMicrosoftTenantId`) |
| Artifacts | Secret exposure scan must pass (Gate Y) |

## Fail-closed (6C-3E)

| Condition | Code / behaviour |
|-----------|------------------|
| Live mode without credentials | `TEAMS_GRAPH_LIVE_CONFIG_MISSING` |
| Admin consent missing | `TEAMS_GRAPH_ADMIN_CONSENT_REQUIRED` |
| Silent fixture fallback during live cert | **Forbidden** |
| Tenant mismatch | Fail closed; do not process |

## Identity mutation

RLS / triggers prevent users from altering `tenant_id`, `workspace_id`, `provider`, or `provider_tenant_id` on connection and mapping rows. Service-role webhook paths are audited.

## Failure posture

Auth, permission, mapping, and webhook failures use controlled `teams_*` error codes. Unexpected unhandled 5xx fails certification.
