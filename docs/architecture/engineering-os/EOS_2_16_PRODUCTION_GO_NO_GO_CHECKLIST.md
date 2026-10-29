# EOS 2.16 Production GO / NO-GO Checklist

Current result: **NO-GO**. EOS 2.17 must not start from this checklist.

AI may recommend. AI must not mark GO, deploy, migrate, or roll back.

| Check | This phase | Required for GO |
| --- | --- | --- |
| Qualified runtime provenance reconciled | YES | YES |
| Promotion candidate is `af6612bdebe40616dab18525ceab4dc70f03621e` or a later commit proven runtime-equivalent | YES | Exact candidate named |
| Migration manifest approved by the human release authority | Prepared, not approved | Human signature |
| Migration rehearsal PASS | YES | YES |
| Destructive unapproved migration count 0 | YES | YES |
| Database recovery plan ready | YES | A new backup verified after GO and before migration |
| Application rollback target verified | YES | YES |
| Post-migration EOS 1.0 rollback compatible | YES | YES |
| EOS 2-only cohort control, default off | NO | Must exist and be requalified |
| Initial cohort defined and not auto-enrolled | Defined | Human names the workspace at GO |
| Production smoke plan ready | YES | Executed only in EOS 2.17 |
| Monitoring plan ready | YES | Baseline captured before change |
| Security gate PASS | YES | Re-run if runtime changes |
| Release gate PASS | YES, 220 tests | Re-run if runtime changes |
| Unresolved Critical or High readiness defect | RD-001 High open | None open |
| Human release authority identified | Model recorded | Named human signs |

## Human authority model

Production identity must be `wcydlhqiqdwgoaqrlget`, enforced by `assertProductionIdentity`. A generic workspace owner, admin, pilot engineer, or AI is not sufficient. The named human is recorded on the EOS 2.17 execution record. This phase does not invent that person's name.

## Change window

`CHANGE_WINDOW_REQUIRED=POLICY_DEPENDENT`. The delta does not rewrite existing tables. Rehearsal duration was 6372 ms on an empty isolated database and is not a Production estimate. The human authority decides whether a window is required. The deploy exposure in RD-001 is independent of that window.

## EOS 2.17 stop rule

Fail closed if the deployed commit is not the approved candidate, if the database ref is not `wcydlhqiqdwgoaqrlget`, or if RD-001 is still open.
