# RTB Enterprise Security — Existing Control Inventory

Status: Phase 14C assessment · `0.11.0-security-readiness`  
Classification: implemented · implemented_bounded · manual · external_provider · reserved · missing · unknown

| Control area | Status | Evidence (paths) |
| --- | --- | --- |
| Authentication (Supabase Auth / JWT) | implemented_bounded | Platform API auth middleware; module cert JWT gates |
| MFA (customer / privileged) | missing / unknown | No product-enforced MFA/AAL2 gates evidenced in repo |
| SSO / Entra readiness | implemented_bounded | Teams Graph / Entra integration for PI meetings (`docs/security/PROJECT_INTELLIGENCE_TEAMS_*`) — not universal SSO |
| Session / token verification | implemented | Commerce authorization verify (`packages/platform-commerce/src/domain/commerce-execution-context.ts`) |
| RLS tenant isolation | implemented | Commerce + Engineering migrations; cert gates across modules |
| Workspace isolation | implemented_bounded | Workspace-scoped policies + cert IDOR matrices |
| IDOR negative tests | implemented | Phase cert packages (PI/II/AI/PC/DT/Interop/EOS) |
| Entitlements / authorization | implemented | `@rtb/platform-commerce` policies; `assertEngineeringService` |
| Policy decision reuse | implemented_bounded | Commerce service assertions / entitlement engine — reused, not second PDP |
| Audit logging | implemented_bounded | Module/platform audit events; retention/tamper resistance not fully formalized |
| Secret scanning (CI cert) | implemented | Cert `secret-scan` scripts; phase workflows |
| Production secrets (GitHub/hosting) | external_provider | GitHub Actions secrets; Supabase project secrets |
| TLS in transit | external_provider | Hosting/CDN/Supabase TLS |
| DB encryption at rest | external_provider | Supabase-managed (assumed; not RTB-managed KMS evidenced) |
| Object/file encryption | external_provider / implemented_bounded | Platform Files via provider storage |
| Backup encryption | unknown / external_provider | Provider backups; RTB restore tests module-scoped |
| AI Runtime security | implemented_bounded | Shared AI framework; `implementsOwnAiStack=false`; provider policy patterns |
| Prompt / tool authorization | implemented_bounded | Tool registry + human approval capabilities |
| Execution host sandbox | implemented_bounded | `@rtb/engineering-execution-host` isolation, timeout, no silent fallback |
| Solver license security | implemented_bounded | Client-owned commercial solver architecture; no license bypass |
| Module threat models | implemented_bounded | `docs/security/INSPECTION_*`, PI privacy docs |
| Module incident runbooks | implemented_bounded | `docs/runbooks/*_INCIDENT_RESPONSE.md`, commerce IR |
| Platform-wide IR baseline | missing → assessed in 14C | Created `RTB_SECURITY_INCIDENT_RESPONSE_BASELINE.md` |
| Dependency SCA / CodeQL | missing | Secret-scan present; no SCA/SAST workflow evidenced |
| SBOM / build provenance | missing | Not evidenced |
| Penetration testing | missing | No documented external/internal pen-test report |
| ISO 27001 / SOC 2 | external / missing | Not claimed; boundary locked |
| Essential Eight maturity | missing (applicability assessed) | Corporate vs SaaS applicability documented in 14C |
| Customer Trust Center | reserved | Boundary only |
| SIEM / EDR / SOC | intentionally_external | Integration boundary only |

## Strengths

Repeated certification of JWT, RLS, tenant/workspace isolation, IDOR, entitlements,
secret-scan, fail-closed solvers/hosts, and module threat/IR docs.

## Critical unknowns closed by assessment

- Encryption paths classified as provider-managed where evidenced.
- MFA/SSO and SCA marked missing rather than assumed.
