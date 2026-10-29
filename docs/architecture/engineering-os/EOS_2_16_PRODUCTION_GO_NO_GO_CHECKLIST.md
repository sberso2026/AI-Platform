# EOS 2.16 Production GO / NO-GO Checklist

Current result: **READY FOR HUMAN GO**. RD-001 is resolved. EOS 2.17 may start only when a named human release authority signs. This checklist does not itself authorize deployment.

AI may recommend. AI must not mark GO, deploy, migrate, or roll back.

| Check | This phase | Required for GO |
| --- | --- | --- |
| Qualified runtime provenance reconciled | YES | YES |
| Promotion candidate is `bd9654fc35ce9bdcc8fc3a42570ae2cd92311c01` | YES | Exact candidate named |
| Migration manifest approved by the human release authority | Prepared, not approved | Human signature |
| Migration rehearsal PASS | YES | YES |
| Destructive unapproved migration count 0 | YES | YES |
| Database recovery plan ready | YES | A new backup verified after GO and before migration |
| Application rollback target verified | YES | YES |
| Post-migration EOS 1.0 rollback compatible | YES | YES |
| EOS 2-only cohort control, default off | YES | Requalified on `dpl_GgVBzbU9N2ZnR5fR41fWwdnYDhbC` |
| Initial cohort defined and not auto-enrolled | Defined | Human names the workspace at GO |
| Production smoke plan ready | YES | Executed only in EOS 2.17 |
| Monitoring plan ready | YES | Baseline captured before change |
| Security gate PASS | YES, rerun after the rollout runtime | YES |
| Release gate PASS | YES, 220 tests, rerun after the rollout runtime | YES |
| Unresolved Critical or High readiness defect | RD-001 resolved | None open |
| Human release authority identified | Model recorded | Named human signs |

## Human authority model

Production identity must be `wcydlhqiqdwgoaqrlget`, enforced by `assertProductionIdentity`. A generic workspace owner, admin, pilot engineer, or AI is not sufficient. The named human is recorded on the EOS 2.17 execution record. This phase does not invent that person's name.

## Change window

`CHANGE_WINDOW_REQUIRED=POLICY_DEPENDENT`. The delta does not rewrite existing tables. The earlier thirteen-file rehearsal duration was 6372 ms on an empty isolated database and is not a Production estimate. The human authority decides whether a window is required. The default Production EOS 2 mode is off.

## EOS 2.17 stop rule

Fail closed if the deployed commit is not `bd9654fc35ce9bdcc8fc3a42570ae2cd92311c01`, if the database ref is not `wcydlhqiqdwgoaqrlget`, or if EOS 2 is enabled for any workspace before the named human enrollment.
