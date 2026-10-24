# Security & Assurance Phase 15F — Compliance Intelligence Foundation

Status: Compliance Intelligence · Version `0.6.0-compliance-intelligence` · Contracts `0.6.0-compliance-intelligence`

## Baseline

- Phase 15E: `aa5150fc4acf287b50c973220c40d62b7f91687f` / hosted `31305116039`
- Phase 15D: `ef8efd2b4b30082e9c26ac867c65c51e3e39d207`
- Engineering OS V1 remains frozen at `1.0.0` / `engineering-os-v1.0.0`

## Implemented

- ComplianceIntelligenceEngine (framework registry, mapping, assessment, gaps)
- Frameworks: ISO/IEC 27001:2022 · NIST CSF 2.0 · Essential Eight · SOC 2 TSC scaffold
- Many-to-many RTB control ↔ requirement mappings (reuse FrameworkMappingRegistry)
- Evidence freshness / stale handling · external-assurance markers
- Migration `batch_94` with RLS on tenant assessments
- Admin UI marker `security-assurance-compliance-ready`
- Events `security_assurance.compliance.*` · review `security_assurance.compliance_review`

## Ownership

Sec&A owns compliance intelligence contracts, framework registry, mappings, assessments, gaps.  
Reuses Security Control Registry, SecurityEvidenceRegistry, FrameworkMappingRegistry,
Isolation / AI-data / Secure Compute assurance, Policy Engine, Audit, Workflow, Event Bus.

## Claim safety

Does **not** claim ISO certification, SOC 2 compliance, Essential Eight pass, or NIST compliance.  
Permitted: supported / partially_supported / unsupported / unknown / not_assessed /
not_applicable / requires_external_assurance.

## Not implemented

Automatic certification · Trust Center · GRC replacement · SIEM · Threat Intelligence ·
AI Trust · regulator submission · audit opinion generation · automatic remediation
