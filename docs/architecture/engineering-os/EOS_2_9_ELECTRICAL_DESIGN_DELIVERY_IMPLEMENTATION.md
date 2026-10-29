# EOS 2.9 electrical design delivery implementation

Phase: `EOS-2.9-ELECTRICAL-DESIGN-DELIVERY`

Status: electrical delivery workflow is implemented across Concept, Feasibility, FEED, and Detailed Engineering. Instrumentation and control design delivery is not started. No load-flow, fault-level, cable-sizing, or D1 formula was added or changed.

## What this module does

`packages/engineering-os/src/electrical-delivery` coordinates the EOS 2.1 lifecycle state machine and the EOS 2.2 basis graph for electrical work. A new delivery starts at `not_classified`. Existing electrical projects are not enrolled. Stage movement uses the existing next-stage gate. Owner, admin, pilot engineer, and AI cannot approve electrical work. AI cannot record a protection setting or invent a study result.

System and cable rows are delivery references. They do not create a second equipment or cable master and they do not call the D7 electrical identity writer.

Process operating scenarios, Mechanical equipment duty, and Civil cable routes stay owned by those disciplines. Electrical can receive them and can record a conflict. It cannot change the owned value. A later Mechanical motor-power revision keeps the previous value and marks the load list, power balance, transformer, switchgear, studies, protection, cable sizing, voltage drop, single-line diagram, cable schedule, and deliverables `potentially_stale`. A later Civil route-length revision does the same for cable records. Nothing is recalculated. Human review decides the actual impact.

Hazardous-area classification stays with the responsible source discipline. Electrical does not create that classification. The I&C record is an interface contract only. Full I&C design is not implemented. Structural capacity is not claimed.

Load flow, short circuit, protection settings, motor starting, voltage drop, cable size, harmonics, arc flash, earthing resistance, battery capacity, UPS autonomy, generator adequacy, and transformer adequacy are not calculated here. A supplied fixture is labelled `SYNTHETIC_VALIDATION_FIXTURE`, `imported_reference`, `vendor`, or `metadata`.

## Tool boundary

ETAP, DIgSILENT PowerFactory, SKM, and EasyPower can be registered as metadata only. Registration cannot certify execution or bidirectional synchronization. `EXTERNAL_ELECTRICAL_ANALYSIS_CERTIFIED` remains no. Each adapter status is `METADATA_OR_IMPORT_ONLY_NOT_CERTIFIED`.

## Migration version

`supabase/migrations/20261029020000_eos_2_9_electrical_delivery.sql` uses a 14-digit timestamp with hour `02`. It sorts after `20261029000000`. The migration adds workspace-scoped electrical delivery, load, source, model, study, cable, protection, earthing, deliverable, review, and audit tables. Row level security uses tenant membership and workspace membership. Inserts also require engineering execute. There is no delete policy and no backfill.

## UI

`/engineering/electrical` shows lifecycle stage, maturity, design basis, requirements, load list, demand status, sources, transformers, switchgear, MCCs, single-line diagrams, power-system models, studies, stale studies, cables, cable schedules, earthing, lighting, emergency power, UPS, interfaces, changes, reviews, deliverables, blockers, and the calculations that are not active. Concept, Feasibility, FEED, and Detailed Engineering are separate views.

## Demonstration

The domain test uses synthetic system `ELEC-001` under `EOS Electrical Design Delivery Demo`. Option A is a single radial substation. Option B is a dual substation. Consumers include P-101 Synthetic Feed Pump, a package, a lighting load, a UPS load, and an emergency load. The test records a load list, operating case, source, transformer, switchgear, MCC, single-line diagram, study fixtures, cable and protection records, an I&C interface contract, and a FEED baseline. It then revises the P-101 motor power and a Civil cable-route length. Downstream records become potentially stale. Issued-for-construction readiness stays false.
