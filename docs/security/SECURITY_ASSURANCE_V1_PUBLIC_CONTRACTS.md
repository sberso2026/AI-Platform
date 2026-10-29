# Security & Assurance V1 Public Contracts

Status: **FROZEN** · Public contract version `1.0.0` · Phase 15I  
`SecurityAssurancePublicContractsVersion = 1.0.0` · `SecurityAssurancePublicContractsFrozen = true`

## Scope

Frozen customer/platform-facing contracts for Security & Assurance V1.0.
Private implementation internals are **not** public contracts.

## Core

- SecurityControlReference
- SecurityFrameworkReference
- SecurityRequirement
- ControlImplementationReference
- SecurityEvidenceReference
- SecurityAssessment
- SecurityFinding
- SecurityException
- SecurityPostureSnapshot
- ComplianceMapping
- ExternalAssuranceReference

## Isolation Assurance

- IsolationProbeReference
- IsolationProbeRun
- IsolationAssessment
- IsolationFindingReference
- IsolationAssuranceSnapshot

## AI / Data & Secure Compute

Bounded AI/Data assurance references and Secure Compute assurance references
(Phase 15D / 15E contracts retained under V1 freeze).

## Customer Assurance

- CustomerAssuranceProfile
- AssuranceDisclosurePolicy
- AssuranceClaimReference
- AssuranceDocumentReference
- CustomerAssurancePackage
- CustomerSecurityQuestionnaireResponseReference
- AssuranceDisclosureRecord

## V1 invariants

control defined ≠ implemented · implemented ≠ effective · evidence present ≠ sufficient ·
stale ≠ current · mapping ≠ certification · finding ≠ incident · exception ≠ remediation ·
posture ≠ certification · customer assurance ≠ certification · absence → unknown ·
unknown disclosure → fail closed

## Freeze policy

Do not mutate these contracts silently. Post-V1 extensions require a new major/minor
contract version under governed change control.
