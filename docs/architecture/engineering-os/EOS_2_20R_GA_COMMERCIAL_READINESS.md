# EOS 2.20R GA Commercial Readiness

`GA_COMMERCIAL_PRODUCT_MODEL_DEFINED=YES`

`GA_CUSTOMER_POLICY_PACKAGE_STATUS=READY_WITH_LIMITATIONS`

`GA_COMMERCIAL_READINESS=READY_WITH_LIMITATIONS`

Pricing is not invented. No payment-provider dependency for authorization.

## Product structure

| Element | Definition |
| --- | --- |
| Product identity | `eos-2` (canonical GA entitlement product_key); Engineering OS remains the host product surface |
| Plan/tier | Externally configurable; maps into grant_source + metadata, not hardcoded prices |
| Entitlement mapping | `eos2_ga_entitlements` row per tenant+workspace+eos-2 |
| Trial policy | `COMMERCIAL_TRIAL` grant_source with optional `valid_until` |
| Subscription/licence lifecycle | grant → active → suspend/revoke/expire → restore/re-grant |
| Suspension / cancellation / renewal | Admin API + audit; renewal = new/extended validity under authority |
| Support model | Pilot/GA support via designated Production release authority and incident runbook; no fabricated 24/7 SLA |
| Qualification disclaimer | QUALIFIED_BOUNDED D1 only; IMPLEMENTED ≠ VALIDATED ≠ QUALIFIED |
| Supported scope | `EOS_2_20_GA_SCOPE_AND_LIMITATIONS.md` |
| Onboarding responsibility | Customer admin + RTB operator for first grants until self-serve packaging matures |
| Commercial account ownership | Tenant owner/admin |

## Customer policy package

Required artifacts for launch packaging (draft/product requirements; **no claimed legal review**):

- Terms of service (platform)
- Privacy notice
- Acceptable use
- Support terms
- Engineering-use / non-certification disclaimers

Status `READY_WITH_LIMITATIONS`: structure identified and disclaimers present in GA docs; formal legal counsel sign-off not claimed.

## Recovery risk acceptance

`GA_RECOVERY_RISK_ACCEPTANCE_DOCUMENTED=YES`

`PITR_GA_DISPOSITION=RECOMMENDED_FOR_GA`

Logical backup + deployment rollback accepted for current GA readiness remediation launch posture; PITR remains recommended, not silently purchased.

## Proposed service objectives (non-contractual)

`PROPOSED_GA_SERVICE_OBJECTIVES_DOCUMENTED=YES`

Suggested initial objectives for later formal adoption (not SLA):

- Authenticated engineering page P95 settle < 5 s under nominal load
- Entitlement/enrollment denial path < 1 s
- Zero cross-workspace leaks
- Kill switch effective within one configuration propagate interval
