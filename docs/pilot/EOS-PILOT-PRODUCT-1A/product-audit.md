# EOS-PILOT-PRODUCT-1A — product audit

**Host:** https://eos-pilot.rtbea.com.au  
**Scope:** authenticated Engineering OS Preview. Assessment combines live API certification, source composition of rendered pages, and authenticated HTML TTFB. Viewport screenshots at 1440×900 and 1920×1080 were **not** captured in this agent environment (no authenticated browser session). Founder visual inspection remains required.

Assessment is of rendered page composition in source and live retrieval, not “route exists”.

## A. Reproducible deployment

| Field | Value |
|---|---|
| Source audited | Working tree at start of this ticket included EOS-AI-DOC-2 ingestion, EOS-AI-RELIABILITY-1R retrieval, Ask presentation, and UAT docs beyond `e7c3788`. Entity-overlap / empty-body abstention and provenance dedupe were valid; they were tested and committed. |
| Working tree at certification commit | Clean |
| Production | `dpl_EF2DKHT59waxGKL28HSvGMpgtDBG` — not promoted |

## B. HIGH finding reconciliation

Do not silently downgrade. External UAT remains blocked while HIGH-2 is open.

### HIGH-1 Duplicate retrieval candidates (`rank_1_margin=0`)

| Field | Value |
|---|---|
| ID | HIGH-1 |
| description | Equivalent page-14 guard chunks from repeated ingestions tied at fusion score, so rank-1 margin was 0 and the source list mixed duplicates. |
| affected workflow | Engineering AI Ask on Current Document |
| root cause | Duplicate ingestion runs. The document worker only superseded chunks for the same `ingestion_id`, so re-index left prior `project_intelligence_document_chunks` rows active. Retrieval fused identical `content_hash` / overlapping page windows as separate candidates. Not a second canonical document and not a second source file. |
| user impact | Duplicate source cards; weak ranking diagnostics. |
| security/data impact | None. Duplicate authorised text from the same document revision. No cross-tenant leak. |
| status | Remediated |
| remediation | Provenance-aware candidate collapse before evidence assembly (`content_hash`, normalized text overlap, same page + clause). Worker supersedes prior chunks for the same document revision before insert. Existing duplicate rows are not hard-deleted. Live recertify: unique rank-1 margin 0.70 on control and perturbed; fused duplicates marked `duplicate_provenance`. |

### HIGH-2 Neighbouring / extra evidence in the answer surface

| Field | Value |
|---|---|
| ID | HIGH-2 |
| description | Thickness answers cite 1.5 mm correctly but also show distinct neighbouring windows (rotating-parts on page 17, committee preface on page 2) and generated extra on-page requirements (mesh/deflection). Duplicate figure/body windows were collapsed. |
| affected workflow | Engineering AI Ask answer + Evidence list |
| root cause | Overlapping legitimate chunks plus prototype chat dump of generated prose. After provenance collapse, unique but weakly related clauses still enter the same-document evidence window (cap 6). Generation then expands nearby requirements. Page 17 / page 2 are distinct clauses, not duplicate provenance. |
| user impact | Diluted factual answer; users must hunt for the governing clause. |
| security/data impact | None. Same Current Document. No cross-document leak in the certified run (`CROSS_DOCUMENT_LEAK_COUNT=0`). |
| status | Open |
| remediation | Duplicate same-hash / same-page-clause windows collapse. Ask UI is Answer / Why / Evidence / Limitations without repeating the raw chunk under Answer. Distinct neighbouring clauses are preserved by design. Residual extra citations and extra generated requirements remain HIGH. |

## C. Duplicate candidate analysis

`DUPLICATE_CANDIDATE_ROOT_CAUSE=duplicate_ingestion_run`

| Hypothesis | Result |
|---|---|
| Duplicate canonical document | No. Same `document_id` `008ff87c-ede6-4007-b94d-480ef54a77e0`. |
| Duplicate source attachment | No. One source file / revision A. |
| Duplicate ingestion run | Yes. Multiple active chunk rows for the same revision; identical fusion 1.30 on page-14 windows. |
| Duplicate chunk | Same `content_hash` / overlapping windows, distinct `stable_chunk_id`. |
| Overlapping legitimate chunks | Yes for neighbouring pages after collapse. |
| Identical evidence from separate chunks | Yes for page-14 duplicates; collapsed with `rejectionReason=duplicate_provenance`. |

## D–E. Live retrieval recertify (Preview)

Control and perturbed gold chunk rank 1. Unique rank-1 margin 0.7000000476837119 (not score manipulation). Citation keys unique after collapse. 12/12 variants PASS. Platform width, crossover, nut mechanical test method, bolt straightness PASS. Abstention PASS. Current Document isolation PASS. Leak count 0. Generation `openai`.

## F–G. Ask / context UX (code + unit tests)

- Answer / Why / Evidence / Limitations layout in `AskEngineeringShell`.
- Context uses document number / title / revision; UUID is not the primary label.
- Scope chips: All Engineering, Current Project, Current Asset/Object, Current Document.
- `retrieval_only`, provider identifiers, chunk IDs, and internal scope terms are behind Show details.
- Source hrefs still contain document UUID and chunk query params so Open source can land on the page. That is not shown as the context title.

Live API message still includes generated extra requirements. UI `presentAskAnswer` compresses the Answer line; Evidence still lists HIGH-2 neighbours.

## Surfaces

| Surface | Composition | UX verdict (this ticket) |
|---|---|---|
| Command Centre | OperationalPageIntro, skeleton, single dashboard fetch, work queues | Code-reviewed; no screenshot. `COMMAND_CENTRE_UX_PASS=false` |
| Projects | EngineeringListPage / human codes and names | Code-reviewed; no screenshot. `PROJECTS_UX_PASS=false` |
| Project Detail | Workspace tabs + breadcrumb | Dense overflow tabs. Not certified. |
| Assets | List + 360 tabs | Code-reviewed; no screenshot. `ASSETS_UX_PASS=false` |
| Inspections | Hosted II workbench + workflow strip | Heavier than core registers. `INSPECTIONS_UX_PASS=false` |
| Documents | Register + upload + detail + Ask this document | Upload extracts metadata; project is searchable by code/name. Not live E2E. `DOCUMENTS_UX_PASS=false` |
| Risks / TQ / Decisions / Actions | Shared RegisterShell / list page | Consistent tables, empty, error in source. Page UX not screenshot-certified. |
| Engineering AI | AskEngineeringShell on `/engineering/ask` and `/engineering/ai` | Answer workspace implemented; HIGH-2 open. `ENGINEERING_AI_UX_PASS=false` |
| Reports | Template cards + register counts | Card-heavy vs registers. `REPORTS_UX_PASS=false` |
| Models / Digital Twin | Module shells | Specialised chrome. Not certified. |
| Users, Licences, Administration | Platform / commerce shells | Separate visual language. `ADMINISTRATION_UX_PASS=false` |

## Checks

- Navigation: primary sidebar + project filter in header. Ask scope chips labelled.
- Hierarchy: `PageHeader` + `page-main` padding. Ask uses labelled Answer/Why/Evidence.
- Forms: labeled fields on upload / new project. Raw project UUID is not the selector label.
- Loading: OperationalSkeleton / list loading. Ask uses “Asking…”. HTML TTFB measured below.
- Empty/error: OperationalError + EmptyOperationalState on engineering registers.
- Accessibility: `data-testid`s and some `sr-only`; keyboard/focus not re-verified in a browser. `ACCESSIBILITY_BASELINE_PASS=false`.
- Implementation leakage: diagnostics behind Show details. Context no longer prints document UUID as the title.

## Performance (authenticated HTML TTFB, Preview, founder session)

Measured by `docs/pilot/EOS-PILOT-PRODUCT-1A/perf-measure.mjs` against https://eos-pilot.rtbea.com.au. First request includes cold start.

```
COMMAND_CENTRE_LATENCY_MS=2624
PROJECTS_LATENCY_MS=974
DOCUMENTS_LATENCY_MS=982
ENGINEERING_AI_LATENCY_MS=882
```

## Visual QA

`docs/pilot/EOS-PILOT-PRODUCT-1A/screenshots/` has no populated 1440×900 / 1920×1080 captures. `VISUAL_CONSISTENCY_PASS=false`. `ENTERPRISE_DESIGN_SYSTEM_PASS=false`.

## Founder gate

Cursor cannot grant founder acceptance. No external invites. No Production promote.
