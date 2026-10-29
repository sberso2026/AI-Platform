# EOS 2.20 GA Commercial and Onboarding Readiness (gate rerun)

## Entitlement

`GA_ENTITLEMENT_MODEL_ASSESSED=YES`

`GA_ENTITLEMENT_MODEL_STATUS=READY`

`GA_ENTITLEMENT_EVALUATOR=PASS`

`ENTITLEMENT_PRODUCT_FILTERING=PASS`

`GA_ENTITLEMENT_TEST_MATRIX=PASS`

`LEGACY_ENTITLEMENT_AUTO_ENABLES_EOS_2=NO`

Canonical `eos2_ga_entitlements` (`product_key=eos-2`) + server-side fail-closed evaluator are live in Production remediation runtime. Access is workspace- and product-specific. Billing provider state is not the authorization source. Internal pilot override alone is no longer the entitlement mechanism.

## Onboarding / offboarding

`GA_ONBOARDING_STATUS=READY`

`GA_ONBOARDING_END_TO_END_TEST=PASS`

`GA_OFFBOARDING_WORKFLOW_IMPLEMENTED=YES`

`PRODUCTION_ENTITLEMENT_REVOCATION_TEST=PASS`

Normal GA onboarding uses the audited admin entitlement/enrollment path documented in `EOS_2_20R_GA_ONBOARDING_AND_OFFBOARDING.md`. Ad hoc direct SQL is not the standard workflow.

## Multi-enrolled evidence

`LIVE_MULTI_ENROLLED_PRODUCTION_COHORT_VALIDATED=YES`

`INTERNAL_VALIDATION_NOT_MISREPRESENTED_AS_CUSTOMER_PROOF=YES`

Workspaces `5c85d773-3b79-43b2-b138-c6251f566768` and `ce113edd-45b8-4efd-b2e0-0ad0307c611c` are internal controlled/validation Production evidence, not paying customers.

## Commercial readiness

`GA_COMMERCIAL_READINESS=READY_WITH_LIMITATIONS`

Canonical entitlement, onboarding/offboarding, product model, qualification disclaimer, and supported-scope packaging are in place. Pricing remains external. Support is bounded (no 24/7 claim).

## Customer policy package

`GA_CUSTOMER_POLICY_PACKAGE_STATUS=READY_WITH_LIMITATIONS`

Bounded draft/product-requirement coverage exists for terms, privacy, acceptable use, support, and engineering-use disclaimers. **No formal legal review is claimed.** Under RTB governance this does **not** block technical GA readiness / pre-authorization, but **formal legal review is required before accepting external customers**.

## Compliance / privacy / residency

`GA_COMPLIANCE_CLAIMS_ACCURATE=YES`

`FORMAL_SOC2_CERTIFIED=NO`

`FORMAL_ISO27001_CERTIFIED=NO`

`FORMAL_EU_AI_ACT_CERTIFIED=NO`

`GA_DATA_RESIDENCY_CLAIM_STATUS=SUPPORTED_BOUNDED`

`GA_PRIVACY_STATUS=READY_WITH_LIMITATIONS`

## Human GA authority

`HUMAN_GA_RELEASE_SIGNATORY_IDENTIFIED=YES` — Silvestre Berso

`HUMAN_GA_RELEASE_ROLE=Founder and Authorized General Availability Release Authority`

`HUMAN_GA_RELEASE_AUTHORITY_VERIFIED=YES`

`FINAL_GA_GO_NO_GO=NOT_ISSUED`

`AI_GA_RELEASE_AUTHORITY=NO`
