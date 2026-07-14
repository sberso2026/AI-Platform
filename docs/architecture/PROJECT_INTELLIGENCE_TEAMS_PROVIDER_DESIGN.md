# Project Intelligence — Teams Provider Design

**Phase:** 6C-3D  
**Product:** Engineering OS → Project Intelligence → Meetings  
**Status:** Implementation — Microsoft Teams is the first external provider candidate

## Product placement

Teams is a **provider** under the existing Meetings feature. It is not a separate commercial application and does not remove the certified manual path.

## Capability model

Overall provider status reflects the **certified subset**, not an all-or-nothing label:

```json
{
  "provider": "microsoft_teams",
  "status": "certified",
  "capabilities": {
    "meeting_url_validation": "certified",
    "meeting_discovery": "certified",
    "session_mapping": "certified",
    "webhook_events": "certified",
    "participant_metadata": "certified",
    "transcript_retrieval": "certified",
    "live_transcript": "unsupported",
    "recording_access": "unsupported",
    "bot_join": "unsupported",
    "meeting_end_detection": "certified",
    "subscription_renewal": "certified"
  }
}
```

Capability status values: `unsupported` | `unconfigured` | `configured` | `experimental` | `certified`.

## Architecture

```text
Microsoft Graph notification / admin configure
  → validate (token, clientState, subscription, tenant)
  → durable provider event (dedupe)
  → resolve provider mapping
  → PI meeting session / participants / transcript ingest
  → existing processing jobs → minutes / proposals → human review → Core convert
```

## Graph client modes

| Mode | Env | Use |
|------|-----|-----|
| `live` | `PI_TEAMS_GRAPH_MODE=live` + Microsoft secrets | Real staging tenant |
| `fixture` | `PI_TEAMS_GRAPH_MODE=fixture` | Controlled Graph-shaped simulator for hosted staging certification |

Fixture mode certifies RTB contracts and pipelines. It must not claim production Microsoft tenant readiness (`productionCertificationBlocked` remains true unless live evidence and gates agree).

## Transcript mode policy

| Classification | Rule |
|----------------|------|
| realtime | Median segment latency within declared threshold during live cert |
| near_realtime | Incremental delayed delivery |
| post_meeting | Available only after completion (default certified path) |
| unsupported | API/tenant policy blocks retrieval |

UI must display the measured classification. Post-meeting must never be labelled live.

## Bot join and recording

Remain `unsupported` unless separately implemented and proven. Webhook or transcript access does **not** imply bot join or recording.

## Configuration (server-only)

Exact names:

- `MICROSOFT_TENANT_ID`
- `MICROSOFT_CLIENT_ID`
- `MICROSOFT_CLIENT_SECRET`
- `MICROSOFT_GRAPH_WEBHOOK_SECRET`
- `MICROSOFT_GRAPH_NOTIFICATION_URL` (optional)
- `MICROSOFT_GRAPH_LIFECYCLE_NOTIFICATION_URL` (optional)
- `PI_TEAMS_GRAPH_MODE` (`live` \| `fixture`)

Never exposed to browser builds. Never logged as values.

## Related docs

- `docs/migration/PROJECT_INTELLIGENCE_TEAMS_CAPABILITY_INVENTORY.md`
- `docs/security/PROJECT_INTELLIGENCE_TEAMS_SECURITY.md`
- `docs/security/PROJECT_INTELLIGENCE_TEAMS_GRAPH_PERMISSIONS.md`
- `docs/operations/PROJECT_INTELLIGENCE_TEAMS_RUNBOOK.md`
