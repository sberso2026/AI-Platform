# EOS 2.1 engineering lifecycle foundation implementation

Phase: `EOS-2.1-ENGINEERING-LIFECYCLE-FOUNDATION`

Status: implemented foundation. EOS 2.2 and later phases are not implemented. No discipline calculator was added. The qualified D1 baseline was not changed.

## What was added

The deterministic runtime is `packages/engineering-os/src/delivery-lifecycle`. It keeps these concepts separate:

- lifecycle stage, including `not_classified`
- design maturity
- stage-gate criteria and exceptions
- configuration baseline
- review and approval, which this runtime does not grant

Allowed ordinary transitions are `not_classified -> concept -> feasibility -> feed -> detailed_engineering`. Skipping is rejected. Future stages are named in the architecture and are not transition targets in this phase.

A new lifecycle record starts at `not_classified`. The migration does not insert rows for existing projects and does not alter EOS-A9A lifecycle assignments.

Maturity changes record `approvalGranted: false`. Owner, admin, pilot engineer, and AI cannot authorize a transition. A blocking unmet criterion prevents an ordinary transition. An override requires an authorized role and a rationale.

Baselines store references and are frozen. A later change creates the next revision. The baseline table has no update policy.

## Schema

`supabase/migrations/20261028120000_eos_2_1_delivery_lifecycle.sql` adds:

- `engineering_delivery_lifecycles`
- `engineering_delivery_baselines`
- `engineering_delivery_audit`

Row level security requires the caller's tenant and workspace membership. Inserts and updates also require `engineering` `execute`. There is no delete policy. Cross-workspace reads and writes are denied by `engineering_core_workspace_member`.

## UI and AI

`/engineering/delivery-lifecycle` shows the current stage, maturity, disciplines, baseline, blockers, exceptions, open assumptions, open interfaces, active changes, and deliverable count. The lifecycle intelligence page links to it.

`lifecycleAdvisory` states the stage, maturity, baseline, assumptions, interfaces, changes, and blockers, and says the statement does not authorize a transition.

Project-control events emitted by the runtime are stage start, stage complete, gate readiness, design maturity, baseline creation, baseline revision, and engineering blocker. No Primavera or SAP adapter was built.

## Limitations

The delivery lifecycle store is not backfilled. The page reads persisted rows when the migration is present and otherwise shows the unclassified default. Full design-basis field sets, discipline criteria, interface intelligence, and change-impact propagation remain later phases. EOS-A9A lifecycle intelligence remains the earlier profile and is not remapped onto these stages.
