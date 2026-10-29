# EOS 2.17 Post-Deployment Continuation Evidence

## Decision

`VERDICT=BLOCKED`

`PRODUCTION_PROMOTION_STATUS=DEPLOYED_COHORT_DISABLED`

`EOS_2_PRODUCTION_CONTROLLED_PILOT_ENABLED=NO`

`MIGRATION_REEXECUTION_ATTEMPTED=NO`

The continuation verified the promoted Production state and stopped before enrollment. Authenticated pilot smoke was not run, so EOS 2 was not enabled.

## Verified state

| Item | Value |
| --- | --- |
| Live commit | `bd9654fc35ce9bdcc8fc3a42570ae2cd92311c01` |
| Live deployment | `dpl_9UhYQdVBkiBA6mAd4ajBHRFndhYZ` |
| Supabase | `wcydlhqiqdwgoaqrlget` |
| Ledger | 158, maximum `20261029120000` |
| Manifest versions present | 14 |
| Duplicate manifest versions | 0 |
| Enrollment rows | 0 |
| Tenants in `controlled_pilot` | 0 |
| Approved workspace | `5c85d773-3b79-43b2-b138-c6251f566768`, active |
| Active pilot-engineer memberships | 1 |
| Engineering projects on that workspace | 1 |
| Rollback deployment | `dpl_7EBZUxhkVX7MjR44rYCgkg8odHgB`, Ready |
| Post-GO backup | `7ec6a70389874eeb14bc7972000a8972df1e8506e863997b8c1e510f4bf5f6b0` |

No migration was applied again. The application was not redeployed.

## Login

`https://eos-pilot.rtbea.com.au/login` presents the normal email and password sign-in form. This session does not have the Production pilot account password. Certification fixture passwords are for staging fixture users and were not used. Authentication was not bypassed with an admin session, a generated link, or a service-role impersonation.

`PRODUCTION_EOS_1_AUTHENTICATED_SMOKE_TEST=NOT_RUN`

`PRODUCTION_PRE_ENABLEMENT_SECURITY_GATE=NOT_RUN`

## Not changed

Controlled-pilot mode was not set. The approved workspace was not enrolled. No other installation was changed. The existing engineering project count remains 1.

## Release suite

Release governance was executed again: 220 passed. Secret scan was 624 files and 0 findings. `pnpm audit --prod` reported one moderate advisory, `GHSA-w5hq-g745-h8pq`. No new blocking vulnerability was reported. These checks do not replace the authenticated Production gate.
