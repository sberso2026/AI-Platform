# Engineering Review AI — SOC 2 evidence register

**Purpose:** Track real evidence that could support a future SOC 2 examination.  
**This document does not claim SOC 2 certified, SOC 2 compliant, or SOC 2 attested.**

Evidence states:

| State | Meaning |
| --- | --- |
| DESIGNED | Control described; not evidenced in operation |
| IMPLEMENTED | Control exists in code/config with tests |
| OPERATING | Repeatedly demonstrated in the intended environment |
| INDEPENDENTLY_ATTESTED | External auditor/attestor has opined — **none** |

---

| evidence_id | control_theme | artifact | environment | state | notes |
| --- | --- | --- | --- | --- | --- |
| EV-RLS-HOSTED | Logical access / isolation | `packages/engineering-review-persistence/src/live-rls.test.ts` + ERA-3A report | RTB AI Platform Staging (`rntonzigxwxcjlcsadip`) | OPERATING | Authenticated JWT proofs 2026-09-19. Not independently attested. |
| EV-RLS-DOC | Logical access | `docs/engineering-review/ERA-3A-hosted-rls-validation.md` | Staging | IMPLEMENTED | Records policy metadata and topology; no secrets. |
| EV-UNIT-REVIEW | Change / quality | `@rtb/engineering-review` vitest | Local / CI unit workflow | IMPLEMENTED | Gold-set + domain + security tests. |
| EV-UNIT-PERSIST | Change / quality | persistence `test:unit` | CI unit workflow | IMPLEMENTED | Does not include hosted RLS. |
| EV-MIGRATION | Change management | `supabase/migrations/20260919120000_*` and `20260919133000_*` | Staging applied | OPERATING | Additive Review schema; recorded in `schema_migrations`. |
| EV-GIT | Change history | git commits ERA-0–ERA-4 | Repository | IMPLEMENTED | Not a complete SDLC attestation. |
| EV-AUDIT-DISP | Audit logging | append-only dispositions | Staging | OPERATING | JWT cannot rewrite/delete history. |
| EV-AUDIT-EVENTS | Audit logging | `audit_events` via AuditService | Staging | DESIGNED | User JWT insert failed; trusted service-role path coded (`bindTrustedReviewAudit`), not product-wired. |
| EV-VULN-SCAN | Vulnerability management | — | — | DESIGNED | No Review-specific scan artifact. |
| EV-BACKUP | Availability | Supabase backups | Provider | DESIGNED | No Review restore-test record. |
| EV-IR | Incident response | Platform IR docs | Platform | DESIGNED | No Review tabletop record. |
| EV-DEPLOY | Deployment approvals | Staging migration via CLI | Staging | IMPLEMENTED | Production deploy not authorized/performed. |
| EV-RISK | Risk assessment | This register + control matrix | Documentation | DESIGNED | Internal; not auditor-issued. |
| EV-MFA | Privileged access | Privileged MFA middleware | Platform | IMPLEMENTED | Not Review-operator-universal. |
| EV-SSO | Identity | Enterprise SSO 0.2.0 | Platform | PARTIAL / DESIGNED for Review | Pilot password path still used. |
| EV-AI-EVAL | AI quality | ERA-4 gold-set metrics | Local deterministic | IMPLEMENTED | Not engineer-confirmed; not a customer claim. |
| EV-HUMAN | Human oversight | Disposition actor_kind CHECK + domain fail-closed | Staging + unit | OPERATING | AI cannot human-dispose. |

---

## Gaps blocking examination readiness

1. No independent attestation.
2. Hosted RLS not a required CI security job against staging secrets.
3. Trusted audit path not operating on a product API.
4. No vulnerability scan / backup restore / IR exercise artifacts for Review.
5. Core document RLS debt remains.

Do not promote evidence state to `INDEPENDENTLY_ATTESTED` without an external report.
