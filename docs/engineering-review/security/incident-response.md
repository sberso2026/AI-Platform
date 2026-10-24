# Engineering Review AI — incident response (ERA-7)

This is an operational runbook for the Review controlled-pilot boundary. It is **not** legal advice and does not invent notification obligations. Customer-contract and counsel determine external notice.

**On-call owner:** review-oncall  
**Minimum alert destination:** structured JSON `console.warn` (`kind: rtb.review.security_alert`); optional `RTB_REVIEW_SECURITY_WEBHOOK_URL`

Do not copy engineering document content, JWTs, or service-role keys into tickets, chat, or logs.

## Shared steps

1. **Detect** — alert, live test failure, operator report, or provider notice.
2. **Triage** — confirm tenant/workspace/project, actor, time window, whether production vs staging, whether data left the trust boundary.
3. **Contain** — disable Review routes or tenant policy, rotate secrets, revoke sessions as applicable.
4. **Preserve evidence** — export relevant `audit_events`, Review security JSON logs, Git SHA, CI run IDs. Do not overwrite staging to “clean up.”
5. **Eradicate** — remove malicious objects, revoke keys, patch dependencies.
6. **Recover** — restore from the strongest proven backup (logical Review-row drill is proven; PITR is not ERA-7 attested).
7. **Notify/escalate** — platform owner + Review owner. External notice only if an authorized human determines it is required.
8. **Post-incident review** — update risk register; do not mark residual risk ACCEPTED by AI.

---

## Suspected credential compromise

- **Detect:** unusual Review authn failures, MFA assurance failures, session from unexpected IdP, service-role use from client telemetry.
- **Triage:** identify user id / tenant; check `review.authn_failed` / `review.identity_assurance_failed`.
- **Contain:** revoke refresh tokens in Supabase Auth; force MFA reset; disable the account if needed.
- **Preserve:** Auth logs, alert JSON, timestamps.
- **Eradicate:** rotate user password / IdP; rotate `REVIEW_STAGING_*` if those credentials were exposed.
- **Recover:** re-enroll MFA; confirm AAL1 is rejected on the pilot tenant.
- **Notify:** Review owner; IdP admin if SSO involved.
- **Post-incident:** confirm secret-scan still clean.

## Cross-tenant access attempt

- **Detect:** `review.cross_tenant_attempt` (critical).
- **Triage:** actor tenant vs resource tenant; confirm RLS still returns empty/deny.
- **Contain:** if isolation failed, take Review offline on that environment.
- **Preserve:** request IDs, package IDs, live RLS evidence.
- **Eradicate:** patch policy; do not weaken RLS to restore access.
- **Recover:** re-run hosted Review + Core RLS suites.
- **Notify:** platform security immediately if any row was returned across tenants.
- **Post-incident:** treat as release-blocking until proven closed.

## Malicious document

- **Detect:** `review.malware_detected`, EICAR/ClamAV FOUND, parser crash, unexpected archive.
- **Triage:** document id only (no content in tickets); scan state INFECTED vs SCAN_FAILED.
- **Contain:** leave object quarantined; do not parse; disable external upload (already default).
- **Preserve:** object path, checksum, scan state, time.
- **Eradicate:** delete or retain in quarantine per operator; do not open the file on an engineer workstation.
- **Recover:** confirm Review execution still requires CLEAN.
- **Notify:** uploading operator’s admin; no customer-wide claim unless authorized.
- **Post-incident:** keep SEC-FILE open until an established scanner is OPERATING.

## Service-role secret exposure

- **Detect:** key in repo, client bundle, logs, chat, or CI output; `review.service_role_misuse`.
- **Triage:** where it leaked; whether staging vs any other project.
- **Contain:** rotate the service-role key in the Supabase project; invalidate GitHub/Vercel secrets; block Review deploys until rotated.
- **Preserve:** commit SHA / CI log **redacted**; do not re-paste the secret.
- **Eradicate:** purge from git history only via an authorized operator process; rewrite is out of ERA-7 scope unless requested.
- **Recover:** reconfigure `REVIEW_STAGING_SUPABASE_SERVICE_ROLE_KEY`; re-run hosted RLS.
- **Notify:** platform owner immediately.
- **Post-incident:** secret-scan + production-build grep for key prefixes.

## Data leakage

- **Detect:** unexpected document content in logs, webhook, LLM (not in ERA-7), or export.
- **Triage:** what left the boundary; tenant scope.
- **Contain:** disable webhook; rotate webhook secret; stop Review if content is in a public sink.
- **Preserve:** redacted samples proving the leak class, not the payload.
- **Eradicate:** purge downstream copies if the operator controls them.
- **Recover:** confirm `assertSecurityEventSafe` still forbids content keys.
- **Notify:** authorized human decides customer notice.
- **Post-incident:** expand forbidden-token list if a new field leaked.

## Audit failure

- **Detect:** `review.audit_failed`; `AuditService.log` returned null.
- **Triage:** RLS/GRANT vs outage vs payload sanitizer drop.
- **Contain:** if users can INSERT `audit_events`, treat as integrity incident and disable user write paths.
- **Preserve:** failed payload metadata (ids/codes only).
- **Eradicate:** restore trusted bind; do not open user INSERT.
- **Recover:** re-run `live-audit.test.ts`.
- **Notify:** Review owner if trusted path is down for more than the triage window.
- **Post-incident:** keep business-op-continues-on-audit-failure as a documented limitation.

## Dependency compromise

- **Detect:** `pnpm audit` CRITICAL/HIGH, lockfile change, maintainer incident.
- **Triage:** direct vs transitive; production reachability (see dependency-triage.md).
- **Contain:** pin/override; disable image optimization / AVIF; take `next start` offline on Windows if unauthenticated RCE applies.
- **Preserve:** audit JSON snapshot.
- **Eradicate:** upgrade to a fixed version when compatible.
- **Recover:** Review tests + production build.
- **Notify:** platform owner for exploitable CRITICAL.
- **Post-incident:** refresh SBOM snapshot.

## Review service compromise

- **Detect:** unauthorized code on `/api/review`, unexpected live provider, disabled evidence verification, tool invocation.
- **Triage:** compare Git SHA to last known-good ERA checkpoint; confirm CONTROL_PLANE_POLICY still `promptInjectionSolved: false` and tools off.
- **Contain:** revert deploy; rotate secrets; disable Review routes.
- **Preserve:** deploy logs, image digest, schema status RPC output.
- **Eradicate:** rebuild from known-good SHA; do not hot-patch by weakening auth.
- **Recover:** hosted RLS + identity + schema verification + secret-scan.
- **Notify:** platform owner.
- **Post-incident:** ERA gate re-run; ENTERPRISE_PRODUCTION_READY remains NO until a later assessment.
