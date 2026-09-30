# EOS-A9B Lifecycle Evidence Harvest, Readiness & Project Controls Mapping

Status: implemented as an additive extension of EOS-A9A. Does **not** redesign Lifecycle Intelligence. Does **not** grant Project Controls schedule authority over engineering lifecycle. Does **not** accept caller-authored gate evidence in production.

---

## Purpose

A9A established canonical stages, profiles, mixed scope, gate criteria, human decisions, and append-only transitions. Production evaluation still consumed a caller-supplied evidence snapshot.

A9B closes that limitation: the caller requests evaluation; the server harvests governed facts from canonical Engineering OS sources, fingerprints the harvested set, and evaluates criteria against that snapshot.

---

## Authoritative evidence model

Production authority path:

Evaluation Request → Lifecycle Service → Canonical Evidence Harvester → Canonical Engineering Sources → Evidence Snapshot → Criterion Evaluation → Gate Readiness

The caller may submit project, scope, and gate identity. The caller may **not** submit authoritative claims such as `reviewComplete`, `baselineFrozen`, `analysisValid`, or `assurance clear`.

`TEST_FIXTURE` injection remains only for unit, integration, and certification fixtures. Production/runtime APIs reject caller-supplied evidence with `caller_supplied_evidence_rejected`.

---

## Canonical Evidence Harvester

`LifecycleEvidenceHarvester` (`harvest.ts` + `canonical-source.ts`) gathers governed facts. It does not decide readiness, approve gates, or transition stages.

Adapters map bounded-context records into a common `LifecycleEvidenceItem` envelope (type, canonical object, tenant/workspace/project, scope, source state/version, stale/superseded, harvested_at, provenance). Large source payloads are not copied.

Sources composed without duplicating bounded-context stores:

- Requirements (allocation via Digital Thread `ALLOCATED_TO`)
- Assumptions (validation, expiry, invalidated)
- Interface Information Requirements
- Configuration Baselines
- Analysis results
- Engineering Review Packages
- Decisions
- Assurance Conditions and latest Evaluation Run completeness
- Optimization studies/runs when present
- Changes (surfaced; not converted to confirmed Impacts)

---

## Snapshot model

Each evaluation persists:

- profile id/version, gate, scope, effective stage
- evidence source (`CANONICAL` or `TEST_FIXTURE`)
- harvest timestamp
- canonical evidence references
- Assurance completeness and frozen baseline id when present
- SHA-256 evidence fingerprint

Historical evaluations are not silently rewritten. A later harvest with a changed fingerprint marks the previous evaluation `STALE` and creates a new evaluation.

---

## Completeness and staleness

- Truncated or failed source queries propagate to criterion `sourceCompleteness` and overall gate completeness.
- PARTIAL/FAILED Assurance Evaluation Runs cannot prove absence of blocking conditions (`NO_OPEN_BLOCKING_ASSURANCE_CONDITIONS`).
- Overall `READY_FOR_REVIEW` requires COMPLETE source completeness on every required applicable criterion.
- Canonical source change invalidates reuse of the prior fingerprint. Gate decisions cannot use STALE or PARTIAL evaluations.

---

## Caller authority boundary / test fixture boundary

| Mode | Who supplies evidence | Production API |
| --- | --- | --- |
| CANONICAL | Server harvest | Default |
| TEST_FIXTURE | Explicit test provider | Rejected unless `evidenceMode=TEST_FIXTURE` inside the package test surface |

`/api/engineering/lifecycle` evaluate/refresh reject a body `evidence` field.

---

## Project Controls boundary

Engineering Lifecycle Stage remains the lifecycle SOT.

Governed `LifecycleScheduleMapping` relates Project Controls (or legacy `project_phase`) objects to an **expected** lifecycle stage. Mapping types: `ALIGNS_WITH`, `EXPECTED_DURING`, `GATE_MILESTONE`, `TRANSITION_MILESTONE`, `REFERENCE_ONLY`.

Alignment states are descriptive: `ALIGNED`, `AHEAD_OF_LIFECYCLE`, `BEHIND_LIFECYCLE`, `OVERLAPPING`, `UNMAPPED`, `UNKNOWN`. They are not NON_COMPLIANT / INVALID / FAILED.

Schedule completion cannot approve a gate or transition a stage. Legacy `engineering_projects.project_phase` may inform an expected stage; it never assigns lifecycle authority.

Primavera/P6 connectors are out of scope. Future connectors populate Project Controls; Lifecycle continues to consume canonical Project Controls only.

---

## Mixed lifecycle scopes

Harvest is scoped. Project FEED, Structural DETAILED_DESIGN, and Early Works CONSTRUCTION evaluate independently. Evidence is not merged into one project-wide truth.

---

## Digital Thread

Gate evaluations reuse the canonical relational Digital Thread. Typical path:

Gate → Evaluation → Evidence Snapshot → Requirement / Interface / Analysis / Review / Assurance / Decision → Gate Decision → Transition

Platform KG is not required. KG reads remain OFF. No new graph store.

---

## RLS / security

Harvest uses authenticated tenant/workspace from commerce context, not caller-supplied tenant bypass. Schedule mapping writes require engineering admin. Ordinary engineers cannot approve transitions. Cross-workspace and cross-tenant reads of mappings and canonical source objects remain denied by existing RLS.

---

## UI

- `/engineering/lifecycle` — current stage, scoped states, gate readiness, canonical evidence source, completeness, criterion expected/actual state, staleness, schedule alignment, history, human decision
- `/engineering/settings/lifecycle` — profile selection plus schedule-mapping administration (admin)

Refresh / re-evaluate harvests again and writes a new evaluation.

---

## AAL2 / browser

Independent of this phase. If real AAL2 is unavailable, AAL2 and browser certification remain NOT_TESTED. MFA is not weakened.

---

## Performance

Representative in-process Crusher FEED EXIT harvest + evaluation is measured in unit tests (objects inspected, criteria evaluated, duration). No distributed evidence engine.

---

## Limitations

- Live table harvest is workspace/project scoped; mixed SYSTEM/ASSET filtering is complete when records carry `scopeId` (memory/certification) and best-effort on tables without scope columns.
- No event-bus auto-reevaluation; stale marking on next harvest is sufficient for A9B.
- No Primavera connector, scheduling engine, automatic transition, AI approval, Value Intelligence, real solver execution, or production deployment.
- AAL2/browser certification may be NOT_TESTED.
- EOS-A9C adds optional Deliverable Expectation / maturity evidence to gate harvest when composed; see `EOS_A9C_DELIVERABLE_MATURITY_INTELLIGENCE.md`. Schedule completion still cannot set engineering maturity.
