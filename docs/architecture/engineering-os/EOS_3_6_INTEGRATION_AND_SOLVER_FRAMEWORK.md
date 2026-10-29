# EOS 3.6 Integration and Solver Framework

`PHASE=EOS-3.6-INTEGRATION-AND-SOLVER-FRAMEWORK`

`VERDICT=PASS`

`EOS_3_5_STARTING_DIRTY_STATE_RECONCILED=YES`

`EOS_3_5_BASELINE_PROVENANCE_ACCEPTABLE=YES`

`EOS_2_0_GA_BASELINE_PRESERVED=YES`

`EOS_3_5_WORKFLOW_EVENT_BASELINE_PRESERVED=YES`

`EOS_3_EXTERNAL_SOLVER_GLOBAL_QUALIFICATION=NO`

`EOS_3_PRODUCTION_ACTIVATION_PERFORMED=NO`

`PRODUCTION_EOS_2_MIGRATION_LEDGER_UNCHANGED=YES` (`161`)

`READY_FOR_NEXT_PHASE=YES`

`NEXT_PHASE=EOS-3.7-AI-ORCHESTRATION-AND-ENGINEERING-REASONING`

## Core invariants

- `CONNECTOR_AVAILABLE != SOLVER_QUALIFIED`
- `EXECUTION_SUCCESS != ENGINEERING_VALIDATION`
- `RESULT_IMPORTED != RESULT_APPROVED`
- `EXTERNAL_RESULT != HUMAN_DECISION`
- `IMPLEMENTED != VALIDATED != QUALIFIED`

## EOS 3.5 dirty-start reconciliation

START_HEAD `b919c5e0` matches EOS 3.5 commit. Worktree clean before 3.6. Commit file set is only EOS 3.5 workflow/event libs, tests, docs, staging migration, and gate timestamp — no unrelated contamination. Prior `WORKTREE_CLEAN_AT_START=NO` was in-progress EOS 3.5 artifacts later committed intact.

## Branch

`eos-3/foundation-and-compatibility`

## Delivered

- Canonical connector identity/categories/capabilities, secret isolation, import/export provenance, conflict visibility
- Solver framework: qualification states, input manifests, job states, result ingestion (`RESULT` only), synthetic adapter
- Staging scenarios + additive migration `20261030040000_eos_3_6_integration_solver_framework`
- SPACE GASS assessed as existing D1G read-only connector (bounded limitation); global qualification remains NO

## Modules

- `apps/web/src/lib/engineering/eos3-integration-connectors.ts`
- `apps/web/src/lib/engineering/eos3-solver-framework.ts`
- `apps/web/src/lib/engineering/eos3-integration-staging.ts`

## Qualification

`EOS_3_6_QUALIFICATION_IMPACT=NONE` — framework only; no D1 formula changes; no external solver globally qualified.

## ADRs

`EOS_3_NEW_MATERIAL_ARCHITECTURAL_DECISION_COUNT=0` — in-process contracts/adapters; no new broker/queue/sandbox platform.

## Next phase

With graph, retrieval, decision/optimization, workflow/events, and controlled integration/solver framework in place, next is higher-order AI orchestration (`EOS-3.7-AI-ORCHESTRATION-AND-ENGINEERING-REASONING`).
