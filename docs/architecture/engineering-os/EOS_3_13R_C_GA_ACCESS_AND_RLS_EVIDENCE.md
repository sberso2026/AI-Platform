# EOS 3.13R-C GA Access and RLS Evidence

## Access matrix

| Actor / condition | Expected | Result |
|-------------------|----------|--------|
| Authorized enrolled workspace (PILOT + eos-3 entitlement + GO) | ALLOW | PASS (`active_controlled_ga`) |
| EOS 2-only workspace (no eos-3 grant) | DENY | PASS (`missing`) |
| EOS 3 entitled, unenrolled (`NOT_ELIGIBLE`) | DENY | PASS |
| EOS 3 entitled, DEVELOPMENT in Production | DENY | PASS (`production_denied`) |
| Foreign workspace (grant mismatch) | DENY | PASS (`wrong_workspace`) |
| External customer / eos-2 product request | DENY | PASS |
| Anonymous / unauthenticated | DENY | PASS (`unauthenticated`) |
| Kill switch (`emergencyOff`) | DENY | PASS (`kill_switch`) |

Deterministic suite: `apps/web/src/__tests__/eos3-ga-access-matrix.test.ts` — PASS.

`EOS_3_GA_ACCESS_MATRIX=PASS`

## Production enrollment posture

| Metric | Value |
|--------|-------|
| Active eos-3 entitlements | 1 |
| PILOT enrollments | 1 |
| Unapproved PILOT workspaces | 0 |
| Automatic expansion | NO |
| Public signup | NO |

Authorized workspace: `5c85d773-3b79-43b2-b138-c6251f566768`  
Tenant: `4f7da5fe-4ffb-453d-9d63-b74ff36aba2a`

## RLS / isolation

| Check | Result |
|-------|--------|
| Cross-workspace stable_object_id overlap | 0 |
| Migration jobs | 0 |
| Migrated project targets | 0 |
| EOS 2 project auto-migration | 0 |

`EOS_3_GA_RLS=PASS`  
`EOS_3_GA_CROSS_WORKSPACE_LEAK_COUNT=0`

## Kill switch

`evaluateEos3Access({ emergencyOff: true })` → `kill_switch` DENY. EOS 2 product path remains distinct (`eos-2` never enables eos-3).

`EOS_3_GA_KILL_SWITCH_OPERATIONAL=PASS`  
`EOS_3_GA_KILL_SWITCH_EOS_2_ISOLATION=PASS`
