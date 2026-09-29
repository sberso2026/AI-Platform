# EOS-A0 Target Engineering OS Architecture

Status: target architecture (not implemented in this phase)  
Depends on: `CURRENT_ARCHITECTURE.md`  
Principle: RTB AI Platform remains the shared enterprise platform. Engineering OS is a domain operating system that **composes and extends** platform services.

This is a planning document. EOS-A0 does not create tables, packages, or UI.

---

## 1. Separation of responsibilities

### RTB Platform owns

- Identity, authentication, tenant/workspace membership
- Authorization helpers and RLS primitives
- Audit event infrastructure
- Event bus, jobs, workflow runtime (kernel)
- Notifications, telemetry/observability, feature flags, secrets
- Tool / capability / policy / prompt / model / cost / evaluation registries
- Knowledge graph **infrastructure** (`knowledge_nodes` / `knowledge_edges` / `evidence_items`)
- Memory infrastructure
- Plugin/module installation lifecycle
- Commerce entitlements and product installation
- API hosting (`apps/web` route handlers)
- Connector framework **when introduced** (currently missing; do not invent a second one inside Engineering OS)

### Engineering OS owns

- Engineering product shell (`/engineering/*` composition, navigation, context)
- Canonical engineering information objects (projects, systems, assets, documents, drawings, calculations, specifications, registers, models, evidence, records) **as domain data**
- The six intelligence domains listed below
- Horizontal engineering services listed below
- Engineering Review & Verification **as a bounded context** (new or reconstituted; see §8)
- Engineering Digital Thread **semantics** (relationship types, governed provenance) on top of platform KG
- Analysis-engine **adapter contracts** using the existing execution host, not hardcoded vendor APIs
- Discipline catalogs and shared contracts used by specialist modules

### Hosted modules continue to own their certified internals

Per `docs/architecture/ENGINEERING_OS_PRODUCT_BOUNDARY.md`:

- Project Intelligence owns document/meeting/findings business logic
- Inspection Intelligence owns inspection domain authority
- Asset Intelligence owns reliability/fusion/timeseries authority
- Project Controls owns controls contributor intelligence
- Digital Twin owns twin identity/state/simulation
- Model Interoperability owns federation mapping/result references

Engineering OS must not absorb those internals. New intelligence domains are **peers**, not a seventh copy of an existing module.

### Engineering OS must never own

- A second identity stack
- A second RLS framework
- A second event bus, job engine, workflow engine, KG store, memory store, or audit store
- Business OS financial/customer domains
- Commercial solver licence keys or licence-server emulation

---

## 2. Experience layer

Reuse the existing Engineering OS shell:

- Command Centre `/engineering`
- Project/asset/document/company/discipline/settings/search/reports/AI workspace
- Register UX
- Hosted module apps under `/engineering/apps/*`
- `EngineeringContext` for tenant/workspace/project routing

Add later (not in EOS-A0):

- Systems, interfaces, requirements, assumptions, configuration, optimization workspace, value register, lifecycle context switcher
- A distinct Engineering Review experience that does not replace PI Findings
- Tags UI for existing `engineering_tags` tables
- Knowledge page currently lacking `page.tsx`

---

## 3. Six intelligence domains

### 3.1 Lifecycle Intelligence

**Purpose:** decide what maturity, uncertainty, evidence, and governance are appropriate **when**.

**Target contexts:** Concept, Prefeasibility, Feasibility, FEED, Detailed Design, Construction, Commissioning, Operations, Brownfield / Modification, Decommissioning.

**Reuse:** `engineering_project_phases` (shared project domain); Asset Intelligence lifecycle engines for **asset** state; document `status` / revision.

**Create (later):** a governed lifecycle context object that can be attached to projects/systems/decisions/reviews — not a second asset lifecycle product.

**Owner:** Engineering OS (context) composing Asset Intelligence (asset lifecycle) and Project Controls (schedule/phase contribution).

### 3.2 Systems Intelligence

**Purpose:** how engineered systems work across disciplines.

**Target concepts:** system architecture, systems, subsystems, functional requirements, interfaces, dependencies, I/O, performance, operating modes, failure modes, readiness, operability.

**Reuse:** `engineering_assets` hierarchy as a possible **installation/tag** layer; Digital Twin for runtime/simulation representations; model elements from interoperability.

**Create:** canonical `system` / `subsystem` objects distinct from assets and twins. Assets may realize systems; twins may represent them; neither replaces the system register.

**Owner:** Engineering OS canonical domain; Digital Twin consumes, does not own, system identity.

### 3.3 Discipline Intelligence

**Purpose:** specialist reasoning that still shares project/system/asset/requirement/interface/decision/evidence context.

**Reuse:** `engineering_disciplines` catalog and `ENGINEERING_DISCIPLINES` constants; PI document/finding discipline fields; Inspection/Asset/PC modules.

**Do not:** spawn isolated discipline applications as the primary architecture. Disciplines are **lenses and methods** on shared objects.

**Owner:** Engineering OS (shared contracts); specialist methods may live in modules or future discipline packs, never in a private data island.

### 3.4 Optimization Intelligence (peer domain)

**Purpose:** generate, evaluate, compare, and improve alternatives. **Not** buried inside a discipline.

**Target capabilities:** configuration, layout, design, CAPEX/OPEX, schedule, material/weight, energy, constructability, reliability, maintainability, availability, operational, lifecycle, risk, sustainability, multi-discipline and multi-objective optimization.

**Future bounded context (do not create in EOS-A0):**

`optimization_study`, `optimization_objective`, `optimization_constraint`, `optimization_variable`, `optimization_alternative`, `optimization_scenario`, `optimization_run`, `optimization_result`, `optimization_tradeoff`, `optimization_evidence`

**Compose:** kernel jobs + execution host for numerical runs; policy/review for human gates; Decision Intelligence for selected alternative; Value Intelligence for projected vs realized benefit.

**LLM role:** orchestration, explanation, constraint drafting, alternative description. **Not** the deterministic numerical solver.

**Owner:** future Engineering OS optimization bounded context.

### 3.5 Decision Intelligence

**Purpose:** preserve **why** decisions were made.

**Reuse:** `engineering_decisions` register (recommendation, rationale, alternatives JSON, confidence, human approval). Extend; do not replace.

**Add:** assumption objects (reusable), decision authority, approval history as first-class records, supersession, traceability to requirements/systems/reviews/optimization studies, explicit alternative records rather than opaque JSON when studies require it.

**Owner:** Engineering OS Core (register remains Core-owned per `ENGINEERING_REGISTERS.md`). Assumption management lives here but is **referenced** by Requirements, Review, Optimization, Risk, and Change.

**Collision:** `project_controls_decision_*` and `business_os_decisions` remain module/OS-local. Do not merge by renaming. Link, do not fork a fourth decision table without an ADR.

### 3.6 Value Intelligence

**Purpose:** distinguish projected, approved, committed, realized, and verified value.

**Reuse:** Project Controls cost/progress/opportunity intelligence as **inputs**, not as the value register.

**Create:** value objects with confidence/maturity and benefit attribution to decisions/optimization studies/changes.

**Owner:** Engineering OS value bounded context. Must not become a finance system (Business OS) or a cost-control system (Project Controls).

---

## 4. Horizontal engineering services

These are **not** automatically top-level apps.

| Service | Role | Current seed |
| --- | --- | --- |
| Engineering Information | Projects, systems, assets, documents, drawings, calculations, specifications, registers, models, evidence, records | Projects/assets/documents/registers EXIST; systems/drawings/calculations/specifications MISSING as first-class objects |
| Requirements Intelligence | Requirements, design basis, acceptance criteria, relationships, verification | MISSING |
| Change Intelligence | Engineering changes, history, propagation, affected objects | PARTIAL — Project Controls change |
| Impact Intelligence | Dependency traversal, up/downstream and multidiscipline impact | PARTIAL — model change impacts |
| Interface Intelligence | Physical, functional, discipline, data, control, responsibility, contract, schedule, information interfaces | PARTIAL — model mappings only |
| Configuration Intelligence | Baselines, revision states, effective dates, supersession, freeze, IFC/installed/as-built/commissioned configs | MISSING (document revisions ≠ configuration intelligence) |
| Uncertainty Intelligence | Confidence, ranges, scenarios, sensitivity, probability, robust optimization, information value | PARTIAL — module confidence fields |
| Engineering Review & Verification | Distinct bounded context | See §8 |
| Engineering Digital Thread | Semantic relationships across governed objects | PARTIAL — object links + KG ids |
| Engineering Knowledge Graph | Semantics on **platform** KG | EXTEND platform KG; do not add a third graph store |

Interface Intelligence is horizontal and used by Systems, Change, Review, Optimization, Construction, and Commissioning.

Configuration Intelligence is **distinct** from Change Intelligence (ADR-011).

---

## 5. Provenance rule (not the rigid slogan)

Do **not** enforce: “no engineering object exists without requirement, assumption, evidence, decision and approval.”

**Target rule:** every governed engineering object has provenance, context, and traceability **appropriate to**:

- lifecycle state
- engineering significance
- risk
- approval state
- decision significance

Draft/concept objects may exist with weak provenance. Approved or safety-critical objects must eventually require stronger evidence and approval. Lifecycle Intelligence supplies the **bar**; Review and Decision Intelligence enforce it.

---

## 6. Engineering Digital Thread vs Digital Twin

| Concept | Meaning | Owner |
| --- | --- | --- |
| Digital Thread | Traceable relationships among requirements, assumptions, design basis, systems, assets, interfaces, models, calculations, drawings, specifications, changes, risks, alternatives, decisions, reviews, findings, evidence, approvals, configurations, construction records, commissioning evidence, operational records | Engineering OS semantics on platform KG + object links |
| Digital Twin | Operational/physical or simulated representation of an asset/system with state, telemetry, simulation | `@rtb/digital-twin` + kernel twin registry |

Do **not** rename the thread to “Digital Twin”. Asset Intelligence already records this boundary (`docs/architecture/ASSET_INTELLIGENCE_DIGITAL_TWIN_BOUNDARY.md`).

---

## 7. Analysis engine abstraction

Existing seed:

```
Engineering OS
  → Engineering Tool Framework (ETF prompts/tools)
    → Engineering Execution Provider
      → Controlled Engineering Execution Host
        → Licensed external software
```

Documented in `docs/architecture/CONTROLLED_ENGINEERING_EXECUTION_HOST_CONTRACTS.md`.  
Model federation already has IFC / SPACE GASS / ETABS adapters.

**Target:** a reusable analysis-engine adapter contract (qualify, isolate, version-pin, capture artifacts, never claim solver certification from host availability). Future vendors (STAAD, ETABS already partial, SACS, ABAQUS, ANSYS, HYSYS, Aspen Plus, SysCAD, CAESAR II, ETAP, PLAXIS, Civil 3D, …) plug into that contract.

**Do not** hardcode Engineering OS services to vendor APIs.

LLMs orchestrate; validated engines compute.

---

## 8. Engineering Review & Verification (bounded context)

**Target objects:** review packages, runs, findings, evidence, dispositions, verification, traceability, interface review, discipline review, cross-document review, requirements verification.

**Reuse unchanged:**

- PI Findings product for document-sourced findings
- `EngineeringReviewRecord` / approval types in the Workflow SDK
- No-autonomous-approval policy
- Execution-host and RLS isolation
- Vendor trusted-server **pattern** (fail-closed membership) if reconstituted — do not weaken it

**Create later:** a composition bounded context that can review systems, interfaces, optimization studies, and requirements **without** stealing PI Findings ownership.

Until that context exists, “Engineering Review” in this repo is a **scattered pattern**, not a product. Planning must not pretend otherwise.

---

## 9. Optimization runtime (future)

```
Engineer
  → Optimization Workspace
    → Optimization Study
      → Objectives + Constraints + Variables
        → Alternative generation
          → Model orchestration (platform intelligence)
            → Validated engineering analysis engines (execution host + adapters)
              → Normalized results
                → Constraint evaluation
                  → Economic evaluation
                    → Pareto / sensitivity / uncertainty
                      → Engineering Review
                        → Decision Intelligence
                          → Human approval
```

Schema ownership (likely, to be confirmed in EOS-A5): Engineering OS optimization bounded context tables with `tenant_id` + `workspace_id` RLS; jobs via kernel and/or `engineering_execution_jobs`; audit via `audit_events` + engineering audit links; review via the Review bounded context.

---

## 10. Package boundary sketch (future, not created now)

| Concern | Likely package |
| --- | --- |
| Canonical domain model (systems, interfaces, requirements, assumptions, configuration) | extend `@rtb/engineering-os` and/or new `@rtb/engineering-domain` **after** A1 ADR |
| Optimization | new package only when A5 starts; do not hide inside a discipline module |
| Analysis adapters | extend `@rtb/engineering-execution-host` + `@rtb/engineering-model-interoperability` |
| Review composition | new bounded context package **or** explicit module under engineering-os; never a silent PI fork |
| Graph semantics | extend platform kernel KG types; PI graph remains module-local relationship cache |

Exact package splits are an EOS-A1 output, not an EOS-A0 implementation.

---

## 11. Security implications of the target

All new engineering objects must carry `tenant_id` and, where the modern pattern applies, `workspace_id`, and must enable RLS using `get_user_tenant_ids()` / workspace membership. Writes go through `has_permission('engineering', …)` and commerce entitlement guards.

Optimization runs and external engine jobs are **trusted execution**: sandbox, licence classification, no silent solver fallback, no licence keys in repo.

Review and decision approval remain human for design/safety significance. Feature flags gate new domains. Audit every governed state change.

Do not introduce a parallel security stack.
