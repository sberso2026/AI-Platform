# Project Controls — candidate domain model (discovery)

Status: discovery · Module version: `0.1.0-discovery` · Phase: 11A

This document records **discovery concepts only**. Nothing here is implemented,
scheduled, or committed to. It exists so Phase 11B starts from a named set of
concepts with agreed boundaries rather than from a blank page.

Read this together with `PROJECT_CONTROLS_OWNERSHIP_MATRIX.md` (who owns what)
and `PROJECT_CONTROLS_BOUNDARY_MAP.md` (what Project Controls may consume).

## Framing

Project Controls is **controls intelligence about projects**. It is the sibling
of Asset Intelligence (intelligence about assets) and Project Intelligence
(knowledge about projects). It is not the project record, and it is not a
financial system.

Two invariants hold for every concept below:

1. The canonical project record is owned by Engineering Core. Project Controls
   references a `projectId`; it never mints one.
2. Money that actually moves — invoices, billing, ledgers — belongs to platform
   commerce and finance, not to Project Controls.

## Discovery concepts (candidates — none implemented)

### Cost

Planned, committed and incurred cost positions attached to a project or a
breakdown node. Discovery question: does Project Controls hold cost *positions*
derived from a source of record, or does it hold only variance analytics over
positions owned elsewhere? Phase 11A does not answer this.

### Schedule

Activities, milestones, durations, logic links and baselines. Discovery
question: is the schedule authored inside the platform or imported from an
external planning tool (Primavera P6, MS Project) and treated as read-only?
Phase 11A does not answer this.

### Progress

Physical and measured progress against a defined scope: quantities installed,
steps complete, rules of credit. Discovery question: what is the smallest unit
of measurable scope the platform can support consistently across disciplines?

### Change

Change requests, variations, trends and their effect on cost and schedule
positions. Discovery question: how does a Project Controls change interact with
Engineering Core's canonical Risk and Issue registers without duplicating them?

### Contingency

Contingency and management reserve pools, drawdown history and the justification
trail. Discovery question: is drawdown an approval workflow (human-gated) or a
derived analytic? Phase 11A assumes human-gated by default.

### Earned Value (reserved)

Earned Value Management — budgeted cost of work scheduled/performed, actual cost
of work performed, and the derived cost and schedule performance indices — is
**reserved to Project Controls by domain, and forbidden to implement** before an
explicit later phase. It is listed here so that no other module claims it.

Earned value requires all three of Cost, Schedule and Progress to be trustworthy
at the same breakdown level. None of those exists yet, so any earned value
number produced today would be fabricated. Phase 11A gate Q enforces the
absence of an implementation.

### WBS consumption

Work Breakdown Structure nodes are the join key between cost, schedule and
progress. Discovery position: Project Controls **consumes** canonical breakdown
nodes from Engineering Core and never defines a competing hierarchy. If the
canonical WBS turns out not to exist, defining it is an Engineering Core task
in Phase 11B, not a Project Controls task.

### Commitment

Purchase orders, subcontracts and other commitments as the bridge between a
budget and an actual. Discovery question: is a commitment a Project Controls
concept or a commerce/procurement concept? Unresolved; leaning commerce.

### Productivity

Achieved output per unit of input, used to explain and forecast progress.
Discovery question: what input data would exist without a timesheet system?

### Resource demand

Forward-looking labour, plant and material demand implied by the schedule.
Discovery question: demand only, or demand and availability?

### Milestone

Contractually or commercially significant dates. Overlaps with Schedule; kept
separate here because milestones are often tracked when a full schedule is not.

### Baseline

The approved snapshot that variance is measured against, for any of Cost,
Schedule, Progress or Scope. Discovery position: baselines are immutable once
approved; re-baselining creates a new version rather than editing the old one.

### Variance

The delta between a baseline and a current position, with an explanation. This
is the analytic layer that most of the above feeds.

### Forecast (reserved)

Estimate at completion and estimate to complete for cost and schedule. Reserved
in the same sense as Earned Value: named so it is not claimed elsewhere,
forbidden to implement in discovery. Note the module registry already declares
an `aiCapabilities` entry `project_controls.forecast`; that is a declared name
with no implementation behind it.

## Explicitly not implemented in Phase 11A

Phase 11A ships constants, an ownership lock and documents. It ships no runtime
for any of the following, and the certification gates assert their absence:

| Capability | Gate | State |
| --- | --- | --- |
| Earned value calculation | Q | Not implemented — reserved |
| Critical Path Method scheduling (forward/backward pass, float) | R | Not implemented |
| Cost engine, cost accounts, budget ledger | S | Not implemented |
| Schedule execution, progress update, work packaging UI | T | Not implemented |
| Project Controls SQL product tables | H | Not introduced |
| Project Controls product UI page | I | Not implemented |

Critical Path Method deserves a specific note: CPM is a solved algorithm, so the
temptation is to implement it early. Discovery deliberately does not, because
without an agreed activity model and an agreed source of schedule truth, a CPM
implementation would encode the wrong data model into the codebase.

## Concept keys

The concept list is mirrored in code as
`PROJECT_CONTROLS_DISCOVERY_CONCEPTS` in
`packages/project-controls/src/version.ts`, so the document and the package
cannot drift silently.
