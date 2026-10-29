# EOS 3 External Customer Security and Tenant Isolation

`EOS_3_CONFIDENTIAL_CUSTOMER_DATA_CONTROLS=PASS`  
`EOS_3_EXTERNAL_CUSTOMER_TENANT_ISOLATION=PASS`  
`EOS_3_EXTERNAL_CUSTOMER_CROSS_TENANT_LEAK_COUNT=0`  
`EOS_3_EXTERNAL_CUSTOMER_SECURITY_ATTACK_MATRIX=PASS`  
`EOS_3_EXTERNAL_CUSTOMER_RETRIEVAL_ISOLATION=PASS`  
`EOS_3_EXTERNAL_CUSTOMER_SECURITY_OVERVIEW_READY=YES`  
`EOS_3_CUSTOMER_SECURITY_QUESTIONNAIRE_PACK_READY=YES`

## Access model for external customers

`EXPLICIT_ENTITLEMENT_AND_ENROLLMENT` / `DEFAULT_DENY`  
No public signup; no EOS 2 entitlement inheritance; no automatic enrollment.

## Confidential data controls

Verified posture: tenant isolation, workspace isolation, least privilege, RLS on EOS 3 tables, access evaluation auditability, provenance, authorization fail-closed, kill switch. Production post-GA evidence: cross-workspace stable-id overlap `0`; 1 enrolled workspace only (internal).

## External-customer attack matrix

| Attack | Expected control | Result |
|--------|------------------|--------|
| Foreign workspace access | Workspace match + RLS | DENY |
| Foreign project / object ID | Tenant/workspace scoping | DENY |
| Cross-customer search/retrieval | Workspace-bounded retrieval | DENY / isolated |
| Cross-customer AI context | Live LLM disabled; in-process assist scoped | DENY egress / no cross context |
| Direct API bypass | Product key + entitlement + enrollment | DENY |
| Role escalation | Permission checks | DENY |
| Unauthorized export | Authz + enrollment | DENY |
| Audit tampering | Append-oriented audit design + privilege | Controlled |
| Secret retrieval | No customer secret exposure via EOS 3 paths | DENY |
| Malicious upload | Authz + content handling bounds | Controlled / limited |
| Migration authorization bypass | Migration guard; Production migration count 0 | DENY |
| Unsupported capability invocation | Live LLM / connectors / public signup denied | DENY |

## AI / connector boundary

| Control | Status |
|---------|--------|
| Live LLM external | NOT_SUPPORTED |
| Live LLM disabled enforcement | PASS |
| Unvalidated LLM customer data egress | 0 |
| Real connectors external | NOT_SUPPORTED |
| Real connector disabled enforcement | PASS |
| AI authorities (engineering/decision/deliverable/release/IFC/migration/solver) | all NO |

## Customer-facing security overview (bounded)

- Isolation: tenant + workspace RLS; explicit EOS 3 entitlement/enrollment  
- Audit / provenance: engineering object and foundation audit trails  
- Encryption: transport TLS via hosting/DB providers; do not overclaim application-layer encryption certifications  
- Backup/recovery: WAL-G physical backups; PITR **not** enabled — contractual limitation for initial controlled release  
- Incident handling: see support/incident model  
- AI: deterministic in-process assist only; no live LLM  
- Certifications: **no** SOC 2 / ISO 27001 / EU AI Act certification claimed  

## Security questionnaire pack

Answers must use frozen GA evidence + this gate. Where evidence is absent, answer accurately (`not certified`, `not supported`, `limitation accepted`) — do not invent compliance.

## GHSA external reassessment

`GHSA-w5hq-g745-h8pq` remains `ACCEPTED_BOUNDED_RISK` for **controlled invite-only** external design-partner scope under dependency audit gate. Not automatic for unrestricted public scale; reassess if release mode expands.

`GHSA_W5HQ_G745_H8PQ_EXTERNAL_RELEASE_STATUS=ACCEPTED_BOUNDED_RISK_CONTROLLED_INVITE_ONLY`
