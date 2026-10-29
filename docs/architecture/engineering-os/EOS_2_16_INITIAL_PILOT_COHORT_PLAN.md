# EOS 2.16 Initial Pilot Cohort Plan

## Policy

The first Production cohort is one workspace named by the human release authority at GO. It is not chosen by this document, because no person or workspace is appointed here.

Do not enroll public users, unrelated workspaces, or all current `engineering-os` installations. Production currently has 396 active installations of that product. They are not the EOS 2 cohort.

Do not copy `EOS-QA-001`, the synthetic staging workspaces, or browser-validation data.

`LEGACY_PROJECT_AUTO_MIGRATION=NO`. An existing EOS 1.0 project stays an EOS 1.0 project. Later choices are: leave it unchanged, enroll it by an explicit human action, run a separate controlled migration, or create a new EOS 2.0 project. Do not invent lifecycle, baseline, or interface rows for old projects. Absence of an EOS 2.1 lifecycle row means `not_classified`.

`PRODUCTION_BUSINESS_DATA_MIGRATION_REQUIRED=NO`.

## Modules allowed for the first cohort

Lifecycle, Engineering Basis, the eight delivery homes, interface, change impact, design freeze, and deliverables, inside the EOS 2.15R bounds. Engineering AI may explain and may not approve. D1 remains its existing bounded calculation. External solvers stay unqualified.

## Enforcement gap

This cohort cannot be enforced by the current build. The engineering layout checks product `engineering-os` only. `EOS_CONTROLLED_PILOT_ENABLED` and the `feature_flags` table do not gate the EOS 2 routes. Suspending `engineering-os` would suspend EOS 1.0 as well. Until a requalified control can disable EOS 2 without disabling EOS 1.0, the cohort stays unopened.

## Communication

Do not send a pilot notice in this phase. Before EOS 2.17 enablement, tell the named cohort: what is available, what calculations and solvers are excluded, that AI does not approve, how to report an issue, and that rollback returns the application to `dpl_7EBZUxhkVX7MjR44rYCgkg8odHgB`.

## Expansion

A later workspace requires a new human GO. Expansion is not automatic after the first smoke test.

## Rollback conditions

Any rollback trigger in the rollback runbook closes the cohort. The support path is the human release authority. Evidence is build identity, the route, the timestamp, and the audit row.
