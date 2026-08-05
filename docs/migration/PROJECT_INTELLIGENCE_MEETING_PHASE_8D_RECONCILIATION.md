# Project Intelligence Meeting Intelligence — Phase 8D Reconciliation

**Platform:** RTB AI Platform  
**Phase:** 8D — Meeting Intelligence Module Integration and Production Closure  
**Baselines:** 7B `1a2c76f…`, 8A `3d66906…`, 8B `118f933…`, 8C `b8be2cc…`  
**Meeting baselines:** 6C-3B `ac84bd4…`, 6C-3C `daf3903…`, Teams fixture 6C-3D `148223e…`  
**Teams live:** `conditionally_deferred` (not production-certified)

## Intent

Integrate the **existing certified Meeting Intelligence runtime** into Engineering OS /
Project Intelligence. **Do not rebuild.** Provider-neutral readiness must not depend on
Microsoft Teams live.

## Classification legend

| Class | Meaning |
|-------|---------|
| Preserve | Keep certified behaviour under feature `meeting_intelligence` |
| Rebind | Bind to shared Engineering Services / Platform AI |
| Consolidate | Single owned path under PI shell |
| Replace legacy adapter | Equivalence / stub adapters only |
| Retire duplicate | No competing meeting runtime |
| Defer | Out of 8D (Teams live, Zoom, Google Meet, bot join) |
| Provider-specific | Teams fixture/live only |

## Inventory

| Component | Class | Notes |
|-----------|-------|-------|
| Feature registration (`meeting_intelligence`) | Preserve | Under `project_intelligence` |
| PI shell navigation | Preserve | Meeting Intelligence tab |
| Meetings UI / APIs | Preserve | `/engineering/apps/project-intelligence/meetings/**` |
| Manual lifecycle | Preserve | Certified |
| Transcript / revisions / realtime | Preserve | Persist-before-broadcast |
| Durable processing / outbox / SKIP LOCKED | Preserve | 6C-3C |
| Minutes / proposals / review | Preserve | Human approval required |
| Core conversion adapter | Preserve | Approve-then-write; no AI self-approve |
| Document grounding adapter | Rebind | Fail-closed DI adapter; no private retrieval stack |
| Findings handoff | Consolidate | Typed candidate → Findings Intelligence |
| Shared Eng services | Rebind | Binding assertions (8D) |
| Teams fixture | Provider-specific | Certified regression |
| Teams live | Defer | `conditionally_deferred` |
| Zoom / Google Meet | Defer | unavailable |
| Uploaded audio/video providers | Defer | Not implemented — no false certified claim |
| Stub catalogue `meeting_intelligence` app | Preserve disabled | Access rejects as Meetings entitlement app |
| `meeting-intelligence-ready` marker | Consolidate | Added in 8D (keep `project-intelligence-meetings-ready`) |

## Duplicate runtime check

| Candidate | Status |
|-----------|--------|
| Second meetings package | **None** |
| Competing transcript/processing tables | **None** |
| Private AI stack | **Forbidden** (`implementsOwnAiStack: false`) |

## Production readiness semantics

`productionMeetingIntelligenceReady=true` means provider-neutral Meeting Intelligence
(manual + durable paths) is production-ready. It does **not** imply Teams live,
Zoom, Google Meet, bot join, or recording access.
