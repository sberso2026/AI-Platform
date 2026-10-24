# Security & Assurance Phase 15A Gap Register

Status: Ready · `SecurityAssuranceGapRegisterReady = true`

Classes: **FOUNDATION_REQUIRED** · **V1_REQUIRED** · **POST_V1** · **EXTERNAL_DEPENDENCY** ·
**EXTERNAL_ASSURANCE** · **OPTIONAL** · **NOT_APPLICABLE**

| ID | Gap | Class | Owner | Notes |
| --- | --- | --- | --- | --- |
| SA-01 | Persist SecurityControl catalogue | FOUNDATION_REQUIRED | Sec&A | Next implementation phase |
| SA-02 | Persist SecurityEvidenceReference + collectors | FOUNDATION_REQUIRED | Sec&A | No sensitive payloads |
| SA-03 | Assessment → posture pipeline | FOUNDATION_REQUIRED | Sec&A | Dimensional posture |
| SA-04 | Isolation Assurance contract + first probes | V1_REQUIRED | Sec&A + Platform | Reuse RLS/IDOR evidence |
| SA-05 | Common ArtifactIntegrityReference adoption | V1_REQUIRED | Sec&A + modules | Non-destructive |
| SA-06 | AI Trust assurance assessments | V1_REQUIRED | Sec&A + AI Runtime | Assess, don't run AI |
| SA-07 | Secure Compute assurance assessments | V1_REQUIRED | Sec&A + Exec Host | Assess, don't execute |
| SA-08 | Continuous control monitoring runtime | POST_V1 | Sec&A | After foundation |
| SA-09 | Threat intel adapters | POST_V1 | Sec&A | Normalize only |
| SA-10 | Customer Trust Center | POST_V1 / OPTIONAL | Sec&A | Approved content only |
| SA-11 | Compliance Intelligence product | POST_V1 | Sec&A | Not ISO/SOC claim engine |
| SA-12 | External pen test (S07) | EXTERNAL_ASSURANCE | Platform Security program | Tier-1 |
| SA-13 | Customer SSO (S08) | EXTERNAL_DEPENDENCY | **Platform Identity** | Not Sec&A OWNS |
| SA-14 | ISO 27001 / SOC 2 | EXTERNAL_ASSURANCE | External | Not claimed |
| SA-15 | Essential Eight maturity claim | EXTERNAL_ASSURANCE | External / corp IT | Applicability only |
| SA-16 | SIEM/EDR/SOC platform | NOT_APPLICABLE / EXTERNAL | External | MUST_NEVER_OWN |
| SA-17 | Second Policy Engine | NOT_APPLICABLE | — | Forbidden |

## Counts (selected)

| Class | Count |
| --- | --- |
| FOUNDATION_REQUIRED | 3 |
| V1_REQUIRED | 4 |
| POST_V1 | 4 |
| EXTERNAL_ASSURANCE | 3 |
| EXTERNAL_DEPENDENCY | 1 |
| NOT_APPLICABLE | 2 |
