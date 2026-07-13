# Project Intelligence — Meeting Integration Decisions

**Phase:** 6C-3A Discovery Lock  
**Status:** Approved for documentation; binding for subsequent 6C-3 batches unless explicitly revised

## Decision Status

| Field | Value |
|---|---|
| Decision | Approved |
| Phase | 6C-3A |
| Initial implementation phase | 6C-3B |
| Product | Project Intelligence |
| Capability | Meetings |
| External providers | Deferred |
| Automatic Engineering Core writes | Prohibited |

## D1 — Product placement

**Decision:** Meetings is a **feature of Project Intelligence**, not a separate commercial application.

```text
RTB Engineering OS
└── Project Intelligence
    ├── Documents
    ├── Meetings
    ├── Review Queue
    ├── Reports
    ├── Analytics
    ├── AI Workspace
    ├── Health
    └── Settings
```

**Rationale:** Matches Phase 6B integration decisions; avoids fragmenting engineering AI UX; Document Intelligence and Meetings share entitlement and shell.

**Rejected for now:** Splitting to a sibling Meeting Intelligence product (may be revisited only with explicit commercial approval).

## D2 — Entitlement model

**Decision:**

| Layer | Key |
|-------|-----|
| Application | `project-intelligence` (commerce: `project_intelligence`) |
| Feature | `meetings` |

**Do not** create `project-intelligence-meetings` as a separate **application** entitlement unless a separate commercial add-on is explicitly approved.

**Note:** Existing commerce catalog already has application_key `meetings` and path policy `/engineering/meetings`. 6C-3B+ must reconcile:

1. Preferred: guard PI meeting routes under `project_intelligence` + feature flag/entitlement `meetings`, and treat legacy commerce `meetings` as alias or migrate carefully; **or**
2. If product insists on commerce application_key `meetings`, document alias mapping to PI feature without enabling the `meeting_intelligence` registry stub.

## D3 — Registry stub retention

**Decision:** Keep `meeting_intelligence` engineering registry stub **registered and disabled**. Do not delete in 6C-3A/6C-3B without stub dependency review sign-off.

See `docs/migration/PROJECT_INTELLIGENCE_MEETING_STUB_DEPENDENCY_ANALYSIS.md`.

## D4 — Routes

**Decision:** Target routes under Project Intelligence:

- `/engineering/apps/project-intelligence/meetings`
- `/engineering/apps/project-intelligence/meetings/new`
- `/engineering/apps/project-intelligence/meetings/[meetingId]`
- `.../live`, `.../transcript`, `.../review`, `.../minutes`
- `.../health`

Frozen `/meetings` paths are compatibility references only; not production routes in AI Platform.

## D5 — Manual-first certification

**Decision:** Phase 6C-3 certifies **manual** provider only. Teams/Zoom/Google Meet remain **unavailable** in product claims until provider-specific live certification exists.

## D6 — Human review before Core

**Decision:** No AI proposal may mutate Engineering Core without human review and approve. Mirror Document Intelligence findings pattern (`canMutateCore: false` until approve path).

## D7 — Document grounding

**Decision:** Meeting claims that cite documents must use certified Phase 6C-2 Document Intelligence retrieval (OpenAI embeddings 1536, hash disabled, Azure DI where applicable). Citations mandatory for grounded claims.

**Document Intelligence baseline:** `dfcf6a1c69b6119ab8a34fcc1bfeae93ae34ee53` (run `29243461662`).

## D8 — Realtime

**Decision:** Port reconnect/backoff behaviour from frozen client. Do not treat the frozen in-process/dev WS server as production architecture. Production realtime must be multi-instance safe and durable-event compatible.

## D9 — Schema naming

**Decision:** New AI Platform tables use `project_intelligence_*` prefixes. Do not create bare `meeting_sessions` in the hosted Platform DB (avoids colliding with any future legacy import staging).

## D10 — Batch sequencing

| Batch | Scope |
|-------|-------|
| **6C-3A** | Discovery lock docs (this set) — **no runtime** |
| **6C-3B** | Schema/RLS + state machine + manual session APIs (draft→ended skeleton) |
| Later | Transcript durability, minutes, extraction, review, Core writes, Doc citations, realtime cert, browser E2E, Gates A–S |

## Meeting lifecycle (design lock for 6C-3B)

```text
draft → scheduled → connecting → connected → recording → transcribing
  → live ⇄ paused → ended → processing → minutes_draft → review_pending
  → approved → completed
             ↘ failed | cancelled | archived
```

External meeting providers remain deferred. Automatic Engineering Core writes remain prohibited.

## Open items (tracked, not blocking 6C-3A)

1. Exact commerce reconciliation between application_key `meetings` and PI feature `meetings`
2. Whether MoM PDF/DOCX stays in-process or moves to Platform export service
3. Whisper via Platform AI gateway vs meeting-local governed adapter
4. Timing of `meeting_intelligence` stub retirement after PI meetings GA
