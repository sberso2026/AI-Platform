# EOS 3.5 Governed Workflow and Event Architecture

`PHASE=EOS-3.5-GOVERNED-WORKFLOW-AND-EVENT-ARCHITECTURE`

`VERDICT=PASS`

`EOS_2_0_GA_BASELINE_PRESERVED=YES`

`EOS_3_1_FOUNDATION_BASELINE_PRESERVED=YES`

`EOS_3_2_CANONICAL_OBJECT_BASELINE_PRESERVED=YES`

`EOS_3_3_KNOWLEDGE_RETRIEVAL_BASELINE_PRESERVED=YES`

`EOS_3_4_DECISION_OPTIMIZATION_BASELINE_PRESERVED=YES`

`EOS_3_WORKFLOW_ENGINE_DECISION=EVOLVE_EXISTING`

`EOS_3_PRODUCTION_ACTIVATION_PERFORMED=NO`

`PRODUCTION_EOS_2_MIGRATION_LEDGER_UNCHANGED=YES` (`161`)

`READY_FOR_NEXT_PHASE=YES`

`NEXT_PHASE=EOS-3.6-INTEGRATION-AND-SOLVER-FRAMEWORK`

## Core invariants

- `EVENT != AUTHORITY`
- `WORKFLOW_TRANSITION != ENGINEERING_APPROVAL`
- AI may recommend, summarize, draft work items; AI may **not** approve, accept, finalize, release, freeze, or IFC
- Events notify / trigger evaluation / create governed work items; events never silently perform authoritative engineering actions

## Branch

`eos-3/foundation-and-compatibility`

## Delivered

- Canonical workflow definitions (versioned) + instances + deterministic transition validation
- Authority matrix + human checkpoints + AI authority boundary
- Governed event bus: taxonomy, idempotency, ordering, cascade depth, failure/dead-letter, replay-safe
- Change propagation + stale-state + requirement/interface/review/decision/optimization/deliverable/baseline workflows
- Governed work items (assignment ≠ authority)
- Additive staging migration `20261030020000_eos_3_5_workflow_events`
- Staging synthetic scenario + security tests

## Modules

- `apps/web/src/lib/engineering/eos3-workflow-engine.ts`
- `apps/web/src/lib/engineering/eos3-governed-events.ts`
- `apps/web/src/lib/engineering/eos3-workflow-staging.ts`

## Qualification

`EOS_3_5_QUALIFICATION_IMPACT=NONE` — workflow/event semantics do not alter qualified D1 calculation semantics.

## ADRs

`EOS_3_NEW_MATERIAL_ARCHITECTURAL_DECISION_COUNT=0` — evolved existing in-process governed workflow/event model; no Kafka/Temporal/new event store.

## Next phase

With structured state, digital thread, retrieval, Decision/Optimization Intelligence, and governed workflow/events in place, next is controlled adapters to external engineering systems and solvers (`EOS-3.6-INTEGRATION-AND-SOLVER-FRAMEWORK`).
