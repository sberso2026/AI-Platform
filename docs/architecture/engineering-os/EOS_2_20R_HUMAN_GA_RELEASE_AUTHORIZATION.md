# EOS 2.20R Human GA Release Authorization

Recorded: 2026-10-29

Phase: `EOS-2.20R-HUMAN-GA-RELEASE-AUTHORIZATION`

## Final decision

`FINAL_GA_GO_NO_GO=GO`

`HUMAN_GA_RELEASE_AUTHORITY=YES`

`HUMAN_GA_RELEASE_SIGNATORY=Silvestre Berso`

`HUMAN_GA_RELEASE_ROLE=Founder and Authorized General Availability Release Authority`

`HUMAN_GA_RELEASE_AUTHORITY_BASIS=Founder and authorized decision-maker of RTB Engineering and Analytics Pty Ltd`

`AI_GA_RELEASE_AUTHORITY=NO`

`EOS_2_0_GA_RELEASE_AUTHORIZED=YES`

`GA_ACTIVATION_PERFORMED=NO`

This record authorizes controlled General Availability activation. It does **not** itself change Production rollout mode, enroll workspaces, or open external commercial onboarding.

## Basis

Completed `EOS-2.20-EOS-2.0-GENERAL-AVAILABILITY-GATE` established:

- `TECHNICAL_GA_READINESS=READY`
- `GA_READINESS_NOT_READY_COUNT_AFTER_ADJUDICATION=0`
- `GA_SECURITY_POSTURE=PASS`
- `SECURITY_RELEASE_REGRESSION_GATE=PASS`
- `GA_ENTITLEMENT_MODEL_STATUS=READY`
- `GA_ONBOARDING_STATUS=READY`
- `GA_DOCUMENTATION_STATUS=READY`
- `LIVE_MULTI_ENROLLED_PRODUCTION_COHORT_VALIDATED=YES`
- `NO_UNRESOLVED_CRITICAL_OPERATIONAL_DEFECT=YES`
- `NO_UNRESOLVED_HIGH_OPERATIONAL_DEFECT=YES`
- `EOS_2_0_QUALIFICATION_STATUS=QUALIFIED_BOUNDED`

## Authorized Production identity

| Item | Value |
| --- | --- |
| Runtime | `72d668d2a34e33de9c9b438e0462d0af8c15b031` |
| Deployment | `dpl_DL6rmuFs2iX2hKKwS83XNhVtmCpF` |
| Migration ledger | `160` |
| Supabase | `wcydlhqiqdwgoaqrlget` |

Verified at authorization time: live build-identity commit matches; Production mode still `controlled_pilot`; enrolled workspace count `2`.

## GA scope

Approved only within documented supported scope and qualification boundaries in:

- `EOS_2_20_GA_CLAIM_MATRIX.md`
- `EOS_2_20_GA_SCOPE_AND_LIMITATIONS.md`
- associated qualification evidence

Preserved qualification boundaries:

- Structural D1: `QUALIFIED_BOUNDED`
- Non-D1 deterministic discipline calculations: `NOT_QUALIFIED`
- External solver execution: `NOT_GLOBALLY_QUALIFIED`

Does **not** authorize autonomous engineering approval, autonomous materiality determination, autonomous deliverable approval, autonomous IFC release, professional engineering certification, statutory certification, or regulatory certification.

AI has no engineering approval, release, IFC, regulatory certification, or GA release authority.

## Controlled GA rollout authorization

This GO authorizes:

`EOS-2.21-GENERAL-AVAILABILITY-CONTROLLED-ACTIVATION`

Required controls:

- canonical entitlement
- onboarding
- explicit workspace enrollment
- rollout safeguards
- kill switch retained
- application rollback retained
- `LEGACY_ENTITLEMENT_AUTO_ENABLES_EOS_2=NO`
- no automatic EOS 1 project migration
- no automatic enablement for existing Engineering OS installations

## External customer restriction (mandatory, visible)

Formal legal review of the customer-facing policy package has **not** been completed.

Therefore:

**EOS 2.0 may be technically activated as General Availability, but external commercial customer onboarding, contracting, or acceptance must not commence until the required customer terms, privacy, and related policy documentation have completed the applicable RTB legal review and approval process.**

Internal GA validation and controlled operational readiness activities may continue.

`EXTERNAL_COMMERCIAL_CUSTOMER_ONBOARDING_AUTHORIZED=NO`

This restriction must remain visible and must not be silently removed.

## Accepted bounded limitations

- formal legal review remains required before external customer onboarding
- commercial pricing remains externally configured
- PITR recommended but not currently enabled
- logical backup and validated recovery procedures remain the current database recovery mechanism
- Engineering AI retrieval remains limited to supported indexed sources and must abstain when evidence is unavailable
- MDR remains subject to the documented UX limitation
- `GHSA-w5hq-g745-h8pq` remains an accepted bounded moderate dependency risk
- Production reliability evidence remains bounded rather than large-scale
- Production performance remains usable but degraded/nonblocking; no formal contractual GA SLO adopted
- `FORMAL_SOC2_CERTIFIED=NO`
- `FORMAL_ISO27001_CERTIFIED=NO`
- `FORMAL_EU_AI_ACT_CERTIFIED=NO`

These limitations must not be represented to customers as capabilities, qualifications, or certifications that EOS 2.0 does not possess.

## Next phase

`READY_FOR_NEXT_PHASE=YES`

`NEXT_PHASE=EOS-2.21-GENERAL-AVAILABILITY-CONTROLLED-ACTIVATION`

Activation must use the authorized runtime/deployment identity above unless a later human-authorized superseding release is recorded.
