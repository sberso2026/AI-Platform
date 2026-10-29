# EOS 3 External Customer Onboarding and Offboarding

`EOS_3_EXTERNAL_CUSTOMER_ONBOARDING_RUNBOOK_READY=YES`  
`EOS_3_EXTERNAL_CUSTOMER_OFFBOARDING_RUNBOOK_READY=YES`  
`EOS_3_EXTERNAL_CUSTOMER_LIMITATIONS_DISCLOSURE_READY=YES`  
`EOS_3_EXTERNAL_CUSTOMER_ENABLEMENT_PLAN_DEFINED=YES`  
`EOS_3_EXTERNAL_CUSTOMER_SHARED_RESPONSIBILITY_MODEL_DEFINED=YES`

**This gate does not perform onboarding.** Future activation requires separate human GO after legal/commercial readiness.

## Initial cohort (definition only)

| Field | Value |
|-------|-------|
| Mode | `CONTROLLED_EXTERNAL_CUSTOMER_RELEASE` / invite-only |
| Class | `DESIGN_PARTNER` |
| Target count | `1` |
| Access | Explicit entitlement + enrollment; default deny |
| Migration | `NOT_SUPPORTED_INITIAL_RELEASE` |

## Future onboarding sequence (required)

1. Human external-customer release authorization (separate GO)  
2. Executed commercial/legal agreement package  
3. Customer identity verification  
4. Workspace creation/selection  
5. Explicit EOS 3 entitlement  
6. Explicit enrollment  
7. Initial administrator assignment  
8. Access verification  
9. RLS / isolation verification  
10. Scope + limitations acknowledgement  
11. Audit record of activation  

## Limitations disclosure (customer-relevant)

Provide claim matrix +: no live LLM; no real connectors; D1 qualified bounded; non-D1 not qualified; SPACE GASS / external solvers not globally qualified; no Production EOS 2 migration; no public signup; no formal SOC2/ISO27001/EU AI Act; no formal uptime SLO; backup without PITR with contractual recovery limitation. Do not dump internal defect IDs unless necessary for contracted transparency.

## Enablement plan

Orientation on product scope, qualification boundaries, security responsibilities (credential protection, user admin), and support path. Design-partner feedback channel optional.

## Shared responsibility

| Party | Responsibility |
|-------|----------------|
| RTB / platform | Platform security controls, entitlement/enrollment gating, incident process, contracted support |
| Customer | User access administration, customer-generated data accuracy, engineering approval / PE / regulatory decisions, credential protection, competent engineering review |

## Offboarding runbook

1. Revoke users / admin privileges  
2. Revoke EOS 3 entitlement  
3. Disable enrollment  
4. Export data if contracted  
5. Apply retention policy  
6. Execute deletion process with backup-expiration honesty  
7. Close audit record / notify support  

## Restore procedure readiness (non-destructive)

Documented path: identify backup snapshot (WAL-G id / logical snapshot) → restore to isolated recovery environment → validate → controlled re-cutover. Do not run destructive Production restore in this gate.
`EOS_3_EXTERNAL_CUSTOMER_RESTORE_PROCEDURE_READY=YES`
