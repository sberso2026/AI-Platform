# EOS 2.21 General Availability Controlled Activation

## Decision

`PHASE=EOS-2.21-GENERAL-AVAILABILITY-CONTROLLED-ACTIVATION`

`VERDICT=PASS_WITH_LIMITATIONS`

`GA_ACTIVATION_PERFORMED=YES`

`EOS_2_0_RELEASE_STATUS=GENERAL_AVAILABILITY`

`EOS_2_0_GA_ACTIVATION_STATUS=ACTIVE_CONTROLLED_GA`

`EOS_2_PRODUCT_RELEASE_STATE=GENERAL_AVAILABILITY`

`EOS_2_PRODUCTION_ROLLOUT_MODE=GENERAL_AVAILABILITY`

`GA_ACCESS_MODEL=EXPLICIT_ENTITLEMENT_AND_ENROLLMENT`

`READY_FOR_NEXT_PHASE=YES`

`NEXT_PHASE=EOS-2.22-GA-POST-ACTIVATION-ASSURANCE-AND-EOS-2-CLOSEOUT`

## Authorization

`FINAL_GA_GO_NO_GO=GO`

`GA_AUTHORIZATION_FINGERPRINT_VERIFIED=YES` (`bf582829bfa7169d912c6ae73a2bd9a148dab3e9fa13f12702784e0cc4c183c2`)

`GA_AUTHORIZATION_STILL_VALID=YES` at pre-activation check (runtime `72d668d2…`, deploy `dpl_DL6rmuFs…`, ledger `160`, mode `controlled_pilot`, enrolled `2`)

`HUMAN_GA_RELEASE_AUTHORITY_VERIFIED=YES` — Silvestre Berso

`AI_GA_RELEASE_AUTHORITY=NO`

## Pre-activation baseline

`PRE_GA_ACTIVATION_PRODUCTION_BASELINE_MATCH=YES`

`PRODUCTION_PROJECT_VERIFIED=YES` (`wcydlhqiqdwgoaqrlget`)

## Activation actions

1. Additive migration `20261029170000` — `eos2_18r_set_rollout_mode` accepts `general_availability` and stamps GA metadata / external hold.
2. Application runtime updated to treat `general_availability` as an active product rollout mode while still requiring entitlement + enrollment.
3. External commercial grant hold enforced in entitlement admin API.
4. Production tenant `eos-controlled-pilot` transitioned `controlled_pilot` → `general_availability`.
5. Kill-switch cycle `general_availability` → `off` → `general_availability` (PASS).
6. Enrolled workspace count remained `2`; no cohort expansion; no legacy auto-enable.

## Post-activation Production state

| Item | Value |
| --- | --- |
| Mode | `general_availability` |
| Product release state | `GENERAL_AVAILABILITY` |
| Access model | `EXPLICIT_ENTITLEMENT_AND_ENROLLMENT` |
| External customer hold | `true` |
| GA version | `2.0.0` |
| Enrolled workspaces | `2` |
| Active `eos-2` grants | `2` |
| Migration ledger | `161` |

## Qualification preserved

`EOS_2_0_QUALIFICATION_STATUS=QUALIFIED_BOUNDED`

`ENGINEERING_FORMULAS_CHANGED=NO`

`ENGINEERING_RESULT_SEMANTICS_CHANGED=NO`

`QUALIFIED_D1_BASELINE_INVALIDATED=NO`

## Explicit non-effects

- No automatic EOS 2 grant to legacy Engineering OS installations
- No enrollment of the 396 existing installations
- No automatic EOS 1 project migration
- No external commercial customer onboarding
- External-customer legal-review hold retained and enforced
- Kill switch and rollback retained

## Limitations

See release notes and external customer hold record. Commercial external onboarding remains held.
