# Security & Assurance Public Contracts — 0.4.0-ai-data-security

Status: Advanced from `0.3.0-isolation-assurance` · **Not frozen 1.0.0**

## Contracts

- DataSecurityClassification
- DataHandlingPolicyRef
- AiDataFlowRecord
- AiDataSecurityAssessment
- AiDataSecurityFinding
- ProviderDataHandlingAssessment
- SensitiveDataExposureAssessment
- AiDataSecuritySnapshot

## Semantics

- unknown classification never silently becomes public
- unknown provider never fabricated PASS
- probe error ≠ PASS
- finding ≠ incident
- no universal prompt-injection prevention claim
- no autonomous remediation
- isolation dimension preserved from Phase 15C
