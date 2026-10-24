# RTB Security Ownership Matrix

Status: Locked (Phase 14C) · `SecurityOwnershipModelLocked = true`

Legend: **OWNS** · **ENFORCES** · **CONSUMES** · **INTEGRATES** · **EVIDENCES** · **EXTERNAL** · **RESERVED** · **MUST_NEVER_OWN**

| Concern | Platform / Kernel | Commerce | Engineering OS | Product modules | Exec Host | ETF / AI Runtime | Future Sec&Assurance | External |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Identity provider | INTEGRATES | CONSUMES | CONSUMES | CONSUMES | CONSUMES | CONSUMES | EVIDENCES | OWNS (Supabase/IdP) |
| Authentication | ENFORCES | CONSUMES | CONSUMES | CONSUMES | CONSUMES | CONSUMES | EVIDENCES | EXTERNAL |
| MFA | RESERVED/ENFORCES (gap) | CONSUMES | CONSUMES | CONSUMES | — | — | EVIDENCES | EXTERNAL IdP |
| Authorization / entitlements | INTEGRATES | OWNS | ENFORCES | CONSUMES | CONSUMES | CONSUMES | EVIDENCES | — |
| Tenant isolation / RLS | OWNS (DB policies) | ENFORCES | ENFORCES | CONSUMES | ENFORCES | CONSUMES | EVIDENCES | — |
| Workspace isolation | OWNS | ENFORCES | ENFORCES | CONSUMES | ENFORCES | CONSUMES | EVIDENCES | — |
| Policy engine | INTEGRATES | OWNS (entitlement/authz) | CONSUMES | CONSUMES | CONSUMES | CONSUMES | MUST_NEVER_OWN (second PDP) | — |
| Audit | OWNS/INTEGRATES | EVIDENCES | EVIDENCES | EVIDENCES | EVIDENCES | EVIDENCES | OWNS (future evidence) | — |
| Secrets | ENFORCES (scan) | CONSUMES | CONSUMES | CONSUMES | ENFORCES | CONSUMES | EVIDENCES | EXTERNAL secret stores |
| Encryption | INTEGRATES | — | — | — | INTEGRATES | — | EVIDENCES | EXTERNAL provider |
| Files | Platform Files OWNS | — | CONSUMES | CONSUMES | CONSUMES | — | EVIDENCES | EXTERNAL storage |
| AI provider governance | INTEGRATES | — | ORCHESTRATES | CONSUMES | — | OWNS Runtime | EVIDENCES | EXTERNAL models |
| Tool permissions | — | — | ORCHESTRATES | CONSUMES | CONSUMES | OWNS ETF | EVIDENCES | — |
| Execution host security | — | — | ORCHESTRATES | CONSUMES | OWNS | CONSUMES | EVIDENCES | Client env |
| Incident response | OWNS (platform) | EVIDENCES | EVIDENCES | EVIDENCES | EVIDENCES | EVIDENCES | OWNS (future) | — |
| Vulnerability mgmt | OWNS (process) | — | — | — | — | — | EVIDENCES | EXTERNAL advisories |
| Secure SDLC | OWNS (CI) | — | — | — | — | — | EVIDENCES | — |
| Data governance | OWNS | — | CONSUMES | CONSUMES | CONSUMES | CONSUMES | OWNS (future) | Legal/external |
| Compliance evidence | — | — | — | — | — | — | OWNS (future) | EXTERNAL auditor |
| Customer assurance | — | — | — | — | — | — | OWNS (Trust Center future) | — |
| SIEM / EDR | MUST_NEVER_OWN | — | — | — | — | — | INTEGRATES | EXTERNAL |

## UNKNOWN ownership

**None remaining** after this matrix.
