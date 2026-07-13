# Project Intelligence — Meeting Provider Status

**Phase:** 6C-3A Discovery Lock  
**Frozen evidence commit:** `ab1f44276715888123d9f669464987e6f7c39b6c`  
**Rule:** Do not claim live provider support without provider-specific live tests.

## Status vocabulary

| Status | Meaning |
|--------|---------|
| **unavailable** | Not offered in product; adapter may exist as stub |
| **experimental** | Code present; gated off; no hosted live certification |
| **beta** | Live tests exist in non-prod; limited tenants; not production-ready |
| **certified** | Provider-specific live tests passed on hosted cert workflow |

---

## Manual

| Field | Value |
|-------|-------|
| **Status (6C-3 target)** | **certified** (target for Phase 6C-3 certification) |
| **Frozen evidence** | `integrations/manualMeetingAdapter.ts`; default when bots disabled; start/stop without external API |
| **Integrated plan** | Primary certification path: draft → live → transcript → minutes → human review → Core writes |
| **Live tests required** | Hosted manual workflow E2E + durable transcript + review (no external bot) |

---

## Microsoft Teams

| Field | Value |
|-------|-------|
| **Status (6C-3A)** | **experimental** (product claim: **unavailable** until live cert) |
| **Frozen evidence** | `integrations/teamsBot.ts`; Graph webhook `app/api/webhooks/microsoft-graph/route.ts`; `microsoftGraphOnlineMeeting.ts`; gated by `RTB_TEAMS_BOT_ENABLED` |
| **Gaps** | External bot service not in-repo; Graph job stub empty; in-process webhook dedupe; no hosted live Teams certification in AI Platform |
| **Must not claim** | “Teams supported” or “Teams certified” in 6C-3A/6C-3B without live provider run |

---

## Zoom

| Field | Value |
|-------|-------|
| **Status (6C-3A)** | **experimental** (product claim: **unavailable** until live cert) |
| **Frozen evidence** | `integrations/zoomBot.ts`; URL detection in `meetingUrlValidation.ts`; same bot gate |
| **Gaps** | External `ZOOM_BOT_API_*` dependency; no Zoom live cert suite in AI Platform |
| **Must not claim** | Live Zoom support |

---

## Google Meet

| Field | Value |
|-------|--------|
| **Status (6C-3A)** | **experimental** (product claim: **unavailable** until live cert) |
| **Frozen evidence** | `integrations/googleMeetBot.ts`; URL detection; same bot gate |
| **Gaps** | External `GOOGLE_MEET_BOT_API_*`; no Meet live cert suite |
| **Must not claim** | Live Google Meet support |

---

## Speech / realtime adjuncts (not meeting providers)

| Capability | Frozen | Integrated stance |
|------------|--------|-------------------|
| OpenAI Whisper | Used in `services/transcription.ts` | Governed Platform AI path; not a “meeting provider” |
| Realtime WS mock | `scripts/realtime-pipeline-server.ts` | Dev/experimental; production needs multi-instance durable design |

---

## Artifact requirements (future cert)

Meeting certification artifacts must emit explicit fields, for example:

```json
{
  "providers": {
    "manual": "certified",
    "microsoft_teams": "unavailable",
    "zoom": "unavailable",
    "google_meet": "unavailable"
  }
}
```

Any upgrade from `unavailable` → `beta`/`certified` requires a dedicated provider live job and evidence, separate from manual Gate completion.
