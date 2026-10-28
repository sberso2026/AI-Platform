# EOS 2.8 geotechnical design delivery implementation

Phase: `EOS-2.8-GEOTECHNICAL-DESIGN-DELIVERY`

Status: geotechnical delivery workflow is implemented across Concept, Feasibility, FEED, and Detailed Engineering. Electrical design delivery is not started. No bearing, settlement, slope, liquefaction, or D1 formula was added or changed.

## What this module does

`packages/engineering-os/src/geotechnical-delivery` coordinates the EOS 2.1 lifecycle state machine and the EOS 2.2 basis graph for geotechnical work. A new delivery starts at `not_classified`. Existing geotechnical projects are not enrolled. Stage movement uses the existing next-stage gate. Owner, admin, pilot engineer, and AI cannot approve geotechnical work. AI cannot record a design parameter.

Site rows may reference a Civil site. They do not create a second site master and they do not call the D3 geotechnical identity writer.

The module keeps measured field and laboratory results separate from interpretation. Parameter classes are `MEASURED`, `DERIVED`, `INTERPRETED`, `CHARACTERISTIC`, `DESIGN`, and `ASSUMED`. A class is not promoted silently. A design parameter needs source evidence. An assumed parameter needs a justification. A value needs a unit. One groundwater observation is not a design groundwater level.

Civil grading and structural loads stay owned by those disciplines. Geotechnical can receive them and can record a conflict. It cannot change the owned value and it cannot claim structural foundation capacity. Bearing, settlement, pile capacity, slope factor of safety, liquefaction adequacy, excavation stability, and pumping rate are not calculated here. A supplied fixture is labelled `SYNTHETIC_VALIDATION_FIXTURE` or `imported_reference`.

A later ground-model revision keeps the previous boundary and marks linked parameters, foundation recommendations, bearing, settlement, pile assessments, excavations, slopes, earthworks, civil and structural handoffs, and deliverables `potentially_stale`. A later design-groundwater revision and a later structural-load revision do the same for their dependents. Nothing is recalculated. Human review decides the actual impact.

## Tool boundary

PLAXIS, GeoStudio, and other geotechnical tools can be registered as metadata only. Registration cannot certify execution or bidirectional synchronization. `EXTERNAL_GEOTECHNICAL_CALCULATION_CERTIFIED` remains no.

## Migration version

`supabase/migrations/20261029000000_eos_2_8_geotechnical_delivery.sql` uses a 14-digit timestamp with hour `00`. It sorts after `20261028240000` and does not repeat that hour field. The migration adds workspace-scoped geotechnical delivery, investigation, borehole, ground-model, parameter, assessment, recommendation, deliverable, review, and audit tables. Row level security uses tenant membership and workspace membership. Inserts also require engineering execute. There is no delete policy and no backfill.

## UI

`/engineering/geotechnical` shows lifecycle stage, maturity, design basis, requirements, investigations, boreholes, CPT, laboratory and field tests, design groundwater, ground-model revision, parameters, foundation recommendations, settlement, piles, liquefaction, civil and structural handoffs, stale records, assumptions, interfaces, reviews, deliverables, blockers, and the calculations that are not active. Concept, Feasibility, FEED, and Detailed Engineering are separate views.

## Demonstration

The domain test uses synthetic site `GEO-001` under `EOS Geotechnical Design Delivery Demo`. Option A is shallow foundations. Option B is piled foundations. The profile records fill, sand, dense sand, and weathered rock as synthetic fixtures. The test records a borehole, a CPT with raw data kept separate, a laboratory result, a groundwater observation that is not a design level, an interpreted parameter, a design CBR with evidence, foundation and handoff records, and a FEED baseline. It then revises the ground-model boundary, the design groundwater level, and a structural load. Downstream records become potentially stale. Issued-for-construction readiness stays false.
