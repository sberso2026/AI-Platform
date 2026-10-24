# RTB Data Classification Model

Status: Phase 14C minimum taxonomy

## Levels

| Level | Meaning |
| --- | --- |
| PUBLIC | Approved public Trust Center / marketing content |
| INTERNAL | RTB operational non-client data |
| CLIENT_CONFIDENTIAL | Customer tenant business data |
| ENGINEERING_SENSITIVE | Engineering models, inspections, twin state, controls intelligence |
| RESTRICTED | Secrets, credentials, privileged audit, break-glass materials |

## Control implications (minimum)

| Level | Storage | AI external providers | Logs | Export | Solver hosts |
| --- | --- | --- | --- | --- | --- |
| PUBLIC | normal | allowed | ok | ok | n/a |
| INTERNAL | normal | restricted | minimize | controlled | n/a |
| CLIENT_CONFIDENTIAL | tenant-isolated | policy-gated | no payloads | entitlement | client-owned preferred |
| ENGINEERING_SENSITIVE | tenant-isolated | deny-by-default unless approved | no evidence/CoT | entitlement | client-owned / qualified |
| RESTRICTED | secret stores only | never | never | never | never |

Do not invent legal guarantees. Enforcement gaps tracked in Security Gap Register.
