# EOS 2.10 instrumentation and control design delivery implementation

Phase: `EOS-2.10-INSTRUMENTATION-AND-CONTROL-DESIGN-DELIVERY`

Status: instrumentation and control delivery is implemented across Concept, Feasibility, FEED, and Detailed Engineering. Cross-discipline interface intelligence is not started. No SIL calculation, control-tuning formula, or D1 formula was added or changed.

## What this module does

`packages/engineering-os/src/instrumentation-delivery` coordinates the EOS 2.1 lifecycle state machine and the EOS 2.2 basis graph for instrumentation and control work. A new delivery starts at `not_classified`. Existing I&C projects are not enrolled. Stage movement uses the existing next-stage gate. Owner, admin, pilot engineer, and AI cannot approve I&C work. AI cannot determine a SIL target, approve cause and effect, approve alarm rationalization, or approve a trip setpoint.

Instrument and cable rows are delivery references. They do not create a second instrument or cable master and they do not call the D8 I&C identity writer.

Process intent, Mechanical package signal lists, Piping line design, and Electrical protection stay owned by those disciplines. I&C can receive them and can record a conflict. It cannot change the owned value. A later process trip revision keeps the previous statement and marks trips, datasheets, I/O, narratives, cause and effect, SIF records, logic references, FAT, SAT, commissioning, and deliverables `potentially_stale`. A later package signal-list revision does the same for package interfaces, I/O, narratives, panels, cables, FAT, and deliverables. Nothing is recalculated. Human review decides the actual impact.

A SIL target is accepted only when an authorized safety-study source is cited. This module does not determine the target. A SIF record is not an achieved SIL. SIS verification may store an imported fixture. `DETERMINISTIC_SIL_VERIFICATION_ENGINE_READY` remains no. A safety function is not allocated to the BPCS. Basic process control and safety systems stay separate.

Instrument ranges, alarm setpoints, trip values, control-valve Cv, package signals, and vendor specifications are not invented. A value needs a unit. An I/O signal needs a source, destination, and system allocation. An AI control narrative stays proposed. FAT and SAT are not marked passed without evidence. A safety-critical commissioning test is not closed automatically. Network secrets are not stored. OT cybersecurity records are requirements only. This module does not open access, change firewall rules, or create accounts.

## Tool boundary

Instrument databases and control platforms can be registered as metadata only. Registration cannot certify execution or bidirectional synchronization. `EXTERNAL_IC_CONFIGURATION_CERTIFIED` remains no. EOS is not bound to one vendor.

## Migration version

`supabase/migrations/20261029040000_eos_2_10_instrumentation_control_delivery.sql` uses a 14-digit timestamp with hour `04`. It sorts after `20261029020000`. The migration adds workspace-scoped I&C delivery, instrument, signal, alarm, SIF, verification, package, network, cybersecurity, deliverable, review, and audit tables. Row level security uses tenant membership and workspace membership. Inserts also require engineering execute. There is no delete policy and no backfill.

## UI

`/engineering/instrumentation` shows lifecycle stage, maturity, design basis, requirements, instrument index, I/O, loops, narratives, cause and effect, alarms, SIF records, package interfaces, panels, junction boxes, cables, networks, cybersecurity requirements, FAT, SAT, stale records, interfaces, changes, reviews, deliverables, blockers, and the calculations that are not active. Concept, Feasibility, FEED, and Detailed Engineering are separate views.

## Demonstration

The domain test uses synthetic system `IC-001` under `EOS Instrumentation and Control Design Delivery Demo` for `P-101 Synthetic Feed Pump`. Option A is central DCS control with a hardwired package interface. Option B is a package PLC with DCS supervision. The test records an instrument, an I/O signal allocated to SIS, a control loop, a narrative, cause and effect, an alarm, a SIF with a supplied source, an imported verification fixture, package and cable records, and a FEED baseline. It then revises the process trip requirement and the mechanical package signal list. Downstream records become potentially stale. Issued-for-construction readiness stays false.
