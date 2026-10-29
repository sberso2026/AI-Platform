# EOS 2.4 process design delivery implementation

Phase: `EOS-2.4-PROCESS-DESIGN-DELIVERY`

Status: process delivery workflow is implemented across Concept, Feasibility, FEED, and Detailed Engineering. Mechanical design delivery is not started. No process formula and no D1 formula were added or changed.

## What this module does

`packages/engineering-os/src/process-delivery` coordinates the EOS 2.1 lifecycle state machine and the EOS 2.2 basis graph for process work. A new delivery starts at `not_classified`. Stage movement uses the existing next-stage gate. Owner, admin, pilot engineer, and AI cannot approve process work. AI cannot close a process-safety action.

The module records process systems, options, operating cases, streams, inputs, model references, mass and energy balance records, equipment duties, utilities, hydraulic and line-sizing records, relief cases, control-valve records, PFD and P&ID governance, interfaces, and baselines. A balance or relief record can store a supplied synthetic fixture. This module does not calculate the value. A later input revision marks linked models, balances, streams, duties, utilities, drawings, and interfaces `potentially_stale` and does not replace the previous result.

## Simulator boundary

Aspen HYSYS, Aspen Plus, UniSim, and AFT tools have a metadata adapter only. Registering a package cannot set execution as certified. Hosted simulation is not implemented.

## Schema

`supabase/migrations/20261028180000_eos_2_4_process_delivery.sql` adds workspace-scoped process delivery, stream, model, calculation-link, balance, deliverable, review, and audit tables. Row level security uses tenant membership and workspace membership. Inserts also require engineering execute. There is no delete policy and no backfill.

## UI

`/engineering/process` shows the lifecycle stage, basis, requirements, assumptions, models, balances, streams, duties, utilities, safety actions, interfaces, stale models, deliverables, reviews, blockers, and the calculations that are not active. Concept, Feasibility, FEED, and Detailed Engineering are separate views.
