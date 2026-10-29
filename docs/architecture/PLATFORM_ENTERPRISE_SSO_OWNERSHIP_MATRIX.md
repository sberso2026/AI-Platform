# Platform Enterprise SSO Ownership Matrix

Status: **LOCKED** · Phase 16A

## Ownership lock

| Capability | OWNS | EVIDENCES / ASSESSES | MUST_NEVER_OWN |
|---|---|---|---|
| Application user identity | Platform Identity / Platform Core | Security & Assurance | Engineering OS modules |
| Authentication integration (Supabase) | Platform Identity / Platform Core | Security & Assurance | Security & Assurance |
| Session / token interpretation | Platform Identity / Platform Core | Security & Assurance | Customer IdP |
| Tenant / workspace membership | Platform Identity / Platform Core | Security & Assurance | External IdP |
| Enterprise identity federation | **Platform Identity** | Security & Assurance | Security & Assurance, Engineering OS |
| SSO configuration references | **Platform Identity** | Security & Assurance | — |
| Corporate credentials / MFA policy / CA | **External Customer IdP** | Security & Assurance (signals only) | RTB Platform |
| Privileged MFA policy (14D) | Engineering OS security-closure + Platform middleware | Security & Assurance | Customer IdP |
| Break-glass | Engineering OS security-closure | Security & Assurance | Customer IdP |
| Authorization / Policy Engine | Platform Intelligence / Core | Security & Assurance | External IdP |
| Audit | Platform Audit | Security & Assurance | — |
| Entitlements | Platform Commerce | Security & Assurance | — |
| Customer enterprise SSO production readiness (S08) | **Platform Identity** | Security & Assurance | Security & Assurance as owner |
| External penetration test (S07) | EXTERNAL_ASSURANCE / Platform Security program | Security & Assurance | Platform Identity |

## Required flags

- `platformIdentityOwnership = platform_identity`
- `customerSsoOwnership = platform_identity`
- `securityAssuranceOwnsCustomerSso = false`
- `EngineeringOsOwnsCustomerSso = false`

## UNKNOWN ownership

**None remaining**
