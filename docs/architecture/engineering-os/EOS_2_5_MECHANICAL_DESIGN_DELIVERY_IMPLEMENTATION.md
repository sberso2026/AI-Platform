# EOS 2.5 mechanical design delivery implementation

Phase: `EOS-2.5-MECHANICAL-DESIGN-DELIVERY`

Status: mechanical delivery workflow is implemented across Concept, Feasibility, FEED, and Detailed Engineering. Piping design delivery is not started. No mechanical formula and no D1 formula were added or changed.

## What this module does

`packages/engineering-os/src/mechanical-delivery` coordinates the EOS 2.1 lifecycle state machine and the EOS 2.2 basis graph for mechanical work. A new delivery starts at `not_classified`. Existing mechanical projects are not enrolled. Stage movement uses the existing next-stage gate. Owner, admin, pilot engineer, and AI cannot approve mechanical work. AI cannot accept vendor data.

The module records equipment, process-duty references, design conditions, materials, datasheets, mass states, nozzles, maintenance, lifting, reliability, package boundaries, vendor revisions, calculation and model provenance, interfaces, reviews, deliverables, and baselines. Process remains the owner of process duty. Mechanical can receive a duty and can record a conflict. It cannot change the process-owned value.

A later process-duty revision marks linked datasheets, calculations, masses, nozzles, piping, structural, electrical, and instrumentation interfaces, lifting requirements, and deliverables `potentially_stale`. A later vendor revision supersedes the previous revision and keeps the previous checksum. A vendor mass change marks the governed mass, structural interface, lifting requirement, and deliverables potentially stale without replacing the stored mass. Human review decides the actual impact.

Vendor acceptance does not approve the equipment package. A lifting record is a planning record. `engineered` stays false. A nozzle allowable load cannot be stored by this module. An equipment mass requires a value and a unit before it can be recorded.

## Calculation boundary

Pressure-vessel design, pump and compressor performance, shaft power, wall thickness, MAWP, nozzle allowable loads, fatigue, rotordynamics, and hosted mechanical calculation are `NOT_IMPLEMENTED`. An external mechanical tool can be registered as metadata only. Registration cannot certify execution. `EXTERNAL_MECHANICAL_CALCULATION_CERTIFIED` remains no.

## Schema

`supabase/migrations/20261028200000_eos_2_5_mechanical_delivery.sql` adds workspace-scoped mechanical delivery, equipment, datasheet, vendor-data, calculation-link, deliverable, review, and audit tables. Row level security uses tenant membership and workspace membership. Inserts also require engineering execute. There is no delete policy and no backfill. Earlier lifecycle, basis, structural, process, and D1 tables are not altered.

## UI

`/engineering/mechanical` shows lifecycle stage, maturity, design basis, requirements, equipment, process duties, datasheets, vendor data, calculation references, stale records, maintenance, lifting, interfaces, reviews, deliverables, blockers, and the calculations that are not active. Concept, Feasibility, FEED, and Detailed Engineering are separate views.

## Demonstration

The domain test uses synthetic equipment `P-101` and `V-101` under `EOS Mechanical Design Delivery Demo`. Option A is one 100 percent pump. Option B is two 100 percent duty and standby pumps. The test records a process duty, a datasheet, a material, a unit-bearing operating mass, maintenance, lifting, nozzle identity, vendor revisions, and a FEED baseline. It then revises the process duty and records a vendor mass change. Downstream records become potentially stale. The original duty value and the earlier vendor checksum stay in place. Issued-for-construction readiness stays false.
