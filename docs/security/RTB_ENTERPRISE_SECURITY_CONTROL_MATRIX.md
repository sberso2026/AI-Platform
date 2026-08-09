# RTB Enterprise Security Control Matrix

Status: Phase 14C · `SecurityControlMatrixReady = true`  
Internal readiness mapping — **not** ISO/SOC2/Essential Eight certification.

## Control catalogue (selected)

| controlId | title | objective | owner | implementationStatus | ISO theme | NIST CSF 2.0 | Essential Eight | evidenceRefs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CTRL-IAM-001 | User authentication | Authenticate users before access | Platform/IdP | implemented_bounded | A.5/A.8 | PR.AA | MFA (related) | JWT cert gates |
| CTRL-IAM-002 | Privileged MFA | MFA for privileged operators | Platform/IdP | missing | A.8 | PR.AA | MFA | gap register S01 |
| CTRL-AUTHZ-001 | Entitlement enforcement | Deny unauthorized product/module use | Commerce | implemented | A.8 | PR.AA | — | commerce policies |
| CTRL-ISO-001 | Tenant RLS | Prevent cross-tenant data access | Platform DB | implemented | A.8 | PR.DS | — | RLS certs |
| CTRL-ISO-002 | IDOR prevention | Prevent object-level IDOR | Modules/API | implemented | A.8 | PR.DS | — | IDOR certs |
| CTRL-CRYPT-001 | TLS in transit | Protect data in transit | External hosting | external_provider | A.8 | PR.DS | — | provider |
| CTRL-CRYPT-002 | Encryption at rest | Protect stored data | External DB/storage | external_provider | A.8 | PR.DS | — | Supabase/storage |
| CTRL-SECRET-001 | Secret scanning | Prevent committed secrets | Secure SDLC | implemented | A.8 | PR.PS | — | cert secret-scan |
| CTRL-SECRET-002 | Secret rotation | Rotate credentials | Ops | manual/missing | A.8 | PR.AA | — | gap S04 |
| CTRL-AI-001 | Shared AI stack only | No module private AI stacks | EOS/AI Runtime | implemented | A.8 | GV.PO | — | implementsOwnAiStack=false |
| CTRL-AI-002 | No auto engineering approval | Human remains authority | Modules | implemented | A.8 | GV.OC | — | AI policies |
| CTRL-EXEC-001 | Execution host isolation | Confine solver jobs | Exec Host | implemented_bounded | A.8 | PR.PS | — | host cert |
| CTRL-EXEC-002 | No silent solver fallback | Fail closed on provider miss | Interop/ETF | implemented | A.8 | PR.PS | — | silentSolverFallbackAllowed=false |
| CTRL-SDLC-001 | Dependency vulnerability detect | Find vulnerable deps | Secure SDLC | missing | A.8 | ID.RA | Patch apps | gap S02 |
| CTRL-LOG-001 | Security/audit events | Record security-relevant actions | Platform | implemented_bounded | A.8 | DE.CM | — | audit events |
| CTRL-IR-001 | Incident response | Detect/contain/recover | Ops | implemented_bounded | A.5 | RS.* | — | module + baseline docs |
| CTRL-BACKUP-001 | Backups | Recover data | Ops/provider | implemented_bounded | A.8 | PR.DS / RC | Regular backups | provider + module restore certs |
| CTRL-GOV-001 | Control catalogue | Map controls to frameworks | Sec&Assurance (future) | implemented_bounded (this matrix) | ISMS | GV | — | this doc |

## Framework mapping honesty

Mapping ≠ certification. `iso27001Certified=false`, `soc2Assured=false`,
`essentialEightMaturityClaimed=false`.
