# EOS-A5E Certification Plan (revised)

Scope revision: **generic External Tool Governance** is the certification object.
Licensed SPACE GASS (and any other external engineering executable) is a **deferred external dependency**, not a governance-framework failure.

| Field | Value |
| --- | --- |
| Amendment baseline | `a360fa40baf6a1db3901e1a3d04e91edf0ef8569` |
| Expected verdict | `PASS_WITH_LIMITATIONS` |
| External software installation | DEFERRED |
| Structural optimization | NOT IN SCOPE |
| Production | NO |

## In scope

1. Generic External Tool Governance (categories, modes, platform vs workspace, secrets-as-references)
2. SPACE GASS catalog/profile overlay remaining honestly NOT_CONFIGURED
3. Fail-closed Optimization execution against non-READY / non-certified profiles
4. Settings UI at `/engineering/settings/external-tools` (source + route; authenticated AAL2 walkthrough is a separate blocker)
5. RLS / authorization for platform profiles vs workspace assignments
6. Registry reuse (Platform Intelligence tools, EMI adapter identity, Secret Manager refs, Execution Host, JobService)
7. Generic test adapter restricted to tests/dev

## Out of scope / deferred

- Installing or configuring licensed SPACE GASS or any other external engineering software
- Fabricating executable path, version, licence, automation permission, adapter compatibility, READY, or solver execution
- Real SPACE GASS / JobService solver execution
- Result extraction, live unit conversion, numerical solver comparison
- EOS-A6 Structural Optimization
- Weakening RLS, entitlement, tenant, workspace, AAL2, or execution safety

## SPACE GASS overlay (required truth)

| Field | Required value |
| --- | --- |
| version | UNKNOWN |
| executable | NOT_CONFIGURED |
| licence | UNAVAILABLE |
| automation | REQUIRES_CONFIRMATION |
| adapter compatibility | NOT_CONFIGURED |
| readiness | NOT_CONFIGURED |

## Fail-closed cases that must PASS

- Non-stub solver execution blocked without a READY certified profile
- NOT_CONFIGURED profiles cannot execute
- UNAVAILABLE licence blocks execution
- REQUIRES_CONFIRMATION automation blocks execution
- NOT_CONFIGURED adapter compatibility blocks execution
- Connected ≠ certified; available ≠ certified
- Workspace assignment cannot override platform readiness

## Required report fields

```
EXTERNAL_SOFTWARE_INSTALLATION: DEFERRED
SPACE_GASS_INSTALLATION: NOT_AVAILABLE_AT_THIS_STAGE
REAL_SOLVER_EXECUTION: NOT_CERTIFIED
READY_FOR_CONTROLLED_PILOT: NO, unless AAL2 and other pilot blockers are also resolved
READY_FOR_PRODUCTION: NO
```

## Execution record (this revision)

| Check | Result |
| --- | --- |
| Engineering OS typecheck | PASS |
| Engineering OS unit | PASS 432/432 |
| Fail-closed / overlay / reuse unit | PASS 18/18 |
| Live JWT RLS (external tools) | PASS |
| Verdict | PASS_WITH_LIMITATIONS |
