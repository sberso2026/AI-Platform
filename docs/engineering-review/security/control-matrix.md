# Engineering Review AI — Trust & Security Control Matrix

**Product:** RTB Engineering Review AI  
**Phase:** ERA-5  
**Status:** Control register for readiness — **not a certification claim**  
**Not claimed:** SOC 2 certified/compliant/attested; ISO 27001 certified; ISO 42001 certified; NIST CSF assessed by a third party.

Allowed implementation status: `IMPLEMENTED` | `PARTIAL` | `MISSING` | `NOT_APPLICABLE`

`IMPLEMENTED` requires actual enforcement and evidence. Interfaces and placeholders are `PARTIAL` or `MISSING`.

Framework tags are mapping aids only (SOC 2 TSC, ISO 27001, ISO 42001, NIST CSF 2.0, NIST AI RMF, OWASP LLM).

---

## Severity of open Review-relevant findings

| ID | Severity | Status |
| --- | --- | --- |
| SEC-CORE-RLS | HIGH | Open — Core `engineering_documents` / `engineering_projects` tenant-only RLS |
| SEC-PROMPT | HIGH | Open — prompt injection not solved; adversarial fixtures have no control-plane effect |
| SEC-SECRETS | HIGH | Open for platform placeholder encryption; Review production path isolated |
| SEC-AUDIT | LOW | Trusted Review API audit wired; live product audit_events not independently re-proven in ERA-5 |
| SEC-CI-RLS | MEDIUM | Open — hosted Review RLS is not a required CI security job |
| SEC-FILE | MEDIUM | PI MIME/size exist; no malware scanner; Review has no upload UI |
| SEC-MFA | MEDIUM | Partial — privileged MFA exists; general SSO/MFA not universally enforced |

No **CRITICAL** Review finding is currently evidenced (hosted Review table RLS isolation passed on staging in ERA-3A). Unresolved CRITICAL would block production release.

AI cannot modify RLS, tool permissions, human approval boundaries, or this register.

---

## IDENTITY

| control_id | control_domain | requirement | implementation | technical_enforcement | evidence/test | owner | status | gap | remediation | framework_reference |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ID-AUTH | IDENTITY | Authenticate users before Review data access | Supabase Auth JWT on PostgREST | Anon key + user JWT; anonymous SELECT returns zero Review rows | ERA-3A live JWT tests | Platform identity | IMPLEMENTED | — | — | SOC2 CC6.1; NIST CSF PR.AA |
| ID-MFA | IDENTITY | MFA for privileged roles | Privileged MFA policy uses AAL2/AMR | `evaluatePrivilegedMfa` in web middleware when production/enforced. `/review` is not a privileged MFA route. | engineering-os security-closure tests; middleware.ts | Platform identity | PARTIAL | MFA is not enforceable as a tenant-wide Review-operator requirement. Supabase supporting TOTP/AAL2 is not the same as implemented enforcement. | Do not mark IMPLEMENTED until tenant MFA policy is enforced for Review operators | SOC2 CC6.1; ISO 27001 A.8.5 |
| ID-SSO | IDENTITY | Enterprise SSO | Platform enterprise SSO 0.2.0 exists | Login SSO entry + discover API; `/platform/enterprise-sso` | phase-16b tests; pilot still uses password sign-in | Platform identity | PARTIAL | Microsoft/enterprise SSO is available as a platform capability, not required/enforced for Review MUP | Keep Review on authenticated JWT | SOC2 CC6.1 |
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
| SEC-CORE-RLS | AUTHORIZATION | Core document/project isolation equivalent to Review | Core tables remain tenant-only | `20260203000001` | ERA-2/3A debt register | Platform / Engineering OS | MISSING | Same-tenant other-workspace Core SELECT may succeed | Dedicated Core RLS hardening phase — do not mix with Review UI | SOC2 CC6.1; NIST CSF PR.DS |

---

## DATA SECURITY

| control_id | control_domain | requirement | implementation | technical_enforcement | evidence/test | owner | status | gap | remediation | framework_reference |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DS-TLS | DATA SECURITY | TLS in transit | Hosted Supabase HTTPS | supabase.co TLS | Staging access via HTTPS | Platform | IMPLEMENTED | Review does not independently terminate TLS | — | SOC2 CC6.7; NIST CSF PR.DS |
| DS-REST | DATA SECURITY | Encryption at rest | Supabase/AWS managed | Provider default | Provider documentation; not independently attested here | Platform | PARTIAL | No RTB-held key inventory for Review tables | Record provider attestation in SOC 2 evidence pack | SOC2 CC6.7; ISO 27001 A.8.24 |
| DS-SECRETS | DATA SECURITY | Secrets management | `.env*` gitignored; GitHub secrets for CI; Review does not call `SecretManagementService.encryptPlaceholder` | Review uses platform `createServiceClient` / hosted Supabase env; no Review-owned crypto | vercel-env-audit; engineering-review-mup.test | Platform | PARTIAL | `COMMERCE_AUTH_SECRET` code default and SHA-256 `encryptPlaceholder` remain platform debt. Hash-with-salt is not recoverable encryption. | SEC-SECRETS: keep Review off placeholder path; replace platform secrets with cloud secret manager (Supabase vault / AWS SM / GCP SM) — no proprietary crypto | SOC2 CC6.1 |
| DS-KEYS | DATA SECURITY | Key management | Provider + GitHub/Vercel secret stores | No Review-owned KMS | — | Platform | PARTIAL | No Review encryption-key rotation runbook | Platform key register | ISO 27001 A.8.24 |
| DS-CLASS | DATA SECURITY | Data classification | Review rows are tenant engineering data | RLS | ERA-3A | Review | PARTIAL | No formal classification labels on tables | Add data classification in ERA-5+ | ISO 27001 A.5.12 |
| DS-RETENTION | DATA SECURITY | Retention | None Review-specific | — | — | Review | MISSING | No retention schedule | Define with customer admin | SOC2 A1.2 |
| DS-DELETE | DATA SECURITY | Deletion | Admin DELETE on aggregates; dispositions append-only | RLS + trigger | ERA-3A | Review | PARTIAL | No tenant offboarding job for Review rows | Cascade via tenant delete already ON DELETE CASCADE | SOC2 CC6.5 |
| DS-BACKUP | DATA SECURITY | Backup protection | Supabase hosted backups | Provider | Not Review-tested restore | Platform | PARTIAL | No Review restore test | Platform DR exercise | SOC2 A1.2; NIST CSF PR.DS |

---

## APPLICATION SECURITY

| control_id | control_domain | requirement | implementation | technical_enforcement | evidence/test | owner | status | gap | remediation | framework_reference |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AS-INPUT | APPLICATION SECURITY | Input validation | Domain fail-closed constructors + schema-validated AI + trusted handlers | `failClosed`, `validateInferenceCandidates`, `withReviewApi` | domain/security/application tests | Review domain | IMPLEMENTED | — | Keep validation at domain boundary | OWASP ASVS; SOC2 CC7.1 |
| AS-API | APPLICATION SECURITY | API authorization | Trusted `/api/review/*` handlers + PostgREST RLS | authenticate, authorize, server tenant/workspace/project, no browser ownership trust | application.test.ts; engineering-review-mup.test.ts | Review | IMPLEMENTED | Rate limit still missing | Do not add UI routes that bypass handlers | SOC2 CC6.1 |
| AS-RATE | APPLICATION SECURITY | Rate limiting | None Review-specific | — | — | Review | MISSING | No Review API rate limit | Use platform/gateway limits in ERA-5 | NIST CSF PR.IR |
| AS-HEADERS | APPLICATION SECURITY | Secure headers | Next.js/platform app | web middleware | Not Review-owned | Platform | PARTIAL | Inherit platform headers on `/review` | — | OWASP |
| AS-DEPS | APPLICATION SECURITY | Dependency scanning | Repo certification packs run secret-scan in some modules | Not Review CI | Other module workflows | Platform | PARTIAL | Review unit workflow has no audit/osv job | Add `pnpm audit` or existing scanner in ERA-5 | SOC2 CC7.1 |
| AS-SAST | APPLICATION SECURITY | SAST | Typecheck + unit tests | tsc + vitest | engineering-review-unit.yml | Review | PARTIAL | No dedicated SAST product | Optional CodeQL later | SOC2 CC7.1 |
| AS-SECRETSCAN | APPLICATION SECURITY | Secret scanning | gitignore env files | — | — | Platform | PARTIAL | No Review-specific secret scan job | Use platform secret scan | SOC2 CC6.1 |
| AS-SUPPLY | APPLICATION SECURITY | Supply chain | pnpm lockfile frozen in CI | `--frozen-lockfile` | unit workflow | Review | PARTIAL | No SBOM published for Review | Generate SBOM when packaged | NIST CSF ID.RA |
| AS-SBOM | APPLICATION SECURITY | SBOM capability | Not generated | — | — | Review | MISSING | — | ERA-5 if commercially packaged | NIST SSDF |

---

## FILE SECURITY

| control_id | control_domain | requirement | implementation | technical_enforcement | evidence/test | owner | status | gap | remediation | framework_reference |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SEC-FILE | FILE SECURITY | Upload validation / malware / parser isolation | Review consumes existing authorized documents; no Review uploader in ERA-5 | PI `validateDocumentStoragePolicy`: PDF/TXT/DOCX, 25 MB, extension/MIME check. No malware scanner. Inspection `malwareScan: "passed"` is a field default, not a scanner. Archives not ingested by Review. | storage-policy tests; upload-session route | Review / PI | PARTIAL | Missing: malware scanning, content-sniff beyond MIME/extension, dedicated parser isolation/sandbox. Severity MEDIUM while Review has no upload UI. | Do not add Review uploads until PI/platform file security is hardened; real malware scanning is platform debt | OWASP; NIST CSF PR.DS |
| FS-ARCHIVE | FILE SECURITY | Archive/decompression controls | Not in Review | — | — | Review | NOT_APPLICABLE | No Review archive ingest | Remain out of Review | OWASP |

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
| AU-REVIEW | AUDIT | Review actions | ReviewAuditSink + AuditService after authorized op | `bindTrustedReviewAudit(serviceRole)` on authenticated store | application.test audit emission; runtime.ts | Review | IMPLEMENTED | Live `audit_events` insert from MUP not re-run on staging in ERA-5 | Keep writes on service role; users must not gain arbitrary `audit_events` write | SOC2 CC7.2 |
| AU-AI | AUDIT | AI/model actions | Provenance on findings | origin ai_candidate vs detector | era4 tests | Review domain | PARTIAL | No durable model-call log table | Add when live inference exists | ISO 42001 |
| AU-DISP | AUDIT | Disposition history | Append-only `engineering_review_dispositions` | RLS false + trigger | ERA-3A | Review persistence | IMPLEMENTED | — | — | SOC2 CC7.2 |
| AU-RETENTION | AUDIT | Audit retention | Platform audit_events; no Review-specific TTL | — | — | Platform | MISSING | — | Define retention | SOC2 A1.2 |
| AU-TAMPER | AUDIT | Tamper resistance | Disposition triggers; audit_events not user-writable in practice | RLS | ERA-3A audit insert failure | Platform | PARTIAL | INSERT policy is tenant-only CHECK; GRANT/RLS still blocked user JWT in staging | Keep writes on service role; do not open user INSERT | SOC2 CC7.2 |

---

## MONITORING / RESILIENCE / IR / PRIVACY / GOVERNANCE / SECURE DEVELOPMENT

| control_id | control_domain | requirement | implementation | status | gap | remediation | framework_reference |
| --- | --- | --- | --- | --- | --- | --- | --- |
| MON-TEL | MONITORING | Product telemetry (not security SIEM) | Counts only; no document content | PARTIAL | No RLS-deny metrics | Platform observability later | NIST CSF DE.CM |
| MON-ALERT | MONITORING | Alerting / escalation | None Review-specific | MISSING | — | Use platform incident channel | NIST CSF DE.AE |
| SD-BRANCH | SECURE DEVELOPMENT | Branch protection / PR review | GitHub repo process (platform) | PARTIAL | Not independently verified here | Confirm org branch rules | SOC2 CC8.1 |
| SD-CI | SECURE DEVELOPMENT | CI security gates | Unit workflow with `ENGINEERING_REVIEW_RLS=0`; hosted RLS **not** in CI | PARTIAL | SEC-CI-RLS | Add required hosted job only with staging secrets; never skip-as-pass | SOC2 CC8.1 |
| SD-ENV | SECURE DEVELOPMENT | Environment separation | Review migrations applied to staging only in ERA-3A | IMPLEMENTED | Production not authorized | Keep staging-first | SOC2 CC8.1 |
| RES-DR | RESILIENCE | Backup / restore / RTO RPO | Provider backups; no Review restore test | PARTIAL | No RTO/RPO for Review | Platform DR | SOC2 A1.2 |
| IR-PROC | INCIDENT RESPONSE | Detection through post-incident | Commerce/platform IR docs exist; not Review-specific | PARTIAL | No Review IR runbook | Extend platform IR | NIST CSF RS.* |
| PR-MIN | PRIVACY | Minimization / isolation | Tenant+workspace RLS; synthetic gold set | PARTIAL | No privacy DPIA | Customer-admin retention | SOC2 P; ISO 27001 A.8 |
| GOV-INV | AI GOVERNANCE | Model/use-case inventory | Review use-case bounded in ERA-0–4 docs; default no live model | PARTIAL | Live model not inventoried | Inventory before first provider | ISO 42001; NIST AI RMF GOVERN |
| GOV-RISK | AI GOVERNANCE | Risk classification / human oversight / evals | Gold-set eval + human authority | PARTIAL | No engineer-confirmed rate | Human eval in later ERA | ISO 42001 |
| GOV-CHANGE | AI GOVERNANCE | Model change control | N/A until live model | NOT_APPLICABLE | — | Require eval gate on model change | NIST AI RMF |
| GOV-PROHIB | AI GOVERNANCE | Prohibited actions | No certify/approve/sign; no visual/OCR/FEA/autonomous design | IMPLEMENTED | — | Keep product boundary | ISO 42001 |

---

## Known security debt (do not mark resolved without evidence)

| ID | Finding | Severity | Status |
| --- | --- | --- | --- |
| SEC-CORE-RLS | Core engineering_documents / engineering_projects tenant-only RLS | HIGH | Open — not modified in ERA-5; dedicated hardening phase required |
| SEC-SECRETS | Platform `encryptPlaceholder` (SHA-256 salt+value, not encryption) and `COMMERCE_AUTH_SECRET` default | HIGH | Open for platform; Review MUP isolated from that path |
| SEC-AUDIT | User JWT cannot insert audit_events; trusted server-side path required | LOW | Wired on Review handlers; live product insert not re-attested in ERA-5 |
| SEC-PROMPT | Prompt injection remains an open risk | HIGH | Open — adversarial control-plane tests pass; not solved |
| SEC-FILE | No real malware scanning / parser isolation evidenced | MEDIUM | Open; Review has no upload UI |
| SEC-MFA | Privileged MFA implemented; general SSO/MFA not universally enforced | MEDIUM | Partial |
| SEC-CI-RLS | Hosted Review RLS suite is not a mandatory CI security gate | MEDIUM | Open |

---

## CI hosted RLS — required setup (not implemented)

Do **not** run hosted JWT tests in CI until all of the following exist as **dedicated staging** GitHub secrets (not production, not printed):

- `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL` for `rntonzigxwxcjlcsadip` (RTB AI Platform Staging)
- matching `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` for that project
- `CERT_USER_PASSWORD` for `cert-er-*` fixtures
- Job must set `ENGINEERING_REVIEW_RLS=1`
- If secrets are missing, the **security job must fail or be a separate non-required job** — never skip inside a job named as a passing security test

Current `engineering-review-unit.yml` sets `ENGINEERING_REVIEW_RLS=0` and runs `test:unit` only so a skipped live suite cannot look like a security pass.

Existing CI `SUPABASE_*` secrets are bound to certification/EOS project `wcydlhqiqdwgoaqrlget`, which is the **wrong target** for Review staging RLS.
