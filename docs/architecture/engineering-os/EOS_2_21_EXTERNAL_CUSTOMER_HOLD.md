# EOS 2.21 External Customer Hold

`EXTERNAL_CUSTOMER_ONBOARDING_AUTHORIZED=NO`

`EXTERNAL_CUSTOMER_LEGAL_REVIEW_REQUIRED=YES`

`EXTERNAL_CUSTOMER_ONBOARDING_HOLD_ENFORCED=YES`

`PUBLIC_SELF_SERVICE_SIGNUP_ENABLED=NO`

`EXTERNAL_CUSTOMER_ONBOARDING_ENABLED=NO`

`EXTERNAL_CUSTOMER_HOLD_CLEARANCE_PROCESS_DEFINED=YES`

## Enforcement (not documentation-only)

Server module: `apps/web/src/lib/commerce/eos2-external-customer-hold.ts`

- Hold state is hard-enforced (`true`); env cannot clear it without an authorized process change.
- `POST /api/engineering/eos2-ga-entitlement` **rejects** `COMMERCIAL_SUBSCRIPTION` and `COMMERCIAL_TRIAL` grants while held (`eos2_external_customer_hold`).
- Internal grants (`INTERNAL_VALIDATION`, `COMPLIMENTARY`) remain permitted for internal validation.
- Tenant settings stamp `eos2.external_customer_onboarding_hold=true` on GA mode activation.
- No EOS 2 public self-service GA signup path is enabled.

## Clearance process (future)

Hold clearance requires **all** of:

1. Applicable RTB legal review of customer terms / privacy / related policy package
2. Customer policy package approval
3. Explicit authorized release decision removing the hold

File edits alone must not clear the hold.

## Compatibility

Technical GA activation (`GENERAL_AVAILABILITY` product/rollout state) is compatible with this hold. Internal GA validation may continue.
