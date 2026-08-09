# RTB Security & Assurance Boundary

Status: Locked (Phase 14C) · `SecurityAndAssuranceBoundaryLocked = true`  
Scope: Architecture lock only — **not** full subsystem implementation

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
