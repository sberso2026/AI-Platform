# Project Intelligence — Teams Graph Permissions

**Phase:** 6C-3D / 6C-3E  
**Principle:** Least privilege; fail closed when consent missing.

| Permission | Type | Purpose | Capability | Admin consent | Data accessed | Risk | Necessity | Cert status |
|------------|------|---------|------------|---------------|---------------|------|-----------|-------------|
| `OnlineMeetings.Read.All` | Application | Discover / read online meeting metadata | meeting_discovery, session_mapping | Yes | Meeting IDs, organizers, join metadata | Medium | Required for discovery/mapping | Required for live discovery (Gate I) |
| `OnlineMeetingTranscript.Read.All` | Application | Retrieve post-meeting transcripts | transcript_retrieval | Yes | Transcript content, speakers | High | Required for transcript ingest | Required for live transcript (Gate S) unless explicitly classified unavailable |
| `OnlineMeetingArtifact.Read.All` | Application | Meeting artifacts when transcript linked via artifact APIs | transcript_retrieval | Yes | Artifact metadata | Medium | Optional depending on Graph path | Experimental / as needed |
| `Subscription.ReadWrite.All` / equivalent change-notification scope | Application | Create/renew/delete Graph subscriptions | webhook_events, subscription_renewal | Yes | Subscription metadata | Medium | Required for live webhook lifecycle | Required for Gates M–P |
| `Calendars.Read` | Application/Delegated | Locate scheduled meetings by organizer calendar | meeting_discovery | Often yes | Calendar subjects, times | Medium | Prefer OnlineMeetings where possible | Optional |
| `User.Read.All` | Application | Resolve participant AAD object to display metadata | participant_metadata | Yes | Directory display names | Medium | Prefer meeting attendance API ids | Minimize; avoid if possible |
| `Calls.AccessMedia.All` / CallRecords | Application | Media / bot / recording paths | bot_join, recording_access, live_transcript | Yes | Media streams | Critical | **Not requested** | unsupported |

## Explicitly not requested

- Bot join / media access permissions
- Recording download permissions
- Broad `Directory.ReadWrite.All`
- Permissions solely for convenience

## Fail-closed behaviour

Missing required consent → `TEAMS_GRAPH_ADMIN_CONSENT_REQUIRED` / `teams_provider_permission_missing` / `teams_provider_consent_required`.  
Do not degrade to fixture mode during Phase 6C-3E. Transcripts are not fabricated. Meetings remain processable via manual provider.
