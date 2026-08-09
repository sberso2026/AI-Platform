# RTB Security & Assurance Boundary

Status: Locked (Phase 14C) · Phase 15A–15E (`0.5.0-secure-compute`)  
`SecurityAndAssuranceBoundaryLocked = true` · Foundation · Isolation · AI/Data · Secure Compute ready  
Scope: Secure compute assurance observes existing execution controls; AI Trust / SIEM / TEE platform **not** implemented

## Future Security & Assurance (candidate)

- Security Control Framework / Control Catalogue
- Security Evidence
- Security Intelligence (bounded)
- Compliance Intelligence
- Security Policy Decision / Enforcement **integration** (reuse existing PDP)
- Isolation Assurance
- Artifact Integrity & Provenance (common model)
- AI Security & Trust evidence
- Data Governance
- Privileged Access Governance
- Secure Compute Assurance
- Threat Intelligence **adapters** (normalize external findings)
- Incident & Resilience Management
- Secure SDLC Assurance
- Customer Assurance / Trust Center

## MUST_NEVER_OWN / not be

| Not | Remains |
| --- | --- |
| Identity Provider | Supabase / external IdP |
| SIEM | External SOC/SIEM |
| EDR | Endpoint vendor |
| Vulnerability database | NVD/GitHub Advisories etc. |
| AI Runtime | Platform AI Runtime |
| Engineering Tool Framework | Existing ETF |
| Execution host | Controlled Engineering Execution Host |
| External auditor | ISO/SOC assessors |

## External certification boundary

| RTB artifact | Is not |
| --- | --- |
| RTB internal control certification | ≠ ISO 27001 certification |
| RTB evidence mapping | ≠ SOC 2 report |
| RTB Essential Eight applicability | ≠ external/independent assurance |

Future certification requires appropriate external assessment/certification bodies.

## Phase 14C rule

Define boundary and control mapping only. Do **not** implement Security Intelligence,
Trust Center, SIEM, or a competing Policy Engine.

## Phase 15A discovery lock

Platform-level package placement: `packages/security-assurance` at `0.1.0-discovery`.  
Detailed ownership/boundaries: `docs/security/SECURITY_ASSURANCE_ARCHITECTURE_BOUNDARIES.md`  
and `docs/security/SECURITY_ASSURANCE_OWNERSHIP_MATRIX.md`.  
Runtime remains unimplemented (`SecurityAssuranceRuntimeImplemented = false`).
