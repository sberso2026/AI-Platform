# Project Intelligence — Meeting Capability Inventory

**Phase:** 6C-3A Discovery Lock  
**Frozen source:** `sberso2026/rtb-project-intelligence`  
**Tag:** `project-intelligence-integration-baseline-1`  
**SHA:** `ab1f44276715888123d9f669464987e6f7c39b6c`  
**Document Intelligence baseline (dependency):** `dfcf6a1c69b6119ab8a34fcc1bfeae93ae34ee53` (GitHub run `29243461662`)  
**Status:** Discovery only — no schema or runtime port in this batch

## Purpose

Inventory Meeting Intelligence capabilities in the frozen standalone Project Intelligence application before any capability port into the integrated RTB AI Platform Project Intelligence application.

Meetings remain a **feature of Project Intelligence** inside Engineering OS. This inventory does not authorize a separate Meeting Intelligence commercial product.

## Classification legend

| Class | Meaning |
|-------|---------|
| **preserve unchanged** | Behaviour is correct; port with minimal rewrite |
| **preserve with adapter** | Keep behaviour; wrap for Platform auth, tenancy, entitlement |
| **modernize** | Keep intent; redesign for durable jobs, RLS, lifecycle, Core ownership |
| **replace with Platform service** | Prefer Platform AI / commerce / observability instead of standalone stack |
| **defer** | Valuable later; not required for manual certification path |
| **experimental** | Present but not production-evidenceable |
| **retire after compatibility review** | Remove after equivalence proof; do not delete stub prematurely |

---

## 1. Routes and UI

| Capability | Frozen path | Classification |
|------------|-------------|----------------|
| Meetings list/workspace | `app/meetings/page.tsx`, `components/platform/MeetingsWorkspace.tsx` | modernize → `/engineering/apps/project-intelligence/meetings` |
| Live meeting workspace | `app/meetings/live/page.tsx`, `MeetingsLiveWorkspace.tsx` | modernize → `.../meetings/[id]/live` |
| Minutes of Meeting editor | `app/meetings/[meetingId]/mom/page.tsx`, `components/mom/*` | modernize → `.../minutes` + review |
| Transcript panel | `components/TranscriptPanel.tsx` | preserve with adapter |
| Speaker UI | `components/meeting/Speaker*.tsx` | modernize (first-class participants) |
| Chair assistant label (Thor text) | Live workspace “AI chair assistant” card (`MeetingsLiveWorkspace.tsx`) | modernize (non-authoritative assist only) |
| Chair / welcome voice | `lib/meeting/meetingWelcomeVoice.ts`; voice mode `chairAssist` in `types/voice.ts` + `services/voice/*` | modernize (+ consent/recording notice); TTS may defer vs manual cert |

**Missing vs target:** `/meetings/new`, `/transcript`, `/review`, `/health`, Engineering Apps prefix.

---

## 2. Session services and APIs

| Capability | Frozen path | Classification |
|------------|-------------|----------------|
| Start session | `lib/meeting/startMeetingSession.ts`, `POST /api/meeting/start` | preserve with adapter |
| Stop session | `lib/meeting/stopMeetingSession.ts`, session stop routes | preserve with adapter |
| List/get sessions | `listMeetingSessionsCompat.ts`, session routes | modernize |
| Session insert compat | `createMeetingSessionRow.ts`, `meetingSessionInsertCompat.ts` | retire after compatibility review (schema normalized) |
| Legacy stop | `POST /api/meeting/stop` (410) | preserve unchanged (keep disabled) |
| Route auth | `lib/meeting/meetingRouteAuth.ts` | replace with Platform Engineering API + entitlement |

**Lifecycle today:** session `active` / `stopped` only.  
**Target lifecycle:** draft → scheduled → connecting → connected → recording → transcribing → live → paused → ended → processing → minutes_draft → review_pending → approved → completed / failed / cancelled / archived.

---

## 3. Provider adapters

| Capability | Frozen path | Classification |
|------------|-------------|----------------|
| Adapter interface | `integrations/meetingAdapter.ts` | preserve unchanged |
| Adapter factory | `integrations/getMeetingAdapter.ts` | preserve with adapter |
| Manual adapter | `integrations/manualMeetingAdapter.ts` | **preserve unchanged** (Phase 6C-3 cert target) |
| Teams bot client | `integrations/teamsBot.ts` | experimental |
| Zoom bot client | `integrations/zoomBot.ts` | experimental |
| Google Meet bot client | `integrations/googleMeetBot.ts` | experimental |
| Bot master flag | `lib/meeting/teamsBotFeature.ts` (`RTB_TEAMS_BOT_ENABLED`) | modernize (rename; document) |
| URL validation | `lib/meeting/meetingUrlValidation.ts` | preserve with adapter |
| Microsoft Graph parse | `lib/meeting/microsoftGraphOnlineMeeting.ts` | defer / experimental |
| Graph webhook dedupe | `lib/meeting/graphWebhookDedupe.ts` (in-process TTL) | modernize before any live use |
| Graph webhook route | `app/api/webhooks/microsoft-graph/route.ts` | experimental |
| Graph webhook job | `jobs/graph/graphWebhookJob.ts` | defer (empty stub) |

---

## 4. Transcript, speech, NLP

| Capability | Frozen path | Classification |
|------------|-------------|----------------|
| Whisper transcription | `services/transcription.ts` (`OPENAI_API_KEY`, `OPENAI_WHISPER_MODEL`) | replace with Platform service / governed adapter |
| Transcription gateway | `infrastructure/ai/transcriptionGateway.ts` | retire after compatibility review (empty stub) |
| Transcription job | `jobs/meetings/transcriptionJob.ts` | defer (empty stub) |
| NLP engine | `services/nlpEngine.ts` | modernize |
| Transcript repository | `infrastructure/supabase/repositories/transcriptRepository.ts` | modernize → durable segments |
| Realtime pipeline | `services/realtimePipeline.ts` | modernize (durable + multi-instance) |
| Dev WS mock server | `scripts/realtime-pipeline-server.ts` | experimental (not production host) |
| WS URL API | `app/api/realtime/ws-url/route.ts` | preserve with adapter |
| Client reconnect backoff | `lib/realtime/realtimeReconnectBackoff.ts` | preserve unchanged |
| Realtime hooks | `hooks/useRealtimePipelineSocket.ts`, `useMeetingIntelligenceRealtime.ts` | preserve with adapter |

---

## 5. Participants and speakers

| Capability | Frozen path | Classification |
|------------|-------------|----------------|
| Roster ingestion | `services/meeting/rosterIngestionService.ts` | modernize → `project_intelligence_meeting_participants` |
| Speaker attribution | `speakerAttributionService.ts` | modernize |
| Speaker confidence | `speakerConfidenceService.ts` | preserve with adapter |
| Speaker verification | `speakerVerificationService.ts` | preserve with adapter |
| Roster APIs | `/api/meeting/roster`, `/speakers`, `/speaker-verify` | modernize |
| Metadata roster storage | `meeting_sessions.metadata` (`rtb_roster`) | retire after table port |

---

## 6. Minutes, extraction, review

| Capability | Frozen path | Classification |
|------------|-------------|----------------|
| Deterministic MoM generator | `services/momGenerator.ts` | preserve with adapter |
| MoM draft/persistence/export/share | `services/mom/*` | preserve with adapter |
| MoM approval (no auto-approve) | `momApprovalService.ts`, `POST /api/mom/approve` | modernize → proposals + Core write gate |
| MoM statuses | `types/mom.ts` (`draft`/`reviewed`/`approved`) | modernize (align session + review lifecycle) |
| MoM evidence types | `types/momEvidence.ts`, evidence tests | modernize → meeting evidence + Doc Intelligence citations |
| Meeting → decision draft | `services/ai/workflows/meetingToDecision.ts` | modernize (proposal only; Core on human approve) |
| Action/risk cue extraction | **No** standalone `actionRiskExtraction.ts` at freeze — cues live in `nlpEngine` / `momGenerator` / realtime pipeline | modernize (typed proposals) |
| Issue / TQ / lesson extraction | not first-class in frozen meeting stack | modernize (new proposal types) |
| Findings linkage | engineering findings exist; **no meeting glue** | defer |
| MoM generation job | `jobs/mom/momGenerationJob.ts` | defer (empty stub) |
| AI human review queue (answers) | `services/ai/humanReviewQueue.ts` | replace with Platform / PI review items (meeting-specific) |

---

## 7. Data model (frozen)

| Table | Migration | Classification |
|-------|-----------|----------------|
| `meeting_sessions` | `20260418140000_meeting_sessions.sql` (+ title/started_at) | modernize → `project_intelligence_meeting_sessions` |
| `meeting_transcripts` | `20260418140500_meeting_transcripts_and_nlp.sql` | modernize → transcript segments + revisions |
| `meeting_nlp_analyses` | same | modernize / defer (may fold into processing runs + traces) |
| `meeting_minutes` | `20260418143500_meeting_minutes.sql` | modernize → minutes + versions |

**Absent in frozen (required for target):** participants table, transcript revisions, meeting events, processing runs, proposals, review items, minutes versions, meeting evidence, provider event id durability, full lifecycle enum.

---

## 8. Tests (frozen)

| Area | Paths | Classification |
|------|-------|----------------|
| Session/API | `tests/api/meetingStartRoute.test.ts`, `tests/lib/startMeetingSession*.ts`, compat/url/public session | preserve with adapter (equivalence) |
| MoM | `tests/mom/*` (approval, export, persistence, evidence, page) | preserve with adapter |
| Realtime | `tests/hooks/useRealtimePipelineSocket.test.ts`, `tests/lib/realtimeReconnectBackoff.test.ts`, `tests/realtime/*` | preserve unchanged / adapt |
| Speakers | `tests/speaker/*` | preserve with adapter |
| Platform UI | `tests/platform/meetings*.test.ts` | modernize |
| Security | `tests/security/legacy-meeting-routes-disabled.test.ts` | preserve unchanged |
| Graph | `tests/meeting/microsoftGraphOnlineMeeting.test.ts` | defer / experimental |

---

## 9. Feature flags and env (frozen)

| Variable | Role | Classification |
|----------|------|----------------|
| `RTB_TEAMS_BOT_ENABLED` | Gates all external bots | modernize (document; default off) |
| `TEAMS_BOT_*` / `ZOOM_BOT_*` / `GOOGLE_MEET_BOT_*` | External bot HTTP | experimental |
| `REALTIME_PIPELINE_WS_URL` / `NEXT_PUBLIC_*` | WS endpoint | modernize |
| `OPENAI_API_KEY` / `OPENAI_WHISPER_MODEL` | Whisper | replace with Platform governed AI |
| `GRAPH_WEBHOOK_*` | Graph webhook | experimental |
| `MOM_*` export/attribution | MoM export | preserve with adapter |
| Welcome voice | `lib/meeting/meetingWelcomeVoice.ts` (`buildMeetingWelcomeScript`) — **no** `NEXT_PUBLIC_RTB_MEETING_WELCOME_VOICE` env gate at freeze | modernize (+ privacy / recording disclosure) |

---

## 10. Incomplete stubs and experimental surfaces

| Item | Path | Classification |
|------|------|----------------|
| Empty transcription job | `jobs/meetings/transcriptionJob.ts` | defer |
| Empty MoM job | `jobs/mom/momGenerationJob.ts` | defer |
| Empty Graph job | `jobs/graph/graphWebhookJob.ts` | defer |
| Empty transcription gateway | `infrastructure/ai/transcriptionGateway.ts` | retire after review |
| In-process Graph dedupe | `graphWebhookDedupe.ts` | modernize before live |
| Dev-only realtime server | `scripts/realtime-pipeline-server.ts` | experimental |
| Provider bots without live cert | `*Bot.ts` | experimental |

---

## 11. Privacy and consent gaps (frozen)

- No recording notice / consent state in meeting UI
- Welcome voice omits recording disclosure
- Graph webhook can create sessions without participant notice
- No retention / legal-hold columns in meeting migrations
- Authenticated INSERT on transcripts without consent flag

See `docs/security/PROJECT_INTELLIGENCE_MEETING_PRIVACY.md`.

---

## 12. Summary counts (frozen)

| Category | Approx. count |
|----------|----------------|
| Meeting-related source files matched | ~184 |
| UI routes | 3 |
| Meeting API route files | 9+ |
| MoM API route files | 8 |
| Meeting SQL migrations | 5 |
| First-class meeting tables | 4 |
| Empty job stubs | 3 |
| Provider bot clients | 3 (+ manual) |

**Port priority for certification:** manual session + durable transcript + minutes + human review → Core writes + Doc Intelligence citations.  
**Explicit non-goals until later batches:** live Teams/Zoom/Google certification.
