# Project Intelligence — Teams Capability Inventory

**Phase:** 6C-3D  
**Frozen source:** `rtb-project-intelligence` @ `ab1f44276715888123d9f669464987e6f7c39b6c`  
**Product:** Engineering OS → Project Intelligence → Meetings (`feature=meetings`)

## Inventory method

Each frozen Teams/Graph surface was classified as: **preserve**, **adapt**, **modernize**, **replace**, **defer**, or **retire later**.

| Frozen component | Path (standalone) | Classification | Notes |
|------------------|-------------------|----------------|-------|
| Teams bot adapter | `integrations/teamsBot.ts` | **defer** | External bot API; not certified; UI remains disabled |
| Bot feature flag | `lib/meeting/teamsBotFeature.ts` | **defer** | Capability stays `unsupported` |
| Graph online meeting helpers | `lib/meeting/microsoftGraphOnlineMeeting.ts` | **adapt** | Resource ID extraction modernized into PI adapter |
| Azure→app tenant map | env `GRAPH_AZURE_TO_APP_TENANT_MAP` | **modernize** | Replaced by tenant-scoped `provider_connections.provider_tenant_id` |
| Graph webhook route | `app/api/webhooks/microsoft-graph/route.ts` | **modernize** | Validation token + clientState preserved; durable DB events replace in-memory create |
| In-process webhook dedupe | `lib/meeting/graphWebhookDedupe.ts` | **replace** | Process-local Map retired; durable unique `provider_event_id` |
| Graph webhook job | `jobs/graph/graphWebhookJob.ts` | **adapt** | Mapped to PI Teams jobs worker |
| Provider health gate | `lib/enterprise/providerHealthCheck.ts` | **adapt** | Teams-specific health service |
| Meeting URL / external id | `integrations/meetingAdapter.ts` helpers | **modernize** | Strict HTTPS Teams host allowlist |
| Session create from webhook | `createMeetingSessionRow` | **replace** | Never auto-create live sessions; map to existing PI meeting or draft candidate |
| OCR / knowledge-graph Graph pkgs | `domain/knowledge-graph`, OCR Azure | **retire later** | Not Teams meeting providers |
| Stub / incomplete bot join | Teams bot start/stop | **defer** | Remains unavailable until bot phase |

## Target PI surfaces (6C-3D)

| Capability | Target status intent |
|------------|----------------------|
| meeting_url_validation | certified |
| meeting_discovery | certified (fixture or live Graph) |
| session_mapping | certified |
| webhook_events | certified |
| participant_metadata | certified |
| transcript_retrieval | certified when Graph permissions + consent allow (post-meeting) |
| live_transcript | unsupported (no latency proof) |
| recording_access | unsupported |
| bot_join | unsupported |
| meeting_end_detection | certified via webhook/subscription |
| subscription_renewal | certified |

## Non-goals

- Zoom / Google Meet enablement
- Separate Teams commercial product
- Process-local event truth
- Auto Core writes from Teams events
