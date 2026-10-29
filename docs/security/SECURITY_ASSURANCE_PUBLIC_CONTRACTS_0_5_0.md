# Security Assurance Public Contracts — 0.5.0-secure-compute

Version: `0.5.0-secure-compute` (not frozen 1.0.0)

## Contracts

- `SecureComputePlane`
- `WorkloadIdentity`
- `ExecutionSecurityContext`
- `ComputeControlEvidence`
- `RuntimeIsolationAssessment`
- `ExecutionAuthorizationAssessment`
- `ExecutionIntegrityAssessment`
- `SecureComputeFinding`
- `SecureComputeAssessment`
- `SecureComputeSnapshot`

## Semantics

- Missing identity never PASS
- Probe error never PASS (`fallbackToPassForbidden`)
- Findings ≠ incidents
- No fabricated integrity / confidential-computing / TEE claims without evidence
- Unsupported controls → `not_applicable` / `not_assessed`, never silent PASS
- Assurance ≠ enforcement; no autonomous remediation
