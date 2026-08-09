/**
 * Public contracts — 0.2.0-control-evidence (not frozen 1.0.0).
 */

export type ControlLifecycle = "draft" | "active" | "deprecated" | "retired";

export type EvidenceStatus =
  | "current"
  | "stale"
  | "expired"
  | "missing"
  | "invalid"
  | "conflicting"
  | "unknown";

export type EvidenceSourceCategory =
  | "platform_runtime"
  | "identity"
  | "policy"
  | "audit"
  | "ci"
  | "dependency_scan"
  | "secret_scan"
  | "backup_restore"
  | "execution_host"
  | "ai_runtime"
  | "manual_governed"
  | "external_assurance"
  | string;

export type AssessmentResult =
  | "pass"
  | "partial"
  | "fail"
  | "not_applicable"
  | "unknown";

export type FindingState =
  | "open"
  | "accepted"
  | "remediation_planned"
  | "remediated"
  | "closed"
  | "false_positive";

export type FindingSeverity =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "informational"
  | "unknown";

export type PostureDimensionStatus =
  | "assured"
  | "supported"
  | "partial"
  | "at_risk"
  | "insufficient_evidence"
  | "unknown";

export type PostureDimensionId =
  | "identity"
  | "isolation"
  | "data_protection"
  | "ai_security"
  | "secure_compute"
  | "secure_sdlc"
  | "incident_readiness"
  | "recovery"
  | "compliance_evidence";

export type FrameworkId =
  | "ISO27001"
  | "NIST_CSF_2"
  | "ESSENTIAL_EIGHT"
  | "SOC2_TSC_RESERVED";

export type SecurityControl = {
  controlId: string;
  title: string;
  objective: string;
  category: string;
  lifecycle: ControlLifecycle;
  ownerDomain: "security_assurance" | "platform_core" | "ops" | "external";
  /** control defined ≠ control implemented */
  definedOnly?: boolean;
};

export type ControlImplementationReference = {
  implementationId: string;
  controlId: string;
  owner: string;
  capabilityRef: string;
  version: string;
  scope: string;
  /** Points to authoritative Platform capability — no duplicated logic */
  authoritative: true;
};

export type SecurityFrameworkReference = {
  frameworkId: FrameworkId;
  themeOrControlRef: string;
  note?: string;
};

export type SecurityRequirement = {
  requirementId: string;
  controlId: string;
  statement: string;
};

export type SecurityEvidenceReference = {
  evidenceId: string;
  controlId: string;
  sourceType: EvidenceSourceCategory;
  sourceRef: string;
  scope: string;
  tenantId?: string;
  workspaceId?: string;
  collector: string;
  collectedAt: string;
  effectiveAt: string;
  expiresAt?: string;
  freshness: EvidenceStatus;
  integrityRef?: string;
  classification:
    | "PUBLIC"
    | "INTERNAL"
    | "CLIENT_CONFIDENTIAL"
    | "ENGINEERING_SENSITIVE"
    | "RESTRICTED";
  provenance: {
    observed: true;
    inferred: false;
    fabricated: false;
    sourceCategory: EvidenceSourceCategory;
  };
  limitations?: string;
  status: EvidenceStatus;
  /** Never duplicate sensitive payloads */
  containsSensitivePayload: false;
  platformFileRef?: string;
};

export type SecurityAssessment = {
  assessmentId: string;
  controlId: string;
  scope: string;
  result: AssessmentResult;
  evidenceRefs: string[];
  assessmentMethod: "automated_candidate" | "human_governed" | "reproducible_rule";
  assessedAt: string;
  limitations?: string;
  reviewStatus: "candidate" | "pending_review" | "approved" | "rejected";
  provenance: {
    reproducibleFromEvidence: boolean;
    aiSelfApproval: false;
    governedReviewRequired: boolean;
  };
  reviewedBy?: string;
  reviewedAt?: string;
};

export type SecurityFinding = {
  findingId: string;
  controlId?: string;
  severity: FindingSeverity;
  state: FindingState;
  source: string;
  summary: string;
  normalizedAt: string;
  /** finding ≠ incident */
  isIncident: false;
  containsSensitivePayload: false;
};

export type SecurityException = {
  exceptionId: string;
  controlRef: string;
  scope: string;
  reason: string;
  owner: string;
  approvedBy: string;
  approvedAt: string;
  expiresAt: string;
  reviewStatus: "active" | "expired" | "revoked" | "pending_review";
  /** exception ≠ remediation; AI cannot approve */
  aiApproved: false;
  permanentImplicit: false;
};

export type PostureDimension = {
  dimensionId: PostureDimensionId;
  status: PostureDimensionStatus;
  supportingControlIds: string[];
  evidenceCompleteness: "complete" | "partial" | "missing" | "unknown";
  freshness: EvidenceStatus;
  findingIds: string[];
  limitations?: string;
  /** assured ≠ external certification */
  externalCertificationImplied: false;
};

export type SecurityPostureSnapshot = {
  snapshotId: string;
  capturedAt: string;
  scope: string;
  dimensions: PostureDimension[];
  universalScorePresent: false;
  universalNumericScore: null;
};

export type ComplianceMapping = {
  mappingId: string;
  controlId: string;
  frameworkId: FrameworkId;
  frameworkRequirementRef: string;
  mappingNote?: string;
  /** frameworkMapped ≠ certified */
  certified: false;
};

export type ExternalAssuranceReference = {
  assuranceId: string;
  type:
    | "penetration_test"
    | "iso_certification"
    | "soc_report"
    | "essential_eight_assessment"
    | "customer_audit"
    | "other_independent";
  status: "not_obtained" | "in_progress" | "obtained" | "expired";
  referenceRef?: string;
  isExternalOpinion: true;
  generatedBySecurityAssurance: false;
};

export const SECURITY_ASSURANCE_CONTRACT_NAMES = [
  "SecurityControl",
  "ControlImplementationReference",
  "SecurityFrameworkReference",
  "SecurityRequirement",
  "SecurityEvidenceReference",
  "SecurityAssessment",
  "SecurityFinding",
  "SecurityException",
  "SecurityPostureSnapshot",
  "ComplianceMapping",
  "ExternalAssuranceReference",
] as const;

export const POSTURE_DIMENSION_IDS: PostureDimensionId[] = [
  "identity",
  "isolation",
  "data_protection",
  "ai_security",
  "secure_compute",
  "secure_sdlc",
  "incident_readiness",
  "recovery",
  "compliance_evidence",
];
