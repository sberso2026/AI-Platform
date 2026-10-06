import type { UsMethodEngineeringConfirmation, UsProductClaimLevel } from "@rtb/types";
import {
  AI_AISC_STRENGTH_PROMOTION_AUTHORITY,
  AI_BUILDING_CODE_COMPLIANCE_AUTHORITY,
  AI_DESIGN_METHOD_AUTHORITY,
  AI_ENGINEERING_APPROVAL,
  AI_SERVICEABILITY_CRITERION_AUTHORITY,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  AISC_CONFORMANCE_EQUALS_PROJECT_APPROVAL,
  BENCHMARK_EQUALS_AISC_CONFORMANCE,
  BUILDING_CODE_COMPLIANCE_EQUALS_PROJECT_APPROVAL,
  GENERAL_US_MEMBER_CODE_DESIGN_VALIDATED,
  NUMERICAL_VALIDATION_EQUALS_PROJECT_APPROVAL,
  PACK_CERTIFICATION_NOT_OVERSTATED,
  SOFTWARE_CERTIFICATION_EQUALS_PROJECT_APPROVAL,
  US_STEEL_PACK_CERTIFIED,
  US_STEEL_PRODUCT_CLAIM_LEVEL,
  US_STEEL_RELEASE_CLASSIFICATION,
  US_THIRD_PARTY_VALIDATION_AVAILABLE,
} from "@rtb/types";

export const US_STEEL_RESULT_WARNINGS = [
  "mechanics reference only",
  "AISC strength not validated",
  "LRFD/ASD method context required",
  "interaction method unavailable",
  "AISC edition unconfirmed",
  "building-code compliance not established",
  "local amendment context incomplete",
  "engineering review required",
  "not approved for construction",
] as const;

export function warningsForUsSteelResult(input: {
  interactionRequired: boolean;
  designMethodMissing: boolean;
  localAmendmentIncomplete: boolean;
}): readonly string[] {
  const notices = [
    "mechanics reference only",
    "AISC strength not validated",
    "AISC edition unconfirmed",
    "building-code compliance not established",
    "engineering review required",
    "not approved for construction",
  ];
  if (input.designMethodMissing) notices.splice(2, 0, "LRFD/ASD method context required");
  if (input.interactionRequired) notices.splice(input.designMethodMissing ? 3 : 2, 0, "interaction method unavailable");
  if (input.localAmendmentIncomplete) notices.push("local amendment context incomplete");
  return notices;
}

export function applyUsMethodEngineeringConfirmation(confirmation: UsMethodEngineeringConfirmation): UsMethodEngineeringConfirmation {
  if (!confirmation.methodRef?.trim() || !confirmation.reviewedAt?.trim() || !confirmation.reviewerAuthorityRef?.trim()) {
    throw new Error("steel design fail closed: method confirmation requires method, timestamp, and authority reference");
  }
  if (confirmation.projectApprovalImplied || confirmation.professionalCertificationImplied || confirmation.softwareCertificationImplied) {
    throw new Error("method confirmation must not imply project, professional, or software approval");
  }
  return confirmation;
}

export function deriveUsSteelProductClaim(requested?: UsProductClaimLevel): UsProductClaimLevel {
  const allowed: UsProductClaimLevel[] = ["REFERENCE_CAPABILITY", "BENCHMARKED_ENGINEERING_REFERENCE_CAPABILITY"];
  const claim = requested ?? US_STEEL_PRODUCT_CLAIM_LEVEL;
  if (!allowed.includes(claim)) {
    throw new Error("steel design fail closed: product claim exceeds evidence");
  }
  return claim;
}

export function deriveUsSteelReleaseClassification(requested?: typeof US_STEEL_RELEASE_CLASSIFICATION | "CONTROLLED_ENGINEERING_PREVIEW" | "CONTROLLED_PILOT" | "GENERAL_AVAILABILITY" | "CERTIFIED_ENGINEERING_USE"): typeof US_STEEL_RELEASE_CLASSIFICATION {
  const claim = requested ?? US_STEEL_RELEASE_CLASSIFICATION;
  if (claim !== "INTERNAL_ENGINEERING_REFERENCE") {
    throw new Error("steel design fail closed: release classification exceeds evidence");
  }
  return claim;
}

export function assertAiscConformanceNotValidatedWithoutEvidence(evidencePresent: boolean): void {
  if (BENCHMARK_EQUALS_AISC_CONFORMANCE) throw new Error("benchmark must not equal AISC conformance");
  if (evidencePresent) throw new Error("steel design fail closed: AISC conformance evidence must not be fabricated");
}

export function assertUsPackCertificationNotOverstated(): void {
  if (US_STEEL_PACK_CERTIFIED || !PACK_CERTIFICATION_NOT_OVERSTATED) {
    throw new Error("steel design fail closed: US_STEEL_PACK_CERTIFIED cannot become YES with unresolved required scope");
  }
  if (GENERAL_US_MEMBER_CODE_DESIGN_VALIDATED) {
    throw new Error("steel design fail closed: general US member code design is not validated");
  }
}

export function assertAiCannotPromoteUsMethodMaturity(proposedBy: "AI" | "OPTIMIZER" | "HUMAN", fromState: string, toState: string): void {
  if (AI_AISC_STRENGTH_PROMOTION_AUTHORITY) {
    throw new Error("AI cannot promote method maturity");
  }
  if ((proposedBy === "AI" || proposedBy === "OPTIMIZER") && fromState !== toState) {
    throw new Error("AI cannot promote method maturity");
  }
}

export function assertAiCannotCertifyUsConformance(proposedBy: "AI" | "OPTIMIZER" | "HUMAN"): void {
  if (AI_STANDARD_CONFORMANCE_AUTHORITY || AI_BUILDING_CODE_COMPLIANCE_AUTHORITY || proposedBy === "AI" || proposedBy === "OPTIMIZER") {
    throw new Error("AI cannot certify conformance");
  }
}

export function assertAiCannotInventUsServiceabilityCriterion(proposedBy: "AI" | "OPTIMIZER" | "HUMAN"): void {
  if (AI_SERVICEABILITY_CRITERION_AUTHORITY || proposedBy === "AI" || proposedBy === "OPTIMIZER") {
    throw new Error("AI cannot invent a serviceability criterion");
  }
}

export function assertAiCannotChooseUsDesignMethod(proposedBy: "AI" | "OPTIMIZER" | "HUMAN"): void {
  if (AI_DESIGN_METHOD_AUTHORITY || proposedBy === "AI" || proposedBy === "OPTIMIZER") {
    throw new Error("AI cannot choose LRFD or ASD");
  }
}

export function assertUsApprovalRemainsSeparate(): void {
  if (AI_ENGINEERING_APPROVAL) throw new Error("AI cannot promote result to approval");
  if (
    NUMERICAL_VALIDATION_EQUALS_PROJECT_APPROVAL
    || AISC_CONFORMANCE_EQUALS_PROJECT_APPROVAL
    || BUILDING_CODE_COMPLIANCE_EQUALS_PROJECT_APPROVAL
    || SOFTWARE_CERTIFICATION_EQUALS_PROJECT_APPROVAL
  ) {
    throw new Error("validation must not equal project approval");
  }
}

export function assertUsThirdPartyEvidenceNotFabricated(): void {
  if (US_THIRD_PARTY_VALIDATION_AVAILABLE) throw new Error("third-party validation must not be fabricated");
}
