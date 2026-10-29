# EOS-A0 Legacy Engineering OS Inventory

## EOS-A0C status: READ_ONLY_REVIEWED

Path (not modified): `C:\Users\sbers\OneDrive\Documents\RTB Eng\01_Apps\Engineering OS`

Inspected 2026-09-29. No files were copied, renamed, moved, deleted, executed, or had dependencies installed.

Historical EOS-A0 note: Cloud Agent recorded **ACCESS_NOT_AVAILABLE**. That finding is superseded below for this Windows machine. The original in-repo counterpart table is retained as context, not as the inventory.

---

## Top-level folders (verified)

| Folder | Contents summary |
| --- | --- |
| Construction Intelligence | Single prompt file only |
| Engineering Intelligence | Electrical (empty), Mechanical (RTB Tanks), Piping (Backup only), RTB Code Checker, RTB SiD Intelligence (one Word doc), Structural (multiple desktop/Python apps) |
| Inspection Intelligence | RTB LifeScore (Next.js + Supabase), SHM (vendor PDFs/training), SHM Lifescore (Python SHM agent) |
| Project Controls Intelligence | **Empty directory** (no files) |
| Project Intelligence | `PI-baseline-6c1` and `RTB Project Intelligence` (full Next.js products) plus Backup |

Classification key: **A DUPLICATE** | **B MIGRATION_CANDIDATE** | **C REFERENCE_ONLY** | **D OBSOLETE** | **E UNKNOWN**

---

## Construction Intelligence — C REFERENCE_ONLY

- `RTB Construction Intelligence prompt.txt` — specification prompt for a Construction Intelligence vertical (BIM/IoT/schedule entities). No source, schema, or tests.
- Closest in AI Platform: Construction as a discipline label only. No construction package.
- Do not migrate a prompt as product code. EOS-A0 already deferred Construction Intelligence as a product.

---

## Engineering Intelligence

### Electrical — E UNKNOWN

Directory exists and is empty (no files listed). Insufficient evidence.

### Piping — E UNKNOWN / D OBSOLETE (Backup only)

Only a `Backup` folder is present. Not inventoried as live source.

### Mechanical / RTB Tanks — B MIGRATION_CANDIDATE

| Field | Value |
| --- | --- |
| Source path | `Engineering OS/Engineering Intelligence/Mechanical/RTB Tanks/` |
| Purpose | Offline Python industrial tank / tank-farm design (seismic sloshing, fire/blast interaction, shell/roof/nozzle/anchorage, MTO, drawings) |
| Why unique | Deterministic mechanical design algorithms and optimization not present in `@rtb/engineering-os` or execution-host adapters |
| Likely target bounded context | Discipline Intelligence (mechanical lens) + Optimization (A5+) + analysis-engine adapter (A8) |
| Dependencies | Python 3.8+, local `requirements.txt`; PDF/DXF/image parsing; **not** the AI Platform kernel |
| Migration risk | High — desktop/offline solver, not tenant/RLS shaped; licence/certification of numerical results |
| Security | Do not import as a live web solver; no service-role; keep adapter/sandbox if ever hosted |
| Recommendation | **Do not copy.** Treat as a future execution-host adapter candidate after A1 identities and A8 contract exist. |

### RTB Code Checker — C REFERENCE_ONLY (overlap with Review / PI Findings)

| Field | Value |
| --- | --- |
| Source path | `Engineering OS/Engineering Intelligence/RTB Code Checker/` |
| Purpose | Streamlit/desktop agentic document review (drawing/spec/calc/BoD/risk agents, LifeScore, redlines) |
| Why unique | Standalone LLM-agent review UX and redline pipeline |
| Classification | Conceptual overlap with PI Findings + ERA Review; **not** a second review engine to drop into `apps/web` |
| Recommendation | Reference for discipline-document review UX. Do not migrate as a parallel bounded context. |

### RTB SiD Intelligence — C REFERENCE_ONLY

- `Safety in Design.docx` only. No code.

### Structural / RTB Conveyor design — B MIGRATION_CANDIDATE

| Field | Value |
| --- | --- |
| Source path | `Engineering OS/Engineering Intelligence/Structural/RTB Conveyor design/` |
| Purpose | Python conveyor structural design (AS 4100 / AS 1170, fatigue, dynamics, STAAD/SpaceGass export, optimization) |
| Why unique | Conveyor-specific design + vendor model export beyond current IFC/SPACE GASS/ETABS federation scope |
| Likely target | Discipline Intelligence (structural lens) + A8 adapters |
| Dependencies | Python, Poppler optional, STAAD/SpaceGass file formats |
| Migration risk | High — desktop solver; vendor file formats |
| Security | Adapter-only; do not embed vendor SDKs in Engineering OS services |
| Recommendation | **Do not copy.** Candidate for A6/A8 after generic adapter contract. |

### Structural / RTB Structural Design — B MIGRATION_CANDIDATE

| Field | Value |
| --- | --- |
| Source path | `Engineering OS/Engineering Intelligence/Structural/RTB Structural Design/` |
| Purpose | Desktop structural/foundation design agent (AS/NZS 1170, NCC, STAAD/SpaceGass, multi-objective optimization) |
| Why unique | Foundation + loads + optimization loop not in Digital Twin solver tables |
| Likely target | Discipline Intelligence + Optimization + A8 |
| Migration risk | High |
| Security | Offline desktop; do not lift `.exe`/PyInstaller into the platform |
| Recommendation | **Do not copy.** Reference algorithms only after A1/A5. |

### Structural / RTB Dynamic Analysis — C REFERENCE_ONLY / B (physics core only)

- Python SHM/dynamics pipeline (`core/`, `fatigue/`, `reporting/`). Overlaps SHM Lifescore and Digital Twin. Prefer composing existing `@rtb/digital-twin` rather than importing a third twin.

### Structural / RTB Conveyor (TS/Electron) and RTB_Structural_Copilot — C REFERENCE_ONLY

- Vite/Electron UIs wrapping engines. Duplicate UX, not platform shell. Do not migrate frontends.

### Structural / RTB Design — C REFERENCE_ONLY

- Smaller Python design scripts (`as_nz_standards.py`, `optimizer.py`). Likely superseded by RTB Structural Design.

---

## Inspection Intelligence

### RTB LifeScore (Next.js) — D OBSOLETE as platform / C REFERENCE_ONLY for domain

| Field | Value |
| --- | --- |
| Source path | `Engineering OS/Inspection Intelligence/RTB LifeScore/` |
| Purpose | Separate Next.js + Supabase tenant/asset/evidence app |
| Classification | **Do not migrate.** Duplicates platform identity (`tenants`, `profiles`, `audit_events`) and would create a second OS. Asset registry ideas may inform Inspection Intelligence **domain** later. `.env.local` was not read. |

### SHM — C REFERENCE_ONLY

- Vendor datasheets, training docs, `shm-course-platform`. Not product source for AI Platform.

### SHM Lifescore (Python) — B MIGRATION_CANDIDATE

| Field | Value |
| --- | --- |
| Source path | `Engineering OS/Inspection Intelligence/SHM Lifescore/` |
| Purpose | Deterministic SHM pipeline: sensors → signal processing → digital twin calibration → damage/seismic/performance → LifeScore; AI assist, not solver |
| Why unique | Physics SHM scoring not implemented inside `@rtb/inspection-intelligence` V1 |
| Likely target | Inspection Intelligence module **methods** + Digital Twin operational state; **not** a new kernel twin store |
| Dependencies | Python, sample CSVs; GUI scripts |
| Migration risk | Medium–High — must not create a third digital-twin table family |
| Security | Keep human decision authority; no autonomous safety approval |
| Recommendation | **Do not copy.** Candidate method pack after A1 twin/thread identity ADR. |

---

## Project Controls Intelligence — E UNKNOWN

Empty folder. Closest live counterpart is `@rtb/project-controls` in AI Platform. Nothing to migrate from this path.

---

## Project Intelligence

### `RTB Project Intelligence` and `PI-baseline-6c1` — A DUPLICATE / C REFERENCE_ONLY / B (narrow)

These are standalone Next.js PI products (documents, decisions, Thor, engines, jobs, knowledge-graph, `security/authorization`). Live counterpart: `@rtb/project-intelligence` plus `vendor/project-intelligence-baseline/` already in AI Platform.

| Component | Class | Note |
| --- | --- | --- |
| App shell / tenants / auth | D OBSOLETE | Would duplicate platform identity |
| PI Findings / documents / meetings | A DUPLICATE | Hosted in AI Platform PI module |
| `engines/*Engine.ts`, `decisionEngine.ts` | C REFERENCE_ONLY | Do not drop into Engineering OS Core |
| `domain/knowledge-graph` | CONFIRMED_DUPLICATION vs platform KG | Do not add a third graph |
| `security/authorization` trusted context | B MIGRATION_CANDIDATE (pattern only) | Already flagged in EOS-A0 vendor tarball; inspect, do not copy files |
| `app/engineering-findings` if present in baseline | C / B | Same as vendor archive; ERA now owns `engineering_review_*` |

**Do not copy either tree into AI Platform.** The in-repo vendor tarball remains the frozen PI baseline.

---

## MIGRATION_CANDIDATE roll-up (do not copy)

1. RTB Tanks (mechanical design/optimization)
2. RTB Conveyor design (structural conveyor + STAAD/SpaceGass export)
3. RTB Structural Design (desktop structural/foundation optimizer)
4. SHM Lifescore Python pipeline (inspection/twin methods)
5. Trusted-server **pattern** from standalone PI `security/authorization` (already inventoried via vendor tarball)

Everything else: DUPLICATE, REFERENCE_ONLY, OBSOLETE, UNKNOWN, or empty.

---

## Historical EOS-A0 ACCESS_NOT_AVAILABLE (superseded)

The EOS-A0 Cloud Agent could not see this Windows path. The in-repo counterpart table at that time:

| Legacy name (brief) | Closest in-repo counterpart | In-repo status |
| --- | --- | --- |
| Construction Intelligence | Discipline label only | MISSING product |
| Engineering Intelligence | `@rtb/engineering-os` Core | EXISTS |
| Inspection Intelligence | `@rtb/inspection-intelligence` | EXISTS |
| Project Controls Intelligence | `@rtb/project-controls` | EXISTS |
| Project Intelligence | `@rtb/project-intelligence` | EXISTS |

---

## Related in-repo vendor baseline (not the legacy folder)

The monorepo contains a **separate** frozen Project Intelligence source archive:

| Item | Path / value |
| --- | --- |
| Location | `vendor/project-intelligence-baseline/` |
| Identity | `vendor/project-intelligence-baseline/IDENTITY.txt` |
| SHA | `ab1f44276715888123d9f669464987e6f7c39b6c` |
| Tag | `project-intelligence-integration-baseline-1` |
| Upstream | `https://github.com/sberso2026/rtb-project-intelligence.git` |
| Payload | `ab1f442-source.tar.gz` (not extracted into the working tree during EOS-A0) |

Read-only tarball listing (names only) includes material **absent as live monorepo routes**:

| Tarball path | Likely class vs current AI Platform | Notes |
| --- | --- | --- |
| `app/api/engineering-findings/**` | MIGRATION CANDIDATE / REFERENCE ONLY | Not present as `/api/engineering-findings` in `apps/web` |
| `security/authorization/TrustedRequestContext.ts` and `createTrustedContext.ts` | MIGRATION CANDIDATE (pattern) | Not the current monorepo API boundary |
| `supabase/migrations/20260611120000_engineering_finding_evidence_workflow.sql` | REFERENCE ONLY | Still no `engineering_findings` table. EOS-A0C live tables are `engineering_review_*`, a different schema. |
| `supabase/migrations/20260417120000_decision_graph_schema.sql` | REFERENCE ONLY / DUPLICATE risk | Current Core uses `engineering_decisions`, not this graph schema |
| `app/decisions/`, `services/decision/` | DUPLICATE / REFERENCE ONLY | Superseded by Engineering Core Decision register for the OS shell |
| `engines/decisionEngine.ts` | REFERENCE ONLY | Inspect before any port; do not drop in blindly |
| `app/api/ai/review-queue/` | REFERENCE ONLY | PI Findings review queue is the live successor |

This vendor archive is **AI Platform repository content**, not the standalone Engineering OS folder. It must not be copied wholesale. It is evidence that a stronger Engineering Review / trusted-server / finding-evidence workflow existed upstream of the hosted module.

EOS-A0 did not extract the tarball into the repo and did not apply patches under `vendor/project-intelligence-baseline/patches`.
