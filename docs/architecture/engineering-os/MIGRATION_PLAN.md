# EOS-A0 Migration Plan

This is a **phased implementation plan**, not a database `supabase migration` runbook. EOS-A0 creates documentation only.

Evidence SHA: `135dd0b659497a7ac68543d50dd2998ee3fe7d0f`  
V1 constraint: frozen module keys in `packages/engineering-os/src/version.ts` must not be silently replaced.

Sequence is adjusted from the brief where repository evidence shows a cheaper path: Decision already exists as a Core register; execution host and some analysis adapters already exist; Engineering Review is a scattered pattern that needs an identity ADR **before** Optimization so studies have a review gate.

---

## Guardrails (all phases)

- Canonical repo remains this AI Platform monorepo.
- Compose Platform Kernel / Intelligence; do not duplicate them.
- Do not weaken Engineering OS V1 security closure or PI Findings ownership.
- No autonomous approval of design/safety decisions.
- New tables: `tenant_id` + workspace isolation + RLS + audit.
- Do not apply migrations in a phase that is still design-only.
- Do not migrate the standalone `Engineering OS` Windows folder into this repo.

---

## EOS-A1 — Canonical Engineering Domain Model

**Objective:** lock identities for the objects every later domain depends on, without implementing the six intelligence products.

**Why first:** Systems, requirements, interfaces, configuration, and review composition all collide with `engineering_assets`, documents, and module tables. Identity mistakes here are expensive.

**In scope:**

- Domain glossary: project, system, subsystem, asset, document, drawing, calculation, specification, requirement, assumption, interface, configuration, change, decision, review package, evidence, model, twin
- Ownership matrix vs existing tables
- ADR on system vs asset vs twin
- ADR on whether Review is a new package or an engineering-os bounded module
- Provenance policy by lifecycle/significance (the flexible rule, not the rigid slogan)
- Map platform KG node/edge types to the glossary
- Confirm job/queue ownership for later optimization (inventory only)

**Out of scope:** new tables, UI, vendor adapters.

**Exit:** published domain model + ADRs; no production behavior change required.

---

## EOS-A2 — Decision + Assumption Intelligence

**Why here:** `engineering_decisions` already exists with rationale, alternatives JSON, confidence, and human approval. Assumptions do not. Optimization and Review need both.

**In scope:**

- Extend Decision register (do not replace)
- First-class assumption objects reusable by requirements, review, optimization, risk, change
- Approval history / authority / supersession fields or related tables
- Links to existing object framework (`engineering_object_links`)
- Explicit non-merge of `project_controls_decision_*` and `business_os_decisions`

**Out of scope:** replacing PI Findings; Business OS decisions.

**Exit:** Decision Intelligence can record why, with assumptions, still requiring human approval.

---

## EOS-A3 — Systems + Interface Intelligence

**Why after A1/A2:** systems need locked identity; decisions/assumptions should attach to systems.

**In scope:**

- Canonical system/subsystem register
- Interface register (horizontal) covering the interface classes in the target architecture
- Reuse model mappings and spatial relationships as one interface class, not the whole domain
- Thread edges among systems, assets, models, documents

**Out of scope:** discipline silo apps; construction product.

**Exit:** systems and interfaces are shared context for later change/optimization/review.

---

## EOS-A4 — Change + Impact + Configuration Intelligence

**Why after systems:** change propagation and configuration baselines are meaningless without system/interface identity.

**In scope:**

- Compose Project Controls change; decide whether a Core engineering-change object is required
- Impact traversal over thread/graph (extend `engineering_model_change_impacts`)
- Configuration Intelligence distinct from Change: baselines, freeze, effective dates, supersession, IFC/installed/as-built/commissioned
- Document versions remain document CM, not the whole configuration domain

**Exit:** a change can name affected systems/interfaces and a configuration baseline can be pointed at.

---

## EOS-A5 — Optimization Core

**Why after A2–A4:** a study needs objectives, alternatives, decisions, review gates, and something to change/configure.

**In scope:**

- Bounded context objects listed in the target architecture (`optimization_study` … `optimization_evidence`) — **now** allowed to be designed/implemented
- Workspace UX under `/engineering` (not a new OS)
- Job execution via existing kernel jobs and/or `engineering_execution_jobs` (pick in A1 inventory; do not add a fifth queue)
- Constraint evaluation + trade-off records
- Mandatory human review/decision path
- LLM orchestration only; no LLM-as-solver

**Out of scope:** vendor-specific structural pilots (A6); full engine adapter catalog (A8); value realization (A9).

**Exit:** an engineer can run a governed study that produces alternatives and stops at Review/Decision.

---

## EOS-A6 — Structural Optimization Pilot

**Why after A5:** proves the core with one discipline lens, using existing structural-related adapters.

**In scope:**

- Structural pack on shared system/interface/decision objects
- Prefer existing SPACE GASS / ETABS federation + execution host over new vendor lock-in
- Discipline Intelligence pattern: lens, not silo

**Out of scope:** claiming solver certification because a host is up (already forbidden by execution-host contracts).

---

## EOS-A7 — Multidiscipline Intelligence Foundation

**Why after the structural pilot:** generalize the discipline contract before more vendors.

**In scope:**

- Shared discipline contracts (inputs, methods, evidence, review)
- Process / mechanical / electrical / … as lenses on the same systems
- Prevent per-discipline data islands

**Out of scope:** full specialist products for every discipline.

---

## EOS-A8 — External Analysis Engine Adapter Framework

**Adjustment vs brief:** do **not** create a second execution host. Extend `@rtb/engineering-execution-host` and `@rtb/engineering-model-interoperability`.

**In scope:**

- Generic adapter contract (qualify, version-pin, isolate, artifacts, licence classification)
- Map future vendors (STAAD, SACS, ABAQUS, ANSYS, HYSYS, Aspen, SysCAD, CAESAR II, ETAP, PLAXIS, Civil 3D, …) onto that contract
- No hardcoded Engineering OS service imports of vendor SDKs

**Exit:** a new engine can be declared without forking Optimization Core.

---

## EOS-A9 — Value Intelligence

**Why after optimization and change:** value objects need something to attribute.

**In scope:**

- Projected / approved / committed / realized / verified value
- CAPEX/OPEX/schedule/risk/energy/carbon attribution
- Confidence/maturity
- Compose Project Controls figures; do not replace Project Controls or Business OS finance

---

## EOS-A10 — Lifecycle Intelligence Expansion

**Why late:** the bar for provenance depends on objects that now exist.

**In scope:**

- Lifecycle context covering Concept through Decommissioning
- Policy: draft vs approved/safety-critical evidence requirements
- Compose asset lifecycle and project phases; do not fork Asset Intelligence

---

## EOS-A11 — Enterprise Hardening and Certification

**In scope:**

- Hosted RLS JWT matrices for new tables
- Certification package(s) following `packages/engineering-os-certification` patterns
- Secret scan / SCA / CI phase workflow
- Review bounded context security (trusted membership if reconstituted)
- Prove no duplicate kernel services were introduced
- Navigation, entitlements, feature flags for new domains
- Update stale Batch 2.0 prose in `ENGINEERING_OS.md` as a docs-only follow-on if still stale

**Out of scope:** GA tag for a new Engineering OS major version until gates actually pass.

---

## Parallel concern: Engineering Review reconstitution

Not a numbered replacement for A1–A11, because Review is a **gate** used by A2, A5, A6, A10.

- A1 must ADR the package boundary.
- Implementation of review **packages/runs/dispositions** should land before or with A5 so optimization cannot bypass review.
- PI Findings stay owned by Project Intelligence throughout.

If A1 decides Review is blocked on vendor trusted-server porting, that is a **blocker for A5**, not an excuse to let LLMs approve studies.

---

## Suggested dependency graph

```
A1 domain model
 ├── A2 decisions + assumptions
 ├── A3 systems + interfaces
 └── Review ADR → review composition (before A5)
        A2 + A3 + A4(change/config) + review
            └── A5 optimization core
                    ├── A6 structural pilot
                    ├── A7 multidiscipline foundation
                    ├── A8 adapter framework (can overlap A6 if using existing SPACE GASS/ETABS adapters)
                    └── A9 value
                            └── A10 lifecycle expansion
                                    └── A11 hardening
```

---

## Explicitly deferred

- Copying `C:\Users\sbers\OneDrive\Documents\RTB Eng\01_Apps\Engineering OS`
- Construction Intelligence product
- Live vendor integrations in A0–A4
- Python solver services
- Replacing V1 frozen modules
- Business OS absorption of engineering decisions
