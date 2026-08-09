# Security Assurance Public Contracts — 0.6.0-compliance-intelligence

Version: `0.6.0-compliance-intelligence` (not frozen 1.0.0)

## Contracts

- `ComplianceFramework`
- `ComplianceFrameworkVersion`
- `ComplianceRequirement`
- `ComplianceControlMapping`
- `ComplianceEvidenceMapping`
- `ComplianceAssessment`
- `ComplianceGap`
- `ComplianceFinding`
- `ComplianceSnapshot`
- `ExternalAssuranceRequirement`

## Semantics

- Mapping ≠ certification
- Unknown never silently becomes supported
- Sole mapped control never alone proves compliance
- Internal evidence cannot satisfy external-only requirements
- Stale evidence affects assessment
- Gaps ≠ incidents
- No automatic certification / compliance claims / remediation
