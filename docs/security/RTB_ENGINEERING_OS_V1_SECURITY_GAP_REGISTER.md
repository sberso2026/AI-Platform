# Engineering OS V1 Security Gap Register

Status: Phase 14D · `SecurityGapRegisterReady = true`  
Decision: `engineeringOsSecurityGaGatePassed = true` · `securityClosureRequiredBeforeGa = false`

Classes: **GA_BLOCKER** · **REQUIRED_BEFORE_GA** · **REQUIRED_BEFORE_TIER1_PRODUCTION** ·
**RECOMMENDED_POST_GA** · **EXTERNAL_ASSURANCE** · **INTENTIONALLY_EXTERNAL** · **NOT_APPLICABLE** · **CLOSED**

| ID | Control | Class | Evidence | Risk | Owner | Required action | Target | Type |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S01 | Privileged MFA for RTB prod admins / break-glass | **CLOSED** | `privileged-mfa.ts`, middleware hook, break-glass audit module, `RTB_PRIVILEGED_MFA_AND_BREAK_GLASS.md` | Privileged account takeover | Platform Identity/Ops | — | pre-EOS-GA | software + ops |
| S02 | Dependency vulnerability scanning in CI | **CLOSED** | `run-dependency-sca.ts`, SCA policy, exceptions, CI workflow | Supply-chain vuln | Secure SDLC | — | pre-EOS-GA | software |
| S03 | Unified platform IR roles/escalation for EOS aggregate | **CLOSED** | `RTB_UNIFIED_INCIDENT_RESPONSE.md`, runbook, IR-FIX fixtures | Slow/unclear response | Ops/Sec | — | pre-EOS-GA | governance |
| S04 | Secret rotation / revocation procedure | **CLOSED** | `RTB_SECRET_LIFECYCLE_AND_ROTATION.md` + secret-scan | Stale credentials | Ops | — | pre-EOS-GA | ops |
| S05 | Classification-aware AI/logging enforcement | **CLOSED** | `classification-ai-policy.ts`, `sensitive-logging.ts` | Sensitive data to providers/logs | AI Runtime / EOS | — | pre-EOS-GA | software |
| S06 | Platform backup restore test + RPO/RTO honesty | **CLOSED** | restore fixture certification, runbook; RPO `DEFINED_NOT_TESTED`, RTO `MEASURED` | Unrecoverable outage | Ops | — | pre-EOS-GA | ops |
| S07 | External penetration test | REQUIRED_BEFORE_TIER1_PRODUCTION | No pen-test report in repo | Residual unknown vulns | Sec/Ops | Independent test before Tier-1 customers | pre-Tier1 | assurance |
| S08 | Customer SSO (OIDC/SAML) GA | REQUIRED_BEFORE_TIER1_PRODUCTION | Teams/Entra bounded; not universal SSO | Enterprise onboarding block | Identity | Productize SSO | pre-Tier1 | software |
| S09 | ISO 27001 certification | EXTERNAL_ASSURANCE | Not certified | Assurance questionnaires | Sec/Compliance | External certification program | post-GA | external |
| S10 | SOC 2 report | EXTERNAL_ASSURANCE | Not assured | Assurance questionnaires | Sec/Compliance | External audit program | post-GA | external |
| S11 | Essential Eight maturity claim | EXTERNAL_ASSURANCE / NOT_APPLICABLE (partial) | Applicability assessed; maturity not claimed | Misrepresentation risk | Sec | Keep truthful applicability; corporate IT owns some controls | ongoing | governance |
| S12 | SIEM/EDR/SOC platform | INTENTIONALLY_EXTERNAL | Boundary locked | Detection depth | External SOC | Integrate later; do not build SIEM | post-GA | external |
| S13 | Customer Trust Center | RECOMMENDED_POST_GA | Reserved | Sales enablement | Sec&Assurance | Build after control evidence stable | post-GA | software |
| S14 | SBOM / signed build provenance | RECOMMENDED_POST_GA | Missing | Supply-chain assurance | Secure SDLC | Add when tooling ready | post-GA | software |
| S15 | Prompt-injection advanced defenses | RECOMMENDED_POST_GA | Bounded controls | AI abuse | AI Runtime | Harden iteratively | post-GA | software |

## Counts

| Class | Count |
| --- | --- |
| GA_BLOCKER | **0** |
| REQUIRED_BEFORE_GA open | **0** |
| REQUIRED_BEFORE_GA CLOSED (S01–S06) | **6** |
| REQUIRED_BEFORE_TIER1_PRODUCTION | **2** |
| RECOMMENDED_POST_GA | **3** |
| EXTERNAL_ASSURANCE | **3** |
| INTENTIONALLY_EXTERNAL | **1** |

## GA security decision

Because REQUIRED_BEFORE_GA open = 0 and GA_BLOCKER = 0:

- `engineeringOsSecurityGaGatePassed = true`
- `securityClosureRequiredBeforeGa = false`

Still: `productionEngineeringOSReady = false` · `engineeringOSV1GaCertified = false`  
Pre-GA security gate ≠ Engineering OS V1 GA ≠ ISO/SOC2.
