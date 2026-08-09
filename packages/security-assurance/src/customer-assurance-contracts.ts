/**
 * Phase 15G Customer Assurance public contracts — 0.7.0-customer-assurance.
 * Not frozen 1.0.0. Approved customer-safe disclosure only — not certification or Trust Center.
 */

export type AssuranceDisclosureLevel =
  | "public"
  | "customer_safe"
  | "approved_reviewer"
  | "restricted_internal"
  | "never_disclose";

export type AssuranceClaimStatus =
  | "supported"
  | "partially_supported"
  | "unsupported"
  | "unknown"
  | "not_applicable"
  | "not_disclosed"
  | "requires_external_assurance"
  | "stale"
  | "requires_review";

export type CustomerAssuranceAudience =
  | "public"
  | "authenticated_customer"
  | "approved_prospect"
  | "tenant_administrator"
  | "auditor_reviewer"
  | "internal_only";

export type CustomerAssuranceProfile = {
  profileId: string;
  version: string;
  scope: "platform" | "product" | "tenant" | "prospect";
  tenantId?: string;
  categories: string[];
  approvedClaimIds: string[];
  approvedDocumentIds: string[];
  disclosureLevel: AssuranceDisclosureLevel;
  reviewStatus: "draft" | "pending_review" | "approved" | "superseded" | "revoked";
  effectiveAt: string;
  expiresAt?: string;
  limitations: string[];
  /** customer assurance ≠ certification */
  certificationClaimed: false;
};

export type AssuranceDisclosurePolicy = {
  policyId: string;
  version: string;
  audience: CustomerAssuranceAudience;
  allowedLevels: AssuranceDisclosureLevel[];
  usesPlatformPolicyEngine: true;
  failClosedOnUnknownClassification: true;
  automaticExternalDisclosureEnabled: false;
};

export type AssuranceClaimReference = {
  claimId: string;
  version: string;
  claimType: string;
  statementKey: string;
  statement: string;
  scope: string;
  controlRefs: string[];
  assessmentRefs: string[];
  evidenceRefs: string[];
  externalAssuranceRefs: string[];
  effectiveAt: string;
  expiresAt?: string;
  reviewStatus: "draft" | "pending_review" | "approved" | "superseded" | "revoked";
  disclosureLevel: AssuranceDisclosureLevel;
  status: AssuranceClaimStatus;
  limitations: string[];
  /** No free-form unsupported claim generation */
  requiresAuthoritativeSupport: true;
  certificationWordingForbidden: true;
};

export type AssuranceDocumentReference = {
  documentId: string;
  title: string;
  version: string;
  platformFileRef: string;
  classification: "INTERNAL" | "CLIENT_CONFIDENTIAL" | "RESTRICTED" | "PUBLIC";
  disclosureLevel: AssuranceDisclosureLevel;
  effectiveAt: string;
  expiresAt?: string;
  owner: string;
  approvalStatus: "draft" | "pending_review" | "approved" | "superseded" | "revoked";
  usesPlatformFiles: true;
};

export type CustomerAssurancePackage = {
  packageId: string;
  version: string;
  scope: "platform" | "tenant" | "prospect";
  tenantId?: string;
  profileId: string;
  claimIds: string[];
  documentIds: string[];
  externalAssuranceRefs: string[];
  frameworkSummaryRefs: string[];
  disclosureLevel: AssuranceDisclosureLevel;
  reviewStatus: "draft" | "pending_review" | "published" | "superseded" | "revoked";
  publishedAt?: string;
  effectiveAt: string;
  expiresAt?: string;
  immutableOncePublished: true;
  certificationClaimed: false;
};

export type CustomerSecurityQuestionnaireResponseReference = {
  responseId: string;
  questionId: string;
  canonicalTopic: string;
  approvedClaimRefs: string[];
  approvedDocumentRefs: string[];
  responseStatus: AssuranceClaimStatus;
  lastReviewed: string;
  reviewer: string;
  limitations: string[];
  /** AI must not invent responses */
  inventedResponseForbidden: true;
};

export type AssuranceDisclosureRecord = {
  disclosureId: string;
  actorId: string;
  audience: CustomerAssuranceAudience;
  tenantId?: string;
  claimOrPackageRef: string;
  version: string;
  policyDecisionRef: string;
  disclosedAt: string;
  result: "allowed" | "denied" | "redacted";
  containsSensitivePayload: false;
};

export type SubprocessorAssuranceReference = {
  subprocessorId: string;
  provider: string;
  purpose: string;
  dataCategories: string[];
  regionVerified?: string;
  contractPolicyRef?: string;
  aiProviderFlag: boolean;
  status: "active" | "pending_review" | "retired";
  reviewedAt: string;
};

export type CustomerAssuranceProjection = {
  projectionId: string;
  profileId: string;
  claims: AssuranceClaimReference[];
  documents: AssuranceDocumentReference[];
  packages: CustomerAssurancePackage[];
  frameworkSummaries: Array<{
    frameworkId: string;
    customerSafeSummary: string;
    status: AssuranceClaimStatus;
  }>;
  tier1Requirements: {
    s07ExternalPenTest: "REQUIRED_BEFORE_TIER1_PRODUCTION";
    s07Complete: false;
    s08CustomerSso: "REQUIRED_BEFORE_TIER1_PRODUCTION";
    s08ProductionReady: false;
  };
  universalScorePresent: false;
  certificationClaimed: false;
  internalFindingsExposed: false;
};

export const CUSTOMER_ASSURANCE_CONTRACT_NAMES = [
  "CustomerAssuranceProfile",
  "AssuranceDisclosurePolicy",
  "AssuranceClaimReference",
  "AssuranceDocumentReference",
  "CustomerAssurancePackage",
  "CustomerSecurityQuestionnaireResponseReference",
  "AssuranceDisclosureRecord",
] as const;

export const CUSTOMER_ASSURANCE_SEMANTICS = {
  customerAssuranceNeqCertification: true,
  securityEvidenceNeqPublicDisclosurePermission: true,
  internalFindingNeqCustomerFacingFinding: true,
  frameworkMappingNeqComplianceClaim: true,
  externalAssuranceNeqRtbGenerated: true,
  penTestPlannedNeqCompleted: true,
  ssoArchitecturalNeqProductionReady: true,
  backupTestedNeqContractualSla: true,
  postureNeqGuarantee: true,
  absenceOfDisclosedVulnNeqAbsenceOfVuln: true,
  unknownClassificationFailClosed: true,
  noFabricatedPositiveAssurance: true,
  noAutomaticExternalPublication: true,
  noFullPublicTrustCenter: true,
} as const;

/** Fail closed when disclosure classification is unknown/missing. */
export function normalizeDisclosureLevel(
  value: AssuranceDisclosureLevel | null | undefined,
): AssuranceDisclosureLevel {
  if (
    value === "public" ||
    value === "customer_safe" ||
    value === "approved_reviewer" ||
    value === "restricted_internal" ||
    value === "never_disclose"
  ) {
    return value;
  }
  return "never_disclose";
}

export function isCustomerDisclosable(
  level: AssuranceDisclosureLevel,
  audience: CustomerAssuranceAudience,
): boolean {
  const normalized = normalizeDisclosureLevel(level);
  if (normalized === "never_disclose") return false;
  if (audience === "internal_only") return true;
  if (audience === "public") return normalized === "public";
  if (audience === "authenticated_customer" || audience === "tenant_administrator") {
    return normalized === "public" || normalized === "customer_safe";
  }
  if (audience === "approved_prospect" || audience === "auditor_reviewer") {
    return (
      normalized === "public" ||
      normalized === "customer_safe" ||
      normalized === "approved_reviewer"
    );
  }
  return false;
}
