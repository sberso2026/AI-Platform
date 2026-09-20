# ERA-6 — Engineering Review AI security hardening

**Verdict:** PASS_WITH_LIMITATIONS  
**Branch:** `cursor/era-6-engineering-review-security-hardening`  
**ERA-5 checkpoint:** `89aae5cb9e850c5c3c6ea7b921fb4d76231aa81f`

Not a SOC 2 / ISO / NIST certification claim. AI does not accept residual risk.

## What closed

- Additive Core RLS: tenant + workspace membership on `engineering_projects` / `engineering_documents` (legacy NULL workspace rows retained, fail-closed for user JWT).
- Hosted Core RLS proofs on staging `rntonzigxwxcjlcsadip`.
- Review RLS remains green (11/11).
- Trusted audit live attestation on staging (user JWT cannot forge `audit_events`).
- Production commerce secret and placeholder hashing fail closed.
- Review MFA/SSO policy is enforceable without globally forcing MFA onto other products.
- Hosted RLS CI job fails closed when dedicated staging secrets are absent.
- Review-specific TypeScript gate (global `ignoreBuildErrors` remains for unrelated platform debt).
- External Review file ingest fail-closed without malware scanning; PI MIME/magic-byte/filename/archive hardening added.
- Prompt-injection adversarial cases expanded; not claimed solved.

## Limitations

- GitHub `REVIEW_STAGING_*` secrets are not yet configured, so hosted CI is not OPERATING.
- No malware scanner; PI authenticated upload remains available to workspace members.
- Tenant MFA/SSO policy must still be set per enterprise Review tenant.
- Backup restore drill not executed.
- Security events are not wired to a SIEM.
- 316 unrelated web TypeScript errors remain isolated from the Review gate.
- `pnpm audit --prod` is not clean (existing platform supply-chain debt).
