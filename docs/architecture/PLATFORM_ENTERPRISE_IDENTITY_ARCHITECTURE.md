# Platform Enterprise Identity Architecture

Status: **ARCHITECTURE LOCKED** · Phase 16A · Contracts `0.1.0-draft` (not frozen)

## Purpose

Lock provider-neutral enterprise SSO federation architecture for S08 closure.
Discovery only — no production OIDC/SAML/SCIM/JIT/domain verification runtime.

## Authoritative stack (unchanged)

```
External Customer IdP (Entra / Okta / other)
        ↓  OIDC (primary) / SAML 2.0 (reserved)
Authoritative Platform Auth layer (Supabase Auth + Platform Core)
        ↓
RTB tenant / user / workspace resolution
        ↓
roles / memberships / entitlements (Platform authorization)
        ↓
RTB AI Platform
```

**Authentication from external IdP ≠ authorization inside RTB.**

## Ownership

| Concern | Owner |
|---|---|
| Application user identity, sessions, federation, SSO config | **Platform Identity** |
| Corporate credentials / CA / device posture | External Customer IdP |
| Evidence / assessment of SSO readiness | Security & Assurance (frozen V1) |
| Engineering product modules | consume authenticated Platform identity only |

`platformIdentityOwnership = platform_identity`  
`customerSsoOwnership = platform_identity`  
`securityAssuranceOwnsCustomerSso = false`  
`EngineeringOsOwnsCustomerSso = false`

## Protocol strategy

- **Primary V1 federation:** OpenID Connect / OAuth 2.0
- **Secondary / reserved:** SAML 2.0
- Provider-neutral; Microsoft Entra is **first-class**, not exclusive
- No Entra tenant hard-coding in application source

## Tenant SSO policy

Modes: `disabled` | `optional` | `required` | `required_for_privileged_users` | `required_for_all_users`

When mode is `required` / `required_for_*`:
- `passwordFallbackWhenRequired = false`
- fallback is deny or break-glass-only (RTB internal emergency paths separate)

## Domain discovery

Email → verified domain mapping → Customer IdP.  
Domain ownership must be verified (DNS TXT / well-known / governed manual review).  
Administrator typing a domain ≠ verified ownership.

## Binding / linking / JIT / SCIM

- Resolve via stable provider subject + verified issuer + tenant binding
- Do not authorize solely from email domain
- Account linking requires governed verification (no email takeover / cross-tenant link)
- JIT: **OPTIONAL** for initial SSO; never auto-grant privileged roles
- SCIM: **POST_V1**; SSO auth ≠ lifecycle provisioning

## MFA / Conditional Access

- SSO ≠ MFA
- Consume AMR/ACR/AAL / provider assurance where present
- Phase 14D privileged MFA remains fail-closed
- Customer IdP may enforce Conditional Access; RTB is not the CA engine

## Session / offboarding / break-glass

- Session create/refresh/logout via authoritative Platform Auth
- Disabled external identity → access terminates per policy (not claimed instantaneous if not detectable)
- Break-glass remains RTB-internal emergency governance; not customer password bypass under SSO_REQUIRED
- No shared universal emergency credential

## Multi-tenant IdP isolation

Prevent issuer/audience/tenant/domain/subject confusion, claim spoofing, cross-tenant config IDOR.

## Package placement

- New package `@rtb/platform-identity` owns discovery/architecture for enterprise identity
- Does **not** replace `@rtb/platform-core` + Supabase Auth as authoritative runtime
- Forbidden duplicate packages: `security-assurance-sso`, `engineering-os-sso`, `customer-sso-platform`

## Non-goals (16A)

No production OIDC/SAML/SCIM/JIT/domain verification/customer redirect/admin config/live Entra.
Do not claim `S08CustomerSsoProductionReady`.
Do not perform S07 pentest.
Do not modify frozen Engineering OS V1 or Security & Assurance V1 tags/contracts.
