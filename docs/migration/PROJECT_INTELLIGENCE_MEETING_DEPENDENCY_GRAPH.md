# Project Intelligence Meeting Dependency Graph

## Document Status

| Field | Value |
|---|---|
| Phase | 6C-3A |
| Deliverable | Meeting Intelligence Discovery Lock |
| Status | Approved discovery baseline |
| Runtime changes | None |
| Schema changes | None |
| Frozen source repository | `sberso2026/rtb-project-intelligence` |
| Frozen source tag | `project-intelligence-integration-baseline-1` |
| Frozen source SHA | `ab1f44276715888123d9f669464987e6f7c39b6c` |
| Certified Document Intelligence baseline | `dfcf6a1c69b6119ab8a34fcc1bfeae93ae34ee53` |
| Document Intelligence certification run | `29243461662` |

## Purpose

This document maps the dependencies of the existing Meeting Intelligence capability in the frozen standalone Project Intelligence application and defines how each dependency will be treated during integration into RTB Engineering OS.

The target product model is:

```text
RTB Engineering OS
└── Project Intelligence
    └── Meetings
```

## Primary dependency groups

```text
Frozen Meeting Intelligence (ab1f442)
├── Session / manual adapter          → modernize into PI meetings domain
├── MoM generate / approve            → modernize; Core writes only after human approve
├── Transcript / Whisper              → replace with Platform-governed AI path
├── Realtime reconnect backoff        → preserve client behaviour; redesign host
├── Teams / Zoom / Google / Graph     → experimental / unavailable until live cert
├── Empty job stubs                   → defer / replace with durable workers
└── Privacy / consent (missing)       → design controls before runtime enablement

AI Platform (current)
├── project_intelligence app          → host Meetings feature
├── meeting_intelligence stub         → keep disabled (do not delete in 6C-3A)
├── commerce key meetings             → reconcile carefully (not the stub)
└── Document Intelligence (dfcf6a1)   → required grounding dependency
```

## Layered dependency graph (target integrated stack)

```text
UI (Engineering Apps / Project Intelligence / Meetings)
  → Routes (/meetings, /new, /[id], /live, /transcript, /health)
    → APIs (/api/engineering/project-intelligence/meetings/*)
      → Access guard (tenant→…→feature meetings)
        → Domain services (manual session, participants, transcript append)
          → State machine + privacy/consent policy
            → Repositories (Supabase client / RPCs)
              → Tables (project_intelligence_meeting_*)
              → Events / outbox / jobs (foundation; workers later)
                → Realtime (deferred host; reconnect client later)
                → AI (deferred Whisper / extraction)
                → Storage (deferred audio blobs)
                → Providers (manual certified_candidate; Teams/Zoom/Meet unavailable)
                → Engineering Core adapters (deferred — no writes in 6C-3B)
                → Document Intelligence (dfcf6a1) (deferred grounding — baseline unchanged)
                → Certification (6C-3B gates A–S)
```

## Related documents

- `PROJECT_INTELLIGENCE_MEETING_CAPABILITY_INVENTORY.md`
- `PROJECT_INTELLIGENCE_MEETING_EQUIVALENCE_MATRIX.md`
- `PROJECT_INTELLIGENCE_MEETING_PROVIDER_STATUS.md`
- `PROJECT_INTELLIGENCE_MEETING_STUB_DEPENDENCY_ANALYSIS.md`
- `PROJECT_INTELLIGENCE_MEETING_DATA_OWNERSHIP.md`
- `PROJECT_INTELLIGENCE_MEETING_INTEGRATION_DECISIONS.md`
- `PROJECT_INTELLIGENCE_MEETING_PRIVACY.md`
