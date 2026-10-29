# EOS 2.7 civil design delivery implementation

Phase: `EOS-2.7-CIVIL-DESIGN-DELIVERY`

Status: civil delivery workflow is implemented across Concept, Feasibility, FEED, and Detailed Engineering. Geotechnical design delivery is not started. No civil hydraulic, earthworks, pavement, or D1 formula was added or changed.

## What this module does

`packages/engineering-os/src/civil-delivery` coordinates the EOS 2.1 lifecycle state machine and the EOS 2.2 basis graph for civil work. A new delivery starts at `not_classified`. Existing civil projects are not enrolled. Stage movement uses the existing next-stage gate. Owner, admin, pilot engineer, and AI cannot approve civil work.

Site and area rows are delivery references. They do not create a second area master and they do not call the D2 civil identity writer.

The module records survey datasets, topographic and design surfaces, grading, earthworks quantities, catchments, drainage, stormwater cases, channels, culverts, roads, pavements, hardstands, trenches, underground corridors, crossings, retaining interfaces, flood interfaces, erosion basis, geotechnical inputs, piping routes, structural inputs, and electrical and instrumentation interface contracts. A survey on a different datum is refused unless transformation metadata is supplied. A surface datum must match the current survey vertical datum.

Geotechnical parameters, piping routes, and structural inputs stay owned by those disciplines. Civil can receive them and can record a conflict. It cannot change the owned value and it cannot claim structural capacity. Geotechnical values are not invented. Drainage flow, cut and fill, culvert size, pavement thickness, flood level, and excavation stability are not calculated here. A supplied fixture is labelled `SYNTHETIC_VALIDATION_FIXTURE` or `imported_reference`. A quantity needs a unit and is not a procurement claim.

A later survey revision marks linked surfaces, grading, earthworks, drainage, roads, culverts, trenches, quantities, and deliverables `potentially_stale`. A later piping-route revision marks linked corridors, crossings, trenches, interfaces, and deliverables potentially stale. Previous values stay in place. Human review decides the actual impact.

## Tool boundary

Civil 3D and 12d Model can be registered as metadata only. Registration cannot certify execution or bidirectional synchronization. `EXTERNAL_CIVIL_CALCULATION_CERTIFIED` remains no.

## Schema

`supabase/migrations/20261028240000_eos_2_7_civil_delivery.sql` adds workspace-scoped civil delivery, survey, surface, grading, earthworks, drainage, road, quantity, deliverable, review, and audit tables. Row level security uses tenant membership and workspace membership. Inserts also require engineering execute. There is no delete policy and no backfill. Earlier lifecycle, basis, structural, process, mechanical, piping, and D1 tables are not altered.

## UI

`/engineering/civil` shows lifecycle stage, maturity, design basis, requirements, survey, datum, grading, earthworks, drainage, roads, pavements, culverts, underground corridors, quantities, stale records, interfaces, reviews, deliverables, blockers, and the calculations that are not active. Concept, Feasibility, FEED, and Detailed Engineering are separate views.

## Demonstration

The domain test uses synthetic site `CIV-001` under `EOS Civil Design Delivery Demo`. Option A is balanced earthworks with an elevated process area. Option B is reduced fill with more drainage complexity. The test records an AHD survey, a matching surface, grading, a synthetic earthworks quantity, drainage metadata, a road, a pavement record without a designed thickness, a culvert, a trench, a corridor, a crossing, a geotechnical CBR with a source, a piping route, a structural extent, a flood interface, and a FEED baseline. It then revises the survey checksum and the piping route. Downstream records become potentially stale. Issued-for-construction readiness stays false.
