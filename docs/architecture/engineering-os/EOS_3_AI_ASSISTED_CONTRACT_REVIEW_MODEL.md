# EOS 3 AI-Assisted Contract Review Model

`EOS_3_AI_ASSISTED_CONTRACT_REVIEW_MODEL_DEFINED=YES`  
`EOS_3_AI_CONTRACT_DECISION_AUTHORITY=NO`  
`EOS_3_CONTRACT_RISK_CLASSIFICATION_MODEL_DEFINED=YES`  
`EOS_3_EXTERNAL_CUSTOMER_LEGAL_REVIEW_MODEL=RISK_BASED`  
`EOS_3_EXTERNAL_CUSTOMER_LEGAL_REVIEW_REQUIRED=CONDITIONAL`

## Purpose

Support external-customer readiness by assisting humans to review proposed contractual terms against approved templates, commercial guardrails, and the frozen external-customer claim matrix.

## AI may

- Review proposed terms vs approved templates/guardrails  
- Identify deviations and non-standard obligations  
- Flag material liability, indemnity, warranty, privacy, regulatory, cybersecurity, SLA, IP, residency/transfer, and audit-right concerns  
- Check commitments against actual EOS technical capability and frozen claim matrix  
- Classify provisions; recommend escalation; prepare review summaries  
- Identify decisions required from accountable business owners  

## AI may NOT

- Provide final legal approval  
- Accept terms or bind RTB commercially  
- Approve material liability exposure  
- Waive governance requirements  
- Issue external-customer release authorization  
- Represent itself as legal counsel  

## Contract risk classification

| Class | Meaning |
|-------|---------|
| `STANDARD_ACCEPTED` | Matches approved template/guardrails |
| `STANDARD_WITH_CLARIFICATION` | Standard intent; wording clarification only |
| `NON_STANDARD_LOW_RISK` | Deviation with low residual risk; owner may accept |
| `NON_STANDARD_MATERIAL_RISK` | Material exposure; escalate |
| `BUSINESS_AUTHORITY_DECISION_REQUIRED` | Commercial policy choice required |
| `LEGAL_OR_SPECIALIST_REVIEW_RECOMMENDED` | Specialist review advised |
| `OUTSIDE_APPROVED_COMMERCIAL_GUARDRAILS` | Outside approved bounds |
| `UNACCEPTABLE_UNDER_CURRENT_GUARDRAILS` | Reject / renegotiate |

## Risk-based legal review

Do **not** require external legal review for every customer agreement by default.

Escalate to legal/specialist review when terms include: material non-standard obligations; material liability/indemnity/warranty; regulatory commitments; material privacy/security commitments beyond validated controls; SLAs beyond approved operational capability; unusual IP/audit/residency/transfer obligations; or anything outside approved guardrails.

If terms remain within approved commercial guardrails for DESIGN_PARTNER invite-only:

`EOS_3_EXTERNAL_CUSTOMER_LEGAL_REVIEW_REQUIRED=CONDITIONAL`  
(default path: internal acceptance + AI-assisted classification; specialist review only on escalation triggers)

If material non-standard obligations exist unresolved:

`EOS_3_EXTERNAL_CUSTOMER_LEGAL_REVIEW_REQUIRED=YES`

## Governance vs engineering

`EOS_3_GOVERNANCE_REVIEW_AUTO_REOPENS_ENGINEERING=NO`  
`EOS_3_ENGINEERING_REOPEN_REQUIRES_MATERIAL_TECHNICAL_TRIGGER=YES`

External review findings inform risk acceptance and authorization. They are not automatic technical failures unless they prove the platform cannot satisfy a material required control.
