# Project Intelligence — Meeting Equivalence Matrix

**Phase:** 6C-3A Discovery Lock → **6C-3C processing extensions**  
**Frozen:** `ab1f44276715888123d9f669464987e6f7c39b6c`  
**Target:** Integrated Project Intelligence Meetings feature (Engineering OS)

Maps frozen standalone capabilities to integrated target surfaces. Equivalence is behavioural, not byte-for-byte path identity.

## Product placement

| Frozen | Target |
|--------|--------|
| Standalone Next app `/meetings` | Engineering OS → Project Intelligence → Meetings feature |
| Separate MoM sub-app feel | Same PI shell; routes under `/engineering/apps/project-intelligence/meetings/...` |

## Route equivalence

| Frozen route | Target route | Equivalence notes |
|--------------|--------------|-------------------|
| `/meetings` | `/engineering/apps/project-intelligence/meetings` | List + create entry |
| — | `/engineering/apps/project-intelligence/meetings/new` | Explicit create (new) |
| `/meetings/live` | `/engineering/apps/project-intelligence/meetings/[meetingId]/live` | Live must be meeting-scoped |
| `/meetings/[meetingId]/mom` | `.../[meetingId]/minutes` + `.../review` | Split editor vs human review |
| — | `.../[meetingId]/transcript` | First-class transcript view |
| — | `.../[meetingId]` | Meeting detail / status |
| — | `.../health` | Processing health (mirror documents) |
| `/api/meeting/*` | `/api/engineering/project-intelligence/meetings/*` | Platform auth + entitlement |
| `/api/mom/*` | Nested under meetings minutes/review APIs | Collapse MoM namespace |
| `/api/realtime/ws-url` | PI meetings realtime contract | Platform-authenticated |

## Domain equivalence

| Frozen concept | Target entity | Notes |
|----------------|---------------|-------|
| `meeting_sessions` | `project_intelligence_meeting_sessions` | Full lifecycle enum; workspace + project scope |
| `metadata.rtb_roster` | `project_intelligence_meeting_participants` | First-class rows |
| `meeting_transcripts` | `project_intelligence_transcript_segments` | provider_event_id, sequence, confidence, revision, correlation_id |
| — | `project_intelligence_transcript_revisions` | Revision / supersede |
| — | `project_intelligence_meeting_events` | Provider + domain events |
| — | `project_intelligence_meeting_processing_runs` | Durable processing |
| MoM jsonb decisions/actions/risks | `project_intelligence_meeting_proposals` | Typed proposals; not Core |
| MoM `metadata.momWorkflow` | `project_intelligence_meeting_review_items` | Human review gate |
| `meeting_minutes` | `project_intelligence_meeting_minutes` + `_versions` | Versioned drafts |
| MoM evidence / retrieval counts | `project_intelligence_meeting_evidence` | Doc Intelligence citations required when grounded |
| Draft workflows | Proposal generators | Still draft until approve |
| MoM approve → minutes only | Approve → **Engineering Core** write + backlink | **New required equivalence** |
| NLP analyses table | Processing traces / proposal metadata | May fold; not Core |

## Lifecycle equivalence

| Frozen | Target mapping |
|--------|----------------|
| (implicit pre-start) | `draft`, `scheduled` |
| Bot/WS connecting | `connecting`, `connected` |
| Recording / Whisper | `recording`, `transcribing` |
| `status=active` | `live` (and optionally `paused`) |
| `status=stopped` | `ended` → `processing` |
| MoM generate | `minutes_draft` |
| MoM reviewed | `review_pending` |
| MoM approved | `approved` → `completed` |
| — | `failed`, `cancelled`, `archived` |

## Phase 6C-3C processing equivalence

| Frozen / required behaviour | Target implementation | Status |
|-----------------------------|----------------------|--------|
| Stop → async MoM pipeline | `MeetingProcessingService.enqueueProcessing` + durable jobs | Domain services |
| Deterministic cue extraction (`ACTION:`, `DECIDE:`, …) | `MeetingProposalExtractionService` + `DeterministicMeetingAiAdapter` | Domain services |
| Deterministic MoM sections | `MeetingMinutesGenerationService` + minutes versioning | Domain services |
| No auto-approve / no auto-issue | `MeetingReviewService` human-only gates | Domain services |
| No Core write until approve | `MeetingEngineeringCoreWriteAdapter` + `assertProposalConvertible` | Domain services |
| Document citations for grounded claims | `MeetingDocumentGroundingAdapter` (fail closed / abstain) | Domain services |
| Job claim / retry / dead letter | `ProjectIntelligenceMeetingWorker` + Batch 39 RPCs | Domain services |
| Persist before broadcast | Transcript ingest publisher (6C-3C) | Prior batch + preserved |
| Teams / Zoom / Meet live | Explicit `unavailable` | Design only |

## Behavioural equivalence checklist (cert Gate R)

| Behaviour | Frozen | Target must prove |
|-----------|--------|-------------------|
| Manual start without bots | Yes | Yes |
| Stop ends session | Yes | Yes |
| Transcript persistence | Yes (flat rows) | Yes (ordered segments) |
| Deterministic minutes | Yes | Yes |
| No auto-approve MoM | Yes | Yes + no auto Core write |
| Export PDF/DOCX | Yes | Preserve or Platform export |
| Reconnect backoff | Yes | Yes |
| Provider bots | Optional, gated | Explicit `unavailable` until live cert |
| Core authoritative registers | No | Yes on human approve |

## Non-equivalent (intentional)

| Frozen | Not carried as-is |
|--------|-------------------|
| `/meetings` outside Engineering Apps | Retired after compatibility review |
| Parallel PI IdP tenancy patterns | Platform tenancy only |
| In-memory Graph dedupe | Not multi-instance safe |
| Empty queue jobs as “jobs” | Real durable workers required |
| Claiming Teams/Zoom/Meet ready | Forbidden without live provider evidence |
