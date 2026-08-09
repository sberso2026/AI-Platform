# Engineering OS V1 Security Gap Register

Status: Phase 14C · `SecurityGapRegisterReady = true`  
Decision: `engineeringOsSecurityGaGatePassed = false` · `securityClosureRequiredBeforeGa = true`

Classes: **GA_BLOCKER** · **REQUIRED_BEFORE_GA** · **REQUIRED_BEFORE_TIER1_PRODUCTION** ·
**RECOMMENDED_POST_GA** · **EXTERNAL_ASSURANCE** · **INTENTIONALLY_EXTERNAL** · **NOT_APPLICABLE**

| ID | Control | Class | Evidence | Risk | Owner | Required action | Target | Type |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S01 | Privileged MFA for RTB prod admins / break-glass | REQUIRED_BEFORE_GA | No enforced MFA/AAL2 evidenced | Privileged account takeover | Platform Identity/Ops | Enforce MFA for privileged roles; document break-glass | pre-EOS-GA | software + ops |
| S02 | Dependency vulnerability scanning in CI | REQUIRED_BEFORE_GA | Secret-scan only; no SCA/CodeQL | Supply-chain vuln | Secure SDLC | Add minimum SCA gate on critical packages | pre-EOS-GA | software |
| S03 | Unified platform IR roles/escalation for EOS aggregate | REQUIRED_BEFORE_GA | Module IR exists; platform unified thin | Slow/unclear response | Ops/Sec | Publish unified IR covering EOS Home/search/AI/health | pre-EOS-GA | governance |
| S04 | Secret rotation / revocation procedure | REQUIRED_BEFORE_GA | Secrets in GitHub/Supabase; rotation not documented | Stale credentials | Ops | Document + exercise rotation for critical secrets | pre-EOS-GA | ops |
| S05 | Classification-aware AI/logging enforcement | REQUIRED_BEFORE_GA | Taxonomy defined in 14C; not wired | Sensitive data to providers/logs | AI Runtime / EOS | Enforce deny/minimize for ENGINEERING_SENSITIVE/RESTRICTED | pre-EOS-GA | software |
| S06 | Platform backup restore test + RPO/RTO honesty | REQUIRED_BEFORE_GA | Module bounded restore; OS-level not_tested; RPO not_defined | Unrecoverable outage | Ops | Test restore path; document known/unknown RPO/RTO without invention | pre-EOS-GA | ops |
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
| REQUIRED_BEFORE_GA | **6** (S01–S06) |
| REQUIRED_BEFORE_TIER1_PRODUCTION | **2** |
| RECOMMENDED_POST_GA | **3** |
| EXTERNAL_ASSURANCE | **3** |
| INTENTIONALLY_EXTERNAL | **1** |

## GA security decision

Because REQUIRED_BEFORE_GA items remain open:

- `engineeringOsSecurityGaGatePassed = false`
- `securityClosureRequiredBeforeGa = true`

No UNKNOWN ownership. Assessment complete ≠ gaps closed.
