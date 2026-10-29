# Security & Assurance Phase 15A — Existing Control Inventory

Status: Discovery · `0.1.0-discovery`  
Classification: **AUTHORITATIVE_EXISTING** · **REUSABLE** · **SECURITY_ASSURANCE_CONSUMER** ·
**SECURITY_ASSURANCE_EVIDENCE_SOURCE** · **RESERVED** · **MISSING** · **EXTERNAL**

Baseline: Engineering OS V1.0 GA `3bfc024…` / tag `engineering-os-v1.0.0`.  
S01–S06 CLOSED (Phase 14D). S07/S08 remain Tier-1.

| Capability | Classification | Owner today | Notes |
| --- | --- | --- | --- |
| Supabase Auth / JWT sessions | AUTHORITATIVE_EXISTING | Platform Core / IdP | No second IdP |
| Privileged MFA + break-glass (S01) | AUTHORITATIVE_EXISTING | Platform Identity + EOS security-closure | Fail-closed for privileged prod paths |
| Customer SSO (OIDC/SAML) | MISSING / EXTERNAL | Platform Identity | S08 Tier-1 |
| Entitlements / Commerce authz | AUTHORITATIVE_EXISTING | Platform Commerce | Not Sec&A owned |
| Platform Policy Engine | AUTHORITATIVE_EXISTING / REUSABLE | Platform Intelligence | PDP; Sec&A CONSUMES |
| RLS / tenant isolation | AUTHORITATIVE_EXISTING | Platform DB + modules | Evidence source for Isolation Assurance |
| Workspace isolation / IDOR certs | AUTHORITATIVE_EXISTING | Module cert packages | Evidence source |
| Audit events | AUTHORITATIVE_EXISTING | Platform Core Audit | No second audit system |
| Platform Files | AUTHORITATIVE_EXISTING | Platform Files | Evidence blob store reuse |
| Secrets management service | AUTHORITATIVE_EXISTING | Platform Intelligence | Lifecycle ops (S04) |
| Secret CI scan | AUTHORITATIVE_EXISTING / EVIDENCE_SOURCE | Secure SDLC | |
| Dependency SCA (S02) | AUTHORITATIVE_EXISTING / EVIDENCE_SOURCE | Secure SDLC | pnpm audit CI |
| AI Runtime / registries | AUTHORITATIVE_EXISTING | Platform Intelligence | implementsOwnAiStack=false |
| Classification-aware AI/logging (S05) | AUTHORITATIVE_EXISTING | EOS security-closure + AI Runtime | Fail-closed |
| Engineering Tool Framework | AUTHORITATIVE_EXISTING | ETF | MUST_NEVER_OWN by Sec&A |
| Controlled Execution Host | AUTHORITATIVE_EXISTING | Execution Host | MUST_NEVER_OWN by Sec&A |
| Client-owned solver architecture | AUTHORITATIVE_EXISTING | Interop / ETF / Host | |
| Unified IR + runbooks (S03) | AUTHORITATIVE_EXISTING | Ops / Sec program | Sec&A evidences later |
| Backup/restore + RPO/RTO honesty (S06) | AUTHORITATIVE_EXISTING / EVIDENCE_SOURCE | Ops + providers | |
| Data classification taxonomy | REUSABLE | Platform Governance (adjacent) | PUBLIC…RESTRICTED |
| Observability / correlation ids | REUSABLE | Platform Intelligence | Bounded metadata |
| Module threat models / cert gates | EVIDENCE_SOURCE | Module owners | |
| Penetration testing | MISSING / EXTERNAL | External program | S07 |
| ISO / SOC2 / E8 maturity | EXTERNAL | External assessors | Not claimed |
| SIEM / EDR / SOC | EXTERNAL | External | Integration only |
| Threat intel databases | EXTERNAL | NVD/GitHub/etc. | Adapter only |
| Customer Trust Center | RESERVED | Future Sec&A surface | Not implemented |
| Security Control Catalogue runtime | RESERVED / MISSING | Future Sec&A OWNS | 15A defines model |
| Continuous control monitoring | RESERVED | Future Sec&A | Architecture only |
| Isolation Assurance engine | RESERVED | Future Sec&A | Contracts only |

## Strengths

Repeated JWT/RLS/IDOR/entitlement certification; Phase 14D security closures;
shared AI Runtime; singular Policy Engine / ETF / Execution Host.
