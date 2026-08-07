# Project Controls — ownership matrix (locked)

Status: discovery · Module version: `0.1.0-discovery` · Phase: 11A

This matrix is the authoritative boundary statement for Project Controls. Its
machine-readable twin is `PROJECT_CONTROLS_OWNERSHIP_MATRIX` in
`packages/project-controls/src/architecture/ownership-lock.ts`, and
`assertOwnershipLock()` fails closed if the two disagree on the load-bearing
rows.

## Locked ownership boundaries

| Concern | Owner | PC relation | Notes |
| --- | --- | --- | --- |
| Project identity (canonical) | `engineering_core` | consumes | Locked — see the decision section below |
| Project hierarchy / WBS (canonical) | `engineering_core` | consumes | PC joins on canonical nodes; it defines no competing hierarchy |
| Project Intelligence | `project_intelligence` | consumes | Docs, findings, meetings — knowledge ABOUT projects |
| Project documents | `project_intelligence` | consumes | Document intelligence derivatives |
| Meeting intelligence | `project_intelligence` | consumes | Meeting derivatives |
| Project Controls — cost | `project_controls` | owns | Future; no cost engine in 11A |
| Project Controls — schedule | `project_controls` | owns | Future; no CPM or schedule execution in 11A |
| Project Controls — progress | `project_controls` | owns | Future; no progress measurement in 11A |
| Project Controls — change | `project_controls` | owns | Future; no change workflow in 11A |
| Project Controls — contingency | `project_controls` | owns | Future; no drawdown in 11A |
| Earned Value | `project_controls` | reserved / forbidden | Reserved to PC by domain; forbidden to implement in 11A |
| Asset identity (canonical) | `engineering_os_shared_domain` | consumes | PC never owns canonical asset identity |
| Asset lifecycle (canonical) | `engineering_os_shared_domain` | forbidden | PC never mutates canonical asset lifecycle |
| Asset Intelligence | `asset_intelligence` | consumes | Frozen V1 — public contracts only |
| Inspection Intelligence | `inspection_intelligence` | consumes | PC is a documented future consumer of II contracts |
| Canonical Risk register | `engineering_core` | forbidden | PC may reference; auto-mutation forbidden |
| Financial ledgers / billing | `platform_commerce_finance` | forbidden | Commerce and finance own money movement |
| Entitlements / seats / licensing | `platform_commerce_finance` | consumes | Existing PC entitlements stay entitlement-only |
| Digital Twin | `external_future` | forbidden | Out of PC scope |
| Structural Health Monitoring (SHM) | `external_future` | forbidden | Out of PC scope |
| CMMS work orders | `none_in_project_controls` | forbidden | No work order execution in PC |

## Identity ownership decision

The open question entering Phase 11A was whether canonical project identity
belongs to `engineering_os_shared_domain` (the spelling Asset Intelligence uses
for canonical asset identity) or to `engineering_core`.

**Decision: `engineering_core`. Locked for Phase 11A.**

Evidence from existing repository patterns:

- `packages/project-intelligence/src/reports/executive-dashboard.ts` cites
  active projects as `{ source: "engineering_core", refId: "projects.active" }`.
- `packages/project-intelligence/src/reports/executive-widgets.ts` declares the
  `project_health` widget with `owner: "engineering_core"` and the description
  "Active projects and high-criticality assets from Engineering Core".
- Every other canonical register that Project Intelligence reads — risks,
  issues, actions, technical queries, lessons — is attributed to
  `engineering_core` in the same file.

Asset Intelligence uses `engineering_os_shared_domain` for asset identity and
`engineering_core` for the canonical risk register, so both spellings already
coexist in the frozen V1 surface. They denote the same Engineering OS canonical
layer at different granularity. Phase 11A does **not** attempt to unify the two
spellings, because doing so would require editing the frozen Asset Intelligence
V1 files. That unification is recorded as
`PROJECT_IDENTITY_OWNER_SPELLING_UNIFICATION = "deferred_to_phase_11b"`.

Consequence, and the point of the decision: **Project Controls does not claim
canonical project identity.** This is asserted in code by
`CANONICAL_PROJECT_IDENTITY_CLAIMED_BY_PROJECT_CONTROLS = false` and enforced by
`assertOwnershipLock()`, which throws
`project_controls_may_not_claim_canonical_project_identity`.

## What Project Controls does NOT own

Stated explicitly, because these are the boundaries most likely to be eroded:

- **Asset Intelligence.** Frozen at V1.0.0 (`asset-intelligence-v1.0.0`,
  `925e2ed74025cac6a145c346c17c53320efb8757`). Project Controls consumes its
  public contracts and owns none of it. Phase 11A does not modify the Asset
  Intelligence surface at all.
- **Inspection Intelligence.** II owns inspection records and findings. II's own
  consumer fixture already forbids `project_controls_ownership_via_ii`.
- **Project Intelligence identity and knowledge.** PI owns knowledge derivatives
  about projects — documents, meetings, findings. Project Controls does not
  re-derive them.
- **Canonical asset identity and canonical asset lifecycle.** Owned by
  `engineering_os_shared_domain`. Project Controls introduces no second asset
  owner; `DUPLICATE_ASSET_OWNERSHIP_INTRODUCED = false` is a certification gate.
- **Canonical project identity.** Owned by `engineering_core`, per the decision
  above.
- **Canonical Risk.** Owned by `engineering_core`. Project Controls may
  reference a risk; it may never auto-create or auto-mutate one
  (`RISK_CORE_AUTO_MUTATION_ALLOWED = false`).
- **Financial ledgers and billing.** Owned by platform commerce and finance.
  A cost position inside Project Controls is a control artefact, not a
  financial record of account.
- **CMMS work orders, Digital Twin and SHM.** Out of scope entirely.

## Enforcement points

| Statement | Enforced by |
| --- | --- |
| PC does not claim canonical project identity | `assertOwnershipLock()`; gate E |
| PC owns no asset identity row | `assertOwnershipLock()`; gate Z |
| PC never mutates canonical lifecycle | version lock; gate AA |
| PC never auto-mutates Core Risk | version lock; gate AB |
| PC entitlements stay entitlement-only | gate P |
| Asset Intelligence V1 untouched | gates B, U, AE |
