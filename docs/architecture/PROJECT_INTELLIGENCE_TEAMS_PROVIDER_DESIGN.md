# Project Intelligence — Teams Provider Design

**Phase:** 6C-3C  
**Status:** Design only — **unavailable** in product  
**Product:** Engineering OS → Project Intelligence → Meetings  

## Verdict

Microsoft Teams is **not** certified for live meeting capture in Phase 6C-3C.  
Manual provider remains the only certified path. This document locks the future Teams design so UI/API claims stay honest.

## Scope

| In scope (design) | Out of scope (this phase) |
|-------------------|---------------------------|
| Bot join / Graph webhook contract sketch | Live Teams joins |
| Identity + tenant mapping | Production Graph secrets in cert |
| Transcript event durability model | Zoom / Google Meet deep design |
| Failure and consent gates | Auto Core writes from Teams speech |

## Target architecture (future)

```text
Teams meeting
  → Graph / bot adapter (project_intelligence meeting provider = microsoft_teams)
    → durable transcript ingest (provider_event_id + provider_sequence)
      → same processing jobs as manual (normalize → proposals → minutes)
        → human review → optional Core convert
```

## Availability contract

| Surface | Required behaviour until live cert |
|---------|-----------------------------------|
| Provider status | `MEETING_PROVIDER_STATUS.microsoft_teams = "unavailable"` |
| Create/schedule | Reject non-manual providers |
| UI | Actions disabled; no “Connect Teams” enablement |
| Marketing / release notes | Must not claim Teams readiness |

## Design constraints (when implementation starts)

1. **Same domain tables** — no parallel `meeting_sessions` namespace; use `project_intelligence_meeting_*`.
2. **Persist before broadcast** — Teams webhooks write transcript rows before realtime fan-out.
3. **Consent / recording notice** — must resolve before `live` / recording-class states.
4. **No auto-approve** — Teams-sourced proposals follow the same human review gate.
5. **Governed AI only** — Whisper / summarization through Platform adapters; fail closed with retry.
6. **Multi-instance safe** — no in-process-only Graph dedupe.

## Open design questions (tracked)

1. Application vs resource consent model for Graph
2. Bot vs meeting artifact API for transcript quality
3. Mapping Teams organizer identities to Platform profiles
4. Retention of Teams media blobs vs transcript-only retention

## Related

- `PROJECT_INTELLIGENCE_MEETING_INTEGRATION_DECISIONS.md` (D5 manual-first)
- `PROJECT_INTELLIGENCE_MEETING_PROVIDER_STATUS.md`
- `packages/project-intelligence/src/meetings/providers.ts`
