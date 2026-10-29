# EOS 2.16 Initial Pilot Cohort Plan

## Policy

The first Production cohort is the existing EOS 1 controlled pilot workspace. It is not enrolled in this plan.

| Item | Value |
| --- | --- |
| Tenant | `eos-controlled-pilot` |
| Workspace | `Default Workspace` |
| Workspace ID | `5c85d773-3b79-43b2-b138-c6251f566768` |

EOS 2 enrollment occurs only during EOS 2.17 execution after pre-enablement Production security and smoke tests pass. The workspace keeps its existing `engineering-os` allow override. That override does not enroll EOS 2.

Do not enroll public users, unrelated workspaces, or all current `engineering-os` installations. Production currently has 396 active installations of that product. They are not the EOS 2 cohort.

Do not copy `EOS-QA-001`, the synthetic staging workspaces, or browser-validation data.

`LEGACY_PROJECT_AUTO_MIGRATION=NO`. An existing EOS 1.0 project stays an EOS 1.0 project. Later choices are: leave it unchanged, enroll it by an explicit human action, run a separate controlled migration, or create a new EOS 2.0 project. Do not invent lifecycle, baseline, or interface rows for old projects. Absence of an EOS 2.1 lifecycle row means `not_classified`.

`PRODUCTION_BUSINESS_DATA_MIGRATION_REQUIRED=NO`.

## Modules allowed for the first cohort

Lifecycle, Engineering Basis, the eight delivery homes, interface, change impact, design freeze, and deliverables, inside the EOS 2.15R bounds. Engineering AI may explain and may not approve. D1 remains its existing bounded calculation. External solvers stay unqualified.

## Enforcement

The cohort is now enforceable. An active `engineering-os` entitlement does not grant EOS 2. Production tenants stay off until a human release authority sets `tenants.settings.eos2.mode` to `controlled_pilot` and enrolls the named workspace in `eos2_workspace_enrollment`. Owner or admin may call the enrollment API. An engineer, a pilot engineer, and AI may not. Setting the mode to `off`, or setting server `EOS_2_ROLLOUT=off`, denies EOS 2 without suspending EOS 1.0 and without deleting data.

The staging qualification cohort is `eos-qa-a` only. It is not a Production enrollment. The other staging workspaces in the same tenant stayed denied.

## Communication

Do not send a pilot notice in this phase. Before EOS 2.17 enablement, tell the named cohort: what is available, what calculations and solvers are excluded, that AI does not approve, how to report an issue, and that rollback returns the application to `dpl_7EBZUxhkVX7MjR44rYCgkg8odHgB`.

## Expansion

A later workspace requires a new human GO. Expansion is not automatic after the first smoke test.

## Rollback conditions

Any rollback trigger in the rollback runbook closes the cohort. The support path is the human release authority. Evidence is build identity, the route, the timestamp, and the audit row.
