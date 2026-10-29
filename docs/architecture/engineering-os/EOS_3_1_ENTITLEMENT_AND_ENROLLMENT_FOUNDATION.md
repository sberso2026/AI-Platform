# EOS 3.1 Entitlement and Enrollment Foundation

`EOS_3_ENTITLEMENT_FOUNDATION_IMPLEMENTED=YES`

`EOS_3_ENTITLEMENT_PRODUCT_FILTERING=PASS`

`EOS_3_DEVELOPMENT_ENROLLMENT_FOUNDATION_IMPLEMENTED=YES`

`EOS_3_ACCESS_DEFAULT=DENY`

`EOS_2_ENTITLEMENT_AUTO_ENABLES_EOS_3=NO`

`EOS_2_ENROLLMENT_AUTO_ENABLES_EOS_3=NO`

`EOS_3_PRODUCTION_ENABLED_WORKSPACE_COUNT=0`

`EOS_3_PRODUCTION_ACCESS=DENIED`

## Architecture inheritance (not grant inheritance)

`EOS_3_ENTITLEMENT_ARCHITECTURE=INHERIT_EOS_2_GA` means reuse of:

- canonical product entitlement model;
- workspace-scoped authorization;
- product filtering;
- suspension/revocation;
- fail-closed evaluation;
- audit.

It does **not** mean an EOS 2 grant enables EOS 3.

## Product filter

- EOS 2 tables/grants: `product_key = 'eos-2'`
- EOS 3 tables/grants: `product_key = 'eos-3'`
- Evaluator rejects wrong product, wrong tenant/workspace, suspended/revoked/expired, missing grant, missing enrollment.

## Development enrollment states

| State | Meaning |
| --- | --- |
| `NOT_ELIGIBLE` | Default deny |
| `DEVELOPMENT` | Dev-eligible when grant active |
| `STAGING` | Staging-eligible when grant active |
| `PILOT` | Bounded pilot-eligible when grant active |

No GA enrollment states in EOS 3.1. No commercial EOS 3 access.

## Production policy

Application policy denies EOS 3 access when `productionEnvironment=true`, regardless of grant/enrollment. No Production workspace is EOS 3 enabled in this phase.

## Schema

Additive migration `20261029180000_eos_3_1_foundation.sql`:

- `eos3_dev_entitlements` (+ RLS)
- `eos3_dev_enrollment` (+ RLS)
- `eos3_foundation_audit` (+ RLS)
