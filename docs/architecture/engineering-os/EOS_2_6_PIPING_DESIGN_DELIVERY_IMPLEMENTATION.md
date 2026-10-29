# EOS 2.6 piping design delivery implementation

Phase: `EOS-2.6-PIPING-DESIGN-DELIVERY`

Status: piping delivery workflow is implemented across Concept, Feasibility, FEED, and Detailed Engineering. Civil design delivery is not started. No piping stress formula, hydraulic formula, or D1 formula was added or changed.

## What this module does

`packages/engineering-os/src/piping-delivery` coordinates the EOS 2.1 lifecycle state machine and the EOS 2.2 basis graph for piping work. A new delivery starts at `not_classified`. Existing piping projects are not enrolled. Stage movement uses the existing next-stage gate. Owner, admin, pilot engineer, and AI cannot approve piping work.

Line numbers in this module are delivery-list records. They do not create a second piping identity master and they do not call the D5 identity writer.

The module records systems, routing options, line-list rows, process-condition references, piping classes, materials, routes, valves, special items, test requirements, MTO quantities, supports, restraints, mechanical nozzles, nozzle-load comparisons, tie-ins, stress-model metadata, stress cases, and imported or synthetic stress-result fixtures. Process remains the owner of process conditions. Mechanical remains the owner of nozzle data. Piping can receive those records and can record a conflict. It cannot change the owned value.

A later process-condition revision marks linked lines, classes, stress models, stress results, supports, nozzle comparisons, structural and mechanical interfaces, and deliverables `potentially_stale`. A later nozzle-location revision marks linked routes, stress models, supports, results, comparisons, MTO rows, and deliverables potentially stale. Previous values stay in place. Human review decides the actual impact.

A line size requires a unit and a process, imported, or metadata source. A support reaction and an MTO quantity require a unit. A stress result requires provenance and cannot claim code compliance. A nozzle comparison stays `not_compared` unless both an allowable value and a piping load are supplied with units. Acceptability is not declared by the comparison. A tie-in is not field-verified without evidence. A support record is not structural steel design.

## Solver and model boundary

CAESAR II and AutoPIPE can be registered as metadata only. Registration cannot certify execution. AVEVA E3D, Plant 3D, and other plant-model tools can be registered as metadata only. Bidirectional synchronization is not implemented. `EXTERNAL_PIPING_STRESS_EXECUTION_CERTIFIED` remains no.

## Schema

`supabase/migrations/20261028220000_eos_2_6_piping_delivery.sql` adds workspace-scoped piping delivery, line-record, class, route, stress-model, stress-result, support, tie-in, deliverable, review, and audit tables. Row level security uses tenant membership and workspace membership. Inserts also require engineering execute. There is no delete policy and no backfill. Earlier lifecycle, basis, structural, process, mechanical, and D1 tables are not altered.

## UI

`/engineering/piping` shows lifecycle stage, maturity, design basis, requirements, lines, classes, process conditions, mechanical nozzles, routes, stress-critical lines, stress models, stale models, nozzle comparisons, supports, tie-ins, reviews, deliverables, blockers, and the calculations that are not active. Concept, Feasibility, FEED, and Detailed Engineering are separate views.

## Demonstration

The domain test uses synthetic system `PIP-001` connected to `P-101` under `EOS Piping Design Delivery Demo`. Option A is a direct pipe-rack route. Option B is a longer flexible route. The test records a process design temperature, a line whose size comes from that process source, a class, a route, a human-confirmed stress-critical flag, a tie-in, an MTO, a mechanical nozzle without an invented allowable, a synthetic stress fixture labelled `SYNTHETIC_VALIDATION_FIXTURE`, a support reaction, and a FEED baseline. It then revises the process temperature and the nozzle location. Downstream records become potentially stale. Issued-for-construction readiness stays false.
