# Phase 11A — Project Controls Discovery

Status: discovery · Module version: `0.1.0-discovery` · Phase: 11A ·
Baseline: `asset-intelligence-v1.0.0` = `925e2ed74025cac6a145c346c17c53320efb8757`

## Overview

Phase 11A is a discovery phase for Project Controls. It ships **no Project
Controls product functionality**: no earned value, no CPM, no cost engine, no
schedule execution, no budget ledger and no work packaging UI.

What it does ship:

| Artefact | Purpose |
| --- | --- |
| `packages/project-controls` | Discovery package: version constants and the ownership lock |
| `packages/project-controls-certification` | Phase 11A gates A–AE and the certification runner |
| `PROJECT_CONTROLS_PHASE_11A_EXISTING_FOOTPRINT.md` | Complete inventory of the pre-11A footprint |
| `PROJECT_CONTROLS_DOMAIN_MODEL.md` | Candidate domain concepts, none implemented |
| `PROJECT_CONTROLS_OWNERSHIP_MATRIX.md` | Locked ownership boundaries |
| `PROJECT_CONTROLS_BOUNDARY_MAP.md` | Owns / consumes / forbidden diagram |
| `.github/workflows/phase-11a-project-controls-discovery.yml` | Hosted certification |

Declared state, from `packages/project-controls/src/version.ts`:

- `PROJECT_CONTROLS_VERSION` = `0.1.0-discovery`
- `PROJECT_CONTROLS_STATUS` = `discovery`
- `PROJECT_CONTROLS_IMPLEMENTED` = `false` — no product exists
- `PROJECT_CONTROLS_DISCOVERY_IMPLEMENTED` = `true` — the discovery package exists
- `productionProjectControlsReady` (`PRODUCTION_PROJECT_CONTROLS_READY`) = `false`

That last flag is the load-bearing one. Nothing in Phase 11A may flip
`productionProjectControlsReady` to `true`; gate M asserts it stays `false`, and
`assertOwnershipLock()` throws `project_controls_product_forbidden_in_phase_11a`
if it is ever set.

## Ownership summary

Project Controls owns **controls intelligence about projects** — cost, schedule,
progress, change and contingency. It does not own canonical project identity;
that is `engineering_core`, a decision locked in this phase and justified in
`PROJECT_CONTROLS_OWNERSHIP_MATRIX.md`.

Project Controls owns none of: Asset Intelligence, Inspection Intelligence,
Project Intelligence knowledge, canonical asset identity or lifecycle, canonical
Risk, or financial ledgers.

## Asset Intelligence V1 is untouched

Asset Intelligence is frozen at `1.0.0`, tag `asset-intelligence-v1.0.0`,
commit `925e2ed74025cac6a145c346c17c53320efb8757`. Phase 11A:

- does not move or recreate the tag (gate AE),
- does not modify any file under `packages/asset-intelligence` or
  `packages/asset-intelligence-certification` (gate U verifies the diff against
  the tag is empty),
- does not add `@rtb/asset-intelligence` as a dependency of the discovery
  package — the discovery package has no runtime dependencies at all.

The tag commit is referenced as a constant, `ASSET_INTELLIGENCE_V1_COMMIT`, in
both the discovery package and the gates module, so a moved tag fails
certification rather than passing silently.

## Certification gates

31 gates, A–AE, run by
`pnpm --filter @rtb/project-controls-certification certify:phase11a`.

| Gate | Name |
| --- | --- |
| A | Repository/build identity |
| B | Asset Intelligence V1 tag intact |
| C | PI v1 integrity |
| D | II v1 integrity |
| E | Ownership lock documented |
| F | Existing footprint inventory complete |
| G | No Project Controls product engines or services |
| H | No Project Controls product SQL tables |
| I | No Project Controls product UI page |
| J | Domain model discovery document |
| K | Ownership matrix document |
| L | Boundary map document |
| M | productionProjectControlsReady is false |
| N | Version 0.1.0-discovery |
| O | Module registry still coming_soon |
| P | Commerce entitlements remain entitlement-only |
| Q | No earned value implementation |
| R | No CPM implementation |
| S | No cost engine implementation |
| T | No schedule execution implementation |
| U | Asset Intelligence V1 contracts unmodified |
| V | Secret exposure |
| W | Artifact identity |
| X | Discovery package exists |
| Y | Certification package exists |
| Z | No duplicate asset ownership introduced |
| AA | No canonical lifecycle mutation |
| AB | No Core Risk auto-mutation by Project Controls |
| AC | Phase 11B readiness |
| AD | Discovery release eligibility |
| AE | Asset Intelligence V1 tag not moved |

Gate B needs the release tags present, so CI runs `git fetch --tags --force`
before certifying. Locally, run the same command if the tags are missing.

The runner writes
`packages/project-controls-certification/artifacts/phase11a-project-controls-discovery-certification.json`.

## Phase 11B readiness

`phase11BReady` is emitted in the certification artifact and is `true` only when
every one of the 31 gates passes. It is a readiness signal, not a licence to
build: Phase 11B still has to decide the questions this discovery left open.

Open questions carried into Phase 11B:

1. Does a canonical WBS exist in Engineering Core, and if not, who creates it?
   Project Controls consumes breakdown nodes and must not define a competing
   hierarchy.
2. Is the schedule authored in-platform or imported read-only from an external
   planning tool?
3. Is a commitment (purchase order, subcontract) a Project Controls concept or a
   commerce/procurement concept?
4. Should `engineering_os_shared_domain` and `engineering_core` be unified into
   one canonical-owner spelling? Deferred here because unifying them would
   require editing the frozen Asset Intelligence V1 surface
   (`PROJECT_IDENTITY_OWNER_SPELLING_UNIFICATION = "deferred_to_phase_11b"`).
5. Do the existing `actions.*` commerce entitlements stay attributed to the
   `project_controls` application key once a real Project Controls product
   exists, given the action register is an Engineering Core surface?

`releaseEligible` in the artifact refers to discovery scope only. There is no
Project Controls release tag in Phase 11A and none should be created.
