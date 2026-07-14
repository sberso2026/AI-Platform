# Project Intelligence — Teams Live Entra Certification (Phase 6C-3E)

**Product:** Engineering OS → Project Intelligence → Meetings  
**Depends on:** Phase 6C-3D fixture PASS @ `148223ec35768a9401a885071badb2a56e3ebb13`

## Verdict rule

Phase 6C-3E PASS requires **real Graph calls** against a **staging Microsoft Entra tenant**.  
`PI_TEAMS_GRAPH_MODE=fixture` evidence is **forbidden** as PASS.

## Required server-only environment

| Name | Purpose |
|------|---------|
| `PI_TEAMS_GRAPH_MODE=live` | Forces live Graph client |
| `PI_TEAMS_LIVE_CERT_ENABLED=true` | Enables live certification path |
| `PI_TEAMS_TENANT_ID` | Staging Entra tenant |
| `PI_TEAMS_CLIENT_ID` | App registration |
| `PI_TEAMS_CLIENT_SECRET` | Client secret (credential reference preferred in prod) |
| `PI_TEAMS_WEBHOOK_CLIENT_STATE` | Graph clientState |
| `PI_TEAMS_WEBHOOK_BASE_URL` | Public notification URL |
| `PI_TEAMS_TEST_MEETING_URL` | Non-confidential staging meeting join URL |
| `PI_TEAMS_TEST_TENANT_LABEL` | Human label only (no secrets) |
| `PI_TEAMS_TEST_ORGANIZER_USER_ID` | Optional organizer UPN/OID |
| `PI_TEAMS_TEST_PROVIDER_MEETING_ID` | Optional explicit Graph meeting id |
| `PI_TEAMS_ACCEPT_TRANSCRIPT_UNAVAILABLE` | Optional `1` if transcript truly unavailable under tenant policy |

Legacy `MICROSOFT_*` aliases remain accepted as fallbacks.

## Fail-closed codes

- `TEAMS_GRAPH_LIVE_CONFIG_MISSING`
- `TEAMS_GRAPH_ADMIN_CONSENT_REQUIRED`

Silent fixture fallback during live certification is prohibited.

## Unsupported (must remain disabled)

- bot_join
- recording_access
- live_transcript
- Zoom / Google Meet

## Readiness flags

- `microsoftTeamsFixtureCertified` (6C-3D only)
- `microsoftTeamsLiveTenantConfigured`
- `microsoftTeamsLiveTenantCertified`
- `microsoftTeamsPostMeetingTranscriptCertified`
- `productionTeamsProviderReady` — true only with live evidence

## Workflow

`.github/workflows/project-intelligence-phase-6c3e-live-teams-provider-certification.yml`

Configure the listed secrets on the GitHub repository before expecting PASS.
