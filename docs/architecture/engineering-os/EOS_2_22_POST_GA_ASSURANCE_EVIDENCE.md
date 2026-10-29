# EOS 2.22 Post-GA Assurance Evidence

`EOS_2_21_GA_BASELINE_VERIFIED=YES`

`POST_ACTIVATION_GA_STATE_VERIFIED=YES`

`POST_GA_ENTITLEMENT_ASSURANCE=PASS`

`GA_ENTITLEMENT_FAIL_CLOSED=PASS`

`POST_GA_MULTI_WORKSPACE_OPERATIONAL_ASSURANCE=PASS`

`POST_GA_RLS_ASSURANCE=PASS`

`CROSS_WORKSPACE_PRODUCTION_LEAK_COUNT=0`

`AI_CROSS_WORKSPACE_LEAK_COUNT=0`

`POST_GA_AUTHORITY_ASSURANCE=PASS`

`AI_AUTHORITY_BOUNDARY=PASS`

`EOS_1_COEXISTENCE_REGRESSION=PASS`

`POST_GA_RELIABILITY_ASSURANCE=PASS`

`POST_GA_ASSURANCE_OPERATION_COUNT=24`

`POST_GA_ASSURANCE_FAILURE_COUNT=0`

`POST_GA_PERFORMANCE_REGRESSION=PASS`

`FORMAL_GA_SLO_DEFINED=NO`

`GA_PERFORMANCE_STATUS=READY_WITH_LIMITATIONS`

`POST_GA_OBSERVABILITY_ASSURANCE=PASS`

`POST_GA_SUPPORTABILITY_ASSURANCE=PASS`

`CURRENT_PRODUCTION_SCHEMA_RECOVERABILITY=PASS`

`GA_RECOVERY_POSTURE_PRESERVED=YES`

`PITR_GA_DISPOSITION=RECOMMENDED_FOR_GA`

`GA_KILL_SWITCH_OPERATIONAL=YES`

`GA_KILL_SWITCH_RETEST_REQUIRED=NO` — EOS 2.21 Production cycle `general_availability`→`off`→`general_availability` remains current; mode still `general_availability`; enrollment/grants preserved.

`GA_APPLICATION_ROLLBACK_READY=YES`

`GA_APPLICATION_ROLLBACK_DEPLOYMENT_ID=dpl_DL6rmuFs2iX2hKKwS83XNhVtmCpF` (authorized pre-activation Ready deployment retained; prior Ready deployments also available)

## Live Production verified

| Item | Value |
| --- | --- |
| Deployment | `dpl_Hyixcc94d7sbfJbWwR1sBWozmmxF` Ready |
| Runtime | `051a341092f9a37fd6270c5bb1702b08169f6db0` dirty=false |
| Ledger | `161` |
| Mode | `general_availability` |
| Product release state | `GENERAL_AVAILABILITY` |
| Access model | `EXPLICIT_ENTITLEMENT_AND_ENROLLMENT` |
| GA version | `2.0.0` |
| External hold | `true` |
| Enrolled | `2` |
| Unapproved enrolled | `0` |
| Active eos-2 grants | `2` |

## Assurance pack (bounded)

1. Auth fingerprint verify
2. Build-identity / deploy inspect
3. Production mode/state SQL
4–11. Entitlement unit matrix (allow enrolled GA; deny not enrolled, legacy, wrong product/workspace, revoked, suspended, unauthenticated, rollout off)
12. External customer hold enforcement unit
13–18. Multi-workspace project/basis/interface/change/deliverable/baseline cross-id leak probes (all 0)
19. Enrollment/grant operational presence on A and B
20. Authority/AI hold unit + docs consistency
21–24. Canonical gate orchestration suites (release-governance, eos2-web, persistence, engineering-review; remaining suites in full gate)

This pack does **not** claim long-term reliability.
