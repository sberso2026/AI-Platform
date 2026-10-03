# EOS-A16B Pilot Connector Security + External Integration Hardening

Phase: **HARDEN** only. V5B remains closed. A16A CONNECT remains closed at `bfc366c35aa5b0156287ea17c155b693f6ef4254`. This gate does not start PROVE, does not enable SharePoint write-back, and does not enable returned external artifact ingestion.

## Scanner trust model

Trusted server-side configuration only:

- `RTB_REVIEW_CLAMAV_URL`
- `RTB_REVIEW_CLAMAV_AUTH_TOKEN` (hosted)

No caller-supplied scanner URL. No browser exposure. No persistence of scanner secrets on domain rows, audit payloads, telemetry, or generation manifests.

| Deployment | TLS | Bearer auth | Result |
|---|---|---|---|
| Loopback localhost / 127.0.0.1 / ::1 | optional | optional (local ClamAV HTTP bridge) | `local_dev` |
| Hosted HTTP | fail | fail | `HOSTED_TLS_REQUIRED` |
| Hosted HTTPS without token | required | fail | `HOSTED_AUTH_REQUIRED` |
| Hosted HTTPS + token | required | `Authorization: Bearer` | `hosted` |
| Public scanning SaaS | n/a | n/a | `PUBLIC_SCANNER_PROHIBITED` |

Redirects are not followed. Timeout default 8000 ms. Max scan payload 25 MiB. Max response 8192 bytes. CLEAN / INFECTED preserved. timeout, 401/403/404/429/500, empty, malformed, and network failures are SCAN_FAILED — never CLEAN.

Returned artifact round trip remains **DISABLED** until a real hosted scanner is live-proven. Internally generated artifact flow is independent.

## SharePoint read-only pilot

Preferred Entra application permission: **Sites.Selected** (read) on explicitly approved sites/libraries. Do not grant `Sites.Read.All` / `Files.Read.All` tenant-wide.

Pilot write is disabled (`sharepoint_pilot_write_disabled`) even if a repository record has `publicationEnabled`. Fixture publication remains available only when the test/service explicitly sets `pilotWriteEnabled`.

Live Graph credentials are not fabricated. `LIVE_SHAREPOINT_TEST = BLOCKED_EXTERNAL_CONFIGURATION` until an operator provides approved configuration.

Readiness statuses: `CONFIG_VALID`, `CONFIG_MISSING`, `CREDENTIAL_MISSING`, `SITE_NOT_ALLOWLISTED`, `AUTH_FAILED`, `SOURCE_UNAVAILABLE`, `PERMISSION_DENIED`, `READY_FOR_LIVE_READ`. Results never include secret values.

## Schema

No migration. No RLS change. No new document/repository/binary authority.
