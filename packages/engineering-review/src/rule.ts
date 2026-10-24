import { failClosed } from "./errors";
import { asReviewRuleId, type ReviewRuleId } from "./ids";
import type { ReviewFindingCategory } from "./finding";
import type { MvpReviewType } from "./review-scope";
import type { ReviewDocumentRole } from "./review-package";

export type ReviewRuleExecution = "deterministic" | "ai_assisted";

export type ReviewRuleEvidenceRequirement = {
  minRecords: number;
  sourceTypes: readonly string[];
  attributableSpanRequired: boolean;
};

export type ReviewRule = {
  ruleId: ReviewRuleId;
  version: string;
  reviewType: MvpReviewType;
  applicableInputTypes: readonly ReviewDocumentRole[];
  description: string;
  execution: ReviewRuleExecution;
  evidenceRequirements: ReviewRuleEvidenceRequirement;
  outputCategory: ReviewFindingCategory;
};

export function defineReviewRule(input: {
  ruleId: string;
  version: string;
  reviewType: MvpReviewType;
  applicableInputTypes: readonly ReviewDocumentRole[];
  description: string;
  execution: ReviewRuleExecution;
  evidenceRequirements: ReviewRuleEvidenceRequirement;
  outputCategory: ReviewFindingCategory;
}): ReviewRule {
  if (!input.version.trim()) failClosed("rule_version_required", "Review rules require a version");
  if (!input.description.trim()) failClosed("rule_description_required", "Review rules require a description");
  if (input.evidenceRequirements.minRecords < 0) {
    failClosed("rule_evidence_invalid", "Evidence minRecords cannot be negative");
  }
  return {
    ruleId: asReviewRuleId(input.ruleId),
    version: input.version.trim(),
    reviewType: input.reviewType,
    applicableInputTypes: input.applicableInputTypes,
    description: input.description.trim(),
    execution: input.execution,
    evidenceRequirements: input.evidenceRequirements,
    outputCategory: input.outputCategory,
  };
}

export const ERA1_REVIEW_RULES: readonly ReviewRule[] = [
  defineReviewRule({
    ruleId: "er.cross_document_inconsistency",
    version: "1.0.0",
    reviewType: "cross_document_inconsistency",
    applicableInputTypes: ["specification", "drawing", "calculation", "basis", "other"],
    description: "Detect conflicting structured field values across documents in a package.",
    execution: "deterministic",
    evidenceRequirements: {
      minRecords: 2,
      sourceTypes: ["structured_field"],
      attributableSpanRequired: true,
    },
    outputCategory: "cross_document_inconsistency",
  }),
  defineReviewRule({
    ruleId: "er.missing_information",
    version: "1.0.0",
    reviewType: "missing_information",
    applicableInputTypes: ["specification", "basis", "other"],
    description: "Detect required structured fields absent from the package.",
    execution: "deterministic",
    evidenceRequirements: {
      minRecords: 1,
      sourceTypes: ["structured_field"],
      attributableSpanRequired: false,
    },
    outputCategory: "missing_information",
  }),
  defineReviewRule({
    ruleId: "er.design_basis_consistency",
    version: "1.0.0",
    reviewType: "design_basis_consistency",
    applicableInputTypes: ["basis", "specification", "calculation", "drawing", "other"],
    description: "Detect design-basis facts that conflict with other documents in the package.",
    execution: "deterministic",
    evidenceRequirements: {
      minRecords: 2,
      sourceTypes: ["extracted_text"],
      attributableSpanRequired: true,
    },
    outputCategory: "cross_document_inconsistency",
  }),
  defineReviewRule({
    ruleId: "er.requirement_traceability",
    version: "1.0.0",
    reviewType: "requirement_traceability",
    applicableInputTypes: ["specification", "basis"],
    description: "Detect explicit extracted requirements with no mapped supporting evidence.",
    execution: "deterministic",
    evidenceRequirements: {
      minRecords: 1,
      sourceTypes: ["requirement_statement"],
      attributableSpanRequired: true,
    },
    outputCategory: "requirement_traceability_gap",
  }),
  defineReviewRule({
    ruleId: "er.unsupported_assumption",
    version: "1.0.0",
    reviewType: "unsupported_assumption",
    applicableInputTypes: ["specification", "calculation", "basis", "other"],
    description: "Detect declared assumptions without supporting evidence.",
    execution: "deterministic",
    evidenceRequirements: {
      minRecords: 1,
      sourceTypes: ["declared_assumption"],
      attributableSpanRequired: true,
    },
    outputCategory: "unsupported_assumption",
  }),
  defineReviewRule({
    ruleId: "er.revision_inconsistency",
    version: "1.0.0",
    reviewType: "revision_inconsistency",
    applicableInputTypes: ["specification", "drawing", "calculation", "basis", "other"],
    description: "Detect the same document number included as current at conflicting revisions.",
    execution: "deterministic",
    evidenceRequirements: {
      minRecords: 2,
      sourceTypes: ["document_revision"],
      attributableSpanRequired: false,
    },
    outputCategory: "revision_inconsistency",
  }),
  defineReviewRule({
    ruleId: "er.missing_engineering_evidence",
    version: "1.0.0",
    reviewType: "missing_engineering_evidence",
    applicableInputTypes: ["specification", "drawing", "calculation", "basis", "other"],
    description: "Detect expected evidence keys that are absent from extracted package fields.",
    execution: "deterministic",
    evidenceRequirements: {
      minRecords: 1,
      sourceTypes: ["structured_field"],
      attributableSpanRequired: false,
    },
    outputCategory: "missing_engineering_evidence",
  }),
];
