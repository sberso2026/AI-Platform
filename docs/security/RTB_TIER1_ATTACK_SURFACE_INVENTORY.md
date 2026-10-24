# RTB Tier-1 Attack Surface Inventory

**Phase:** 16C  
**Version:** `0.3.0-pen-test-readiness`  
**Authoritative code mirror:** `packages/platform-identity/src/domain/pen-test-readiness.ts`

## Classification legend

| Class | Meaning |
|---|---|
| IN_SCOPE | Authorized for independent external testing under RoE |
| OUT_OF_SCOPE | Not authorized unless separate written addendum |
| EXTERNAL_PROVIDER | May be interacted with; RTB does not own the provider product |
| NOT_APPLICABLE | Not an RTB product surface for this engagement |

## Inventory

| Surface | Classification | Notes |
|---|---|---|
| Public web application | IN_SCOPE | Customer/admin UI |
| Authentication endpoints | IN_SCOPE | Local + SSO entry |
| Enterprise SSO/OIDC flows | IN_SCOPE | Phase 16B production path |
| Password/local auth paths | IN_SCOPE | Where TenantSsoPolicy allows |
| MFA flows | IN_SCOPE | Local privileged MFA + federated assurance |
| Privileged/admin surfaces | IN_SCOPE | Owner/platform_admin |
| Tenant/workspace APIs | IN_SCOPE | RLS + membership |
| Files/storage | IN_SCOPE | Platform Files authorization |
| Search | IN_SCOPE | Tenant-scoped |
| AI endpoints | IN_SCOPE | Tool Framework authorization |
| Engineering OS | IN_SCOPE | Frozen V1 still in security scope |
| Security & Assurance | IN_SCOPE | Internal vs customer separation |
| Module APIs (six frozen modules) | IN_SCOPE | Security testing of frozen surfaces |
| Digital Twin | IN_SCOPE | Control-plane APIs |
| Engineering Model Interoperability | IN_SCOPE | Federation/import control plane |
| Controlled Engineering Execution Host | IN_SCOPE | Job auth / isolation |
| Solver job interfaces | IN_SCOPE | Control plane; live solvers optional |
| Webhooks / public callbacks | IN_SCOPE | If present in test env |
| Background-job public callbacks | IN_SCOPE | If exposed |
| Administration | IN_SCOPE | Role tiers |
| Commerce/entitlement endpoints | IN_SCOPE | Server-side entitlements |
| Supabase | EXTERNAL_PROVIDER | Config vs provider defect |
| Microsoft Entra | EXTERNAL_PROVIDER | Corporate CA/MFA externally owned |
| Vercel / cloud hosting | EXTERNAL_PROVIDER | Platform hosting |
| AI providers | EXTERNAL_PROVIDER | Provider vs RTB config |
| Commercial solver hosts | EXTERNAL_PROVIDER | Client-owned solvers |
| Physical security | OUT_OF_SCOPE | Not authorized |
| Employee social engineering / phishing | OUT_OF_SCOPE | Unless separately authorized |
| Uncontrolled DoS / destructive DB | OUT_OF_SCOPE | Prohibited |
| Public Trust Center | NOT_APPLICABLE | Intentionally unavailable |
| SIEM/SOAR/EDR product | NOT_APPLICABLE | Not an RTB product |

## External dependency boundary

When a finding involves an external provider:

1. Determine whether the root cause is **RTB configuration / integration** or **provider-owned defect**.
2. Report both the technical issue and ownership boundary.
3. Do not require RTB to “fix” provider-owned platform bugs; track coordination separately.
