# EOS 3 External Customer Legal and Commercial Requirements

`EOS_3_EXTERNAL_CUSTOMER_CONTRACT_PACKAGE_DEFINED=YES`  
`EOS_3_EXTERNAL_CUSTOMER_LEGAL_REVIEW_REQUIRED=YES`  
`EOS_3_EXTERNAL_CUSTOMER_LEGAL_REVIEW_STATUS=NOT_STARTED`  
`EOS_3_EXTERNAL_CUSTOMER_COMMERCIAL_MODEL_DEFINED=YES`  
`EOS_3_EXTERNAL_CUSTOMER_PRICING_STATUS=NOT_FINALIZED`  
`EOS_3_EXTERNAL_CUSTOMER_BILLING_OPERATIONS_DEFINED=YES`  
`EOS_3_EXTERNAL_CUSTOMER_INSURANCE_REVIEW_REQUIRED=YES`  
`EOS_3_EXTERNAL_CUSTOMER_INSURANCE_REVIEW_STATUS=NOT_STARTED`

## Contract package (required elements — legal text TBD)

Identify need for (as applicable): software subscription/service agreement; terms of use; privacy terms; data processing terms; confidentiality; acceptable use; support terms; limitation of liability; warranty/disclaimer; IP ownership/licensing; customer data ownership; termination/offboarding; security incident obligations; recovery/PITR limitation acknowledgement; qualification/engineering-authority disclaimer.

**Actual legal text requires appropriate legal review.** This document does not draft jurisdiction-specific legal conclusions.

## Legal review status

`NOT_STARTED` — blocks final external release authorization (not technical readiness assessment).

## Commercial model (bounded)

| Element | Definition |
|---------|------------|
| Product scope | EOS 3.0.0 controlled GA claims only |
| Customer class | `DESIGN_PARTNER` (initial) |
| Licensing | Explicit subscription / design-partner agreement → entitlement |
| Billing responsibility | RTB Engineering & Analytics commercial owner |
| Support scope | Per support model; best-effort unless contracted otherwise |
| Contract owner | Founder / designated commercial authority |
| Renewal/termination | Per executed agreement + offboarding runbook |

## Pricing

`NOT_FINALIZED`. Pricing finalization is a commercial prerequisite before paid activation; design-partner may proceed under executed agreement with deferred or nominal pricing **only if** legal/commercial review accepts that structure. Until then: legal/commercial status remains incomplete for authorization.

## Billing operations

| Element | Definition |
|---------|------------|
| Legal seller | RTB Engineering & Analytics (confirm legal entity in contract) |
| Invoice process | Manual/invoice or designated billing system — to be named in commercial package |
| Tax handling | Responsibility of legal seller / advisor — not hard-coded in EOS architecture |
| Entitlement link | Payment/agreement status gates entitlement issuance (human-operated initially) |
| Payment failure | Suspend entitlement/enrollment per contract; no silent continued access |

## Insurance

Review required whether existing business insurance covers intended software/customer activity. Status `NOT_STARTED`. Do not claim coverage without evidence.

## Authority separation

GA software release authority (Silvestre Berso — `EOS_3_GENERAL_AVAILABILITY_SOFTWARE_RELEASE_ONLY`) does **not** authorize external customer release.

`EOS_3_EXTERNAL_RELEASE_AUTHORITY_SEPARATE_FROM_GA=YES`  
`EOS_3_EXTERNAL_RELEASE_AUTHORITY_DESIGNATED=NO`  

Designation of external-customer release authority is a prerequisite for human GO (do not invent a designation here).
