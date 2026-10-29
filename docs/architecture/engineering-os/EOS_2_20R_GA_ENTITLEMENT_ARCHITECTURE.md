# EOS 2.20R GA Entitlement Architecture

`GA_ENTITLEMENT_MODEL_IMPLEMENTED=YES`

`GA_ENTITLEMENT_MODEL_STATUS=READY`

`GA_ENTITLEMENT_EVALUATOR=PASS`

`ENTITLEMENT_PRODUCT_FILTERING=PASS`

`GA_ENTITLEMENT_TEST_MATRIX=PASS`

`LEGACY_ENTITLEMENT_AUTO_ENABLES_EOS_2=NO`

## Model

```
Customer/account
  -> tenant
  -> workspace
  -> product (eos-2)
  -> eos2_ga_entitlements (billing-independent grant)
  -> user membership + role
  -> EOS 2 feature eligibility (evaluator)
  -> rollout mode (controlled_pilot|off)
  -> eos2_workspace_enrollment
```

Payment ≠ authorization. A billing provider may later create/revoke grants; runtime authorization reads `eos2_ga_entitlements` only.

## Schema

Migration: `20261029160000_eos_2_20r_ga_entitlements.sql`

Tables:

- `eos2_ga_entitlements` — unique `(tenant_id, workspace_id, product_key)` with `product_key` constrained to `eos-2`
- `eos2_ga_entitlement_audit` — grant/suspend/revoke/restore audit

Grant sources: `COMMERCIAL_SUBSCRIPTION` | `COMMERCIAL_TRIAL` | `INTERNAL_VALIDATION` | `COMPLIMENTARY`

Statuses: `active` | `suspended` | `revoked` | `expired`

## Evaluator

`apps/web/src/lib/commerce/eos2-ga-entitlement.ts`

Fail-closed checks: product identity, tenant, workspace, status, validity window, suspension/revocation, then separate rollout mode + enrollment.

`readEos2Access` no longer hardcodes `productEntitled: true`. It loads the canonical grant and evaluates commercially before applying mode/enrollment.

## Product filtering

`commercial_entitlement_overrides` matching now requires `product_id` agreement when an override names a product (`ENTITLEMENT_PRODUCT_FILTERING`).

## Admin API

`POST/GET /api/engineering/eos2-ga-entitlement` — owner/admin only; not gated by EOS 2 enrollment (avoids chicken-and-egg). Actions: grant, suspend, revoke, restore.

## Test matrix

Unit suite `eos2-ga-entitlement.test.ts`: valid, wrong product, wrong tenant/workspace, expired, revoked, suspended, missing, legacy engineering-os does not grant EOS 2, entitled-but-not-enrolled, rollout off.
