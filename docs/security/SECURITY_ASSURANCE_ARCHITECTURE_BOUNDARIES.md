# Security & Assurance Architecture Boundaries

Status: Locked · `SecurityAssuranceBoundaryLocked = true` · Phase 15A  
Package placement: `packages/security-assurance` (Platform level — not Engineering OS)

## Policy / Zero Trust

- Existing Platform Policy Engine remains authoritative PDP
- PEP remains at API/middleware/commerce/AI/host boundaries
- `duplicatePolicyEngineDetected = false`
- No `SecurityPolicyEngine`

## Isolation Assurance (future contracts)

Centralized verification of: database · RLS · API · files · search · KG · AI retrieval ·
jobs · events · execution hosts · solver workspaces · cache  
Reuses module gates; does not replace RLS/authz.

## Artifact Integrity

Common conceptual `ArtifactIntegrityReference` (hash, lineage, status, classification).  
hash ≠ signature · signature ≠ engineering approval · provenance ≠ domain authority.  
No universal rehashing in 15A.

## AI Security & Trust

Sec&A assesses provider compliance, provenance evidence, classification policy status,
AI incidents/posture.  
MUST_NEVER: run models, own prompts/tools, certify engineering conclusions.  
`implementsOwnAiStack = false` preserved.

## Secure Compute Assurance

Assesses host/provider posture, isolation evidence, version integrity, attestation (future).  
MUST_NEVER become Execution Host or Tool Framework.

## Privileged Access

Evidences Phase 14D MFA/break-glass; no new PAM product in 15A.

## Data Governance boundary

**Adjacent Platform Governance domain owns** data-governance policy/legal statements.  
Security & Assurance **EVIDENCES / ORCHESTRATES** classification-related security controls.  
Taxonomy remains: PUBLIC · INTERNAL · CLIENT_CONFIDENTIAL · ENGINEERING_SENSITIVE · RESTRICTED.  
`DataGovernanceBoundaryLocked = true`

## Secure SDLC

DevOps/Engineering owns CI execution; Sec&A assesses/evidences.  
`SecureSdlcAssuranceBoundaryLocked = true`

## Threat Intelligence

Adapter-only normalization; not a TI database.  
`ThreatIntelligenceBoundaryLocked = true`

## Incident & Resilience

Ops owns response; Sec&A links findings ↔ incidents ↔ control changes. No SIEM/SOAR.

## Backup Assurance

Ops/provider own backups; Sec&A tracks restore evidence freshness/scope.

## External integrations

IdP · SIEM · EDR · scanners · pen-test providers · auditors → consume normalized evidence only.

## Customer Assurance / Trust Center

Approved public surfaces only; no internal vulns. Not implemented in 15A.  
`CustomerAssuranceBoundaryLocked = true` · `CustomerTrustCenterImplemented = false`

## External assurance

RTB control status ≠ ISO/SOC2/E8 independent opinion.  
`ExternalAssuranceBoundaryLocked = true`

## Platform reuse locks

| System | Rule |
| --- | --- |
| Knowledge Graph | CONSUMES shared Platform KG — no Security KG |
| Workflow | Reuse Platform Workflow Engine |
| Files | Reuse Platform Files for evidence artifacts |
| Events | Conceptual `security.*` taxonomy — no second Event Bus |

## Commercial boundary

Baseline tenant isolation and platform security are **not** optional premium SKUs.  
Future premium: advanced assurance reporting / custom mappings / evidence exports.
