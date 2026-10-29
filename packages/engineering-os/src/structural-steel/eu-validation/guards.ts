import type { EuMethodEngineeringConfirmation, EuProductClaimLevel } from "@rtb/types";
import {
  AI_ENGINEERING_APPROVAL,
  AI_EUROCODE_CAPACITY_PROMOTION_AUTHORITY,
  AI_SERVICEABILITY_CRITERION_AUTHORITY,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  BENCHMARK_EQUALS_EUROCODE_CONFORMANCE,
  EU_STEEL_PACK_CERTIFIED,
  EU_STEEL_PRODUCT_CLAIM_LEVEL,
  EU_STEEL_RELEASE_CLASSIFICATION,
  EU_THIRD_PARTY_VALIDATION_AVAILABLE,
  GENERAL_EU_MEMBER_CODE_DESIGN_VALIDATED,
  LLM_EU_TENSION_CAPACITY_AUTHORITY,
  NUMERICAL_VALIDATION_EQUALS_PROJECT_APPROVAL,
  PACK_CERTIFICATION_NOT_OVERSTATED,
  SOFTWARE_CERTIFICATION_EQUALS_PROJECT_APPROVAL,
  STANDARD_CONFORMANCE_EQUALS_PROJECT_APPROVAL,
} from "@rtb/types";

export const EU_STEEL_RESULT_WARNINGS = [
  "mechanics reference only",
  "Eurocode resistance not validated",
  "interaction method unavailable",
  "standard edition unconfirmed",
  "National Annex/NDP required",
  "engineering review required",
  "not approved for construction",
] as const;

export function warningsForEuSteelResult(input: { interactionRequired: boolean; annexOrNdpRequired: boolean }): readonly string[] {
  const notices = [
    "mechanics reference only",
    "Eurocode resistance not validated",
    "standard edition unconfirmed",
    "engineering review required",
    "not approved for construction",
  ];
  if (input.interactionRequired) notices.splice(2, 0, "interaction method unavailable");
  if (input.annexOrNdpRequired) notices.splice(input.interactionRequired ? 3 : 2, 0, "National Annex/NDP required");
  return notices;
}

export function applyEuMethodEngineeringConfirmation(confirmation: EuMethodEngineeringConfirmation): EuMethodEngineeringConfirmation {
  if (!confirmation.methodRef?.trim() || !confirmation.reviewedAt?.trim() || !confirmation.reviewerAuthorityRef?.trim()) {
    throw new Error("steel design fail closed: method confirmation requires method, timestamp, and authority reference");
  }
  if (confirmation.projectApprovalImplied || confirmation.professionalCertificationImplied || confirmation.softwareCertificationImplied) {
    throw new Error("method confirmation must not imply project, professional, or software approval");
  }
  return confirmation;
}

export function deriveEuSteelProductClaim(requested?: EuProductClaimLevel): EuProductClaimLevel {
  const allowed: EuProductClaimLevel[] = ["REFERENCE_CAPABILITY", "BENCHMARKED_ENGINEERING_REFERENCE_CAPABILITY"];
  const claim = requested ?? EU_STEEL_PRODUCT_CLAIM_LEVEL;
  if (!allowed.includes(claim)) {
    throw new Error("steel design fail closed: product claim exceeds evidence");
  }
  return claim;
}

export function deriveEuSteelReleaseClassification(requested?: typeof EU_STEEL_RELEASE_CLASSIFICATION | "CONTROLLED_ENGINEERING_PREVIEW" | "CONTROLLED_PILOT" | "GENERAL_AVAILABILITY" | "CERTIFIED_ENGINEERING_USE"): typeof EU_STEEL_RELEASE_CLASSIFICATION {
  const claim = requested ?? EU_STEEL_RELEASE_CLASSIFICATION;
  if (claim !== "INTERNAL_ENGINEERING_REFERENCE") {
    throw new Error("steel design fail closed: release classification exceeds evidence");
  }
  return claim;
}

export function assertEurocodeConformanceNotValidatedWithoutEvidence(evidencePresent: boolean): void {
  if (BENCHMARK_EQUALS_EUROCODE_CONFORMANCE) throw new Error("benchmark must not equal Eurocode conformance");
  if (evidencePresent) throw new Error("steel design fail closed: Eurocode conformance evidence must not be fabricated");
}

export function assertEuPackCertificationNotOverstated(): void {
  if (EU_STEEL_PACK_CERTIFIED || !PACK_CERTIFICATION_NOT_OVERSTATED) {
    throw new Error("steel design fail closed: EU_STEEL_PACK_CERTIFIED cannot become YES with unresolved required scope");
  }
  if (GENERAL_EU_MEMBER_CODE_DESIGN_VALIDATED) {
    throw new Error("steel design fail closed: general EU member code design is not validated");
  }
}

export function assertAiCannotPromoteEuMethodMaturity(proposedBy: "AI" | "OPTIMIZER" | "HUMAN", fromState: string, toState: string): void {
  if (LLM_EU_TENSION_CAPACITY_AUTHORITY || AI_EUROCODE_CAPACITY_PROMOTION_AUTHORITY) {
    throw new Error("AI cannot promote method maturity");
  }
  if ((proposedBy === "AI" || proposedBy === "OPTIMIZER") && fromState !== toState) {
    throw new Error("AI cannot promote method maturity");
  }
}

export function assertAiCannotCertifyEuConformance(proposedBy: "AI" | "OPTIMIZER" | "HUMAN"): void {
  if (AI_STANDARD_CONFORMANCE_AUTHORITY || proposedBy === "AI" || proposedBy === "OPTIMIZER") {
    throw new Error("AI cannot certify conformance");
  }
}

export function assertAiCannotInventEuServiceabilityCriterion(proposedBy: "AI" | "OPTIMIZER" | "HUMAN"): void {
  if (AI_SERVICEABILITY_CRITERION_AUTHORITY || proposedBy === "AI" || proposedBy === "OPTIMIZER") {
    throw new Error("AI cannot invent a serviceability criterion");
  }
}

export function assertEuApprovalRemainsSeparate(): void {
  if (AI_ENGINEERING_APPROVAL) throw new Error("AI cannot promote result to approval");
  if (NUMERICAL_VALIDATION_EQUALS_PROJECT_APPROVAL || STANDARD_CONFORMANCE_EQUALS_PROJECT_APPROVAL || SOFTWARE_CERTIFICATION_EQUALS_PROJECT_APPROVAL) {
    throw new Error("validation must not equal project approval");
  }
}

export function assertEuThirdPartyEvidenceNotFabricated(): void {
  if (EU_THIRD_PARTY_VALIDATION_AVAILABLE) throw new Error("third-party validation must not be fabricated");
}
