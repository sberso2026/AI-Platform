# EOS-A9A Lifecycle Intelligence Foundation

Status: implemented as a first-class Engineering OS domain. Does **not** automatically approve lifecycle transitions. Does **not** replace Project Controls schedule, engineering maturity, Configuration Baselines, or Engineering Review Findings.

Canonical vocabulary (must not collapse):

- LIFECYCLE STAGE = engineering lifecycle context
- ENGINEERING MATURITY = degree of evidence/completeness/readiness
- PROJECT SCHEDULE = time/activity planning
- CONFIGURATION BASELINE = frozen engineering state
- GATE READINESS = deterministic machine evaluation
- GATE DECISION = authorized human governance decision
- STAGE TRANSITION = governed change of lifecycle state

Canonical stages reused from EOS-A5 `LIFECYCLE_STAGES`:

CONCEPT → PREFEASIBILITY → FEASIBILITY → FEED → DETAILED_DESIGN → CONSTRUCTION → COMMISSIONING → OPERATIONS → MODIFICATION

Closure/decommissioning remain extensible and are **not** added in A9A.

---

## Definition

Lifecycle Intelligence answers:

- Where is engineering work in its lifecycle?
- What evidence is expected at this stage?
- What is ready for lifecycle review?
- What remains incomplete?
- Which configuration baseline applies?
- Which requirements, assumptions, analyses, interfaces, reviews and decisions support the current state?
- What changed between stages?
- What evidence supported a human-authorized stage transition?
- Which engineering objects are at different stages?

It determines context, expected evidence, existing evidence, missing evidence, criterion results, evaluation completeness, and governed evidence for **human** lifecycle review. It does not decide that engineering is ready to proceed.

---

## Distinctions that must not collapse

| Concept | Meaning in A9A |
| --- | --- |
| Lifecycle Stage | Engineering lifecycle context (`FEED`, `DETAILED_DESIGN`, …) |
| Engineering maturity | Degree of evidence / completeness / readiness. A FEED project may be INCOMPLETE. |
| Project schedule | Time/activity planning. Primavera/P6 phases do **not** define engineering lifecycle authority. |
| Configuration Baseline | Frozen engineering state (FEED/IFC/AS_BUILT…). Stage ≠ baseline. |
| Gate Readiness | Deterministic machine evaluation |
| Gate Decision | Authorized human governance decision |
| Stage Transition | Governed change of lifecycle state after a human decision |

`engineering_projects.project_phase` and Project Controls schedule remain **legacy / schedule** context. They are not Lifecycle Intelligence authority. EOS-A9B adds governed schedule mappings and descriptive alignment only; see `EOS_A9B_LIFECYCLE_EVIDENCE_AND_PROJECT_CONTROLS.md`.

---

## Lifecycle vs Project Controls

Engineering Lifecycle Stage is owned by Engineering OS Lifecycle Intelligence.

Project Controls schedule phases/activities may later map through governed mappings. They must not automatically define Engineering lifecycle authority. A9A does not implement Primavera synchronization or a scheduling engine.

---

## Lifecycle Profile

`EOS-DEFAULT-ENGINEERING` v1 is the canonical initial Engineering profile.

A profile is governed configuration: identity, version, enabled status, canonical stages, allowed transitions, stage expectations, gate definitions. It is **not** a workflow DSL and not user-authored executable rules.

Project-specific settings may select the profile version, omit stages, and enable/disable catalog criteria. Unknown profile id/version is rejected. A gate evaluated under v1 must not silently become governed by v2.

---

## Allowed transitions

Transitions are explicit pairs, not a strictly increasing integer.

The default profile permits FEED ↔ DETAILED_DESIGN and OPERATIONS → MODIFICATION, plus Modification return paths through configured engineering/construction/commissioning states back to Operations. Back-transitions are history, not data corruption. Modification is not a terminal stage.

---

## Assignment and mixed state

One assignment architecture covers PROJECT, SYSTEM, and ASSET scopes. A9A does not add independent `lifecycle_stage` columns across domain tables.

A project may contain mixed stages, for example:

- Project: FEED
- Primary Crushing: FEED
- Crusher Support Frame: DETAILED_DESIGN
- Early Works: CONSTRUCTION

Mixed state is valid. It is not treated as inconsistency.

### Effective-stage resolution

1. Explicit scoped assignment
2. Parent / system / package assignment
3. Project lifecycle assignment
4. UNKNOWN

Stage is never inferred from document names or AI classification.

---

## Stage expectations and criteria

Each gate has a bounded criterion catalog. Types include configuration baseline, requirements context, assumption review, interface information, analysis evidence, Engineering Review, Decision evidence, Assurance completeness, configured blocking Assurance Conditions, surfaced Changes, and Optimization applicability.

Applicability may vary by stage, discipline, system/package, and profile. Structural analysis is not mandatory for a Process-only scope. SPACE GASS unavailability does not block unrelated scopes. Optimization is OPTIONAL on the default FEED gate.

Unknown required criteria fail closed. There is no user-authored code expression.

---

## Gates, readiness, completeness

A Lifecycle Gate is separate from Lifecycle Stage. Example: FEED EXIT REVIEW while current stage remains FEED.

Gate Readiness: NOT_EVALUATED, EVALUATING, READY_FOR_REVIEW, NOT_READY, PARTIAL, FAILED, STALE.

Evaluation completeness reuses A8D semantics: COMPLETE, PARTIAL, FAILED.

A PARTIAL evaluation cannot produce READY_FOR_REVIEW. Truncation is never successful gate readiness.

Criterion results: SATISFIED, NOT_SATISFIED, NOT_APPLICABLE, UNKNOWN, with evidence references and deterministic explanation.

---

## Human gate decision and transition

Only an authorized human may approve a gate or transition. AI must not approve, waive, advance, or back-transition a stage.

Human decisions: APPROVED_TO_TRANSITION, APPROVED_WITH_CONDITIONS, NOT_APPROVED, DEFERRED, WAIVED.

APPROVED_WITH_CONDITIONS records outstanding condition ids. It does not resolve Assurance Conditions, create Findings or Issues, or declare compliance.

A waiver records authority and rationale. Original criterion results remain visible.

Transitions are append-only. They retain profile id/version, gate/evaluation/decision references, actor, timestamp, rationale, configuration baseline reference where present, evidence fingerprint, and a compact snapshot.

Optimistic concurrency: assignment update requires matching `from_stage` and `version`. Stale or replaced evaluations cannot be reused. Historical transitions are never rewritten.

If evidence changes after READY_FOR_REVIEW and before transition, the evaluation is STALE. After a completed transition, later engineering change may require revalidation; the historical decision remains historical fact.

---

## Composition

Lifecycle composes; it does not fork:

- Assurance Intelligence (configured blocking families only)
- Canonical Engineering Review (Findings remain Review-owned)
- A4 Configuration Baselines
- A4 Requirements
- A2 Assumptions and Decisions
- A3 Interfaces
- A7B Analysis
- A5 Optimization (OPTIONAL / REQUIRED / NOT_APPLICABLE)
- A4 Change/Impact (surface, do not auto-block or confirm)
- A8A Digital Thread path: Assignment → Gate → Evaluation → evidence → Decision → Transition → Stage

Platform KG is not required. KG reads remain OFF. No new graph, job queue, or event bus.

---

## Security

Workspace-member SELECT. Profile settings, gate decisions, assignment stage updates, and transitions require `engineering` admin. Anonymous, cross-workspace, and cross-tenant access is denied. Transition history is immutable for JWT roles.

---

## UI

- `/engineering/lifecycle` — current stage, scoped states, gate readiness, criteria, evidence, history/transitions
- `/engineering/settings/lifecycle` — profile/criterion governance

The UI must not present AI approval, automatic readiness-to-proceed, or automatic phase completion.

---

## Tests

Unit and integration coverage includes profile validation, allowed transitions, effective stage, mixed scope, criteria, readiness, completeness, PARTIAL block, human FEED→DETAILED_DESIGN, stale gate, back-transition, Modification loop, Assurance/Review/Configuration composition, Digital Thread path, profile versioning, transition immutability, and live JWT RLS.

---

## Limitations

- AAL2 browser certification is independent and may be NOT_TESTED.
- Gate evaluation in A9A consumed a caller-supplied evidence snapshot. EOS-A9B harvests canonical evidence server-side; see `EOS_A9B_LIFECYCLE_EVIDENCE_AND_PROJECT_CONTROLS.md`. EOS-A9C may compose optional Deliverable maturity evidence into the same gate; see `EOS_A9C_DELIVERABLE_MATURITY_INTELLIGENCE.md`.
- No Project Controls scheduling engine or P6 sync.
- No automatic transition, AI approval, automatic waiver, or compliance determination.
- No real solver execution.
- No Value Intelligence, Construction Intelligence, Commissioning execution, or Operations Digital Twin redesign.
- Default profile is a conservative Engineering template, not industry-universal truth.
