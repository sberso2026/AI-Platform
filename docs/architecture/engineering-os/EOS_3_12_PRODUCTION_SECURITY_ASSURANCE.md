# EOS 3.12 Production Security Assurance

`EOS_3_PRODUCTION_PILOT_SECURITY_ASSURANCE=PASS`

## Production isolation

| Check | Result |
|-------|--------|
| Enabled PILOT enrollments | 1 |
| Unapproved eos-3 entitlements | 0 |
| Cross-workspace object leak (foreign ws × smoke project) | 0 |
| Total Production eos3_objects outside pilot ws | 0 |
| EOS 2 auto-migration jobs | 0 |

`EOS_3_PRODUCTION_CROSS_WORKSPACE_LEAK_COUNT=0`

`EOS_3_PRODUCTION_RLS_ASSURANCE=PASS` — RLS remains enabled on EOS 3 tables from applied migrations; no post-activation RLS drift in runtime delta; foreign workspace probe = 0.

## Entitlement / enrollment

`EOS_3_PRODUCTION_ENTITLEMENT_ASSURANCE=PASS`

`EOS_3_PRODUCTION_ENROLLMENT_ASSURANCE=PASS`

Evaluator matrix (regression + Production binding):

| Caller | Result |
|--------|--------|
| PILOT + entitled + Production | ALLOW (`active_controlled_pilot`) |
| DEVELOPMENT + entitled + Production | DENY (`production_denied`) |
| Missing entitlement | DENY |
| Kill switch (`emergencyOff`) | DENY (`kill_switch`) |
| EOS 2 product key | DENY (`wrong_product`) |
| EOS 2 entitlement auto-enables EOS 3 | NO |

## AI / human authority

`EOS_3_PRODUCTION_AI_AUTHORITY_ASSURANCE=PASS`

`EOS_3_PRODUCTION_HUMAN_AUTHORITY_ASSURANCE=PASS`

`EOS_3_AI_ENGINEERING_AUTHORITY=NO`

Denied AI authorities remain false in policy modules: final decision, deliverable approval, release, IFC, migration, solver qualification. Human GO scope remains software-release-only.

## Disabled capabilities

| Control | Status | Enforcement |
|---------|--------|-------------|
| Live LLM | `DISABLED_NOT_VALIDATED` | PASS — zero AI plans; auth controls exclude live LLM |
| Real connectors | `DISABLED` | PASS — zero connectors; claim matrix NOT_SUPPORTED |
| SPACE GASS global | NO | preserved |
| External solver global | NO | preserved |
| D1 | `QUALIFIED_BOUNDED` | claim assurance PASS |
| Non-D1 | `NOT_QUALIFIED` | claim assurance PASS |

`EOS_3_D001_PRODUCTION_REASSESSMENT=PASS` → status `OPEN_ACCEPTED`  
`EOS_3_D002_PRODUCTION_REASSESSMENT=PASS` → status `OPEN_ACCEPTED`

## Migration guard

`EOS_3_PRODUCTION_MIGRATION_GUARD=PASS`

`EOS_3_PRODUCTION_MIGRATION_COUNT=0`

`productionMigrationGuard(true)` remains deny; Production `eos3_migration_jobs` count = 0.

## Kill switch

`EOS_3_PILOT_KILL_SWITCH_ASSURANCE=PASS` — `emergencyOff` fails closed for EOS 3 without mutating EOS 2 GA path.

## Secrets / audit / compliance claims

Secret scan and dependency audit executed via canonical gates.  
`FORMAL_SOC2_CERTIFIED=NO` / `ISO27001=NO` / `EU_AI_ACT=NO` — claim assurance PASS (no over-claim).  
`EOS_3_EXTERNAL_CUSTOMER_PILOT_HOLD=ACTIVE`.
