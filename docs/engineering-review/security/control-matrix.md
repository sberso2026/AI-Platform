# Engineering Review AI — Trust & Security Control Matrix

**Product:** RTB Engineering Review AI  
**Phase:** ERA-7  
**Status:** Control register for readiness — **not a certification claim**  
**Not claimed:** SOC 2 certified/compliant/attested; ISO 27001 certified; ISO 42001 certified; NIST CSF assessed by a third party.

Allowed implementation status: `IMPLEMENTED` | `PARTIAL` | `MISSING` | `NOT_APPLICABLE`

`IMPLEMENTED` requires actual enforcement and evidence. Interfaces and placeholders are `PARTIAL` or `MISSING`.

Framework tags are mapping aids only (SOC 2 TSC, ISO 27001, ISO 42001, NIST CSF 2.0, NIST AI RMF, OWASP LLM).

---

## Severity of open Review-relevant findings

| ID | Severity | Status |
| --- | --- | --- |
| SEC-CORE-RLS | HIGH | Technical control + schema RPC; hosted proof required per environment |
| SEC-PROMPT | HIGH | Open — prompt injection not solved; deterministic pipeline has no live-model execution |
| SEC-SECRETS | HIGH | Review path isolated; production commerce/placeholder fail-closed; platform non-prod defaults remain DEVELOPMENT_ONLY |
| SEC-AUDIT | LOW | Trusted Review API audit wired; audit-failure alerts; live staging attestation |
| SEC-CI-RLS | MEDIUM | Hosted job exists; fails closed if dedicated staging secrets are absent (not a skip-as-pass) |
| SEC-FILE | HIGH | MIME/size/extension/magic-byte/filename/archive + EICAR + CLEAN-only Review consume; established ClamAV not OPERATING |
| SEC-MFA | MEDIUM | Designated pilot tenant MFA policy is provisioned in fixtures; live AAL2 enrollment is operator action |
| SEC-DEPS | HIGH | Next pin 15.5.24 for prior CRITICAL; residual HIGH remain — see dependency-triage.md |
| SEC-BACKUP | MEDIUM | Logical Review-row drill implemented; PITR not executed |
| SEC-MONITOR | MEDIUM | Structured JSON alerts + optional webhook; no SIEM |

No **CRITICAL** Review finding is currently evidenced (hosted Review table RLS isolation passed on staging in ERA-3A). Unresolved CRITICAL would block production release.

AI cannot modify RLS, tool permissions, human approval boundaries, or this register.

---

## IDENTITY

| control_id | control_domain | requirement | implementation | technical_enforcement | evidence/test | owner | status | gap | remediation | framework_reference |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ID-AUTH | IDENTITY | Authenticate users before Review data access | Supabase Auth JWT on PostgREST | Anon key + user JWT; anonymous SELECT returns zero Review rows | ERA-3A live JWT tests | Platform identity | IMPLEMENTED | — | — | SOC2 CC6.1; NIST CSF PR.AA |
| ID-MFA | IDENTITY | MFA for privileged roles and Review tenant policy | Privileged MFA (AAL2/AMR) plus Review-only identity policy | `evaluatePrivilegedMfa` for /platform|/system|/audit. `evaluateReviewIdentityPolicy` for `/review` and `/api/review`. Password-only is rejectable when tenant `engineeringReview.requireMfa` is true. | identity-policy.test.ts; middleware.ts; with-review-api.ts | Review / identity | PARTIAL | Capability is implemented; tenant policy must still be set for each enterprise Review tenant. Not globally forced. | Enable tenant policy for pilot tenants | SOC2 CC6.1; ISO 27001 A.8.5 |
| ID-SSO | IDENTITY | Enterprise SSO | Platform enterprise SSO 0.2.0 + Review `requireEnterpriseSso` | Password email rejected when Review policy requires SSO (`amr` sso/saml/oidc/oauth or non-email provider) | identity-policy.test.ts | Review / identity | PARTIAL | Enforcement depends on tenant policy and IdP claims | Set `engineeringReview.requireEnterpriseSso` for SSO-only tenants | SOC2 CC6.1 |
| ID-SESSION | IDENTITY | Session management | Supabase Auth SSR cookies | Review API uses `getAuthContext()` cookie session; persistSession false in Review adapter tests | with-review-api.ts | Review / platform | IMPLEMENTED | Session timeout/idle policy remains platform-default | — | SOC2 CC6.1 |
| ID-LIFECYCLE | IDENTITY | Account lifecycle | Supabase admin create/update in cert fixtures only | email_confirm, cert_fixture metadata | live-rls fixtures | Review persistence | PARTIAL | No Review-specific joiner/mover/leaver runbook | Use platform identity lifecycle | SOC2 CC6.2 |

---

## AUTHORIZATION

| control_id | control_domain | requirement | implementation | technical_enforcement | evidence/test | owner | status | gap | remediation | framework_reference |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AZ-RBAC | AUTHORIZATION | RBAC for Review writes | `has_permission('engineering','execute'\|'admin')` | INSERT/UPDATE execute; DELETE admin | ERA-3A JWT DELETE/INSERT tests | Review persistence | IMPLEMENTED | — | — | SOC2 CC6.3; ISO 27001 A.8.2 |
| AZ-LEAST | AUTHORIZATION | Least privilege | SECURITY INVOKER persist functions; service role not used as RLS proof | `prosecdef=false` | ERA-3A pg_proc + live tests | Review persistence | IMPLEMENTED | — | — | SOC2 CC6.3 |
| AZ-TENANT | AUTHORIZATION | Tenant isolation | RLS `tenant_id = ANY(get_user_tenant_ids())` | PostgREST JWT | ERA-3A cross-tenant tests | Review persistence | IMPLEMENTED | — | — | SOC2 CC6.1; NIST CSF PR.AA |
| AZ-WORKSPACE | AUTHORIZATION | Workspace isolation | `engineering_review_workspace_allowed` | JWT membership | ERA-3A A1 vs A2 tests | Review persistence | IMPLEMENTED | — | — | SOC2 CC6.1 |
| AZ-PROJECT | AUTHORIZATION | Project isolation | Composite ownership + evidence document trigger | DB triggers + JWT | ERA-3A cross-project / UUID guess | Review persistence | IMPLEMENTED | — | — | SOC2 CC6.1 |
| AZ-PRIV | AUTHORIZATION | Privileged access | Admin DELETE only; dispositions append-only | RLS USING(false) + triggers | ERA-3A disposition tests | Review persistence | IMPLEMENTED | — | — | SOC2 CC6.2 |
| AZ-SERVICE | AUTHORIZATION | Service-role restrictions | Service role fixture-only for data; trusted audit after JWT-authorized op | Live test compares service vs A2 JWT; MUP store `kind: "authenticated"` | ERA-3A; `runtime.ts`; MUP UI tests | Review persistence | IMPLEMENTED | Browser must never receive service role | Keep service role server-side | SOC2 CC6.3 |
| SEC-CORE-RLS | AUTHORIZATION | Core document/project isolation equivalent to Review | Additive `20260920040000_engineering_core_rls_workspace.sql` | `engineering_core_workspace_member`; NULL workspace fail-closed for user JWT; ownership immutability trigger | `live-core-rls.test.ts` | Platform / Engineering OS | IMPLEMENTED | Legacy NULL workspace rows remain stored and hidden from JWT. Hosted proof is environment-specific. | Apply migration + hosted suite on every Review environment | SOC2 CC6.1; NIST CSF PR.DS |

---

## DATA SECURITY

| control_id | control_domain | requirement | implementation | technical_enforcement | evidence/test | owner | status | gap | remediation | framework_reference |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DS-TLS | DATA SECURITY | TLS in transit | Hosted Supabase HTTPS | supabase.co TLS | Staging access via HTTPS | Platform | IMPLEMENTED | Review does not independently terminate TLS | — | SOC2 CC6.7; NIST CSF PR.DS |
| DS-REST | DATA SECURITY | Encryption at rest | Supabase/AWS managed | Provider default | Provider documentation; not independently attested here | Platform | PARTIAL | No RTB-held key inventory for Review tables | Record provider attestation in SOC 2 evidence pack | SOC2 CC6.7; ISO 27001 A.8.24 |
| DS-SECRETS | DATA SECURITY | Secrets management | Production commerce secret fail-closed; placeholder hashing fail-closed in production; Review isolated | Review uses platform `createServiceClient`; secret-scan on Review trees | secrets-classification.md; secret-scan.test.ts; commerce-execution-context.test.ts | Platform | PARTIAL | Development defaults remain for non-production. SHA-256 placeholder is not recoverable encryption. | Cloud secret manager for platform secrets | SOC2 CC6.1 |
| DS-KEYS | DATA SECURITY | Key management | Provider + GitHub/Vercel secret stores | No Review-owned KMS | — | Platform | PARTIAL | No Review encryption-key rotation runbook | Platform key register | ISO 27001 A.8.24 |
| DS-CLASS | DATA SECURITY | Data classification | Review rows are tenant engineering data | RLS | ERA-3A | Review | PARTIAL | No formal classification labels on tables | Add data classification in ERA-5+ | ISO 27001 A.5.12 |
| DS-RETENTION | DATA SECURITY | Retention | None Review-specific | — | — | Review | MISSING | No retention schedule | Define with customer admin | SOC2 A1.2 |
| DS-DELETE | DATA SECURITY | Deletion | Admin DELETE on aggregates; dispositions append-only | RLS + trigger | ERA-3A | Review | PARTIAL | No tenant offboarding job for Review rows | Cascade via tenant delete already ON DELETE CASCADE | SOC2 CC6.5 |
| DS-BACKUP | DATA SECURITY | Backup protection | Logical Review-row drill + provider backups | Provider + live-restore.test.ts | Logical drill when hosted tests run | Platform | PARTIAL | PITR not executed | PITR to disposable project | SOC2 A1.2; NIST CSF PR.DS |

---

## APPLICATION SECURITY

| control_id | control_domain | requirement | implementation | technical_enforcement | evidence/test | owner | status | gap | remediation | framework_reference |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AS-INPUT | APPLICATION SECURITY | Input validation | Domain fail-closed constructors + schema-validated AI + trusted handlers | `failClosed`, `validateInferenceCandidates`, `withReviewApi` | domain/security/application tests | Review domain | IMPLEMENTED | — | Keep validation at domain boundary | OWASP ASVS; SOC2 CC7.1 |
| AS-API | APPLICATION SECURITY | API authorization | Trusted `/api/review/*` handlers + PostgREST RLS | authenticate, authorize, server tenant/workspace/project, no browser ownership trust | application.test.ts; engineering-review-mup.test.ts | Review | IMPLEMENTED | Rate limit still missing | Do not add UI routes that bypass handlers | SOC2 CC6.1 |
| AS-RATE | APPLICATION SECURITY | Rate limiting | None Review-specific | — | — | Review | MISSING | No Review API rate limit | Use platform/gateway limits in ERA-5 | NIST CSF PR.IR |
| AS-HEADERS | APPLICATION SECURITY | Secure headers | Next.js/platform app | web middleware | Not Review-owned | Platform | PARTIAL | Inherit platform headers on `/review` | — | OWASP |
| AS-DEPS | APPLICATION SECURITY | Dependency scanning | Existing `pnpm audit --prod` certification script + Review lockfile frozen | `--frozen-lockfile`; optional `pnpm audit` evidence | RTB_DEPENDENCY_SCA_POLICY.md | Platform | PARTIAL | No dedicated Snyk/OSV job for Review | Use existing SCA; do not add a large toolchain | SOC2 CC7.1 |
| AS-SAST | APPLICATION SECURITY | SAST | Typecheck + unit tests + Review typecheck gate | tsc + vitest + `typecheck:review` | engineering-review-unit.yml | Review | PARTIAL | No dedicated SAST product; global ignoreBuildErrors remains for unrelated debt | Keep Review gate | SOC2 CC7.1 |
| AS-SECRETSCAN | APPLICATION SECURITY | Secret scanning | Review secret-scan script (existing regex convention) | `secret-scan.ts` | secret-scan.test.ts | Review | IMPLEMENTED | Broader org secret scanning still platform-owned | Keep Review scan in CI | SOC2 CC6.1 |
| AS-SUPPLY | APPLICATION SECURITY | Supply chain | pnpm lockfile frozen in CI | `--frozen-lockfile` | unit workflow | Review | PARTIAL | Review SBOM is a snapshot, not an operational process | Keep lockfile integrity | NIST CSF ID.RA |
| AS-SBOM | APPLICATION SECURITY | SBOM capability | Generated from `pnpm list` when evidence script is run | `docs/engineering-review/security/evidence/era-6-sbom.json` | ERA-6 evidence | Review | PARTIAL | Snapshot only | Refresh on release | NIST SSDF |

---

## FILE SECURITY

| control_id | control_domain | requirement | implementation | technical_enforcement | evidence/test | owner | status | gap | remediation | framework_reference |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SEC-FILE | FILE SECURITY | Upload validation / malware / parser isolation | Review consumes PI files. PI: PDF/TXT/DOCX, 25 MB, extension/MIME, filename sanitization, archive rejection, magic-byte check. Upload-complete rejects EICAR before parser enqueue. Optional ClamAV HTTP (`RTB_REVIEW_CLAMAV_URL`) fail-closes on timeout. Review execution requires CLEAN in pilot. | storage-policy.test.ts; malware-scan.test.ts; file-ingestion-policy.test.ts | Review / PI | PARTIAL | Established scanner is not OPERATING unless ClamAV URL is deployed. External customer upload remains disabled. | Deploy ClamAV or keep admin pre-scan + human risk acceptance | OWASP; NIST CSF PR.DS |
| FS-ARCHIVE | FILE SECURITY | Archive/decompression controls | Archives rejected | Extension allowlist + Review archive policy | storage-policy tests | Review / PI | IMPLEMENTED | — | Remain rejected | OWASP |

---

## AI SECURITY

| control_id | control_domain | requirement | implementation | technical_enforcement | evidence/test | owner | status | gap | remediation | framework_reference |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AI-PROMPT | AI SECURITY | Prompt-injection boundary | Untrusted document text; adversarial fixtures; control-plane snapshot compare; not solved | `UntrustedDocumentText`; `CONTROL_PLANE_POLICY.promptInjectionSolved: false`; `assertControlPlaneUnchanged` | application.test adversarial case; eval/adversarial-fixtures.ts | Review domain | PARTIAL | SEC-PROMPT remains open — live LLM not wired | Keep document text out of system instructions; do not claim solved | OWASP LLM01; NIST AI RMF MAP/MEASURE |
| AI-UNTRUSTED | AI SECURITY | Untrusted-document handling | Extract is untrusted; cannot authorize or close | DOCUMENT_TRUST_BOUNDARY | domain tests | Review domain | IMPLEMENTED | Injection still possible if a future model prompt concatenates raw text unsafely | Review prompt templates must wrap untrusted content | OWASP LLM02 |
| AI-ALLOW | AI SECURITY | Provider allowlist | Provider-neutral interface; default `RejectingInferenceProvider` | No vendor SDK in domain package | boundary.test | Review domain | PARTIAL | No production allowlist config | Add allowlist when live provider is wired | ISO 42001; NIST AI RMF GOVERN |
| AI-RETENTION | AI SECURITY | Provider retention policy | No live provider in ERA-4 | Tests never call network | era4-intelligence.test | Review domain | NOT_APPLICABLE | Becomes applicable at first live model | Contractual zero-retention before live | ISO 42001 |
| AI-PROV | AI SECURITY | Model/prompt provenance | Finding provenance fields | origin/rule/model fields | finding type | Review domain | PARTIAL | Empty unless provider fills them | Require provider + prompt version on live inference | NIST AI RMF |
| AI-TOOL | AI SECURITY | Tool authorization | No tools; detectors cannot dispose | Human-only disposition | lifecycle + ERA-3A | Review domain | IMPLEMENTED | — | — | OWASP LLM08 excessive agency |
| AI-AGENCY | AI SECURITY | Excessive-agency prevention | AI cannot accept/reject/close/sign | CHECK actor_kind=human; domain fail-closed | ERA-3A + era4 tests | Review domain | IMPLEMENTED | — | — | OWASP LLM08; ISO 42001 |
| AI-OUTPUT | AI SECURITY | Output validation | Schema validation; invented locators/values rejected | `validateInferenceCandidates` | era4-intelligence.test | Review domain | IMPLEMENTED | Live model not in CI | Keep fail-closed on malformed output | OWASP LLM05 |
| AI-HALLUC | AI SECURITY | Hallucination controls | Evidence must resolve to source; unsupported suppressed | `verifyFindingAgainstSources` | gold-set grounding 100% on presented | Review domain | IMPLEMENTED | Only proven on synthetic gold set | Engineer eval later | NIST AI RMF MEASURE |
| AI-HUMAN | AI SECURITY | Human authority | Findings awaiting_engineer until human disposition | lifecycle + RLS | ERA-1–3A + ERA-4 | Review domain | IMPLEMENTED | — | — | ISO 42001; NIST AI RMF GOVERN |

---

## AUDIT

| control_id | control_domain | requirement | implementation | technical_enforcement | evidence/test | owner | status | gap | remediation | framework_reference |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AU-AUTH | AUDIT | Authentication events | Supabase Auth | Provider logs | Not Review-owned | Platform | PARTIAL | — | Use platform auth logs | SOC2 CC7.2 |
| AU-AUTHZ | AUDIT | Authorization events | RLS denials are DB-level; not always app-audited | PostgREST 200-empty / 4xx | ERA-3A | Review | PARTIAL | No security telemetry sink for RLS denies | SEC-AUDIT plus monitoring | SOC2 CC7.2 |
| AU-REVIEW | AUDIT | Review actions | ReviewAuditSink + AuditService after authorized op | `bindTrustedReviewAudit(serviceRole)` on authenticated store; metadata sanitizer | live-audit.test.ts; runtime.ts | Review | IMPLEMENTED | Audit failure still does not fail the business op (existing AuditService behaviour) | Keep writes on service role | SOC2 CC7.2 |
| AU-AI | AUDIT | AI/model actions | Provenance on findings | origin ai_candidate vs detector | era4 tests | Review domain | PARTIAL | No durable model-call log table | Add when live inference exists | ISO 42001 |
| AU-DISP | AUDIT | Disposition history | Append-only `engineering_review_dispositions` | RLS false + trigger | ERA-3A | Review persistence | IMPLEMENTED | — | — | SOC2 CC7.2 |
| AU-RETENTION | AUDIT | Audit retention | Platform audit_events; no Review-specific TTL | — | — | Platform | MISSING | — | Define retention | SOC2 A1.2 |
| AU-TAMPER | AUDIT | Tamper resistance | Disposition triggers; audit_events not user-writable in practice | RLS | ERA-3A audit insert failure | Platform | PARTIAL | INSERT policy is tenant-only CHECK; GRANT/RLS still blocked user JWT in staging | Keep writes on service role; do not open user INSERT | SOC2 CC7.2 |

---

## MONITORING / RESILIENCE / IR / PRIVACY / GOVERNANCE / SECURE DEVELOPMENT

| control_id | control_domain | requirement | implementation | status | gap | remediation | framework_reference |
| --- | --- | --- | --- | --- | --- | --- | --- |
| MON-TEL | MONITORING | Product telemetry (not security SIEM) | Counts only; no document content | PARTIAL | No SIEM export | Platform observability later | NIST CSF DE.CM |
| MON-ALERT | MONITORING | Alerting / escalation | Structured JSON `console.warn` + optional `RTB_REVIEW_SECURITY_WEBHOOK_URL` | IMPLEMENTED as minimum sink | No SIEM | Ingest JSON into future SIEM | NIST CSF DE.AE |
| SD-CI | SECURE DEVELOPMENT | CI security gates | Unit job RLS=0; hosted job RLS=1 fail-closed without secrets; Review typecheck + secret-scan | PARTIAL | Hosted secrets must be configured in GitHub | Configure REVIEW_STAGING_* | SOC2 CC8.1 |
| SD-BRANCH | SECURE DEVELOPMENT | Branch protection / PR review | GitHub repo process (platform) | PARTIAL | Not independently verified here | Confirm org branch rules | SOC2 CC8.1 |
| SD-ENV | SECURE DEVELOPMENT | Environment separation | Review migrations applied to staging only in ERA-3A | IMPLEMENTED | Production not authorized | Keep staging-first | SOC2 CC8.1 |
| RES-DR | RESILIENCE | Backup / restore / RTO RPO | Logical Review-row drill; provider backups exist | PARTIAL | PITR not executed | Scheduled PITR to a disposable project | SOC2 A1.2 |
| IR-PROC | INCIDENT RESPONSE | Detection through post-incident | `docs/engineering-review/security/incident-response.md` | IMPLEMENTED as runbook | No tabletop record | Human tabletop | NIST CSF RS.* |
| PR-MIN | PRIVACY | Minimization / isolation | Tenant+workspace RLS; synthetic gold set | PARTIAL | No privacy DPIA | Customer-admin retention | SOC2 P; ISO 27001 A.8 |
| GOV-INV | AI GOVERNANCE | Model/use-case inventory | Review use-case bounded in ERA-0–4 docs; default no live model | PARTIAL | Live model not inventoried | Inventory before first provider | ISO 42001; NIST AI RMF GOVERN |
| GOV-RISK | AI GOVERNANCE | Risk classification / human oversight / evals | Gold-set eval + human authority | PARTIAL | No engineer-confirmed rate | Human eval in later ERA | ISO 42001 |
| GOV-CHANGE | AI GOVERNANCE | Model change control | N/A until live model | NOT_APPLICABLE | — | Require eval gate on model change | NIST AI RMF |
| GOV-PROHIB | AI GOVERNANCE | Prohibited actions | No certify/approve/sign; no visual/OCR/FEA/autonomous design | IMPLEMENTED | — | Keep product boundary | ISO 42001 |

---

## Known security debt (do not mark resolved without evidence)

| ID | Finding | Severity | Status |
| --- | --- | --- | --- |
| SEC-CORE-RLS | Core project/document tenant-only RLS | HIGH | Technical control + schema RPC; hosted proof required on each environment |
| SEC-SECRETS | Platform placeholder hashing and commerce default | HIGH | Production fail-closed; Review isolated; non-prod defaults DEVELOPMENT_ONLY |
| SEC-AUDIT | User JWT must not insert audit_events | LOW | Live trusted-path attestation; audit-failure alert |
| SEC-PROMPT | Prompt injection remains an open risk | HIGH | Open — current pipeline is deterministic; live LLM would raise likelihood |
| SEC-FILE | Established malware scanner not OPERATING | HIGH | EICAR + CLEAN-only Review consume; external ingest fail-closed; ClamAV not deployed |
| SEC-MFA | Review MFA/SSO policy vs live enrollment | MEDIUM | Pilot tenant policy provisioned; AAL2 enrollment is operator action |
| SEC-CI-RLS | Hosted RLS CI without configured secrets | MEDIUM | Job fails closed if secrets absent — not skip-as-pass |
| SEC-DEPS | Residual HIGH dependency advisories | HIGH | Next CRITICAL pin 15.5.24; remaining HIGH in dependency-triage.md |
| SEC-BACKUP | PITR restore unproven | MEDIUM | Logical row drill only |

---

## CI hosted RLS — required setup

See `hosted-rls-ci.md`. Dedicated `REVIEW_STAGING_*` secrets for `rntonzigxwxcjlcsadip` only. Missing secrets fail the hosted security job. Unit workflow keeps `ENGINEERING_REVIEW_RLS=0`.

Existing CI `SUPABASE_*` secrets bound to certification/EOS project `wcydlhqiqdwgoaqrlget` remain the **wrong target** for Review staging RLS.
