/**
 * Phase 15F Compliance Intelligence public contracts — 0.6.0-compliance-intelligence.
 * Not frozen 1.0.0. Mapping/assessment only — does not claim certification or audit opinions.
 */

export type ComplianceFrameworkId =
  | "ISO27001_2022"
  | "NIST_CSF_2_0"
  | "ESSENTIAL_EIGHT"
  | "SOC2_TSC";

export type ComplianceSupportStatus =
  | "supported"
  | "partially_supported"
  | "unsupported"
  | "unknown"
  | "not_assessed"
  | "not_applicable"
  | "requires_external_assurance";

export type ComplianceFramework = {
  frameworkId: ComplianceFrameworkId;
  name: string;
  publisher: string;
  /** Short identifier/description only — no copyrighted standard reproduction */
  description: string;
  status: "active" | "draft" | "retired";
};

export type ComplianceFrameworkVersion = {
  frameworkVersionId: string;
  frameworkId: ComplianceFrameworkId;
  versionLabel: string;
  publishedYear?: number;
  provenanceRef: string;
  registeredAt: string;
};

export type ComplianceRequirement = {
  requirementId: string;
  frameworkId: ComplianceFrameworkId;
  frameworkVersionId: string;
  /** Short ref/code only */
  requirementCode: string;
  title: string;
  requiresExternalAssurance: boolean;
  externalAssuranceTypes?: Array<
    | "penetration_testing"
    | "external_audit"
    | "certification_body"
    | "independent_attestation"
    | "legal_regulatory"
    | "vendor_customer_evidence"
  >;
  notApplicableAllowed: boolean;
};

export type ComplianceControlMapping = {
  mappingId: string;
  requirementId: string;
  controlId: string;
  frameworkId: ComplianceFrameworkId;
  /** Many-to-many; one control never alone proves compliance */
  soleControlInfersCompliance: false;
  certified: false;
};

export type ComplianceEvidenceMapping = {
  evidenceMappingId: string;
  requirementId: string;
  controlId: string;
  evidenceId: string;
  freshness: "current" | "stale" | "missing" | "unknown";
  evidenceQuality: "adequate" | "weak" | "missing" | "unknown";
  observedAt: string;
  assessorSource: string;
  frameworkVersionId: string;
  provenanceRef: string;
};

export type ExternalAssuranceRequirement = {
  externalRequirementId: string;
  requirementId: string;
  assuranceType:
    | "penetration_testing"
    | "external_audit"
    | "certification_body"
    | "independent_attestation"
    | "legal_regulatory"
    | "vendor_customer_evidence";
  status: "absent" | "in_progress" | "obtained" | "expired";
  /** Internal evidence alone never satisfies */
  internalEvidenceCannotSatisfy: true;
};

export type ComplianceAssessment = {
  assessmentId: string;
  requirementId: string;
  frameworkId: ComplianceFrameworkId;
  frameworkVersionId: string;
  controlIds: string[];
  evidenceRefs: string[];
  status: ComplianceSupportStatus;
  freshness: "current" | "stale" | "missing" | "unknown";
  assessorSource: string;
  observedAt: string;
  limitations?: string;
  reviewStatus: "candidate" | "pending_review" | "approved" | "rejected";
  governedReviewAction: "security_assurance.compliance_review";
  /** Never a global certification claim */
  certificationClaimed: false;
};

export type ComplianceGap = {
  gapId: string;
  frameworkId: ComplianceFrameworkId;
  requirementId: string;
  missingOrWeakControlIds: string[];
  missingOrStaleEvidenceIds: string[];
  severity: "critical" | "high" | "medium" | "low" | "informational";
  priority: "p0" | "p1" | "p2" | "p3";
  externalAssuranceDependency: boolean;
  recommendedHumanAction: string;
  isIncident: false;
};

export type ComplianceFinding = {
  findingId: string;
  frameworkId: ComplianceFrameworkId;
  requirementId: string;
  severity: "critical" | "high" | "medium" | "low" | "informational" | "unknown";
  status: "open" | "acknowledged" | "mitigated" | "accepted" | "closed";
  summary: string;
  evidenceRefs: string[];
  gapIds: string[];
  observedAt: string;
  recommendedHumanReview: true;
  isIncident: false;
  certificationClaimed: false;
};

export type ComplianceRequirementStatus = {
  requirementId: string;
  frameworkId: ComplianceFrameworkId;
  status: ComplianceSupportStatus;
  freshness: "current" | "stale" | "missing" | "unknown";
  controlIds: string[];
  limitations?: string;
};

export type ComplianceSnapshot = {
  snapshotId: string;
  capturedAt: string;
  scope: string;
  frameworks: Array<{
    frameworkId: ComplianceFrameworkId;
    versionLabel: string;
    overallStatus: ComplianceSupportStatus;
    requirementStatuses: ComplianceRequirementStatus[];
  }>;
  isolationDimensionPreserved: true;
  aiDataDimensionPreserved: true;
  secureComputeDimensionPreserved: true;
  universalScorePresent: false;
  certificationClaimed: false;
  iso27001CertifiedClaimed: false;
  soc2CompliantClaimed: false;
  essentialEightPassedClaimed: false;
  nistCompliantClaimed: false;
  automaticRemediationEnabled: false;
};

export const COMPLIANCE_FRAMEWORK_IDS: ComplianceFrameworkId[] = [
  "ISO27001_2022",
  "NIST_CSF_2_0",
  "ESSENTIAL_EIGHT",
  "SOC2_TSC",
];

export const COMPLIANCE_INTELLIGENCE_CONTRACT_NAMES = [
  "ComplianceFramework",
  "ComplianceFrameworkVersion",
  "ComplianceRequirement",
  "ComplianceControlMapping",
  "ComplianceEvidenceMapping",
  "ComplianceAssessment",
  "ComplianceGap",
  "ComplianceFinding",
  "ComplianceSnapshot",
  "ExternalAssuranceRequirement",
] as const;

export const COMPLIANCE_INTELLIGENCE_SEMANTICS = {
  unknownNeverSilentSupported: true,
  soleControlNeverInfersCompliance: true,
  internalEvidenceCannotSatisfyExternalOnly: true,
  staleEvidenceAffectsAssessment: true,
  gapNeqIncident: true,
  noAutomaticCertification: true,
  noAutomaticComplianceClaim: true,
  noAutomaticRemediation: true,
  noDuplicateControlRegistry: true,
  mappingNeqCertification: true,
} as const;
