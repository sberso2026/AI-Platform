import type { AuMethodEngineeringConfirmation, AuProductClaimLevel, AuReleaseClassification } from "@rtb/types";
import {
  AI_ENGINEERING_APPROVAL,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  AS4100_CONFORMANCE_VALIDATED,
  AU_STEEL_PACK_CERTIFIED,
  AU_STEEL_PRODUCT_CLAIM_LEVEL,
  AU_STEEL_RELEASE_CLASSIFICATION,
  BENCHMARK_EQUALS_STANDARD_CONFORMANCE,
  LLM_STEEL_CAPACITY_AUTHORITY,
  NUMERICAL_VALIDATION_EQUALS_PROJECT_APPROVAL,
  SOFTWARE_CERTIFICATION_EQUALS_PROJECT_APPROVAL,
  STANDARD_CONFORMANCE_EQUALS_PROJECT_APPROVAL,
} from "@rtb/types";

export const AU_STEEL_RESULT_WARNINGS = [
  "engineering review required",
  "AS 4100 conformance not validated",
  "interaction check unavailable when combined actions apply",
  "bounded analysis scope",
  "not approved for construction",
] as const;

export function warningsForAuSteelResult(input: { interactionRequired: boolean }): readonly string[] {
  const notices = [
    "engineering review required",
    "AS 4100 conformance not validated",
    "bounded analysis scope",
    "not approved for construction",
  ];
  if (input.interactionRequired) notices.splice(2, 0, "interaction check unavailable when combined actions apply");
  return notices;
}

export function applyMethodEngineeringConfirmation(confirmation: AuMethodEngineeringConfirmation): AuMethodEngineeringConfirmation {
  if (!confirmation.methodRef?.trim() || !confirmation.reviewedAt?.trim() || !confirmation.reviewerAuthorityRef?.trim()) {
    throw new Error("steel design fail closed: method confirmation requires method, timestamp, and authority reference");
  }
  if (confirmation.projectApprovalImplied || confirmation.professionalCertificationImplied || confirmation.softwareCertificationImplied) {
    throw new Error("method confirmation must not imply project, professional, or software approval");
  }
  return confirmation;
}

export function deriveAuSteelProductClaim(requested?: AuProductClaimLevel): AuProductClaimLevel {
  const allowed: AuProductClaimLevel[] = ["REFERENCE_CAPABILITY", "BENCHMARKED_ENGINEERING_CAPABILITY"];
  const claim = requested ?? AU_STEEL_PRODUCT_CLAIM_LEVEL;
  if (!allowed.includes(claim)) {
    throw new Error("steel design fail closed: product claim exceeds evidence");
  }
  return claim;
}

export function deriveAuSteelReleaseClassification(requested?: AuReleaseClassification): AuReleaseClassification {
  const allowed: AuReleaseClassification[] = ["INTERNAL_ENGINEERING_REFERENCE"];
  const claim = requested ?? AU_STEEL_RELEASE_CLASSIFICATION;
  if (!allowed.includes(claim)) {
    throw new Error("steel design fail closed: release classification exceeds evidence");
  }
  return claim;
}

export function assertAs4100ConformanceNotValidatedWithoutEvidence(evidencePresent: boolean): void {
  if (BENCHMARK_EQUALS_STANDARD_CONFORMANCE) throw new Error("benchmark must not equal standard conformance");
  if (AS4100_CONFORMANCE_VALIDATED && !evidencePresent) {
    throw new Error("steel design fail closed: AS4100_CONFORMANCE_VALIDATED cannot become YES without evidence");
  }
  if (!evidencePresent && AS4100_CONFORMANCE_VALIDATED) {
    throw new Error("steel design fail closed: AS4100_CONFORMANCE_VALIDATED cannot become YES without evidence");
  }
}

export function assertPackCertificationNotOverstated(): void {
  if (AU_STEEL_PACK_CERTIFIED) {
    throw new Error("steel design fail closed: AU_STEEL_PACK_CERTIFIED cannot become YES with unresolved required scope");
  }
}

export function assertAiCannotPromoteMethodMaturity(proposedBy: "AI" | "OPTIMIZER" | "HUMAN", fromState: string, toState: string): void {
  if (LLM_STEEL_CAPACITY_AUTHORITY) throw new Error("AI cannot promote method maturity");
  if ((proposedBy === "AI" || proposedBy === "OPTIMIZER") && fromState !== toState) {
    throw new Error("AI cannot promote method maturity");
  }
}

export function assertAiCannotCertifyConformance(proposedBy: "AI" | "OPTIMIZER" | "HUMAN"): void {
  if (AI_STANDARD_CONFORMANCE_AUTHORITY || proposedBy === "AI" || proposedBy === "OPTIMIZER") {
    throw new Error("AI cannot certify conformance");
  }
}

export function assertApprovalRemainsSeparate(): void {
  if (AI_ENGINEERING_APPROVAL) throw new Error("AI cannot promote result to approval");
  if (NUMERICAL_VALIDATION_EQUALS_PROJECT_APPROVAL || STANDARD_CONFORMANCE_EQUALS_PROJECT_APPROVAL || SOFTWARE_CERTIFICATION_EQUALS_PROJECT_APPROVAL) {
    throw new Error("validation must not equal project approval");
  }
}
