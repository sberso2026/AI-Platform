# EOS 3.2 Staging Validation Evidence

`EOS_3_STAGING_CANONICAL_OBJECT_WORKFLOW=PASS`

`EOS_3_STAGING_DIGITAL_THREAD_TRACE=PASS`

`EOS_3_REVISION_CHANGE_TRACE=PASS`

`EOS_3_STAGING_BASELINE_IMMUTABILITY=PASS`

`EOS_3_DECISION_TRACEABILITY=PASS`

`EOS_3_CALCULATION_QUALIFICATION_SEPARATION=PASS`

`EOS_3_OBJECT_QUERY_PERFORMANCE_BASELINE_CAPTURED=YES`

`EOS_3_OBJECT_RLS=PASS`

`EOS_3_STAGING_CROSS_WORKSPACE_LEAK_COUNT=0`

## Target

Review staging only: `rntonzigxwxcjlcsadip`

Production (`wcydlhqiqdwgoaqrlget`): migration ledger `161`; `eos3_objects` **absent**; no EOS 3.2 apply; EOS 2 grants `2` / enrolled `2`.

## In-process synthetic workflow

Module: `apps/web/src/lib/engineering/eos3-staging-workflow.ts`

| Metric | Value |
| --- | --- |
| `EOS_3_STAGING_OBJECT_COUNT` | `20` |
| `EOS_3_STAGING_RELATIONSHIP_COUNT` | `25` |
| Calculation D1 metadata | `QUALIFIED_BOUNDED` |
| Non-D1 metadata | `IMPLEMENTED` (not qualified) |
| External solver metadata | `IMPLEMENTED` (not qualified) |
| Deliverable after revision advance | `STALE` / impact-candidate awareness (not rewritten) |
| Baseline membership | Frozen to revision `A`; rewrite denied |

## Staging DB persistence

Migration `20261029200000_eos_3_2_canonical_objects` applied to review staging.

Seed project `eos3-staging-digital-thread-001`:

| Metric | Value |
| --- | --- |
| Objects | `18` |
| Relationships | `19` |
| Revisions | `1` |
| Baseline members | `1` |
| RLS enabled | YES (objects, revisions, relationships, baseline_members, audit) |

## Production writes

`EOS_3_PRODUCTION_DATA_WRITE_COUNT=0`
