# Privileged MFA & Break-Glass Governance (Phase 14D · S01)

Status: CLOSED with evidence · `PrivilegedMfaPolicyReady=true` · `BreakGlassGovernanceReady=true`

## Authentication inventory (truthful)

| Capability | Status |
| --- | --- |
| Supabase Auth sessions / JWT | implemented |
| Role tiers (owner → viewer) | implemented |
| `is_platform_admin()` via `app_metadata.platform_admin` | implemented |
| MFA / AAL2 issuance | **external IdP dependency** (`supabase_auth_mfa`) |
| Privileged MFA fail-closed decision | implemented (`evaluatePrivilegedMfa`) |
| Production middleware enforcement | implemented when `NODE_ENV/VERCEL_ENV=production` or `RTB_ENFORCE_PRIVILEGED_MFA=1` |

No second identity provider was created. MFA factors are enforced by Supabase Auth; RTB fail-closes privileged operations without AAL2/MFA AMR evidence.

## Privileged principals

- `owner`
- `platform_admin` (`app_metadata.platform_admin`)
- `security_admin` / `production_support_privileged` (policy roles)

## Break-glass

Module: `packages/engineering-os/src/security-closure/break-glass.ts`

- eligibility classes
- reason required
- distinct approver
- ≤ 8 hour window
- restricted privilege allow-list
- full audit trail (request → approve → activate → use → revoke → post-use review)
- no hardcoded emergency credentials
- audit never silently bypassed (`containsSecretMaterial: false`)

## Evidence

- Unit tests: `security-closure.test.ts`
- Middleware: `apps/web/src/middleware.ts`
- Flags: `PrivilegedMfaEnforcementVerified`, `BreakGlassAuditReady`
