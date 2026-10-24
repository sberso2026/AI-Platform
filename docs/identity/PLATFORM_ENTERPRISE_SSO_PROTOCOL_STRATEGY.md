# Platform Enterprise SSO Protocol Strategy

Status: **LOCKED** · Phase 16A

## Decision

| Item | Decision |
|---|---|
| Primary V1 enterprise federation | **OpenID Connect / OAuth 2.0** |
| Secondary / reserved | **SAML 2.0** |
| Architecture | Provider-neutral |
| Microsoft Entra | First-class enterprise provider |
| Exclusive Entra hard-code | **Forbidden** |

## Why OIDC primary

- Aligns with Supabase Auth / modern IdP enterprise apps
- Standards-based claims (iss, aud, sub, amr/acr)
- Metadata / JWKS discovery for key rotation
- Better fit for SPA/SSR cookie session bridge into authoritative Platform Auth

## SAML reserved

- Retain for customers that mandate SAML-only enterprise apps
- Not required to begin S08 OIDC/Entra path
- If implemented later: strict signature validation, audience, recipient, assertion conditions

## Entra first-class pathway (OIDC)

Assess / require in implementation phases:

- Enterprise application (OIDC)
- Tenant-specific configuration (not source hard-code)
- Issuer + audience validation
- Tenant restrictions
- MFA/AMR/AAL claims when available
- Conditional Access signal consumption (not re-implementation)
- Group/role claims → governed RTB mapping
- Logout / token lifecycle
- Certificate/key rotation via metadata discovery

SAML for Entra remains available where customer requires it (secondary path).

## Secrets

Client secrets / signing certs use existing Platform secrets infrastructure.  
Never store plaintext secrets in Security & Assurance metadata.
