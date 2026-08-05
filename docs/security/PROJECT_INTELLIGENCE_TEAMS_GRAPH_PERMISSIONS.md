# Project Intelligence — Teams Graph Permissions

**Phase:** 6C-3D / 6C-3E  
**Principle:** Least privilege; fail closed when consent missing.

| Permission | Type | Purpose | Capability | Admin consent | Data accessed | Risk | Necessity | Cert status |
|------------|------|---------|------------|---------------|---------------|------|-----------|-------------|
| `OnlineMeetings.Read.All` | Application | Discover / read online meeting metadata | meeting_discovery, session_mapping | Yes | Meeting IDs, organizers, join metadata | Medium | Required for discovery/mapping | Required for live discovery (Gate I) |
| `OnlineMeetings.ReadWrite.All` | Application | Meeting write operations only when genuinely executed | meeting_discovery (write paths) | Yes | Meeting metadata | Medium | Only if write path used | Retain when write ops are certified |
| `OnlineMeetingTranscript.Read.All` | Application | Retrieve post-meeting transcripts **and** authorize transcript change-notification subscriptions for resources such as `communications/onlineMeetings/getAllTranscripts` | transcript_retrieval, webhook_events, subscription_renewal | Yes | Transcript content, speakers; subscription metadata for that resource | High | Required for transcript ingest and transcript subscription lifecycle | Required for live transcript (Gate S) and subscription Gates M–P |
| `OnlineMeetingArtifact.Read.All` | Application | Meeting artifacts when transcript linked via artifact APIs | transcript_retrieval | Yes | Artifact metadata | Medium | Optional depending on Graph path | Experimental / as needed |
| `Calendars.Read` | Application/Delegated | Locate scheduled meetings by organizer calendar | meeting_discovery | Often yes | Calendar subjects, times | Medium | Prefer OnlineMeetings where possible | Optional |
| `User.Read.All` | Application | Resolve participant AAD object to display metadata | participant_metadata | Yes | Directory display names | Medium | Prefer meeting attendance API ids | Minimize; avoid if possible |
| `Calls.AccessMedia.All` / CallRecords | Application | Media / bot / recording paths | bot_join, recording_access, live_transcript | Yes | Media streams | Critical | **Not requested** | unsupported |

## Subscription authorization (resource-specific)

Microsoft Graph does **not** expose a generic application permission named `Subscription.ReadWrite.All` / `Subscriptions.ReadWrite.All` for this path.

Creating a change-notification subscription requires the **application permission for the subscribed resource**. Example:

| Resource | Required application role |
|----------|---------------------------|
| `communications/onlineMeetings/getAllTranscripts` | `OnlineMeetingTranscript.Read.All` |
| `communications/onlineMeetings/{onlineMeetingId}/transcripts` | `OnlineMeetingTranscript.Read.All` |
| `users/{userId}/onlineMeetings/getAllTranscripts` | `OnlineMeetingTranscript.Read.All` |

Unknown resources fail closed with `TEAMS_SUBSCRIPTION_RESOURCE_UNSUPPORTED`.

## Explicitly not requested

- Bot join / media access permissions
- Recording download permissions
- Broad `Directory.ReadWrite.All`
- Permissions solely for convenience

## Fail-closed behaviour

Missing required consent → `TEAMS_GRAPH_ADMIN_CONSENT_REQUIRED` / `teams_provider_permission_missing` / `teams_provider_consent_required`.  
Do not degrade to fixture mode during Phase 6C-3E. Transcripts are not fabricated. Meetings remain processable via manual provider.
