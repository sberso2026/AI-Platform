# EOS 2.3 structural design delivery implementation

Phase: `EOS-2.3-STRUCTURAL-DESIGN-DELIVERY`

Status: structural delivery workflow is implemented across Concept, Feasibility, FEED, and Detailed Engineering. Process design delivery is not started. No D1 formula file was changed.

## What this module does

`packages/engineering-os/src/structural-delivery` coordinates the EOS 2.1 lifecycle state machine and the EOS 2.2 basis graph for structural work. A new delivery starts at `not_classified`. Stage movement uses the existing next-stage gate. Owner, admin, pilot engineer, and AI cannot approve structural work.

The module records structural systems, options, loads, load cases, models, calculation links, results references, interfaces, foundations, connections, reviews, deliverables, and baselines. A baseline stores revision identities. A later load revision marks linked calculations, models, results, and deliverables `potentially_stale` and does not replace the previous result.

## D1 mapping

| EOS 2.3 object | Existing D1 relationship |
| --- | --- |
| Structural calculation | Optional `d1CalculationId` pointing at an existing calculation identity. This module does not call the evaluation engine. |
| Structural result | Provenance reference only unless a value was already supplied by a validated engine outside this phase. |
| SPACE GASS | Existing D1G read-only connector remains the connector. This phase registers metadata and refuses an execution-certification flag. |
| Qualified review | Existing qualified-review boundary remains. This phase does not grant that authority to a platform role. |

## Known limitations that remain

The preserved list is in the structural delivery model and on the structural home page. It includes the C3 interaction-surface, stability, and National Annex limits; the C6 supplied effective length and phiEf limits; the C7 class N boundary; the C9 slab and wall limits; separate D1G solver qualification; and separate D1L project certification.

Connection design, foundation design calculations, complete wall design, complete two-way slab design, and hosted solver execution are `NOT_IMPLEMENTED`. Preliminary member sizing is a bounded reference, not a new sizing engine.

## Schema

`supabase/migrations/20261028160000_eos_2_3_structural_delivery.sql` adds workspace-scoped structural delivery, load, model, calculation, result, deliverable, review, and audit tables. Row level security uses tenant membership and workspace membership. Inserts also require engineering execute. There is no delete policy and no backfill of existing projects.

## UI

`/engineering/structural` shows the lifecycle stage, basis, requirements, assumptions, loads, models, calculations, stale calculations, interfaces, changes, reviews, deliverables, blockers, and the preserved limitations. Unsupported calculations are listed as not active. Concept, Feasibility, FEED, and Detailed Engineering are separate views.
