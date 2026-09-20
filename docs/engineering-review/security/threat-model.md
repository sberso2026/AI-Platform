# Engineering Review AI — controlled-pilot threat model (ERA-7)

**Status:** DESIGNED + IMPLEMENTED controls as evidenced. Not a claim that residual risk is accepted.  
**AI cannot accept residual risk.**

## Assumptions

Controlled-pilot users are:

- known authorized engineers
- explicitly provisioned (cert/pilot fixture or named operator accounts)
- limited to a designated pilot tenant, workspace, and project
- subject to the selected identity policy (MFA minimum on Tenant A / `cert-er-a`)

External customer self-upload is **disabled** unless an established malware scanner is configured. There is **no live LLM** in ERA-7. Review execution is deterministic by default.

Pilot is **not** enterprise production. Same-tenant operators outside the designated workspace remain unauthorized.

## Assets

| Asset | Classification | Notes |
| --- | --- | --- |
| Review packages, runs, findings, evidence, dispositions | Tenant engineering data | RLS tenant + workspace + project ownership |
| Core `engineering_projects` / `engineering_documents` | Tenant engineering data | Additive Core workspace RLS required |
| PI extracted text / chunks | Untrusted content | Must not become system instructions |
| `audit_events` | Integrity-sensitive | Trusted service-role write after authorized op |
| Staging secrets (URL, anon, service role, cert password) | Privileged | Dedicated `REVIEW_STAGING_*` only |
| Service-role key | Privileged | Server-only; never client |

## Trust boundaries

1. Browser / untrusted document content
2. Authenticated Next.js `/api/review/*` (user JWT + identity policy)
3. PostgREST with user JWT (RLS)
4. Server-only service-role client (audit bind, schema check)
5. Hosted Postgres (`rntonzigxwxcjlcsadip`)
6. Optional established scanner (`RTB_REVIEW_CLAMAV_URL`) — not operational unless configured
7. Optional alert webhook (`RTB_REVIEW_SECURITY_WEBHOOK_URL`)

## Entry points

- `/review` UI and `/api/review/*`
- PI upload-complete (ingest boundary for Review-consumed files)
- Supabase Auth (password, MFA, SSO claims)
- Hosted CI job using `REVIEW_STAGING_*`
- Direct PostgREST with stolen JWT

## Data flows

1. Operator authenticates → JWT → `guardReviewApi` identity policy → schema check → authorized store
2. Document bytes → PI storage policy (MIME/size/magic/archive) → EICAR/ClamAV gate → parser only if not quarantined
3. Review start → ingest policy + scan-state CLEAN required in pilot → deterministic pipeline
4. Authorized mutation → `bindTrustedReviewAudit(service-role)` → `audit_events`
5. Security events → structured `console.warn` JSON and optional webhook (no document content)

## Threat actors / failure modes

| Threat | Current control | Residual |
| --- | --- | --- |
| Cross-tenant access | Review + Core RLS; live tests | Hosted CI OPERATING only with dedicated secrets |
| Cross-workspace access | Workspace membership RLS | Core migration must be present (schema RPC) |
| Stolen credentials | MFA policy on designated pilot tenant | Live AAL2 enrollment is an operator action; password-only JWT still exists until MFA is enrolled |
| Malicious documents | MIME/magic/archive; EICAR; Review CLEAN-only; external upload disabled | No established ClamAV instance OPERATING |
| Prompt injection | Untrusted typing; control-plane snapshot; no live LLM | **Not solved.** Future live model raises likelihood |
| Malware | EICAR + fail-closed Review consume; optional ClamAV HTTP | Scanner not deployed |
| Dependency compromise | Pin Next 15.5.24; xmldom override; audit triage | Residual HIGH advisories remain |
| Service-role exposure | Server-only; secret-scan; no client bundle | Misconfiguration would be CRITICAL |
| Audit tampering | User JWT INSERT denied; trusted bind | Audit failure alerts; business op still proceeds |
| Data exfiltration | RLS; no live LLM; no tools | Stolen JWT + enrolled MFA bypass still possible |
| Privilege escalation | RBAC execute/admin; AI cannot dispose | Platform roles remain shared |
| Availability loss | Logical restore drill; provider backups | PITR not exercised |

## External / privileged services

- Supabase Auth + Postgres + Storage (staging)
- Optional ClamAV-compatible HTTP scanner
- Optional security webhook
- GitHub Actions (hosted RLS)
- No external LLM in ERA-7
