# Platform Enterprise SSO — Experience & Commercial Boundary

Status: Phase 16A discovery notes

## Customer experience (intended)

- Email-first discovery when domain verified
- Continue with Microsoft (Entra) when configured
- Organization-specific SSO entry
- SSO-required redirect (no unsafe password fallback)
- Safe error states (no provider/tenant config leakage)
- Support / recovery pathway distinct from RTB break-glass

## Admin experience (intended)

Authorized enterprise admins may eventually:

- configure provider
- verify domain
- test connection
- configure claim / role mapping
- enable/disable SSO
- review health/status
- view audit

No production admin implementation in 16A.

## Commercial boundary

- Customer enterprise SSO may be an **enterprise entitlement**
- Must **never** make optional/premium:
  - RTB administrative identity security
  - privileged MFA
  - tenant isolation
  - baseline authentication security
- Entitlements remain server-side enforced
