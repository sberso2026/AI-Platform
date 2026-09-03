# EOS-PILOT-PRODUCT-1A — product audit

**Host:** https://eos-pilot.rtbea.com.au  
**Scope:** authenticated Engineering OS Preview. Code and live API review. Viewport screenshots at 1440×900 and 1920×1080 were not captured in this agent environment (no authenticated browser session). Founder inspection remains required.

Assessment is of rendered page composition in source, not “route exists”.

## HIGH findings (from EOS-AI-RELIABILITY-1R)

### HIGH-1 Duplicate retrieval candidates (`rank_1_margin=0`)

| Field | Value |
|---|---|
| ID | HIGH-1 |
| description | Equivalent page-14 guard chunks from repeated ingestions tied at fusion score, so rank-1 margin was 0 and the source list mixed duplicates. |
| affected workflow | Engineering AI Ask on Current Document |
| root cause | Duplicate ingestion runs. The document worker only superseded chunks for the same `ingestion_id`, so re-index left prior `project_intelligence_document_chunks` rows active. Retrieval then fused identical `content_hash` / overlapping page windows as separate candidates. Not a second canonical document and not a second source file. |
| user impact | Duplicate source cards; weak ranking diagnostics. |
| security/data impact | None. Duplicate authorised text from the same document revision. No cross-tenant leak. |
| status | Remediated |
| remediation | Provenance-aware candidate dedupe before evidence assembly (`content_hash`, normalized text overlap, same page + clause). Worker now supersedes prior chunks for the same document revision before insert. Existing duplicate rows are not hard-deleted. |

### HIGH-2 Neighbouring / extra evidence in the answer surface

| Field | Value |
|---|---|
| ID | HIGH-2 |
| description | Thickness answers cited 1.5 mm correctly but also showed overlapping figure windows, rotating-parts text, committee preface, and generated extra on-page requirements (mesh/deflection). |
| affected workflow | Engineering AI Ask answer + Evidence list |
| root cause | Overlapping legitimate chunks plus prototype chat layout that dumped the generated paragraph and raw excerpts. Duplicate figure/body windows were the same clause; page 17 / page 2 are distinct clauses that survived lexical overlap. |
| user impact | Diluted factual answer; users must hunt for the governing clause. |
| security/data impact | None. Same Current Document. No invented standard numbers from other documents in the certified run. |
| status | Partially remediated |
| remediation | Overlapping same-page/same-clause and same-hash windows collapse. Ask UI is Answer / Why / Evidence / Limitations without repeating the chunk under Answer. Distinct neighbouring clauses may still appear (max 6). Remaining presentation risk is MEDIUM, not a silent HIGH downgrade of unfixed duplicate ingestions. |

## Surfaces

| Surface | Composition | Notes |
|---|---|---|
| Command Centre | OperationalPageIntro, skeleton, single dashboard fetch, work queues | Strongest operational page. UUID not primary. |
| Projects | EngineeringListPage / StatusTable | Human codes and names. Create flow exists. |
| Project Detail | Workspace tabs + breadcrumb | Dense; more-tabs overflow. |
| Assets | List + 360 tabs | Recorded data only. |
| Inspections | Module shell + workflow strip | Hosted II workbench is heavier than core registers. |
| Documents | Register + upload + detail + Ask this document | Upload extracts metadata; detail has review/confirm/ingest. |
| Risks / TQ / Decisions / Actions | Shared list page | Consistent tables, empty, error. |
| Engineering AI | AskEngineeringShell | Redesigned evidence workspace; scope chips labelled. |
| Reports / Models / Digital Twin | Module shells | Functional, more specialised chrome. |
| Users, Licences, Administration | Platform pages | Separate visual language from Engineering registers. |

## Checks

- Navigation: primary sidebar + project filter in header. Scope on Ask is obvious.
- Hierarchy: Header `PageHeader` + `page-main` padding. Ask now uses labelled Answer/Why/Evidence.
- Forms: labeled fields on upload/new project. Raw project UUID is not the selector label.
- Loading: OperationalSkeleton / list loading. Ask uses “Asking…”.
- Empty/error: OperationalError + EmptyOperationalState.
- Accessibility: many `data-testid`s, some `sr-only`; Ask why toggle tests removed from visible chrome. Keyboard/focus not fully re-verified.
- Implementation leakage: diagnostics behind Show details. Context no longer prints document UUID.

## UX flags (code-reviewed; founder visual QA outstanding)

Pages that reuse EngineeringListPage/operational primitives are closer to PASS. Specialised module workbenches (Digital Twin, Model Interop, Inspection hosted) remain denser and more prototype-like.
