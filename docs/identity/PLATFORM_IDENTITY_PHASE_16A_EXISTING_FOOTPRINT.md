# Platform Identity Phase 16A — Existing Identity Footprint

Status: **DISCOVERY** · Version `0.1.0-enterprise-sso-discovery` · Phase 16A

Baselines:
- Security & Assurance V1: `security-assurance-v1.0.0` → `cf3e9eff49c1314ea16e115dcde26cd45e520121`
- Engineering OS V1: `engineering-os-v1.0.0` → `3bfc02478f50ce17f7a81e4e312986c9e1377535`

## Classification legend

| Class | Meaning |
|---|---|
| AUTHORITATIVE_EXISTING | Production-authoritative capability already in Platform |
| REUSABLE | Existing Platform subsystem to reuse (not duplicate) |
| PARTIAL | Schema/policy present; product surface incomplete |
| RESERVED | Documented/owned for future; not implemented |
| MISSING | Required for S08/Tier-1 path; absent |
| EXTERNAL | Owned outside Platform Identity (vendor or other module) |

## Inventory

| Capability | Class | Owner | Evidence |
|---|---|---|---|
| Supabase Auth email/password | AUTHORITATIVE_EXISTING | Platform Core + Supabase | `apps/web/(auth)/login`, `packages/platform-core/src/auth.ts` |
| JWT cookie sessions | AUTHORITATIVE_EXISTING | Platform Core + Supabase SSR | `apps/web/src/middleware.ts` |
| Session refresh | AUTHORITATIVE_EXISTING | Supabase SSR (implicit) | middleware cookie `setAll` |
| Profiles + signup provisioning | AUTHORITATIVE_EXISTING | Platform Core | `platform_core` + signup migrations |
| Tenant membership | AUTHORITATIVE_EXISTING | Platform Core | `tenant_memberships`, `kernel.ts` |
| Workspace membership | AUTHORITATIVE_EXISTING | Platform Core | `workspace_memberships` |
| Roles / permissions | AUTHORITATIVE_EXISTING | Platform Core | `permissions.ts`, RLS |
| Nav tiers / route guards | AUTHORITATIVE_EXISTING | Platform Core | `nav-visibility.ts`, middleware |
| Entitlements | AUTHORITATIVE_EXISTING | Platform Commerce | entitlement service + APIs |
| Privileged MFA (14D AAL/AMR) | AUTHORITATIVE_EXISTING | Engineering OS security-closure + middleware | `privileged-mfa.ts` |
| MFA enrollment/challenge UX | PARTIAL | Platform Identity (future) + EXTERNAL Supabase MFA | `?mfa_required=privileged` incomplete on login |
| Break-glass governance | AUTHORITATIVE_EXISTING | Engineering OS security-closure | `break-glass.ts` |
| Logout | AUTHORITATIVE_EXISTING | Platform Core | `signOut` |
| User invitation flows | PARTIAL | Platform Identity | DB `invited_at`/`pending`; no invite API/UI |
| Token revocation admin | MISSING | Platform Identity | no product session-revocation UI |
| Service identities | PARTIAL | Platform Core | service-role client; no formal machine-identity model |
| API authentication | AUTHORITATIVE_EXISTING | Platform Core | `getAuthContext`, RLS, entitlements |
| Admin identity (`platform_admin`) | AUTHORITATIVE_EXISTING | Platform Core | JWT `app_metadata.platform_admin` |
| Customer login UI | AUTHORITATIVE_EXISTING | apps/web `(auth)` | email/password only |
| Customer enterprise SSO | MISSING | Platform Identity | S08 open; no OIDC/SAML login |
| Entra customer federation | RESERVED | Platform Identity | first-class path defined in 16A |
| SAML / OIDC federation runtime | MISSING | Platform Identity | no `signInWithOAuth`/SAML |
| SCIM lifecycle | MISSING | Platform Identity | POST_V1 |
| Domain verification | MISSING | Platform Identity | architecture locked in 16A |
| Account linking | MISSING | Platform Identity | architecture locked in 16A |
| Teams/Graph Microsoft OAuth | EXTERNAL | Project Intelligence | not customer SSO |
| Policy Engine | REUSABLE | Platform Intelligence | authorization PDP; not IdP |
| Platform Audit | REUSABLE | Platform Audit | SSO audit events |
| Event Bus | REUSABLE | Platform Events | metadata events only |
| Security & Assurance evidence | REUSABLE | Security & Assurance | evidences SSO; does not own SSO |
| Secrets infrastructure | REUSABLE | Platform secrets | client secrets/certs |

## Explicit non-claims

- Customer enterprise SSO is **not** production-ready.
- Microsoft Entra Teams integration is **not** customer SSO.
- Security & Assurance V1 remains frozen and does **not** own SSO.
- Engineering OS V1 remains frozen and does **not** own SSO.
- This inventory does **not** introduce a second Identity Provider.
