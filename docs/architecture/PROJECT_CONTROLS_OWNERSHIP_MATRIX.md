# Project Controls — ownership matrix (locked)

Status: change_intelligence · Module version: `0.4.0-change-intelligence` · Phase: 11D

This matrix is the authoritative boundary statement for Project Controls. Its
machine-readable twin is `PROJECT_CONTROLS_OWNERSHIP_MATRIX` in
`packages/project-controls/src/architecture/ownership-lock.ts`, and
`assertOwnershipLock()` fails closed if the two disagree on the load-bearing
rows.

## Locked ownership boundaries

| Concern | Owner | PC relation | Notes |
| --- | --- | --- | --- |
| Project identity (canonical) | `engineering_os_shared_project_domain` | consumes | Locked 11B — see the decision section below |
| Project hierarchy / WBS (canonical) | `engineering_os_shared_project_domain` | consumes | Phases, WBS nodes, work packages, activities, milestones are identity refs |
| Project Intelligence | `project_intelligence` | consumes | Docs, findings, meetings — knowledge ABOUT projects |
| Project documents | `project_intelligence` | consumes | Document intelligence derivatives |
| Meeting intelligence | `project_intelligence` | consumes | Meeting derivatives; PC may cite them as progress evidence |
| Project Controls — progress | `project_controls` | **owns** | **Implemented in 11B** — advisory, evidence-driven, not earned value |
| Project profile composition | `project_controls` | **owns** | **Implemented in 11B/11C/11D** — Project Context Engine (progress + schedule + change) |
| Project Controls — cost | `project_controls` | owns | Reserved provider interface only; no cost engine, no budget ledger, no financial posting. Phase 11E |
| Project Controls — schedule | `project_controls` | **owns** | **Implemented in 11C** — advisory schedule intelligence; not CPM or execution |
| Project Controls — change | `project_controls` | **owns** | **Implemented in 11D** — advisory change intelligence; assessment only, never contractual approval |
| Contractual change authority | `reserved_not_project_controls` | **forbidden** | Reserved for engineering_core, a future commercial/contracts domain, Business OS or external contract administration |
| Project snapshot and timeline | `project_controls` | **owns** | **Implemented in 11D** — immutable, identifier-only snapshots and an append-only project timeline |
| Project Controls — contingency | `project_controls` | owns | Reserved provider interface only; no drawdown |
| Earned Value | `project_controls` | reserved / forbidden | Reserved to PC by domain; forbidden to implement |
| Asset identity (canonical) | `engineering_os_shared_domain` | consumes | PC never owns canonical asset identity |
| Asset lifecycle (canonical) | `engineering_os_shared_domain` | forbidden | PC never mutates canonical asset lifecycle |
| Asset Intelligence | `asset_intelligence` | consumes | Frozen V1 — public contracts only |
| Inspection Intelligence | `inspection_intelligence` | consumes | PC may cite inspection results as progress evidence |
| Canonical Risk register | `engineering_core` | forbidden | PC may reference; auto-mutation forbidden |
| Financial ledgers / billing | `external_finance_or_future_finance_domain` | forbidden | Respelled in 11D. Project cost ledgers belong to an external finance system of record or a future finance domain — not Platform Commerce, which owns entitlement only |
| Entitlements / seats / licensing | `platform_commerce_finance` | consumes | Existing PC entitlements stay entitlement-only |
| Digital Twin | `external_future` | forbidden | Out of PC scope |
| Structural Health Monitoring (SHM) | `external_future` | forbidden | Out of PC scope |
| CMMS work orders | `none_in_project_controls` | forbidden | No work order execution in PC |

## Identity ownership decision

**Decision: `engineering_os_shared_project_domain`. Locked for Phase 11B.**
`CANONICAL_PROJECT_IDENTITY_OWNERSHIP = "engineering_os_shared_project_domain"`.

### Phase 11A position and why it changed

Phase 11A locked canonical project identity to `engineering_core`, on the evidence
that Project Intelligence attributes active projects and every other canonical
register to `engineering_core`:

- `packages/project-intelligence/src/reports/executive-dashboard.ts` cites active
  projects as `{ source: "engineering_core", refId: "projects.active" }`.
- `packages/project-intelligence/src/reports/executive-widgets.ts` declares the
  `project_health` widget with `owner: "engineering_core"`.

That was a correct reading of the repository but a placeholder as an ownership
statement, because Asset Intelligence already used the narrower
`engineering_os_shared_domain` spelling for canonical asset identity. Phase 11A
deferred reconciling the two as
`PROJECT_IDENTITY_OWNER_SPELLING_UNIFICATION = "deferred_to_phase_11b"`.

Phase 11B resolves it: identity ownership is now spelled at the same granularity
as its asset sibling, and
`PROJECT_IDENTITY_OWNER_SPELLING_UNIFICATION = "unified_in_phase_11b"`.

### Spelling unification

| Concern | Owner | Physical store |
| --- | --- | --- |
| Canonical asset identity | `engineering_os_shared_domain` | `engineering_assets` |
| Canonical project identity | `engineering_os_shared_project_domain` | `engineering_projects` |
| Canonical engineering risk | `engineering_core` | `engineering_risks` |

`engineering_core` is retained for the canonical **risk** register, which is
genuinely Core-owned, and Asset Intelligence V1 is not touched.

### Logical owner vs physical store

The Engineering Shared Project Domain
(`packages/engineering-shared-project-domain`) is the **logical identity layer**.
`engineering_projects` (batch_20) remains the **physical store** and is not
modified, replaced or forked. Batch_61 adds hierarchy reference tables beside it.
There is exactly one project record and exactly one logical owner.

Phase 11A's core consequence is unchanged and strengthened: **Project Controls
does not claim canonical project identity.** PC consumes `ProjectReference` only,
asserted by `CANONICAL_PROJECT_IDENTITY_CLAIMED_BY_PROJECT_CONTROLS = false`,
`PROJECT_IDENTITY_MUTATION_BY_PROJECT_CONTROLS_ALLOWED = false` and
`PROJECT_CONTROLS_CONSUMES_PROJECT_REFERENCE_ONLY = true`. The resolution port
exposes no write method, so mutation is impossible rather than merely forbidden.

## What Project Controls does NOT own

Stated explicitly, because these are the boundaries most likely to be eroded:

- **Asset Intelligence.** Frozen at V1.0.0 (`asset-intelligence-v1.0.0`,
  `925e2ed74025cac6a145c346c17c53320efb8757`). PC consumes public contracts and
  owns none of it. Phase 11B does not modify the AI surface.
- **Project Intelligence.** Frozen at V1.0.0 (`project-intelligence-v1.0.0`,
  `34975b1...`). PI owns knowledge derivatives about projects; PC does not
  re-derive them.
- **Inspection Intelligence.** Frozen at V1.0.0 (`inspection-intelligence-v1.0.0`,
  `d47c4ff...`). II's consumer fixture forbids `project_controls_ownership_via_ii`.
- **Canonical asset identity and lifecycle.** Owned by
  `engineering_os_shared_domain`; `DUPLICATE_ASSET_OWNERSHIP_INTRODUCED = false`.
- **Canonical project identity and hierarchy.** Owned by
  `engineering_os_shared_project_domain`;
  `DUPLICATE_PROJECT_OWNERSHIP_DETECTED = false`.
- **Canonical Risk.** Owned by `engineering_core`
  (`RISK_CORE_AUTO_MUTATION_ALLOWED = false`).
- **Financial ledgers and billing.** Owned by
  `external_finance_or_future_finance_domain`. A cost position inside Project
  Controls would be a control artefact, not a record of account — and no cost
  position exists through 11D. `FINANCIAL_POSTING_IMPLEMENTED = false`.
- **Contractual change authority.** Deliberately unassigned
  (`reserved_not_project_controls`). Project Controls assesses change and never
  approves it; see `PROJECT_CONTROLS_CHANGE_AUTHORITY_BOUNDARY.md`.
- **Earned value.** Reserved to the PC domain but forbidden to implement.
  Progress Intelligence is advisory and evidence-based; see
  `PROJECT_CONTROLS_PROGRESS_INTELLIGENCE.md`.
- **CMMS work orders, Digital Twin and SHM.** Out of scope entirely.

## Product status

Owning progress, schedule and change intelligence is not owning a Project
Controls product. `PROJECT_CONTROLS_IMPLEMENTED = false`,
`PRODUCTION_PROJECT_CONTROLS_READY = false`, and the Engineering OS module
registry entry stays `coming_soon`. `assertOwnershipLock()` throws
`project_controls_product_forbidden_in_phase_11b` if either flag is flipped.

## Enforcement points

| Statement | Enforced by |
| --- | --- |
| Canonical project identity is shared-domain owned | `assertOwnershipLock()`; batch_61 `identity_owner` CHECK |
| PC does not claim or mutate project identity | `assertOwnershipLock()`; write-free resolution port |
| PC consumes ProjectReference only | `PROJECT_CONTROLS_CONSUMES_PROJECT_REFERENCE_ONLY`; FK to `engineering_projects` |
| Progress is advisory, never earned value | `assertNoEarnedValue()`; batch_62 CHECK constraints |
| Change is advisory, never contractual approval | `assertNoContractualApproval()`; `assertChangePublishable()`; batch_64 CHECK constraints |
| Change candidate is never an approved change | `assertCandidateIsNotApprovedChange()`; batch_64 `is_approved_change = false` |
| No cost engine, budget ledger or financial posting | `assertNoCostEngine()`; batch_64 `budget_mutated`/`financial_posting_performed` CHECKs |
| PC engines (cost/EV/forecast/contingency/baseline) unimplemented | `assertReservedProvidersUnimplemented()` |
| PC owns no asset identity row | `assertOwnershipLock()` |
| PC never mutates canonical lifecycle | version lock |
| PC never auto-mutates Core Risk | version lock |
| No autonomous progress publication | `assertOwnershipLock()`; `assertPublishable()` |
| AI / PI / II V1 untouched | Phase 11B V1-intact gates |
