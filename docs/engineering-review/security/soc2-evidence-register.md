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
| EV-GIT | Change history | git commits ERA-0–ERA-5 | Repository | IMPLEMENTED | Not a complete SDLC attestation. |
| EV-AUDIT-DISP | Audit logging | append-only dispositions | Staging | OPERATING | JWT cannot rewrite/delete history. |
| EV-AUDIT-EVENTS | Audit logging | `audit_events` via AuditService after authorized Review op | Code + unit | IMPLEMENTED | Trusted path wired on `/api/review/*` (`bindTrustedReviewAudit`). Live MUP insert not re-run on staging in ERA-5. User JWT still must not insert. |
| EV-API-AUTHZ | Logical access | Trusted Review handlers | Unit | IMPLEMENTED | `application.test.ts`: auth required, unauthorized/cross-workspace project rejected, document UUID rejected. |
| EV-UI-AUTHZ | Logical access | `/review` client uses Review APIs only | Unit | IMPLEMENTED | `engineering-review-mup.test.ts`; no service-role in client bundle. |
| EV-PROMPT | AI security | Adversarial document fixtures | Unit | IMPLEMENTED | Control-plane unchanged; prompt injection not claimed solved. |
| EV-SECRETS | Secrets | Review isolated from `encryptPlaceholder` / commerce auth default | Assessment + unit | IMPLEMENTED for Review isolation; platform path still DESIGNED/PARTIAL | SHA-256 placeholder is not encryption. Prefer cloud secret manager. |
| EV-FILE | File security | PI MIME/size; no malware scanner | Assessment | DESIGNED / PARTIAL | Do not claim malware scanning. |
| EV-MFA | Privileged access | Privileged MFA middleware | Platform | IMPLEMENTED | Not Review-operator-universal. Supabase capability ≠ enforced. |
| EV-SSO | Identity | Enterprise SSO 0.2.0 | Platform | DESIGNED for Review | Pilot password path still used. |
| EV-TELEMETRY | Privacy / monitoring | Product metrics without document content | Unit | IMPLEMENTED | `telemetry.test.ts`; `review_time_saved` not claimed. |
| EV-VULN-SCAN | Vulnerability management | — | — | DESIGNED | No Review-specific scan artifact. |
| EV-BACKUP | Availability | Supabase backups | Provider | DESIGNED | No Review restore-test record. |
| EV-IR | Incident response | Platform IR docs | Platform | DESIGNED | No Review tabletop record. |
| EV-DEPLOY | Deployment approvals | Staging migration via CLI | Staging | IMPLEMENTED | Production deploy not authorized/performed. |
| EV-RISK | Risk assessment | This register + control matrix | Documentation | DESIGNED | Internal; not auditor-issued. |
| EV-MFA | Privileged access | Privileged MFA middleware | Platform | IMPLEMENTED | Not Review-operator-universal. |
| EV-SSO | Identity | Enterprise SSO 0.2.0 | Platform | PARTIAL / DESIGNED for Review | Pilot password path still used. |
| EV-AI-EVAL | AI quality | ERA-4 gold-set metrics | Local deterministic | IMPLEMENTED | Not engineer-confirmed; not a customer claim. |
| EV-HUMAN | Human oversight | Disposition actor_kind CHECK + domain fail-closed | Staging + unit | OPERATING | AI cannot human-dispose. |
| EV-CHANGE-ERA6 | Change management | ERA-6 security hardening | Repository | IMPLEMENTED | Additive Core RLS; no historical migration edits. |
| EV-CORE-RLS | Logical access | `live-core-rls.test.ts` | Staging | IMPLEMENTED until hosted run OPERATING | Tenant A vs B; A1 vs A2; UUID guess; CUD + ownership mutation. |
| EV-RLS-CI | Change / security CI | `engineering-review-hosted-rls.yml` | GitHub | DESIGNED / IMPLEMENTED as fail-closed job | OPERATING only after `REVIEW_STAGING_*` secrets exist and the job is green. Missing secrets = fail, not PASS. |
| EV-MFA-REVIEW | Identity assurance | Review identity policy | Unit | IMPLEMENTED | Password-only rejected when tenant requires MFA. Tenant enablement is operational. |
| EV-SSO-REVIEW | Identity assurance | Review SSO policy | Unit | IMPLEMENTED | Enforceable when tenant `requireEnterpriseSso` is set. |
| EV-SECRETS-PROD | Secrets | Production fail-closed commerce + placeholder hashing | Unit | IMPLEMENTED | Review still isolated from placeholder path. |
| EV-SECRET-SCAN | Secrets | Review secret-scan | Local / CI | IMPLEMENTED | Regex convention; no committed JWTs/private keys in Review trees. |
| EV-AUDIT-LIVE | Audit logging | `live-audit.test.ts` | Staging | IMPLEMENTED until hosted run OPERATING | User JWT cannot forge audit_events; trusted path writes context. |
| EV-FILE | File security | Magic-byte/filename/archive + EICAR + CLEAN-only Review consume | Unit | IMPLEMENTED for policy; established scanner DESIGNED until ClamAV is deployed | Do not claim malware scanning OPERATING without a scanner instance. |
| EV-VULN-SCAN | Vulnerability management | `dependency-triage.md` + Next 15.5.24 pin | Local / lockfile | IMPLEMENTED as triage | Recheck `pnpm audit --prod` after install. Residual HIGH remain. |
| EV-BACKUP | Availability | `live-restore.test.ts` logical Review-row drill | Staging when hosted tests run | IMPLEMENTED for logical row; PITR DESIGNED | Do not mark PITR OPERATING. |
| EV-IR | Incident response | `incident-response.md` | Documentation | IMPLEMENTED as runbook | No tabletop record. |
| EV-MONITOR | Monitoring | structured JSON alerts + optional webhook | Code + unit | IMPLEMENTED as minimum sink | No SIEM. |
| EV-SCHEMA | Security schema | `engineering_review_security_schema_status` | Staging when applied | IMPLEMENTED | OPERATING after hosted live-schema PASS. |
| EV-THREAT | Risk assessment | `threat-model.md` | Documentation | DESIGNED / IMPLEMENTED as model | Internal; not auditor-issued. |
| EV-DATA | Data governance | `pilot-data-policy.md` | Documentation | DESIGNED / IMPLEMENTED as policy | Narrow pilot scope only. |
| EV-MFA-PILOT | Identity assurance | Tenant A `requireMfa` via `ensurePilotIdentityPolicy` | Staging fixtures | IMPLEMENTED | Live AAL2 enrollment is operator action. |
| EV-TS-GATE | Secure development | `apps/web` `typecheck:review` | Local / CI | IMPLEMENTED | Global ignoreBuildErrors remains for unrelated platform debt. |
| EV-SBOM | Supply chain | `docs/engineering-review/security/evidence/era-6-sbom.json` | Local snapshot | IMPLEMENTED as snapshot | Not an operational SBOM process. |
| EV-RISK | Risk assessment | risk-register.md | Documentation | DESIGNED | AI must not accept residual risk. |
| EV-PILOT | Readiness | pilot-readiness.md | Documentation | DESIGNED | INTERNAL_TEST vs CONTROLLED_PILOT vs ENTERPRISE_PRODUCTION are not equivalent. |

---

## Gaps blocking examination readiness

1. No independent attestation.
2. Hosted RLS CI is fail-closed but OPERATING only after dedicated GitHub secrets are configured and the job is repeatedly green.
3. Established malware scanner is not OPERATING; external Review ingest is fail-closed; EICAR/CLEAN contract is unit-tested.
4. PITR restore not executed; logical Review-row drill is the strongest safe test.
5. No SIEM; minimum JSON/webhook sink exists.
6. Prompt injection remains unsolved (no live LLM in this phase).
7. Platform non-production secret defaults remain DEVELOPMENT_ONLY.
8. Residual HIGH dependency advisories after the Next pin.

Do not promote evidence state to `INDEPENDENTLY_ATTESTED` without an external report.
Do not represent a skipped hosted security suite as PASS.
Do not claim SOC 2 certification or attestation.
