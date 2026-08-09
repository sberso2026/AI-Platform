/**
 * Phase 15H V1 capability maturity taxonomy and matrix.
 * Classifications are assessment outcomes — not marketing claims.
 */

export type SecurityAssuranceMaturityClass =
  | "GA_READY"
  | "PRODUCTION_BOUNDED"
  | "RESERVED"
  | "EXTERNAL_DEPENDENCY"
  | "POST_V1"
  | "INTENTIONALLY_UNAVAILABLE";

export type SecurityAssuranceCapabilityMaturityEntry = {
  capabilityId: string;
  name: string;
  classification: SecurityAssuranceMaturityClass;
  notes: string;
};

export const SECURITY_ASSURANCE_V1_CAPABILITY_MATURITY: SecurityAssuranceCapabilityMaturityEntry[] =
  [
    {
      capabilityId: "control_registry",
      name: "Control registry",
      classification: "GA_READY",
      notes: "Phase 15B SecurityControlRegistry with lifecycle and implementation refs",
    },
    {
      capabilityId: "implementation_references",
      name: "Implementation references",
      classification: "GA_READY",
      notes: "Controls reference authoritative platform capabilities",
    },
    {
      capabilityId: "evidence_registry",
      name: "Evidence registry",
      classification: "GA_READY",
      notes: "Metadata/refs only; no sensitive payload store",
    },
    {
      capabilityId: "evidence_freshness",
      name: "Evidence freshness",
      classification: "GA_READY",
      notes: "current/stale/expired/missing; fail-closed unknown",
    },
    {
      capabilityId: "assessment",
      name: "Assessment",
      classification: "GA_READY",
      notes: "Candidate ≠ approved; no AI self-approval",
    },
    {
      capabilityId: "findings",
      name: "Findings",
      classification: "GA_READY",
      notes: "Finding ≠ incident; internal only by default",
    },
    {
      capabilityId: "exceptions",
      name: "Exceptions",
      classification: "GA_READY",
      notes: "Exception ≠ remediation; governed review",
    },
    {
      capabilityId: "posture",
      name: "Posture",
      classification: "GA_READY",
      notes: "Dimensional posture; universalScorePresent=false",
    },
    {
      capabilityId: "framework_mappings",
      name: "Framework mappings",
      classification: "PRODUCTION_BOUNDED",
      notes: "Versioned mappings; mapping ≠ compliance claim",
    },
    {
      capabilityId: "external_assurance",
      name: "External assurance",
      classification: "EXTERNAL_DEPENDENCY",
      notes: "ExternalAssuranceReference metadata only; reports externally owned",
    },
    {
      capabilityId: "isolation_assurance",
      name: "Isolation assurance",
      classification: "GA_READY",
      notes: "Phase 15C probes/assessments; observes, does not enforce",
    },
    {
      capabilityId: "ai_data_assurance",
      name: "AI/data assurance",
      classification: "GA_READY",
      notes: "Phase 15D; no system-prompt disclosure",
    },
    {
      capabilityId: "secure_compute_assurance",
      name: "Secure compute assurance",
      classification: "GA_READY",
      notes: "Phase 15E; TEE/confidential computing not claimed",
    },
    {
      capabilityId: "compliance_intelligence",
      name: "Compliance intelligence",
      classification: "PRODUCTION_BOUNDED",
      notes: "Phase 15F mapping/assessment; not certification authority",
    },
    {
      capabilityId: "customer_assurance",
      name: "Customer assurance",
      classification: "PRODUCTION_BOUNDED",
      notes: "Phase 15G approved disclosure; not public Trust Center",
    },
    {
      capabilityId: "controlled_disclosure",
      name: "Controlled disclosure",
      classification: "GA_READY",
      notes: "Disclosure policy + audit; fail-closed unknown classification",
    },
    {
      capabilityId: "questionnaire_mapping",
      name: "Questionnaire mapping",
      classification: "PRODUCTION_BOUNDED",
      notes: "Approved claim/doc refs only; no invented AI responses",
    },
    {
      capabilityId: "customer_assurance_packages",
      name: "Customer assurance packages",
      classification: "PRODUCTION_BOUNDED",
      notes: "Versioned immutable published packages; tenant isolation",
    },
    {
      capabilityId: "continuous_control_monitoring",
      name: "Continuous control monitoring",
      classification: "POST_V1",
      notes: "Architecture reserved; not required for V1 subsystem GA",
    },
    {
      capabilityId: "threat_intelligence_adapters",
      name: "Threat intelligence adapters",
      classification: "POST_V1",
      notes: "Normalize external findings only; no SIEM ownership",
    },
    {
      capabilityId: "public_trust_center",
      name: "Public Trust Center",
      classification: "INTENTIONALLY_UNAVAILABLE",
      notes: "CustomerTrustCenterImplemented=false for V1",
    },
    {
      capabilityId: "siem_soar_edr",
      name: "SIEM / SOAR / EDR",
      classification: "INTENTIONALLY_UNAVAILABLE",
      notes: "MUST_NEVER_OWN",
    },
  ];

export function countMaturityByClass(): Record<SecurityAssuranceMaturityClass, number> {
  const counts: Record<SecurityAssuranceMaturityClass, number> = {
    GA_READY: 0,
    PRODUCTION_BOUNDED: 0,
    RESERVED: 0,
    EXTERNAL_DEPENDENCY: 0,
    POST_V1: 0,
    INTENTIONALLY_UNAVAILABLE: 0,
  };
  for (const e of SECURITY_ASSURANCE_V1_CAPABILITY_MATURITY) {
    counts[e.classification] += 1;
  }
  return counts;
}
